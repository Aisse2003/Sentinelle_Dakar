from django.db import models
from django.contrib.auth.models import User


class Localisation(models.Model):
    nom = models.CharField(max_length=100)
    latitude = models.FloatField()
    longitude = models.FloatField()

    def __str__(self):
        return self.nom


class Capteur(models.Model):
    code = models.CharField(max_length=50, unique=True)
    localisation = models.ForeignKey(Localisation, on_delete=models.CASCADE)
    type_capteur = models.CharField(max_length=50)  # ex: "niveau_eau", "pluviométrie"

    def __str__(self):
        return f"{self.code} - {self.type_capteur}"


class Mesure(models.Model):
    capteur = models.ForeignKey(Capteur, on_delete=models.CASCADE)
    valeur = models.FloatField()
    unite = models.CharField(max_length=20)  # ex: "mm", "m3/s"
    date_releve = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.capteur} - {self.valeur} {self.unite}"


class Alerte(models.Model):
    localisation = models.ForeignKey(Localisation, on_delete=models.CASCADE)
    niveau = models.CharField(max_length=50)  # ex: "faible", "moyen", "fort"
    message = models.TextField()
    date_alerte = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Alerte {self.niveau} - {self.localisation.nom}"


class Signalement(models.Model):
    """Signalement citoyen de terrain, potentiellement à l'origine d'une Alerte."""
    localisation = models.ForeignKey(Localisation, on_delete=models.CASCADE)
    alerte = models.ForeignKey(Alerte, on_delete=models.SET_NULL, null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='signalements')
    status = models.CharField(max_length=20, default="pending")  # pending | verified | resolved
    type_incident = models.CharField(max_length=100, blank=True, default="")
    location_text = models.CharField(max_length=255, blank=True, default="")
    severity = models.CharField(max_length=20, blank=True, default="")
    description = models.TextField()
    prenom = models.CharField(max_length=100, blank=True, default="")
    nom = models.CharField(max_length=100, blank=True, default="")
    phone = models.CharField(max_length=50, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Signalement {self.id} - {self.type_incident or 'n/a'}"


class SignalementPhoto(models.Model):
    signalement = models.ForeignKey(Signalement, on_delete=models.CASCADE, related_name='photos')
    file = models.FileField(upload_to='signalements/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Photo {self.id} du signalement {self.signalement_id}"


class Degat(models.Model):
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='degats')
    property_type = models.CharField(max_length=100)  # maison, véhicule, commerce, etc.
    loss_amount_text = models.CharField(max_length=100, blank=True, default="")  # ex: 500 000 FCFA
    loss_description = models.TextField(blank=True, default="")
    people_affected = models.IntegerField(default=0)
    remarks = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Degat {self.id} - {self.property_type}"


class DegatPiece(models.Model):
    degat = models.ForeignKey(Degat, on_delete=models.CASCADE, related_name='pieces')
    file = models.FileField(upload_to='degats/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Pièce {self.id} du dégât {self.degat_id}"


class AssistanceRequest(models.Model):
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assistance_requests')
    location_text = models.CharField(max_length=255)
    help_type = models.CharField(max_length=100)  # secours, hébergement, nourriture, transport, évacuation médicale, etc.
    people_count = models.IntegerField(default=0)
    phone = models.CharField(max_length=50)
    availability = models.CharField(max_length=100, blank=True, default="")  # ou urgence texte libre
    urgency_note = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Assistance {self.id} - {self.help_type}"