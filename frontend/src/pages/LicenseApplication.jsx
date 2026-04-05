import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LicenseApplication = () => {
    const [formData, setFormData] = useState({
        slot: '',
        license_no: '',
        expiry_date: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                alert('Please login first');
                navigate('/login');
                return;
            }
            const user = JSON.parse(userStr);
            const payload = {
                ...formData,
                user_id: user.id || user._id
            };
            await axios.post('/api/licenses', payload);
            alert('License Application Submitted Successfully!');
            navigate('/profile');
        } catch (error) {
            alert(error.response?.data?.error || 'License Application failed');
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
            style={{ padding: '4rem 20px', maxWidth: '600px', margin: '0 auto' }}
        >
            <div className="glass-panel" style={{ padding: '2.5rem 2rem' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '1rem', fontWeight: 700 }}>
                    Apply for License
                </h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                    Select an available slot for your driving test or license renewal verification.
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Booking Slot Date & Time</label>
                        <input
                            type="datetime-local"
                            value={formData.slot}
                            onChange={e => setFormData({ ...formData, slot: e.target.value })}
                            required
                            style={{
                                width: '100%', padding: '12px 16px', borderRadius: '8px',
                                border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)',
                                color: 'white', outline: 'none'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>License Number (Optional for New)</label>
                        <input
                            type="text"
                            placeholder="e.g. DL-123456789"
                            value={formData.license_no}
                            onChange={e => setFormData({ ...formData, license_no: e.target.value })}
                            style={{
                                width: '100%', padding: '12px 16px', borderRadius: '8px',
                                border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)',
                                color: 'white', outline: 'none'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Expiry Date (Optional for New)</label>
                        <input
                            type="date"
                            value={formData.expiry_date}
                            onChange={e => setFormData({ ...formData, expiry_date: e.target.value })}
                            style={{
                                width: '100%', padding: '12px 16px', borderRadius: '8px',
                                border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)',
                                color: 'white', outline: 'none'
                            }}
                        />
                    </div>

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
                        {loading ? 'Submitting...' : 'Submit Application'}
                    </motion.button>
                </form>
            </div>
        </motion.div>
    );
};

export default LicenseApplication;
