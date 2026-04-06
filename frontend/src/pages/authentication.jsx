import * as React from 'react';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Snackbar } from '@mui/material';
import { AuthContext } from '../contexts/AuthContext';
import "../App.css";

const O = '#f97316';  // orange
const R = '#ef4444';  // red

function GlassInput({ label, type = 'text', value, onChange, id, autoComplete }) {
    const [focused, setFocused] = React.useState(false);
    return (
        <div style={{ position: 'relative', marginBottom: '16px' }}>
            <label htmlFor={id} style={{
                display: 'block',
                marginBottom: '7px',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: focused ? '#fb923c' : 'rgba(253,244,238,0.55)',
                transition: 'color 0.2s',
                letterSpacing: '0.04em',
            }}>
                {label}
            </label>
            <input
                id={id}
                type={type}
                value={value}
                onChange={onChange}
                autoComplete={autoComplete}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.06)',
                    border: `1.5px solid ${focused ? O : 'rgba(249,115,22,0.2)'}`,
                    borderRadius: '12px',
                    padding: '13px 18px',
                    fontSize: '0.95rem',
                    color: '#fdf4ee',
                    outline: 'none',
                    fontFamily: 'Inter, sans-serif',
                    transition: 'border-color 0.22s, box-shadow 0.22s',
                    backdropFilter: 'blur(8px)',
                    boxShadow: focused ? '0 0 0 3px rgba(249,115,22,0.16)' : 'none',
                }}
            />
        </div>
    );
}

export default function Authentication() {
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [name, setName] = React.useState('');
    const [error, setError] = React.useState('');
    const [message, setMessage] = React.useState('');
    const [formState, setFormState] = React.useState(0);
    const [open, setOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    const { handleRegister, handleLogin } = React.useContext(AuthContext);

    let handleAuth = async () => {
        setLoading(true);
        setError('');
        try {
            if (formState === 0) {
                await handleLogin(username, password);
            } else {
                let result = await handleRegister(name, username, password);
                setMessage(result);
                setOpen(true);
                setFormState(0);
                setUsername('');
                setPassword('');
                setName('');
            }
        } catch (err) {
            setError(err.message || 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'relative',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
        }}>
            <div className="bgMesh" />

            {/* Glass card */}
            <div style={{
                position: 'relative',
                zIndex: 2,
                width: '100%',
                maxWidth: '420px',
                margin: '24px',
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(249,115,22,0.14)',
                borderRadius: '24px',
                padding: '40px 36px',
                boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(249,115,22,0.06)',
                animation: 'fadeSlideUp 0.55s ease both',
            }}>

                {/* Lock icon */}
                <div style={{
                    width: 52, height: 52,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #f97316, #ef4444)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 20px',
                    boxShadow: '0 6px 20px rgba(249,115,22,0.4)',
                }}>
                    <LockOutlinedIcon style={{ color: '#fff', fontSize: '1.4rem' }} />
                </div>

                {/* Brand */}
                <h2 style={{
                    textAlign: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    background: 'linear-gradient(90deg, #fb923c, #f87171)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    marginBottom: '6px',
                }}>NEXUS</h2>
                <p style={{
                    textAlign: 'center',
                    fontSize: '0.85rem',
                    color: 'rgba(253,244,238,0.45)',
                    marginBottom: '28px',
                }}>
                    {formState === 0 ? 'Welcome back — sign in to continue.' : 'Create your account to get started.'}
                </p>

                {/* Sign In / Sign Up toggle */}
                <div style={{
                    display: 'flex',
                    background: 'rgba(249,115,22,0.07)',
                    borderRadius: '9999px',
                    padding: '4px',
                    marginBottom: '28px',
                    border: '1px solid rgba(249,115,22,0.14)',
                }}>
                    {['Sign In', 'Sign Up'].map((label, i) => (
                        <button
                            key={i}
                            onClick={() => { setFormState(i); setError(''); }}
                            style={{
                                flex: 1,
                                padding: '9px 0',
                                borderRadius: '9999px',
                                border: 'none',
                                cursor: 'pointer',
                                fontFamily: 'Inter, sans-serif',
                                fontWeight: 600,
                                fontSize: '0.88rem',
                                transition: 'all 0.22s',
                                background: formState === i
                                    ? 'linear-gradient(135deg, #f97316, #ef4444)'
                                    : 'transparent',
                                color: formState === i ? '#fff' : 'rgba(253,244,238,0.5)',
                                boxShadow: formState === i ? '0 4px 14px rgba(249,115,22,0.3)' : 'none',
                            }}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* Fields */}
                {formState === 1 && (
                    <GlassInput id="name" label="Full Name" value={name} onChange={e => setName(e.target.value)} autoComplete="name" />
                )}
                <GlassInput id="username" label="Username" value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" />
                <GlassInput id="password" label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" />

                {/* Error */}
                {error && (
                    <div style={{
                        background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.28)',
                        borderRadius: '10px',
                        padding: '10px 14px',
                        fontSize: '0.84rem',
                        color: '#fca5a5',
                        marginBottom: '16px',
                    }}>
                        {error}
                    </div>
                )}

                {/* Submit */}
                <button
                    onClick={handleAuth}
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '13px 0',
                        borderRadius: '9999px',
                        border: 'none',
                        background: loading
                            ? 'rgba(249,115,22,0.35)'
                            : 'linear-gradient(135deg, #f97316, #ef4444)',
                        color: '#fff',
                        fontSize: '0.97rem',
                        fontWeight: 700,
                        fontFamily: 'Inter, sans-serif',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        boxShadow: loading ? 'none' : '0 6px 20px rgba(249,115,22,0.38)',
                        marginTop: '6px',
                        transition: 'all 0.22s',
                    }}
                    onMouseEnter={e => { if (!loading) { e.target.style.transform = 'translateY(-2px)'; e.target.style.filter = 'brightness(1.08)'; } }}
                    onMouseLeave={e => { e.target.style.transform = ''; e.target.style.filter = ''; }}
                >
                    {loading ? 'Please wait…' : (formState === 0 ? 'Login →' : 'Create Account →')}
                </button>
            </div>

            <Snackbar open={open} autoHideDuration={4000} message={message} onClose={() => setOpen(false)} />
        </div>
    );
}
