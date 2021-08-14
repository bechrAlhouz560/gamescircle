# Generated by Django 2.2.5 on 2021-06-20 00:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('search', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='searchhistory',
            name='type',
            field=models.CharField(choices=[('BG', 'Blogs'), ('GMR', 'Gamers'), ('GM', 'Games'), ('VD', 'Videos')], default='BG', max_length=3, verbose_name='search_type'),
        ),
    ]