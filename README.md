# Business Accessibility Tracker

Accessibility Tracker is a community-driven web app built by and for people with disabilities. The idea is to provide disabled travelers a platform to find, rate, and share information about how accessible businesses actually are, based on real experiences from real people in the community.
Users can search for businesses on an interactive map, leave structured accessibility reviews including comments with their personal experience, and use the Trip Planner to find the most accessible options for any search, with live transit status included.

## What It Does

### Accessibility Map
Search any city and browse businesses on an interactive Google Map. Markers are color-coded by accessibility score so you can see at a glance which places are worth visiting:
  - Green = Highly accessible (4+)
  - Yellow = Fair (3+)
  - Red = Not accessible (below 3)
  - Blue = Not rated yet

  You can also filter by minimum score and business type, and save any business to the tracker.

### Community Reviews
Once a business is saved, anyone can submit a review across four categories:
- Submit structured accessibility ratings across 4 categories:
  - Mobility & Physical Access (including restrooms)
  - Sensory Accessibility (braille, hearing loops)
  - Staff & Service Quality
  - Parking & Transit Access

  Each business receives an overall score that updates automatically as new reviews are received.

### City Accessibility Dashboard
A quick snapshot of how accessible a city is based on all the reviews in the tracker. Shows overall scores by category, top-rated businesses, and a breakdown by business type.

### Accessible Trip Planner
Search for any type of business (like "coffee shop" or "sports bar") and get back the top 5 most accessible options, ranked using a combination of:
- Google wheelchair accessible entrance flad
- Google star ratings
- Community review scores from the tracker
- Real-time transit accessibility alerts (with more to come):

Transit alerts are unique to the searched city and only flagged if an outage is near the destination:
  - **Chicago:** CTA elevator outages, Metra alerts, and Pace Bus link
  - **New York City:** MTA elevator status
  - **Seattle:** Sound Transit + King County Metro alerts

Results include a mini map, a Get Directions button, and a shareable link you can send to travel companions.

## Tech Stack

- **Frontend:** React, TypeScript, Vite
- **Routing:** React Router
- **Maps:** Google Maps JavaScript API, Places API
- **Auth:** Firebase Authentication
- **Backend:** Node.js, Express (see backend repository)
- **Database:** PostgreSQL via Neon

## Getting Started On Building Your Own Tracker

### Running it Locally

You will need Node.js v20+, a Google Cloud account with Maps, Places, and Geocoding APIs enabled, and a Firebase project with Email/Password auth turned on.

```bash
git clone https://github.com/supermegpie/accessibility-tracker.git
cd accessibility-tracker
npm install
cp .env.example .env
npm run dev
```

Then open http://localhost:5173 (the backend also needs to be running).


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

Accessibility benefits EVERYONE.
MIT License
