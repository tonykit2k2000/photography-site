"use client";

import { useState } from "react";
import type { Gallery, GalleryPhoto } from "@/db/schema";
import { PhotoUploader } from "./PhotoUploader";
import styles from "./GalleryManager.module.css";

interface GalleryManagerProps {
  gallery: Gallery;
  photos: GalleryPhoto[];
  sessionId: string;
}

export function GalleryManager({
  gallery,
  photos: initialPhotos,
  sessionId,
}: GalleryManagerProps) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinSuccess, setPinSuccess] = useState(false);
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [isTogglingActive, setIsTogglingActive] = useState(false);
  const [isActive, setIsActive] = useState(gallery.isActive);

  const baseUrl =
    typeof window !== "undefined" ? window.location.origin : "";
  const galleryUrl = `${baseUrl}/gallery/${gallery.accessToken}`;

  async function handleSetPin(e: React.FormEvent) {
    e.preventDefault();
    if (pin.length < 4) {
      setPinError("PIN must be at least 4 digits");
      return;
    }
    setPinError(null);
    setIsSettingPin(true);
    try {
      const res = await fetch(`/api/admin/galleries/${gallery.id}/pin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      if (!res.ok) throw new Error("Failed to set PIN");
      setPinSuccess(true);
      setPin("");
      setTimeout(() => setPinSuccess(false), 3000);
    } catch {
      setPinError("Failed to set PIN. Please try again.");
    } finally {
      setIsSettingPin(false);
    }
  }

  async function handleToggleActive() {
    setIsTogglingActive(true);
    try {
      const res = await fetch(`/api/admin/galleries/${gallery.id}/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (!res.ok) throw new Error("Failed to update gallery status");
      setIsActive(!isActive);
    } catch {
      alert("Failed to update gallery status.");
    } finally {
      setIsTogglingActive(false);
    }
  }

  return (
    <section>
      <div className={styles.header}>
        <h2 className={styles.title}>Gallery</h2>
        <span className={`${styles.statusBadge} ${isActive ? styles.active : styles.inactive}`}>
          {isActive ? "Active" : "Inactive"}
        </span>
      </div>

      {/* Gallery URL */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Gallery URL</h3>
        <div className={styles.urlRow}>
          <input
            className={styles.urlInput}
            value={galleryUrl}
            readOnly
            onClick={(e) =>
              (e.target as HTMLInputElement).select()
            }
          />
          <button
            className={styles.copyBtn}
            type="button"
            onClick={() => navigator.clipboard.writeText(galleryUrl)}
          >
            Copy
          </button>
        </div>
        <p className={styles.hint}>
          Share this link with the customer after setting the PIN.
        </p>

        <button
          className={`${styles.toggleBtn} ${isActive ? styles.deactivateBtn : styles.activateBtn}`}
          onClick={handleToggleActive}
          disabled={isTogglingActive}
          type="button"
        >
          {isTogglingActive
            ? "Updating…"
            : isActive
            ? "Deactivate Gallery"
            : "Activate Gallery"}
        </button>
      </div>

      {/* PIN Management */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Set Customer PIN</h3>
        <form onSubmit={handleSetPin} className={styles.pinForm}>
          <input
            type="text"
            inputMode="numeric"
            className={styles.pinInput}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            placeholder="4–8 digit PIN"
            maxLength={8}
            minLength={4}
            pattern="\d{4,8}"
          />
          <button
            type="submit"
            className={styles.pinBtn}
            disabled={isSettingPin || pin.length < 4}
          >
            {isSettingPin ? "Saving…" : "Set PIN"}
          </button>
        </form>
        {pinError && (
          <p className={styles.pinError} role="alert">
            {pinError}
          </p>
        )}
        {pinSuccess && (
          <p className={styles.pinSuccess} role="status">
            ✓ PIN updated successfully
          </p>
        )}
        <p className={styles.hint}>
          This PIN will be emailed to the customer when the gallery is activated.
          Changing the PIN invalidates any existing gallery sessions.
        </p>
      </div>

      {/* Photo Upload */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>
          Photos ({photos.length} / {gallery.photoLimit})
        </h3>
        <PhotoUploader
          galleryId={gallery.id}
          onUploaded={(newPhoto) => setPhotos((prev) => [...prev, newPhoto])}
        />

        {photos.length > 0 && (
          <div className={styles.photoGrid}>
            {photos.map((photo) => (
              <div key={photo.id} className={styles.photoThumb}>
                <span className={styles.photoName}>{photo.filename}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
