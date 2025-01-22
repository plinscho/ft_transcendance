from django.shortcuts import render

# Se puede usar para manejar solicitudes HTTP tradicionales como cargar la pagina del juego (HTML + JS)
# También se puede usar para renderizar la página inicial donde se encuentra el Pong
def room(request, room_name):
    return render(request, 'room.html', {'room_name': room_name})