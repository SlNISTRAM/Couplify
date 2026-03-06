import { useState, useEffect } from 'react';
import { initializeYearData } from '../utils/dataBuilder.js';
import { supabase } from '../lib/supabase';

const STORAGE_KEY = 'finanzas_2026_data_v3';

export const useData2026 = (userId, isGuest = false) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving', 'error'

  // 1. Initial Load & Migration
  useEffect(() => {
    const loadData = async () => {
      // If not guest and no userId, wait.
      if (!isGuest && !userId) return;

      try {
        setLoading(true);
        setError(null);
        
        if (isGuest) {
          // GUEST MODE: Load from LocalStorage
          console.log("Loading data in Guest Mode...");
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            setData(JSON.parse(stored));
          } else {
            console.log("No guest data found, initializing fresh year...");
            const freshData = initializeYearData();
            setData(freshData);
            // Initial save to local storage
            localStorage.setItem(STORAGE_KEY, JSON.stringify(freshData));
          }
        } else {
          // USER MODE: Try fetching from Supabase
          const { data: dbData, error: dbError } = await supabase
            .from('user_finances')
            .select('data, updated_at')
            .eq('user_id', userId)
            .single();

          if (dbError && dbError.code !== 'PGRST116') { // PGRST116 is "not found"
            throw dbError;
          }

          // Conflict Resolution: Compare DB vs Local Cache (for logged-in users)
          const localKey = `${STORAGE_KEY}_${userId}`;
          const localStored = localStorage.getItem(localKey);
          let finalData = null;
          let needsUpdate = false;

          if (dbData && localStored) {
            const localParsed = JSON.parse(localStored);
            // We expect the data to be an array of months. We need a way to track the LOCAL update time.
            // We'll store a separate timestamp in localStorage for the last local change.
            const localTimestamp = localStorage.getItem(`${localKey}_ts`) || 0;
            const dbTimestamp = new Date(dbData.updated_at).getTime();

            if (Number(localTimestamp) > dbTimestamp) {
              console.warn("Conflict detected: Local data is NEWER than Cloud. Favoring Local.");
              finalData = localParsed;
              needsUpdate = true; // We need to push this local data to the cloud ASAP
            } else {
              console.log("Cloud data is newer or equal. Syncing from Cloud.");
              finalData = dbData.data;
            }
          } else if (dbData) {
            finalData = dbData.data;
          }

          if (finalData) {
            setData(finalData);
            // Update local cache
            localStorage.setItem(localKey, JSON.stringify(finalData));
            
            if (needsUpdate) {
              const { error: pushError } = await supabase.from('user_finances').upsert({
                user_id: userId,
                data: finalData,
                updated_at: new Date().toISOString()
              });
              if (pushError) console.error("Initial sync push failed:", pushError);
            }
          } else {
            // Migration: Check old LocalStorage if no cloud data exists
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
              console.log("Migrating data from LocalStorage to Supabase...");
              const parsed = JSON.parse(stored);
              setData(parsed);
              
              const { error: upsertError } = await supabase.from('user_finances').upsert({
                user_id: userId,
                data: parsed,
                updated_at: new Date().toISOString()
              });

              if (upsertError) throw upsertError;
              localStorage.removeItem(STORAGE_KEY);
              localStorage.setItem(localKey, JSON.stringify(parsed));
              localStorage.setItem(`${localKey}_ts`, Date.now().toString());
            } else {
              console.log("No data found, initializing fresh year...");
              const freshData = initializeYearData();
              setData(freshData);
              
              const { error: initError } = await supabase.from('user_finances').upsert({
                user_id: userId,
                data: freshData,
                updated_at: new Date().toISOString()
              });

              if (initError) throw initError;
            }
          }
        }
      } catch (err) {
        console.error("Data load error:", err);
        setError(err.message || "Error al cargar datos");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId, isGuest]);

  // 2. Save on changes
  useEffect(() => {
    const saveData = async () => {
      if (loading || data.length === 0 || error) return;
      
      // Validation: Must have userId OR be in Guest Mode
      if (!isGuest && !userId) return;

      setSaveStatus('saving');

      try {
        if (isGuest) {
          // GUEST MODE: Save to LocalStorage
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          setSaveStatus('saved');
        } else {
          // USER MODE: Save to Supabase + Local Cache
          const localKey = `${STORAGE_KEY}_${userId}`;
          localStorage.setItem(localKey, JSON.stringify(data));
          localStorage.setItem(`${localKey}_ts`, Date.now().toString()); // Track local update time
          
          const { error: saveError } = await supabase.from('user_finances').upsert({
            user_id: userId,
            data: data,
            updated_at: new Date().toISOString()
          });

          if (saveError) {
            setSaveStatus('error');
            throw saveError;
          }
          setSaveStatus('saved');
        }
      } catch (err) {
        console.error("Failed to save data:", err);
        setSaveStatus('error');
      }
    };

    const timeoutId = setTimeout(saveData, 1000); // 1s debounce
    return () => clearTimeout(timeoutId);
  }, [data, userId, isGuest, loading]);

  // 3. Prevent data loss on close
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (saveStatus === 'saving') {
        const message = "Tus cambios se están guardando en la nube. ¿Estás seguro de que quieres salir?";
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveStatus]);

  const updateMonthData = (monthIndex, updater) => {
    setData(prev => {
      const newData = [...prev];
      newData[monthIndex] = updater(newData[monthIndex]);
      return newData;
    });
  };

  const updateAllMonthsData = (updater) => {
    setData(prev => updater(prev));
  };

  const exportData = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `couplify_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const restoreFinanceData = (newData) => {
    if (!Array.isArray(newData)) {
        throw new Error("El formato del backup no es válido (debe ser un array).");
    }
    setData(newData);
  };

  return { data, updateMonthData, updateAllMonthsData, exportData, restoreFinanceData, loading, error, saveStatus };
};
