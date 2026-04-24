import React, { useEffect, useRef, useState } from 'react'
import io from "socket.io-client";
import { Badge, IconButton, TextField } from '@mui/material';
import { Button } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import styles from "../styles/videoComponent.module.css";
import CallEndIcon from '@mui/icons-material/CallEnd'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import ChatIcon from '@mui/icons-material/Chat'
import server from '../environment';
import ReactMarkdown from 'react-markdown';
import { Dialog, DialogTitle, DialogContent } from '@mui/material';
import useTranscription from '../hooks/useTranscription';

const server_url = server;

var connections = {};

const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" },
        { "urls": "stun:global.stun.twilio.com:3478" },
        { "urls": "turn:openrelay.metered.ca:80", "username": "openrelayproject", "credential": "openrelayproject" },
        { "urls": "turn:openrelay.metered.ca:443", "username": "openrelayproject", "credential": "openrelayproject" },
        { "urls": "turn:openrelay.metered.ca:443?transport=tcp", "username": "openrelayproject", "credential": "openrelayproject" }
    ]
}

export default function VideoMeetComponent() {

    var socketRef = useRef();
    let socketIdRef = useRef();

    let localVideoref = useRef();

    let [videoAvailable, setVideoAvailable] = useState(true);

    let [audioAvailable, setAudioAvailable] = useState(true);

    let [video, setVideo] = useState([]);

    let [audio, setAudio] = useState();

    let [screen, setScreen] = useState();

    let [showModal, setModal] = useState(true);

    let [screenAvailable, setScreenAvailable] = useState();

    let [messages, setMessages] = useState([])

    let [message, setMessage] = useState("");

    let [newMessages, setNewMessages] = useState(3);

    let [askForUsername, setAskForUsername] = useState(true);

    let [username, setUsername] = useState("");

    const videoRef = useRef([])

    let [videos, setVideos] = useState([])
    let [summarizeOpen, setSummarizeOpen] = useState(false)
    let [recapMarkdown, setRecapMarkdown] = useState("")
    let [summarizeLoading, setSummarizeLoading] = useState(false)
    let [summarizeError, setSummarizeError] = useState("")
    let [meetingLog, setMeetingLog] = useState([])
    const transcriptListRef = useRef(null)
    const [manualNote, setManualNote] = useState("")
    const [showTranscript, setShowTranscript] = useState(false)
    const meetingStartRef = useRef(null)
    let [meetingEnded, setMeetingEnded] = useState(false)

    // TODO
    // if(isChrome() === false) {


    // }

    // Initialize from localStorage on mount
    useEffect(() => {
        const savedUsername = localStorage.getItem('nexus_username');
        const savedMeetingCode = localStorage.getItem('nexus_meeting_code');
        const currentMeetingCode = window.location.pathname.replace("/", "");
        
        // If user has a saved username and is in the same meeting, auto-join
        if (savedUsername && savedMeetingCode === currentMeetingCode) {
            setUsername(savedUsername);
            setAskForUsername(false);
            // Auto-connect after permissions are granted
            setTimeout(() => {
                getPermissions().then(() => {
                    setAskForUsername(false);
                    getMedia();
                });
            }, 500);
        } else {
            getPermissions();
        }
    }, []);

    let getDislayMedia = () => {
        if (screen) {
            if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                    .then(getDislayMediaSuccess)
                    .then((stream) => { })
                    .catch((e) => console.log(e))
            }
        }
    }

    const getPermissions = async () => {
        try {
            const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoPermission) {
                setVideoAvailable(true);
            } else {
                setVideoAvailable(false);
            }

            const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (audioPermission) {
                setAudioAvailable(true);
            } else {
                setAudioAvailable(false);
            }

            if (navigator.mediaDevices.getDisplayMedia) {
                setScreenAvailable(true);
            } else {
                setScreenAvailable(false);
            }

            if (videoAvailable || audioAvailable) {
                const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoAvailable, audio: audioAvailable });
                if (userMediaStream) {
                    window.localStream = userMediaStream;
                    if (localVideoref.current) {
                        localVideoref.current.srcObject = userMediaStream;
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (video !== undefined && audio !== undefined) {
            getUserMedia();

        }


    }, [video, audio])
    let getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();

    }




    let getUserMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoref.current.srcObject = stream
        updateMediaSenders()

        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false);
            setAudio(false);

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoref.current.srcObject = window.localStream

            updateMediaSenders()
        })
    }

    let getUserMedia = () => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                .then(getUserMediaSuccess)
                .then((stream) => { })
                .catch((e) => console.log(e))
        } else {
            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { }
        }
    }





    let getDislayMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoref.current.srcObject = stream
        updateMediaSenders()

        stream.getTracks().forEach(track => track.onended = () => {
            setScreen(false)

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoref.current.srcObject = window.localStream

            getUserMedia()

        })
    }

    let gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message)

        if (fromId !== socketIdRef.current) {
            if (!connections[fromId]) {
                console.warn("Connection for id not found", fromId);
                return;
            }

            if (signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === 'offer') {
                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }))
                            }).catch(e => console.log(e))
                        }).catch(e => console.log(e))
                    }
                }).catch(e => console.log(e))
            }

            if (signal.ice) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
            }
        }
    }




    let connectToSocketServer = () => {
        socketRef.current = io.connect(server_url)

        socketRef.current.on('signal', gotMessageFromServer)

        socketRef.current.on('connect', () => {
            socketRef.current.emit('join-call', window.location.href)
            socketIdRef.current = socketRef.current.id

            socketRef.current.on('chat-message', addMessage)

            socketRef.current.on('new-transcript-entry', (data, socketIdSender) => {
                if (socketIdSender !== socketIdRef.current) {
                    setMeetingLog(prev => [...prev, data])
                }
            })

            socketRef.current.on('user-left', (id) => {
                setVideos((videos) => videos.filter((video) => video.socketId !== id))
            })

            socketRef.current.on('video-state-change', ({ videoEnabled, senderId }) => {
                // When a remote peer changes their video state, trigger renegotiation
                // This ensures the local side re-initializes the video stream properly
                if (senderId && connections[senderId]) {
                    try {
                        connections[senderId].createOffer().then((description) => {
                            connections[senderId].setLocalDescription(description)
                                .then(() => {
                                    socketRef.current.emit('signal', senderId, JSON.stringify({ 'sdp': connections[senderId].localDescription }))
                                })
                                .catch(e => console.log(e))
                        })
                    } catch (e) { console.log(e) }
                }
            })

            socketRef.current.on('user-joined', (id, clients) => {
                clients.forEach((socketListId) => {

                    if (socketListId === socketIdRef.current) {
                        return;
                    }

                    if (connections[socketListId]) {
                        return;
                    }

                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections)
                    // Wait for their ice candidate       
                    connections[socketListId].onicecandidate = function (event) {
                        if (event.candidate != null) {
                            socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
                        }
                    }

                    // Wait for their video stream
                    connections[socketListId].ontrack = (event) => {
                        setVideos(videos => {
                            let videoExists = videos.find(video => video.socketId === socketListId);
                            
                            if (videoExists) {
                                // Create explicitly NEW stream wrapper so the ref checker fires
                                let newStream = new MediaStream(videoExists.stream.getTracks());
                                if (!newStream.getTracks().includes(event.track)) {
                                    newStream.addTrack(event.track);
                                }
                                
                                const updatedVideos = videos.map(video =>
                                    video.socketId === socketListId ? { ...video, stream: newStream } : video
                                );
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            } else {
                                // Create a new video
                                let newStream = new MediaStream();
                                newStream.addTrack(event.track);
                                
                                let newVideo = {
                                    socketId: socketListId,
                                    stream: newStream,
                                    autoplay: true,
                                    playsinline: true
                                };
    
                                const updatedVideos = [...videos, newVideo];
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            }
                        });
                    };


                    // Add the local video stream
                    if (window.localStream !== undefined && window.localStream !== null) {
                        window.localStream.getTracks().forEach(track => {
                            connections[socketListId].addTrack(track, window.localStream);
                        });
                    } else {
                        let blackSilence = (...args) => new MediaStream([black(...args), silence()])
                        window.localStream = blackSilence()
                        window.localStream.getTracks().forEach(track => {
                            connections[socketListId].addTrack(track, window.localStream);
                        });
                    }
                })

                if (id === socketIdRef.current) {
                    for (let id2 in connections) {
                        if (id2 === socketIdRef.current) continue

                        try {
                            window.localStream.getTracks().forEach(track => {
                                connections[id2].addTrack(track, window.localStream);
                            });
                        } catch (e) { }

                        connections[id2].createOffer().then((description) => {
                            connections[id2].setLocalDescription(description)
                                .then(() => {
                                    socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }))
                                })
                                .catch(e => console.log(e))
                        })
                    }
                }
            })
        })
    }

    let silence = () => {
        let ctx = new AudioContext()
        let oscillator = ctx.createOscillator()
        let dst = oscillator.connect(ctx.createMediaStreamDestination())
        oscillator.start()
        ctx.resume()
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
    }
    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height })
        canvas.getContext('2d').fillRect(0, 0, width, height)
        let stream = canvas.captureStream()
        return Object.assign(stream.getVideoTracks()[0], { enabled: false })
    }

    let handleVideo = () => {
        const next = !video;
        setVideo(next);
        if (!next) {
            try {
                if (window.localStream) {
                    window.localStream.getVideoTracks().forEach(t => t.stop())
                }
                const audioTracks = window.localStream ? window.localStream.getAudioTracks() : [];
                const onlyAudio = new MediaStream(audioTracks);
                window.localStream = onlyAudio;
                if (localVideoref.current) localVideoref.current.srcObject = onlyAudio;
                updateMediaSenders();
                // Notify all peers that video has been disabled
                socketRef.current.emit('video-state-change', { videoEnabled: false, senderId: socketIdRef.current });
            } catch (e) { console.log(e) }
        } else {
            navigator.mediaDevices.getUserMedia({ video: true, audio: audioAvailable })
                .then(s => {
                    window.localStream = s;
                    if (localVideoref.current) localVideoref.current.srcObject = s;
                    updateMediaSenders();
                    // Notify all peers that video has been enabled
                    socketRef.current.emit('video-state-change', { videoEnabled: true, senderId: socketIdRef.current });
                })
                .catch(e => console.log(e))
        }
    }
    let handleAudio = () => {
        const next = !audio;
        setAudio(next);
        if (window.localStream) {
            const tracks = window.localStream.getAudioTracks();
            tracks.forEach(t => t.enabled = next);
        }
        normalizeAudioSenders(next);
    }

    useEffect(() => {
        if (screen !== undefined) {
            getDislayMedia();
        }
    }, [screen])
    let handleScreen = () => {
        setScreen(!screen);
    }

    let handleEndCall = () => {
        try {
            let tracks = localVideoref.current.srcObject.getTracks()
            tracks.forEach(track => track.stop())
        } catch (e) { }
        // Clear meeting session from localStorage
        localStorage.removeItem('nexus_username');
        localStorage.removeItem('nexus_meeting_code');
        setMeetingEnded(true)
    }

    let openChat = () => {
        setModal(true);
        setNewMessages(0);
    }
    let closeChat = () => {
        setModal(false);
    }
    let handleMessage = (e) => {
        setMessage(e.target.value);
    }

    const addMessage = (data, sender, socketIdSender) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: sender, data: data }
        ]);
        if (socketIdSender !== socketIdRef.current) {
            setNewMessages((prevNewMessages) => prevNewMessages + 1);
        }
    };



    let sendMessage = () => {
        socketRef.current.emit('chat-message', message, username)
        setMessage("");

        // this.setState({ message: "", sender: username })
    }

    const onFinalCommit = (text) => {
        const entry = { user: username || 'Guest', text, timestamp: Date.now() }
        setMeetingLog(prev => [...prev, entry])
        if (socketRef.current) {
            socketRef.current.emit('new-transcript-entry', entry)
        }
    }
    const { isSupported, isListening, interimText, permissionError, start, stop } = useTranscription(onFinalCommit, { lang: 'en-IN' })

    useEffect(() => {
        if (transcriptListRef.current) {
            transcriptListRef.current.scrollTop = transcriptListRef.current.scrollHeight
        }
    }, [meetingLog])
    let renegotiateAll = () => {
        for (let id in connections) {
            try {
                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                        })
                        .catch(e => console.log(e))
                })
            } catch (e) { console.log(e) }
        }
    }

    let normalizeAudioSenders = (next) => {
        for (let id in connections) {
            try {
                const pc = connections[id];
                const senders = pc.getSenders().filter(s => s.track && s.track.kind === 'audio');
                senders.forEach(s => {
                    if (s.track) s.track.enabled = next;
                });
                for (let i = 1; i < senders.length; i++) {
                    try { pc.removeTrack(senders[i]) } catch (e) { console.log(e) }
                }
            } catch (e) { console.log(e) }
        }
        renegotiateAll();
    }
    let updateMediaSenders = () => {
        for (let id in connections) {
            try {
                const pc = connections[id];
                const senders = pc.getSenders();
                const vTrack = window.localStream.getVideoTracks()[0];
                const aTrack = window.localStream.getAudioTracks()[0];
                const vSenders = senders.filter(s => s.track && s.track.kind === 'video');
                const aSenders = senders.filter(s => s.track && s.track.kind === 'audio');
                if (vTrack) {
                    if (vSenders[0]) { vSenders[0].replaceTrack(vTrack) } else { pc.addTrack(vTrack, window.localStream) }
                    for (let i = 1; i < vSenders.length; i++) { try { pc.removeTrack(vSenders[i]) } catch (e) { console.log(e) } }
                } else {
                    vSenders.forEach(s => { try { pc.removeTrack(s) } catch (e) { console.log(e) } })
                }
                if (aTrack) {
                    if (aSenders[0]) { aSenders[0].replaceTrack(aTrack) } else { pc.addTrack(aTrack, window.localStream) }
                    for (let i = 1; i < aSenders.length; i++) { try { pc.removeTrack(aSenders[i]) } catch (e) { console.log(e) } }
                } else {
                    aSenders.forEach(s => { try { pc.removeTrack(s) } catch (e) { console.log(e) } })
                }
            } catch (e) { console.log(e) }
        }
        renegotiateAll();
    }
    
    let connect = () => {
        // Save username and meeting code to localStorage
        localStorage.setItem('nexus_username', username);
        localStorage.setItem('nexus_meeting_code', window.location.pathname.replace("/", ""));
        
        meetingStartRef.current = Date.now();
        setAskForUsername(false);
        getMedia();
    }

    const buildPayload = () => {
        const combined = [];
        let order = 0;
        messages.forEach((m) => {
            combined.push({ kind: 'chat', sender: m.sender || 'Unknown', text: m.data || '', timestamp: m.timestamp ?? null, order: order++ });
        });
        meetingLog.forEach((e) => {
            combined.push({ kind: 'transcript', sender: e.user || 'Unknown', text: e.text || '', timestamp: e.timestamp ?? null, order: order++ });
        });

        const hasTimestamp = combined.some(entry => entry.timestamp);

        if (hasTimestamp) {
            combined.sort((a, b) => {
                if (a.timestamp && b.timestamp) return a.timestamp - b.timestamp;
                if (a.timestamp && !b.timestamp) return -1;
                if (!a.timestamp && b.timestamp) return 1;
                return a.order - b.order;
            });
        }

        const formatted = combined.map(entry => entry.kind === 'chat' ? `[CHAT] ${entry.sender}: ${entry.text}` : `[TRANSCRIPT] ${entry.sender}: ${entry.text}`).join('\n');

        return formatted.trim();
    }

    const getCallDuration = () => {
        if (!meetingStartRef.current) return '0s';
        const durationMs = Date.now() - meetingStartRef.current;
        const seconds = Math.floor(durationMs / 1000);
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
        if (mins > 0) return `${mins}m ${secs}s`;
        return `${secs}s`;
    }


    return (
        <div>

            {askForUsername === true ?

                <div className={styles.lobbyContainer}>
                    <div className={styles.lobbyBrand}>NEXUS</div>
                    <h2 className={styles.lobbyTitle}>Enter into Lobby</h2>
                    <div className={styles.lobbyActions}>
                        <input
                            className={styles.lobbyInput}
                            placeholder="Your display name…"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && connect()}
                        />
                        <button className={styles.connectBtn} onClick={connect}>
                            Join Room →
                        </button>
                    </div>

                    <div className={styles.lobbyPreview}>
                        <video ref={localVideoref} autoPlay muted></video>
                    </div>
                </div> :


                <div className={styles.meetVideoContainer}>
                    {meetingEnded ? (
                        <div style={{
                            position: 'fixed',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(15,9,5,0.94)',
                            backdropFilter: 'blur(24px)',
                            zIndex: 1200,
                        }}>
                            <div style={{
                                width: 'min(720px, 92%)',
                                padding: '28px',
                                borderRadius: '20px',
                                border: '1px solid rgba(249,115,22,0.14)',
                                background: 'rgba(15,9,5,0.94)',
                                color: '#fdf4ee',
                                boxShadow: '0 24px 64px rgba(0,0,0,0.75)',
                                textAlign: 'center',
                                fontFamily: 'Inter, sans-serif'
                            }}>
                                <h2 style={{ margin: 0, fontSize: '1.6rem' }}>Meeting Ended</h2>
                                <p style={{ color: 'rgba(253,244,238,0.55)', marginTop: 12 }}>Duration: <strong>{getCallDuration()}</strong></p>
                                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: 18 }}>
                                    <button
                                        onClick={() => setSummarizeOpen(true)}
                                        style={{
                                            padding: '11px 22px',
                                            borderRadius: '9999px',
                                            border: 'none',
                                            background: 'linear-gradient(135deg, #f97316, #ef4444)',
                                            color: 'white',
                                            fontFamily: 'Inter, sans-serif',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            boxShadow: '0 6px 20px rgba(249,115,22,0.38)'
                                        }}
                                    >
                                        ✨ Get Meeting Summary
                                    </button>
                                    <button
                                        onClick={() => window.location.href = '/'}
                                        style={{
                                            padding: '11px 22px',
                                            borderRadius: '9999px',
                                            border: '1px solid rgba(249,115,22,0.14)',
                                            background: 'transparent',
                                            color: '#fdf4ee',
                                            fontFamily: 'Inter, sans-serif',
                                            fontWeight: 700,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Leave →
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>

                    {showModal ? <div className={styles.chatRoom}>

                        <div className={styles.chatContainer}>
                            <div className={styles.chatTitle}>💬 Chat</div>

                            <div className={styles.chattingDisplay}>
                                {messages.length !== 0 ? messages.map((item, index) => (
                                    <div className={styles.chatMessage} key={index}>
                                        <p className={styles.chatSender}>{item.sender}</p>
                                        <p className={styles.chatText}>{item.data}</p>
                                    </div>
                                )) : (
                                    <p style={{ color: 'rgba(240,244,255,0.35)', fontSize: '0.85rem', textAlign: 'center', marginTop: 24 }}>No messages yet…</p>
                                )}
                            </div>

                            <div className={styles.chattingArea}>
                                <input
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                                    placeholder="Message…"
                                    style={{
                                        flex: 1,
                                        minWidth: 0,
                                        background: 'rgba(255,255,255,0.06)',
                                        border: '1px solid rgba(249,115,22,0.18)',
                                        borderRadius: '9999px',
                                        padding: '9px 14px',
                                        color: '#fdf4ee',
                                        fontSize: '0.84rem',
                                        outline: 'none',
                                        fontFamily: 'Inter, sans-serif',
                                    }}
                                />
                                <button
                                    onClick={sendMessage}
                                    style={{
                                        padding: '9px 14px',
                                        borderRadius: '9999px',
                                        border: 'none',
                                        background: 'linear-gradient(135deg, #f97316, #ef4444)',
                                        color: 'white',
                                        fontSize: '0.84rem',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        fontFamily: 'Inter, sans-serif',
                                        flexShrink: 0,
                                    }}
                                >Send</button>
                            </div>
                        </div>
                    </div> : <></>}


                    <div className={styles.buttonContainers}>
                        {/* Mic */}
                        <button
                            className={styles.iconPill}
                            onClick={handleAudio}
                            title={audio ? 'Mute' : 'Unmute'}
                        >
                            {audio === true ? <MicIcon /> : <MicOffIcon />}
                        </button>

                        {/* Camera */}
                        <button
                            className={styles.iconPill}
                            onClick={handleVideo}
                            title={video ? 'Stop camera' : 'Start camera'}
                        >
                            {(video === true) ? <VideocamIcon /> : <VideocamOffIcon />}
                        </button>

                        {/* End Call */}
                        <button
                            className={`${styles.iconPill} ${styles.iconPillDanger}`}
                            onClick={handleEndCall}
                            title="End call"
                            style={{ width: '52px', height: '52px' }}
                        >
                            <CallEndIcon />
                        </button>

                        {/* Screen share */}
                        <button
                            className={styles.iconPill}
                            onClick={handleScreen}
                            disabled={!screenAvailable}
                            title="Share screen"
                            style={{ opacity: screenAvailable ? 1 : 0.38, cursor: screenAvailable ? 'pointer' : 'not-allowed' }}
                        >
                            {screen ? <StopScreenShareIcon /> : <ScreenShareIcon />}
                        </button>

                        {/* Captions */}
                        <button
                            className={`${styles.textPill} ${isListening ? styles.textPillActive : ''}`}
                            onClick={() => (isListening ? stop() : start())}
                        >
                            {isListening ? '⏹ Stop Captions' : '💬 Live Captions'}
                        </button>

                        {/* Log */}
                        <button
                            className={`${styles.textPill} ${showTranscript ? styles.textPillActive : ''}`}
                            onClick={() => setShowTranscript(!showTranscript)}
                        >
                            {showTranscript ? 'Hide Log' : '📋 Show Log'}
                        </button>

                        {/* Summarize */}
                        <button
                            className={`${styles.textPill} ${styles.textPillActive}`}
                            onClick={() => setSummarizeOpen(true)}
                        >
                            ✨ Summarize
                        </button>

                        {/* Chat toggle */}
                        <Badge badgeContent={newMessages} max={999} color='primary'>
                            <button
                                className={`${styles.iconPill} ${showModal ? styles.textPillActive : ''}`}
                                onClick={() => setModal(!showModal)}
                                style={{ width: '48px', height: '48px' }}
                                title="Chat"
                            >
                                <ChatIcon />
                            </button>
                        </Badge>
                    </div>

                    {interimText && (
                        <div className={styles.captionsOverlay}>
                            {interimText}
                        </div>
                    )}

                    <video className={styles.meetUserVideo} ref={localVideoref} autoPlay muted></video>

                    <div className={showTranscript ? styles.conferenceView : styles.conferenceViewChatOnly}>
                        {videos.map((video) => (
                            <div key={video.socketId}>
                                <video
                                    data-socket={video.socketId}
                                    ref={ref => {
                                        if (ref && video.stream && ref.srcObject !== video.stream) {
                                            ref.srcObject = video.stream;
                                            ref.play().catch(e => console.log('Autoplay error:', e));
                                        }
                                    }}
                                    autoPlay
                                    playsInline
                                >
                                </video>
                            </div>

                        ))}

                    </div>

                    {showTranscript ? <div className={styles.transcriptSidebar} ref={transcriptListRef}>
                        <h3>Meeting Log</h3>
                        {!isSupported ? <p style={{ color: 'salmon' }}>Captions unavailable in this browser — use Add Note or try Chrome</p> : null}
                        {permissionError === 'permission-denied' ? <p style={{ color: 'salmon' }}>Mic permission denied</p> : null}
                        {permissionError === 'no-speech' ? <p style={{ color: 'salmon' }}>No speech detected — try again</p> : null}
                        {permissionError === 'no-mic' ? <p style={{ color: 'salmon' }}>Microphone not available</p> : null}
                        {meetingLog.map((entry, idx) => (
                            <div key={idx} className={styles.transcriptItem}>
                                <p style={{ fontWeight: 600 }}>{entry.user}</p>
                                <p>{entry.text}</p>
                            </div>
                        ))}
                        <div className={styles.transcriptControls}>
                            <TextField
                                value={manualNote}
                                onChange={(e) => setManualNote(e.target.value)}
                                label="Add note"
                                size="small"
                                fullWidth
                                sx={{
                                    '& .MuiInputBase-input': { color: '#fdf4ee' },
                                    '& .MuiInputLabel-root': { color: 'rgba(253,244,238,0.7)' },
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(249,115,22,0.25)' },
                                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(249,115,22,0.45)' },
                                    '& .MuiInputLabel-root.Mui-focused': { color: '#fb923c' },
                                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#f97316' }
                                }}
                            />
                            <Button
                                variant="outlined"
                                onClick={() => {
                                    const text = manualNote.trim();
                                    if (!text) return;
                                    const entry = { user: username || 'Guest', text, timestamp: Date.now() }
                                    setMeetingLog(prev => [...prev, entry])
                                    if (socketRef.current) {
                                        socketRef.current.emit('new-transcript-entry', entry)
                                    }
                                    setManualNote("");
                                }}
                                sx={{ mt: 1, borderColor: '#f97316', color: '#fb923c', textTransform: 'none',
                                    borderRadius: '9999px',
                                    '&:hover': { borderColor: '#f97316', background: 'rgba(249,115,22,0.1)' }
                                }}
                            >
                                Add Note
                            </Button>
                        </div>
                    </div> : null}

                        </>
                    )}

                </div>

            }

            <Dialog open={summarizeOpen} onClose={() => setSummarizeOpen(false)} fullWidth maxWidth="md"
                PaperProps={{
                    style: {
                        background: 'rgba(15,9,5,0.94)',
                        backdropFilter: 'blur(24px)',
                        border: '1px solid rgba(249,115,22,0.14)',
                        borderRadius: '20px',
                        color: '#fdf4ee',
                        boxShadow: '0 24px 64px rgba(0,0,0,0.75)',
                    }
                }}
            >
                <DialogTitle style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 700,
                    fontSize: '1.2rem',
                    borderBottom: '1px solid rgba(249,115,22,0.1)',
                    paddingBottom: '16px',
                    background: 'linear-gradient(90deg, #fb923c, #f87171)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                }}>✨ Generate Smart Recap</DialogTitle>
                <DialogContent style={{ paddingTop: '20px' }}>
                    <div style={{ marginBottom: '14px' }}>
                        <div style={{ marginBottom: 8, fontWeight: 700, color: '#fdf4ee' }}>Meeting Context to be Summarized:</div>
                        {buildPayload() ? (
                            <pre style={{
                                maxHeight: 320,
                                overflowY: 'auto',
                                whiteSpace: 'pre-wrap',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(249,115,22,0.08)',
                                padding: 12,
                                borderRadius: 12,
                                color: '#fdf4ee',
                                fontFamily: 'Inter, sans-serif',
                                fontSize: '0.9rem',
                                lineHeight: 1.5
                            }}>{buildPayload()}</pre>
                        ) : (
                            <p style={{ color: 'rgba(253,244,238,0.55)' }}>No conversation data found — start Live Captions or send a chat message before summarizing.</p>
                        )}
                    </div>
                    <button
                        onClick={async () => {
                            try {
                                setSummarizeLoading(true);
                                setSummarizeError("");
                                setRecapMarkdown("");
                                const code = window.location.pathname.replace("/", "");
                                const compiled = buildPayload();
                                if (!compiled) {
                                    setSummarizeError("No conversation data to summarize.");
                                    setSummarizeLoading(false);
                                    return;
                                }
                                const resp = await fetch(`${server_url}/api/meetings/summarize`, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ meetingCode: code, transcript: compiled })
                                });
                                const data = await resp.json();
                                if (!resp.ok) {
                                    setSummarizeError(data?.message || "Failed to summarize.");
                                } else {
                                    setRecapMarkdown(data.recap || "");
                                }
                            } catch (e) {
                                setSummarizeError((e && e.message) ? e.message : "Failed to summarize.");
                            } finally {
                                setSummarizeLoading(false);
                            }
                        }}
                        disabled={summarizeLoading || !buildPayload()}
                        style={{
                            padding: '11px 28px',
                            borderRadius: '9999px',
                            border: 'none',
                            background: summarizeLoading
                                ? 'rgba(249,115,22,0.35)'
                                : 'linear-gradient(135deg, #f97316, #ef4444)',
                            color: 'white',
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 700,
                            fontSize: '0.92rem',
                            cursor: summarizeLoading ? 'not-allowed' : 'pointer',
                            boxShadow: summarizeLoading ? 'none' : '0 6px 18px rgba(249,115,22,0.38)',
                            transition: 'all 0.22s',
                        }}
                    >
                        {summarizeLoading ? "Summarizing…" : "✨ Summarize"}
                    </button>
                    {summarizeError ? (
                        <p style={{ color: "#fca5a5", marginTop: 12, fontSize: '0.88rem' }}>{summarizeError}</p>
                    ) : null}
                    {recapMarkdown ? (
                        <div style={{ marginTop: 20, color: '#f5d9c8', lineHeight: 1.8 }}>
                            <ReactMarkdown>{recapMarkdown}</ReactMarkdown>
                        </div>
                    ) : null}
                </DialogContent>
            </Dialog>
        </div>
    )
}
