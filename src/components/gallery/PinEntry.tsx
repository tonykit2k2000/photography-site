"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./PinEntry.module.css";

interface PinEntryProps {
  token: string;
}

export function PinEntry({ token }: PinEntryProps) {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const MAX_ATTEMPTS = 5;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (attempts >= MAX_ATTEMPTS) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/galleries/${token}/unlock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });

      if (res.ok) {
        router.replace(`/gallery/${token}`);
        router.refresh();
      } else if (res.status === 401) {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        const remaining = MAX_ATTEMPTS - newAttempts;
        setError(
          remaining > 0
            ? `Incorrect PIN. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`
            : "Too many incorrect attempts. Please wait before trying again."
        );
        setPin("");
      } else {
        setError("Gallery not found or not yet available.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const isLocked = attempts >= MAX_ATTEMPTS;

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label htmlFor="pin" className={styles.label}>
          Gallery PIN
        </label>
        <input
          id="pin"
          type="password"
          inputMode="numeric"
          className={styles.input}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
          placeholder="Enter your PIN"
          maxLength={8}
          required
          disabled={isLocked || isSubmitting}
          autoFocus
          autoComplete="one-time-code"
        />
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        className={styles.submit}
        disabled={isSubmitting || isLocked || pin.length < 4}
      >
        {isSubmitting ? "Verifying…" : "View My Photos"}
      </button>
    </form>
  );
}
