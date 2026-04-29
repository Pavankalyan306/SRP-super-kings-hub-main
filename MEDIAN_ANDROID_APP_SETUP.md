# Median Android App Setup

This project should be deployed as a normal web app first, then wrapped with Median.

## 1. Deploy the Website

Build and deploy the React app to a public HTTPS URL:

```bash
npm run build
```

Use your deployed URL in Median App Studio, for example:

```text
https://your-domain.com
```

## 2. Create the Android App in Median

In Median:

1. Create a new app.
2. Set the website URL to your deployed app URL.
3. Enable Android.
4. Keep Supabase URLs allowed in the app/network settings if Median asks for allowed domains.

## 3. Enable Push Notifications

For real Android notifications when the app is closed, enable Median's OneSignal native plugin.

Required setup:

1. Create a OneSignal app.
2. Configure Android FCM in OneSignal.
3. In Median App Studio, add the OneSignal plugin and enter the OneSignal App ID.
4. Let Median handle push permission, or use the project hook that calls `median.onesignal.register()` when available.

## 4. Match Started Flow

Current implemented flow:

1. Admin opens `/admin`.
2. Admin goes to `Matches`.
3. Admin clicks `Start` on an upcoming match.
4. Supabase updates the match status to `live`.
5. Public app pages refresh and show an in-app toast to active users.

For background push notifications to all installed app users, add a backend trigger:

1. Supabase detects `matches.status` changing from `scheduled` to `live`.
2. Supabase Edge Function or another backend calls OneSignal REST API.
3. OneSignal sends the native push through the Median app.

Do not call the OneSignal REST API directly from React because the REST API key must stay secret.
