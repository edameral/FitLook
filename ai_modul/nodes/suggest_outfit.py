from dotenv import load_dotenv
import os
from flask import Blueprint, request, jsonify
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.chains import LLMChain
from prompts import fashion_prompt
from nodes.generate_images import generate_image_prompts

load_dotenv()

suggest_bp = Blueprint("suggest", __name__)

def create_llm():
    return ChatGoogleGenerativeAI(
        model=os.getenv("GEMINI_MODEL", "models/chat-bison-001"),
        temperature=float(os.getenv("LLM_TEMPERATURE", "0.1")),
        api_key=os.getenv("GOOGLE_API_KEY"),
    )

@suggest_bp.route("/suggest", methods=["POST"])
def outfit_node_func_route():
    data = request.get_json()
    if not data or not all(k in data for k in ["photo_desc", "occasion"]):
        return jsonify({"error": "Eksik parametreler: photo_desc ve occasion"}), 400

    context_value = data.get("context", "default context value")

    #LLM’den outfit önerisi al
    llm = create_llm()
    chain = LLMChain(llm=llm, prompt=fashion_prompt)
    response = chain.invoke({
        "photo_desc": data["photo_desc"],
        "occasion": data["occasion"],
        "context": context_value,
    })
    text = response.get("text") if isinstance(response, dict) else str(response)
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    suggestions = {f"item_{i}": lines[i] for i in range(len(lines))}

    # Aynı suggestions sözlüğünü kullanarak image prompt’larını oluştur
    prompts = generate_image_prompts(suggestions)
    # prompts: {"upper_clothing_prompt": "...", "lower_clothing_prompt": "..."}

    return jsonify({
        "suggestions": suggestions,
        "image_prompts": prompts
    })
