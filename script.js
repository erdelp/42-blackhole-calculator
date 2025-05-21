(function() {
    const cursusStartDates = [
        { value: "2024-05-29", displayName: "May 2024 (29/05/2024)" },
        { value: "2024-11-21", displayName: "November 2024 (21/11/2024)" },
    { value: "2025-05-08", displayName: "April 2025 (08/05/2025)" }
];

function populateStartDateDropdown() {
    const startDateSelect = document.getElementById('startDateSelect');
    cursusStartDates.forEach(dateInfo => {
        const option = document.createElement('option');
        option.value = dateInfo.value;
        option.textContent = dateInfo.displayName;
        startDateSelect.appendChild(option);
    });
}

function validateNumberInput(input) {
    input.value = input.value.replace(/[^0-9]/g, '');
    // Check if input.value is not empty before parsing to prevent NaN
    if (input.value && parseInt(input.value, 10) > 180) {
        input.value = '180';
    }
}

const milestoneData = [
    { milestone: 0, days: 45 },
    { milestone: 1, days: 118 },
    { milestone: 2, days: 178 },
    { milestone: 3, days: 306 },
    { milestone: 4, days: 447 },
    { milestone: 5, days: 644 },
    { milestone: 6, days: 730 }
];

const WARNING_THRESHOLD = 30;

function getSelectedStartDate() {
    return document.getElementById('startDateSelect').value;
}

function calculateBlackhole() {
    const startDate = getSelectedStartDate();
    const milestone = parseInt(document.getElementById('milestone').value);
    const freezeDays = parseInt(document.getElementById('freezeDays').value) || 0;

    if (!startDate || isNaN(milestone) || milestone < 0 || milestone > 6) {
        document.getElementById('results').innerHTML = '';
        return;
    }
    // Adjust Start Date Initialization to UTC
    const start = new Date(startDate + 'T00:00:00Z');

    // Adjust "Today" Date Initialization to UTC
    const today = new Date(); // Keep local today for non-UTC operations if any, or for comparison if needed
    const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

    const targetData = milestoneData.find(m => m.milestone === milestone);

    // Adjust Deadline Date Calculation to UTC
    const deadlineDate = new Date(start.getTime()); // Initialize with start date in UTC
    deadlineDate.setUTCDate(deadlineDate.getUTCDate() + targetData.days + freezeDays);
    deadlineDate.setUTCHours(23, 59, 59, 999); // Set to end of day in UTC

    // Adjust Days Remaining Calculation to use UTC dates
    const daysRemaining = Math.floor((deadlineDate - todayUTC) / (1000 * 60 * 60 * 24));
    const isOverdue = daysRemaining < 0;
    const isInDanger = daysRemaining <= WARNING_THRESHOLD && daysRemaining >= 0;

    // Adjust Original Deadline Calculation to UTC (for consistency, though not directly used in output)
    const originalDeadline = new Date(start.getTime());
    originalDeadline.setUTCDate(originalDeadline.getUTCDate() + targetData.days);
    originalDeadline.setUTCHours(23, 59, 59, 999);


    let resultHTML = `
    <p><strong>Days Remaining:</strong>
        <span class="${isOverdue || isInDanger ? 'danger' : 'safe'}">
            ${isOverdue ? 'OVERDUE by ' + Math.abs(daysRemaining) + ' days' : daysRemaining + ' days'}
        </span>
    </p>
    <p><strong>Blackhole Date :</strong>
        <span class="${isOverdue || isInDanger ? 'danger' : 'safe'}">
            ${deadlineDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
        </span>
    </p>`;

    const body = document.body;
    body.classList.remove('danger-zone', 'safe-zone');

    if (isOverdue || isInDanger) {
        body.classList.add('danger-zone');
    } else if (daysRemaining > WARNING_THRESHOLD) {
        body.classList.add('safe-zone');
    }

    if (startDate && !isNaN(milestone)) {
        resultHTML += `
        <button id="shareButton" class="share-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" class="share-icon">
                <path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.5 2.5 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5z"/>
            </svg>
            Share
        </button>`;

        // Add event listener after setting innerHTML
        setTimeout(() => {
            document.getElementById('shareButton')?.addEventListener('click', () => {
                const shareText = `My 42 blackhole date is ${deadlineDate.toLocaleDateString('fr-FR')}. I have ${isOverdue ? 'MISSED it by ' + Math.abs(daysRemaining) : daysRemaining} days ${isOverdue ? 'ago' : 'remaining'}!`;

                if (navigator.share) {
                    navigator.share({
                        title: '42 Blackhole Calculator',
                        text: shareText,
                        url: window.location.href
                    });
                } else {
                    // Fallback - copy to clipboard
                    navigator.clipboard.writeText(shareText + ' Calculate yours: ' + window.location.href)
                        .then(() => alert('Results copied to clipboard!'));
                }
            });
        }, 0);
    }

    document.getElementById('results').innerHTML = resultHTML;
}

document.addEventListener('DOMContentLoaded', () => {
    populateStartDateDropdown(); // Populate the dropdown on load
    // No default values - user must make selections

    const startDateSelect = document.getElementById('startDateSelect');
    const milestoneSelect = document.getElementById('milestone');
    const freezeDaysInput = document.getElementById('freezeDays');

    startDateSelect.addEventListener('change', calculateBlackhole);
    milestoneSelect.addEventListener('input', calculateBlackhole);
    freezeDaysInput.addEventListener('input', calculateBlackhole);
    
    // Attach validateNumberInput to the freezeDays input element
    freezeDaysInput.addEventListener('input', (event) => validateNumberInput(event.target));

    // Still trigger calculation in case form has values
    calculateBlackhole();

    // Expose for testing
    if (typeof window !== 'undefined' && window.TEST_MODE) {
        window.exposedForTesting = {
            calculateBlackholeInternal: calculateBlackhole,
            milestoneData: milestoneData,
            cursusStartDates: cursusStartDates
        };
    }
})();