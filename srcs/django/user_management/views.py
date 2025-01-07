from rest_framework import generics, authentication, permissions
from rest_framework.authtoken.views import ObtainAuthToken

from user_management.serializers import UserSerializer, AuthTokenSerializer
from user_management.models import User


class CreateUserView(generics.CreateAPIView):
    serializer_class = UserSerializer


class RetrieveUpdateUserView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    authentication_classes = [authentication.TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
    
class CreateTokenView(ObtainAuthToken):
    serializer_class = AuthTokenSerializer

#class ListUsersView(generics.ListAPIView):
#    serializer_class = UserSerializer
#
#    def get_queryset(self):
#        return User.get_queryset()
    