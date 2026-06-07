// Posting-schedule math: turn "N posts per <period>" into concrete future slots.
//
// This implements the logic for *when* new tweets get scheduled. The cron
// generator fills the gap between how many posts are already queued and how many
// the schedule calls for over the planning horizon; a manual run can ask for an
// exact count.

export type Period = "day" | "week" | "month";

const DAY_MS = 24 * 60 * 60 * 1000;

function periodDays(period: Period): number {
  return period === "day" ? 1 : period === "week" ? 7 : 30;
}

/** Average gap (ms) between posts for a given cadence. */
export function intervalMs(postsPerPeriod: number, period: Period): number {
  const perDay = Math.max(postsPerPeriod / periodDays(period), 0.001);
  return DAY_MS / perDay;
}

/**
 * Exactly `count` future time slots, evenly spaced at the cadence, starting a
 * couple of hours out so nothing is "due" the instant it's created.
 */
export function makeSlots(
  count: number,
  postsPerPeriod: number,
  period: Period,
  from: Date = new Date(),
): Date[] {
  if (count <= 0) return [];
  const step = intervalMs(postsPerPeriod, period);
  const slots: Date[] = [];
  let t = from.getTime() + 2 * 60 * 60 * 1000;
  for (let i = 0; i < count; i++) {
    slots.push(new Date(t));
    t += step;
  }
  return slots;
}

/**
 * Gap-fill: how many posts the schedule still needs over the planning horizon
 * (one period ahead, min 7 days), returned as concrete slots. Returns [] when
 * the queue is already full.
 */
export function nextSlots(opts: {
  postsPerPeriod: number;
  period: Period;
  alreadyQueued: number;
  from?: Date;
}): Date[] {
  const { postsPerPeriod, period, alreadyQueued } = opts;
  const horizon = Math.max(periodDays(period), 7);
  const target = Math.ceil((postsPerPeriod / periodDays(period)) * horizon);
  const need = Math.max(target - alreadyQueued, 0);
  return makeSlots(need, postsPerPeriod, period, opts.from);
}
