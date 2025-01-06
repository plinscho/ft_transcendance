from django.urls import path
from user_management import views


urlpatterns = [
    path('list/', views.ListUsersView.as_view()),
]
