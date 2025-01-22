from django.urls import path
from . import views

urlpatterns = [
    path('pong/<str:room_name>/', views.room, name='room'),
]