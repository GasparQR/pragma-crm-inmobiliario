const SCOPES = 'https://www.googleapis.com/auth/calendar.events';
const TOKEN_KEY = 'gcal_token';
const TOKEN_EXPIRY_KEY = 'gcal_token_expiry';

let tokenClient = null;
let scriptLoaded = false;

function loadGISScript() {
  return new Promise((resolve, reject) => {
    if (scriptLoaded || window.google?.accounts) {
      scriptLoaded = true;
      return resolve();
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = () => { scriptLoaded = true; resolve(); };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export async function connectGoogleCalendar(clientId) {
  await loadGISScript();

  return new Promise((resolve, reject) => {
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPES,
      callback: (response) => {
        if (response.error) return reject(response);
        const expiry = Date.now() + (response.expires_in - 60) * 1000;
        localStorage.setItem(TOKEN_KEY, response.access_token);
        localStorage.setItem(TOKEN_EXPIRY_KEY, expiry.toString());
        resolve(response.access_token);
      },
    });
    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
}

export function getStoredToken() {
  const token = localStorage.getItem(TOKEN_KEY);
  const expiry = parseInt(localStorage.getItem(TOKEN_EXPIRY_KEY) || '0');
  if (!token || Date.now() > expiry) return null;
  return token;
}

export function disconnectGoogleCalendar() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token && window.google?.accounts) {
    google.accounts.oauth2.revoke(token);
  }
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
}

export function isGoogleCalendarConnected() {
  return !!getStoredToken();
}

export async function createCalendarEvent({ title, description, date, contactName }) {
  const token = getStoredToken();
  if (!token) throw new Error('No hay token de Google Calendar');

  const event = {
    summary: `Seguimiento: ${contactName} – ${title}`,
    description,
    start: { date },
    end: { date },
  };

  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Error creando evento');
  }
  return res.json();
}
