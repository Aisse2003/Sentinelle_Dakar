from rest_framework import viewsets
from .models import Localisation, Capteur, Mesure, Alerte
from .serializers import LocalisationSerializer, CapteurSerializer, MesureSerializer, AlerteSerializer
from .serializers import RegisterSerializer
from django.contrib.auth.models import User

from rest_framework import generics, status
from rest_framework.response import Response
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegisterSerializer, UserSerializer

class LocalisationViewSet(viewsets.ModelViewSet):
    queryset = Localisation.objects.all()
    serializer_class = LocalisationSerializer

class CapteurViewSet(viewsets.ModelViewSet):
    queryset = Capteur.objects.all()
    serializer_class = CapteurSerializer

class MesureViewSet(viewsets.ModelViewSet):
    queryset = Mesure.objects.all()
    serializer_class = MesureSerializer

class AlerteViewSet(viewsets.ModelViewSet):
    queryset = Alerte.objects.all()
    serializer_class = AlerteSerializer




class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            "token": str(refresh.access_token),
            "user": UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)


class LoginView(generics.GenericAPIView):
    serializer_class = UserSerializer

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(username=username, password=password)
        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({
                "token": str(refresh.access_token),
                "user": UserSerializer(user).data
            })
        return Response({"error": "Identifiants invalides"}, status=400)
