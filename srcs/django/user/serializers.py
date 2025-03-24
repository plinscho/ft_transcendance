from django.contrib.auth import get_user_model, authenticate
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from user.models import TwoFactorAuth

class TwoFactorAuthSerializer(serializers.ModelSerializer):
    class Meta:
        model = TwoFactorAuth
        fields = ['secret', 'is_verified']
        extra_kwargs = {'secret': {'write_only': True}}

class UserSerializer(serializers.ModelSerializer):
    two_factor_auth = TwoFactorAuthSerializer(read_only=True)
    language = serializers.CharField(default='en')

    class Meta:
        model = get_user_model()
        fields = ['email', 'password', 'username', 'language', 'two_factor_auth']
        extra_kwargs = {'password': {'write_only': True}} # evita que el GET nos revele la contraseña

    def create(self, validated_data):
        return get_user_model().objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            username=validated_data['username'],
            language=validated_data.get('language', 'en')
        )
    
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        user = super().update(instance, validated_data)

        if password:
            user.set_password(password)        
            user.save()

        return user

class AuthTokenSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data.update({'username': self.user.username})
        return data
    