from django.contrib import admin
from .models import Signalement, SignalementPhoto

# Enregistrer uniquement les nouveaux modèles ajoutés par nos changements
admin.site.register(Signalement)
admin.site.register(SignalementPhoto)
from .models import Localisation, Capteur, Mesure, Alerte

admin.site.register(Localisation)
admin.site.register(Capteur)
admin.site.register(Mesure)
admin.site.register(Alerte)
