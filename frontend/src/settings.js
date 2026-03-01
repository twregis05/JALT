const API_BASE = 'http://localhost:4000/api';
let pendingProfileData = {};
let base64ImageString = "";

// --- INITIALIZATION ---
window.onload = async () => {
    const token = localStorage.getItem('jalt_token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    
    // 1. Generate UI from config.js
    renderDynamicFields();
    
    // 2. Load existing user data
    await fetchAndPopulateSettingsData();
};

// --- DYNAMIC UI GENERATION ---
function renderDynamicFields() {
    const container = document.getElementById('dynamic-profile-fields');
    if (!container) return;
    
    // Generate HTML based on the PROFILE_CONFIG blueprint
    container.innerHTML = PROFILE_CONFIG.map(field => {
        const gridSpan = field.span === 2 ? 'grid-column: span 2;' : '';
        let inputHtml = '';

        if (field.type === 'select') {
            inputHtml = `
                <select id="${field.id}" class="cyber-input">
                    <option value="">Select ${field.label}</option>
                    ${field.options.map(o => `<option value="${o.v}">${o.t}</option>`).join('')}
                </select>`;
        } else if (field.type === 'textarea') {
            inputHtml = `<textarea id="${field.id}" class="cyber-input" rows="2" placeholder="${field.placeholder || ''}"></textarea>`;
        } else {
            inputHtml = `<input type="${field.type}" id="${field.id}" class="cyber-input" placeholder="${field.placeholder || ''}">`;
        }

        return `
            <div class="input-group" style="${gridSpan}">
                <label>${field.label}</label>
                ${inputHtml}
            </div>`;
    }).join('');
}

// --- IDENTITY & DATA FETCHING ---
async function fetchAndPopulateSettingsData() {
    try {
        const response = await fetch(`${API_BASE}/auth/me`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('jalt_token')}` }
        });

        if (response.ok) {
            const data = await response.json();
            const user = data.user;

            const settingsAvatar = document.getElementById('settings-avatar');
            const emailInput = document.getElementById('editEmail');

            if (emailInput) emailInput.value = user.email || '';

            // Handle Profile Picture vs Initials
            if (settingsAvatar) {
                if (user.profilePicture) {
                    settingsAvatar.textContent = '';
                    settingsAvatar.style.backgroundImage = `url(${user.profilePicture})`;
                    settingsAvatar.style.backgroundSize = 'cover';
                } else {
                    const nameParts = user.name.trim().split(' ');
                    const initials = nameParts.length >= 2 
                        ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
                        : nameParts[0].substring(0, 2).toUpperCase();
                    settingsAvatar.textContent = initials;
                    settingsAvatar.style.backgroundImage = 'none';
                }
            }
            
            // Populate optional dynamic fields
            if (user.profile) {
                PROFILE_CONFIG.forEach(field => {
                    const input = document.getElementById(field.id);
                    if (input && user.profile[field.id] !== undefined) {
                        input.value = user.profile[field.id];
                    }
                });
            }
        }
    } catch (err) {
        console.error("Settings sync failure:", err);
    }
}

// --- IMAGE HANDLING ---
function previewImage(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const avatarCircle = document.getElementById('settings-avatar');
        avatarCircle.textContent = '';
        avatarCircle.style.backgroundImage = `url(${e.target.result})`;
        avatarCircle.style.backgroundSize = 'cover';
        // Save to global variable for the update payload
        base64ImageString = e.target.result;
    }
    reader.readAsDataURL(file);
}

// --- SECURE SAVE WORKFLOW ---
function triggerSecurityCheck() {
    // Capture state before opening modal
    pendingProfileData = {
        email: document.getElementById('editEmail').value,
        // Only include profilePicture if a new one was uploaded
        ...(base64ImageString && { profilePicture: base64ImageString }),
        profile: {}
    };

    // Gather dynamic fields
    PROFILE_CONFIG.forEach(field => {
        const inputElement = document.getElementById(field.id);
        if (inputElement) {
            pendingProfileData.profile[field.id] = inputElement.value;
        }
    });

    document.getElementById('security-modal').style.display = 'flex';
}

function closeSecurityCheck() {
    document.getElementById('security-modal').style.display = 'none';
}

async function executeProfileUpdate() {
    const password = document.getElementById('verifyPassword').value;
    const errorDiv = document.getElementById('security-error');
    const authBtn = document.querySelector('#security-modal .btn-primary');
    
    if (!password) {
        errorDiv.innerText = "Encryption key required";
        errorDiv.style.display = 'block';
        return;
    }

    // UI Feedback: Loading state
    authBtn.innerText = "AUTHENTICATING...";
    authBtn.disabled = true;

    try {
        const response = await fetch(`${API_BASE}/auth/secure-update`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('jalt_token')}`
            },
            body: JSON.stringify({ 
                password: password, 
                updates: pendingProfileData 
            })
        });

        if (response.ok) {
            // Success: Return to dashboard
            window.location.href = 'dashboard.html';
        } else {
            const data = await response.json();
            errorDiv.innerText = `AUTH FAILURE: ${data.message}`;
            errorDiv.style.display = 'block';
            authBtn.innerText = "Authenticate";
            authBtn.disabled = false;
        }
    } catch (err) {
        errorDiv.innerText = 'CORE FAILURE: Node connection offline';
        errorDiv.style.display = 'block';
        authBtn.innerText = "Authenticate";
        authBtn.disabled = false;
    }
}