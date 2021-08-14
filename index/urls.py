from django.urls import path,include
from . import views
from index.views import Login,Signup
from blogs import views as blogs_views

urlpatterns = [
    path('', views.Index.as_view()),
    path('home/',include('home.urls')),
    path('accounts/login/', Login.as_view(), name="login"),
    path('accounts/signup/', Signup.as_view(), name="signup"),
    path('me/',include('me.urls')),
    path('user/<str:user_id>', views.user.as_view(), name="user"),
    path('user/<str:user_id>/fallow', views.fallow, name="fallow_user"),
    path('user/<str:user_id>/profile_img', views.user_profile_img.as_view(), name="profile_img"),
    path('user/<str:user_id>/profile_img/change', views.user_profile_img.change, name="profile_img"),
    # path('search/',include("search.urls")),
    path('blogs/', include('blogs.urls')),
    path('is_authenticated/',views.is_authenticated),
    path('search/',include('search.urls')),
    path('games/',include('games.urls'))
]
