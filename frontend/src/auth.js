const API_BASE = 'http://localhost:4000/api';

// Redirect to dashboard immediately if they already have an active session
window.onload = () => {
    if (localStorage.getItem('jalt_token')) {
        window.location.href = 'dashboard.html';
    }
};

// --- LOGIN LOGIC ---
async function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('login-error'); // Ensure this ID exists in HTML

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Store the token for later authenticated requests
            localStorage.setItem('jalt_token', data.token);
            
            // Redirect based on whether they finished calibration
            if (data.user.onboardingComplete) {
                window.location.href = 'dashboard.html';
            } else {
                window.location.href = 'onboarding.html';
            }
        } else {
            // Server returned an error (e.g., 401 Unauthorized)
            errorDiv.innerText = `[ ERROR ] : ${data.message}`;
            errorDiv.style.display = 'block';
        }
    } catch (err) {
        // This block runs if the FETCH fails (Server is down)
        console.error("Connection Refused:", err);
        errorDiv.innerText = "[ ERROR ] : Backend offline. Cannot connect to Node.js.";
        errorDiv.style.display = 'block';
    }
}
// --- REGISTRATION LOGIC ---
async function handleSignup() {
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    
    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        
        const data = await response.json();
        if (response.ok) {
            // Save token to authenticate the user
            localStorage.setItem('jalt_token', data.token);
            
            // 🔥 REDIRECT to the dedicated System Calibration page
            window.location.href = 'onboarding.html'; 
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
    if (errDiv) {
        errDiv.innerText = `[ ERROR ] : ${msg}`;
        errDiv.style.display = 'block';
        // Shake animation for extra flair
        errDiv.animate([ 
            { transform: 'translateX(-5px)' }, 
            { transform: 'translateX(5px)' }, 
            { transform: 'translateX(0)' } 
        ], { duration: 300 });
    } else {
        alert(`[ ERROR ] : ${msg}`);
    }
}