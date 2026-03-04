import { useState, useEffect } from 'react';
import { initializeYearData } from '../utils/dataBuilder.js';
import { supabase } from '../lib/supabase';

const STORAGE_KEY = 'finanzas_2026_data_v3';

export const useData2026 = (userId, isGuest = false) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
            .select('data')
            .eq('user_id', userId)
            .single();

          if (dbError && dbError.code !== 'PGRST116') { // PGRST116 is "not found"
            throw dbError;
          }

          if (dbData) {
            console.log("Data loaded from Supabase");
            setData(dbData.data);
          } else {
            // Migration: Check LocalStorage if no cloud data exists
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

      try {
        if (isGuest) {
          // GUEST MODE: Save to LocalStorage
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } else {
          // USER MODE: Save to Supabase
          const { error: saveError } = await supabase.from('user_finances').upsert({
            user_id: userId,
            data: data,
            updated_at: new Date().toISOString()
          });
          if (saveError) throw saveError;
        }
      } catch (err) {
        console.error("Failed to save data:", err);
      }
    };

    const timeoutId = setTimeout(saveData, 1000); // Small debounce
    return () => clearTimeout(timeoutId);
  }, [data, userId, isGuest, loading]);

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
    // Note: The saveData effect will automatically sync this to Supabase/LocalStorage
  };

  return { data, updateMonthData, updateAllMonthsData, exportData, restoreFinanceData, loading, error };
};
