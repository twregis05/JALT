from flask import Blueprint, request, jsonify

predictions_bp = Blueprint("predictions", __name__)


@predictions_bp.route("/predict", methods=["POST"])
def predict():
    """
    Receive JSON payload from the Node backend and return a prediction.
    Body shape is TBD — fill in once data schema is known.
    """
    payload = request.get_json(force=True)

    # TODO: validate payload
    # TODO: preprocess with pandas / numpy
    # TODO: run model inference (scikit-learn or PyTorch)
    # TODO: return structured prediction

    result = {
        "prediction": None,
        "confidence": None,
        "message": "Stub — model not yet implemented",
    }
    return jsonify(result), 200
