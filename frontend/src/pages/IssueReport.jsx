import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Send, Upload, X, Image, Calendar, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const IssueReport = () => {
    const [desc, setDesc] = useState('');
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
    const [status] = useState('Open');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            return;
        }
        setPhotoFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setPhotoPreview(reader.result);
        reader.readAsDataURL(file);
    };

    const removePhoto = () => {
        setPhotoFile(null);
        setPhotoPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            const syntheticEvent = { target: { files: [file] } };
            handlePhotoChange(syntheticEvent);
        }
    };

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
            const userId = user._id || user.id;

            // Use FormData to support file upload
            const formData = new FormData();
            formData.append('user', userId);
            formData.append('description', desc);
            formData.append('report_date', reportDate);
            formData.append('status', status);
            if (photoFile) {
                formData.append('photo_file', photoFile);
            }

            await axios.post('/api/issues', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setSubmitted(true);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to report issue');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <motion.div
                className="container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ padding: '4rem 20px', maxWidth: '600px', margin: '0 auto' }}
            >
                <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}>
                        <CheckCircle size={72} color="#10b981" style={{ margin: '0 auto 1.5rem' }} />
                    </motion.div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem' }}>Issue Reported!</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.7 }}>
                        Your issue has been successfully submitted. Our RTO team will review it and update the status to <strong style={{ color: '#10b981' }}>Resolved</strong> once addressed.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/profile')}
                            style={{ background: 'var(--primary)', color: 'white', padding: '12px 28px', borderRadius: '10px', fontWeight: 700 }}
                        >
                            View in Profile
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => { setSubmitted(false); setDesc(''); removePhoto(); }}
                            style={{ background: 'rgba(255,255,255,0.1)', color: 'white', padding: '12px 28px', borderRadius: '10px', fontWeight: 700, border: '1px solid var(--border-color)' }}
                        >
                            Report Another
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            className="container"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            style={{ padding: '4rem 20px', maxWidth: '700px', margin: '0 auto' }}
        >
            <div className="glass-panel" style={{ padding: '3rem 2rem' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem' }}>
                    <div style={{ background: 'rgba(239, 68, 68, 0.12)', padding: '14px', borderRadius: '14px' }}>
                        <AlertCircle color="#ef4444" size={34} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Report an Issue</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                            Encountered a problem? We're here to help.
                        </p>
                    </div>
                </div>

                {/* Schema Info Banner */}
                <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '10px', padding: '12px 16px', marginBottom: '2rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    📋 Fields: <strong style={{ color: 'white' }}>issue_id</strong> (auto) · <strong style={{ color: 'white' }}>user_id</strong> (auto) · <strong style={{ color: 'white' }}>report_date</strong> · <strong style={{ color: 'white' }}>report_status</strong> · <strong style={{ color: 'white' }}>issue_description</strong> · <strong style={{ color: 'white' }}>photo_file</strong>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Report Date */}
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.9rem' }}>
                            <Calendar size={16} /> Report Date
                        </label>
                        <input
                            type="date"
                            value={reportDate}
                            onChange={e => setReportDate(e.target.value)}
                            required
                            style={{
                                width: '100%', padding: '12px 16px', borderRadius: '10px',
                                border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.25)',
                                color: 'white', outline: 'none', fontSize: '0.95rem'
                            }}
                        />
                    </div>

                    {/* Report Status (read-only) */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.9rem' }}>
                            Report Status
                        </label>
                        <div style={{
                            padding: '12px 16px', borderRadius: '10px',
                            border: '1px solid rgba(245,158,11,0.4)', background: 'rgba(245,158,11,0.08)',
                            display: 'flex', alignItems: 'center', gap: '10px'
                        }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }}></span>
                            <span style={{ color: '#f59e0b', fontWeight: 700 }}>Open</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>(Will be updated to Resolved once addressed)</span>
                        </div>
                    </div>

                    {/* Issue Description */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.9rem' }}>
                            Issue Description *
                        </label>
                        <textarea
                            value={desc}
                            onChange={e => setDesc(e.target.value)}
                            required
                            placeholder="Please describe the issue in detail — what happened, where, and when..."
                            rows={5}
                            style={{
                                width: '100%', padding: '14px 16px', borderRadius: '10px',
                                border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.25)',
                                color: 'white', outline: 'none', resize: 'vertical', fontSize: '0.95rem',
                                lineHeight: 1.6, fontFamily: 'Inter, sans-serif'
                            }}
                        />
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px' }}>{desc.length} characters</p>
                    </div>

                    {/* Photo File Upload */}
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.9rem' }}>
                            <Image size={16} /> Photo Evidence (Optional)
                        </label>

                        <AnimatePresence mode="wait">
                            {!photoPreview ? (
                                <motion.div
                                    key="upload-zone"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onDrop={handleDrop}
                                    onDragOver={e => e.preventDefault()}
                                    onClick={() => fileInputRef.current?.click()}
                                    style={{
                                        border: '2px dashed var(--border-color)', borderRadius: '12px',
                                        padding: '2.5rem', textAlign: 'center', cursor: 'pointer',
                                        background: 'rgba(0,0,0,0.15)', transition: 'all 0.2s'
                                    }}
                                    whileHover={{ borderColor: 'rgba(59,130,246,0.6)', background: 'rgba(59,130,246,0.04)' }}
                                >
                                    <Upload size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
                                    <p style={{ fontWeight: 600, marginBottom: '4px' }}>Click or drag & drop to upload</p>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>JPEG, PNG, GIF, WebP · Max 5MB</p>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="preview"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)' }}
                                >
                                    <img
                                        src={photoPreview}
                                        alt="Issue preview"
                                        style={{ width: '100%', maxHeight: '280px', objectFit: 'cover', display: 'block' }}
                                    />
                                    <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            type="button"
                                            onClick={removePhoto}
                                            style={{
                                                background: 'rgba(239,68,68,0.9)', border: 'none', color: 'white',
                                                width: '32px', height: '32px', borderRadius: '50%',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                                            }}
                                        >
                                            <X size={16} />
                                        </motion.button>
                                    </div>
                                    <div style={{ padding: '10px 14px', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>📎 {photoFile?.name}</span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{(photoFile?.size / (1024 * 1024)).toFixed(2)} MB</span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                            onChange={handlePhotoChange}
                            style={{ display: 'none' }}
                        />
                    </div>

                    {/* Submit Button */}
                    <motion.button
                        whileHover={{ scale: 1.02, boxShadow: '0 15px 35px rgba(59,130,246,0.4)' }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading || !desc.trim()}
                        style={{
                            background: loading || !desc.trim() ? 'rgba(255,255,255,0.1)' : 'var(--primary)',
                            color: loading || !desc.trim() ? 'var(--text-muted)' : 'white',
                            padding: '16px', borderRadius: '12px', fontWeight: 700, fontSize: '1.05rem',
                            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px',
                            cursor: loading || !desc.trim() ? 'not-allowed' : 'pointer',
                            border: 'none', transition: 'all 0.2s'
                        }}
                    >
                        {loading ? (
                            <>Submitting Report...</>
                        ) : (
                            <> <Send size={20} /> Submit Issue Report</>
                        )}
                    </motion.button>
                </form>
            </div>
        </motion.div>
    );
};

export default IssueReport;
