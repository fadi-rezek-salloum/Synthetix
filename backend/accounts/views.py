from rest_framework import generics, permissions, viewsets

from .models import Address
from .permissions import IsCustomer, IsSeller
from .serializers import AddressSerializer, CustomerProfileSerializer, SellerProfileSerializer


class CustomerProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = CustomerProfileSerializer
    permission_classes = [IsCustomer]

    def get_object(self):
        return self.request.user.customer_profile


class SellerProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = SellerProfileSerializer
    permission_classes = [IsSeller]

    def get_object(self):
        return self.request.user.seller_profile


class AddressViewSet(viewsets.ModelViewSet):
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
