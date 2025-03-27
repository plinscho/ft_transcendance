from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken
from rest_framework_simplejwt.views import TokenObtainPairView

from user.serializers import UserSerializer, AuthTokenSerializer
from user.models import TwoFactorAuth

from django.core.mail import send_mail, EmailMessage  # Para enviar correos
from django.contrib.auth import get_user_model  # Import get_user_model
from django.conf import settings  # Para acceder a las configuraciones de EMAIL_HOST_USER
from rest_framework import generics, permissions, status  # Para la vista y permisos de DRF
import pyotp
import logging


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

# Debug purpose
logger = logging.getLogger(__name__)

class LoginUserView(TokenObtainPairView):
    serializer_class = AuthTokenSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            user = self.get_user(request.data['email'])
            if user:
                # Generar token JWT
                refresh = RefreshToken.for_user(user)
                access_token = str(refresh.access_token)

                # Incluir el token en la respuesta
                response_data = {
                    'email': user.email,
                    'username': user.username,
                    'access': access_token
                }

                return Response(response_data, status=status.HTTP_200_OK)
        return response

    def get_user(self, email):
        try:
            return get_user_model().objects.get(email=email)
        except get_user_model().DoesNotExist:
            return None

class Generate2FACodeView(generics.GenericAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        if user:
            two_factor_auth = TwoFactorAuth.objects.get(user=user)
            two_factor_auth, created = TwoFactorAuth.objects.get_or_create(user=user)
            if created:
                two_factor_auth.secret = pyotp.random_base32()
                two_factor_auth.is_verified = False
                two_factor_auth.save()
                user.two_factor_auth = two_factor_auth
                user.save()
                print(f"New secret code generated for: {user.email}")

            totp = pyotp.TOTP(two_factor_auth.secret, interval=300)
            code = totp.now()
            # debug print
            print(f"Generated code: {code}")

            try:
                send_mail(
                    'Your verification code',
                    f'Your verification code is {code}',
                    settings.EMAIL_HOST_USER,
                    [user.email],
                    fail_silently=False,
                )
                logger.info(f'Verification code sent to {user.email}')
                return Response({"message": "Verification code sent"}, status=status.HTTP_200_OK)
            except Exception as e:
                logger.error(f'Error sending email: {e}')
                logger.error(f'EMAIL_HOST: {settings.EMAIL_HOST}')
                logger.error(f'EMAIL_PORT: {settings.EMAIL_PORT}')
                logger.error(f'EMAIL_USE_TLS: {settings.EMAIL_USE_TLS}')
                logger.error(f'EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}')
                logger.error(f'EMAIL_HOST_PASSWORD: {settings.EMAIL_HOST_PASSWORD}')
                return Response({"error": "Error sending email"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response({"error": "User not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)

#Enviamos el mail para que el usuario reciba el código de 2FA que se crea en la vista
#Guardamos el codigo y la fecha de expiración en el modelo de usuario
class Verify2FACodeView(generics.GenericAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        code = request.data.get('token')
        code = code.strip()
        #debug print
        print(f"Request Code from browser: {code}")

        try:
            if user.two_factor_auth is None:
                return Response({"error": "Two-factor authentication not set up"}, status=status.HTTP_400_BAD_REQUEST)

            totp = pyotp.TOTP(user.two_factor_auth.secret, interval=300)
            if totp.verify(code):
                user.two_factor_auth.is_verified = True
                user.two_factor_auth.save()
                # Reset verification code when verified
                user.two_factor_auth.secret = pyotp.random_base32()
                user.two_factor_auth.save()
                print(f"User {user.username} logged in succesfully!")
                return Response({"message": "Verification successful"}, status=status.HTTP_200_OK)
            else:
                print(f"Code {code} is not valid. Sending 400 HTTP")
                return Response({"error": "Invalid verification code"}, status=status.HTTP_400_BAD_REQUEST)
        except TwoFactorAuth.DoesNotExist:
            return Response({"error": "Two-factor authentication not set up"}, status=status.HTTP_400_BAD_REQUEST)

class UpdateUserLanguageView(generics.UpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def get_object(self):
        return self.request.user
    
    def patch(self, request, *args, **kwargs):
        user = self.get_object()
        language = request.data.get('language')
        User = get_user_model()
        
        # Valida directamente contra la lista de idiomas
        if language not in User.LANGUAGE_CHOICES:
            return Response(
                {"error": f"Invalid language choice. Available options: {', '.join(User.LANGUAGE_CHOICES)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Usar update parcial directo con el idioma validado
        serializer = self.get_serializer(user, data={'language': language}, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                'email': user.email,
                'username': user.username,
                'language': user.language
            }, status=status.HTTP_200_OK)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)