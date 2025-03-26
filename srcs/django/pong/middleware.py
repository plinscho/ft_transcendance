from urllib.parse import parse_qs
from channels.middleware import BaseMiddleware #Clase proporcionada por channels para crear middleware personalizado
from channels.db import database_sync_to_async #Para ejecutar funciones sincronas en un entorno asincrono
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model
from django.db import close_old_connections
from django.apps import apps
import logging

User = get_user_model() #get_user_model() devuelve el modelo de usuario que se está utilizando en el proyecto
logger = logging.getLogger(__name__)

@database_sync_to_async
def get_user(token):
    try:
        access_token = AccessToken(token) #Decodificamos el JWT enviado por el cliente
        user = User.objects.get(id=access_token['user_id'])
        return user
    except Exception as e:
        return None

class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, recieve, send):
        close_old_connections() # Cerrar conexiones antiguas a la base de datos
        query_string = parse_qs(scope['query_string'].decode()) #parse_qs convierte una cadena de consulta en un diccionario
        token = query_string.get('authToken')
        if token:
            user = await get_user(token[0])
            if user:
                logger.debug(f"User authenticated: {user}")
                scope['user'] = user
            else:
                logger.debug("User not authenticated")
        else:
            logger.debug("No token found")
        #El super().__call__ llama al siguiente middleware en la cadena de middleware (Va a la clase BaseMiddelware)
        return await super().__call__(scope, recieve, send)

