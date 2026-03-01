import os
from flask import Blueprint, request, jsonify
import joblib
import pandas as pd
from pmdarima import auto_arima

predictions_bp = Blueprint("predictions", __name__)

_MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'models')

MODELS = {
    'UNRATE' : joblib.load(os.path.join(_MODELS_DIR, 'unemployment_arima.pkl')),
    'DPRIME' : joblib.load(os.path.join(_MODELS_DIR, 'dprime.pkl'))
}

@predictions_bp.route("/predict", methods=["POST"])
def predict():
    """
    Receive JSON payload from the Node backend and return a prediction.
    Body shape is TBD — fill in once data schema is known.
    """
    payload = request.get_json(force=True)
    series_id = payload.get('series_id')
    steps = int(payload.get('steps', 12))

    if series_id not in MODELS:
        return jsonify({'error' : f'Unknown series_id: {series_id}'}), 400
    
    model = MODELS[series_id]
    forecast = model.predict(n_periods=steps)

    start = pd.Timestamp.today().replace(day=1) + pd.offsets.MonthBegin(1)
    dates = pd.date_range(start=start, periods=steps, freq='MS')

    return jsonify({
        'series_id' : series_id,
        'steps' : steps,
        'forecast': [
            {
                'date' : d.strftime('%Y-%m-%d'), 
                'value': float(v)
            } 
            for (d, v)in zip(dates, forecast)
        ]
    })
    
