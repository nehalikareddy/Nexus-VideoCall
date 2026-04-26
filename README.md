<p align="center">
  <img src="https://img.shields.io/badge/NEXUS-Video%20Conferencing-2563EB?style=for-the-badge&logoColor=white" alt="NEXUS Badge"/>
</p>

<h1 align="center">🎥 NEXUS — Video Conferencing Platform</h1>

<p align="center">
  A full-stack, real-time video conferencing web application built with the <strong>MERN stack</strong> and <strong>WebRTC</strong>. <br/>
  Connect face-to-face from anywhere — with live chat, screen sharing, live captions, and AI-powered meeting recaps.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React"/>
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb&logoColor=white" alt="MongoDB"/>
  <img src="https://img.shields.io/badge/Socket.IO-4.x-010101?style=flat-square&logo=socketdotio&logoColor=white" alt="Socket.IO"/>
  <img src="https://img.shields.io/badge/WebRTC-Peer--to--Peer-333333?style=flat-square&logo=webrtc&logoColor=white" alt="WebRTC"/>
  <img src="https://img.shields.io/badge/Gemini%20AI-1.5%20Flash-4285F4?style=flat-square&logo=google&logoColor=white" alt="Gemini AI"/>
</p>

## ✨ Highlights

| Feature | Description |
| :--- | :--- |
| **🎥 Video Calls** | High-quality, low-latency streaming powered by WebRTC. |
| **💬 Live Chat** | Real-time messaging seamlessly integrated into the call interface. |
| **🖥️ Screen Share** | Instantly broadcast your entire screen, window, or specific tab. |
| **🗣️ Live Captions** | Real-time speech-to-text transcriptions natively rendered in the browser. |
| **🤖 AI Recaps** | Automatically generate clean markdown summaries of your transcripts using Google Gemini 1.5 Flash. |
| **📜 History Logs** | Everything is securely saved—review past meeting transcripts and recaps from your dashboard. |

## 📂 System Architecture

Nexus uses a **Signaling Server** architecture to establish Peer-to-Peer (P2P) connections. Once the handshake is complete, data flows directly between users to minimize latency.
```mermaid
graph LR

    %% Frontend
    subgraph Client [Frontend (Browser)]
        A((User A))
        B((User B))
        Speech[Web Speech API]
    end

    %% Backend
    subgraph Backend [Node.js Server]
        S[Signaling Server]
    end

    %% AI
    subgraph AI [AI Processing]
        G[Gemini API]
    end

    %% Database
    subgraph DB [Database]
        M[(MongoDB)]
    end

    %% P2P Connection
    A <-->|WebRTC P2P| B

    %% Signaling
    A -->|Offer/Answer + ICE| S
    B -->|Offer/Answer + ICE| S

    %% Captions
    A --> Speech

    %% AI Flow
    S -->|Transcripts| G
    G -->|Summary| S
    S --> M
```
## 🛠️ Technology Stack

### Frontend
- **React 18** — Component-based UI with hooks
- **Vite** — Lightning-fast development server
- **Material UI (MUI) 5** — Pre-built UI components
- **Socket.IO Client** — Real-time bidirectional communication
- **WebRTC** — Peer-to-peer video/audio streaming
- **Web Speech API** — Browser-native speech recognition

### Backend
- **Node.js + Express** — RESTful API server
- **Socket.IO** — WebSocket server for signaling
- **MongoDB + Mongoose** — NoSQL database
- **Google Gemini AI** — Meeting transcript summarization

## 🚀 Running Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/nehalikareddy/Nexus-VideoCall.git
   cd Nexus-VideoCall
   ```

2. **Start the Backend:**
   Create a `.env` file in the `backend/` folder containing your `MONGO_URI` and `GEMINI_API_KEY`.
   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. **Start the Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 🌐 Deployment

| Platform | Setup Overview | Requirements |
| :--- | :--- | :--- |
| **Render** (Backend) | Create a **Web Service**, point it to the `backend` folder. | Provide `MONGO_URI` and `GEMINI_API_KEY` secrets. |
| **Render** (Frontend) | Create a **Static Site**, point it to the `frontend` folder. | Ensure frontend uses the dynamic Render backend URL. |


