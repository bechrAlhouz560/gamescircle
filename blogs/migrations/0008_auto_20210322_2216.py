# Generated by Django 2.2.5 on 2021-03-22 22:16

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('blogs', '0007_auto_20210322_2214'),
    ]

    operations = [
        migrations.RenameField(
            model_name='blog',
            old_name='author',
            new_name='created_by',
        ),
    ]