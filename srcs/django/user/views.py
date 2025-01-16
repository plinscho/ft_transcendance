from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken
from rest_framework_simplejwt.views import TokenObtainPairView

from user.serializers import UserSerializer, AuthTokenSerializer


class CreateUserView(generics.CreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generar token JWT
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        # Incluir el token en la respuesta
        response_data = {
            'email': user.email,
            'username': user.username,
            'token': access_token
        }

        return Response(response_data, status=status.HTTP_201_CREATED)


# Recibimos un auth token y yo devuelvo un 200 si el token coincide o un error si no coincide
class VerifyUserView(generics.CreateAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request): # Recibimos el AuthToken en el request
        try:
            user = request.user
            return Response({"message": "Token is valid", "user":user.username})
        except:
            return Response({"error":"Invalid Token"}, status=status.HTTP_401_UNAUTHORIZED)


class PopulateUserDataView(generics.CreateAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user # Check que el AuthToken sea match con el de user
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

class CreateTokenView(TokenObtainPairView):
    serializer_class = AuthTokenSerializer
    permission_classes = [permissions.AllowAny]

#class RetrieveUpdateUserView(generics.RetrieveUpdateAPIView):
#    serializer_class = UserSerializer
#    authentication_classes = [authentication.TokenAuthentication]
#    permission_classes = [permissions.IsAuthenticated]
#
#    def get_object(self):
#        return self.request.user

#class ListUsersView(generics.ListAPIView):
#    serializer_class = UserSerializer
#
#    def get_queryset(self):
#        return User.get_queryset()
    