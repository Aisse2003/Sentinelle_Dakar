from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('inondation', '0004_assistancerequest_degat_degatpiece'),
    ]

    operations = [
        migrations.AddField(
            model_name='signalement',
            name='status',
            field=models.CharField(max_length=20, default='pending'),
        ),
    ]


