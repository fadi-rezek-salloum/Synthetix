import os

from catalog.models import Product
from google import genai
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .services import AIService


class BuyerChatbotView(APIView):
    def post(self, request):
        user_message = request.data.get("message")
        if not user_message:
            return Response(
                {"error": "Message is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        products = Product.objects.filter(
            is_active=True, vendor__seller_profile__is_verified=True
        ).values("name", "brand", "base_price", "description")

        inventory_context = "\n".join(
            [
                f"- {p['brand']} {p['name']} (${p['base_price']}): {p['description']}"
                for p in products
            ]
        )

        prompt = f"""
        You are 'Loom', the luxury fashion concierge for Synthetix.
        Be polite, concise, and stylish. Use sensory language.
        
        Here is our current inventory:
        {inventory_context}

        The customer says: "{user_message}"
        
        How do you respond? If they ask for something we don't have, politely suggest the closest alternative.
        """

        try:
            client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
            response = client.models.generate_content(model="gemini-1.5-flash", contents=prompt)
            return Response({"reply": response.text})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ManualEnrichmentView(APIView):
    def post(self, request):
        product_id = request.data.get("product_id")
        try:
            product = Product.objects.get(id=product_id)
            ai = AIService()

            data = ai.generate_fashion_meta(product)

            if data:
                return Response(data)
            return Response({"error": "AI failed to generate"}, status=500)

        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=404)
