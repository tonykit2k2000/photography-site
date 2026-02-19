"use client";

import { useState, useEffect } from "react";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import styles from "./PaymentStep.module.css";
import { formatCents } from "./formatCents";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface PaymentStepProps {
  sessionId: string;
  totalPriceCents: number;
  sessionType: string;
  onComplete: () => void;
}

export function PaymentStep(props: PaymentStepProps) {
  const { sessionId, totalPriceCents, sessionType, onComplete } = props;
  const [depositOnly, setDepositOnly] = useState(true);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const depositAmountCents = Math.round(totalPriceCents * 0.3); // 30% deposit
  const amountCents = depositOnly ? depositAmountCents : totalPriceCents;
  const paymentType = depositOnly ? "deposit" : "full";

  useEffect(() => {
    setClientSecret(null);
    setError(null);
    setIsLoading(true);

    fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, amountCents, paymentType }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to initialize payment");
        return res.json() as Promise<{ clientSecret: string }>;
      })
      .then((data) => setClientSecret(data.clientSecret))
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Payment setup failed");
      })
      .finally(() => setIsLoading(false));
  }, [sessionId, amountCents, paymentType]);

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>Payment</h2>
      <p className={styles.subtitle}>{sessionType} session</p>

      <div className={styles.toggle}>
        <button
          className={`${styles.toggleBtn} ${depositOnly ? styles.toggleBtnActive : ""}`}
          onClick={() => setDepositOnly(true)}
          type="button"
        >
          <span>Pay Deposit</span>
          <span className={styles.toggleAmount}>{formatCents(depositAmountCents)}</span>
          <span className={styles.toggleHint}>30% now, rest before session</span>
        </button>
        <button
          className={`${styles.toggleBtn} ${!depositOnly ? styles.toggleBtnActive : ""}`}
          onClick={() => setDepositOnly(false)}
          type="button"
        >
          <span>Pay in Full</span>
          <span className={styles.toggleAmount}>{formatCents(totalPriceCents)}</span>
          <span className={styles.toggleHint}>Full amount upfront</span>
        </button>
      </div>

      {error && <p className={styles.error} role="alert">{error}</p>}

      {isLoading && <p className={styles.loading}>Setting up payment…</p>}

      {clientSecret && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm
            amountCents={amountCents}
            onComplete={onComplete}
          />
        </Elements>
      )}
    </div>
  );
}

function CheckoutForm({
  amountCents,
  onComplete,
}: {
  amountCents: number;
  onComplete: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError(null);

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/schedule`,
      },
      redirect: "if_required",
    });

    if (stripeError) {
      setError(stripeError.message ?? "Payment failed");
      setIsProcessing(false);
    } else {
      onComplete();
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <PaymentElement />

      {error && <p className={styles.error} role="alert">{error}</p>}

      <button type="submit" className={styles.submit} disabled={isProcessing || !stripe}>
        {isProcessing
          ? "Processing…"
          : `Pay ${formatCents(amountCents)}`}
      </button>

      <p className={styles.secureNote}>
        🔒 Payments are secured and processed by Stripe. Your card details are
        never stored on our servers.
      </p>
    </form>
  );
}
