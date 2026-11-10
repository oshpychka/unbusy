export type ThresholdState = "green" | "yellow" | "red";

export type ThresholdInput = {
  used: number;
  limit: number;
  warnPct: number;
  alertPct: number;
  elapsedDays: number;
  periodDays: number;
};

export function evaluateThreshold({
  used,
  limit,
  warnPct,
  alertPct,
  elapsedDays,
  periodDays,
}: ThresholdInput) {
  const usedPct = limit > 0 ? Math.round((used / limit) * 100) : 0;
  const state: ThresholdState =
    usedPct >= alertPct ? "red" : usedPct >= warnPct ? "yellow" : "green";
  const pace = elapsedDays > 0 ? used / elapsedDays : 0;
  const forecast = Math.round(pace * periodDays * 10) / 10;
  const forecastPct = limit > 0 ? Math.round((forecast / limit) * 100) : 0;
  return { usedPct, state, forecast, forecastPct, overLimit: forecast > limit };
}
