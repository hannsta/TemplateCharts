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
    refresh_token = request.GET.get('refresh_token')
    access_token = yellowfin.get_access_token(refresh_token)
    data = json.dumps(access_token)
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