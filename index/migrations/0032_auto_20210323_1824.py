# Generated by Django 2.2.5 on 2021-03-23 18:24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('index', '0031_auto_20210323_1806'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userinfos',
            name='_id',
            field=models.CharField(default='TW6JFjyQVti1YZo', max_length=15),
        ),
    ]