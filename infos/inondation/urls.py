from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import LocalisationViewSet, CapteurViewSet, MesureViewSet, AlerteViewSet
from .views import RegisterView, LoginView

router = DefaultRouter()
router.register(r'localisations', LocalisationViewSet)
router.register(r'capteurs', CapteurViewSet)
router.register(r'mesures', MesureViewSet)
router.register(r'alertes', AlerteViewSet)

urlpatterns = [
    # Routes CRUD automatiques pour tes modèles
    path('', include(router.urls)),

    # Authentification personnalisée
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),

    # JWT endpoints officiels
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
