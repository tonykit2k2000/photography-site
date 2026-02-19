import "server-only";
import { google } from "googleapis";

if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY || !process.env.GOOGLE_CALENDAR_ID) {
  // Only warn — missing in local dev before credentials are set up
  console.warn("Google Calendar environment variables are not set");
}

function getGoogleAuth() {
  const encodedKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!encodedKey) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY environment variable is not set");
  }
  const serviceAccountKey = JSON.parse(
    Buffer.from(encodedKey, "base64").toString("utf-8")
  ) as {
    client_email: string;
    private_key: string;
  };

  return new google.auth.GoogleAuth({
    credentials: {
      client_email: serviceAccountKey.client_email,
      private_key: serviceAccountKey.private_key,
    },
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });
}

function getCalendar() {
  const auth = getGoogleAuth();
  return google.calendar({ version: "v3", auth });
}

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID!;

export interface BookingEventInput {
  title: string;
  description: string;
  startTime: Date;
  durationMinutes: number;
  location?: string;
  attendeeEmail: string;
  attendeeName: string;
}

/**
 * Create a Google Calendar event for a booked session.
 * Returns the created event ID.
 */
export async function createBookingEvent(
  input: BookingEventInput
): Promise<string> {
  const calendar = getCalendar();
  const endTime = new Date(
    input.startTime.getTime() + input.durationMinutes * 60 * 1000
  );

  const event = await calendar.events.insert({
    calendarId: CALENDAR_ID,
    sendUpdates: "none",
    requestBody: {
      summary: input.title,
      description: input.description,
      location: input.location,
      start: {
        dateTime: input.startTime.toISOString(),
        timeZone: "America/New_York",
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: "America/New_York",
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 }, // 24 hours before
          { method: "popup", minutes: 60 },        // 1 hour before
        ],
      },
    },
  });

  if (!event.data.id) {
    throw new Error("Failed to create Google Calendar event");
  }
  return event.data.id;
}

/**
 * Delete a Google Calendar event (e.g., when a booking is cancelled).
 */
export async function deleteBookingEvent(eventId: string): Promise<void> {
  const calendar = getCalendar();
  await calendar.events.delete({
    calendarId: CALENDAR_ID,
    eventId,
    sendUpdates: "all",
  });
}

/**
 * Get busy time slots for a given date range to show available booking times.
 */
export async function getBusySlots(
  start: Date,
  end: Date
): Promise<Array<{ start: string; end: string }>> {
  const calendar = getCalendar();
  const response = await calendar.freebusy.query({
    requestBody: {
      timeMin: start.toISOString(),
      timeMax: end.toISOString(),
      items: [{ id: CALENDAR_ID }],
    },
  });

  const calendars = response.data.calendars;
  if (!calendars || !calendars[CALENDAR_ID]) return [];

  return (calendars[CALENDAR_ID]?.busy ?? []).map((slot) => ({
    start: slot.start ?? "",
    end: slot.end ?? "",
  }));
}
