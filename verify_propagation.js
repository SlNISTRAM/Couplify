import { initializeYearData } from './src/utils/dataBuilder.js';

// Mocking useFinance propagation logic
const updateBaseIncome = (data, monthIndex, newAmount) => {
    return data.map((m, idx) => {
        if (idx < monthIndex) return m;
        return {
            ...m,
            income: { ...m.income, base: Number(newAmount) }
        };
    });
};

console.log("Verifying Salary Propagation Logic...");

let data = initializeYearData(); // 27 months total (3 years)

// Change salary in April 2026 (Index 3)
const newSalary = 3000;
data = updateBaseIncome(data, 3, newSalary);

// 1. Verify March 2026 (Index 2) is still 2300
if (data[2].income.base === 2300) {
    console.log("✅ PASS: March 2026 remains 2300.");
} else {
    console.log("❌ FAIL: March 2026 changed to " + data[2].income.base);
}

// 2. Verify April 2026 (Index 3) is 3000
if (data[3].income.base === 3000) {
    console.log("✅ PASS: April 2026 updated to 3000.");
} else {
    console.log("❌ FAIL: April 2026 is " + data[3].income.base);
}

// 3. Verify Dec 2026 (Index 11) is 3000
if (data[11].income.base === 3000) {
    console.log("✅ PASS: Dec 2026 updated to 3000.");
} else {
    console.log("❌ FAIL: Dec 2026 is " + data[11].income.base);
}

// 4. Verify Jan 2027 (Index 12) is 3000
if (data[12].income.base === 3000) {
    console.log("✅ PASS: Jan 2027 updated to 3000.");
} else {
    console.log("❌ FAIL: Jan 2027 is " + data[12].income.base);
}

console.log("Verification Complete.");
