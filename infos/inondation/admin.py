from django.contrib import admin
from .models import Localisation, Capteur, Mesure, Alerte

admin.site.register(Localisation)
admin.site.register(Capteur)
admin.site.register(Mesure)
admin.site.register(Alerte)
