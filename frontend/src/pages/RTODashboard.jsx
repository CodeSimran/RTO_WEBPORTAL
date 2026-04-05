import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Users, Car, FileText, AlertTriangle, RefreshCw, Shield } from 'lucide-react';
import axios from 'axios';

const RTODashboard = () => {
    const [pendingRequests, setPendingRequests] = useState([]);
    const [allStats, setAllStats] = useState({ vehicles: 0, licenses: 0, issues: 0, users: 0 });
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('All');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [vehiclesRes, licensesRes, issuesRes, usersRes] = await Promise.all([
                axios.get('/api/vehicles'),
                axios.get('/api/licenses'),
                axios.get('/api/issues'),
                axios.get('/api/users')
            ]);

            setAllStats({
                vehicles: vehiclesRes.data.length,
                licenses: licensesRes.data.length,
                issues: issuesRes.data.length,
                users: usersRes.data.length
            });

            const requests = [
                ...vehiclesRes.data.filter(v => v.status === 'Pending').map(v => ({
                    id: v._id,
                    type: 'Vehicle Registration',
                    category: 'Vehicle',
                    user: v.user_id?.name || 'Unknown User',
                    email: v.user_id?.email || '',
                    detail: `RC: ${v.rc_number}`,
                    date: new Date(v.createdAt).toLocaleDateString(),
                    status: v.status,
                    apiEndpoint: `/api/vehicles/${v._id}`,
                    color: '#3b82f6'
                })),
                ...licensesRes.data.filter(l => l.status === 'Pending').map(l => ({
                    id: l._id,
                    type: 'License Application',
                    category: 'License',
                    user: l.user_id?.name || 'Unknown User',
                    email: l.user_id?.email || '',
                    detail: `License #${l.license_no || 'New'} | Slot: ${l.slot ? new Date(l.slot).toLocaleDateString() : 'N/A'}`,
                    date: new Date(l.createdAt).toLocaleDateString(),
                    status: l.status,
                    apiEndpoint: `/api/licenses/${l._id}`,
                    color: '#8b5cf6'
                })),
                ...issuesRes.data.filter(i => i.status === 'Open').map(i => ({
                    id: i._id,
                    type: 'Issue Report',
                    category: 'Issue',
                    user: i.user?.name || 'Unknown User',
                    email: i.user?.email || '',
                    detail: i.description?.substring(0, 50) || 'No description',
                    date: new Date(i.createdAt).toLocaleDateString(),
                    status: i.status,
                    apiEndpoint: `/api/issues/${i._id}`,
                    color: '#ef4444',
                    approveLabel: 'Resolve',
                    approveStatus: 'Resolved'
                }))
            ];

            setPendingRequests(requests);
        } catch (error) {
            console.error('Failed to fetch requests', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleAction = async (endpoint, newStatus) => {
        try {
            await axios.put(endpoint, { status: newStatus });
            fetchData();
        } catch (error) {
            console.error(`Failed to update status`, error);
            alert('Action failed. Please try again.');
        }
    };

    const filtered = activeFilter === 'All' ? pendingRequests : pendingRequests.filter(r => r.category === activeFilter);

    const statCards = [
        { label: 'Total Users', value: allStats.users, icon: <Users size={22} color="#3b82f6" />, bg: 'rgba(59,130,246,0.1)' },
        { label: 'Total Vehicles', value: allStats.vehicles, icon: <Car size={22} color="#8b5cf6" />, bg: 'rgba(139,92,246,0.1)' },
        { label: 'Total Licenses', value: allStats.licenses, icon: <FileText size={22} color="#10b981" />, bg: 'rgba(16,185,129,0.1)' },
        { label: 'Total Issues', value: allStats.issues, icon: <AlertTriangle size={22} color="#ef4444" />, bg: 'rgba(239,68,68,0.1)' },
    ];

    return (
        <motion.div
            className="container"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            style={{ padding: '3rem 20px' }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.5rem' }}>
                        <Shield size={28} color="var(--primary)" />
                        <h1 style={{ fontSize: '2.3rem', fontWeight: 700 }}>RTO Official Portal</h1>
                    </div>
                    <p style={{ color: 'var(--text-muted)' }}>Manage and approve user requests in real-time</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={fetchData}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        background: 'rgba(59,130,246,0.15)', border: '1px solid var(--primary)',
                        color: 'var(--primary)', padding: '10px 18px', borderRadius: '10px',
                        fontWeight: 600, cursor: 'pointer'
                    }}
                >
                    <RefreshCw size={16} /> Refresh
                </motion.button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.2rem', marginBottom: '2.5rem' }}>
                {statCards.map((s, i) => (
                    <motion.div
                        key={i}
                        className="glass-panel"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        style={{ padding: '1.2rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}
                    >
                        <div style={{ background: s.bg, padding: '12px', borderRadius: '12px' }}>{s.icon}</div>
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{s.label}</p>
                            <p style={{ fontSize: '1.8rem', fontWeight: 700 }}>{s.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {['All', 'Vehicle', 'License', 'Issue'].map(f => (
                    <button
                        key={f}
                        onClick={() => setActiveFilter(f)}
                        style={{
                            padding: '8px 18px', borderRadius: '20px', fontWeight: 600, fontSize: '0.85rem',
                            background: activeFilter === f ? 'var(--primary)' : 'rgba(255,255,255,0.08)',
                            color: activeFilter === f ? 'white' : 'var(--text-muted)',
                            border: activeFilter === f ? 'none' : '1px solid var(--border-color)',
                            cursor: 'pointer'
                        }}
                    >
                        {f} {f === 'All' ? `(${pendingRequests.length})` : `(${pendingRequests.filter(r => r.category === f).length})`}
                    </button>
                ))}
            </div>

            <motion.div
                className="glass-panel"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={{ padding: '2rem', overflowX: 'auto' }}
            >
                <h2 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', fontWeight: 700 }}>
                    Pending Approvals 
                    <span style={{ marginLeft: '10px', fontSize: '0.9rem', background: 'rgba(239,68,68,0.2)', color: '#ef4444', padding: '3px 10px', borderRadius: '20px' }}>
                        {filtered.length} pending
                    </span>
                </h2>

                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                            <th style={{ padding: '0.8rem 1rem' }}>Type</th>
                            <th style={{ padding: '0.8rem 1rem' }}>User</th>
                            <th style={{ padding: '0.8rem 1rem' }}>Details</th>
                            <th style={{ padding: '0.8rem 1rem' }}>Date</th>
                            <th style={{ padding: '0.8rem 1rem' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center' }}>Loading...</td></tr>}
                        {!loading && filtered.length === 0 && (
                            <tr>
                                <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    ✅ No pending requests! All caught up.
                                </td>
                            </tr>
                        )}
                        {filtered.map((req) => (
                            <motion.tr
                                key={req.id}
                                whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                                style={{ borderBottom: '1px solid var(--border-color)' }}
                            >
                                <td style={{ padding: '1rem' }}>
                                    <span style={{ padding: '4px 12px', borderRadius: '20px', background: `${req.color}20`, color: req.color, fontWeight: 700, fontSize: '0.8rem' }}>
                                        {req.type}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{req.user}</p>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{req.email}</p>
                                </td>
                                <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '200px' }}>{req.detail}</td>
                                <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{req.date}</td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleAction(req.apiEndpoint, req.approveStatus || 'Approved')}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '5px',
                                                background: 'rgba(16,185,129,0.15)', border: '1px solid #10b981',
                                                color: '#10b981', padding: '6px 14px', borderRadius: '8px',
                                                fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer'
                                            }}
                                        >
                                            <CheckCircle size={14} /> {req.approveLabel || 'Approve'}
                                        </motion.button>
                                        {req.category !== 'Issue' && (
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleAction(req.apiEndpoint, 'Rejected')}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '5px',
                                                    background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444',
                                                    color: '#ef4444', padding: '6px 14px', borderRadius: '8px',
                                                    fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer'
                                                }}
                                            >
                                                <XCircle size={14} /> Reject
                                            </motion.button>
                                        )}
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>
        </motion.div>
    );
};

export default RTODashboard;
