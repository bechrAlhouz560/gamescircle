from django.urls import path,include
from . import views
urlpatterns = [
    path('',views.index,name="search_index"),
    path('users/',views.users,name="users_search"),
    path('blogs/',views.blogs,name="blogs_search")
    # path('videos/',views.users,name="videos_search") is coming soon
    # path('games/',views.users,name="games_search") is coming soon with videos search !
]