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
    localisation = LocalisationSerializer(read_only=True)
    has_signalement = serializers.SerializerMethodField()

    class Meta:
        model = Alerte
        fields = ['id','localisation','niveau','message','date_alerte','has_signalement']

    def get_has_signalement(self, obj):
        try:
            from .models import Signalement
            return Signalement.objects.filter(alerte_id=obj.id).exists()
        except Exception:
            return False

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
    groups = serializers.SlugRelatedField(many=True, read_only=True, slug_field='name')

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'is_active',
            'is_staff',
            'is_superuser',
            'last_login',
            'date_joined',
            'groups',
        ]


class LoginResponseSerializer(serializers.Serializer):
    token = serializers.CharField()
    user = UserSerializer()