from django.shortcuts import render
from django.http import JsonResponse

# Create your views here.

def index (request):
    if (request.method == "POST"):
        return JsonResponse({"hello":'to home'})
    else:
        return render(request,'soon.html')
