import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, User, Edit3, Save, X, BookOpen } from 'lucide-react';

const Profile = () => {
    const [vehicles, setVehicles] = useState([]);
    const [licenses, setLicenses] = useState([]);
    const [payments, setPayments] = useState([]);
    const [issues, setIssues] = useState([]);
    const [mockTests, setMockTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('vehicles');
    const [currentUser, setCurrentUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({});
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfileData = async () => {
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                navigate('/login');
                return;
            }
            const user = JSON.parse(userStr);
            setCurrentUser(user);
            setEditData({ name: user.name, phone: user.phone, state: user.state, city: user.city, street: user.street, pincode: user.pincode });
            const userId = user._id || user.id;

            try {
                const [vehiclesRes, licensesRes, paymentsRes, issuesRes, mocktestsRes] = await Promise.all([
                    axios.get(`/api/vehicles?user_id=${userId}`),
                    axios.get(`/api/licenses?user_id=${userId}`),
                    axios.get(`/api/payments?user=${userId}`),
                    axios.get(`/api/issues?user=${userId}`),
                    axios.get(`/api/mocktests?user=${userId}`)
                ]);

                setVehicles(vehiclesRes.data);
                setLicenses(licensesRes.data);
                setPayments(paymentsRes.data);
                setIssues(issuesRes.data);
                setMockTests(mocktestsRes.data);
            } catch (error) {
                console.error("Failed to fetch profile data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfileData();
    }, [navigate]);

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const userId = currentUser._id || currentUser.id;
            const res = await axios.put(`/api/users/${userId}`, editData);
            const updatedUser = { ...currentUser, ...res.data };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setCurrentUser(updatedUser);
            window.dispatchEvent(new Event('authChange'));
            setIsEditing(false);
            alert('Profile updated successfully!');
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const getStatusIcon = (status) => {
        if (status === 'Approved' || status === 'Paid') return <CheckCircle color="#10b981" size={16} />;
        if (status === 'Rejected') return <XCircle color="#ef4444" size={16} />;
        return <Clock color="#f59e0b" size={16} />;
    };

    const getStatusColor = (status) => {
        if (status === 'Approved' || status === 'Paid' || status === 'Resolved') return '#10b981';
        if (status === 'Rejected') return '#ef4444';
        return '#f59e0b';
    };

    const inputStyle = {
        width: '100%', padding: '10px 14px', borderRadius: '8px',
        border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.3)',
        color: 'white', outline: 'none', fontSize: '0.95rem'
    };

    const tabs = ['vehicles', 'licenses', 'payments', 'issues', 'mock tests'];

    return (
        <motion.div
            className="container"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ padding: '3rem 20px', maxWidth: '1000px', margin: '0 auto' }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 700 }}>My <span className="gradient-text">Profile</span></h1>
            </div>

            {/* User Information Section */}
            {currentUser && (
                <motion.div
                    className="glass-panel"
                    style={{ padding: '2rem', marginBottom: '2.5rem' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--primary)' }}>
                            <User size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                            Personal Information
                        </h2>
                        {!isEditing ? (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsEditing(true)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    background: 'rgba(59,130,246,0.15)', border: '1px solid var(--primary)',
                                    color: 'var(--primary)', padding: '8px 16px', borderRadius: '8px',
                                    fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer'
                                }}
                            >
                                <Edit3 size={14} /> Edit Profile
                            </motion.button>
                        ) : (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    onClick={handleSaveProfile}
                                    disabled={saving}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '6px',
                                        background: 'var(--accent)', border: 'none',
                                        color: 'white', padding: '8px 16px', borderRadius: '8px',
                                        fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer'
                                    }}
                                >
                                    <Save size={14} /> {saving ? 'Saving...' : 'Save'}
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    onClick={() => setIsEditing(false)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '6px',
                                        background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444',
                                        color: '#ef4444', padding: '8px 16px', borderRadius: '8px',
                                        fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer'
                                    }}
                                >
                                    <X size={14} /> Cancel
                                </motion.button>
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Full Name</p>
                            {isEditing ? <input style={inputStyle} value={editData.name || ''} onChange={e => setEditData({ ...editData, name: e.target.value })} /> : <p style={{ fontWeight: 600 }}>{currentUser.name || 'N/A'}</p>}
                        </div>
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</p>
                            <p style={{ fontWeight: 600 }}>{currentUser.email || 'N/A'}</p>
                        </div>
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone</p>
                            {isEditing ? <input style={inputStyle} value={editData.phone || ''} onChange={e => setEditData({ ...editData, phone: e.target.value })} /> : <p style={{ fontWeight: 600 }}>{currentUser.phone || 'N/A'}</p>}
                        </div>
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Aadhaar Number</p>
                            <p style={{ fontWeight: 600 }}>{currentUser.aadhaar ? `XXXX-XXXX-${currentUser.aadhaar.slice(-4)}` : 'N/A'}</p>
                        </div>
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>State</p>
                            {isEditing ? <input style={inputStyle} value={editData.state || ''} onChange={e => setEditData({ ...editData, state: e.target.value })} /> : <p style={{ fontWeight: 600 }}>{currentUser.state || 'N/A'}</p>}
                        </div>
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>City</p>
                            {isEditing ? <input style={inputStyle} value={editData.city || ''} onChange={e => setEditData({ ...editData, city: e.target.value })} /> : <p style={{ fontWeight: 600 }}>{currentUser.city || 'N/A'}</p>}
                        </div>
                        <div style={{ gridColumn: isEditing ? '' : '1 / -1' }}>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Street Address</p>
                            {isEditing ? <input style={inputStyle} value={editData.street || ''} onChange={e => setEditData({ ...editData, street: e.target.value })} /> : <p style={{ fontWeight: 600 }}>{currentUser.street ? `${currentUser.street}, ${currentUser.city}, ${currentUser.state} – ${currentUser.pincode}` : 'No address provided'}</p>}
                        </div>
                        {isEditing && (
                            <div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pincode</p>
                                <input style={inputStyle} value={editData.pincode || ''} onChange={e => setEditData({ ...editData, pincode: e.target.value })} />
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                {tabs.map(tab => (
                    <motion.button
                        key={tab}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '10px 22px',
                            borderRadius: '20px',
                            background: activeTab === tab ? 'var(--primary)' : 'rgba(255,255,255,0.08)',
                            color: activeTab === tab ? 'white' : 'var(--text-muted)',
                            border: activeTab === tab ? 'none' : '1px solid var(--border-color)',
                            fontWeight: 600,
                            textTransform: 'capitalize',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            transition: 'all 0.2s'
                        }}
                    >
                        {tab === 'vehicles' ? `Vehicles (${vehicles.length})` : tab === 'licenses' ? `Licenses (${licenses.length})` : tab === 'payments' ? `Payments (${payments.length})` : tab === 'issues' ? `Issues (${issues.length})` : `Mock Tests (${mockTests.length})`}
                    </motion.button>
                ))}
            </div>

            <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-panel"
                style={{ padding: '2rem', overflowX: 'auto' }}
            >
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading data...</div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                <th style={{ padding: '1rem' }}>ID</th>
                                {activeTab === 'vehicles' && <><th style={{ padding: '1rem' }}>RC Number</th><th style={{ padding: '1rem' }}>Insurance No</th><th style={{ padding: '1rem' }}>Reg. Date</th></>}
                                {activeTab === 'licenses' && <><th style={{ padding: '1rem' }}>License No</th><th style={{ padding: '1rem' }}>Expiry Date</th><th style={{ padding: '1rem' }}>Slot</th></>}
                                {activeTab === 'payments' && <><th style={{ padding: '1rem' }}>Amount</th><th style={{ padding: '1rem' }}>For</th><th style={{ padding: '1rem' }}>Date</th><th style={{ padding: '1rem' }}>Txn Ref</th></>}
                                {activeTab === 'issues' && <><th style={{ padding: '1rem' }}>Description</th><th style={{ padding: '1rem' }}>Date</th></>}
                                {activeTab === 'mock tests' && <><th style={{ padding: '1rem' }}>Score</th><th style={{ padding: '1rem' }}>Test Date</th></>}
                                <th style={{ padding: '1rem' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activeTab === 'vehicles' && vehicles.map(v => (
                                <motion.tr key={v._id} whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{v._id.substring(0, 8)}…</td>
                                    <td style={{ padding: '1rem', fontWeight: 600 }}>{v.rc_number}</td>
                                    <td style={{ padding: '1rem' }}>{v.insurance_no}</td>
                                    <td style={{ padding: '1rem' }}>{new Date(v.registration_date || v.createdAt).toLocaleDateString()}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '20px', background: `${getStatusColor(v.status)}20`, color: getStatusColor(v.status), fontWeight: 600, fontSize: '0.85rem' }}>
                                            {getStatusIcon(v.status)} {v.status}
                                        </span>
                                    </td>
                                </motion.tr>
                            ))}
                            {activeTab === 'vehicles' && vehicles.length === 0 && (
                                <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No vehicles registered yet. <span style={{ color: 'var(--primary)', cursor: 'pointer' }} onClick={() => navigate('/register-vehicle')}>Register one now →</span></td></tr>
                            )}

                            {activeTab === 'licenses' && licenses.map(l => (
                                <motion.tr key={l._id} whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{l._id.substring(0, 8)}…</td>
                                    <td style={{ padding: '1rem', fontWeight: 600 }}>{l.license_no || 'Pending'}</td>
                                    <td style={{ padding: '1rem' }}>{l.expiry_date ? new Date(l.expiry_date).toLocaleDateString() : 'N/A'}</td>
                                    <td style={{ padding: '1rem' }}>{l.slot ? new Date(l.slot).toLocaleString() : 'N/A'}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '20px', background: `${getStatusColor(l.status)}20`, color: getStatusColor(l.status), fontWeight: 600, fontSize: '0.85rem' }}>
                                            {getStatusIcon(l.status)} {l.status}
                                        </span>
                                    </td>
                                </motion.tr>
                            ))}
                            {activeTab === 'licenses' && licenses.length === 0 && (
                                <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No license applications. <span style={{ color: 'var(--primary)', cursor: 'pointer' }} onClick={() => navigate('/apply-license')}>Apply now →</span></td></tr>
                            )}

                            {activeTab === 'payments' && payments.map(p => (
                                <motion.tr key={p._id} whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '1rem', fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{p._id.substring(0, 10)}…</td>
                                    <td style={{ padding: '1rem', fontWeight: 800, color: p.payment_status === 'Paid' ? '#10b981' : '#f59e0b', fontSize: '1rem' }}>
                                        ₹{parseFloat(p.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{p.description || 'RTO Service Fee'}</td>
                                    <td style={{ padding: '1rem' }}>
                                        {new Date(p.payment_date || p.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            {new Date(p.payment_date || p.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                        {p.transaction_ref || '—'}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '20px', background: `${getStatusColor(p.payment_status)}20`, color: getStatusColor(p.payment_status), fontWeight: 600, fontSize: '0.85rem' }}>
                                            {getStatusIcon(p.payment_status)} {p.payment_status}
                                        </span>
                                    </td>
                                </motion.tr>
                            ))}
                            {activeTab === 'payments' && payments.length === 0 && (
                                <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No payment records. <span style={{ color: 'var(--primary)', cursor: 'pointer' }} onClick={() => navigate('/payment')}>Make a payment →</span></td></tr>
                            )}

                            {activeTab === 'issues' && issues.map(i => (
                                <motion.tr key={i._id} whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{i._id.substring(0, 8)}…</td>
                                    <td style={{ padding: '1rem', maxWidth: '300px' }}>{i.description?.substring(0, 60)}{i.description?.length > 60 ? '…' : ''}</td>
                                    <td style={{ padding: '1rem' }}>{new Date(i.report_date || i.createdAt).toLocaleDateString()}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '20px', background: `${getStatusColor(i.status)}20`, color: getStatusColor(i.status), fontWeight: 600, fontSize: '0.85rem' }}>
                                            {getStatusIcon(i.status)} {i.status}
                                        </span>
                                    </td>
                                </motion.tr>
                            ))}
                            {activeTab === 'issues' && issues.length === 0 && (
                                <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No issues reported. <span style={{ color: 'var(--primary)', cursor: 'pointer' }} onClick={() => navigate('/report-issue')}>Report one →</span></td></tr>
                            )}

                            {activeTab === 'mock tests' && mockTests.map(t => {
                                const passed = t.score >= 7;
                                const scoreColor = t.score / 10 >= 0.8 ? '#10b981' : t.score / 10 >= 0.6 ? '#f59e0b' : '#ef4444';
                                return (
                                    <motion.tr key={t._id} whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{t._id.substring(0, 10)}…</td>
                                        <td style={{ padding: '1rem', fontWeight: 700, color: scoreColor }}>
                                            {t.score} / 10
                                            <span style={{ marginLeft: '6px', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 400 }}>({Math.round(t.score * 10)}%)</span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            {new Date(t.test_date || t.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                                {new Date(t.test_date || t.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 10px', borderRadius: '20px', background: 'rgba(16,185,129,0.15)', color: '#10b981', fontWeight: 700, fontSize: '0.8rem', width: 'fit-content' }}>
                                                    {getStatusIcon(t.status)} {t.status || 'Completed'}
                                                </span>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '20px', background: passed ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: passed ? '#10b981' : '#ef4444', fontWeight: 700, fontSize: '0.78rem', width: 'fit-content' }}>
                                                    {passed ? '✓ PASSED' : '✗ FAILED'}
                                                </span>
                                            </div>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                            {activeTab === 'mock tests' && mockTests.length === 0 && (
                                <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No mock tests taken yet. <span style={{ color: 'var(--primary)', cursor: 'pointer' }} onClick={() => navigate('/mock-test')}>Take a test →</span></td></tr>
                            )}
                        </tbody>
                    </table>
                )}
            </motion.div>
        </motion.div>
    );
};

export default Profile;
