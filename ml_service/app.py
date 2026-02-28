import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

from routes.predictions import predictions_bp

load_dotenv()

app = Flask(__name__)

# Allow requests from the Node backend only
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5000").split(",")
CORS(app, origins=allowed_origins)

# ── Register blueprints ───────────────────────
app.register_blueprint(predictions_bp, url_prefix="/")

# ── Health check ─────────────────────────────
@app.route("/health")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    port = int(os.getenv("FLASK_PORT", 8000))
    app.run(debug=os.getenv("FLASK_ENV") == "development", port=port)
