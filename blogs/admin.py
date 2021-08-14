from django.contrib import admin
from . import models
# Register your models here.
admin.site.register(models.Blog)
admin.site.register(models.BlogImages)
admin.site.register(models.BlogComments)
admin.site.register(models.CommentReply)
admin.site.register(models.BlogRate)

