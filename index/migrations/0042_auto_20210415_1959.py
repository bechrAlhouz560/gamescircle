# Generated by Django 2.2.5 on 2021-04-15 19:59

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('index', '0041_auto_20210415_1927'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userfallowers',
            name='fallower',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='userfallowing',
            name='fallowing',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='userinfos',
            name='_id',
            field=models.CharField(default='CsKjTz2NeMB8d2U', max_length=15),
        ),
    ]