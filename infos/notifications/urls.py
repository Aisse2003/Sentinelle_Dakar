from django.urls import path
from .views import subscribe_push, test_push, validate_signalement, vapid_public_key, update_presence, alert_area_push, alert_area_sms

urlpatterns = [
    path("api/notifications/subscribe/", subscribe_push),
    path("api/notifications/presence/", update_presence),
    path("api/notifications/alert-area/push/", alert_area_push),
    path("api/notifications/alert-area/sms/", alert_area_sms),
    path("api/notifications/test/", test_push),
    path("api/signalements/<int:pk>/validate/", validate_signalement),
    path("api/notifications/vapid-public-key/", vapid_public_key),
]


