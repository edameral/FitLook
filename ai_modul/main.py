import os
import json
import time, jwt, requests
from flask import Flask, request, jsonify
from nodes.analyze_style import analyze_bp
from nodes.suggest_outfit import suggest_bp
from nodes.generate_images import generate_bp
from nodes.virtual_try_on import tryon_bp
from nodes.find_links import links_bp


app = Flask(__name__)
app.register_blueprint(analyze_bp)
app.register_blueprint(generate_bp)
app.register_blueprint(suggest_bp)
app.register_blueprint(tryon_bp)
app.register_blueprint(links_bp)


if __name__ == "__main__":
    app.run(port=5000)