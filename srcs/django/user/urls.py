from django.urls import path
from user import views

# The path() function expects at least two arguments: route and view.
urlpatterns = [
    path('signup/', views.CreateUserView.as_view(), name='signup'), # POST
    path('login/', views.CreateTokenView.as_view(), name='login'),
    path('verify/', views.VerifyUserView.as_view(), name='verify'), # Recibimos un auth token y yo devuelvo un 200 si el token coincide o un error si no
    path('data/', views.PopulateUserDataView.as_view(), name='data') # GET Recibimos el auth token y devolvemos username, mail, lo que sea.
]
