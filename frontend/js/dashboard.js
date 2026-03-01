const API_BASE = 'http://localhost:4000/api';

// Global variables to hold our Chart.js instances so we can update them later
let mainChart;
let gdpGauge, inflationGauge, unemploymentGauge;

// --- INITIALIZATION ---
window.onload = () => {
    // 1. Security Check: Are they logged in?
    const token = localStorage.getItem('jalt_token');
    if (!token) {
        window.location.href = 'login.html'; // Kick them out!
        return;
    }

    // 2. Set user badge to active
    document.getElementById('user-display').innerText = 'Agent: ACTIVE';
    document.getElementById('user-display').style.color = '#34d399';

    // 3. Draw the blank charts
    initMainChart();
    initGauges();

    // 4. Load real economic data into the gauges on page load
    loadCurrentEconomicData();
};

function logout() {
    localStorage.removeItem('jalt_token');
    window.location.href = 'login.html';
}

// --- UI INTERACTIONS ---
// Updates the years label as the slider moves
document.getElementById('yearsSlider').addEventListener('input', function() {
    let val = this.value;
    document.getElementById('yearsValDisplay').innerText = val === '1' ? '1 Year' : `${val} Years`;
});


// --- THE ML SIMULATION PIPELINE ---
async function runSimulation() {
    const token = localStorage.getItem('jalt_token');
    const loader = document.getElementById('loading-indicator');
    const btn = document.querySelector('.execute-btn');

    // UI Feedback: Disable button, show loader
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
            // Update chart x-axis labels to match the selected horizon
            mainChart.data.labels = Array.from({ length: years }, (_, i) => `Year ${i + 1}`);

            // Update chart dataset label and legend to match selected series
            const seriesLabel = seriesId === 'UNRATE' ? 'Unemployment Rate (%)' : 'Prime Rate (%)';
            mainChart.data.datasets[0].label = seriesLabel;
            document.getElementById('chartLegendLabel').innerText = seriesLabel;

            updateChart(data);

            // Reflect year 1 prediction in the unemployment gauge when forecasting UNRATE
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
        // Reset UI
        btn.disabled = false;
        loader.style.display = 'none';
    }
}

// --- CHART.JS CONFIGURATION & UPDATES ---

function initMainChart() {
    const ctx = document.getElementById('forecastChart').getContext('2d');
    
    // Neon gradient fill for the line chart
    let gradient = ctx.createLinearGradient(0, 0, 0, 350);
    gradient.addColorStop(0, 'rgba(56, 189, 248, 0.4)'); 
    gradient.addColorStop(1, 'rgba(56, 189, 248, 0.0)');

    mainChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
            datasets: [{
                label: 'Forecast',
                data: [0, 0, 0, 0, 0],
                borderColor: '#38bdf8',
                backgroundColor: gradient,
                borderWidth: 3,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#38bdf8',
                pointRadius: 4,
                fill: true,
                tension: 0.3 // Smooth curves
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } }, // We built a custom HTML legend instead
            scales: {
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b' } },
                x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b' } }
            }
        }
    });
}

function initGauges() {
    // Doughnut charts configured to look like half-circle speedometers
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

function updateChart(newDataArray) {
    // If python sends an array, inject it into the chart and animate
    if (Array.isArray(newDataArray)) {
        mainChart.data.datasets[0].data = newDataArray;
        mainChart.update();
    }
}

async function loadCurrentEconomicData() {
    try {
        const [gdpRes, inflRes, unempRes] = await Promise.all([
            fetch('http://localhost:4000/gdpGrowth'),
            fetch('http://localhost:4000/inflationRate'),
            fetch('http://localhost:4000/unemployementRate')
        ]);
        const gdpData   = await gdpRes.json();
        const inflData  = await inflRes.json();
        const unempData = await unempRes.json();

        const gdpVal   = parseFloat(gdpData.gdpGrowth);
        const inflVal  = parseFloat(inflData.inflationRate);
        const unempVal = parseFloat(unempData.unemploymentRate);

        gdpGauge.data.datasets[0].data = [gdpVal, Math.max(0, 10 - gdpVal)];
        gdpGauge.update();
        inflationGauge.data.datasets[0].data = [inflVal, Math.max(0, 20 - inflVal)];
        inflationGauge.update();
        unemploymentGauge.data.datasets[0].data = [unempVal, Math.max(0, 15 - unempVal)];
        unemploymentGauge.update();

        document.getElementById('gdpMetric').innerText = `+${gdpVal.toFixed(1)}%`;
        document.getElementById('inflationMetric').innerText = `${inflVal.toFixed(1)}%`;
        document.getElementById('unemploymentMetric').innerText = `${unempVal.toFixed(1)}%`;
    } catch (err) {
        console.warn('Could not load live economic data:', err.message);
    }
}

function mockUpdateGauges() {
    // Faking KPI data for visual impact until we update the Python script to return complex JSON
    const fakeGDP = (Math.random() * 5).toFixed(1);
    const fakeInf = (Math.random() * 8).toFixed(1);
    const fakeUnemp = (Math.random() * 10).toFixed(1);

    // Update the visual charts
    gdpGauge.data.datasets[0].data = [fakeGDP, 10 - fakeGDP]; gdpGauge.update();
    inflationGauge.data.datasets[0].data = [fakeInf, 20 - fakeInf]; inflationGauge.update();
    unemploymentGauge.data.datasets[0].data = [fakeUnemp, 15 - fakeUnemp]; unemploymentGauge.update();

    // Update the neon text below them
    document.getElementById('gdpMetric').innerText = `+${fakeGDP}%`;
    document.getElementById('inflationMetric').innerText = `${fakeInf}%`;
    document.getElementById('unemploymentMetric').innerText = `${fakeUnemp}%`;
}
