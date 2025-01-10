from django.apps import AppConfig


class UserConfig(AppConfig): # will be used in setting.py
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'user'
