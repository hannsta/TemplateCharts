from django.shortcuts import render
from . import yellowfin
import json
from django.shortcuts import render
from django.http import HttpRequest
from django.http import HttpResponseRedirect
from django.http import HttpResponse

# Create your views here.
def get_refresh_token(request):
    refresh_token = yellowfin.get_refresh_token()
    data = json.dumps(refresh_token)
    return HttpResponse(data, content_type='application/json')


def get_access_token(request):
    #The request from the client side should contain an refresh token. Retreive this
    refresh_token = request.GET.get('refresh_token')
    #Make the API call to Yellowfin using the method defined in the yellowfin.py file
    access_token = yellowfin.get_access_token(refresh_token)
    #Turn the access token into a JSON Object
    data = json.dumps(access_token)
    #Send this back to the client
    return HttpResponse(data, content_type='application/json')


def get_login_token(request):
    access_token = request.GET.get('access_token')
    login_token = yellowfin.get_login_token(access_token)
    data = json.dumps(login_token)
    return HttpResponse(data, content_type='application/json')

def get_signals(request):
    access_token = request.GET.get('access_token')
    signals = yellowfin.get_signals(access_token)
    data = json.dumps(signals)
    return HttpResponse(data, content_type='application/json')

def test(request):
    data = json.dumps({
        'test':'true'
    })
    return HttpResponse(data, content_type='application/json')