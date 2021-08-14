from django.shortcuts import render
from django.http import *
import requests

# the IGDB API
class IGDB ():
    SECRET_ID = '1cvawnjwhtsxfrpsdk8ka69dgmy4jr'
    CLIENT_ID = 'swkjgyiuwfbo1iyy6q4ef7u48tsohh'
    TOKEN = {}
    base_URL = 'https://api.igdb.com/v4'
    HEADER = {}

    @staticmethod
    def authenticate ():
        request = requests.post('https://id.twitch.tv/oauth2/token?client_id='+IGDB.CLIENT_ID+'&client_secret='+IGDB.SECRET_ID+'&grant_type=client_credentials')
        IGDB.TOKEN = request.json()
        IGDB.HEADER = {
            'Client-ID':IGDB.CLIENT_ID,
            'Authorization':IGDB.TOKEN['token_type'].capitalize()+ ' '+IGDB.TOKEN['access_token']
        }
        return request
    @staticmethod
    def run (endpoint,query):
        request = requests.post(IGDB.base_URL + "/"+endpoint,headers=IGDB.HEADER,data=query)
        return request.json();
    def webhook (endpoint):
        request = requests.post(IGDB.base_URL + "/"+endpoint+"/webhooks",headers=IGDB.HEADER,data={
            "url": "https://www.google.com/",
            "method":"create",
            "secret":"ilovescotchyscotch"

        })
        return request.json();
# start the authentication
IGDB.authenticate();

def get_game_by_id (id):
    result = IGDB.run('games','fields *; where id ='+str(id)+';')
    return result

def get_popular(request):

    pass

def index(request):
    content = IGDB.run('games','fields *; search "battlefield"; where rating != null ;limit 50;')
    hook = IGDB.webhook('games')
    print(hook)
    return render(request,'games/index.html',{
        'content':content
    })

def game (request,game_id):
    game_json = get_game_by_id(game_id)
    content = IGDB.run('platforms','fields *; search "playstation";limit 10;')
    print(content)
    return render(request,'games/game.html',{
        "content" : content
    })
