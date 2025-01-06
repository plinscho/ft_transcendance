from django.apps import AppConfig


class UserManagementConfig(AppConfig): # will be used in setting.py
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'user_management'
