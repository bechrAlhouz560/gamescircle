# Generated by Django 2.2.5 on 2021-03-23 12:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('blogs', '0010_auto_20210322_2222'),
    ]

    operations = [
        migrations.AlterField(
            model_name='blograte',
            name='stars_count',
            field=models.IntegerField(default=0, verbose_name='starts_count'),
        ),
    ]
