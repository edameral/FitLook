from langchain.prompts import PromptTemplate

# analyze_style promptu
style_prompt = PromptTemplate(
    input_variables=["image_base64"],
    template="""

Aşağıdaki JPEG görüntüyü kısaca analiz et VE 3-4 cümle ile açıkla.
Sadece **kişinin ne giydiğini** ve **genel tarzını** birkaç cümleyle **Türkçe** anlat.
Başka hiçbir detay, maddeleme veya fazladan metin ekleme.

"""
)

# suggest_outfit propmtu
fashion_prompt = PromptTemplate(
    input_variables=["photo_desc", "occasion"],
    template="""
You are a top-tier personal fashion stylist AI.

Use the following context to create a single outfit suggestion tailored for the individual:
- User preferences: {context}
- Description of the person in the photo: {photo_desc}
- Occasion: {occasion}

Your response must include exactly **one outfit suggestion**, structured in this format:

1. **Üst**: [önerin]
2. **Alt**: [önerin]
3. **Aksesuarlar**: [önerin]
4. **Stil Notu**: [kombinle ilgili kısa bir açıklama veya ipucu]

The entire output must be written in **natural and fluent Turkish**.

Only provide one complete outfit. Do not include multiple options, alternatives, or any introduction.

"""
)

"""

# Üst giysi için şablon
UPPER_TEMPLATE = (
    "Create a high-resolution product photo of a {desc}, "
    "front view, on a clean white background, natural lighting, "
    "with the product displayed alone and not on a mannequin."
)

# Alt giysi için şablon
LOWER_TEMPLATE = (
    "Create a high-resolution product photo of a {desc}, "
    "front view, on a clean white background, natural lighting, "
    "with the product displayed alone and not on a mannequin."
)

"""

# Üst giysi için Türkçe şablon
# Üst giysi için Türkçe prompt şablonu
UPPER_TEMPLATE = (
    "Ürünün manken üzerinde değil, tek başına gösterildiği; önden görünüşlü, "
    "temiz beyaz bir arka plan ve doğal ışıklandırma kullanılarak {desc} için "
    "yüksek çözünürlüklü ve tamamı görünen bir ürün fotoğrafı oluşturun."
)

# Alt giysi için Türkçe prompt şablonu
LOWER_TEMPLATE = (
    "Ürünün katlanmadan düz şekilde yerleştirildiği, beyaz arka planlı ve "
    "yüksek çözünürlükte fotoğraflanmış, önden görünüşlü {desc} ürün görseli üretin."
)


# Prompt'taki açıklamayı temizler
def extract_description(desc: str) -> str:
    import re
    if not desc:
        return ""
    # Markdown işaretlerini ve baştaki numaraları temizle
    desc = re.sub(r'^\d+\.\s*\*\*(Üst|Alt)\*\*:\s*', '', desc)
    return desc.replace("**", "").rstrip(".").strip()


# Görsel üretim prompt'larını oluşturur
def generate_image_prompts(suggestions: dict[str, str]) -> dict[str, str]:
    # item_0 -> üst, item_1 -> alt
    top_desc = extract_description(suggestions.get("item_0", ""))
    bot_desc = extract_description(suggestions.get("item_1", ""))

    # Konsola yazdır
    print("Top Description:", top_desc)
    print("Bottom Description:", bot_desc)

    upper_prompt = UPPER_TEMPLATE.format(desc=top_desc)
    lower_prompt = LOWER_TEMPLATE.format(desc=bot_desc)

    # Konsola yazdır
    print("Upper Prompt:", upper_prompt)
    print("Lower Prompt:", lower_prompt)

    return {
        "upper_clothing_prompt": upper_prompt,
        "lower_clothing_prompt": lower_prompt,
    }


virtual_try_on_prompt = PromptTemplate(
    input_variables=["upper_image_url", "lower_image_url"],
    template="""
Aşağıdaki iki giysi görselini, kullanıcının fotoğrafındaki kişiye kusursuz şekilde giydir:
• Üst giysi: {upper_image_url}  
• Alt giysi: {lower_image_url}  

Lütfen fotoğrafın geri kalanındaki hiçbir detayı (arka plan, yüz ifadesi, ışık, vs.) değiştirme.  
Sadece giysileri doğru boyut, poz ve perspektife oturtarak tek bir yüksek çözünürlüklü PNG olarak döndür.
"""
)

