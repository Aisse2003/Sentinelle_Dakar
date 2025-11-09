from django.http import StreamingHttpResponse
from django.utils.timezone import now
import json
import time

def sse_stream(request):
    # Optionnel: vérifier auth si nécessaire
    def event_stream():
        yield "retry: 5000\n"  # délai de reconnexion côté client
        while True:
            payload = {
                "type": "metric",
                "ts": now().isoformat(),
                "payload": {"value": 10}
            }
            data = json.dumps(payload)
            yield f"event: metric\n"
            yield f"data: {data}\n\n"
            # Heartbeat pour garder la connexion
            yield "data: :ping\n\n"
            time.sleep(5)

    response = StreamingHttpResponse(event_stream(), content_type='text/event-stream')
    response['Cache-Control'] = 'no-cache'
    response['X-Accel-Buffering'] = 'no'  # nginx
    response['Access-Control-Allow-Origin'] = '*'
    response['Access-Control-Allow-Credentials'] = 'true'
    return response


