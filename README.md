# 🎥 Nexus — AI-Integrated Video Conferencing Platform

<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=FF4380&height=200&section=header&text=NEXUS&fontSize=90&animation=fadeIn&fontColor=ffffff" />

  <p align="center">
    <strong>A high-performance video conferencing solution with real-time AI summarization.</strong>
  </p>

  <p align="center">
    <a href="https://nexus-videoconference-j11v.onrender.com/" target="_blank">
      <img src="https://img.shields.io/badge/Live_Demo-FF4380?style=for-the-badge&logo=render&logoColor=white" />
    </a>
  </p>
</div>

---

## 🚀 Overview

Nexus is a full-stack video conferencing application built with the **MERN stack**. It uses **WebRTC** for real-time peer-to-peer communication and integrates **Google Gemini 2.5 Flash** for AI-powered meeting summaries.

---

## ✨ Key Features

* 📹 **P2P Video & Audio** — Low-latency communication using WebRTC
* 🤖 **AI Summarization** — Automatic meeting recaps using Gemini
* 💬 **Real-Time Chat** — Instant messaging via Socket.io
* 📝 **Live Captions** — Speech-to-text using Web Speech API
* 🖥️ **Screen Sharing** — Share your screen seamlessly
* 📜 **Meeting History** — Stored in MongoDB

---

## 🛠️ Tech Stack

**Frontend:** React 18, Tailwind CSS, Material UI, Socket.io-client
**Backend:** Node.js, Express.js, Socket.io, WebRTC (Simple-Peer)
**Database:** MongoDB, Mongoose
**AI:** Google Gemini 2.5 Flash API
**Deployment:** Render

---

## 📂 System Architecture

```mermaid
graph TD

    %% ===== USERS =====
    subgraph U[""]
        A((User A))
        B((User B))
    end

    %% ===== SERVER =====
    subgraph Srv[""]
        S[Signaling Server]
    end

    %% ===== AI =====
    subgraph AI[""]
        G[AI Summary]
    end

    %% ===== DB =====
    subgraph DB[""]
        M[(MongoDB)]
    end

    %% ===== FEATURES =====
    subgraph F[""]
        C[Speech-to-Text]
        R[Chat]
    end

    %% ===== CONNECTIONS =====
    A <-->|WebRTC| B

    A --> S
    B --> S

    S --> G
    G --> S
    S --> M

    A -.-> C
    S -.-> R
```

---

## 🔑 Environment Variables

Create a `.env` file inside the **server** folder:

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_url
GEMINI_API_KEY=your_google_gemini_api_key
FRONTEND_URL=http://localhost:3000
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/nehalikareddy/Nexus-VideoCall.git
cd Nexus-VideoCall
```

### 2️⃣ Backend Setup

```bash
cd server
npm install
npm start
```

### 3️⃣ Frontend Setup

```bash
cd client
npm install
npm start
```

---

## 🤝 Contributing

This project explores the combination of **Real-Time Communication (RTC)** and **Artificial Intelligence**.

Feel free to:

* Fork the repo
* Improve features
* Submit pull requests 🚀

