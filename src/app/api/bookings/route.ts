import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { customers, sessions, galleries } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createBookingEvent, getBusySlots } from "@/lib/google-calendar";
import { sendBookingConfirmation } from "@/lib/email";
import { generateAccessToken, hashPin } from "@/lib/gallery-auth";

const bookingSchema = z.object({
  firstName: z.string().min(1).max(100).trim(),
  lastName: z.string().min(1).max(100).trim(),
  email: z.string().email().trim().toLowerCase(),
  phone: z.string().min(7).max(20).trim(),
  sessionType: z.string().min(1).max(100),
  scheduledAt: z.string().datetime(),
  location: z.string().max(300).trim().optional(),
  notes: z.string().max(1000).trim().optional(),
  totalPriceCents: z.number().int().min(0),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request data", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const data = parsed.data;
  const scheduledAt = new Date(data.scheduledAt);

  if (isNaN(scheduledAt.getTime()) || scheduledAt < new Date()) {
    return NextResponse.json(
      { error: "Invalid or past date/time" },
      { status: 422 }
    );
  }

  // Conflict check — reject if the time slot is already booked on Google Calendar
  try {
    const sessionEnd = new Date(scheduledAt.getTime() + 60 * 60 * 1000);
    const busySlots = await getBusySlots(scheduledAt, sessionEnd);
    const conflict = busySlots.some((slot) => {
      const bStart = new Date(slot.start);
      const bEnd = new Date(slot.end);
      return bStart < sessionEnd && bEnd > scheduledAt;
    });
    if (conflict) {
      return NextResponse.json(
        { error: "That time slot is no longer available. Please choose another time." },
        { status: 409 }
      );
    }
  } catch {
    // If Google Calendar is unreachable, allow booking to proceed
  }

  try {
    // Upsert customer (find by email, or create)
    const existingCustomer = await db.query.customers.findFirst({
      where: eq(customers.email, data.email),
    });

    let customerId: string;
    if (existingCustomer) {
      customerId = existingCustomer.id;
    } else {
      const [newCustomer] = await db
        .insert(customers)
        .values({
          email: data.email,
          phone: data.phone,
          firstName: data.firstName,
          lastName: data.lastName,
        })
        .returning({ id: customers.id });

      if (!newCustomer) throw new Error("Failed to create customer");
      customerId = newCustomer.id;
    }

    // Create session
    const sessionTitle = `${data.firstName} ${data.lastName} — ${data.sessionType}`;
    const [newSession] = await db
      .insert(sessions)
      .values({
        customerId,
        title: sessionTitle,
        sessionType: data.sessionType,
        scheduledAt,
        durationMinutes: 60,
        location: data.location,
        notes: data.notes,
        status: "pending",
        totalPriceCents: data.totalPriceCents,
        maxPhotoCount: 25,
      })
      .returning({ id: sessions.id });

    if (!newSession) throw new Error("Failed to create session");

    // Pre-create the gallery record (inactive until full payment received)
    const accessToken = generateAccessToken();
    // Temporary placeholder hash — photographer sets the real PIN via admin
    const tempHash = await hashPin(Math.random().toString(36).slice(2, 8));
    await db.insert(galleries).values({
      sessionId: newSession.id,
      accessToken,
      passwordHash: tempHash,
      isActive: false,
      photoLimit: 25,
    });

    // Create Google Calendar event (non-blocking — don't fail the booking if this fails)
    try {
      const eventId = await createBookingEvent({
        title: sessionTitle,
        description: `Customer: ${data.firstName} ${data.lastName}\nEmail: ${data.email}\nPhone: ${data.phone}\nNotes: ${data.notes ?? "None"}`,
        startTime: scheduledAt,
        durationMinutes: 60,
        location: data.location,
        attendeeEmail: data.email,
        attendeeName: `${data.firstName} ${data.lastName}`,
      });

      await db
        .update(sessions)
        .set({ googleEventId: eventId })
        .where(eq(sessions.id, newSession.id));
    } catch (calendarError) {
      console.error("Google Calendar event creation failed:", calendarError);
      // Continue — booking is still created in the database
    }

    // Send confirmation email (non-blocking)
    sendBookingConfirmation({
      customerName: `${data.firstName} ${data.lastName}`,
      customerEmail: data.email,
      sessionType: data.sessionType,
      scheduledAt,
      location: data.location,
      totalPriceCents: data.totalPriceCents,
      sessionId: newSession.id,
    }).catch((err) => console.error("Booking confirmation email failed:", err));

    return NextResponse.json(
      { sessionId: newSession.id, totalPriceCents: data.totalPriceCents },
      { status: 201 }
    );
  } catch (error) {
    console.error("Booking creation error:", error);
    return NextResponse.json(
      { error: "Failed to create booking. Please try again." },
      { status: 500 }
    );
  }
}
