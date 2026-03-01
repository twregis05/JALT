const API_BASE = '/api';

// Global variables to hold our Chart.js instances
let mainChart;
let gdpGauge, inflationGauge, unemploymentGauge, primeRateGauge;

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

    // 4. Load live FRED economic data into gauges
    loadCurrentEconomicData();
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
    primeRateGauge = new Chart(document.getElementById('primeRateGauge').getContext('2d'), {
        type: 'doughnut', data: { datasets: [{ data: [0, 100], backgroundColor: ['#fbbf24', 'rgba(255,255,255,0.05)'], borderWidth: 0 }] }, options: gaugeConfig
    });
}

// --- SLIDER LISTENER ---
document.getElementById('yearsSlider').addEventListener('input', function() {
    let val = this.value;
    document.getElementById('yearsValDisplay').innerText = val === '1' ? '1 Year' : `${val} Years`;
});

// --- THE ML SIMULATION PIPELINE ---
async function runSimulation() {
    const token = localStorage.getItem('jalt_token');
    const loader = document.getElementById('loading-indicator');
    const btn = document.querySelector('.execute-btn');

    btn.disabled = true;
    loader.style.display = 'block';

    const seriesId = document.getElementById('seriesSelect').value;
    const years = parseInt(document.getElementById('yearsSlider').value);
    const payload = { series_id: seriesId, years: years };

    try {
        const response = await fetch(`${API_BASE}/ml/predict`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
            mainChart.data.labels = Array.from({ length: years }, (_, i) => `Year ${i + 1}`);
            const seriesLabel = seriesId === 'UNRATE' ? 'Unemployment Rate (%)' : 'Prime Rate (%)';
            mainChart.data.datasets[0].label = seriesLabel;
            document.getElementById('chartLegendLabel').innerText = seriesLabel;
            updateChart(data);

            if (seriesId === 'UNRATE' && data.length > 0) {
                const predictedUnemp = data[0];
                unemploymentGauge.data.datasets[0].data = [predictedUnemp, Math.max(0, 15 - predictedUnemp)];
                unemploymentGauge.update();
                document.getElementById('unemploymentMetric').innerText = `${predictedUnemp.toFixed(1)}%`;
            }
        } else {
            alert(`Simulation Error: ${data.message || 'Unknown error'}`);
        }
    } catch (err) {
        console.error(err);
        alert("Failed to connect to backend. Is Python running?");
    } finally {
        btn.disabled = false;
        loader.style.display = 'none';
    }
}

function updateChart(newDataArray) {
    if (Array.isArray(newDataArray)) {
        mainChart.data.datasets[0].data = newDataArray;
        mainChart.update();
    }
}

// --- LIVE FRED DATA ---
async function loadCurrentEconomicData() {
    try {
        const [gdpRes, inflRes, unempRes, primeRes] = await Promise.all([
            fetch('/gdpGrowth'),
            fetch('/inflationRate'),
            fetch('/unemployementRate'),
            fetch('/primeIntrestRate')
        ]);
        const gdpData   = await gdpRes.json();
        const inflData  = await inflRes.json();
        const unempData = await unempRes.json();
        const primeData = await primeRes.json();

        const gdpVal   = parseFloat(gdpData.gdpGrowth);
        const inflVal  = parseFloat(inflData.inflationRate);
        const unempVal = parseFloat(unempData.unemploymentRate);
        const primeVal = parseFloat(primeData.primeInterestRate);

        gdpGauge.data.datasets[0].data = [gdpVal, Math.max(0, 10 - gdpVal)];
        gdpGauge.update();
        inflationGauge.data.datasets[0].data = [inflVal, Math.max(0, 20 - inflVal)];
        inflationGauge.update();
        unemploymentGauge.data.datasets[0].data = [unempVal, Math.max(0, 15 - unempVal)];
        unemploymentGauge.update();
        primeRateGauge.data.datasets[0].data = [primeVal, Math.max(0, 25 - primeVal)];
        primeRateGauge.update();

        document.getElementById('gdpMetric').innerText = `+${gdpVal.toFixed(1)}%`;
        document.getElementById('inflationMetric').innerText = `${inflVal.toFixed(1)}%`;
        document.getElementById('unemploymentMetric').innerText = `${unempVal.toFixed(1)}%`;
        document.getElementById('primeMetric').innerText = `${primeVal.toFixed(1)}%`;
    } catch (err) {
        console.warn('Could not load live economic data:', err.message);
    }
}