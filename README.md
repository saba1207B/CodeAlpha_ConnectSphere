# ConnectSphere

> A high-end editorial real-time video conferencing, interactive presentation, and creative collaboration platform.

[![Deploy to GitHub Pages](https://github.com/saba1207B/CodeAlpha_ConnectSphere/actions/workflows/deploy.yml/badge.svg)](https://github.com/saba1207B/CodeAlpha_ConnectSphere/actions/workflows/deploy.yml)
[![Live Demo](https://img.shields.io/badge/Demo-Live%20on%20GitHub%20Pages-01472e?style=flat-square&logo=github)](https://saba1207b.github.io/CodeAlpha_ConnectSphere/)
[![React 18](https://img.shields.io/badge/Frontend-React%2018%20%7C%20TypeScript-01472e?style=flat-square&logo=react)](https://react.dev/)
[![WebRTC](https://img.shields.io/badge/RealTime-WebRTC%20Mesh-01472e?style=flat-square&logo=webrtc)](https://webrtc.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-01472e?style=flat-square)](LICENSE)

---

## 🌐 Live Website & Deployment

Experience the live application deployed directly on GitHub Pages:

🔗 **Live Website**: [https://saba1207b.github.io/CodeAlpha_ConnectSphere/](https://saba1207b.github.io/CodeAlpha_ConnectSphere/)

> ℹ️ **Development note:** The live deployment is an internship demonstration. Real-time features such as camera/microphone access, screen sharing, WebRTC connections, and speech recognition depend on browser permissions, browser support, and network conditions. A desktop browser is recommended for the full experience.

---

## 📖 Overview

**ConnectSphere** is a modern video conferencing and collaboration platform designed with an editorial aesthetic. Combining the warmth of organic earthy tones and analog paper textures with real-time multi-peer WebRTC technology, ConnectSphere delivers crystal-clear audio, HD video, interactive presentation tools, synchronized whiteboards, encrypted messaging, and host moderation tools directly in the browser.

---

## ✨ Available Features

ConnectSphere comes equipped with a comprehensive suite of collaboration tools:

### 1. Real-Time HD Video & Audio Conferencing
- **Multi-Peer WebRTC Mesh**: Peer-to-peer audio and video streaming with automatic STUN NAT traversal.
- **Worldwide STUN Infrastructure**: Pre-configured with Google's global STUN network (`stun.l.google.com:19302`) for cross-network and international connections.
- **Adaptive Video Quality Controls**: Switch dynamically between 360p Standard, 720p HD, and 1080p Full HD video streams.
- **Active Speaker Highlighting**: Real-time voice activity detection with dynamic audio waveform bars and speaking halos.
- **Dynamic Layout Switcher**: Seamlessly toggle between **Gallery Grid**, **Speaker Spotlight**, and **Presentation Side-by-Side** views.
- **Fluid Screen Sharing**: Share full desktop displays, specific application windows, or browser tabs with system audio pass-through.
- **Virtual Backgrounds & Camera Filters**: Built-in background blur, studio portrait lighting, monochrome, sepia, and contrast enhancements.
- **Web Audio Signal Processing**: Integrated Automatic Echo Cancellation (AEC), Background Noise Suppression, and Auto Gain Control (AGC).
- **Device Management & Audio Level Meter**: In-call microphone, camera, and speaker selector with live input volume verification.
- **Audio Feedback & Chimes**: Polished auditory cues for room entry, departure, hand raises, and incoming chat messages.

### 2. Synchronized Collaborative Whiteboard
- **Multi-User Real-Time Canvas**: Draw and brainstorm together with synchronized stroke replication.
- **Precision Drawing Tools**: Freehand pen/brush with adjustable stroke thickness slider.
- **Curated Color Palette**: Studio-tailored palette (Forest, Sage, Terracotta, Olive, Charcoal, Cream).
- **Geometric Shapes**: Instant vector shapes including Lines, Rectangles, Circles, and Directional Arrows.
- **Digital Sticky Notes**: Movable, customizable sticky notes for agile brainstorming and retrospective feedback.
- **Editing & Canvas Actions**: Eraser tool, full canvas wipe, undo/redo history.
- **High-Resolution Export**: Download completed whiteboard diagrams directly as PNG images.

### 3. In-Meeting Collaboration & Interaction
- **Encrypted Room Chat**: Real-time messaging drawer with participant tags, unread counter badges, and timestamps.
- **Peer-to-Peer File Transfer**: Direct WebRTC DataChannel file exchange with drag-and-drop upload, transfer progress, and one-click download.
- **Live Closed Captions (Speech-to-Text)**: Real-time speech transcription overlay powered by the browser Web Speech API.
- **Interactive Slide Presentation Deck**: Built-in presentation viewer with slide navigation, fullscreen mode, thumbnail bar, and laser pointer indicator.
- **Live Audience Polls**: Create single and multi-choice polls with live vote tallying and real-time percentage progress bars.
- **Interactive Q&A Forum**: Dedicated question submission queue with community upvoting and host "Mark as Answered" controls.
- **Collaborative Meeting Notepad**: Live shared notepad for meeting minutes and agendas with copy and markdown export.
- **Live Reactions & Confetti Celebrations**: Floating emoji reactions (👏, ❤️, 👍, 😂, 🔥) and fullscreen celebratory confetti bursts.
- **Push-to-Talk & Hand Raise Queue**: Visual raised-hand notifications and priority queue for meeting etiquette.
- **Local In-Browser Meeting Recorder**: Capture meeting audio and video directly to a local `.webm` recording file with one-click download.
- **Keyboard Shortcuts**: Rapid hotkeys for seamless in-call management:
  - `M` — Toggle Microphone (Mute/Unmute)
  - `V` — Toggle Camera (Video On/Off)
  - `S` — Toggle Screen Sharing
  - `C` — Open/Close Chat Drawer
  - `W` — Open/Close Collaborative Whiteboard
  - `H` — Raise / Lower Hand
  - `?` — Open Keyboard Shortcuts Reference
  - `Esc` — Close Active Modals / Drawers

### 4. Meeting Moderation & Host Governance
- **Meeting Room Lock**: Lock active meetings to prevent unwanted attendees from entering.
- **Waiting Room Admission**: Review pending guests in a dedicated waiting lounge and grant admission individually or in bulk.
- **Granular Participant Controls**: Selectively enable or disable screen sharing, chat, self-unmuting, camera activation, and attendee renaming.
- **Host Direct Actions**: Mute individual participants, Mute All with one click, pin speaker to spotlight, or remove disruptive attendees.
- **Customizable Display Identities**: Update attendee display names on the fly with instant room-wide synchronization.

### 5. Creator Dashboard & Meeting Scheduling
- **Instant Meeting Launcher**: Create a new room with a single click and receive a uniquely generated room code (`cs-xxxxxx`).
- **Join by Room Code or Link**: Quick-join bar that parses either full URLs or direct room identifiers.
- **Advanced Meeting Scheduler**: Configure meeting title, date, start time, duration, recurring cycles, and room passcodes.
- **One-Click "Add to Google Calendar"**: Generate pre-populated Google Calendar invites with meeting title, join URL, and session details.
- **Session History & Analytics**: Review past meetings with duration timestamps, participant counts, and category classifications.
- **Profile & Studio Preferences**: Manage display names, avatar graphics, and default audio/video hardware configurations.

### 6. Visual Design System — Forest & Sage Editorial
- **Harmonious Palette**:
  - `Forest` (`#01472e`): Deep evergreen tone for primary typography, dominant buttons, and structured chrome.
  - `Sage` (`#ccd5ae`): Soft botanical accents, badges, and frosted glass containers.
  - `Olive` (`#e9edc9`): Warm secondary container fills and contrast surfaces.
  - `Cream` (`#fefae0`): Editorial background canvas avoiding harsh stark white.
  - `Terracotta` (`#e07a5f`): Warm glowing accents, live stream badges, and primary action triggers.
- **Editorial Typography**: Pairing high-impact **Anton** display headlines with crisp, tracking-spaced **Inter** body labels.
- **Analog Tactile Texture**: Subtle persistent SVG fractal noise overlay giving an authentic printed editorial paper feel.
- **Physics-Based Fluid Motion**: Custom cursor trailing ribbon, smooth card hover elevations, and spring transitions.

---

## 🛠️ Technology Stack

| Domain | Technologies & Libraries |
| :--- | :--- |
| **Frontend Framework** | React 18, TypeScript, Vite |
| **Styling & Animation** | Tailwind CSS, Framer Motion, Canvas API |
| **Icons & Media** | Lucide React, Web Audio API, Web Speech API |
| **Real-Time Communication** | WebRTC (`RTCPeerConnection`, `RTCDataChannel`), PeerJS Cloud, Socket.io |
| **Local Mesh & Resilience** | Native `BroadcastChannel` API for multi-tab offline synchronization |
| **Backend & ORM** | Node.js, Express, TypeScript, Prisma ORM |
| **Database Support** | PostgreSQL / SQLite |
| **Security & Auth** | JWT cookies, bcrypt password hashing, Helmet security headers |
| **Deployment** | GitHub Pages (Client SPA), GitHub Actions CI/CD |

---

## 🚀 Quick Start (Local Development)

To run the project locally on your machine:

### 1. Clone the Repository
```bash
git clone https://github.com/saba1207B/CodeAlpha_ConnectSphere.git
cd CodeAlpha_ConnectSphere
```

### 2. Install Dependencies
```bash
# Install root orchestration tools
npm install

# Install both client and server dependencies
npm run setup
```

### 3. Set Up Environment Variables
Create a `.env` file in the root directory (or use `.env.example` as a template):
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
DATABASE_URL="file:./dev.db"
JWT_SECRET=your_super_secret_jwt_key_here
```

### 4. Initialize the Database
```bash
npm run prisma:generate
npm run prisma:push
```

### 5. Start Development Servers
```bash
npm run dev
```
- **Client Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend Server & Signaling**: [http://localhost:5000](http://localhost:5000)

---

## 🌐 Deploying to Production

### Deploying the Frontend to GitHub Pages
The frontend is already configured with automated GitHub Actions in `.github/workflows/deploy.yml`. Every push to `main` automatically builds and publishes the latest client bundle:
```bash
git add .
git commit -m "feat: updates and enhancements"
git push origin main
```

### Deploying the Full-Stack Application (Render / Railway / VPS)
1. Build both client and server production bundles:
   ```bash
   npm --prefix client run build
   npm --prefix server run build
   ```
2. Start the unified production server:
   ```bash
   node server/dist/index.js
   ```
The Express server automatically serves both the API endpoints, WebSocket signaling, and the static compiled frontend bundle.

---

## 📁 Repository Structure

```
CodeAlpha_ConnectSphere/
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Pages CI/CD workflow
├── client/                         # React 18 + Vite Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── landing/            # Landing page sections (Hero, Showcase, Pricing, etc.)
│   │   │   ├── layout/             # Navigation & Footer
│   │   │   ├── meeting/            # Video grid, Whiteboard, Chat, Polls, Q&A, Controls
│   │   │   └── ui/                 # Reusable UI buttons, inputs, modals
│   │   ├── context/                # Auth & Socket state providers
│   │   ├── hooks/                  # WebRTC, Audio & Captions hooks
│   │   ├── pages/                  # Dashboard, Meeting, Profile, Settings, Auth
│   │   ├── services/               # Audio processing & Video filters
│   │   ├── App.tsx                 # Root application routes
│   │   └── main.tsx                # Entrypoint
│   ├── index.html                  # HTML template with Anton & Inter typography
│   ├── package.json
│   └── vite.config.ts
├── server/                         # Node.js + Express + Socket.io Backend
│   ├── src/
│   │   ├── controllers/            # Auth & Meeting controllers
│   │   ├── middleware/             # Security & JWT validation
│   │   ├── routes/                 # Express REST API routes
│   │   ├── socket/                 # Real-time WebRTC signaling handlers
│   │   └── index.ts                # Server entrypoint
│   └── package.json
├── prisma/                         # Database schema & migrations
│   └── schema.prisma
├── package.json                    # Root workspace orchestration
└── README.md                       # Project documentation
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

© 2026 ConnectSphere. Crafted for seamless real-time collaboration.
