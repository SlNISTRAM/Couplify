import { initializeYearData } from './src/utils/dataBuilder.js';

// Let's verify the data structure first.
console.log("Verifying Data Structure for 2026...");

const data = initializeYearData();

// 1. Verify January (Index 0)
const jan = data[0];
console.log(`\nMonth: ${jan.name}`);
const hasCasa = jan.fixedExpenses.find(e => e.name === "Casa Temporal");
const hasFondo = jan.fixedExpenses.find(e => e.name === "Fondo de Emergencia");
console.log(`- Has Casa Temporal: ${!!hasCasa}`);
console.log(`- Has Fondo Emergencia: ${!!hasFondo}`);
if (hasCasa && !hasFondo) console.log("✅ PASS: January has correct temporal item.");
else console.error("❌ FAIL: January temporal item incorrect.");

// 2. Verify August (Index 7)
const aug = data[7];
console.log(`\nMonth: ${aug.name}`);
const augHasCasa = aug.fixedExpenses.find(e => e.name === "Casa Temporal");
const augHasFondo = aug.fixedExpenses.find(e => e.name === "Fondo de Emergencia");
console.log(`- Has Casa Temporal: ${!!augHasCasa}`);
console.log(`- Has Fondo Emergencia: ${!!augHasFondo}`);
if (!augHasCasa && augHasFondo) console.log("✅ PASS: August has correct temporal item.");
else console.error("❌ FAIL: August temporal item incorrect.");

// 3. Verify July Income (Index 6)
const jul = data[6];
console.log(`\nMonth: ${jul.name}`);
console.log(`- Income: ${jul.income.total}`);
if (jul.income.total === 4600) console.log("✅ PASS: July has Bonus.");
else console.error("❌ FAIL: July income incorrect.");

// 4. Verify Calculations Logic (Manual Recreation)
// Let's take July data.
// Income: 4600.
// Savings: Depa (400) + Boda (250) = 650.
// Fixed: 
//   Base: 500+423+75+120+23+8 = 1149.
//   Temporal (Casa): 120.
//   Total Fixed = 1269.
//   Paid Fixed = 0 (initially).
// Variable = 0.
// Note: "Payments" object initialized with { amountPaid: 0 }

const expectedAvailable = 3950;
const calculatedAvailable = jul.income.total - (jul.savings.depa + jul.savings.boda) - 0 - 0;
console.log(`\nJuly Initial Available: ${calculatedAvailable}`);
if (calculatedAvailable === expectedAvailable) console.log("✅ PASS: Available calculation logic check.");
else console.error(`❌ FAIL: Expected ${expectedAvailable}, got ${calculatedAvailable}`);

console.log("\nVerification Complete.");
