# Generated by Django 3.2.9 on 2022-05-28 22:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('yellowfinintegration', '0007_apiconnection_resultobject'),
    ]

    operations = [
        migrations.AddField(
            model_name='widget',
            name='runtimeFilters',
            field=models.JSONField(null=True),
        ),
        migrations.AddField(
            model_name='widget',
            name='sourceFilters',
            field=models.JSONField(null=True),
        ),
    ]
