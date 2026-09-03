# Kochi Hackathon — Vercel + Google Sheets leaderboard

## 1. Google Sheet
Create/open the Google Sheet for the event.

## 2. Apps Script
Extensions -> Apps Script. Replace the code with `google_sheets_backend.gs` from this folder.
Save it.

Deploy -> New deployment -> Web app:
- Execute as: Me
- Who has access: Anyone

Copy the `/exec` Web App URL.

## 3. Vercel environment variable
In the Vercel project:
Settings -> Environment Variables

Add:
`GOOGLE_SHEETS_WEB_APP_URL`

Value: your Apps Script `/exec` URL.

Enable it for Production (and Preview if you are testing previews).
Redeploy after saving the variable.

## 4. Deploy this folder
Upload/push this folder as the Vercel project root. Vercel will serve `index.html` and the `api/leaderboard.js` serverless function.

The HTML uses `/api/leaderboard`, NOT the Google Apps Script URL. This avoids the browser CORS error.

## 5. Test
Open:
`https://YOUR-VERCEL-DOMAIN/api/leaderboard`

Expected initially:
`{"entries":[]}`

Then finish one game. The score should appear in the Google Sheet under the `Leaderboard` tab. Open the game on another phone and refresh the leaderboard; it should show the same entry.
# kochihackathon
