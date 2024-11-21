function validateNumberInput(input) {
    input.value = input.value.replace(/[^0-9]/g, '');
	if (parseInt(input.value) > 180)
			input.value = 180;
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

const WARNING_THRESHOLD = 10;

function calculateBlackhole() {
    const startDate = document.getElementById('startDate').value;
    const milestone = parseInt(document.getElementById('milestone').value);
    const freezeDays = parseInt(document.getElementById('freezeDays').value) || 0;

    if (!startDate || isNaN(milestone) || milestone < 0 || milestone > 6) {
        document.getElementById('results').innerHTML = '';
        return;
    }
    const start = new Date(startDate);
    const today = new Date();
    const targetData = milestoneData.find(m => m.milestone === milestone);

    const deadlineDate = new Date(startDate);
    deadlineDate.setDate(deadlineDate.getDate() + targetData.days + freezeDays);
	deadlineDate.setHours(23, 59, 59, 999);

    const daysRemaining = Math.floor((deadlineDate - today) / (1000 * 60 * 60 * 24));
    const isOverdue = daysRemaining < 0;
    const isInDanger = daysRemaining <= WARNING_THRESHOLD && daysRemaining >= 0;

    const originalDeadline = new Date(startDate);
    originalDeadline.setDate(originalDeadline.getDate() + targetData.days);

    let resultHTML = `
        <p><strong>Days Remaining:</strong>
            <span class="${isOverdue || isInDanger ? 'danger' : 'safe'}">
                ${isOverdue ? `OVERDUE by ${Math.abs(daysRemaining)} days` : `${daysRemaining} days`}
            </span>
        </p>
        <p><strong>Blackhole Date :</strong>
            <span class="${isOverdue || isInDanger ? 'danger' : 'safe'}">
                ${deadlineDate.toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                })}
            </span>
        </p>`;

    const body = document.body;
    body.classList.remove('danger-zone', 'safe-zone');

    if (isOverdue || isInDanger) {
        body.classList.add('danger-zone');
    } else if (daysRemaining > WARNING_THRESHOLD) {
        body.classList.add('safe-zone');
    }

    document.getElementById('results').innerHTML = resultHTML;
}

// Populate reference table
const table = document.getElementById('referenceTable');
milestoneData.forEach(data => {
    const row = table.insertRow();
    row.insertCell(0).textContent = data.milestone;
    row.insertCell(1).textContent = data.days;
});

// Add event listeners
document.getElementById('startDate').addEventListener('change', calculateBlackhole);
document.getElementById('milestone').addEventListener('input', calculateBlackhole);
document.getElementById('freezeDays').addEventListener('input', calculateBlackhole);
