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
    path('get_widget',views.get_widget, name='get_widget'),       
    path('get_widgets',views.get_widgets, name='get_widgets'),       
    path('save_widget',views.save_widget, name='save_widget'),          
    path('add_user', views.add_user, name='add_user'),
    path('login_user', views.login_user, name='login_user'),
    path('logout_user',views.logout_user, name='logout_user'),
    path('upload_data',views.upload_data, name='upload_data'),
    path('get_user_data',views.get_user_data, name='get_user_data'),
    path('get_data',views.get_data, name='get_data'),
    path('get_metadata',views.get_metadata, name='get_metadata'),
    path('save_connection',views.save_connection,name='save_connection'),
    path('get_connection',views.get_connection,name='get_connection'),
    path('get_source_filters',views.get_source_filters,name='get_source_filters')
]
