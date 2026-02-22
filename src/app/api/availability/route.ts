import { NextRequest, NextResponse } from "next/server";
import { getBusySlots } from "@/lib/google-calendar";

// Working hours and slot configuration — adjust as needed
const DAY_START_HOUR = 8;          // 8:00 AM
const DAY_END_HOUR = 18;           // last slot starts at 6:00 PM (ends 7:00 PM)
const SLOT_INTERVAL_MINUTES = 30;
const SESSION_DURATION_MINUTES = 60;

const PHOTOGRAPHER_TIMEZONE = process.env.PHOTOGRAPHER_TIMEZONE ?? "America/Chicago";

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
  // Treat the naive datetime as UTC first
  const epoch0 = Date.UTC(y!, m! - 1, d!, hour, minute, 0);
  const d0 = new Date(epoch0);
  // Find what epoch0 (as UTC) looks like in the photographer's timezone
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
  // Reconstruct what epoch0 looks like in TZ, as if it were UTC
  const tzEpoch = Date.UTC(p.year!, p.month! - 1, p.day!, p.hour!, p.minute!, p.second!);
  // Offset = epoch0 - tzEpoch; apply to get the correct UTC instant
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

  // Query a wide UTC window to cover the full local day regardless of timezone offset
  const queryStart = new Date(`${dateStr}T00:00:00Z`);
  const nextDay = new Date(queryStart);
  nextDay.setUTCDate(nextDay.getUTCDate() + 1);

  let busySlots: Array<{ start: string; end: string }> = [];
  try {
    busySlots = await getBusySlots(queryStart, nextDay);
  } catch (err) {
    // If Google Calendar is unavailable, return all slots unfiltered
    console.error("getBusySlots failed, returning all slots:", err);
  }

  const now = new Date();
  const availableSlots: string[] = [];

  for (let hour = DAY_START_HOUR; hour <= DAY_END_HOUR; hour++) {
    for (let min = 0; min < 60; min += SLOT_INTERVAL_MINUTES) {
      // Ensure the slot start + session duration doesn't exceed the day end
      const slotStartMinutes = hour * 60 + min;
      const lastValidStartMinutes =
        DAY_END_HOUR * 60 - SESSION_DURATION_MINUTES + SLOT_INTERVAL_MINUTES;
      if (slotStartMinutes >= lastValidStartMinutes) continue;

      // Build slot times in the photographer's timezone
      const slotStart = makeSlotDate(dateStr, hour, min);
      const slotEnd = new Date(
        slotStart.getTime() + SESSION_DURATION_MINUTES * 60 * 1000
      );

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
