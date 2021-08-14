from django.db import models
from django.contrib.auth import models as auth_models
from datetime import datetime
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.models import Permission



class Blog(models.Model):
    class Meta:
        permissions = [
            (
                'can_add_blog',"can the user create a blog"
            )
        ]
    content = models.TextField(
        "content", help_text="the text content of the blog as an html text")
    cover = models.FileField('cover_image',upload_to="uploads/images/blogs/cover/%y/%m/%d/%h/%M/%S")
    created_by = models.ForeignKey(
        auth_models.User, on_delete=models.CASCADE)
    created_date = models.DateTimeField('created_name', auto_now=True)
    title = models.CharField(
        "content", default="Untitled",max_length=100)
    blog_id = models.CharField(default="", max_length=20)
    views = models.IntegerField(default=0)
class BlogImages (models.Model):
    image = models.FileField('image',upload_to='uploads/images/blogs/%y/%m/%d/%h/%M/%s')
    blog = models.ForeignKey(Blog, on_delete=models.CASCADE)
    blog_image_id = models.CharField(default="", max_length=20)


class BlogComments(models.Model):
    content = models.TextField('content', max_length=300)
    created_date = models.DateTimeField('created_name', auto_now=True)
    # replies = models.ForeignKey(CommentReply, on_delete=models.CASCADE)
    blog = models.ForeignKey(Blog, on_delete=models.CASCADE)
    commented_by = models.ForeignKey(
        auth_models.User, on_delete=models.CASCADE, name='commented_by')
    blog_comment_id = models.CharField( default="", max_length=20)
class CommentReply(models.Model):
    content = models.TextField('content',max_length=300)
    created_date = models.DateTimeField('created_name',auto_now=True)
    comment = models.ForeignKey(BlogComments, on_delete=models.CASCADE) 
    replied_by = models.ForeignKey(
        auth_models.User, on_delete=models.CASCADE, related_name='replied_by')
    blog_comment_reply_id = models.CharField( default="", max_length=20)
    

class BlogRate (models.Model):
    stars_count = models.IntegerField('starts_count',default=0)
    rated_by = models.ForeignKey(
        auth_models.User, on_delete=models.CASCADE, related_name='rated_by')
    created_date = models.DateTimeField('created_name',auto_now=True)
    blog = models.ForeignKey(Blog, on_delete=models.CASCADE) 
    blog_rate_id = models.CharField(default="", max_length=20)





