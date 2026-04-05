import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [aadhaar, setAadhaar] = useState('');
    const [password, setPassword] = useState('');
    const [state, setState] = useState('');
    const [city, setCity] = useState('');
    const [street, setStreet] = useState('');
    const [pincode, setPincode] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isLogin) {
                const res = await axios.post('/api/users/login', { email, password });
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(res.data.user));
            } else {
                await axios.post('/api/users/register', { 
                    username, name, email, password, phone, aadhaar,
                    state, city, street, pincode 
                });
                const res = await axios.post('/api/users/login', { email, password });
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(res.data.user));
            }
            window.dispatchEvent(new Event('authChange'));
            navigate('/dashboard');
        } catch (error) {
            alert(error.response?.data?.msg || error.response?.data?.error || 'Authentication Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            className="container"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5, type: 'spring' }}
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '80vh'
            }}
        >
            <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem 2rem' }}>
                <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '2rem', fontWeight: 700 }}>
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                </h2>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

                    {!isLogin && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            <input
                                type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required={!isLogin}
                                style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }}
                            />
                            <input
                                type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required={!isLogin}
                                style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }}
                            />
                            <input
                                type="tel" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} required={!isLogin}
                                style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }}
                            />
                            <input
                                type="text" placeholder="Aadhaar Number" value={aadhaar} onChange={(e) => setAadhaar(e.target.value)} required={!isLogin}
                                style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }}
                            />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <input
                                    type="text" placeholder="State" value={state} onChange={(e) => setState(e.target.value)} required={!isLogin}
                                    style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }}
                                />
                                <input
                                    type="text" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} required={!isLogin}
                                    style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }}
                                />
                            </div>
                            <input
                                type="text" placeholder="Street Address" value={street} onChange={(e) => setStreet(e.target.value)} required={!isLogin}
                                style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }}
                            />
                            <input
                                type="text" placeholder="Pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} required={!isLogin}
                                style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }}
                            />
                        </motion.div>
                    )}

                    <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{
                            width: '100%', padding: '12px 16px', borderRadius: '8px',
                            border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)',
                            color: 'white', outline: 'none'
                        }}
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{
                            width: '100%', padding: '12px 16px', borderRadius: '8px',
                            border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)',
                            color: 'white', outline: 'none'
                        }}
                    />

                    <motion.button
                        whileHover={{ scale: 1.02, backgroundColor: 'var(--primary-hover)' }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        style={{
                            background: loading ? 'gray' : 'var(--primary)', color: 'white', padding: '14px',
                            borderRadius: '8px', fontWeight: 600, fontSize: '1rem', marginTop: '1rem',
                            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
                    </motion.button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)' }}>
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <span
                        onClick={() => setIsLogin(!isLogin)}
                        style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 500 }}
                    >
                        {isLogin ? 'Sign up' : 'Sign in'}
                    </span>
                </p>
            </div>
        </motion.div>
    );
};

export default Login;
