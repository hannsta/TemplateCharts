from django.db import models
import uuid

class Template(models.Model):
    user = models.CharField(max_length=50)
    name = models.CharField(max_length=100)
    templateid = models.CharField(max_length=50,default=uuid.uuid4, editable=False, unique=True)
    created = models.DateField(null=True)
    modified = models.DateField(null=True)
    template = models.TextField()
    scripts = models.TextField()

class Widget(models.Model):
    user = models.CharField(max_length=50)
    name = models.CharField(max_length=100)
    widgetid = models.CharField(max_length=50,default=uuid.uuid4, editable=False, unique=True)
    templateid = models.CharField(max_length=50)
    sourceid = models.CharField(max_length=50)
    created = models.DateField(null=True)
    modified = models.DateField(null=True)
    widget = models.JSONField(null=True)


class DataSource(models.Model):
    sourceid = models.CharField(max_length=50,default=uuid.uuid4, editable=False, unique=True)
    user = models.CharField(max_length=50, null=True)
    name = models.CharField(max_length=100, null=True)
    location = models.CharField(max_length=100, null=True)
    metadata = models.TextField(null=True)
