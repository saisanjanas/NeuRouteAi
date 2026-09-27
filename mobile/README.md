# mobile/ — NEU Route AI Driver / Field-Officer App

Owned by: Member 5 (Mobile Engineer)

## What's here
- **React Native** app for drivers/field officers.
- GPS tracking (`src/services/gpsTracker.js`) — pings `/vehicles/{id}/location` on
  an interval, falls back to the offline queue if the request fails.
- Hazard reporting (`src/screens/HazardReportScreen.js`) — geo-tags the report
  with the device's current GPS position and posts to `/reports`.
- Offline queue + sync (`src/services/offlineQueue.js`) — stores unsent
  reports/location pings in AsyncStorage and automatically flushes them when
  `NetInfo` reports connectivity restored.
- Language selection (`src/context/LanguageContext.js`, `src/i18n/`) — matches
  the project's centralized-translation-resource rule: `en`, `hi`, `as`, `bn`
  JSON files with the same key structure; missing keys fall back to English.

## Setup (once you have this folder inside the actual repo)
This was generated as plain source files, not via `npx react-native init`,
so before it will run you still need to:

```bash
npx react-native init NeuRouteAiMobileTemp
# then copy NeuRouteAiMobileTemp/{android,ios,index.js,metro.config.js,...}
# into this mobile/ folder, keeping the src/, App.js, package.json below
npm install
```

Then set your backend URL:
```bash
cp .env.example .env
# edit .env with the real API_BASE_URL
```

Run:
```bash
npx react-native run-android   # or run-ios
```

## API contract
All backend calls live in `src/services/api.js` and follow
`docs/API_CONTRACT.md` exactly:
- `POST /auth/login`
- `POST /vehicles/{id}/location`
- `POST /reports`
- `GET /shipments/{id}/status`

Don't rename these paths or field names locally — coordinate any change with
the backend team first, per the project's integration principle.

## Still to build
- Photo capture/upload for hazard reports (`photo_url` field is in the
  contract but not wired up yet).
- Role-based UI (driver vs field officer) once auth returns a role.
- Push notifications (FCM) for alerts.
