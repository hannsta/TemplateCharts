"""backend URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from datetime import datetime
from yellowfinintegration import views
from django.urls import include, path


urlpatterns = [
    path('csrf', views.csrf, name='csrf'),
    path('save_template',views.save_template, name='save_template'),
    path('get_script',views.get_script, name='get_script'),    
    path('get_templates',views.get_templates, name='get_templates'), 
    path('get_template',views.get_template, name='get_template'),       
    path('addUser', views.addUser, name='addUser'),
    path('loginUser', views.loginUser, name='loginUser'),
    path('logoutUser',views.logoutUser, name='logoutUser'),
]
