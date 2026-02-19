import "server-only";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

const BCRYPT_COST = 12;

/**
 * Hash a PIN for secure storage.
 */
export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, BCRYPT_COST);
}

/**
 * Verify a submitted PIN against a stored bcrypt hash.
 */
export async function verifyPin(
  pin: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(pin, hash);
}

/**
 * Generate a cryptographically random gallery access token (64 hex chars).
 * This is the public URL slug — not secret on its own, but unguessable.
 */
export function generateAccessToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Generate a cryptographically random gallery session token (64 hex chars).
 * Stored in the database and as an httpOnly cookie to track unlock state.
 */
export function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Calculate the expiry timestamp for a gallery session (24 hours from now).
 */
export function getSessionExpiry(): Date {
  return new Date(Date.now() + 24 * 60 * 60 * 1000);
}
