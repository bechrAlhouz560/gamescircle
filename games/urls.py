from django.urls import path,include
from games.views import *
urlpatterns = [
    path('',index,name="games_index"),
    path('<str:game_id>/', game, name="game"),

]
