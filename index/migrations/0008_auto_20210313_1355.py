# Generated by Django 2.2.5 on 2021-03-13 13:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('index', '0007_userinfos'),
    ]

    operations = [
        migrations.AddField(
            model_name='userinfos',
            name='stars',
            field=models.IntegerField(default=0, help_text='the number of stars the user have gained.'),
        ),
        migrations.AlterField(
            model_name='userinfos',
            name='fallowers',
            field=models.IntegerField(default=0, help_text='the number of fallowers the user has.'),
        ),
        migrations.AlterField(
            model_name='userinfos',
            name='fallowing',
            field=models.IntegerField(default=0, help_text='the number of users the user is fallowing.'),
        ),
    ]
