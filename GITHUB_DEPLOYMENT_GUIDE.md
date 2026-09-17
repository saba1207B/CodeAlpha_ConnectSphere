# ConnectSphere — GitHub Pages & Global Live Deployment Guide

This guide explains how **ConnectSphere** enables seamless, **cross-country, worldwide real-time video meetings** directly from **GitHub Pages** with **zero server hosting costs or configuration required**, and provides step-by-step terminal instructions to publish your site.

---

## 🌍 How International / Cross-Country Connections Work on GitHub Pages

When you create a room on GitHub Pages from your laptop in your home country, and send the link to a **friend or client in a foreign country (abroad)**:

1. **Global Internet Mesh (PeerJS Cloud Signaling)**:
   - Both browsers connect to the 24/7 global signaling server `0.peerjs.com`.
   - Your friend's browser in another country and your browser on your laptop locate each other automatically using your meeting Room ID (`/#/meeting/<room-id>`).

2. **Worldwide NAT Traversal (Google Public STUN)**:
   - Consumer home routers, cellular networks, and international ISP firewalls normally block incoming connections.
   - ConnectSphere is pre-configured with Google's worldwide STUN infrastructure:
     - `stun.l.google.com:19302`
     - `stun1.l.google.com:19302`
     - `stun2.l.google.com:19302`
     - `stun3.l.google.com:19302`
     - `stun4.l.google.com:19302`
   - These STUN servers discover both public IP addresses and negotiate direct, end-to-end encrypted WebRTC audio/video peer connections across continents.

3. **Full Peer-to-Peer Real-Time Collaboration Across the Internet**:
   - **HD Video & Audio**: Crystal clear WebRTC media streams directly between your laptop and your friend's device abroad.
   - **Screen Sharing**: Ultra-low latency screen presentation across countries.
   - **Real-Time Cross-Country Chat**: Encrypted WebRTC DataChannel text messaging.
   - **Synchronized Vector Whiteboard**: Pen strokes, shapes, notes, and eraser actions replicate in real-time between devices anywhere in the world.
   - **Instant File Sharing**: Direct peer-to-peer file transfer over encrypted WebRTC data channels.
   - **Live Reactions**: Claps, hearts, party poppers, and confetti broadcast live across the globe.

4. **Offline / Fallback Resilience**:
   - If someone opens a room solo or without internet, native `BroadcastChannel` local mesh and simulated Studio Collaborators (Elena Vance, Amara Chen, Liam Thorne) ensure the UI remains fully responsive and testable.
   - If a custom Node/Express backend is deployed to Render/Railway, ConnectSphere automatically detects it via `?server=https://...` or `VITE_BACKEND_URL`.

---

## 🚀 How to Share a Room With a Friend Abroad

1. Open your live GitHub Pages website:
   `https://<your-username>.github.io/<repo-name>/`
2. Click **"New Meeting"** or enter a custom Room ID (e.g. `client-strategy-2026`).
3. Click the **"Copy Invite Link"** button in the meeting room (or copy the URL from your browser address bar):
   `https://<your-username>.github.io/<repo-name>/#/meeting/client-strategy-2026`
4. Send this exact link to your friend or client abroad via WhatsApp, Email, or Slack.
5. When they open it, their browser will auto-connect via the Google STUN mesh and both video feeds will appear live!

---

## 🛠️ Step-by-Step GitHub Connector Terminal Instructions

### Step 1: Install Git (If not already installed)
If typing `git --version` in your terminal shows an error, run this in PowerShell (Run as Administrator):
```powershell
winget install --id Git.Git -e --source winget
```
*Or download the installer directly from [git-scm.com](https://git-scm.com/download/win).*

### Step 2: Push ConnectSphere to GitHub
Open PowerShell or Command Prompt in `d:\new Project`:

```powershell
# 1. Initialize Git repository
git init

# 2. Add all project files
git add .

# 3. Commit your changes
git commit -m "Deploy ConnectSphere with Global Internet Mesh and GitHub Pages support"

# 4. Set branch to main
git branch -M main

# 5. Connect to your GitHub repository (replace YOUR_GITHUB_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/REPO_NAME.git

# 6. Push code to GitHub
git push -u origin main
```

---

## ⚡ Enable GitHub Pages in 2 Simple Clicks

1. Go to your repository page on **GitHub.com** (`https://github.com/YOUR_GITHUB_USERNAME/REPO_NAME`).
2. Click **Settings** (tab at the top) → **Pages** (sidebar on the left).
3. Under **Build and deployment** → **Source**, click the dropdown and choose **GitHub Actions**.
4. That's it! GitHub will automatically trigger the included workflow ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)), compile the optimized client bundle, and publish your website live to:
   ```
   https://YOUR_GITHUB_USERNAME.github.io/REPO_NAME/
   ```

---

## 🖥️ Testing Locally Before Deploying

You can also run both frontend and backend on your laptop right now:

### Backend Server (Node.js + Express):
```powershell
cd "d:\new Project\server"
node dist/index.js
# Health check: http://localhost:5000/api/health
```

### Frontend Client (Vite):
```powershell
cd "d:\new Project\client"
npm run dev
# Live site: http://localhost:5173
```
You can also test cross-device or cross-tab locally by opening two browser windows at `http://localhost:5173/#/meeting/room-test`.
