import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, FileText, CreditCard, AlertTriangle } from 'lucide-react';

const Home = () => {
    const navigate = useNavigate();
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { y: 50, opacity: 0 },
        visible: {
            y: 0, opacity: 1,
            transition: { type: 'spring', stiffness: 100 }
        }
    };

    return (
        <motion.div
            className="container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            style={{ padding: '4rem 20px', textAlign: 'center' }}
        >
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
                style={{ marginBottom: '4rem' }}
            >
                <h1 style={{ fontSize: '4rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-1.5px' }}>
                    Next-Gen <span className="gradient-text">RTO Services</span>
                </h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
                    Experience a seamless, fast, and highly secure platform for all your vehicle registration and licensing needs.
                </p>

                <motion.div style={{ marginTop: '2rem' }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/login" style={{
                        background: 'var(--primary)',
                        color: 'white',
                        padding: '14px 32px',
                        borderRadius: '30px',
                        fontWeight: 600,
                        fontSize: '1.1rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 10px 25px rgba(59, 130, 246, 0.4)'
                    }}>
                        Get Started Now
                    </Link>
                </motion.div>
            </motion.div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '2rem',
                    marginTop: '4rem'
                }}
            >
                {[
                    { icon: <ShieldCheck size={40} color="var(--primary)" />, title: 'Vehicle Registration', desc: 'Register your vehicle online with seamless document verification.', link: '/register-vehicle' },
                    { icon: <FileText size={40} color="var(--secondary)" />, title: 'License Services', desc: 'Apply, renew, or update your driving license from anywhere.', link: '/apply-license' },
                    { icon: <CreditCard size={40} color="var(--accent)" />, title: 'Secure Payments', desc: 'Pay all RTO challenged online securely in just a few clicks.', link: '/payment' },
                    { icon: <AlertTriangle size={40} color="#ef4444" />, title: 'Report Issue', desc: 'Report any bugs, errors, or road-related grievances instantly.', link: '/report-issue' }
                ].map((feature, idx) => (
                    <motion.div
                        key={idx}
                        className="glass-panel"
                        variants={itemVariants}
                        whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(0,0,0,0.6)', borderColor: 'rgba(255,255,255,0.2)' }}
                        onClick={() => navigate(feature.link)}
                        style={{ padding: '2.5rem 2rem', textAlign: 'left', transition: 'all 0.3s ease', cursor: 'pointer' }}
                    >
                        <div style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.05)', display: 'inline-block', padding: '15px', borderRadius: '15px' }}>
                            {feature.icon}
                        </div>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 600 }}>{feature.title}</h3>
                        <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{feature.desc}</p>
                    </motion.div>
                ))}
            </motion.div>
        </motion.div>
    );
};

export default Home;
