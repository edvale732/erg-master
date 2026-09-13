from fastapi.testclient import TestClient

from backend.app.main import app


client = TestClient(app)


def test_predictions_with_empty_sessions():
    response = client.post(
        "/predictions/",
        json={"sessions": []},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["sessionsUsed"] == 0
    assert data["prediction"] == "No sessions logged yet"
    assert data["predictedTimeSeconds"] is None


def test_predictions_with_valid_sessions():
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
    data = response.json()
    assert data["sessionsUsed"] == 1
    assert "prediction" in data
    assert isinstance(data["predictedTimeSeconds"], (int, float))
    assert 330 <= data["predictedTimeSeconds"] <= 600
    assert data["predictedSplit"] is not None
    assert data["predictedWatts"] is not None
