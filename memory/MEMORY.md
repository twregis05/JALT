# JALT Project Memory

## Stack
- **Frontend**: Plain HTML5 / vanilla JS / CSS — `frontend/`
- **Backend**: Node.js, Express 4, Mongoose 8, JWT, bcryptjs — `backend/`
- **ML Service**: Python 3, Flask 3, pandas, numpy, scikit-learn, matplotlib, seaborn, PyTorch — `ml_service/`
- **Database**: MongoDB via Mongoose

## Folder Structure
```
JALT/
├── .gitignore          # covers node_modules, venv, .env, ML artifacts
├── .env.example        # root env template
├── backend/
│   ├── server.js       # Express entry; mounts /api/auth and /api/ml
│   ├── config/db.js    # Mongoose connect
│   ├── models/User.js  # User model with bcrypt pre-save hook
│   ├── middleware/auth.js  # JWT protect middleware
│   └── routes/
│       ├── auth.js     # /signup, /login, /me
│       └── ml.js       # /predict — proxies to Flask
├── frontend/
│   ├── login.html
│   ├── signup.html
│   ├── dashboard.html
│   ├── account.html
│   ├── css/styles.css
│   └── js/
│       ├── api.js          # shared fetch helper + JWT header injection
│       ├── auth.js         # route guard (redirect to login if no token)
│       ├── login.js
│       ├── signup.js
│       ├── dashboard.js
│       └── account.js
└── ml_service/
    ├── app.py          # Flask entry; registers predictions_bp
    ├── requirements.txt
    ├── .env.example
    ├── routes/predictions.py  # POST /predict stub
    ├── models/model.py        # sklearn / PyTorch stubs
    └── utils/preprocessing.py
```

## Ports
- Frontend (static): served by Express or any static server
- Backend (Express): 5000
- ML Service (Flask): 8000

## Key env vars
- `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `ML_SERVICE_URL` (backend)
- `FLASK_PORT`, `ALLOWED_ORIGINS` (ml_service)

## Pages (plain HTML)
login.html, signup.html, dashboard.html (guarded), account.html (guarded).
All skeleton only — not yet implemented. dashboard/account load js/auth.js first to redirect if no token.

## Setup Commands
```bash
# Backend
cd backend && npm install && npm run dev

# Frontend — open HTML files directly or serve via Express static middleware
# (no build step needed)

# ML service
cd ml_service
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
python app.py
```
