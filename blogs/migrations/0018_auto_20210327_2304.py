# Generated by Django 2.2.5 on 2021-03-27 23:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('blogs', '0017_auto_20210327_2303'),
    ]

    operations = [
        migrations.AlterField(
            model_name='blog',
            name='cover',
            field=models.FileField(upload_to='uploads/images/blogs/cover/%y/%m/%d/%h/%M/%s', verbose_name='cover_image'),
        ),
    ]
