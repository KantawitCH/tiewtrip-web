<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/f6857833-58e9-4e44-bdbb-eceb83c0f0c2

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set local env values in `.env.local`
   - `NEXT_PUBLIC_GEMINI_API_KEY=...`
   - `API_URL=http://localhost:8080` for a local backend
3. Run the app:
   `npm run dev`

## Local backend test

The sign-in page calls a same-origin Next.js proxy at `/api/auth/...`, and that
proxy forwards requests to the backend configured by `API_URL`.

1. Start your backend locally
2. Start the frontend with `npm run dev`
3. Open `/auth/sign-in`
4. Click `Test backend connection`

If the backend is reachable, the page will show the redirect URL returned by
`POST /v1/auth/provider/inquiry`.
