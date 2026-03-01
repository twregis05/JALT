const API_BASE = 'http://localhost:4000/api';

// Redirect to dashboard immediately if they already have a token
window.onload = () => {
    if (localStorage.getItem('jalt_token')) {
        window.location.href = 'dashboard.html';
    }
};

// --- LOGIN LOGIC ---
async function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('jalt_token', data.token);
            window.location.href = 'dashboard.html'; // Teleport to dashboard
        } else {
            showError(data.message || "Invalid credentials.");
        }
    } catch (err) {
        showError("Backend offline. Cannot connect to Node.js.");
    }
}

// --- REGISTRATION LOGIC ---
async function handleSignup() {
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    
    try {
        const response = await fetch(`${API_BASE}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('jalt_token', data.token);
            window.location.href = 'dashboard.html'; // Teleport to dashboard
        } else {
            showError(data.message || "Registration failed.");
        }
    } catch (err) {
        showError("Backend offline. Cannot connect to Node.js.");
    }
}

// --- UTILITIES ---
function showError(msg) {
    const errDiv = document.getElementById('auth-error');
    errDiv.innerText = `[ ERROR ] : ${msg}`;
    errDiv.style.display = 'block';
    // Shake animation for extra flair
    errDiv.animate([ { transform: 'translateX(-5px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(0)' } ], { duration: 300 });
}