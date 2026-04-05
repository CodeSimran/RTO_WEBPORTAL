import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    CreditCard, Lock, CheckCircle, Clock, Hash, User,
    CalendarDays, IndianRupee, Activity, Receipt, Plus, X, Loader
} from 'lucide-react';

const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: '10px',
    border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.25)',
    color: 'white', outline: 'none', fontSize: '0.95rem', boxSizing: 'border-box'
};

const PAYMENT_TYPES = [
    'Vehicle Registration Fee',
    'License Application Fee',
    'Challan Payment',
    'Transfer of Ownership Fee',
    'Permit Fee',
    'Other RTO Fee'
];

const SecurePayment = () => {
    const [user, setUser] = useState(null);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showNewForm, setShowNewForm] = useState(false);
    const [payingId, setPayingId] = useState(null);      // ID of payment being processed
    const [successRecord, setSuccessRecord] = useState(null); // last successful payment

    // New payment form state
    const [formAmount, setFormAmount] = useState('');
    const [formDesc, setFormDesc] = useState('Vehicle Registration Fee');
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [cardHolder, setCardHolder] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) { navigate('/login'); return; }
        const u = JSON.parse(userStr);
        setUser(u);
        setCardHolder(u.name || '');
        fetchPayments(u._id || u.id);
    }, [navigate]);

    const fetchPayments = async (userId) => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/payments?user=${userId}`);
            setPayments(res.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    // Format card number input as groups of 4
    const handleCardNumberChange = (e) => {
        const val = e.target.value.replace(/\D/g, '').substring(0, 16);
        setCardNumber(val.replace(/(.{4})/g, '$1 ').trim());
    };

    // Format expiry as MM/YY
    const handleExpiryChange = (e) => {
        let val = e.target.value.replace(/\D/g, '').substring(0, 4);
        if (val.length >= 2) val = val.substring(0, 2) + '/' + val.substring(2);
        setExpiry(val);
    };

    // Create a new PENDING payment first, then immediately pay it
    const handleImmediatePay = async (e) => {
        e.preventDefault();
        if (!formAmount || parseFloat(formAmount) <= 0) { alert('Enter a valid amount'); return; }
        setSubmitting(true);
        try {
            const userId = user._id || user.id;

            // Step 1: Create payment with Pending status
            const createRes = await axios.post('/api/payments', {
                user: userId,
                amount: parseFloat(formAmount),
                payment_status: 'Pending',
                description: formDesc,
                payment_method: 'Card'
            });

            const pendingPayment = createRes.data;

            // Step 2: Simulate processing delay (1.5s)
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Step 3: Pay it — Pending → Paid
            const paidRes = await axios.put(`/api/payments/${pendingPayment._id}`, {
                payment_status: 'Paid',
                payment_method: 'Card'
            });

            setSuccessRecord(paidRes.data);
            fetchPayments(userId);
            setShowNewForm(false);
            setFormAmount('');
            setCardNumber('');
            setExpiry('');
            setCvv('');

        } catch (err) {
            alert(err.response?.data?.error || 'Payment failed. Try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // Pay an existing PENDING payment
    const handlePayExisting = async (paymentId) => {
        setPayingId(paymentId);
        try {
            const res = await axios.put(`/api/payments/${paymentId}`, {
                payment_status: 'Paid'
            });
            setSuccessRecord(res.data);
            const userId = user._id || user.id;
            fetchPayments(userId);
        } catch (err) {
            alert(err.response?.data?.error || 'Payment failed');
        } finally {
            setPayingId(null);
        }
    };

    const getStatusColor = (s) => s === 'Paid' ? '#10b981' : '#f59e0b';

    const pendingPayments = payments.filter(p => p.payment_status === 'Pending');
    const paidPayments = payments.filter(p => p.payment_status === 'Paid');
    const totalPaid = paidPayments.reduce((acc, p) => acc + (p.amount || 0), 0);

    // ── SUCCESS SCREEN ─────────────────────────────────────────────────────────
    if (successRecord) {
        return (
            <motion.div className="container" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                style={{ padding: '3rem 20px', maxWidth: '650px', margin: '0 auto' }}>
                <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}>
                        <div style={{ background: 'rgba(16,185,129,0.15)', width: '90px', height: '90px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                            <CheckCircle size={50} color="#10b981" />
                        </div>
                    </motion.div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981', marginBottom: '0.5rem' }}>Payment Successful!</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>
                        ₹{successRecord.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })} has been credited successfully to your RTO account.
                    </p>

                    {/* Payment Details — all schema fields */}
                    <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '14px', padding: '1.8rem', textAlign: 'left', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.2rem' }}>
                            <Receipt size={18} color="#10b981" />
                            <span style={{ fontWeight: 700, color: '#10b981', fontSize: '0.95rem' }}>Payment Receipt</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            {[
                                { label: 'payment_id', icon: <Hash size={13} />, value: successRecord._id?.substring(0, 12) + '…', mono: true },
                                { label: 'user_id', icon: <User size={13} />, value: (user?._id || user?.id || '').substring(0, 12) + '…', mono: true },
                                { label: 'amount', icon: <IndianRupee size={13} />, value: `₹${parseFloat(successRecord.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, color: '#10b981' },
                                { label: 'payment_date', icon: <CalendarDays size={13} />, value: new Date(successRecord.payment_date || successRecord.updatedAt).toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) },
                                { label: 'payment_status', icon: <Activity size={13} />, value: successRecord.payment_status, color: '#10b981' },
                                { label: 'txn_ref', icon: <Receipt size={13} />, value: successRecord.transaction_ref || 'N/A', mono: true },
                                { label: 'description', icon: <CreditCard size={13} />, value: successRecord.description || 'RTO Fee', span: true },
                            ].map((f, i) => (
                                <div key={i} style={{ gridColumn: f.span ? '1 / -1' : 'auto', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '12px' }}>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        {f.icon} {f.label}
                                    </p>
                                    <p style={{ fontWeight: 700, fontSize: '0.88rem', fontFamily: f.mono ? 'monospace' : 'inherit', color: f.color || 'var(--text-main)', wordBreak: 'break-all' }}>
                                        {f.value}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => setSuccessRecord(null)}
                            style={{ background: 'var(--primary)', color: 'white', padding: '12px 28px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', border: 'none' }}>
                            Make Another Payment
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/profile')}
                            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid var(--border-color)', color: 'white', padding: '12px 28px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>
                            View in Profile →
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        );
    }

    // ── MAIN PAYMENT PAGE ──────────────────────────────────────────────────────
    return (
        <motion.div className="container" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
            style={{ padding: '3rem 20px', maxWidth: '900px', margin: '0 auto' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                        <CreditCard color="var(--primary)" size={28} />
                        <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Payments</h1>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Manage your RTO fees and challans</p>
                </div>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setShowNewForm(true)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        background: 'var(--primary)', color: 'white', padding: '12px 24px',
                        borderRadius: '12px', fontWeight: 700, cursor: 'pointer', border: 'none',
                        boxShadow: '0 6px 20px rgba(59,130,246,0.35)'
                    }}>
                    <Plus size={18} /> New Payment
                </motion.button>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.2rem', marginBottom: '2.5rem' }}>
                {[
                    { label: 'Total Paid', value: `₹${totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
                    { label: 'Pending Dues', value: `₹${payments.filter(p => p.payment_status === 'Pending').reduce((a, p) => a + p.amount, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
                    { label: 'Total Transactions', value: payments.length, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' }
                ].map((s, i) => (
                    <motion.div key={i} className="glass-panel" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                        style={{ padding: '1.2rem 1.5rem', textAlign: 'center' }}>
                        <p style={{ fontSize: '1.7rem', fontWeight: 800, color: s.color }}>{s.value}</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '4px' }}>{s.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Pending Payments — needs to be paid */}
            {pendingPayments.length > 0 && (
                <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={18} color="#f59e0b" />
                        Pending Dues
                        <span style={{ marginLeft: '6px', background: 'rgba(245,158,11,0.2)', color: '#f59e0b', padding: '2px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>
                            {pendingPayments.length}
                        </span>
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {pendingPayments.map(p => (
                            <motion.div key={p._id} whileHover={{ scale: 1.005 }}
                                style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '1.2rem 1.5rem', borderRadius: '12px',
                                    background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.25)',
                                    flexWrap: 'wrap', gap: '1rem'
                                }}>
                                <div>
                                    <p style={{ fontWeight: 700, fontSize: '1.05rem' }}>{p.description || 'RTO Service Fee'}</p>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '3px' }}>
                                        ID: <span style={{ fontFamily: 'monospace' }}>{p._id.substring(0, 12)}…</span>
                                        {' · '}{new Date(p.createdAt).toLocaleDateString('en-IN')}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f59e0b' }}>
                                        ₹{parseFloat(p.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </span>
                                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                        onClick={() => handlePayExisting(p._id)}
                                        disabled={payingId === p._id}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '6px',
                                            background: payingId === p._id ? 'rgba(16,185,129,0.3)' : '#10b981',
                                            color: 'white', padding: '10px 20px', borderRadius: '8px',
                                            fontWeight: 700, cursor: payingId === p._id ? 'wait' : 'pointer',
                                            border: 'none', fontSize: '0.9rem'
                                        }}>
                                        {payingId === p._id
                                            ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Processing…</>
                                            : <><CheckCircle size={14} /> Pay Now</>}
                                    </motion.button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Payment History Table — all schema fields */}
            <div className="glass-panel" style={{ padding: '2rem', overflowX: 'auto' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Receipt size={18} color="var(--primary)" /> Payment History
                </h2>
                {loading && <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Loading payments…</p>}
                {!loading && payments.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        <CreditCard size={40} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                        <p>No payments yet.</p>
                        <motion.button whileHover={{ scale: 1.05 }} onClick={() => setShowNewForm(true)}
                            style={{ marginTop: '1rem', background: 'var(--primary)', color: 'white', padding: '10px 24px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', border: 'none' }}>
                            Make First Payment
                        </motion.button>
                    </div>
                )}
                {!loading && payments.length > 0 && (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                <th style={{ padding: '0.8rem 1rem', textAlign: 'left' }}>payment_id</th>
                                <th style={{ padding: '0.8rem 1rem', textAlign: 'left' }}>Description</th>
                                <th style={{ padding: '0.8rem 1rem', textAlign: 'left' }}>amount</th>
                                <th style={{ padding: '0.8rem 1rem', textAlign: 'left' }}>payment_date</th>
                                <th style={{ padding: '0.8rem 1rem', textAlign: 'left' }}>payment_status</th>
                                <th style={{ padding: '0.8rem 1rem', textAlign: 'left' }}>Txn Ref</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map(p => (
                                <motion.tr key={p._id} whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                                    style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '1rem', fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                                        {p._id.substring(0, 10)}…
                                    </td>
                                    <td style={{ padding: '1rem', fontWeight: 600 }}>{p.description || 'RTO Fee'}</td>
                                    <td style={{ padding: '1rem', fontWeight: 800, color: getStatusColor(p.payment_status) }}>
                                        ₹{parseFloat(p.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                                        {new Date(p.payment_date || p.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        <span style={{ display: 'block', fontSize: '0.75rem' }}>
                                            {new Date(p.payment_date || p.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                                            padding: '4px 12px', borderRadius: '20px', fontWeight: 700, fontSize: '0.8rem',
                                            background: p.payment_status === 'Paid' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                                            color: getStatusColor(p.payment_status)
                                        }}>
                                            {p.payment_status === 'Paid' ? <CheckCircle size={13} /> : <Clock size={13} />}
                                            {p.payment_status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                        {p.transaction_ref || '—'}
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* New Payment Modal */}
            <AnimatePresence>
                {showNewForm && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
                            backdropFilter: 'blur(6px)', zIndex: 1000,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
                        }}
                        onClick={(e) => { if (e.target === e.currentTarget) setShowNewForm(false); }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
                            className="glass-panel"
                            style={{ padding: '2.5rem', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Lock color="var(--primary)" size={22} />
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>New Payment</h2>
                                </div>
                                <button onClick={() => setShowNewForm(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                    <X size={22} />
                                </button>
                            </div>

                            <form onSubmit={handleImmediatePay} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                {/* Payment Type */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Payment For *</label>
                                    <select value={formDesc} onChange={e => setFormDesc(e.target.value)} required
                                        style={{ ...inputStyle, cursor: 'pointer' }}>
                                        {PAYMENT_TYPES.map(t => <option key={t} value={t} style={{ background: '#1e293b' }}>{t}</option>)}
                                    </select>
                                </div>

                                {/* Amount */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Amount (₹) *</label>
                                    <div style={{ position: 'relative' }}>
                                        <span style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-muted)', fontWeight: 700 }}>₹</span>
                                        <input type="number" min="1" step="0.01" placeholder="0.00" value={formAmount}
                                            onChange={e => setFormAmount(e.target.value)} required
                                            style={{ ...inputStyle, paddingLeft: '30px' }} />
                                    </div>
                                </div>

                                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.2rem' }}>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Lock size={12} /> Secure Card Details (Mock)
                                    </p>

                                    {/* Card Holder */}
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>Card Holder Name *</label>
                                        <input type="text" placeholder="Name on card" value={cardHolder}
                                            onChange={e => setCardHolder(e.target.value)} required style={inputStyle} />
                                    </div>

                                    {/* Card Number */}
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>Card Number *</label>
                                        <div style={{ position: 'relative' }}>
                                            <CreditCard size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                                            <input type="text" placeholder="XXXX XXXX XXXX XXXX"
                                                value={cardNumber} onChange={handleCardNumberChange} required maxLength="19"
                                                style={{ ...inputStyle, paddingLeft: '40px', letterSpacing: '2px' }} />
                                        </div>
                                    </div>

                                    {/* Expiry + CVV */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>Expiry *</label>
                                            <input type="text" placeholder="MM/YY" value={expiry}
                                                onChange={handleExpiryChange} required maxLength="5" style={inputStyle} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>CVV *</label>
                                            <input type="password" placeholder="•••" value={cvv}
                                                onChange={e => setCvv(e.target.value.replace(/\D/g, '').substring(0, 3))} required maxLength="3" style={inputStyle} />
                                        </div>
                                    </div>
                                </div>

                                {/* Summary */}
                                {formAmount && (
                                    <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '10px', padding: '14px 18px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: 'var(--text-muted)' }}>{formDesc}</span>
                                            <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.15rem' }}>
                                                ₹{parseFloat(formAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <motion.button whileHover={{ scale: 1.02, boxShadow: '0 12px 30px rgba(59,130,246,0.4)' }}
                                    whileTap={{ scale: 0.98 }} type="submit" disabled={submitting}
                                    style={{
                                        background: submitting ? 'rgba(59,130,246,0.5)' : 'var(--primary)',
                                        color: 'white', padding: '15px', borderRadius: '12px',
                                        fontWeight: 800, fontSize: '1.05rem', border: 'none',
                                        cursor: submitting ? 'wait' : 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                                    }}>
                                    {submitting
                                        ? <><Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> Processing Payment…</>
                                        : <><Lock size={18} /> Pay ₹{parseFloat(formAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</>}
                                </motion.button>

                                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                                    🔒 This is a mock payment system. No real money is charged.
                                </p>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </motion.div>
    );
};

export default SecurePayment;
