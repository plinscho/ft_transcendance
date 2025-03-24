from django.urls import path
from user import views

# The path() function expects at least two arguments: route and view.
urlpatterns = [
    path('signup/', views.CreateUserView.as_view(), name='signup'), # POST
    path('login/', views.LoginUserView.as_view(), name='login'),
    path('verify/', views.VerifyUserView.as_view(), name='verify'), # Recibimos un auth token y yo devuelvo un 200 si el token coincide o un error si no
    path('data/', views.PopulateUserDataView.as_view(), name='data'), # GET Recibimos el auth token y devolvemos username, mail, lo que sea.
    path('2fa/', views.Verify2FACodeView.as_view(), name='2fa'), # POST Para verificar el código de 2FA
    path('generate-2fa/', views.Generate2FACodeView.as_view()),
    path('update-language/', views.UpdateUserLanguageView.as_view(), name='update-language'),  # PATCH Recibimos el language a actualizar y devolvemos los datos actualizados del usuario
]