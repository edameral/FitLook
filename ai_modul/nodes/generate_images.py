import os
import time
import jwt
import requests
from flask import Blueprint, request, jsonify
from dotenv import load_dotenv
from prompts import generate_image_prompts


# .env’den anahtarları al
load_dotenv()
KLING_ACCESS_KEY = os.getenv("KLING_ACCESS_KEY")
KLING_SECRET_KEY = os.getenv("KLING_SECRET_KEY")

generate_bp = Blueprint("generate", __name__)

def encode_jwt_token(ak, sk):
    payload = {
        "iss": ak,
        "exp": int(time.time()) + 1800,
        "nbf": int(time.time()) - 5
    }
    return jwt.encode(payload, sk, algorithm="HS256")

def call_kling_api(prompt: str, negative_prompt: str = "blurry") -> list[str]:
    if not KLING_ACCESS_KEY or not KLING_SECRET_KEY:
        raise RuntimeError("KLING_ACCESS_KEY veya KLING_SECRET_KEY bulunamadı.")
    token = encode_jwt_token(KLING_ACCESS_KEY, KLING_SECRET_KEY)
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    url = "https://api-singapore.klingai.com/v1/images/generations"

    # Başlat
    resp = requests.post(url, headers=headers, json={
        "model":"kling-v2",
        "prompt":prompt,
        "negative_prompt":negative_prompt,
        "n":1,
        "aspect_ratio":"16:9",
    })
    resp.raise_for_status()
    data = resp.json()
    if data.get("code") != 0:
        raise RuntimeError(f"Kling error: {data.get('message','')}")
    task_id = data["data"]["task_id"]

    # Polling
    poll_url = f"{url}/{task_id}"
    for _ in range(30):
        time.sleep(2)
        st = requests.get(poll_url, headers=headers)
        st.raise_for_status()
        info = st.json().get("data", {})
        if info.get("task_status") == "succeed":
            return [img["url"] for img in info["task_result"]["images"]]
    raise TimeoutError("Kling image generation timed out.")

@generate_bp.route("/generate", methods=["POST"])
def generate_images_from_suggestions_route():
    suggestions = request.get_json()
    print("Gelen veri:", suggestions)
    result = generate_images_from_suggestions(suggestions)
    return jsonify(result)

# Eski helper fonksiyon (bu yerinde kalabilir)
def generate_images_from_suggestions(suggestions: dict[str, str]) -> dict[str, list[str]]:
    prompts = generate_image_prompts(suggestions)
    upper_prompt = prompts["upper_clothing_prompt"]
    lower_prompt = prompts["lower_clothing_prompt"]
    return {
        "upper_image_urls": call_kling_api(upper_prompt),
        "lower_image_urls": call_kling_api(lower_prompt),
    }
