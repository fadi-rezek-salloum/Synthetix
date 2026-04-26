import json
import os

import PIL.Image
from google import genai
from google.genai import types


class AIService:
    def __init__(self):
        self.client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
        self.config = types.GenerateContentConfig(
            system_instruction="""
            You are the Lead SEO Fashion Stylist for 'Synthetix', a luxury clothing brand. 
            Your goal is to turn technical specs and images into high-converting, emotive, 
            and SEO-optimized product data. Use sensory words (e.g., 'velvety', 'breathable', 'structured').
            """,
            response_mime_type="application/json",
            response_schema={
                "type": "OBJECT",
                "properties": {
                    "seo_description": {"type": "STRING"},
                    "seo_tags": {"type": "ARRAY", "items": {"type": "STRING"}},
                    "style_notes": {"type": "STRING"},
                    "suggested_color_name": {"type": "STRING"},
                },
                "required": ["seo_description", "seo_tags"],
            },
        )

    def generate_fashion_meta(self, product, image_paths=None):
        context = (
            f"BRAND: {product.brand}\n"
            f"NAME: {product.name}\n"
            f"TARGET: {product.get_gender_display()}\n"
            f"SPECS: {product.description}\n"
            f"PRICE: ${product.base_price}"
        )

        contents = [context]
        if image_paths:
            for path in image_paths:
                if os.path.exists(path):
                    contents.append(PIL.Image.open(path))

        try:
            response = self.client.models.generate_content(
                model="gemini-1.5-flash", contents=contents, config=self.config
            )

            return json.loads(response.text)
        except Exception as e:
            print(f"Elite AI Error: {e}")
            return None
