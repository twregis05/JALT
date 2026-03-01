const API_BASE = '/api';
const onboardingQuestions = PROFILE_CONFIG; 
let currentStep = 0;
let profileData = {};

window.onload = () => {
    const totalStepsEl = document.getElementById('total-steps');
    if (totalStepsEl) totalStepsEl.innerText = onboardingQuestions.length;
    renderStep();
};

function renderStep() {
    const q = onboardingQuestions[currentStep];
    const container = document.getElementById('onboarding-steps-container');
    
    let inputHtml = q.type === 'select' 
        ? `<select id="step-input" class="cyber-input">${q.options.map(o => `<option value="${o.v}">${o.t}</option>`).join('')}</select>`
        : `<input type="${q.type}" id="step-input" class="cyber-input" placeholder="${q.placeholder || ''}">`;

    container.innerHTML = `
        <div class="step-content">
            <p style="color: #94a3b8; font-size: 0.8rem;">${q.desc}</p>
            <h3 style="color: #38bdf8; font-family: 'JetBrains Mono';">> ${q.label}</h3>
            ${inputHtml}
        </div>`;

    document.getElementById('current-step').innerText = currentStep + 1;
    document.getElementById('onboarding-back').style.display = currentStep === 0 ? 'none' : 'block';
    
    const nextBtn = document.getElementById('onboarding-next');
    nextBtn.innerText = currentStep === onboardingQuestions.length - 1 ? 'FINALIZE' : 'PROCEED';
}

async function handleNext() {
    const inputVal = document.getElementById('step-input').value;
    profileData[onboardingQuestions[currentStep].id] = inputVal;

    if (currentStep < onboardingQuestions.length - 1) {
        currentStep++;
        renderStep();
    } else {
        finalizeCalibration();
    }
}

async function finalizeCalibration() {
    const token = localStorage.getItem('jalt_token');
    try {
        // We use secure-update or a dedicated profile update route
        const response = await fetch(`${API_BASE}/auth/secure-update`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            // Onboarding bypasses password check by just sending profile data
            // Or use a simpler 'update-profile' route if you prefer
            body: JSON.stringify({ 
                updates: { profile: profileData },
                onboardingComplete: true,
                password: "" // You may need to adjust the backend to allow empty pass for onboarding
            })
        });

        if (response.ok) {
            window.location.href = 'dashboard.html';
        }
    } catch (err) {
        console.error("Calibration failed", err);
    }
}

// Event Listeners for buttons
document.getElementById('onboarding-next').addEventListener('click', handleNext);
document.getElementById('onboarding-back').addEventListener('click', () => {
    if (currentStep > 0) {
        currentStep--;
        renderStep();
    }
});