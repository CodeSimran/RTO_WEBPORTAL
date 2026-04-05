import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Car, FileText, CreditCard, AlertTriangle, BookOpen, ChevronRight, CheckCircle, Clock, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Services = () => {
    const [user, setUser] = useState(null);
    const [recentStatus, setRecentStatus] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) {
            const currentUser = JSON.parse(stored);
            setUser(currentUser);
            fetchStatus(currentUser._id || currentUser.id);
        }
    }, []);

    const fetchStatus = async (userId) => {
        try {
            const [v, l, p, i] = await Promise.all([
                axios.get(`/api/vehicles?user_id=${userId}`),
                axios.get(`/api/licenses?user_id=${userId}`),
                axios.get(`/api/payments?user=${userId}`),
                axios.get(`/api/issues?user=${userId}`)
            ]);

            const all = [
                ...v.data.map(x => ({ type: 'Vehicle', status: x.status, id: x._id, detail: x.rc_number })),
                ...l.data.map(x => ({ type: 'License', status: x.status, id: x._id, detail: x.license_no || 'Pending' })),
                ...p.data.map(x => ({ type: 'Payment', status: x.payment_status, id: x._id, detail: `₹${x.amount}` })),
                ...i.data.map(x => ({ type: 'Issue', status: x.status, id: x._id, detail: x.description?.substring(0, 30) }))
            ];
            setRecentStatus(all.slice(0, 4));
        } catch (err) { console.error(err); }
    };

    const mainServices = [
        {
            title: 'Vehicle Registration',
            icon: <Car size={32} color="#3b82f6" />,
            desc: 'Register a new vehicle or transfer ownership seamlessly online.',
            path: '/register-vehicle',
            color: '#3b82f6',
            bg: 'rgba(59,130,246,0.1)'
        },
        {
            title: 'License Services',
            icon: <FileText size={32} color="#8b5cf6" />,
            desc: 'Apply for fresh learners or permanent driving licenses.',
            path: '/apply-license',
            color: '#8b5cf6',
            bg: 'rgba(139,92,246,0.1)'
        },
        {
            title: 'Mock Test',
            icon: <BookOpen size={32} color="#f59e0b" />,
            desc: 'Practice driving rules with our interactive mock test before your exam.',
            path: '/mock-test',
            color: '#f59e0b',
            bg: 'rgba(245,158,11,0.1)'
        },
        {
            title: 'Secure Payments',
            icon: <CreditCard size={32} color="#10b981" />,
            desc: 'Pay your pending RTO fees, challans and registration charges.',
            path: '/payment',
            color: '#10b981',
            bg: 'rgba(16,185,129,0.1)'
        },
        {
            title: 'Report Issue',
            icon: <AlertTriangle size={32} color="#ef4444" />,
            desc: 'Report road issues, document errors, or any grievances instantly.',
            path: '/report-issue',
            color: '#ef4444',
            bg: 'rgba(239,68,68,0.1)'
        },
        {
            title: 'RTO Official Portal',
            icon: <Shield size={32} color="#06b6d4" />,
            desc: 'RTO officials can manage and approve user requests from this portal.',
            path: '/rto-dashboard',
            color: '#06b6d4',
            bg: 'rgba(6,182,212,0.1)'
        },
    ];

    const getStatusColor = (status) => {
        if (status === 'Approved' || status === 'Paid' || status === 'Resolved') return '#10b981';
        if (status === 'Rejected') return '#ef4444';
        return '#f59e0b';
    };

    return (
        <motion.div
            className="container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ padding: '3rem 20px' }}
        >
            <div style={{ marginBottom: '3rem', textAlign: 'left' }}>
                <h1 style={{ fontSize: '2.8rem', fontWeight: 800 }}>
                    Our <span className="gradient-text">Services</span>
                </h1>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '1.05rem' }}>
                    Everything you need for vehicle and license management in one place.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {mainServices.map((service, i) => (
                    <motion.div
                        key={i}
                        className="glass-panel"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        whileHover={{ y: -8, boxShadow: `0 20px 40px rgba(0,0,0,0.5), 0 0 0 1px ${service.color}30` }}
                        style={{ padding: '2rem', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'all 0.3s' }}
                        onClick={() => navigate(service.path)}
                    >
                        <div style={{ marginBottom: '1.5rem', background: service.bg, padding: '14px', borderRadius: '14px', width: 'fit-content' }}>
                            {service.icon}
                        </div>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.7rem' }}>{service.title}</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem', flexGrow: 1, lineHeight: 1.6 }}>{service.desc}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: service.color, fontWeight: 700, fontSize: '0.9rem' }}>
                            Get Started <ChevronRight size={16} />
                        </div>
                    </motion.div>
                ))}
            </div>

            {user && recentStatus.length > 0 && (
                <motion.div
                    className="glass-panel"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginTop: '3rem', padding: '2rem' }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Your Active Applications</h2>
                        <Link to="/profile" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem' }}>View Full Profile →</Link>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {recentStatus.map((item, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', cursor: 'default' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: getStatusColor(item.status), flexShrink: 0 }}></div>
                                    <span style={{ fontWeight: 600 }}>{item.type}</span>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.detail}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: getStatusColor(item.status), fontWeight: 700, fontSize: '0.85rem' }}>
                                    {item.status === 'Approved' || item.status === 'Paid' || item.status === 'Resolved' ? <CheckCircle size={15} /> : <Clock size={15} />}
                                    {item.status}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};

export default Services;
