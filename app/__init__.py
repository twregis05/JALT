from flask import Flask
from .extensions import mongo
from .blueprints.stats import stats_bp
from .blueprints.users import users_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object("config.Config")

    mongo.init_app(app)

    app.register_blueprint(stats_bp)
    app.register_blueprint(users_bp, url_prefix="/users")

    return app
