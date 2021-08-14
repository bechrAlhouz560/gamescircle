from django.test import TestCase
from django.contrib.auth import models as auth_models
from . import models
from django.utils.crypto import get_random_string
from index import models as index_models
import random


def user_creator (number):
    for i in range(number + 1):
        username = get_random_string(10)
        print('creating ',username,"... num : ",i)
        password = get_random_string(20)
        email = get_random_string(10) + "@gmail.com"
        user = auth_models.User.objects.create_user(
            username, email, password)
        user_info = index_models.UserInfos(
            user=user, profile_img='uploads/bg_profile.png')
        # add permissions to the new user
        user_info.save()

def random_rates_creator(blog_id,number):
    try:
        for i in range(number+1):
            print('rating...')
            index = random.randint(0, auth_models.User.objects.all().count())
            user = auth_models.User.objects.get(id=index)
            blog = models.Blog.objects.filter(blog_id=blog_id)
            stars = random.randint(0,5)
            models.BlogRate.objects.create(
                blog=blog[0], stars_count=stars, rated_by=user)
            print(user.username,'rated with ',stars," stars")
    except BaseException as err:
            print('error: ',err)
            pass



def random_comment_creator(blog_id, number):
    for i in range(number+1):
        try:
            print('commenting...')
            index = random.randint(0, auth_models.User.objects.all().count())
            user = auth_models.User.objects.get(id=index)
            blog = models.Blog.objects.get(blog_id=blog_id)
            comment = get_random_string(random.randint(0, 100))
            blog_comment = models.BlogComments(
                blog=blog, commented_by=user, content=comment,blog_comment_id=get_random_string(20))
            blog_comment.save()
            random_replies(blog_comment.blog_comment_id,random.randint(1,5))
            print(user.username, ' commented ')
        except BaseException as err:
            print('error: ',err)

def random_replies (comment_id,number):
    for i in range(number):
        index = random.randint(0, auth_models.User.objects.all().count())
        user = auth_models.User.objects.get(id=index)
        comment = models.BlogComments.objects.filter(blog_comment_id=comment_id)[0]
        reply = models.CommentReply.objects.create(
            replied_by=user, comment=comment, content=get_random_string(random.randint(10,50)),blog_comment_reply_id=get_random_string(20))


def translate (text,src_lang=None,trg_lang=None):
    from requests import get
    from urllib import parse
    MAIN_URL = "http://www.worldlingo.com/S000.1/api"
    PASSWORD = "secret"

    if (src_lang==None):
        src_lang = "auto"
    args = {
        "wl_trglang": trg_lang,
        "wl_data":text,
        "wl_srclang":src_lang,
        "wl_password":PASSWORD,
        "wl_mimetype":"text/xml"
    }
    response = get(MAIN_URL,params=args).text
    return response.split("0",1)[1]



print(translate('hello world','en','ar'))
