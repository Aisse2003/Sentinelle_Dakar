from rest_framework import serializers
from django.contrib.auth.models import User

from .models import Localisation, Capteur, Mesure, Alerte

class LocalisationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Localisation
        fields = '__all__'

class CapteurSerializer(serializers.ModelSerializer):
    class Meta:
        model = Capteur
        fields = '__all__'

class MesureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mesure
        fields = '__all__'

class AlerteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alerte
        fields = '__all__'

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            password=validated_data['password']
        )
        return user
        
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class LoginResponseSerializer(serializers.Serializer):
    token = serializers.CharField()
    user = UserSerializer()