from django.contrib import admin
from django.urls import path, include
from django.contrib.auth import views as auth_views
from . import views
urlpatterns = [
    path('',views.Index.as_view(),name="me"),
    path('options',views.Options.as_view(),name="options"),
    path('blogs',views.blogs,name="me_blogs"),
    path('videos',views.videos,name="me_videos"),
    path('games',views.games,name="me_games"),
    path('groups',views.groups,name="me_groups")
]

