from django.db import models
from django.contrib.auth import models as auth_models
from django.utils.translation import gettext_lazy as _
# Create your models here.

SEARCH_TYPE_CHOICES = [
    ('BG',"Blogs"),
    ('GMR',"Gamers"),
    ('GM',"Games"), #coming soon !
    ('VD',"Videos") #coming soon !
]


class SearchHistory (models.Model):
    def __init__(self):
        pass
    content = models.CharField("content",max_length=50)
    date = models.DateTimeField('date', auto_now=True)
    user = models.ForeignKey(auth_models.User, on_delete=models.CASCADE, name='user')
    type = models.CharField("search_type",choices=SEARCH_TYPE_CHOICES,max_length=3,default="BG")
