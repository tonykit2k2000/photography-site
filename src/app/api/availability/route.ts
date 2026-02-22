import { NextRequest, NextResponse } from "next/server";
import { getBusySlots } from "@/lib/google-calendar";

const SLOT_INTERVAL_MINUTES = 30;
const SESSION_DURATION_MINUTES = 60;

const PHOTOGRAPHER_TIMEZONE = process.env.PHOTOGRAPHER_TIMEZONE ?? "America/Chicago";

/**
 * Working hours per day of week.
 * Index 0 = Sunday … 6 = Saturday.  null = not available that day.
 * Hours are 24-hour (e.g. 16 = 4:00 PM, 21 = 9:00 PM).
 * "end" is when work ENDS — the last slot starts at (end - SESSION_DURATION_HOURS).
 * Update these whenever you change your Google Calendar appointment schedule.
 */
const WORKING_HOURS: (null | { start: number; end: number })[] = [
  { start: 6,  end: 21 },  // 0 Sunday     6:00 AM – 9:00 PM (last slot 8:00 PM)
  { start: 16, end: 21 },  // 1 Monday     4:00 PM – 9:00 PM (last slot 8:00 PM)
  { start: 16, end: 21 },  // 2 Tuesday    4:00 PM – 9:00 PM
  { start: 16, end: 21 },  // 3 Wednesday  4:00 PM – 9:00 PM
  { start: 16, end: 21 },  // 4 Thursday   4:00 PM – 9:00 PM
  { start: 16, end: 21 },  // 5 Friday     4:00 PM – 9:00 PM
  null,                    // 6 Saturday   unavailable (update if you work Saturdays)
];

function formatSlotKey(hour: number, minute: number): string {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function overlaps(
  slotStart: Date,
  slotEnd: Date,
  busyStart: Date,
  busyEnd: Date
): boolean {
  return busyStart < slotEnd && busyEnd > slotStart;
}

/**
 * Convert a naive local time (YYYY-MM-DD + HH:MM) in the photographer's
 * timezone to a proper UTC Date. Correctly handles DST transitions.
 */
function makeSlotDate(dateStr: string, hour: number, minute: number): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  const epoch0 = Date.UTC(y!, m! - 1, d!, hour, minute, 0);
  const d0 = new Date(epoch0);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: PHOTOGRAPHER_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(d0);
  const p: Record<string, number> = {};
  for (const part of parts) {
    if (part.type !== "literal") p[part.type] = parseInt(part.value, 10);
  }
  const tzEpoch = Date.UTC(p.year!, p.month! - 1, p.day!, p.hour!, p.minute!, p.second!);
  return new Date(epoch0 + (epoch0 - tzEpoch));
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dateStr = searchParams.get("date");

  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return NextResponse.json({ error: "Invalid date parameter" }, { status: 400 });
  }

  // Compare dates as strings in the photographer's timezone (YYYY-MM-DD)
  const todayInTZ = new Intl.DateTimeFormat("en-CA", {
    timeZone: PHOTOGRAPHER_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  if (dateStr < todayInTZ) {
    return NextResponse.json({ error: "Date is in the past" }, { status: 400 });
  }

  // Day-of-week in the photographer's timezone (0 = Sunday)
  // Using noon UTC ensures the UTC date always matches the local date for any ±12h offset
  const dayOfWeek = new Date(`${dateStr}T12:00:00Z`).getUTCDay();
  const hours = WORKING_HOURS[dayOfWeek];

  if (!hours) {
    return NextResponse.json({ availableSlots: [] });
  }

  // Query a wide UTC window to cover the full local day regardless of timezone offset
  const queryStart = new Date(`${dateStr}T00:00:00Z`);
  const nextDay = new Date(queryStart);
  nextDay.setUTCDate(nextDay.getUTCDate() + 1);

  let busySlots: Array<{ start: string; end: string }> = [];
  try {
    busySlots = await getBusySlots(queryStart, nextDay);
  } catch (err) {
    console.error("getBusySlots failed, returning all slots:", err);
  }

  const now = new Date();
  const availableSlots: string[] = [];

  for (let hour = hours.start; hour < hours.end; hour++) {
    for (let min = 0; min < 60; min += SLOT_INTERVAL_MINUTES) {
      const slotStart = makeSlotDate(dateStr, hour, min);
      const slotEnd = new Date(
        slotStart.getTime() + SESSION_DURATION_MINUTES * 60 * 1000
      );

      // Don't offer a slot whose session would run past end-of-day
      if (slotEnd > makeSlotDate(dateStr, hours.end, 0)) continue;

      // Skip slots already in the past (relevant when dateStr is today)
      if (slotStart <= now) continue;

      // Skip if any busy period overlaps this slot
      const isBusy = busySlots.some((busy) => {
        const busyStart = new Date(busy.start);
        const busyEnd = new Date(busy.end);
        return overlaps(slotStart, slotEnd, busyStart, busyEnd);
      });

      if (!isBusy) {
        availableSlots.push(formatSlotKey(hour, min));
      }
    }
  }

  return NextResponse.json({ availableSlots });
}
