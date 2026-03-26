# ♿ Business Accessibility Tracker

A community-powered web app that helps people with disabilities find and evaluate accessible businesses across cities. Users can search for businesses, view them on an interactive map, and contribute accessibility ratings and reviews.

## What It Tracks

- ♿ Wheelchair & mobility access (ramps, elevators, door width)
- 👂 Sensory accessibility (braille menus, hearing loops, visual alerts)
- 🚻 Accessible restrooms
- 🅿️ Accessible parking
- 🤝 Service quality for people with disabilities
- 💻 Digital accessibility

## Tech Stack

- **Frontend:** React + TypeScript, Vite
- **Maps:** Google Maps JavaScript API + Places API
- **Auth:** Firebase Authentication
- **Backend:** Node.js + Express (see companion repo)
- **Database:** PostgreSQL (Neon)

## Getting Started

### Prerequisites

- Node.js v20+
- A Google Cloud account with Maps JavaScript API and Places API enabled
- A Firebase project with Email/Password authentication enabled

### Installation

1. Clone the repository:
```bash
git clone https://github.com/supermegpie/accessibility-tracker.git
cd accessibility-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Fill in your environment variables in `.env`:
```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

5. Start the development server:
```bash
npm run dev
```

6. Visit `http://localhost:5173`

> **Note:** The backend API must also be running for full functionality. See the [backend repository](https://github.com/supermegpie/accessibility-tracker-api).

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase project API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |
| `VITE_FIREBASE_MEASUREMENT_ID` | Firebase measurement ID |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps API key |

## Features

- 🔍 Search businesses by city or location
- 🗺️ Interactive Google Map with color-coded markers
- 🔵 Blue markers = saved & tracked businesses
- 🔴 Red markers = search results
- 💾 Save businesses to the accessibility tracker
- 🔐 User authentication (login/signup)

## Related Repository

- [accessibility-tracker-api](https://github.com/supermegpie/accessibility-tracker-api) — Node.js + Express backend

## License

MIT
