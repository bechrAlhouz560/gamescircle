# Generated by Django 2.2.5 on 2021-03-23 18:24

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('blogs', '0012_blog_cover'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='blog',
            options={'permissions': [('can_add_blog', 'can the user create a blog')]},
        ),
    ]
