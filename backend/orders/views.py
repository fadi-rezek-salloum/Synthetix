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
        return Cart.objects.filter(user=self.request.user)

    def get_object(self):
        obj, _ = Cart.objects.get_or_create(user=self.request.user)
        return obj

    @action(detail=False, methods=['post'])
    def add_item(self, request):
        variant_id = request.data.get('variant_id')
        quantity = int(request.data.get('quantity', 1))
        
        try:
            variant = ProductVariant.objects.get(id=variant_id)
            cart = self.get_object()
            
            cart_item, created = CartItem.objects.get_or_create(
                cart=cart, variant=variant
            )
            
            if not created:
                cart_item.quantity += quantity
            else:
                cart_item.quantity = quantity
                
            cart_item.save()
            return Response(CartSerializer(cart).data)
        except ProductVariant.DoesNotExist:
            return Response({"error": "Variant not found"}, status=404)

    @action(detail=False, methods=['post'])
    def remove_item(self, request):
        item_id = request.data.get('item_id')
        if not item_id:
            return Response({"error": "item_id is required"}, status=400)
            
        try:
            cart = self.get_object()
            item = CartItem.objects.get(id=item_id, cart=cart)
            item.delete()
            return Response(CartSerializer(cart).data)
        except CartItem.DoesNotExist:
            return Response({"error": "Item not found in your cart"}, status=404)


class OrderViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

    @action(detail=False, methods=['post'])
    def checkout(self, request):
        cart = Cart.objects.get(user=self.request.user)
        if not cart.items.exists():
            return Response({"error": "Cart is empty"}, status=400)
            
        # Create order
        order = Order.objects.create(
            user=self.request.user,
            total_amount=cart.total_price,
            shipping_address=request.data.get('shipping_address', 'Default Address'),
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
