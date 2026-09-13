import numpy as np
import xgboost as xgb
from datetime import date
from typing import List, Optional, Tuple, Dict, Any


def watts_to_split_seconds(watts: float) -> float:
    """Convert average watts to 500m split in seconds.
    Concept2 formula: split_seconds = (2.80 / watts) ** (1 / 3) * 500
    """
    if watts <= 0:
        return 0.0
    return ((2.80 / watts) ** (1.0 / 3.0)) * 500.0


def format_time_mmss(seconds: float) -> str:
    """Format total seconds to mm:ss.s format."""
    if seconds <= 0:
        return "N/A"
    mins = int(seconds // 60)
    secs = seconds % 60
    return f"{mins}:{secs:04.1f}"


def extract_features(sessions: List[Any]) -> np.ndarray:
    """
    Extract relevant physiological & training load features from user rowing sessions:
    1. Total cumulative distance (meters)
    2. Total cumulative training time (seconds)
    3. Number of total workouts logged
    4. Average power output (watts) across all workouts
    5. Max power output (watts) across intervals
    6. Best (fastest) 500m pace in seconds across any interval
    7. Best (fastest) 2000m pace equivalent or 2k interval pace
    8. Recent 14-day training volume (meters)
    9. Recent 14-day average watts
    10. Consistency (standard deviation of daily training frequency or interval count)
    """
    if not sessions:
        return np.zeros((1, 10))

    total_distance = 0
    total_time = 0
    all_watts: List[float] = []
    all_splits: List[float] = []
    two_k_splits: List[float] = []

    # Sort sessions by date if possible
    # Session date parsing
    today = date.today()
    recent_distance = 0
    recent_watts: List[float] = []

    for session in sessions:
        sess_date = session.sessionDate if hasattr(session, "sessionDate") else session.get("sessionDate")
        if isinstance(sess_date, str):
            try:
                sess_date = date.fromisoformat(sess_date[:10])
            except Exception:
                sess_date = today

        days_ago = (today - sess_date).days if sess_date else 0
        is_recent = 0 <= days_ago <= 14

        intervals = session.intervals if hasattr(session, "intervals") else session.get("intervals", [])
        for interval in intervals:
            dist = getattr(interval, "distance", None) if hasattr(interval, "distance") else interval.get("distance", 0)
            t_sec = getattr(interval, "timeSeconds", None) if hasattr(interval, "timeSeconds") else interval.get("timeSeconds", 0)
            watts = getattr(interval, "avgWatts", None) if hasattr(interval, "avgWatts") else interval.get("avgWatts")

            if dist and t_sec and t_sec > 0:
                total_distance += dist
                total_time += t_sec
                if is_recent:
                    recent_distance += dist

                pace_500 = (t_sec / dist) * 500.0
                all_splits.append(pace_500)

                if watts is None or watts <= 0:
                    # Concept2 formula: watts = 2.80 / (pace_500 / 500)^3
                    calculated_watts = 2.80 / ((t_sec / dist) ** 3)
                    all_watts.append(calculated_watts)
                    if is_recent:
                        recent_watts.append(calculated_watts)
                else:
                    all_watts.append(float(watts))
                    if is_recent:
                        recent_watts.append(float(watts))

                if dist >= 1800 and dist <= 2200:
                    two_k_splits.append(pace_500)

    num_sessions = len(sessions)
    avg_watts = float(np.mean(all_watts)) if all_watts else 180.0
    max_watts = float(np.max(all_watts)) if all_watts else avg_watts
    best_500_split = float(np.min(all_splits)) if all_splits else 115.0
    best_2k_split = float(np.min(two_k_splits)) if two_k_splits else (best_500_split + 8.0)
    recent_avg_watts = float(np.mean(recent_watts)) if recent_watts else avg_watts

    features = np.array([
        total_distance,
        total_time,
        num_sessions,
        avg_watts,
        max_watts,
        best_500_split,
        best_2k_split,
        recent_distance,
        recent_avg_watts,
        len(all_splits) / max(num_sessions, 1)
    ], dtype=np.float32).reshape(1, -1)

    return features


def _generate_synthetic_training_data() -> Tuple[np.ndarray, np.ndarray]:
    """
    Generate domain-accurate synthetic rowing dataset based on standard rowing physiology:
    - 2k erg times typically range from 5:40 (340s - elite heavyweight) to 8:30 (510s - recreational).
    - Power (watts) scales with (pace / 500)^(-3).
    - Paul's law: t2 = t1 * (d2 / d1)^1.06
    """
    np.random.seed(42)
    n_samples = 1500

    # Synthetic rower profiles
    base_2k_watts = np.random.uniform(150, 480, n_samples)
    base_2k_time = np.array([watts_to_split_seconds(w) * 4 for w in base_2k_watts])  # 2000m time in seconds

    # Simulating training history for each rower
    num_sessions = np.random.randint(1, 100, n_samples)
    avg_dist_per_session = np.random.uniform(3000, 12000, n_samples)
    total_dist = num_sessions * avg_dist_per_session
    
    # Training pace is typically slightly lower watts than max 2k effort (70% - 90% of 2k watts)
    training_intensity = np.random.uniform(0.65, 0.90, n_samples)
    avg_watts = base_2k_watts * training_intensity
    max_watts = base_2k_watts * np.random.uniform(1.02, 1.25, n_samples)
    
    # Total time based on avg speed
    avg_pace_500 = np.array([watts_to_split_seconds(w) for w in avg_watts])
    total_time = (total_dist / 500.0) * avg_pace_500
    
    best_500_split = np.array([watts_to_split_seconds(w) for w in max_watts])
    best_2k_split = base_2k_time / 4.0 + np.random.normal(0, 1.5, n_samples)
    
    recent_distance = total_dist * np.random.uniform(0.1, 0.4, n_samples)
    recent_avg_watts = avg_watts * np.random.uniform(0.95, 1.05, n_samples)
    intervals_per_session = np.random.uniform(1.0, 5.0, n_samples)

    # Actual 2k time in seconds as target (with minor realistic noise)
    target_2k_time = base_2k_time + np.random.normal(0, 2.0, n_samples)

    X = np.column_stack([
        total_dist,
        total_time,
        num_sessions,
        avg_watts,
        max_watts,
        best_500_split,
        best_2k_split,
        recent_distance,
        recent_avg_watts,
        intervals_per_session
    ])
    y = target_2k_time

    return X, y


class ModelManager:
    _instance = None
    model: Optional[xgb.XGBRegressor] = None

    @classmethod
    def get_model(cls) -> xgb.XGBRegressor:
        if cls.model is None:
            X, y = _generate_synthetic_training_data()
            model = xgb.XGBRegressor(
                n_estimators=100,
                max_depth=4,
                learning_rate=0.08,
                subsample=0.8,
                colsample_bytree=0.8,
                random_state=42,
            )
            model.fit(X, y)
            cls.model = model
        return cls.model


def predict_2k_performance(sessions: List[Any]) -> Dict[str, Any]:
    """
    Predict 2k time given rowing session history using the XGBoost model.
    """
    if not sessions:
        return {
            "prediction": "No sessions logged yet",
            "predictedTimeSeconds": None,
            "predictedSplit": None,
            "predictedWatts": None,
            "sessionsUsed": 0,
        }

    model = ModelManager.get_model()
    features = extract_features(sessions)
    pred_2k_seconds = float(model.predict(features)[0])

    # Clamp prediction to human realistic bounds (5:30 to 10:00)
    pred_2k_seconds = max(330.0, min(600.0, pred_2k_seconds))
    split_500_seconds = pred_2k_seconds / 4.0
    predicted_watts = round(2.80 / ((split_500_seconds / 500.0) ** 3), 1)

    formatted_time = format_time_mmss(pred_2k_seconds)
    formatted_split = format_time_mmss(split_500_seconds)

    return {
        "prediction": f"{formatted_time} (2k split: {formatted_split}/500m @ ~{int(predicted_watts)}W)",
        "predictedTimeSeconds": round(pred_2k_seconds, 1),
        "predictedSplit": formatted_split,
        "predictedWatts": predicted_watts,
        "sessionsUsed": len(sessions),
    }
