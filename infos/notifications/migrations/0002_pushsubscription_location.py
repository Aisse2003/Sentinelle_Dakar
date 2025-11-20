from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('notifications', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='pushsubscription',
            name='latitude',
            field=models.FloatField(null=True, blank=True),
        ),
        migrations.AddField(
            model_name='pushsubscription',
            name='longitude',
            field=models.FloatField(null=True, blank=True),
        ),
        migrations.AddField(
            model_name='pushsubscription',
            name='locality',
            field=models.CharField(max_length=120, blank=True, default=""),
        ),
        migrations.AddField(
            model_name='pushsubscription',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
    ]


