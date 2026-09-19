const getTimeParts = (timeSeconds?: number | null) => {
  const totalSeconds = timeSeconds ?? 0;

  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
};

export const formatTimeInput = (timeSeconds?: number | null) => {
  const { hours, minutes, seconds } = getTimeParts(timeSeconds);
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
};

export const normalizeTimeInput = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 6);

  if (!digits) return "";
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}:${digits.slice(2)}`;

  return `${digits.slice(0, 2)}:${digits.slice(2, 4)}:${digits.slice(4, 6)}`;
};

export const parseTimeInput = (value: string) => {
  const normalized = normalizeTimeInput(value);

  if (!normalized) return undefined;

  const [hoursText = "0", minutesText = "0", secondsText = "0"] = normalized.split(":");
  const hours = Number(hoursText);
  const minutes = Number(minutesText);
  const seconds = Number(secondsText);

  if (![hours, minutes, seconds].every((part) => Number.isInteger(part) && part >= 0)) {
    return undefined;
  }

  if (minutes > 59 || seconds > 59) {
    return undefined;
  }

  return hours * 3600 + minutes * 60 + seconds;
};
