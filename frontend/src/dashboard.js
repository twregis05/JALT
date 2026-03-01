const API_BASE = 'http://localhost:4000/api';

// Global variables to hold our Chart.js instances
let mainChart;
let gdpGauge, inflationGauge, unemploymentGauge;

// --- MASTER INITIALIZATION ---
// We only use ONE window.onload to ensure everything fires in order
window.onload = async () => {
    const token = localStorage.getItem('jalt_token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // 1. Fetch User Identity (Initials, Email, etc.)
    await fetchAndPopulateUserData();

    // 2. Set user status badge
    const statusBadge = document.getElementById('user-display');
    if (statusBadge) {
        statusBadge.innerText = 'Agent: ACTIVE';
        statusBadge.style.color = '#34d399';
    }

    // 3. Initialize Visuals
    initMainChart();
    initGauges();
};

// --- IDENTITY LOGIC ---
async function fetchAndPopulateUserData() {
    try {
        const response = await fetch(`${API_BASE}/auth/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('jalt_token')}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            const user = data.user;

            // Target the avatar circle element
            const avatarCircle = document.getElementById('nav-avatar-initials');
            
            if (user.profilePicture) {
                avatarCircle.textContent = ''; 
                avatarCircle.style.backgroundImage = `url(${user.profilePicture})`;
                avatarCircle.style.backgroundSize = 'cover';
                avatarCircle.style.backgroundPosition = 'center';
            } else {
                // Calculate Initials
                const nameParts = user.name.trim().split(' ');
                let initials = "";
                
                if (nameParts.length >= 2) {
                    initials = (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
                } else {
                    initials = nameParts[0].substring(0, 2).toUpperCase();
                }
                
                // Overwrite the hardcoded TR with actual initials
                avatarCircle.textContent = initials;
            }

            // Update the dropdown email
            const emailDisplay = document.getElementById('dropdown-email');
            if (emailDisplay) emailDisplay.textContent = user.email;
        }
    } catch (err) {
        console.error("Identity sync failure:", err);
    }
}

// --- USER MENU & AUTH ---
function toggleUserMenu() {
    const dropdown = document.getElementById('user-dropdown');
    if (dropdown) {
        // Toggle between none and flex (flex ensures vertical alignment)
        dropdown.style.display = dropdown.style.display === 'flex' ? 'none' : 'flex';
    }
}

// Close dropdown if clicking outside
document.addEventListener('click', (e) => {
    const btn = document.getElementById('avatarBtn');
    const dropdown = document.getElementById('user-dropdown');
    if (btn && dropdown && !btn.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.style.display = 'none';
    }
});

function logout() {
    localStorage.removeItem('jalt_token');
    window.location.href = 'login.html';
}

// --- SIMULATION & CHARTS ---
// (The rest of your runSimulation, initMainChart, and gauge functions stay exactly as you had them)

function initMainChart() {
    const ctx = document.getElementById('forecastChart').getContext('2d');
    let gradient = ctx.createLinearGradient(0, 0, 0, 350);
    gradient.addColorStop(0, 'rgba(56, 189, 248, 0.4)'); 
    gradient.addColorStop(1, 'rgba(56, 189, 248, 0.0)');

    mainChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
            datasets: [{
                label: 'GDP Vector',
                data: [0, 0, 0, 0, 0],
                borderColor: '#38bdf8',
                backgroundColor: gradient,
                borderWidth: 3,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#38bdf8',
                pointRadius: 4,
                fill: true,
                tension: 0.3 
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } }, 
            scales: {
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b' } },
                x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b' } }
            }
        }
    });
}

function initGauges() {
    const gaugeConfig = {
        responsive: true, maintainAspectRatio: false,
        circumference: 180, rotation: 270, cutout: '75%',
        plugins: { tooltip: { enabled: false }, legend: { display: false } }
    };

    gdpGauge = new Chart(document.getElementById('gdpGauge').getContext('2d'), {
        type: 'doughnut', data: { datasets: [{ data: [0, 100], backgroundColor: ['#34d399', 'rgba(255,255,255,0.05)'], borderWidth: 0 }] }, options: gaugeConfig
    });
    inflationGauge = new Chart(document.getElementById('inflationGauge').getContext('2d'), {
        type: 'doughnut', data: { datasets: [{ data: [0, 100], backgroundColor: ['#f87171', 'rgba(255,255,255,0.05)'], borderWidth: 0 }] }, options: gaugeConfig
    });
    unemploymentGauge = new Chart(document.getElementById('unemploymentGauge').getContext('2d'), {
        type: 'doughnut', data: { datasets: [{ data: [0, 100], backgroundColor: ['#38bdf8', 'rgba(255,255,255,0.05)'], borderWidth: 0 }] }, options: gaugeConfig
    });
}

// ... include your slider listeners and runSimulation code here ...