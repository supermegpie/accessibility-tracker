# Business Accessibility Tracker

A community-powered web app that helps people with disabilities find, rate, and plan trips to accessible businesses across cities. Users can search for businesses on an interactive map, submit structured accessibility reviews, and use the trip planner to find the top 5 most accessible destinations with real-time transit status.

## Features

### Interactive Accessibility Map
- Search businesses by city or location using Google Places API
- Color-coded markers based on accessibility score:
  - Green — Highly accessible (4+)
  - Yellow — Fair (3+)
  - Red — Not accessible (below 3)
  - Blue — Not yet rated
- Save businesses to the accessibility tracker
- Filter by minimum accessibility score and business type

### Community Reviews
- Submit structured accessibility ratings across 5 categories:
  - Wheelchair & Mobility Access
  - Sensory Accessibility (braille, hearing loops)
  - Staff & Service Quality
  - Accessible Restrooms
  - Accessible Parking
- View all community reviews and score breakdown per business
- Auto-calculated overall accessibility score

### City Accessibility Dashboard
- Overall city accessibility score
- Score breakdown by category
- Top rated accessible businesses
- Stats by business type

### ♿ Accessible Trip Planner
Find the top 5 most accessible destinations for any search query, scored across multiple data sources:
- Google verified wheelchair accessible entrance
- Google star ratings
- Community accessibility scores from this app
- Real-time transit accessibility status:
  - **Chicago:** CTA elevator outages + Metra accessibility alerts + Pace Bus link
  - **New York City:** MTA elevator outage status
  - **Seattle:** Sound Transit service alerts + King County Metro
- Transit warnings only shown for outages near each destination
- Mini map with numbered color-coded markers
- Get Directions button via Google Maps transit
- Shareable results link

## Tech Stack

- **Frontend:** React + TypeScript, Vite
- **Routing:** React Router
- **Maps:** Google Maps JavaScript API + Places API
- **Auth:** Firebase Authentication (Email/Password)
- **Backend:** Node.js + Express (see companion repo)
- **Database:** PostgreSQL (Neon cloud)

## Getting Started

### Prerequisites

- Node.js v20+
- A Google Cloud account with these APIs enabled:
  - Maps JavaScript API
  - Places API
  - Geocoding API
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

4. Fill in your environment variables in `.env`

5. Start the development server:
```bash
npm run dev
```

6. Visit `http://localhost:5173`

> **Note:** The backend API must also be running. See the [backend repository](https://github.com/supermegpie/accessibility-tracker-api).

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

## Related Repository

- [accessibility-tracker-api](https://github.com/supermegpie/accessibility-tracker-api) — Node.js + Express backend

## License

MIT
