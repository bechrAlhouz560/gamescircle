from django.test import Client, TestCase

# Create your tests here.
c = Client()
res = c.post('/accounts/logout',{"username":"accent","password":"zarazara"})

print(res.content)