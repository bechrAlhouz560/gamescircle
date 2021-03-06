# Generated by Django 2.2.5 on 2021-03-22 21:58

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('blogs', '0003_blog_blogcomments_blograte_commentreply'),
    ]

    operations = [
        migrations.CreateModel(
            name='BlogImages',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('image', models.FileField(upload_to='uploads/images/blogs/%y/%m/%d', verbose_name='image')),
                ('blog', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='blogs.Blog')),
            ],
        ),
    ]
