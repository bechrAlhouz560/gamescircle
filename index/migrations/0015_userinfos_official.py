# Generated by Django 2.2.5 on 2021-03-14 16:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('index', '0014_auto_20210313_1633'),
    ]

    operations = [
        migrations.AddField(
            model_name='userinfos',
            name='official',
            field=models.BooleanField(default=False, help_text='whether this account is official or not.'),
        ),
    ]