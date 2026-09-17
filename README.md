# ConnectSphere

> A high-end editorial real-time video conferencing and creative collaboration platform.

ConnectSphere merges bold industrial typography, organic earthy tones, extreme rounded geometry, and analog paper textures with real-time multi-peer WebRTC video, live screen sharing, collaborative synchronized whiteboards, encrypted chat, and secure document exchange.

---

## Visual Design System — Forest / Sage Editorial

- **Color Hierarchy**:
  - `Forest` (`#01472e`): Dominant dark tone for headlines, primary navigation, prominent buttons, and dark surfaces.
  - `Sage` (`#ccd5ae`): Hero section, cards, visual accents, and subtle glass backdrops.
  - `Olive` (`#e9edc9`): Feature sections, secondary cards, and contrast containers.
  - `Cream` (`#fefae0`): Primary editorial background canvas, contrast surfaces, and message cards.
  - `Moss` (`#a3b18a`): Secondary accents, status chips, and indicator badges.
  - `Terracotta` (`#e07a5f`): Warm active pills, glowing accents, live stream indicators, and action triggers.
  - `Amber Gold` (`#e09f3e`): Highlight badges, ratings, and warm luminous gradient meshes.
  - `Primary Dark Text` (`#01472e`): Strict avoidance of pure black.
- **Typography & Motion**:
  - Display: **Anton** (calibrated hero headlines and section titles with fluid responsive bounds).
  - Body/UI: **Inter** (uppercase tracked labels with `letter-spacing: 0.2em–0.4em`).
  - Interactive Pointer: Smooth physics trailing ring and luminous particle ribbon following mouse movement.
- **Geometry & Textures**:
  - Container Radii: `5rem` for large sections, `2.5rem` for cards, `3rem` for floating media frames.
  - Analog Texture: Persistent SVG fractal noise overlay with `opacity: 0.04` and `pointer-events: none`.
  - Motion Easing: `cubic-bezier(0.16, 1, 0.3, 1)` across all interactions and reveals.

---

## Core Features

1. **Real WebRTC Audio & Video**: Direct multi-peer mesh connections using native browser `RTCPeerConnection`, `getUserMedia`, and STUN negotiation.
2. **Fluid Screen Sharing**: Present displays, browser tabs, or windows with audio pass-through via `getDisplayMedia`.
3. **Collaborative Whiteboard**: Synchronized canvas supporting freehand pen, line, rectangle, circle, sticky note, and text tools with live peer cursor indicators over Socket.io.
4. **Real-Time Room Chat**: Low-latency conversation thread with organic message styling and message history.
5. **Secure Document Sharing**: Drag-and-drop document upload with strict backend quarantine blocking executable file formats.
6. **Editorial Dashboard**: Member overview with instant meeting launch, room code entry, and past session history.
7. **Production Security**: Protected routes, salted bcrypt passwords, HTTP-only JWT cookies, and Helmet headers.

---

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide React
- **Backend**: Node.js, Express, TypeScript, Socket.io
- **Database & ORM**: PostgreSQL / SQLite with Prisma ORM
- **Signaling & Transport**: Socket.io + WebRTC (RTCPeerConnection)

---

## Quick Start

### 1. Install Dependencies
```bash
# Install root orchestration tools
npm install

# Install server and client dependencies
npm run setup
```

### 2. Generate Prisma Client & Database
```bash
npm run prisma:generate
npm run prisma:push
```

### 3. Run Development Servers
```bash
npm run dev
```
- Client runs at: `http://localhost:5173`
- Server runs at: `http://localhost:5000`

---

## GitHub Connector Instructions

To connect this project to your GitHub repository and publish it:

### Step 1: Initialize Git in your project root
Open a terminal in the project directory (`d:\new Project`):
```bash
git init
git branch -M main
```

### Step 2: Stage and Commit all files
```bash
git add .
git commit -m "feat: initial commit of ConnectSphere real-time platform"
```

### Step 3: Link to your GitHub Repository
Create a new repository on [GitHub](https://github.com/new) (e.g. `connectsphere`). Then run:
```bash
git remote add origin https://github.com/<YOUR_USERNAME>/connectsphere.git
```

### Step 4: Push to GitHub
```bash
git push -u origin main
```

---

## Deployment Options

### Deploying to Vercel / Netlify (Client Frontend)
1. Link your GitHub repository in Vercel or Netlify.
2. Set Root Directory to `client`.
3. Build Command: `npm run build`
4. Output Directory: `dist`

### Deploying Full-Stack (Render / Railway / Fly.io / VPS)
1. Build client: `npm --prefix client run build`
2. Build server: `npm --prefix server run build`
3. Start production server:
   ```bash
   node server/dist/index.js
   ```
   The server automatically serves both the API, Socket.io signaling, and the compiled frontend static bundle!

---

## License
MIT License. © 2026 ConnectSphere.
