const testCases = [
    {
        description: "Scenario 1: Basic calculation, no freeze days",
        inputs: { startDate: "2024-05-29", milestone: 0, freezeDays: 0, todayDate: "2024-06-01" },
        expected: { daysRemaining: 43, blackholeDate: "13/07/2024" }
    },
    {
        description: "Scenario 2: With freeze days",
        inputs: { startDate: "2024-05-29", milestone: 1, freezeDays: 10, todayDate: "2024-07-01" },
        expected: { daysRemaining: 95, blackholeDate: "03/10/2024" }
    },
    {
        description: "Scenario 3: Overdue",
        inputs: { startDate: "2024-11-21", milestone: 0, freezeDays: 0, todayDate: "2025-01-10" },
        expected: { daysRemaining: -5, blackholeDate: "04/01/2025" }
    },
    {
        description: "Scenario 4: On Warning Threshold (30 days remaining)",
        inputs: { startDate: "2025-05-08", milestone: 2, freezeDays: 5, todayDate: "2025-10-08" },
        expected: { daysRemaining: 30, blackholeDate: "06/11/2025" }
    },
    {
        description: "Scenario 5: Blackhole date is today (0 days remaining)",
        inputs: { startDate: "2024-05-29", milestone: 0, freezeDays: 0, todayDate: "2024-07-13" },
        expected: { daysRemaining: 0, blackholeDate: "13/07/2024" }
    }
];

function runTests() {
    const testResultsDiv = document.getElementById('testResults');
    testResultsDiv.innerHTML = ''; // Clear previous results
    let testsPassed = 0;
    let testsFailed = 0;

    // Ensure exposedForTesting is available
    if (!window.exposedForTesting) {
        const resultP = document.createElement('p');
        resultP.textContent = "ERROR: script.js did not expose functions for testing. Is TEST_MODE true?";
        resultP.style.color = 'red';
        testResultsDiv.appendChild(resultP);
        return;
    }
    const calculateBlackholeInternal = window.exposedForTesting.calculateBlackholeInternal;

    // Get DOM elements
    const startDateSelect = document.getElementById('startDateSelect');
    const milestoneSelect = document.getElementById('milestone');
    const freezeDaysInput = document.getElementById('freezeDays');
    const resultsDiv = document.getElementById('results');

    testCases.forEach((testCase, index) => {
        const resultP = document.createElement('p');
        resultP.innerHTML = `<strong>Test ${index + 1}: ${testCase.description}</strong><br>`;

        // Set input values
        // For startDateSelect, we need to ensure the option exists.
        // The populateStartDateDropdown should run on DOMContentLoaded via script.js.
        // We will assume the options corresponding to testCase.inputs.startDate values are present.
        let startOption = Array.from(startDateSelect.options).find(opt => opt.value === testCase.inputs.startDate);
        if (!startOption) {
            // If the specific start date isn't in cursusStartDates, we can't run this test properly.
            // For now, let's try to add it dynamically for the test or skip.
            // A better approach for real testing might be to mock populateStartDateDropdown or ensure test dates are in cursusStartDates.
            // However, the exposed cursusStartDates can be used to populate this if needed.
            // For now, we add it if not present.
            const newOpt = document.createElement('option');
            newOpt.value = testCase.inputs.startDate;
            newOpt.textContent = testCase.inputs.startDate; // Display name might not be accurate but value is key
            startDateSelect.appendChild(newOpt);
        }
        startDateSelect.value = testCase.inputs.startDate;
        milestoneSelect.value = testCase.inputs.milestone.toString();
        freezeDaysInput.value = testCase.inputs.freezeDays.toString();

        // Mock Date
        const originalDate = Date;
        globalThis.Date = class extends originalDate {
            constructor(...args) {
                if (args.length === 0) { // Mocking 'new Date()' for 'today'
                    return new originalDate(testCase.inputs.todayDate + 'T00:00:00Z');
                }
                return new originalDate(...args);
            }
            static now() { // Mocking 'Date.now()'
                return new originalDate(testCase.inputs.todayDate + 'T00:00:00Z').getTime();
            }
            // Keep other static methods like UTC, parse, etc.
            static UTC = originalDate.UTC;
            static parse = originalDate.parse;
        };
        
        // Run the calculation
        calculateBlackholeInternal();

        // Restore Date
        globalThis.Date = originalDate;

        // Get results from DOM
        const daysRemainingElement = resultsDiv.querySelector('p:nth-child(1) span');
        const blackholeDateElement = resultsDiv.querySelector('p:nth-child(2) span');

        let actualDaysRemaining = null;
        let actualBlackholeDate = '';

        if (daysRemainingElement && daysRemainingElement.textContent) {
            const text = daysRemainingElement.textContent.trim();
            if (text.startsWith('OVERDUE by')) {
                actualDaysRemaining = -parseInt(text.replace('OVERDUE by ', '').replace(' days', ''), 10);
            } else {
                actualDaysRemaining = parseInt(text.replace(' days', ''), 10);
            }
        }

        if (blackholeDateElement && blackholeDateElement.textContent) {
            actualBlackholeDate = blackholeDateElement.textContent.trim();
        }
        
        // Compare results
        const daysMatch = actualDaysRemaining === testCase.expected.daysRemaining;
        const dateMatch = actualBlackholeDate === testCase.expected.blackholeDate;

        if (daysMatch && dateMatch) {
            resultP.innerHTML += `<span style="color: green;">PASS</span><br>`;
            testsPassed++;
        } else {
            resultP.innerHTML += `<span style="color: red;">FAIL</span><br>`;
            testsFailed++;
            if (!daysMatch) {
                resultP.innerHTML += `  Expected Days Remaining: ${testCase.expected.daysRemaining}, Actual: ${actualDaysRemaining}<br>`;
            }
            if (!dateMatch) {
                resultP.innerHTML += `  Expected Blackhole Date: ${testCase.expected.blackholeDate}, Actual: ${actualBlackholeDate}<br>`;
            }
        }
        resultP.innerHTML += `  Inputs: ${JSON.stringify(testCase.inputs)}<br><hr>`;
        testResultsDiv.appendChild(resultP);
    });

    const summaryP = document.createElement('p');
    summaryP.innerHTML = `<strong>Test Summary: ${testsPassed} passed, ${testsFailed} failed.</strong>`;
    testResultsDiv.insertBefore(summaryP, testResultsDiv.firstChild);
}
