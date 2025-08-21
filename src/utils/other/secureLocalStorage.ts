"use client";

// Lightweight secure localStorage helper using Web Crypto (AES-GCM with PBKDF2)
// Notes:
// - Keys are derived from a device-scoped secret stored in localStorage
// - Each value uses a random salt and IV
// - This improves privacy against casual inspection, though client-only encryption
//   cannot protect against a fully compromised device or XSS.

const DEVICE_SECRET_KEY = "__mm_device_secret_v1";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.crypto !== "undefined";
}

function toBase64(bytes: ArrayBuffer): string {
  if (!isBrowser()) return "";
  const uint8Array = new Uint8Array(bytes);
  let binary = "";
  for (let i = 0; i < uint8Array.byteLength; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binary);
}

function fromBase64(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

async function getOrCreateDeviceSecret(): Promise<string> {
  if (!isBrowser()) return "";
  let secret = window.localStorage.getItem(DEVICE_SECRET_KEY);
  if (!secret) {
    const random = new Uint8Array(32);
    window.crypto.getRandomValues(random);
    let binary = "";
    for (let i = 0; i < random.length; i++) binary += String.fromCharCode(random[i]);
    secret = btoa(binary);
    window.localStorage.setItem(DEVICE_SECRET_KEY, secret);
  }
  return secret;
}

async function importKeyFromSecret(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    {name: "PBKDF2"},
    false,
    ["deriveBits", "deriveKey"],
  );
  // Random salt per value will be supplied during derivation
  return keyMaterial;
}

async function deriveAesGcmKey(keyMaterial: CryptoKey, salt: ArrayBuffer): Promise<CryptoKey> {
  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 150_000,
      hash: "SHA-256",
    },
    keyMaterial,
    {name: "AES-GCM", length: 256},
    false,
    ["encrypt", "decrypt"],
  );
}

export interface SecureStoredEnvelopeV1 {
  v: 1;
  iv: string; // base64
  s: string; // salt, base64
  d: string; // ciphertext, base64
}

export class SecureLocalStorage {
  static async setItem(key: string, value: unknown): Promise<void> {
    if (!isBrowser()) return;
    try {
      const secret = await getOrCreateDeviceSecret();
      const keyMaterial = await importKeyFromSecret(secret);

      const iv = new Uint8Array(12);
      window.crypto.getRandomValues(iv);

      const salt = new Uint8Array(16);
      window.crypto.getRandomValues(salt);

      const aesKey = await deriveAesGcmKey(keyMaterial, salt.buffer);

      const enc = new TextEncoder();
      const plaintext = enc.encode(JSON.stringify(value));

      const ciphertext = await window.crypto.subtle.encrypt(
        {name: "AES-GCM", iv},
        aesKey,
        plaintext,
      );

      const envelope: SecureStoredEnvelopeV1 = {
        v: 1,
        iv: toBase64(iv.buffer),
        s: toBase64(salt.buffer),
        d: toBase64(ciphertext),
      };

      window.localStorage.setItem(key, JSON.stringify(envelope));
    } catch (err) {
      // Best-effort fallback: store plain if crypto fails (avoid data loss)
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (_) {
        console.error("Failed to store item in localStorage", err);
      }
    }
  }

  static async getItem<T>(key: string): Promise<T | null> {
    if (!isBrowser()) return null;
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;

    try {
      const parsed: SecureStoredEnvelopeV1 | unknown = JSON.parse(raw);
      if (
        typeof parsed === "object" &&
        parsed !== null &&
        (parsed as SecureStoredEnvelopeV1).v === 1
      ) {
        const env = parsed as SecureStoredEnvelopeV1;
        const secret = await getOrCreateDeviceSecret();
        const keyMaterial = await importKeyFromSecret(secret);
        const aesKey = await deriveAesGcmKey(keyMaterial, fromBase64(env.s));

        const decrypted = await window.crypto.subtle.decrypt(
          {name: "AES-GCM", iv: new Uint8Array(fromBase64(env.iv))},
          aesKey,
          fromBase64(env.d),
        );
        const dec = new TextDecoder();
        const json = dec.decode(decrypted);
        return JSON.parse(json) as T;
      }
      // Legacy/plain fallback
      return JSON.parse(raw) as T;
    } catch (_) {
      try {
        return JSON.parse(raw) as T;
      } catch {
        return null;
      }
    }
  }

  static removeItem(key: string): void {
    if (!isBrowser()) return;
    window.localStorage.removeItem(key);
  }
}

export default SecureLocalStorage;
