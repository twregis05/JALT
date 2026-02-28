from flask import Blueprint

stats_bp = Blueprint("stats", __name__, template_folder="templates")

from . import routes  # noqa: E402, F401
