from django.db import models

# Create your models here.
class User(models.Model):
    id = models.IntegerField(primary_key=True)
    nickname = models.CharField(unique=True, max_length=20)
    email = models.EmailField(unique=True, max_length=100)
    password = models.CharField(max_length=30)
    image = models.ImageField()

    