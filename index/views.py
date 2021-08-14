from django.shortcuts import render
from django.views import View
from django.views.decorators import csrf,http
from django.template import Template
from django.http import *
import datetime
from django.contrib.auth import SESSION_KEY,authenticate,login
from django.contrib.auth import models as auth_models
from me import views as me_views
# required models 
from . import models
from blogs import models as blog_models
from django.core.files import File
import json

# Create your views here.

MAIN_ERRORS = {
    "USER_ALREADY_FALLOWING_BY":"This User is already fallowed by you",

}

def create_init_permissions (user):
    from django.contrib.contenttypes.models import ContentType
    from django.contrib.auth.models import Permission
    from blogs.models import Blog
    content_type = ContentType.objects.get_for_model(Blog, for_concrete_model=False)
    blog_perms = Permission.objects.filter(content_type=content_type)
    for perm in blog_perms:
        user.user_permissions.add(perm)
    

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
    


class Index (View):
    def __init__(self):
        pass
    def get (self,request,*args,**kwargs):
        count = auth_models.User.objects.count()
        context = {
            "name":datetime.datetime(2021,2,28,16,30,20),
            "users_count":count
        }
        return render(request,"index/index.html",context)
class Login (View):
    def __init__ (self):
        pass
    def get (self,request,*args,**kwargs):
        if request.user.is_authenticated:
            return HttpResponseRedirect('/me')
        else:
            return render(request, 'registration/login.html')
    def post (self,request,*args,**kwargs):
        username = request.POST["username"]
        password = request.POST["password"]
        try:
            u = auth_models.User.objects.get(username=username)
            print(u)
        except BaseException as identifier:
            print(identifier)
            pass

        if username !="" and password !="":
            try:
                
                user = authenticate(
                    request, username=username, password=password)
                if user is not None:
                    login(request, user)
                    redirect_to = request.GET.get('redirect_to') or '/me'
                    return HttpResponseRedirect(redirect_to)
        # Redirect to a success page.
                else:
                    return render(request, 'registration/login.html',{'error':'your username or password is incorrect'})
                
            except BaseException as error:
                return render(request, 'registration/login.html',{'error':'your username or password is incorrect'})

        else:
           
            return render(request, 'registration/login.html', {'error': "please enter username and password."})
class Signup (View):
    def __init__(self):
        pass
    
    def get (self,request,*args,**kwargs):
        if request.user.is_authenticated:
            return HttpResponseRedirect('/me')
        else:
            return render(request, 'registration/signup.html')
    def post (self,request,*args,**kwargs):
        username = request.POST['username']
        email = request.POST['email']
        password = request.POST['password']
        re_passwd = request.POST['re-password']
        if email !="" and password !="" and username != '':
           if password == re_passwd:
               user = auth_models.User.objects.create_user(
                   username, email, password)
               user_info = models.UserInfos(user=user,profile_img='uploads/bg_profile.png')
               # add permissions to the new user
               user_info.save()
               create_init_permissions(user)
               login(request, user)
               redirect_to = request.GET.get('redirect_to') or '/me'
               return HttpResponseRedirect(redirect_to)

           else:
                return render(request, 'registration/signup.html', {'error': "the two passwords don't match each other."})
        else:
            return render(request, 'registration/signup.html', {'error': "please enter the required inputs."})



class user(View):
    """
    docstring
    """

    def get(self, request, user_id,*args, **kwargs):
        if user_id != request.user.username:
            try:
                user_profile = auth_models.User.objects.get(username=user_id)
                user_infos = models.UserInfos.objects.get(user=user_profile)
                user_blogs_count = blog_models.Blog.objects.filter(created_by=user_profile).count()
                user_fallowers = models.UserFallowers.objects.filter(
                    user=user_profile).count()
                user_fallowing = models.UserFallowing.objects.filter(
                    user=user_profile).count()

                context = {
                    'username': user_profile.username,
                    'fallowers': user_fallowers,
                    'fallowing': user_fallowing,
                    'stars': user_infos.stars,
                    "blogs_count":user_blogs_count,
                    "can_fallow": True
                }
                return render(request, 'index/user/index.html', context)
            except Exception as identifier:
                return HttpResponse(identifier)
        else:
            return me_views.Index().get(request)
       
    def help (self,request):
        return HttpResponse('Set cool !')


   
   
def fallow(request,user_id):
    if (request.method == "POST" and request.user):
        user = request.user
        req = user_id
        fallowed_user = auth_models.User.objects.get(username=req)
        is_fallowed = models.UserFallowers.objects.filter(user=fallowed_user,fallower=user)
        print(is_fallowed.count())
        if is_fallowed.count() == 0:
           models.UserFallowers.objects.create(
               user=fallowed_user, fallower=user)
           models.UserFallowing.objects.create(
                user=user, fallowing=fallowed_user)
           msg = {
               'success':"You're now fallowing " + fallowed_user.username + " successfuly !"
           }
        else:
            msg = {
                "error": MAIN_ERRORS['USER_ALREADY_FALLOWING_BY']
            }
        return JsonResponse(msg)
        
    else:
        return HttpResponseNotFound('This Page is Not Found')
     


class user_profile_img (View):
    def get(self, request,user_id,*args, **kwargs):
        
        return HttpResponse('Hello World ! this is the main search')
    @classmethod
    def change (cls,request,user_id):
        return HttpResponse('Change !')


def is_authenticated (request):
    user = request.user
    if (user.is_authenticated):
        return JsonResponse({
            "message":"success",
            "username":user.username
        })
    else:
        return JsonResponse({
            "message":"error",
            "username":"this user didn't log in"
        })
