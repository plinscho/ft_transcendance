from django.db import models
import pyotp
from django.contrib.auth.models import (
    AbstractBaseUser,
    PermissionsMixin,
    BaseUserManager
)

class UserManager(BaseUserManager):
    def create_user(self, email, password, username, **extra_field):
        if not email:
            raise ValueError('Email is required')
        user = self.model(email=email, username=username, **extra_field)
        user.set_password(password)
        user.save(using=self._db)

        # Crear la instancia de TwoFactorAuth y asociarla al usuario
        table = TwoFactorAuth.objects.create(user=user, secret=pyotp.random_base32())
        user.two_factor_auth = table
        # Guardar el usuario nuevamente para persistir la relación
        user.save(using=self._db) 

        return user

    def create_superuser(self, username, email, password):
        user = self.create_user(email, password, username)
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)

        return user

class TwoFactorAuth(models.Model):
    secret = models.CharField(max_length=32, null=True)
    is_verified = models.BooleanField(default=False)
    user = models.OneToOneField('User',
                                on_delete=models.CASCADE, 
                                related_name='two_factor_auth_data')

    def __str__(self):
        return f"{self.user.username} - {self.secret}"

class User(AbstractBaseUser, PermissionsMixin):
    LANGUAGE_CHOICES = ['en', 'es', 'fr', 'it']
    
    email = models.EmailField(unique=True, max_length=100)
    username = models.CharField(max_length=20)
    password = models.CharField(max_length=255)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    language = models.CharField(max_length=2, choices=[(lang, lang) for lang in LANGUAGE_CHOICES], default='en')
    image = models.ImageField()
    two_factor_auth = models.OneToOneField(TwoFactorAuth, 
                                        on_delete=models.CASCADE, 
                                        null=True, 
                                        blank=True, 
                                        related_name='user_data')
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']