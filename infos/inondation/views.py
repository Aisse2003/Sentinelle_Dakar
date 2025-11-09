from rest_framework import viewsets
from .models import Localisation, Capteur, Mesure, Alerte
from .serializers import LocalisationSerializer, CapteurSerializer, MesureSerializer, AlerteSerializer
from .serializers import RegisterSerializer
from django.contrib.auth.models import User

from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegisterSerializer, UserSerializer
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from .models import Localisation, Alerte, Signalement, SignalementPhoto, Degat, DegatPiece, AssistanceRequest
from django.db.models import Q
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from urllib.parse import urlencode
from urllib.request import urlopen, Request
import json as pyjson

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

    def get_queryset(self):
        qs = Alerte.objects.select_related('localisation').all().order_by('-date_alerte')
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(message__icontains=search)
                | Q(niveau__icontains=search)
                | Q(localisation__nom__icontains=search)
            )
        level = (self.request.query_params.get('level') or '').lower().strip()
        if level:
            # Map niveaux UI -> niveaux backend
            level_map = {
                'critical': 'fort',
                'high': 'fort',
                'medium': 'moyen',
                'info': 'faible',
                'low': 'faible',
            }
            mapped = level_map.get(level, level)
            qs = qs.filter(niveau__icontains=mapped)
        return qs

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all().order_by('id')
    serializer_class = UserSerializer


class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)




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
        identifier = request.data.get("username") or request.data.get("email")
        password = request.data.get("password")

        user = None
        if identifier and "@" in str(identifier):
            try:
                u = User.objects.get(email=identifier)
                user = authenticate(username=u.username, password=password)
            except User.DoesNotExist:
                user = None
        else:
            user = authenticate(username=identifier, password=password)
        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({
                "token": str(refresh.access_token),
                "user": UserSerializer(user).data
            })
        return Response({"error": "Identifiants invalides"}, status=400)


class PasswordResetRequestView(APIView):
    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response({"error": "Email requis"}, status=status.HTTP_400_BAD_REQUEST)

        # Réponse générique pour ne pas divulguer l'existence d'un compte
        users = User.objects.filter(email=email, is_active=True)
        for user in users:
            # Génère le token et l'uid pour envoi email (à brancher si SMTP configuré)
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            # Ici, on enverrait l'email contenant un lien vers le front: /reset?uid=...&token=...
            # Ex: send_password_reset_email(user.email, uid, token)
            _ = (token, uid)  # placeholder pour éviter l'avertissement variable inutilisée

        return Response({"success": True})


class PasswordResetConfirmView(APIView):
    def post(self, request):
        uidb64 = request.data.get("uid")
        token = request.data.get("token")
        new_password = request.data.get("new_password")

        if not uidb64 or not token or not new_password:
            return Response({"error": "Champs manquants"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = User.objects.get(pk=uid)
        except Exception:
            return Response({"error": "Lien invalide"}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({"error": "Token invalide ou expiré"}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({"success": True})


class SignalementCreateView(APIView):
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_permissions(self):
        # GET:
        #  - Public si filtré par alerte_id (pour afficher les photos liées à une alerte)
        #  - Réservé aux autorités sinon
        # POST: ouvert à tous pour déclarer un signalement.
        if getattr(self.request, 'method', '').upper() == 'GET':
            alerte_id = self.request.query_params.get('alerte_id')
            if alerte_id:
                return [permissions.AllowAny()]
            return [permissions.IsAuthenticated(), permissions.IsAdminUser()]
        return [permissions.AllowAny()]

    def get(self, request):
        # Liste des signalements; supporte le filtre alerte_id pour joindre aux alertes
        alerte_id = request.query_params.get('alerte_id')
        qs = Signalement.objects.all()
        if alerte_id:
            qs = qs.filter(alerte_id=alerte_id)
        qs = qs.order_by('-created_at')[:50]
        def photo_url(p):
            try:
                return request.build_absolute_uri(p.file.url)
            except Exception:
                return None
        data = []
        for s in qs:
            data.append({
                'id': s.id,
                'description': s.description,
                'severity': s.severity,
                'location_text': s.location_text,
                'created_at': s.created_at,
                'alerte_id': s.alerte_id,
                'photos': [u for u in [photo_url(p) for p in s.photos.all()] if u],
            })
        return Response(data)
    """
    Endpoint simple pour recevoir un signalement citoyen et le mapper vers une Alerte.
    Champs attendus (multipart ou JSON):
      - type (str)
      - location (str) : soit "lat, lng", soit libellé d'adresse
      - severity ("low"|"medium"|"high")
      - description (str)
      - prenom / nom / phone (optionnels)
      - photos (ignoré côté backend dans cette implémentation)
    """
    def post(self, request):
        try:
            data = request.data
            incident_type = data.get('type') or ''
            location_str = data.get('location') or ''
            severity = (data.get('severity') or 'low').lower()
            description = data.get('description') or ''

            if not description:
                return Response({"error": "La description est requise."}, status=status.HTTP_400_BAD_REQUEST)

            # 1) Créer/obtenir une Localisation à partir de la position
            loc_obj = None
            lat, lng = None, None
            if ',' in location_str:
                try:
                    parts = [p.strip() for p in location_str.split(',')]
                    lat, lng = float(parts[0]), float(parts[1])
                except Exception:
                    lat, lng = None, None

            if lat is not None and lng is not None:
                loc_obj = Localisation.objects.create(nom=f"Point ({lat:.4f},{lng:.4f})", latitude=lat, longitude=lng)
            else:
                # Essayer de géocoder le texte (quartier) via Nominatim (OpenStreetMap), gratuit
                geo_lat, geo_lng = None, None
                try:
                    q = location_str or ''
                    if q:
                        query = urlencode({ 'q': f"{q}, Dakar, Senegal", 'format': 'json', 'limit': 1 })
                        req = Request(f"https://nominatim.openstreetmap.org/search?{query}", headers={ 'User-Agent': 'sentinel-dakar/1.0' })
                        with urlopen(req, timeout=5) as resp:
                            data = pyjson.loads(resp.read().decode('utf-8'))
                            if isinstance(data, list) and data:
                                first = data[0]
                                geo_lat = float(first.get('lat'))
                                geo_lng = float(first.get('lon'))
                except Exception:
                    geo_lat, geo_lng = None, None

                if geo_lat is not None and geo_lng is not None:
                    loc_obj = Localisation.objects.create(nom=location_str or 'Lieu', latitude=geo_lat, longitude=geo_lng)
                else:
                    # Si géocodage impossible, coordonnées neutres
                    loc_obj = Localisation.objects.create(nom=location_str or 'Lieu non précisé', latitude=0.0, longitude=0.0)

            # 2) Mapper la gravité
            niveau_map = {
                'low': 'faible',
                'medium': 'moyen',
                'high': 'fort',
            }
            niveau = niveau_map.get(severity, 'faible')

            # 3) Composer le message
            prenom = data.get('prenom') or ''
            nom = data.get('nom') or ''
            phone = data.get('phone') or ''
            details_contact = []
            if prenom or nom:
                details_contact.append(f"Contact: {prenom} {nom}".strip())
            if phone:
                details_contact.append(f"Téléphone: {phone}")
            meta = f"Type: {incident_type}\n" if incident_type else ''
            meta += "\n".join(details_contact)
            message = description
            if meta:
                message = (description + "\n\n" + meta).strip()

            # 4) Créer l'alerte et le signalement
            alerte = Alerte.objects.create(localisation=loc_obj, niveau=niveau, message=message)
            # Associer l'utilisateur si authentifié
            created_by = request.user if getattr(request, 'user', None) and request.user.is_authenticated else None
            signalement = Signalement.objects.create(
                localisation=loc_obj,
                alerte=alerte,
                created_by=created_by,
                type_incident=incident_type,
                location_text=location_str,
                severity=severity,
                description=description,
                prenom=prenom,
                nom=nom,
                phone=phone,
            )

            # 5) Gérer les photos si fournies (clé 'photos')
            files = request.FILES.getlist('photos')
            for f in files:
                SignalementPhoto.objects.create(signalement=signalement, file=f)

            # Construire URLs photos (après upload)
            def photo_url(p):
                try:
                    return request.build_absolute_uri(p.file.url)
                except Exception:
                    return None
            photos_urls = [u for u in [photo_url(p) for p in signalement.photos.all()] if u]

            return Response({
                "success": True,
                "alerte_id": alerte.id,
                "signalement_id": signalement.id,
                "photos": photos_urls,
            })
        except Exception as exc:
            return Response({"error": f"Erreur serveur: {exc}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MySignalementsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        qs = Signalement.objects.filter(created_by=request.user).order_by('-created_at')[:100]

        def photo_url(p):
            try:
                return request.build_absolute_uri(p.file.url)
            except Exception:
                return None

        data = []
        for s in qs:
            data.append({
                'id': s.id,
                'description': s.description,
                'severity': s.severity,
                'location_text': s.location_text,
                'created_at': s.created_at,
                'alerte_id': s.alerte_id,
                'photos': [u for u in [photo_url(p) for p in s.photos.all()] if u],
            })
        return Response(data)


class DegatCreateView(APIView):
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_permissions(self):
        # GET réservé aux autorités (staff). POST ouvert à tous pour déclarer un dégât.
        if getattr(self.request, 'method', '').upper() == 'GET':
            return [permissions.IsAuthenticated(), permissions.IsAdminUser()]
        return [permissions.AllowAny()]

    def get(self, request):
        qs = Degat.objects.all().order_by('-created_at')[:100]
        def piece_url(p):
            try:
                return request.build_absolute_uri(p.file.url)
            except Exception:
                return None
        data = []
        for d in qs:
            data.append({
                'id': d.id,
                'property_type': d.property_type,
                'loss_amount_text': d.loss_amount_text,
                'loss_description': d.loss_description,
                'people_affected': d.people_affected,
                'remarks': d.remarks,
                'created_at': d.created_at,
                'pieces': [u for u in [piece_url(p) for p in d.pieces.all()] if u],
            })
        return Response(data)

    def post(self, request):
        try:
            data = request.data
            created_by = request.user if getattr(request, 'user', None) and request.user.is_authenticated else None
            d = Degat.objects.create(
                created_by=created_by,
                property_type=data.get('property_type') or '',
                loss_amount_text=data.get('loss_amount_text') or '',
                loss_description=data.get('loss_description') or '',
                people_affected=int(data.get('people_affected') or 0),
                remarks=data.get('remarks') or '',
            )
            files = request.FILES.getlist('pieces')
            for f in files:
                DegatPiece.objects.create(degat=d, file=f)

            def piece_url(p):
                try:
                    return request.build_absolute_uri(p.file.url)
                except Exception:
                    return None
            pieces_urls = [u for u in [piece_url(p) for p in d.pieces.all()] if u]
            return Response({
                'success': True,
                'degat_id': d.id,
                'pieces': pieces_urls,
            }, status=201)
        except Exception as exc:
            return Response({'error': f'Erreur serveur: {exc}'}, status=500)


class MyDegatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        qs = Degat.objects.filter(created_by=request.user).order_by('-created_at')[:100]
        def piece_url(p):
            try:
                return request.build_absolute_uri(p.file.url)
            except Exception:
                return None
        data = []
        for d in qs:
            data.append({
                'id': d.id,
                'property_type': d.property_type,
                'loss_amount_text': d.loss_amount_text,
                'loss_description': d.loss_description,
                'people_affected': d.people_affected,
                'remarks': d.remarks,
                'created_at': d.created_at,
                'pieces': [u for u in [piece_url(p) for p in d.pieces.all()] if u],
            })
        return Response(data)


class AssistanceCreateView(APIView):
    parser_classes = [JSONParser, FormParser]

    def get_permissions(self):
        # GET réservé aux autorités (staff). POST ouvert à tous.
        if getattr(self.request, 'method', '').upper() == 'GET':
            return [permissions.IsAuthenticated(), permissions.IsAdminUser()]
        return [permissions.AllowAny()]

    def get(self, request):
        qs = AssistanceRequest.objects.all().order_by('-created_at')[:100]
        data = [
            {
                'id': a.id,
                'location_text': a.location_text,
                'help_type': a.help_type,
                'people_count': a.people_count,
                'phone': a.phone,
                'availability': a.availability,
                'urgency_note': a.urgency_note,
                'created_at': a.created_at,
            }
            for a in qs
        ]
        return Response(data)

    def post(self, request):
        try:
            data = request.data
            created_by = request.user if getattr(request, 'user', None) and request.user.is_authenticated else None
            a = AssistanceRequest.objects.create(
                created_by=created_by,
                location_text=data.get('location_text') or '',
                help_type=data.get('help_type') or '',
                people_count=int(data.get('people_count') or 0),
                phone=data.get('phone') or '',
                availability=data.get('availability') or '',
                urgency_note=data.get('urgency_note') or '',
            )
            return Response({'success': True, 'assistance_id': a.id}, status=201)
        except Exception as exc:
            return Response({'error': f'Erreur serveur: {exc}'}, status=500)


class MyAssistanceView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        qs = AssistanceRequest.objects.filter(created_by=request.user).order_by('-created_at')[:100]
        data = [
            {
                'id': a.id,
                'location_text': a.location_text,
                'help_type': a.help_type,
                'people_count': a.people_count,
                'phone': a.phone,
                'availability': a.availability,
                'urgency_note': a.urgency_note,
                'created_at': a.created_at,
            }
            for a in qs
        ]
        return Response(data)
