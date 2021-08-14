from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import *
from django.views import View
from django.contrib.auth.mixins import LoginRequiredMixin
from django.utils.crypto import get_random_string
from index import models as index_models
from index.models import UserFallowers, UserFallowing


def short_num(number):
    # >
    new = number
    str_num = str(number)
    words = ["k","m","b",'tr']
    if number >= 1000:
       new = str_num[0] +"."+ str_num[1]+words[0]







class Index(LoginRequiredMixin,View):
    login_url = '/accounts/login/'
    redirect_field_name = 'redirect_to'
    def __init__(self):
        pass

    def get(self,request,*args,**kwargs):
        
        if request.user.is_authenticated:
            request.COOKIES['active'] = "me"
            username = request.user.username
            user_infos = index_models.UserInfos.objects.get(user=request.user)
            user_fallowers = UserFallowers.objects.filter(user=request.user).count()
            user_fallowing = UserFallowing.objects.filter(user=request.user).count()
            try:
                from blogs.models import Blog
                blogs_count = Blog.objects.filter(created_by=request.user).count()
            except Exception as err:
                print(err)
                blogs_count = 0
            context = {
                'username': username,
                'fallowers': user_fallowers,
                'fallowing': user_fallowing,
                'stars': user_infos.stars,
                'blogs_count':blogs_count,
                
            }
            return render(request, 'me/index.html', context)
        else:
            return HttpResponseRedirect('/accounts/login/')



class Options(LoginRequiredMixin,View):
    """
    docstring
    """
    login_url = '/accounts/login/'
    redirect_field_name = 'redirect_to'
    def get(self,request,*args,**kwargs):
        return render(request,'me/options.html')




@login_required
def blogs (request):
    if request.method == "POST":
        login_url = '/accounts/login/'
        return render(request,'me/tabs/blogs.html')
    else:
        return HttpResponseNotFound('This Page is not found !')

@login_required
def games (request):
    if request.method == "POST":
        login_url = '/accounts/login/'
        return render(request,'me/tabs/games.html')
    else:
        return HttpResponseNotFound('This Page is not found !')

@login_required
def videos (request):
    if request.method == "POST":
        login_url = '/accounts/login/'
        return render(request,'me/tabs/videos.html')
    else:
        return HttpResponseNotFound('This Page is not found !')
@login_required
def groups (request):
    if request.method == "POST":
        login_url = '/accounts/login/'
        return render(request,'me/tabs/groups.html')
    else:
        return HttpResponseNotFound('This Page is not found !')



