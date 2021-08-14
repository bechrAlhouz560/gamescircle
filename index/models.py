from django.db import models
from django.contrib.auth import models as auth_models 
from django.core.files import File
from django.utils.crypto import get_random_string

# Create your models here.

def default_file():
    f = open('uploads/test.jpg')
    file = File(f)
    return file
class UserInfos (models.Model):
    fallowers = models.IntegerField(
        default=0, help_text="the number of fallowers the user has.")
    fallowing = models.IntegerField(
        default=0, help_text="the number of users the user is fallowing.")
    stars = models.IntegerField(
        default=0, help_text="the number of stars the user have gained.")
    user = models.ForeignKey(auth_models.User, on_delete=models.CASCADE)
    profile_img = models.FileField(
        'profile_img', upload_to='uploads/%Y/%m/%d/')
    official = models.BooleanField(default=False,help_text="whether this account is official or not.")
    _id = models.CharField(default=get_random_string(15),max_length=15)
    
class UserFallowers(models.Model):
    user = models.ForeignKey(auth_models.User, on_delete=models.CASCADE,related_name="user_fallowed")
    fallower = models.ForeignKey(auth_models.User, on_delete=models.CASCADE)
    time =  models.DateTimeField('time',auto_now=True)


class UserFallowing(models.Model):
    user = models.ForeignKey(
        auth_models.User, on_delete=models.CASCADE, related_name="user_fallowing")
    fallowing = models.ForeignKey(
        auth_models.User, on_delete=models.CASCADE,)
    time = models.DateTimeField('time', auto_now=True)
