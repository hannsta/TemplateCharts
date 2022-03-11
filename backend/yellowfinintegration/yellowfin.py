import requests 
import time
import json


YELLOWFIN_URL = "http://localhost:8080"
ADMIN_USER = "admin@yellowfin.com.au"
ADMIN_PASSWORD = "test"

def get_time():
    return str(int(round(time.time() * 1000)))


def get_refresh_token():
    API_ENDPOINT = YELLOWFIN_URL+"/api/refresh-tokens"

    headers={'Authorization': 'YELLOWFIN ts='+get_time()+', nonce=12345',
            'Content-Type': 'application/json',
            'Accept':'application/vnd.yellowfin.api-v1+json'}
    data = {
        "userName": "admin@yellowfin.com.au",
        "password": "test",
    }
    r = requests.post(url = API_ENDPOINT, data = json.dumps(data), headers=headers) 
    r_json= json.loads(r.text)
    refresh_token = r_json['securityToken']
    print("Refresh Token Obtained: "+refresh_token)
    return refresh_token


def get_access_token(refresh_token):
    API_ENDPOINT = YELLOWFIN_URL+"/api/access-tokens"
    
    headers={'Authorization': 'YELLOWFIN ts='+get_time()+', nonce=12345, token='+refresh_token,
            'Content-Type': 'application/json',
            'Accept':'application/vnd.yellowfin.api-v1+json'}

    r = requests.post(url = API_ENDPOINT, headers=headers) 
    r_json= json.loads(r.text)
    access_token = r_json['securityToken']
    print("Access Token Obtained: "+access_token)
    return access_token


def get_login_token(access_token):
    API_ENDPOINT = YELLOWFIN_URL+"/api/login-tokens"
    
    headers={'Authorization': 'YELLOWFIN ts='+get_time()+', nonce=12345, token='+access_token,
            'Content-Type': 'application/json',
            'Accept':'application/vnd.yellowfin.api-v1+json'}

    r = requests.post(url = API_ENDPOINT, headers=headers) 
    r_json= json.loads(r.text)
    login_token = r_json['securityToken']
    print("Login Token Obtained: "+login_token)
    return login_token

def get_signals(access_token):
    API_ENDPOINT = YELLOWFIN_URL+'/api/signals?limit=10&textFormatType=HTML'

    headers={'Authorization': 'YELLOWFIN ts='+get_time()+', nonce=12345, token='+access_token,
            'Content-Type': 'application/json',
            'Accept':'application/vnd.yellowfin.api-v1+json'}

    r = requests.get(url = API_ENDPOINT, headers=headers) 
    r_json= json.loads(r.text)
    return r_json
