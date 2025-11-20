import json
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import user_passes_test
from pywebpush import webpush, WebPushException
from .models import PushSubscription
from django.db.models import Q
from math import radians, sin, cos, asin, sqrt
from inondation.models import Signalement, Alerte


def _send_all(payload: dict):
    body = json.dumps(payload)
    sent, removed = 0, 0
    for sub in list(PushSubscription.objects.all()):
        sub_json = {"endpoint": sub.endpoint, "keys": {"p256dh": sub.p256dh, "auth": sub.auth}}
        try:
            webpush(
                subscription_info=sub_json,
                data=body,
                vapid_private_key=settings.VAPID_PRIVATE_KEY,
                vapid_claims={"sub": settings.VAPID_SUBJECT},
            )
            sent += 1
        except WebPushException as e:
            if getattr(e, "response", None) and e.response.status_code in (404, 410):
                sub.delete(); removed += 1
    return {"sent": sent, "removed": removed}


@csrf_exempt
def subscribe_push(request):
    if request.method != "POST":
        return JsonResponse({"error": "method not allowed"}, status=405)
    try:
        data = json.loads(request.body.decode("utf-8"))
        endpoint = data.get("endpoint")
        keys = data.get("keys") or {}
        p256dh = keys.get("p256dh")
        auth = keys.get("auth")
        if not (endpoint and p256dh and auth):
            return JsonResponse({"error": "invalid subscription"}, status=400)
        defaults = {"p256dh": p256dh, "auth": auth}
        if getattr(request, "user", None) and request.user.is_authenticated:
            defaults["user"] = request.user
        obj, _ = PushSubscription.objects.update_or_create(
            endpoint=endpoint,
            defaults=defaults,
        )
        return JsonResponse({"ok": True, "id": obj.id})
    except Exception:
        return JsonResponse({"error": "subscribe failed"}, status=500)


@user_passes_test(lambda u: u.is_staff or u.is_superuser)
@csrf_exempt
def test_push(request):
    if request.method != "POST":
        return JsonResponse({"error": "method not allowed"}, status=405)
    payload = {"title": "Test Sentinel Dakar", "body": "Notification de test", "url": "/alertes"}
    stats = _send_all(payload)
    return JsonResponse({"ok": True, **stats})


@user_passes_test(lambda u: u.is_staff or u.is_superuser)
@csrf_exempt
def validate_signalement(request, pk: int):
    if request.method != "POST":
        return JsonResponse({"error": "method not allowed"}, status=405)
    # TODO: marquer le signalement pk validé + créer une alerte réelle
    payload = {"title": "Alerte validée", "body": f"Signalement #{pk} validé.", "url": "/alertes"}
    stats = _send_all(payload)
    return JsonResponse({"ok": True, **stats})

def vapid_public_key(request):
    """Expose la clé publique VAPID au front si la variable est définie côté serveur."""
    key = getattr(settings, "VAPID_PUBLIC_KEY", "") or ""
    return JsonResponse({"publicKey": key})

from django.shortcuts import render

# Create your views here.

@csrf_exempt
def update_presence(request):
    if request.method != "POST":
        return JsonResponse({"error": "method not allowed"}, status=405)
    try:
        data = json.loads(request.body.decode("utf-8"))
        endpoint = data.get("endpoint")
        lat = data.get("lat")
        lng = data.get("lng")
        locality = data.get("locality") or ""
        if not endpoint:
            return JsonResponse({"error": "endpoint required"}, status=400)
        qs = PushSubscription.objects.filter(endpoint=endpoint)
        if getattr(request, "user", None) and request.user.is_authenticated:
            qs = qs | PushSubscription.objects.filter(user=request.user)
        updated = qs.update(latitude=lat, longitude=lng, locality=locality)
        return JsonResponse({"ok": True, "updated": int(updated)})
    except Exception:
        return JsonResponse({"error": "presence failed"}, status=500)


def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    return R * c


@user_passes_test(lambda u: u.is_staff or u.is_superuser)
@csrf_exempt
def alert_area_push(request):
    if request.method != "POST":
        return JsonResponse({"error": "method not allowed"}, status=405)
    try:
        data = json.loads(request.body.decode("utf-8"))
        signalement_id = data.get("signalement_id")
        alerte_id = data.get("alerte_id")
        radius_km = float(data.get("radius_km") or 1.5)
        title = data.get("title") or "Alerte Inondation"
        body = data.get("body") or "Risque élevé dans votre zone. Restez vigilants."
        url = data.get("url") or "/alertes"

        lat = lng = None
        if signalement_id:
            try:
                s = Signalement.objects.select_related("localisation").get(pk=signalement_id)
                lat = s.localisation.latitude
                lng = s.localisation.longitude
            except Signalement.DoesNotExist:
                pass
        if lat is None and alerte_id:
            try:
                a = Alerte.objects.select_related("localisation").get(pk=alerte_id)
                lat = a.localisation.latitude
                lng = a.localisation.longitude
            except Alerte.DoesNotExist:
                pass
        if lat is None or lng is None:
            return JsonResponse({"error": "no reference location"}, status=400)

        payload = {"title": title, "body": body, "url": url}
        body_json = json.dumps(payload)

        sent = removed = 0
        for sub in list(PushSubscription.objects.exclude(latitude__isnull=True).exclude(longitude__isnull=True)):
            try:
                d = _haversine_km(lat, lng, float(sub.latitude), float(sub.longitude))
            except Exception:
                continue
            if d <= radius_km:
                sub_json = {"endpoint": sub.endpoint, "keys": {"p256dh": sub.p256dh, "auth": sub.auth}}
                try:
                    webpush(
                        subscription_info=sub_json,
                        data=body_json,
                        vapid_private_key=settings.VAPID_PRIVATE_KEY,
                        vapid_claims={"sub": settings.VAPID_SUBJECT},
                    )
                    sent += 1
                except WebPushException as e:
                    if getattr(e, "response", None) and e.response.status_code in (404, 410):
                        sub.delete(); removed += 1
        return JsonResponse({"ok": True, "sent": sent, "removed": removed})
    except Exception:
        return JsonResponse({"error": "alert-area failed"}, status=500)


@user_passes_test(lambda u: u.is_staff or u.is_superuser)
@csrf_exempt
def alert_area_sms(request):
    if request.method != "POST":
        return JsonResponse({"error": "method not allowed"}, status=405)
    # Placeholder: à brancher avec un fournisseur SMS (Twilio, etc.)
    # Ici, on retourne simplement un statut factice.
    try:
        return JsonResponse({"ok": True, "sms_sent": 0})
    except Exception:
        return JsonResponse({"error": "alert-area-sms failed"}, status=500)
