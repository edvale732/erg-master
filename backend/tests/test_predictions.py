from fastapi.testclient import TestClient

from backend.app.main import app


client = TestClient(app)


def test_predictions_returns_number_of_sessions_used():
    response = client.post(
        "/predictions/",
        json={
            "sessions": [
                {
                    "sessionDate": "2026-09-08",
                    "sessionType": "single_distance",
                    "intervals": [
                        {
                            "distance": 2000,
                            "timeSeconds": 480,
                            "avgStrokeRate": 28,
                            "avgWatts": 220,
                        }
                    ],
                }
            ]
        },
    )

    assert response.status_code == 200
    assert response.json() == {
        "prediction": "prediction result",
        "sessionsUsed": 1,
    }