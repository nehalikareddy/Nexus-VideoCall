import React, { useContext, useState } from 'react'
import withAuth from '../utils/withAuth'
import { useNavigate } from 'react-router-dom'
import "../App.css";
import RestoreIcon from '@mui/icons-material/Restore';
import LogoutIcon from '@mui/icons-material/Logout';
import BoltIcon from '@mui/icons-material/Bolt';
import SecurityIcon from '@mui/icons-material/Security';
import { AuthContext } from '../contexts/AuthContext';

function HomeComponent() {
    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");

    const { addToUserHistory } = useContext(AuthContext);
    let handleJoinVideoCall = async () => {
        if (!meetingCode.trim()) {
            alert("Please enter a meeting code");
            return;
        }
        try {
            await addToUserHistory(meetingCode);
            navigate(`/${meetingCode}`);
        } catch (error) {
            console.error("Error joining meeting:", error);
            alert("Failed to join meeting. Please try again.");
        }
    }

    return (
        <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
            <div className="bgMesh" />

            {/* Navbar */}
            <div className="navBar">
                <div className="navBrand">NEXUS</div>
                <div className="navActions">
                    <button
                        className="btn-pill btn-pill-ghost"
                        onClick={() => navigate("/history")}
                        style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                        <RestoreIcon style={{ fontSize: '1.1rem' }} />
                        History
                    </button>
                    <button
                        className="btn-pill btn-pill-danger"
                        onClick={() => {
                            localStorage.removeItem("token");
                            navigate("/auth");
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                        <LogoutIcon style={{ fontSize: '1.1rem' }} />
                        Logout
                    </button>
                </div>
            </div>

            {/* Main */}
            <div className="meetContainer">
                <div className="leftPanel">
                    <h2>Keep the conversation going, wherever you are.</h2>

                    <div className="joinBox">
                        <input
                            type="text"
                            placeholder="Enter meeting code…"
                            value={meetingCode}
                            onChange={e => setMeetingCode(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleJoinVideoCall()}
                            style={{
                                background: 'rgba(255,255,255,0.06)',
                                border: '1.5px solid rgba(249,115,22,0.22)',
                                borderRadius: '9999px',
                                padding: '12px 22px',
                                fontSize: '0.95rem',
                                color: '#fdf4ee',
                                outline: 'none',
                                minWidth: '240px',
                                flex: 1,
                                backdropFilter: 'blur(8px)',
                                fontFamily: 'Inter, sans-serif',
                                transition: 'border-color 0.2s, box-shadow 0.2s',
                            }}
                            onFocus={e => {
                                e.target.style.borderColor = '#f97316';
                                e.target.style.boxShadow = '0 0 0 3px rgba(249,115,22,0.16)';
                            }}
                            onBlur={e => {
                                e.target.style.borderColor = 'rgba(249,115,22,0.22)';
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                        <button
                            className="btn-pill btn-pill-primary"
                            onClick={handleJoinVideoCall}
                        >
                            Join →
                        </button>
                    </div>

                    <div className="statPills">
                        <div className="statPill">
                            <BoltIcon style={{ fontSize: '1rem', color: '#fb923c' }} />
                            <strong>HD</strong> Video
                        </div>
                        <div className="statPill">
                            <SecurityIcon style={{ fontSize: '1rem', color: '#f87171' }} />
                            <strong>E2E</strong> Encrypted
                        </div>
                        <div className="statPill">
                            ✨ AI-Powered Recaps
                        </div>
                    </div>
                </div>

                <div className="rightPanel">
                    <img src='/join_meeting_demo.png' alt="Nexus illustration" />
                </div>
            </div>
        </div>
    )
}

export default withAuth(HomeComponent)
