import os
import time
import jwt
import requests
import base64
import json
from PIL import Image
from io import BytesIO
from dotenv import load_dotenv
from flask import Blueprint, request, jsonify

load_dotenv()
ACCESS_KEY = os.getenv("KLING_VTO_ACCESS_KEY")
SECRET_KEY = os.getenv("KLING_VTO_SECRET_KEY")

API_URL = "https://api-singapore.klingai.com/v1/images/kolors-virtual-try-on"

tryon_bp = Blueprint('tryon', __name__)

def encode_jwt_token(ak, sk):
    payload = {"iss": ak, "exp": int(time.time())+1800, "nbf": int(time.time())-5}
    return jwt.encode(payload, sk, algorithm="HS256")

def get_headers():
    token = encode_jwt_token(ACCESS_KEY, SECRET_KEY)
    if isinstance(token, bytes):
        token = token.decode()
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

def to_base64(path):
    with open(path, "rb") as f:
        raw = f.read()
    b64 = base64.b64encode(raw).decode("utf-8")
    return b64

# Yeni yardımcı fonksiyon
def open_image_from_path_or_url(path_or_url):
    if path_or_url.startswith('http'):
        resp = requests.get(path_or_url)
        resp.raise_for_status()
        return Image.open(BytesIO(resp.content))
    else:
        return Image.open(path_or_url)

# Güncellenmiş merge_images fonksiyonu
def merge_images(upper_path, lower_path, output_path,
                 mode="vertical", bg_color=(255,255,255)):
    upper = open_image_from_path_or_url(upper_path)
    lower = open_image_from_path_or_url(lower_path)
    if mode == "vertical":
        w = max(upper.width, lower.width)
        h = upper.height + lower.height
        combined = Image.new("RGB", (w, h), bg_color)
        combined.paste(upper, ((w - upper.width) // 2, 0))
        combined.paste(lower, ((w - lower.width) // 2, upper.height))
    else:
        w = upper.width + lower.width
        h = max(upper.height, lower.height)
        combined = Image.new("RGB", (w, h), bg_color)
        combined.paste(upper, (0, (h - upper.height) // 2))
        combined.paste(lower, (upper.width, (h - lower.height) // 2))
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    combined.save(output_path)
    return output_path

@tryon_bp.route('/tryon', methods=['POST'])
def tryon():
    data = request.get_json()
    human = data.get('human_image')
    upper = data.get('upper_image')
    lower = data.get('lower_image')
    model = data.get('model_name', 'kolors-virtual-try-on-v1-5')

    # Prepare human payload
    human_payload = human if human.startswith('http') else to_base64(human)

    # Prepare cloth payload: merge if both upper+lower
    if upper and lower:
        combined = merge_images(upper, lower, 'data/analyze_image/combined.png')
        cloth_payload = to_base64(combined)
    elif upper:
        cloth_payload = upper if upper.startswith('http') else to_base64(upper)
    elif lower:
        cloth_payload = lower if lower.startswith('http') else to_base64(lower)
    else:
        return jsonify({"error": "upper_image or lower_image required"}), 400

    payload = {
        "model_name":  model,
        "human_image": human_payload,
        "cloth_image": cloth_payload
    }
    # Create task
    resp = requests.post(API_URL, headers=get_headers(), json=payload)
    if resp.status_code != 200:
        return jsonify(resp.json()), resp.status_code
    task_id = resp.json()['data']['task_id']

    # Poll until succeed
    for _ in range(40):
        r = requests.get(f"{API_URL}/{task_id}", headers=get_headers())
        if r.status_code != 200:
            return jsonify(r.json()), r.status_code
        full = r.json().get('data', {})
        status = full.get('task_status')
        if status == 'succeed':
            result_data = full.get('task_result', {})
            print("Task result data:", result_data)
            result_url = result_data.get('url') or result_data.get('urls') or None
            return jsonify({
                'task_id': task_id,
                'result_url': result_url,
                'result_data': result_data
            }), 200
        elif status in ('failed', 'error'):
            return jsonify({'error': full.get('task_status_msg')}), 500
        time.sleep(5)

    return jsonify({'error': 'Timeout waiting for result', 'task_id': task_id}), 504
