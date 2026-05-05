from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Cart, CartItem, Order, OrderItem
from .serializers import CartSerializer, CartItemSerializer, OrderSerializer
from catalog.models import ProductVariant


class CartViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CartSerializer

    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user).prefetch_related(
            "items__variant__product__images",
            "items__variant__product__variants"
        )

    def get_object(self):
        obj, _ = Cart.objects.prefetch_related(
            "items__variant__product__images",
            "items__variant__product__variants"
        ).get_or_create(user=self.request.user)
        return obj

    @action(detail=False, methods=['post'])
    def add_item(self, request):
        variant_id = request.data.get('variant_id')
        
        # Validate variant_id
        if not variant_id:
            return Response({"error": "variant_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate and parse quantity
        try:
            quantity = int(request.data.get('quantity', 1))
        except (ValueError, TypeError):
            return Response({"error": "quantity must be a valid integer"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate quantity is positive
        if quantity <= 0:
            return Response({"error": "quantity must be greater than 0"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Limit quantity to reasonable maximum
        MAX_QUANTITY = 999
        if quantity > MAX_QUANTITY:
            return Response({"error": f"quantity cannot exceed {MAX_QUANTITY}"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            variant = ProductVariant.objects.get(id=variant_id)
        except ProductVariant.DoesNotExist:
            return Response({"error": "Variant not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Check stock availability
        if variant.stock <= 0:
            return Response({"error": "This item is out of stock"}, status=status.HTTP_400_BAD_REQUEST)
        
        if quantity > variant.stock:
            return Response({
                "error": f"Only {variant.stock} item(s) available in stock",
                "available": variant.stock
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            cart = self.get_object()
            
            cart_item, created = CartItem.objects.get_or_create(
                cart=cart, variant=variant
            )
            
            if not created:
                # Check total quantity doesn't exceed stock
                total_quantity = cart_item.quantity + quantity
                if total_quantity > variant.stock:
                    return Response({
                        "error": f"Only {variant.stock} item(s) available in stock",
                        "requested": total_quantity,
                        "available": variant.stock
                    }, status=status.HTTP_400_BAD_REQUEST)
                cart_item.quantity = total_quantity
            else:
                cart_item.quantity = quantity
                
            cart_item.save()
            return Response(CartSerializer(cart).data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'])
    def remove_item(self, request):
        item_id = request.data.get('item_id')
        if not item_id:
            return Response({"error": "item_id is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            cart = self.get_object()
            item = CartItem.objects.get(id=item_id, cart=cart)
            item.delete()
            return Response(CartSerializer(cart).data)
        except CartItem.DoesNotExist:
            return Response({"error": "Item not found in your cart"}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'])
    def update_quantity(self, request):
        item_id = request.data.get('item_id')
        try:
            quantity = int(request.data.get('quantity', 1))
        except (ValueError, TypeError):
            return Response({"error": "quantity must be a valid integer"}, status=status.HTTP_400_BAD_REQUEST)

        if not item_id:
            return Response({"error": "item_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        if quantity < 1 or quantity > 999:
            return Response({"error": "quantity must be between 1 and 999"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            cart = self.get_object()
            item = CartItem.objects.select_related(
                "variant"
            ).get(id=item_id, cart=cart)
            if quantity > item.variant.stock:
                return Response(
                    {"error": f"Only {item.variant.stock} item(s) available", "available": item.variant.stock},
                    status=status.HTTP_400_BAD_REQUEST
                )
            item.quantity = quantity
            item.save()
            return Response(CartSerializer(cart).data)
        except CartItem.DoesNotExist:
            return Response({"error": "Item not found in your cart"}, status=status.HTTP_404_NOT_FOUND)


class OrderViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related(
            "items__product__images"
        )

    @action(detail=False, methods=['post'])
    def checkout(self, request):
        # Validate shipping address
        shipping_address = request.data.get('shipping_address', '').strip()
        if not shipping_address:
            return Response({
                "error": "shipping_address is required and cannot be empty"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if len(shipping_address) < 10:
            return Response({
                "error": "shipping_address must be at least 10 characters long"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if len(shipping_address) > 500:
            return Response({
                "error": "shipping_address is too long (maximum 500 characters)"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            cart = Cart.objects.get(user=self.request.user)
        except Cart.DoesNotExist:
            return Response({"error": "No cart found"}, status=status.HTTP_404_NOT_FOUND)
        
        if not cart.items.exists():
            return Response({"error": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)
            
        # Create order
        order = Order.objects.create(
            user=self.request.user,
            total_amount=cart.total_price,
            shipping_address=shipping_address,
        )
        
        # Move items to order
        for item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product=item.variant.product,
                variant_info=f"{item.variant.color} - {item.variant.size}",
                quantity=item.quantity,
                price=item.variant.price_override or item.variant.product.base_price
            )
            
        # Clear cart
        cart.items.all().delete()
        
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
