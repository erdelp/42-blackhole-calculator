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

// Add milestone descriptions without redeclaring milestoneData
// const milestoneDescriptions = [
//     "Initial projects and fundamentals (Shell, C basics)",
//     "Core C programming projects",
//     "Advanced C projects and intro to algorithms",
//     "Graphics, algorithms, and advanced concepts",
//     "Group projects and specialization begins",
//     "Advanced specialization projects",
//     "Final projects and internship preparation"
// ];

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
            ${isOverdue ? 'OVERDUE by ' + Math.abs(daysRemaining) + ' days' : daysRemaining + ' days'}
        </span>
    </p>
    <p><strong>Blackhole Date :</strong>
        <span class="${isOverdue || isInDanger ? 'danger' : 'safe'}">
            ${deadlineDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
        </span>
    </p>`;

    // Add milestone information if available
    // if (!isNaN(milestone)) {
    //     resultHTML += `
    //     <p class="milestone-info">
    //         <strong>Milestone ${milestone}:</strong> ${milestoneDescriptions[milestone]}
    //     </p>`;
    // }

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
    // No default values - user must make selections

    document.getElementById('startDateSelect').addEventListener('change', calculateBlackhole);
    document.getElementById('milestone').addEventListener('input', calculateBlackhole);
    document.getElementById('freezeDays').addEventListener('input', calculateBlackhole);

    // Still trigger calculation in case form has values
    calculateBlackhole();
});