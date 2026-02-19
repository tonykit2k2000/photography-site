"use client";

import { useState } from "react";
import { sessionTypes, sessionPricing } from "@/config/portfolio-images";
import styles from "./BookingForm.module.css";
import { PaymentStep } from "@/components/payments/PaymentStep";

type Step = "details" | "payment" | "confirmed";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  sessionType: string;
  preferredDate: string;
  preferredTime: string;
  location: string;
  notes: string;
}

const initialForm: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  sessionType: "",
  preferredDate: "",
  preferredTime: "",
  location: "",
  notes: "",
};

export function BookingForm() {
  const [step, setStep] = useState<Step>("details");
  const [formData, setFormData] = useState<FormData>(initialForm);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [totalPriceCents, setTotalPriceCents] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedPricing =
    formData.sessionType in sessionPricing
      ? sessionPricing[formData.sessionType as keyof typeof sessionPricing] ?? 0
      : 0;

  async function handleDetailsSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          totalPriceCents: selectedPricing,
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to create booking");
      }

      const data = (await res.json()) as {
        sessionId: string;
        totalPriceCents: number;
      };
      setSessionId(data.sessionId);
      setTotalPriceCents(data.totalPriceCents);
      setStep("payment");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleField(field: keyof FormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  if (step === "confirmed") {
    return (
      <div className={styles.confirmed}>
        <div className={styles.confirmedIcon}>✓</div>
        <h2 className={styles.confirmedTitle}>You&apos;re all set!</h2>
        <p className={styles.confirmedText}>
          Check your email for a booking confirmation and Google Calendar invite.
          I&apos;ll be in touch soon!
        </p>
      </div>
    );
  }

  if (step === "payment" && sessionId) {
    return (
      <PaymentStep
        sessionId={sessionId}
        totalPriceCents={totalPriceCents}
        sessionType={formData.sessionType}
        onComplete={() => setStep("confirmed")}
      />
    );
  }

  return (
    <form className={styles.form} onSubmit={handleDetailsSubmit} noValidate>
      <h2 className={styles.stepTitle}>Session Details</h2>

      {error && <p className={styles.error} role="alert">{error}</p>}

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="firstName" className={styles.label}>
            First Name <span aria-hidden="true">*</span>
          </label>
          <input
            id="firstName"
            type="text"
            className={styles.input}
            value={formData.firstName}
            onChange={(e) => handleField("firstName", e.target.value)}
            required
            autoComplete="given-name"
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="lastName" className={styles.label}>
            Last Name <span aria-hidden="true">*</span>
          </label>
          <input
            id="lastName"
            type="text"
            className={styles.input}
            value={formData.lastName}
            onChange={(e) => handleField("lastName", e.target.value)}
            required
            autoComplete="family-name"
          />
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="email" className={styles.label}>
          Email Address <span aria-hidden="true">*</span>
        </label>
        <input
          id="email"
          type="email"
          className={styles.input}
          value={formData.email}
          onChange={(e) => handleField("email", e.target.value)}
          required
          autoComplete="email"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="phone" className={styles.label}>
          Phone Number <span aria-hidden="true">*</span>
        </label>
        <input
          id="phone"
          type="tel"
          className={styles.input}
          value={formData.phone}
          onChange={(e) => handleField("phone", e.target.value)}
          required
          autoComplete="tel"
          placeholder="(555) 555-5555"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="sessionType" className={styles.label}>
          Session Type <span aria-hidden="true">*</span>
        </label>
        <select
          id="sessionType"
          className={styles.select}
          value={formData.sessionType}
          onChange={(e) => handleField("sessionType", e.target.value)}
          required
        >
          <option value="">Select a session type</option>
          {sessionTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        {selectedPricing > 0 && (
          <p className={styles.priceHint}>
            Starting at{" "}
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(selectedPricing / 100)}
          </p>
        )}
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="preferredDate" className={styles.label}>
            Preferred Date <span aria-hidden="true">*</span>
          </label>
          <input
            id="preferredDate"
            type="date"
            className={styles.input}
            value={formData.preferredDate}
            onChange={(e) => handleField("preferredDate", e.target.value)}
            required
            min={new Date().toISOString().split("T")[0]}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="preferredTime" className={styles.label}>
            Preferred Time <span aria-hidden="true">*</span>
          </label>
          <input
            id="preferredTime"
            type="time"
            className={styles.input}
            value={formData.preferredTime}
            onChange={(e) => handleField("preferredTime", e.target.value)}
            required
          />
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="location" className={styles.label}>
          Preferred Location
        </label>
        <input
          id="location"
          type="text"
          className={styles.input}
          value={formData.location}
          onChange={(e) => handleField("location", e.target.value)}
          placeholder="e.g. Outdoor park, studio, your home"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="notes" className={styles.label}>
          Additional Notes
        </label>
        <textarea
          id="notes"
          className={styles.textarea}
          value={formData.notes}
          onChange={(e) => handleField("notes", e.target.value)}
          rows={3}
          placeholder="Any special requests, number of people, etc."
        />
      </div>

      <button type="submit" className={styles.submit} disabled={isSubmitting}>
        {isSubmitting ? "Submitting…" : "Continue to Payment"}
      </button>
    </form>
  );
}
