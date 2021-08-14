from django.shortcuts import render
from django.views import View
from django.contrib.auth.mixins import LoginRequiredMixin,PermissionRequiredMixin
from django.contrib.auth.decorators import login_required,permission_required
from django.views.decorators.http import require_http_methods
from django.http import *
from .models import *
from django.utils.crypto import get_random_string


# for handling errors
from django.utils.datastructures import MultiValueDictKeyError
import json
from django.template import Context, Template
from index.models import UserInfos



def naturaltime(date):
    temp = Template("{%load humanize%}{{date|naturaltime}}")
    _time = temp.render(Context({"date":date}))
    return _time
def intword(integer):
    temp = Template("{%load humanize%}{{integer|intword}}")
    _time = temp.render(Context({"integer":integer}))
    return _time
    pass
def set_stars_count (user,count):
    infos = UserInfos.objects.get(user=user)
    infos.stars = str(int(count) + infos.stars)

    print("infos.stars = ",  infos.stars)
    infos.save()

# Create your views here.
class Blogs (LoginRequiredMixin,View):
    def get (self,request,*args,**kwargs):
        return render(request,'soon.html')


@login_required(login_url='/accounts/login/')
# @permission_required('blogs.can_add_blog',login_url='/accounts/login/')
@require_http_methods(['GET'])
def blog_creator (request):
    cc = request.user
    print(request.user, ' has this perm : ',cc)
    return render(request,'blogs/creator/index.html')

@require_http_methods(['POST'])
@login_required(login_url='/accounts/login/')
def postBlog (request):
    user = request.user
    has_perm = user.has_perm('blogs.can_add_blog')
    if has_perm:
        try:
            title = request.POST['title']
            content = request.POST['content']
            file = request.FILES['imageFile']
            blog_id = get_random_string(15)
            Blog.objects.create(title=title,content=content,cover=file,created_by=request.user,blog_id=blog_id)
            return JsonResponse({"message":"your blog posted successfuly !"})
        except MultiValueDictKeyError as error:
            errors =  {
                "imageFile":"Please Insert an image file for the cover.",
                "title":"Please type a suitable title for the blog.",
                "content":"Please type you blog content for your blog."
            }
            key_error = error.__str__().replace('\'','')
            return JsonResponse({"error": errors[key_error]})
        else:
            return JsonResponse({"error": "Oops There are an Error in the server. Please try again later..."})
    else:
        return JsonResponse({"error": "Sorry, You don't have the permission to post a blog anymore"})

@require_http_methods(['POST','GET'])
@login_required(login_url='/accounts/login/')
def userBlogs (request):
    body = json.loads(request.body)
    limit = body['limit']
    username = body['username']
    user = auth_models.User.objects.get(username=username)

    try:
        cc = b'bechr'

        order_by_date = json.loads(request.body)['order_by_date']
    except BaseException as err:
        print(err)
        order_by_date = False
    def blogModel(blog,comments,rates):
        list_comments = []
        list_rates = []
        for comment in comments:
            jsonModel = {
                "content":comment.content,
                "commented_by":comment.commented_by.username,
                "created_date":comment.created_date,
                "blog":comment.blog.blog_id,
                "id":comment.blog_comment_id
            }
            list_comments.append(jsonModel)
        for rate in rates:
            jsonModel = {
                "stars":rate.stars_count,
                "rated_by":rate.rated_by.username,
                "created_date":rate.created_date,
                "blog_rate_id": rate.blog_rate_id
            }
            list_rates.append(jsonModel)
        models = {
            "title":blog.title,
            "content":blog.content,
            "file":blog.cover.url,
            "comments":list_comments,
            "rates":list_rates,
            "blog_id":blog.blog_id
        }
        return models
    blogs = {

    }
    if (limit == 0):
        user_blogs = Blog.objects.filter(created_by=user).order_by('-created_date')
    else:
        user_blogs = Blog.objects.filter(created_by=user).order_by('-created_date')[:limit]

    for blog in user_blogs:
        blog_comments = BlogComments.objects.filter(blog=blog)
        blog_rates = BlogRate.objects.filter(blog=blog)
        model = blogModel(blog,blog_comments,blog_rates)
        if order_by_date:
            temp = Template("{%load humanize%}{{date|naturaltime}}")
            context = Context({"date":blog.created_date})
            date = temp.render(context)
            if (blogs.get(date)):
                blogs[date].append(model)
            else:
                blogs[date] = [model]
        else:
             if not blogs.get('blogs'):
                 blogs["blogs"] = []

             blogs["blogs"].append(model)

    if order_by_date:
        _list = list(blogs)
        blogs["blogs"] = []

        for i in _list:
            blogs["blogs"].append({
                "date": i,
                "blogs": blogs[i]
            })
        del blogs[i]


    return JsonResponse(blogs)


def blog (request,blog_id):
    user = request.user
    try:
        blog = Blog.objects.get(blog_id=blog_id)
        context = {
            "title":blog.title,
            "blog_content":blog.content,
            "created_by":blog.created_by.username,
            "blog_image":'/blogs/'+blog_id+'/cover',
            "created_date":blog.created_date,
            "blog_id": blog_id,
            "views":intword(blog.views)
        }
        if (request.method == "GET"):
            return render(request,'blogs/blog/index.html',context)

        else:
            return JsonResponse(context)
    except BaseException as error:
        return HttpResponse(error)
    return HttpResponse(blog.content)

def blog_cover (request,blog_id):
    user = request.user
    try:
        blog = Blog.objects.get(blog_id=blog_id)
        file = blog.cover
    except BaseException as error:
        return HttpResponse(error)

    return FileResponse(file)

@login_required(login_url='/accounts/login/')
@require_http_methods(['POST'])
def blog_comments (request,blog_id):
    body = json.loads(request.body)
    limit = body['count']
    start_with = body['start_with']

    blog = Blog.objects.filter(blog_id=blog_id)
    comments = BlogComments.objects.exclude(pk__in=start_with).filter(
        blog=blog[0]).order_by('-id')[:limit]
    list_comments = {
        "comments":[],
        "count": BlogComments.objects.filter(blog=blog[0]).count()
    }
    for comment in comments:

        temp = Template("{%load humanize%}{{date|naturaltime}}")
        date = temp.render(Context({"date":comment.created_date}))
        replies_counts = CommentReply.objects.filter(comment=comment).count()
        list_comments['count'] += replies_counts
        jsonModel = {
            "content":comment.content,
            "commented_by":comment.commented_by.username,
            "created_date": date,
            "blog":comment.blog.blog_id,
            "id":comment.blog_comment_id,
            "replies_count": replies_counts,
            "pk":comment.pk
        }
        list_comments['comments'].append(jsonModel)
    return JsonResponse(list_comments)



def comment_replies (request,blog_id,comment_id):
    comment = BlogComments.objects.get(blog_comment_id=comment_id)

    replies = CommentReply.objects.filter(comment=comment)

    list_comment_replies = {
        "comment_replies":[]
    }

    for reply in replies:
        jsonModel = {
            "content":reply.content,
            "created_date": naturaltime(reply.created_date),
            "reply_id":reply.blog_comment_reply_id,
            "replied_by":reply.replied_by.username,
            "count": replies.count()
        }
        list_comment_replies['comment_replies'].append(jsonModel)

    return JsonResponse(list_comment_replies)

def reply_comment (request,blog_id,comment_id):
    body = json.loads(request.body)
    reply_content = body['reply_content']
    replied_by = request.user
    comment = BlogComments.objects.filter(blog_comment_id=comment_id)
    reply = CommentReply.objects.create(comment=comment[0], content=reply_content, replied_by=replied_by,
    blog_comment_reply_id=get_random_string(20)
    )
    return JsonResponse({
        "content": reply.content,
        "created_date": naturaltime(reply.created_date),
        "reply_id": reply.blog_comment_reply_id,
        "replied_by": reply.replied_by.username,
        "replies_count": CommentReply.objects.filter(comment=comment[0]).count()
    })

def comments_count (blog_id):
    blog = Blog.objects.get(blog_id=blog_id)
    comments = BlogComments.objects.filter(blog=blog).count()
    return JsonResponse({'comments_count':comments})
@require_http_methods(['POST'])
@login_required(login_url='/accounts/login/')
def blog_cover_change (request,blog_id):
    user = request.user
    try:
        blog = Blog.objects.get(created_by=user,blog_id=blog_id)
        old_cover = blog.cover
        new_cover = request.FILES['new_blog_cover']
        blog.cover = new_cover
        blog.save()

    except BaseException as error:
        return HttpResponse(error)

    return JsonResponse({"message":"you're blog cover changed successfuly !"})


@login_required(login_url="/account/login")
@require_http_methods(['POST'])
def can_edit_blog (request,blog_id):
    try:
        user = request.user
        blog = Blog.objects.filter(created_by=user,blog_id=blog_id)
        if (blog):
            return JsonResponse({"can_edit_blog":True})
        else:
            return JsonResponse({"can_edit_blog":False})
    except BaseException as err:
        return JsonResponse({"err":err})

def create_comment (request,blog_id):
    user = request.user
    blog = Blog.objects.filter(blog_id=blog_id)[0]
    try:
        body =  json.loads(request.body)
        content = body['content']
        tagged = body['tagged']
        print(tagged)
        comment = BlogComments.objects.create(blog_comment_id=get_random_string(20),blog=blog,commented_by=user,content=content)
        return JsonResponse({"success":"your comment created successfuly.","id":comment.blog_comment_id})
    except BaseException as err:
        print(err)
        return JsonResponse({"err":"Oops ! there are an error please try again."})


@login_required(login_url="/account/login")
@require_http_methods(['POST'])
def get_comment (request,blog_id,comment_id):
    comment =  BlogComments.objects.filter(blog_comment_id=comment_id,blog=Blog.objects.get(blog_id=blog_id))
    if (comment.count() != 0):
        jsonModel = {
            "content":comment[0].content,
            "commented_by":comment[0].commented_by.username,
            "created_date": naturaltime(comment[0].created_date),
            "blog":comment[0].blog.blog_id,
            "id":comment[0].blog_comment_id
        }
    else:
        jsonModel = {}
    return JsonResponse(jsonModel)

@login_required(login_url="accounts/login/")
def user_rate (request,blog_id):
    user = request.user
    blog = Blog.objects.filter(blog_id=blog_id)
    if (blog.count() != 0):
        rate = BlogRate.objects.filter(blog=blog[0],rated_by=user)

        if (rate.count() != 0):
            print(rate[0].stars_count)
            jsonModel = {
                "rated_by": user.username,
                "blog_id": blog[0].blog_id,
                "stars": rate[0].stars_count
            }
            return JsonResponse(jsonModel)
        else:
            return JsonResponse({"error":"this user didn't rate yet."})
    else:
        return JsonResponse({'error':"this blog doesn't found. maybe it removed or it is a private blog..."})

def rate_blog (request,blog_id):
    user = request.user
    blog = Blog.objects.filter(blog_id=blog_id)
    if (blog.count() != 0):
        try:
            body = request.body
            stars_count = json.loads(body)['stars_count']
            print('stars_count = ',stars_count)
            rate = BlogRate.objects.filter(blog=blog[0],rated_by=user)

            if (rate.count() == 0):
               rate = BlogRate.objects.create(blog=blog[0],rated_by=user,stars_count=stars_count)


               stars_count = rate.stars_count
            else:
                rate = BlogRate.objects.get(blog=blog[0],rated_by=user)
                rate.stars_count = stars_count
                rate.save()
                stars_count = rate.stars_count
            set_stars_count(user,stars_count)

            jsonModel = {
                "rated_by": user.username,
                "blog_id": blog[0].blog_id,
                "stars_count": stars_count
            }
            return JsonResponse(jsonModel)
        except BaseException as err:
            print(err)
            return JsonResponse({"error":'Oops ! there are an error. please try again later...'})
    else:
        return JsonResponse({'error': "this blog doesn't found. maybe it removed or it is a private blog..."})


def blog_rates (request,blog_id):
    user = request.user
    blog = Blog.objects.filter(blog_id=blog_id)
    if (blog.count() != 0):
       rates = BlogRate.objects.filter(blog=blog[0]).order_by('-created_date')
       if (rates.count() != 0):
            blog_rates = {
                "rates":[

                ],
                "count": rates.count()
            }
            for rate in rates:
               json_model = {
                   "rated_by": rate.rated_by.username,
                   "blog_id": blog[0].blog_id,
                   "stars_count": rate.stars_count,
                   "created_date":rate.created_date,
                   "blog_rate_id": rate.blog_rate_id
               }
               blog_rates['rates'].append(json_model)

            return JsonResponse(blog_rates)
       else:
           return JsonResponse({"error": "this blog didn't rated by any user yet."})
    else:
        return JsonResponse({'error': "this blog doesn't found. maybe it removed or it is a private blog..."})


def average_rate (request,blog_id):
    user = request.user
    blog = Blog.objects.filter(blog_id=blog_id)
    if (blog.count() != 0):
        rates = BlogRate.objects.filter(blog=blog[0])
        rates_count = BlogRate.objects.filter(blog=blog[0]).count()
        if (rates_count != 0):
            list_stars_count = 0
            for rate in rates:
                num = rate.stars_count
                list_stars_count += num

            return JsonResponse({
                "stars":(list_stars_count/rates_count)
            })
        else:
            return JsonResponse({"error": "this blog didn't rated by any user yet.","stars":0})
    else:
        return JsonResponse({'error': "this blog doesn't found. maybe it removed or it is a private blog...","stars":0})

@require_http_methods(['POST'])
def delete_blog (request,blog_id):
    user = request.user
    if (user.is_authenticated):
        blog = Blog.objects.filter(created_by=user,blog_id=blog_id)
        if blog.count() != 0:
            blog[0].delete()
            msg = {
                "success":"this Blog is removed successfuly"
            }
        else:
            msg = {'error': "this blog doesn't found. maybe it has been removed or it is a private blog...",}
        return JsonResponse(msg)


@require_http_methods(['POST'])
def add_blog_view (request,blog_id):
    blog = Blog.objects.get(blog_id=blog_id)
    user = request.user
    msg = {

    }
    try:
        if user.username != blog.created_by.username:
            blog.views = blog.views + 1
            blog.save()

            msg = {
                "message":"success",
                "views":intword(blog.views)
            }
    except BaseException as error:
        print(error)
        msg = {'message': "error","content":"this "}
    return JsonResponse(msg)
# make it more affective
def similar_blogs(request,blog_id):
    _blog = Blog.objects.get(blog_id=blog_id)
    blogs_filtered = Blog.objects.filter(title__contains=_blog.title).order_by("created_date")[:5]

    response = {
        "similar_blog":[

        ],
        "count":blogs_filtered.count()
    }
    for blog in blogs_filtered:
        if (blog.blog_id != _blog.blog_id):
            context = {
                "title":blog.title,
                "blog_content":blog.content,
                "created_by":blog.created_by.username,
                "blog_image":'/blogs/'+blog_id+'/cover',
                "created_date":blog.created_date,
                "blog_id": blog_id
            }
            response['similar_blog'].append(context)
    return JsonResponse(response)

def search_blogs (request,):
    return JsonResponse ({
        "Hello":"this is the search response !"
    })




class EditBlog (LoginRequiredMixin,View):
    def get (self,request,blog_id,*args,**kwargs):
        user = request.user
        blog = Blog.objects.get(blog_id=blog_id)

        print('blog = ',blog.id)
        return render(request,'blogs/blog/edit.html')
