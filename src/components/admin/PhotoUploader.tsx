"use client";

import { useState, useRef } from "react";
import type { GalleryPhoto } from "@/db/schema";
import styles from "./PhotoUploader.module.css";

interface PhotoUploaderProps {
  galleryId: string;
  onUploaded: (photo: GalleryPhoto) => void;
}

interface UploadFile {
  file: File;
  status: "pending" | "uploading" | "done" | "error";
  progress: number;
  error?: string;
}

export function PhotoUploader({ galleryId, onUploaded }: PhotoUploaderProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function addFiles(newFiles: FileList | null) {
    if (!newFiles) return;
    const accepted = Array.from(newFiles).filter((f) =>
      f.type.startsWith("image/")
    );
    setFiles((prev) => [
      ...prev,
      ...accepted.map((file) => ({
        file,
        status: "pending" as const,
        progress: 0,
      })),
    ]);
    // Auto-start uploads
    accepted.forEach((file) => uploadFile(file));
  }

  async function uploadFile(file: File) {
    setFiles((prev) =>
      prev.map((f) =>
        f.file === file ? { ...f, status: "uploading" } : f
      )
    );

    try {
      // 1. Get a presigned PUT URL from the server
      const res = await fetch("/api/admin/galleries/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          galleryId,
          filename: file.name,
          contentType: file.type,
          fileSizeBytes: file.size,
        }),
      });

      if (!res.ok) throw new Error("Failed to get upload URL");
      const { uploadUrl, s3Key, photoId } = (await res.json()) as {
        uploadUrl: string;
        s3Key: string;
        photoId: string;
      };

      // 2. Upload directly to S3 using the presigned URL (never through our server)
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadRes.ok) throw new Error("S3 upload failed");

      // 3. Confirm upload with server
      const confirmRes = await fetch(
        `/api/admin/galleries/upload/${photoId}/confirm`,
        { method: "POST" }
      );

      if (!confirmRes.ok) throw new Error("Upload confirmation failed");
      const { photo } = (await confirmRes.json()) as {
        photo: GalleryPhoto;
      };

      setFiles((prev) =>
        prev.map((f) =>
          f.file === file ? { ...f, status: "done", progress: 100 } : f
        )
      );
      onUploaded(photo);
    } catch (err) {
      setFiles((prev) =>
        prev.map((f) =>
          f.file === file
            ? {
                ...f,
                status: "error",
                error: err instanceof Error ? err.message : "Upload failed",
              }
            : f
        )
      );
    }
  }

  return (
    <div>
      <div
        className={`${styles.dropZone} ${isDragging ? styles.dragging : ""}`}
        onDragEnter={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          addFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload photos"
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      >
        <span className={styles.dropIcon} aria-hidden="true">
          📁
        </span>
        <p className={styles.dropText}>
          Drag photos here or <span className={styles.dropLink}>click to select</span>
        </p>
        <p className={styles.dropHint}>JPEG, PNG, WebP supported</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className={styles.hiddenInput}
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <ul className={styles.fileList}>
          {files.map((f, i) => (
            <li key={i} className={styles.fileItem}>
              <span className={styles.fileName}>{f.file.name}</span>
              <span className={`${styles.fileStatus} ${styles[`status_${f.status}`]}`}>
                {f.status === "uploading"
                  ? "Uploading…"
                  : f.status === "done"
                  ? "✓ Done"
                  : f.status === "error"
                  ? `✗ ${f.error}`
                  : "Pending"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
