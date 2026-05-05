import json
import logging
import os

import PIL.Image
from google import genai
from google.genai import types

logger = logging.getLogger(__name__)


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
                model="gemini-1.5-flash-latest", contents=contents, config=self.config
            )

            return json.loads(response.text)
        except Exception as e:
            logger.exception("AI fashion meta generation failed: %s", e)
            return None

    def get_chatbot_reply(self, user_message: str, inventory_context: str) -> str:
        """Generate a response from the 'Loom' fashion concierge."""
        prompt = f"""
        You are 'Loom', the luxury fashion concierge for Synthetix.
        Be polite, concise, and stylish. Use sensory language.
        
        Here is our current inventory:
        {inventory_context}

        The customer says: "{user_message}"
        
        How do you respond? If they ask for something we don't have, politely suggest the closest alternative.
        """
        try:
            response = self.client.models.generate_content(
                model="gemini-1.5-flash", contents=prompt
            )
            return response.text
        except Exception as e:
            logger.exception("Chatbot reply failed: %s", e)
            return "I apologize, but I am experiencing a brief neural disconnect. How else may I assist you with your aesthetic journey?"
