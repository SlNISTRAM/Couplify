
/**
 * Este script realiza una petición a Supabase para mantener el proyecto activo
 * y evitar que se pause por inactividad.
 */
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: SUPABASE_URL o SUPABASE_ANON_KEY no están configuradas.');
  process.exit(1);
}

async function keepAlive() {
  console.log(`🚀 Iniciando ping de actividad para: ${supabaseUrl}`);
  
  try {
    // Intentamos leer la raíz de la API REST, que es suficiente para contar como actividad
    const response = await fetch(`${supabaseUrl}/rest/v1/?apikey=${supabaseKey}`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    if (response.ok) {
      console.log('✅ Ping exitoso: El proyecto está activo.');
    } else {
      console.error(`⚠️ El proyecto respondió con status: ${response.status}`);
      const text = await response.text();
      console.error(`Detalle: ${text}`);
    }
  } catch (error) {
    console.error('❌ Error realizando el ping:', error.message);
    process.exit(1);
  }
}

keepAlive();
