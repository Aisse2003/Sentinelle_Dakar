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
