from django.db import models
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

        return user

    def create_superuser(self, username, email, password):
        user = self.create_user(email, password, username)
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)

        return user
    
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

    # campos para OTP
    otp_code = models.CharField(max_length=6, blank=True, null=True)  # Código OTP (6 dígitos, puedes cambiar el max_length si lo deseas)
    otp_code_expiration = models.DateTimeField(blank=True, null=True)  # Fecha de expiración del OTP

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']