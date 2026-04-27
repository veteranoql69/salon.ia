"use server";

import { createAdminClient } from "@/lib/supabase/server";

interface CalendarEventInput {
  professionalId: string;
  title: string;
  description?: string;
  startTime: string; // ISO 8601
  endTime: string;   // ISO 8601
  clientEmail?: string;
}

async function getValidAccessToken(professionalId: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("brb_profiles")
    .select("google_access_token, google_refresh_token, google_token_expires_at")
    .eq("id", professionalId)
    .maybeSingle();

  if (!profile?.google_access_token) return null;

  const expiresAt = profile.google_token_expires_at
    ? new Date(profile.google_token_expires_at)
    : null;
  const isExpired = !expiresAt || expiresAt <= new Date(Date.now() + 60_000);

  if (!isExpired) return profile.google_access_token;

  // Token expired — refresh it
  if (!profile.google_refresh_token) return null;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: profile.google_refresh_token,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) return null;

  const tokens = await res.json();
  const newExpiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

  await admin.from("brb_profiles").update({
    google_access_token: tokens.access_token,
    google_token_expires_at: newExpiresAt,
  }).eq("id", professionalId);

  return tokens.access_token;
}

export async function createCalendarEvent(input: CalendarEventInput) {
  const accessToken = await getValidAccessToken(input.professionalId);
  if (!accessToken) {
    return { error: "El profesional no tiene Google Calendar conectado." };
  }

  const attendees = input.clientEmail
    ? [{ email: input.clientEmail }]
    : [];

  const res = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: input.title,
        description: input.description ?? "",
        start: { dateTime: input.startTime, timeZone: "America/Santiago" },
        end: { dateTime: input.endTime, timeZone: "America/Santiago" },
        attendees,
        reminders: {
          useDefault: false,
          overrides: [
            { method: "popup", minutes: 30 },
          ],
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    console.error("[createCalendarEvent] error:", err);
    return { error: "No se pudo crear el evento en Google Calendar." };
  }

  const event = await res.json();
  return { eventId: event.id, htmlLink: event.htmlLink };
}

export async function deleteCalendarEvent(professionalId: string, eventId: string) {
  const accessToken = await getValidAccessToken(professionalId);
  if (!accessToken) return { error: "Sin acceso a Google Calendar." };

  await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  return { success: true };
}
