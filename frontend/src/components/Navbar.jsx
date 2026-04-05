import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, UserCircle, LogIn, LogOut, Menu, X } from 'lucide-react';

const Navbar = () => {
    const [user, setUser] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkUser = () => {
            const stored = localStorage.getItem('user');
            setUser(stored ? JSON.parse(stored) : null);
        };
        checkUser();
        window.addEventListener('authChange', checkUser);
        return () => window.removeEventListener('authChange', checkUser);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.dispatchEvent(new Event('authChange'));
        setMenuOpen(false);
        navigate('/');
    };

    const navLinks = user ? [
        { to: '/dashboard', label: 'Dashboard' },
        { to: '/services', label: 'Services' },
        { to: '/register-vehicle', label: 'Register Vehicle' },
        { to: '/apply-license', label: 'Apply License' },
        { to: '/mock-test', label: 'Mock Test' },
        { to: '/payment', label: 'Payment' },
        { to: '/profile', label: 'My Profile' },
        { to: '/rto-dashboard', label: 'RTO Portal' },
    ] : [
        { to: '/services', label: 'Services' },
    ];

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            style={{
                position: 'sticky', top: 0, zIndex: 1000,
                padding: '1rem 2rem',
                background: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}
        >
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Car color="#3b82f6" size={28} />
                <span style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '0.5px' }}>
                    RTO <span className="gradient-text">Portal</span>
                </span>
            </Link>

            {/* Desktop Nav */}
            <div style={{ display: 'flex', gap: '18px', alignItems: 'center', flexWrap: 'wrap' }}>
                {navLinks.map(link => (
                    <motion.div key={link.to} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Link to={link.to} style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                            {link.label}
                        </Link>
                    </motion.div>
                ))}

                {user ? (
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginLeft: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', fontWeight: 600, fontSize: '0.9rem' }}>
                            <UserCircle size={22} color="var(--primary)" />
                            {user.name?.split(' ')[0]}
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleLogout}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '5px',
                                background: 'transparent', color: '#ef4444',
                                border: '1px solid rgba(239, 68, 68, 0.4)',
                                padding: '6px 14px', borderRadius: '20px', fontWeight: 600,
                                fontSize: '0.85rem', cursor: 'pointer'
                            }}
                        >
                            <LogOut size={15} /> Logout
                        </motion.button>
                    </div>
                ) : (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Link to="/login" style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            background: 'var(--primary)', color: 'white',
                            padding: '8px 18px', borderRadius: '20px', fontWeight: 600, fontSize: '0.9rem'
                        }}>
                            <LogIn size={16} /> Login
                        </Link>
                    </motion.div>
                )}
            </div>
        </motion.nav>
    );
};

export default Navbar;
