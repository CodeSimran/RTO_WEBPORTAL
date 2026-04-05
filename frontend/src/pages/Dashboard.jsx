import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Car, CreditCard, AlertTriangle, FileText, BookOpen } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [stats, setStats] = useState({ vehicles: 0, licenses: 0, payments: 0, issues: 0, tests: 0 });
    const [activities, setActivities] = useState([]);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboardData = async () => {
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                navigate('/login');
                return;
            }
            const currentUser = JSON.parse(userStr);
            setUser(currentUser);
            const userId = currentUser._id || currentUser.id;

            try {
                const [vehiclesRes, licensesRes, paymentsRes, issuesRes] = await Promise.all([
                    axios.get(`/api/vehicles?user_id=${userId}`),
                    axios.get(`/api/licenses?user_id=${userId}`),
                    axios.get(`/api/payments?user=${userId}`),
                    axios.get(`/api/issues?user=${userId}`)
                ]);

                const myVehicles = vehiclesRes.data;
                const myLicenses = licensesRes.data;
                const myPayments = paymentsRes.data;
                const myIssues = issuesRes.data;

                const pendingPaymentAmount = myPayments
                    .filter(p => p.payment_status === 'Pending')
                    .reduce((acc, p) => acc + (p.amount || 0), 0);

                setStats({
                    vehicles: myVehicles.length,
                    licenses: myLicenses.length,
                    payments: pendingPaymentAmount,
                    issues: myIssues.filter(i => i.status === 'Open').length
                });

                const allActivities = [
                    ...myVehicles.map(v => ({
                        tag: 'Vehicle', 
                        desc: `RC: ${v.rc_number} – ${v.status}`, 
                        date: new Date(v.updatedAt || v.createdAt), 
                        color: '#3b82f6'
                    })),
                    ...myLicenses.map(l => ({
                        tag: 'License', 
                        desc: `License #${l.license_no || 'Pending'} – ${l.status}`, 
                        date: new Date(l.updatedAt || l.createdAt), 
                        color: '#8b5cf6'
                    })),
                    ...myIssues.map(i => ({
                        tag: 'Issue', 
                        desc: `Issue reported – ${i.status}`, 
                        date: new Date(i.updatedAt || i.createdAt), 
                        color: '#ef4444'
                    })),
                    ...myPayments.map(p => ({
                        tag: 'Payment', 
                        desc: `₹${p.amount} – ${p.payment_status}`, 
                        date: new Date(p.updatedAt || p.createdAt), 
                        color: '#10b981'
                    }))
                ];
                allActivities.sort((a, b) => b.date - a.date);
                
                setActivities(allActivities.slice(0, 6).map(act => ({
                    ...act,
                    date: act.date.toLocaleString()
                })));

            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            }
        };

        fetchDashboardData();
    }, [navigate]);

    const statCards = [
        { title: 'Registered Vehicles', value: stats.vehicles, icon: <Car size={24} color="#3b82f6" />, bg: 'rgba(59,130,246,0.1)' },
        { title: 'License Applications', value: stats.licenses, icon: <FileText size={24} color="#8b5cf6" />, bg: 'rgba(139,92,246,0.1)' },
        { title: 'Pending Payment (₹)', value: `₹${stats.payments}`, icon: <CreditCard size={24} color="#10b981" />, bg: 'rgba(16,185,129,0.1)' },
        { title: 'Open Issues', value: stats.issues, icon: <AlertTriangle size={24} color="#ef4444" />, bg: 'rgba(239,68,68,0.1)' }
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 700 }}>Overview</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                        Welcome back, <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{user?.name || 'User'}</span>!
                    </p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/profile')}
                    style={{
                        background: 'var(--primary)', color: 'white', padding: '10px 20px',
                        borderRadius: '12px', fontWeight: 600, fontSize: '0.9rem',
                        boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
                    }}
                >
                    View Profile
                </motion.button>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.5rem',
                marginBottom: '3rem'
            }}>
                {statCards.map((stat, i) => (
                    <motion.div
                        key={i}
                        className="glass-panel"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ y: -5, borderColor: 'rgba(255,255,255,0.2)' }}
                        style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'default' }}
                    >
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.title}</p>
                            <h2 style={{ fontSize: '2.2rem', fontWeight: 700 }}>{stat.value}</h2>
                        </div>
                        <div style={{ background: stat.bg, padding: '14px', borderRadius: '14px' }}>
                            {stat.icon}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
                {[
                    { label: '🚗 Register Vehicle', path: '/register-vehicle', color: '#3b82f6' },
                    { label: '📋 Apply License', path: '/apply-license', color: '#8b5cf6' },
                    { label: '💳 Make Payment', path: '/payment', color: '#10b981' },
                    { label: '⚠️ Report Issue', path: '/report-issue', color: '#ef4444' },
                    { label: '📝 Mock Test', path: '/mock-test', color: '#f59e0b' },
                    { label: '🏛️ RTO Portal', path: '/rto-dashboard', color: '#06b6d4' },
                ].map((action, i) => (
                    <motion.button
                        key={i}
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => navigate(action.path)}
                        style={{
                            background: `${action.color}15`,
                            border: `1px solid ${action.color}40`,
                            color: 'var(--text-main)',
                            padding: '14px 18px',
                            borderRadius: '12px',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.2s'
                        }}
                    >
                        {action.label}
                    </motion.button>
                ))}
            </div>

            <motion.div
                className="glass-panel"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                style={{ padding: '2rem' }}
            >
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 700 }}>Recent Activities</h2>
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                    {activities.length > 0 ? activities.map((act, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 1rem', borderRadius: '8px', cursor: 'default' }}
                        >
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '20px', background: `${act.color}20`, color: act.color, fontWeight: 700, whiteSpace: 'nowrap' }}>{act.tag}</span>
                                <span style={{ fontSize: '0.95rem' }}>{act.desc}</span>
                            </div>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap', marginLeft: '1rem' }}>{act.date}</span>
                        </motion.div>
                    )) : (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <p style={{ color: 'var(--text-muted)' }}>No recent activities. Start by registering a vehicle!</p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                onClick={() => navigate('/register-vehicle')}
                                style={{ marginTop: '1rem', background: 'var(--primary)', color: 'white', padding: '10px 24px', borderRadius: '8px', fontWeight: 600 }}
                            >
                                Get Started
                            </motion.button>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default Dashboard;
