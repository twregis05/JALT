from flask import render_template
from . import stats_bp


@stats_bp.route("/")
def index():
    return render_template("stats/index.html")


@stats_bp.route("/dashboard")
def dashboard():
    return render_template("stats/dashboard.html")
