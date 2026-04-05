import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const VehicleRegistration = () => {
    const [formData, setFormData] = useState({ rc_number: '', insurance_no: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
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
                user_id: user.id || user._id,
                registration_date: new Date()
            };
            await axios.post('/api/vehicles', payload);
            alert('Vehicle Registration Submitted Successfully!');
            navigate('/dashboard');
        } catch (error) {
            alert(error.response?.data?.error || 'Registration failed');
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
                <h2 style={{ fontSize: '2rem', marginBottom: '2rem', fontWeight: 700 }}>
                    Vehicle Registration
                </h2>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>RC Number</label>
                        <input
                            type="text"
                            placeholder="e.g. KA-01-AB-1234"
                            value={formData.rc_number}
                            onChange={e => setFormData({ ...formData, rc_number: e.target.value })}
                            required
                            style={{
                                width: '100%', padding: '12px 16px', borderRadius: '8px',
                                border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)',
                                color: 'white', outline: 'none'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Insurance Policy Number</label>
                        <input
                            type="text"
                            placeholder="Enter insurance number"
                            value={formData.insurance_no}
                            onChange={e => setFormData({ ...formData, insurance_no: e.target.value })}
                            required
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
                        style={{
                            background: 'var(--primary)', color: 'white', padding: '14px',
                            borderRadius: '8px', fontWeight: 600, fontSize: '1rem', marginTop: '1rem',
                            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)'
                        }}
                    >
                        Submit Application
                    </motion.button>
                </form>
            </div>
        </motion.div>
    );
};

export default VehicleRegistration;
