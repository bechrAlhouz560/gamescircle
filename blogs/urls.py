from django.urls import path,include
from . import views


urlpatterns = [
    path('',views.Blogs.as_view(),name="blogs"),
    path('creator/',views.blog_creator,name="blog_creator"),
    path('post/',views.postBlog,name="post_blog"),
    path('get_user_blogs/', views.userBlogs, name="get_user_blogs"),
    path('search/',views.search_blogs,name="search_blog"),
    path('<str:blog_id>/', views.blog, name="blog"),
    path('<str:blog_id>/cover/', views.blog_cover, name="blog_cover"),
    path('<str:blog_id>/cover/change', views.blog_cover_change, name="blog_cover_change"),
    path('<str:blog_id>/can_edit_blog', views.can_edit_blog, name="can_edit_blog"),
    path('<str:blog_id>/comments/create', views.create_comment, name="create_blog_comments"),
    path('<str:blog_id>/comments', views.blog_comments, name="blog_comments"),
    path('<str:blog_id>/comments/count', views.comments_count, name="blog_comments_count"),
    path('<str:blog_id>/comments/<str:comment_id>',
         views.get_comment, name="blog_comment"),
    path('<str:blog_id>/comments/<str:comment_id>/replies',
         views.comment_replies, name="blog_comment_replies"),
    path('<str:blog_id>/comments/<str:comment_id>/reply',
         views.reply_comment, name="reply_comment"),
    path('<str:blog_id>/user_rate', views.user_rate, name="user_rate"),
    path('<str:blog_id>/rate', views.rate_blog, name="rate_blog"),
    path('<str:blog_id>/rates', views.blog_rates, name="blog_rates"),
    path('<str:blog_id>/rates/average', views.average_rate, name="average_rates"),
    path('<str:blog_id>/delete', views.delete_blog, name="delete_blog"),
    path('<str:blog_id>/similar',views.similar_blogs,name="similar_blogs"),
    path('<str:blog_id>/set_viewed',views.add_blog_view,name="set_blog_viewed"),
    path('<str:blog_id>/edit',views.EditBlog.as_view(),name="edit_blog_index"),
    
    
]

