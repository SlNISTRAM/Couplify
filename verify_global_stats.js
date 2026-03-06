import { initializeYearData } from './src/utils/dataBuilder.js';

// Mock stats calculation logic from useFinance.js
const getGlobalSavingsStats = (data) => {
    const stats = {
        depa: { saved: 0, target: 19200 },
        boda: { saved: 0, target: 9600 }
    };

    data.forEach(m => {
        if (m.savingsPayments) {
            stats.depa.saved += (Number(m.savingsPayments.depa.userPaid) + Number(m.savingsPayments.depa.partnerPaid));
            stats.boda.saved += (Number(m.savingsPayments.boda.userPaid) + Number(m.savingsPayments.boda.partnerPaid));
        }
    });

    return stats;
};

console.log("Verifying Global Savings Stats Calculation...");

let data = initializeYearData();

// Add some realized savings
// March 2026 (Index 2): User 400, Partner 400 for Depa
data[2].savingsPayments.depa.userPaid = 400;
data[2].savingsPayments.depa.partnerPaid = 400;

// April 2026 (Index 3): User 200, Partner 200 for Boda
data[3].savingsPayments.boda.userPaid = 200;
data[3].savingsPayments.boda.partnerPaid = 200;

const stats = getGlobalSavingsStats(data);

// 1. Verify Depa Saved is 800
if (stats.depa.saved === 800) {
    console.log("✅ PASS: Depa total saved is 800.");
} else {
    console.log("❌ FAIL: Depa total saved is " + stats.depa.saved);
}

// 2. Verify Boda Saved is 400
if (stats.boda.saved === 400) {
    console.log("✅ PASS: Boda total saved is 400.");
} else {
    console.log("❌ FAIL: Boda total saved is " + stats.boda.saved);
}

console.log("Verification Complete.");
