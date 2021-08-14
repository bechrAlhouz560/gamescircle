from django.test import TestCase

# Create your tests here.
import requests

class IGDB ():
    SECRET_ID = '1cvawnjwhtsxfrpsdk8ka69dgmy4jr'
    CLIENT_ID = 'swkjgyiuwfbo1iyy6q4ef7u48tsohh'
    TOKEN = {}
    base_URL = 'https://api.igdb.com/v4'
    HEADER = {}
    def __init__(self):
        print('Hello World !')
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
    def run (query):
        request = requests.post(IGDB.base_URL + "/artworks",headers=IGDB.HEADER,data=query)
        return request.json();
IGDB.authenticate();
print(IGDB.HEADER);
