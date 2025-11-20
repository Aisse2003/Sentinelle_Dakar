from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import LocalisationViewSet, CapteurViewSet, MesureViewSet, AlerteViewSet, UserViewSet
from .views import RegisterView, LoginView
from .views import CurrentUserView
from .views_sse import sse_stream
from .views import PasswordResetRequestView, PasswordResetConfirmView, SignalementCreateView, MySignalementsView, DegatCreateView, MyDegatsView, AssistanceCreateView, MyAssistanceView, SignalementValidateView, SignalementResolveView

router = DefaultRouter()
router.register(r'localisations', LocalisationViewSet)
router.register(r'capteurs', CapteurViewSet)
router.register(r'mesures', MesureViewSet)
router.register(r'alertes', AlerteViewSet)
router.register(r'users', UserViewSet)

urlpatterns = [
    # Routes CRUD automatiques pour tes modèles
    path('', include(router.urls)),

    # Authentification personnalisée
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/user/', CurrentUserView.as_view(), name='current_user'),
    path('auth/password-reset/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('auth/password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),

    # Signalement citoyen
    path('signalements/', SignalementCreateView.as_view(), name='signalement_create'),
    path('signalements/mes/', MySignalementsView.as_view(), name='my_signalements'),
    path('signalements/<int:pk>/validate/', SignalementValidateView.as_view(), name='signalement_validate'),
    path('signalements/<int:pk>/resolve/', SignalementResolveView.as_view(), name='signalement_resolve'),

    # Déclaration de dégâts
    path('degats/', DegatCreateView.as_view(), name='degats_create'),
    path('degats/mes/', MyDegatsView.as_view(), name='my_degats'),

    # Demandes d'assistance
    path('assistance/', AssistanceCreateView.as_view(), name='assistance_create'),
    path('assistance/mes/', MyAssistanceView.as_view(), name='my_assistance'),

    # JWT endpoints officiels
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # SSE realtime (mock)
    path('realtime/stream', sse_stream, name='sse_stream'),
]
