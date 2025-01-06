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
        user = self.model(email=email, **extra_field)
        user.set_password(password)
        user.save(using=self._db)

        return user

    def create_superuser(self, username, email, password):
        user = self.create_user(email, password, username)
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)

        return user
    

class User(AbstractBaseUser,PermissionsMixin):
    email = models.EmailField(unique=True, max_length=100)
    username = models.CharField(max_length=20)
    nickname = models.CharField(unique=True, max_length=20)
    password = models.CharField(max_length=30)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    image = models.ImageField()

    objects = UserManager()

    USERNAME_FIELD = 'email'