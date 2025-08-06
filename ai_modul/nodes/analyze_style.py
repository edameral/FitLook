from dotenv import load_dotenv
import os
from flask import Blueprint, request, jsonify, url_for
from werkzeug.utils import secure_filename
from prompts import style_prompt
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage

load_dotenv()

analyze_bp = Blueprint("analyze", __name__)
STATIC_FOLDER = "static/analyze_image"
os.makedirs(STATIC_FOLDER, exist_ok=True)

@analyze_bp.route("/analyze", methods=["POST"])
def analyze_style_node_func():
    try:
        # 1. Görseli al
        file = request.files.get("image")
        if not file:
            return jsonify({"error": "Görsel dosyası gerekli"}), 400

        # 2. Güvenli dosya adını al ve kaydet
        filename = secure_filename(file.filename)
        image_path = os.path.join(STATIC_FOLDER, filename)
        file.save(image_path)

        # 3. Görselin URL’sini oluştur (örnek: http://localhost:5000/static/analyze_image/xxx.jpg)
        image_url = url_for('static', filename=f"analyze_image/{filename}", _external=True)

        # 4. Gemini Vision modeli
        llm = ChatGoogleGenerativeAI(
            model="models/gemini-2.5-pro",
            api_key=os.getenv("GOOGLE_API_KEY"),
            temperature=0.3
        )
        text_prompt = style_prompt.format()

        # 5. Görsel URL ile mesaj oluştur
        msg = HumanMessage(
            content=[
                {"type": "text", "text": text_prompt},
                {"type": "image_url", "image_url": {"url": image_url}},
            ]
        )

        # 6. Yanıt al
        response = llm.invoke([msg])
        return jsonify({"photo_desc": response.content.strip()})

    except Exception as e:
        return jsonify({"error": str(e)}), 500
