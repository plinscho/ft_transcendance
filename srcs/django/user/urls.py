from django.urls import path
from user import views

# The path() function expects at least two arguments: route and view.
urlpatterns = [
    path('signup/', views.CreateUserView.as_view(), name='signup'),
    path('login/', views.CreateTokenView.as_view(), name='login'),
#    path('user/', views.RetrieveUpdateUserView().as_view()),
]
