const env = require('../config/env');
const ApiError = require('../utils/apiError');
const logger = require('../utils/logger');

/**
 * Get Google OAuth authorization URL
 */
function getAuthUrl() {
  if (!env.google.clientId) {
    throw ApiError.badRequest('Google Calendar not configured');
  }

  const params = new URLSearchParams({
    client_id: env.google.clientId,
    redirect_uri: env.google.redirectUri,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/calendar.events',
    access_type: 'offline',
    prompt: 'consent',
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens
 */
async function exchangeCode(code) {
  if (!env.google.clientId || !env.google.clientSecret) {
    throw ApiError.badRequest('Google Calendar not configured');
  }

  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: env.google.clientId,
        client_secret: env.google.clientSecret,
        redirect_uri: env.google.redirectUri,
        grant_type: 'authorization_code',
        code,
      }),
    });

    if (!response.ok) {
      throw new Error(`Google token exchange failed: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    logger.error('Google Calendar auth error', { error: error.message });
    throw ApiError.internal('Failed to authenticate with Google Calendar');
  }
}

/**
 * Create a calendar event for a task
 */
async function createEvent(accessToken, task, tenant) {
  const event = {
    summary: task.title,
    description: task.description || '',
    start: {
      dateTime: buildDateTime(task.scheduledDate, task.scheduledTime),
      timeZone: tenant.timezone || 'Europe/Paris',
    },
    end: {
      dateTime: buildEndDateTime(task.scheduledDate, task.scheduledTime, task.estimatedDuration),
      timeZone: tenant.timezone || 'Europe/Paris',
    },
  };

  try {
    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }
    );

    if (!response.ok) {
      throw new Error(`Google Calendar API error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    logger.error('Google Calendar create event error', { error: error.message });
    throw ApiError.internal('Failed to create calendar event');
  }
}

function buildDateTime(date, time) {
  const d = new Date(date);
  if (time) {
    const [hours, minutes] = time.split(':');
    d.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
  } else {
    d.setHours(8, 0, 0, 0);
  }
  return d.toISOString();
}

function buildEndDateTime(date, time, durationMinutes) {
  const start = new Date(buildDateTime(date, time));
  start.setMinutes(start.getMinutes() + (durationMinutes || 60));
  return start.toISOString();
}

module.exports = {
  getAuthUrl,
  exchangeCode,
  createEvent,
};
