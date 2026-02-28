from flask import render_template, request, redirect, url_for, session, flash
from werkzeug.security import generate_password_hash, check_password_hash
from app.extensions import mongo
from . import users_bp


@users_bp.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        username = request.form.get("username", "").strip()
        password = request.form.get("password", "")

        users = mongo.db.users
        existing = users.find_one({"username": username})

        if existing:
            flash("Username already taken.", "error")
            return redirect(url_for("users.register"))

        users.insert_one({
            "username": username,
            "password": generate_password_hash(password),
        })
        flash("Account created. Please log in.", "success")
        return redirect(url_for("users.login"))

    return render_template("users/register.html")


@users_bp.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form.get("username", "").strip()
        password = request.form.get("password", "")

        user = mongo.db.users.find_one({"username": username})

        if user and check_password_hash(user["password"], password):
            session["user"] = username
            flash("Logged in successfully.", "success")
            return redirect(url_for("stats.index"))

        flash("Invalid username or password.", "error")

    return render_template("users/login.html")


@users_bp.route("/logout")
def logout():
    session.pop("user", None)
    flash("Logged out.", "success")
    return redirect(url_for("stats.index"))
