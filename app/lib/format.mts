import { format } from "date-fns";
import { Interval, TimeUnit } from "../../domain/intervals.mjs";

export const formatDate = (date?: Date): string => {
  if (date === undefined) {
    return "-";
  }

  return format(date, "d MMM yyyy");
};

export const formatTime = (date?: Date): string => {
  if (date === undefined) {
    return "-";
  }

  const time = format(date, "HH:mm");

  return `${formatDate(date)} ${time}`;
};

export const formatInterval = (interval: Interval): string => {
  return `${formatDate(interval.start)}-${formatDate(interval.end)}`;
};

export const formatNumber = (
  value?: number,
  fractionDigits: number = 1,
): string => {
  if (value === undefined) {
    return "-";
  }

  return value.toFixed(fractionDigits);
};

export const formatStep = (date: Date, timeUnit: TimeUnit): string => {
  if (timeUnit === TimeUnit.Month) {
    return format(date, "MMM yyyy");
  }

  return formatDate(date);
};
