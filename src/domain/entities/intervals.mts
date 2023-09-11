import {
  addDays,
  addMonths,
  addWeeks,
  differenceInDays,
  differenceInMonths,
  differenceInWeeks,
  endOfDay,
  endOfMonth,
  endOfWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";

export type Interval = {
  start: Date;
  end: Date;
};

export enum TimeUnit {
  Day = "day",
  Week = "week",
  Month = "month",
}

export const getRelativeInterval = (
  date: Date,
  count: number,
  unit: TimeUnit,
): Interval => {
  const end = endOf(date, unit);
  const start = subTime(startOf(date, unit), count, unit);
  return { start, end };
};

export const startOf = (date: Date, unit: TimeUnit): Date => {
  switch (unit) {
    case TimeUnit.Day:
      return startOfDay(date);
    case TimeUnit.Week:
      return startOfWeek(date);
    case TimeUnit.Month:
      return startOfMonth(date);
  }
};

export const endOf = (date: Date, unit: TimeUnit): Date => {
  switch (unit) {
    case TimeUnit.Day:
      return endOfDay(date);
    case TimeUnit.Week:
      return endOfWeek(date);
    case TimeUnit.Month:
      return endOfMonth(date);
  }
};

export const subTime = (date: Date, count: number, unit: TimeUnit): Date => {
  switch (unit) {
    case TimeUnit.Day:
      return subDays(date, count);
    case TimeUnit.Week:
      return subWeeks(date, count);
    case TimeUnit.Month:
      return subMonths(date, count);
  }
};

export const addTime = (date: Date, count: number, unit: TimeUnit): Date => {
  switch (unit) {
    case TimeUnit.Day:
      return addDays(date, count);
    case TimeUnit.Week:
      return addWeeks(date, count);
    case TimeUnit.Month:
      return addMonths(date, count);
  }
};

export const difference = (
  dateLeft: Date,
  dateRight: Date,
  unit: TimeUnit,
): number => {
  switch (unit) {
    case TimeUnit.Day:
      return differenceInDays(dateLeft, dateRight);
    case TimeUnit.Week:
      return differenceInWeeks(dateLeft, dateRight);
    case TimeUnit.Month:
      return differenceInMonths(dateLeft, dateRight);
  }
};
