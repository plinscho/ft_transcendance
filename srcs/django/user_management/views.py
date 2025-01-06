from rest_framework import generics
from user_management.serializers import UserSerializer
from user_management.models import User

class CreateUserView(generics.CreateAPIView):
    serializer_class = UserSerializer


class ListUsersView(generics.ListAPIView):
    serializer_class = UserSerializer

    def get_queryset(self):
        return User.get_queryset()
    