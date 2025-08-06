# find_links.py
import json
import os
from dotenv import load_dotenv
from serpapi import GoogleSearch
from flask import Blueprint, request, jsonify

load_dotenv()
API_KEY = os.getenv("SERPAPI_API_KEY")
if not API_KEY:
    raise RuntimeError("SERPAPI_API_KEY ortam değişkeni tanımlı değil")


def lens_shopping_results(image_url: str, max_results: int = 5):
    """
    Google Lens ile görselden ürün sonuçlarını al.
    """
    params = {
        "engine": "google_lens",
        "url": image_url,
        "api_key": API_KEY,
        "hl": "tr",
        "gl": "tr"
    }
    search = GoogleSearch(params)
    data = search.get_dict() or {}

    print("[DEBUG] SerpAPI'den dönen veri:\n", json.dumps(data, indent=2, ensure_ascii=False))

    shopping = visual_matches = data.get("visual_matches", [])[:max_results]
    return shopping[:max_results]

# Blueprint tanımı
links_bp = Blueprint("links", __name__)

@links_bp.route("/links", methods=["POST"])
def products():
    """
    POST JSON bekler:
    {
      "outfit_url":    "https://.../image.png",  # zorunlu
      "max_results":   5                         # isteğe bağlı
    }
    """
    payload = request.get_json(force=True) or {}
    image_url = payload.get("outfit_url")
    if not image_url:
        return jsonify({"error": "outfit_url (görsel URL) zorunlu"}), 400

    try:
        max_results = int(payload.get("max_results", 5))
    except (ValueError, TypeError):
        max_results = 5

    # Sadece Lens ile dene
    items = lens_shopping_results(image_url, max_results)

    print("itemler :",items)

    return jsonify(items)
