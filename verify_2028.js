import { initializeYearData } from './src/utils/dataBuilder.js';

console.log("Verifying 2028 Extension Data Logic...");

const data = initializeYearData();

// 1. Verify Length
if (data.length === 27) console.log("✅ PASS: Data length is 27 months.");
else console.error(`❌ FAIL: Expected 27 months, got ${data.length}`);

// 2. Verify Years
const years = [...new Set(data.map(m => m.year))];
if (JSON.stringify(years) === JSON.stringify([2026, 2027, 2028])) console.log("✅ PASS: Years 2026, 2027, 2028 present.");
else console.error(`❌ FAIL: Years mismatch: ${years}`);

// 3. Verify Casa Temporal (Only Jan-Jul 2026)
const jan2026 = data.find(m => m.year === 2026 && m.monthIndex === 0);
const aug2026 = data.find(m => m.year === 2026 && m.monthIndex === 7);
const jan2027 = data.find(m => m.year === 2027 && m.monthIndex === 0);

const hasCasaJan26 = jan2026.fixedExpenses.find(e => e.id === 'temporal_casa');
const hasCasaAug26 = aug2026.fixedExpenses.find(e => e.id === 'temporal_casa');
const hasCasaJan27 = jan2027.fixedExpenses.find(e => e.id === 'temporal_casa');

if (hasCasaJan26) console.log("✅ PASS: Jan 2026 has Casa Temporal.");
else console.error("❌ FAIL: Jan 2026 missing Casa Temporal.");

if (!hasCasaAug26) console.log("✅ PASS: Aug 2026 does NOT have Casa Temporal.");
else console.error("❌ FAIL: Aug 2026 has Casa Temporal incorrectly.");

if (!hasCasaJan27) console.log("✅ PASS: Jan 2027 does NOT have Casa Temporal.");
else console.error("❌ FAIL: Jan 2027 has Casa Temporal incorrectly.");

// 4. Verify No Fondo Emergencia (Per user request: 'no lo quiero')
const allFondo = data.flatMap(m => m.fixedExpenses).find(e => e.name === "Fondo de Emergencia");
if (!allFondo) console.log("✅ PASS: No 'Fondo de Emergencia' found in any month.");
else console.error("❌ FAIL: Found 'Fondo de Emergencia'.");

console.log("\nVerification Complete.");
