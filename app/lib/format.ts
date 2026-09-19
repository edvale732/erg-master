export const formatDistance = (distanceMeters: number) =>
  distanceMeters >= 1000 ? `${(distanceMeters / 1000).toFixed(1)} km` : `${distanceMeters.toLocaleString()} m`;

export const formatDistanceKm = (distanceMeters: number) => `${(distanceMeters / 1000).toFixed(1)} km`;

// mm:ss for whole-second durations (e.g. a single interval's elapsed time)
export const formatDurationClock = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

// mm:ss.s for durations that may carry a fractional second (e.g. predicted times)
export const formatDurationDecimal = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const remainder = totalSeconds % 60;
  return `${minutes}:${remainder < 10 ? "0" : ""}${remainder.toFixed(1)}`;
};

export const formatDurationLong = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours === 0) return `${minutes} min`;
  return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
};

export const formatMinutes = (minutes: number) => `${minutes} min`;
