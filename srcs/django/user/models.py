from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser,
    PermissionsMixin,
    BaseUserManager
)
import pyotp

class UserManager(BaseUserManager):
    def create_user(self, email, password, username, **extra_field):
        if not email:
            raise ValueError('Email is required')
        user = self.model(email=email, username=username, **extra_field)
        user.set_password(password)
        user.save(using=self._db)

        TwoFactorAuth.objects.create(user=user, secret=pyotp.random_base32()) # Crear la tabla

        return user

    def create_superuser(self, username, email, password):
        user = self.create_user(email, password, username)
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)

        return user

"""
# Modelo para enviar el email y el 2fa
"""
class TwoFactorAuth(models.Model):
    user = models.OneToOneField('User', on_delete=models.CASCADE, related_name='two_factor_auth_data')
    secret = models.CharField(max_length=32, default=pyotp.random_base32)
    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username} - {self.secret}"

"""
The name of each Field instance (e.g. username or email) is the fields name, 
in machine-friendly format. You will use this value in your Python code, 
and your database will use it as the column name.
"""
class User(AbstractBaseUser,PermissionsMixin):
    email = models.EmailField(unique=True, max_length=100)
    username = models.CharField(max_length=20)
    password = models.CharField(max_length=255)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    image = models.ImageField()
    two_factor_auth = models.OneToOneField(TwoFactorAuth, 
                                        on_delete=models.SET_NULL, 
                                        null=True, 
                                        blank=True, 
                                        related_name='user_data')

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']