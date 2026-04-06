

# LifeLine AI — Smart Ambulance Routing System

## Project Report

---

## 1. Introduction

**LifeLine AI** is an intelligent, real-time emergency ambulance routing system built for the city of **Srinagar, Kashmir**. The system leverages AI-driven traffic management to dynamically clear traffic signals ahead of an approaching ambulance, reducing response times and potentially saving lives.

The core idea is simple but powerful: **when an ambulance is dispatched, every traffic light on its route turns green before it arrives** — eliminating delays at intersections where every second counts.

---

## 2. Problem Statement

Emergency vehicles in urban areas frequently get stuck at red traffic signals and in congested roads. Studies show that ambulance response times in Indian cities can exceed **15–20 minutes** due to traffic congestion, whereas the golden hour for critical trauma patients requires response within **8 minutes**.

**LifeLine AI** addresses this by:
- Computing the fastest traffic-aware route to the nearest hospital
- Automatically clearing traffic signals along the route as the ambulance approaches
- Broadcasting route clearance alerts to civilian vehicles
- Detecting congestion and enabling manual broadcast overrides

---

## 3. Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend Framework** | Next.js 16 (App Router) | Server-side rendering, routing, React 19 |
| **Language** | TypeScript | Type-safe development |
| **UI Library** | React 19 | Component-based UI |
| **Styling** | Tailwind CSS v4 | Utility-first responsive design |
| **Mapping Engine** | Mapbox GL JS v3 | Interactive 3D map rendering |
| **Routing API** | Mapbox Directions API | Traffic-aware road-following route calculation |
| **State Management** | Zustand v5 | Lightweight global state store |
| **Icons** | Lucide React | Modern icon library |
| **Animations** | Framer Motion | Smooth UI transitions |
| **Component Styling** | Class Variance Authority (CVA) | Variant-based component styling |

---

## 4. System Architecture

```
┌───────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                  │
├───────────────┬───────────────┬───────────────────────┤
│   MapView     │ ControlPanel  │   StatsPanel          │
│   (Mapbox GL) │ (Dispatch UI) │   (Real-time Stats)   │
├───────────────┴───────────────┴───────────────────────┤
│              Zustand Global State Store                │
│  ┌─────────┐ ┌──────────┐ ┌────────┐ ┌────────────┐  │
│  │Ambulance│ │ Signals  │ │ Route  │ │ Simulation │  │
│  │  State  │ │  State   │ │  Data  │ │   Engine   │  │
│  └─────────┘ └──────────┘ └────────┘ └────────────┘  │
├───────────────────────────────────────────────────────┤
│           Mapbox Directions API (External)             │
│        (Traffic-aware routing with road geometry)      │
└───────────────────────────────────────────────────────┘
```

---

## 5. Features Implemented

![LifeLine AI Dashboard](/public/screenshots/dashboard.png)

### 5.1 Interactive 3D City Map
- Full 3D building extrusions for Srinagar city
- Dark-themed satellite-style map with smooth camera animations
- Hospital destination markers with custom icons
- Real-time ambulance position tracking with animated marker

### 5.2 Smart Routing Engine
- **Traffic-aware routing** using Mapbox's `driving-traffic` profile
- Real road-following polylines (not straight-line paths)
- Turn-by-turn navigation steps with maneuver data
- Route distance, ETA, and turn count displayed in real-time
- Route rendered as a glowing green line with blur effects

### 5.3 AI Traffic Signal Management

![Smart Routing and Comparison](/public/screenshots/routing.png)

- **Dynamic signal generation** at every intersection along the computed route
- Signals placed at actual road maneuver points (turns, forks, roundabouts)
- **Automatic RED → GREEN transition** when ambulance reaches within 300 meters
- Some signals randomly pre-set to GREEN (~30%) for realistic traffic simulation
- Signals that turn GREEN stay green (ambulance already cleared them)
- Visual signal markers on map with pulsing glow effects and status labels

### 5.4 Real-Time Simulation Engine
- Internal physics-based simulation loop (400ms tick rate)
- Ambulance automatically drives along the computed route geometry
- Heading calculated from road direction for realistic movement
- Simulated speed of 80 km/h
- Auto-stops on arrival at destination hospital

### 5.5 Congestion Detection & Broadcast System
- **Severe Congestion Alert** — pulsating amber warning card appears during active dispatch
- **Broadcast Clearance Button** — sends a public route clearance message: *"Clear the road and give way as ambulance is approaching"*
- Civic response simulation — congestion clears automatically 2 seconds after broadcast
- Full activity logging of broadcast actions

### 5.6 Mission Control Dashboard
- Hospital destination selector dropdown
- Emergency Mode toggle (traffic-aware vs standard routing)
- Start/Cancel Dispatch controls
- Real-time stats: ETA, Road Distance, Speed, Turn Count
- Live Event Log with timestamped entries
- Traffic Management AI panel showing active signals and their states

---

## 6. Key Files & Code Structure

```
LifeLineAI/
├── app/
│   ├── layout.tsx              # Root layout with fonts & metadata
│   ├── globals.css             # Global styles & Tailwind config
│   ├── page.tsx                # Landing page
│   └── dashboard/
│       └── page.tsx            # Main dashboard page
├── components/
│   ├── dashboard/
│   │   ├── MapView.tsx         # Mapbox 3D map with markers & route
│   │   ├── ControlPanel.tsx    # Mission Control UI (dispatch, broadcast)
│   │   ├── StatsPanel.tsx      # ETA, distance, speed stats
│   │   ├── SignalList.tsx      # Traffic signal status list
│   │   └── ActivityLog.tsx     # Live event log feed
│   └── ui/
│       ├── Button.tsx          # Reusable button component (CVA)
│       ├── Card.tsx            # Glass-morphism card component
│       └── Badge.tsx           # Status badge component
├── lib/
│   ├── store.ts                # Zustand state management + simulation engine
│   ├── routing.ts              # Mapbox Directions API integration
│   ├── mapConfig.ts            # Map configuration, hospitals, signals
│   └── utils.ts                # Utility functions (cn helper)
├── types/
│   └── index.ts                # TypeScript interfaces & types
└── .env.local                  # Mapbox access token
```

---

## 7. How It Works (Step-by-Step)

1. **User selects a destination hospital** from the Mission Control dropdown
2. **User clicks "Start Dispatch"** — the system calls the Mapbox Directions API
3. **Route is calculated** with traffic-aware optimization and rendered on the 3D map
4. **Traffic signals are generated** at every intersection/maneuver along the route
5. **Simulation starts** — the ambulance begins driving along the route automatically
6. **Congestion alert appears** — user can click "Broadcast Clearance" to notify vehicles
7. **As ambulance approaches each signal (within 300m)**, the signal turns from RED to GREEN
8. **Activity Log records** every signal clearance, broadcast, and status change
9. **On arrival**, the simulation stops, status updates to "ARRIVED", and all signals are cleared

---

## 8. APIs Used

| API | Endpoint | Purpose |
|-----|----------|---------|
| Mapbox Directions API | `api.mapbox.com/directions/v5/mapbox/driving-traffic` | Traffic-aware route calculation |
| Mapbox GL JS | Client-side SDK | Interactive map rendering |
| Mapbox Styles API | `mapbox://styles/mapbox/dark-v11` | Dark-themed map tiles |

---

## 9. Environment Setup

```bash
# 1. Clone the repository
git clone https://github.com/meersuhaib191/project-cursor_hackathon_kashmir.git

# 2. Install dependencies
npm install

# 3. Create .env.local file and add your Mapbox token
echo "NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_public_token_here" > .env.local

# 4. Run the development server
npm run dev

# 5. Open http://localhost:3000/dashboard in your browser
```

---

## 10. Future Enhancements

- **Real GPS Integration** — connect to actual device GPS for live field deployment
- **Multi-Ambulance Fleet Management** — track and dispatch multiple ambulances simultaneously
- **Hospital Bed Availability API** — route to the nearest hospital with available ICU/trauma beds
- **Voice-Assisted Navigation** — text-to-speech turn-by-turn guidance for the driver
- **IoT Traffic Signal Integration** — connect to real smart traffic lights via MQTT/WebSocket
- **Patient Vitals Dashboard** — integrate wearable sensor data for en-route monitoring
- **Historical Analytics** — track response times, route efficiency, and signal clearance data

---

## 11. Team & Credits

- **Project:** LifeLine AI — Smart Ambulance Routing System
- **Event:** Cursor Hackathon Kashmir
- **Tech Stack:** Next.js · TypeScript · Mapbox · Zustand · Tailwind CSS
- **Repository:** [github.com/meersuhaib191/project-cursor_hackathon_kashmir](https://github.com/meersuhaib191/project-cursor_hackathon_kashmir)

---

*Built with ❤️ for saving lives through intelligent emergency response technology.*
