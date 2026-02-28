# JALT Project Memory

## Stack
- **Frontend**: React 18, react-router-dom v6, axios — `frontend/`
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
│   ├── public/index.html
│   └── src/
│       ├── index.js
│       ├── App.js      # BrowserRouter + PrivateRoute
│       └── pages/
│           ├── Login.jsx
│           ├── Signup.jsx
│           ├── Dashboard.jsx
│           └── Account.jsx
└── ml_service/
    ├── app.py          # Flask entry; registers predictions_bp
    ├── requirements.txt
    ├── .env.example
    ├── routes/predictions.py  # POST /predict stub
    ├── models/model.py        # sklearn / PyTorch stubs
    └── utils/preprocessing.py
```

## Ports
- Frontend (React dev): 3000
- Backend (Express): 5000
- ML Service (Flask): 8000

## Key env vars
- `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `ML_SERVICE_URL` (backend)
- `FLASK_PORT`, `ALLOWED_ORIGINS` (ml_service)

## Pages (React)
Login, Signup, Dashboard (private), Account (private). All skeleton only — not yet implemented.

## Setup Commands
```bash
# Backend
cd backend && npm install && npm run dev

# Frontend
cd frontend && npm install && npm start

# ML service
cd ml_service
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```
