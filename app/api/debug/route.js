import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET() {
  const results = {};

  // 1. Check env vars are loaded
  results.env = {
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '(vacío)',
    spreadsheetId: process.env.SPREADSHEET_ID || '(vacío)',
    privateKeyLength: (process.env.GOOGLE_PRIVATE_KEY || '').length,
    privateKeyStart: (process.env.GOOGLE_PRIVATE_KEY || '').slice(0, 40),
    privateKeyHasRealNewlines: (process.env.GOOGLE_PRIVATE_KEY || '').includes('\n'),
    privateKeyHasLiteralSlashN: (process.env.GOOGLE_PRIVATE_KEY || '').includes('\\n'),
  };

  // 2. Build the key
  const rawKey = process.env.GOOGLE_PRIVATE_KEY || '';
  const privateKey = rawKey.includes('\\n') ? rawKey.replace(/\\n/g, '\n') : rawKey;
  results.parsedKey = {
    length: privateKey.length,
    start: privateKey.slice(0, 40),
    end: privateKey.slice(-40),
    hasRealNewlines: privateKey.includes('\n'),
  };

  // 3. Try to build JWT and get a token
  try {
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const token = await auth.getAccessToken();
    results.auth = { success: true, tokenPresent: !!token.token };
  } catch (err) {
    results.auth = { success: false, error: err.message };
  }

  // 4. Try to get spreadsheet metadata (no range, just check access)
  try {
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });
    const meta = await sheets.spreadsheets.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      fields: 'spreadsheetId,properties.title,sheets.properties.title',
    });
    results.spreadsheet = {
      success: true,
      title: meta.data.properties?.title,
      sheets: meta.data.sheets?.map(s => s.properties?.title),
    };
  } catch (err) {
    results.spreadsheet = {
      success: false,
      httpStatus: err.response?.status,
      error: err.message,
      googleError: err.response?.data?.error,
    };
  }

  // 5. Read raw rows from profesionales sheet
  try {
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: (process.env.GOOGLE_PRIVATE_KEY || '').includes('\\n')
        ? (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n')
        : (process.env.GOOGLE_PRIVATE_KEY || ''),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'profesionales!A:L',
    });
    const rows = res.data.values || [];
    results.rawRows = rows;
  } catch (err) {
    results.rawRows = { error: err.message };
  }

  return NextResponse.json(results, { status: 200 });
}
