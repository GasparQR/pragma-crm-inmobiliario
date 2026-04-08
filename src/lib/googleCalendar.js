const SCOPES = "https://www.googleapis.com/auth/calendar.events";
const CALENDAR_API = "https://www.googleapis.com/calendar/v3";
const DEFAULT_TOKEN_EXPIRY_SECONDS = 3600;
const DEFAULT_REMINDER_MINUTES = 60;

const STORAGE_KEY = "pragma_gcal_token";
const STORAGE_EXPIRY_KEY = "pragma_gcal_token_expiry";
const STORAGE_EMAIL_KEY = "pragma_gcal_email";
const CLIENT_ID_KEY = "pragma_gcal_client_id";

/**
 * Load the Google Identity Services script dynamically.
 * Resolves once `google.accounts` is available.
 */
function loadGisScript() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts) {
      resolve();
      return;
    }
    const existing = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]'
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("No se pudo cargar Google Identity Services"));
    document.head.appendChild(script);
  });
}

/** Save the configured Google Client ID */
export function saveClientId(clientId) {
  localStorage.setItem(CLIENT_ID_KEY, clientId);
}

/** Read the configured Google Client ID */
export function getClientId() {
  return localStorage.getItem(CLIENT_ID_KEY) || "";
}

/** Remove the saved client ID */
export function removeClientId() {
  localStorage.removeItem(CLIENT_ID_KEY);
}

/** Check whether a non-expired access token exists */
export function isConnected() {
  const token = localStorage.getItem(STORAGE_KEY);
  const expiry = localStorage.getItem(STORAGE_EXPIRY_KEY);
  if (!token || !expiry) return false;
  return Date.now() < Number(expiry);
}

/** Return the stored email or empty string */
export function getConnectedEmail() {
  if (!isConnected()) return "";
  return localStorage.getItem(STORAGE_EMAIL_KEY) || "";
}

/**
 * Start the Google OAuth2 implicit-grant flow.
 * Opens a consent popup and resolves with { accessToken, email }.
 */
export async function connect() {
  const clientId = getClientId();
  if (!clientId) {
    throw new Error("Configurá tu Google Client ID antes de conectar");
  }

  await loadGisScript();

  return new Promise((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPES,
      callback: async (tokenResponse) => {
        if (tokenResponse.error) {
          reject(new Error(tokenResponse.error));
          return;
        }
        const accessToken = tokenResponse.access_token;
        const expiresIn = tokenResponse.expires_in || DEFAULT_TOKEN_EXPIRY_SECONDS;
        const expiry = Date.now() + expiresIn * 1000;

        localStorage.setItem(STORAGE_KEY, accessToken);
        localStorage.setItem(STORAGE_EXPIRY_KEY, String(expiry));

        // Fetch the user's email via the userinfo endpoint
        try {
          const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (res.ok) {
            const info = await res.json();
            localStorage.setItem(STORAGE_EMAIL_KEY, info.email || "");
          }
        } catch {
          // non-critical
        }

        resolve({
          accessToken,
          email: localStorage.getItem(STORAGE_EMAIL_KEY) || "",
        });
      },
    });
    client.requestAccessToken();
  });
}

/** Clear stored tokens and disconnect */
export function disconnect() {
  const token = localStorage.getItem(STORAGE_KEY);
  if (token && window.google?.accounts?.oauth2) {
    window.google.accounts.oauth2.revoke(token, () => {});
  }
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STORAGE_EXPIRY_KEY);
  localStorage.removeItem(STORAGE_EMAIL_KEY);
}

/**
 * Create a Google Calendar event for a consultation / lead.
 *
 * @param {{ title: string, description?: string, date: string, contactName?: string }} params
 *   – date in "YYYY-MM-DD" format (follow-up date)
 * @returns {Promise<object>} The created event resource.
 */
export async function createCalendarEvent({ title, description, date, contactName }) {
  const token = localStorage.getItem(STORAGE_KEY);
  if (!token || !isConnected()) {
    throw new Error("No estás conectado a Google Calendar");
  }

  const summary = contactName
    ? `Seguimiento: ${contactName} – ${title}`
    : `Seguimiento: ${title}`;

  const body = {
    summary,
    description: description || "",
    start: { date },
    end: { date },
    reminders: {
      useDefault: false,
      overrides: [{ method: "popup", minutes: DEFAULT_REMINDER_MINUTES }],
    },
  };

  const res = await fetch(`${CALENDAR_API}/calendars/primary/events`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || "Error al crear evento en Google Calendar");
  }
  return res.json();
}
