import { initializeYearData } from './src/utils/dataBuilder.js';

console.log("Verifying Savings Logic (Mar 2026 Start)...");

const data = initializeYearData();

// 1. Verify Jan/Feb 2026 Boda is 0
const jan26 = data.find(m => m.year === 2026 && m.monthIndex === 0);
const feb26 = data.find(m => m.year === 2026 && m.monthIndex === 1);
const mar26 = data.find(m => m.year === 2026 && m.monthIndex === 2);

if (jan26.savings.boda === 0) console.log("✅ PASS: Jan 2026 Boda is 0.");
else console.error(`❌ FAIL: Jan 2026 Boda is ${jan26.savings.boda}`);

if (feb26.savings.boda === 0) console.log("✅ PASS: Feb 2026 Boda is 0.");
else console.error(`❌ FAIL: Feb 2026 Boda is ${feb26.savings.boda}`);

// 2. Verify Mar 2026 Boda is 200
if (mar26.savings.boda === 200) console.log("✅ PASS: Mar 2026 Boda is 200.");
else console.error(`❌ FAIL: Mar 2026 Boda is ${mar26.savings.boda}`);

// 3. Verify Future Year (2027) Boda is 200
const jan27 = data.find(m => m.year === 2027 && m.monthIndex === 0);
if (jan27.savings.boda === 200) console.log("✅ PASS: Jan 2027 Boda is 200.");
else console.error(`❌ FAIL: Jan 2027 Boda is ${jan27.savings.boda}`);

console.log("\nVerification Complete.");
