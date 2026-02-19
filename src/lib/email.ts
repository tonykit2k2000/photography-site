import "server-only";
import { Resend } from "resend";

const FROM = process.env.EMAIL_FROM ?? "hello@example.com";

function getResend(): Resend {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY environment variable is not set");
  }
  return new Resend(process.env.RESEND_API_KEY);
}

export interface BookingConfirmationData {
  customerName: string;
  customerEmail: string;
  sessionType: string;
  scheduledAt: Date;
  location?: string;
  totalPriceCents: number;
  sessionId: string;
}

export interface PaymentReceiptData {
  customerName: string;
  customerEmail: string;
  amountCents: number;
  paymentType: string;
  remainingCents: number;
  sessionType: string;
  sessionId: string;
}

export interface GalleryReadyData {
  customerName: string;
  customerEmail: string;
  galleryUrl: string;
  galleryPin: string;
  photoCount: number;
  sessionType: string;
}

/**
 * Send a booking confirmation email to the customer.
 */
export async function sendBookingConfirmation(
  data: BookingConfirmationData
): Promise<void> {
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
  }).format(data.scheduledAt);

  const totalFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(data.totalPriceCents / 100);

  await getResend().emails.send({
    from: FROM,
    to: data.customerEmail,
    subject: `Booking Confirmed: ${data.sessionType} Session`,
    html: `
      <h2>Your session is confirmed!</h2>
      <p>Hi ${data.customerName},</p>
      <p>Your <strong>${data.sessionType}</strong> session has been booked for:</p>
      <p><strong>${formattedDate}</strong>${data.location ? `<br>Location: ${data.location}` : ""}</p>
      <p>Total: <strong>${totalFormatted}</strong></p>
      <p>You'll receive a Google Calendar invite shortly.</p>
      <p>Questions? Reply to this email anytime.</p>
    `,
  });
}

/**
 * Send a payment receipt email to the customer.
 */
export async function sendPaymentReceipt(
  data: PaymentReceiptData
): Promise<void> {
  const paidFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(data.amountCents / 100);

  const remainingFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(data.remainingCents / 100);

  const subject =
    data.remainingCents <= 0
      ? "Payment Received – Paid in Full!"
      : `Payment Received – ${remainingFormatted} remaining`;

  await getResend().emails.send({
    from: FROM,
    to: data.customerEmail,
    subject,
    html: `
      <h2>Payment Received</h2>
      <p>Hi ${data.customerName},</p>
      <p>We received your payment of <strong>${paidFormatted}</strong> for your ${data.sessionType} session.</p>
      ${
        data.remainingCents > 0
          ? `<p>Remaining balance: <strong>${remainingFormatted}</strong></p>`
          : `<p><strong>Your session is now paid in full!</strong> Your photo gallery will be ready after your session.</p>`
      }
      <p>Thank you!</p>
    `,
  });
}

/**
 * Send a "gallery is ready" email with the gallery URL and PIN.
 */
export async function sendGalleryReady(data: GalleryReadyData): Promise<void> {
  await getResend().emails.send({
    from: FROM,
    to: data.customerEmail,
    subject: "Your Photo Gallery is Ready!",
    html: `
      <h2>Your photos are ready!</h2>
      <p>Hi ${data.customerName},</p>
      <p>Your ${data.sessionType} photos are now available to view and download.</p>
      <p>
        <strong>Gallery Link:</strong><br>
        <a href="${data.galleryUrl}">${data.galleryUrl}</a>
      </p>
      <p><strong>Your PIN:</strong> ${data.galleryPin}</p>
      <p>You can view and download up to <strong>${data.photoCount} photos</strong>.</p>
      <p><em>Keep this email safe — your PIN and gallery link are private to you.</em></p>
      <p>Enjoy your photos!</p>
    `,
  });
}
