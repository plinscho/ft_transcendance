from django.urls import path
from user_management import views

# The path() function expects at least two arguments: route and view.
urlpatterns = [
    path('create/', views.CreateUserView.as_view()),
    path('token/', views.CreateTokenView.as_view()),
    path('user/', views.RetrieveUpdateUserView().as_view()),
]
