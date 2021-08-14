from django.shortcuts import render
from django.views import View
from django.contrib.auth.decorators import login_required,permission_required
from django.views.decorators.http import require_http_methods
from django.http import *
from django.contrib.auth import models as auth_models
from blogs import models as blog_models
from . import models as  search_models
import json
# Create your views here.


# Search Engine
def index(request):
        """
        docstring
        """
        return HttpResponse('Hello World ! this is the main search')


@login_required
@require_http_methods(['POST'])
def users(request):
        query = request.POST.get('user_query') or json.loads(request.body).get('value')
        if query:

            user_results = auth_models.User.objects.filter(
                username__contains=query)
            List = []
            for i in user_results:
                obj = {
                    "username": i.username,
                    "E-mail": i.email
                }
                List.append(obj)
            search_models.SearchHistory.objects.create(content=query,type='GMR',user=request.user)
            return JsonResponse({"users": List})
        else:
            return JsonResponse({"blogs": ['no request for you ! because user_query is None']})


@login_required
@require_http_methods(['POST'])
def blogs (request):
        query = request.POST.get('blog_query') or json.loads(request.body).get('value')
        print(query)
        if (query):
            blog_results = blog_models.Blog.objects.filter(title__contains=query)

            List = []
            for blog in blog_results:
                obj = {
                    "content":blog.content,
                    "title":blog.title,
                    "created_by":blog.created_by.username,
                    "_id":blog.blog_id,
                    
                }
                List.append(obj)
            search_models.SearchHistory.objects.create(type='BG',user=request.user,content=query)
            return JsonResponse({"blogs": List})
        else:
            return JsonResponse({"blogs": ['no request for you ! because blog_query is None']})

@login_required
@require_http_methods(['POST'])
def videos (request,query):
    # coming soon !!
    return HttpResponse(query + " is here !")
