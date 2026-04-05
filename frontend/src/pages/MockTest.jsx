import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BookOpen, CheckCircle, XCircle, Clock, Trophy, RotateCcw, Hash, User, Star, CalendarDays, Activity } from 'lucide-react';

const questions = [
    { q: "What does a red traffic light mean?", options: ["Go", "Slow down", "Stop", "Horn"], answer: 2 },
    { q: "What is the general speed limit in residential areas?", options: ["80 kmph", "60 kmph", "40 kmph", "30 kmph"], answer: 2 },
    { q: "When should you use fog lights?", options: ["Always at night", "Only in fog/heavy rain", "On highways only", "Never"], answer: 1 },
    { q: "What does a yellow traffic light indicate?", options: ["Speed up to cross", "Stop if safe to do so", "Pedestrians crossing", "Emergency vehicle"], answer: 1 },
    { q: "Which lane should you use for overtaking?", options: ["Left lane", "Right lane", "Any lane", "Middle lane"], answer: 1 },
    { q: "What is the blood alcohol limit for driving in India?", options: ["0%", "30mg/100ml", "80mg/100ml", "No limit"], answer: 1 },
    { q: "When approaching a school zone, you should:", options: ["Maintain speed", "Increase speed", "Reduce speed and be alert", "Honk continuously"], answer: 2 },
    { q: "What does a white broken centre line on a road mean?", options: ["No overtaking allowed", "Overtaking permitted if safe", "Emergency lane", "Bicycle lane"], answer: 1 },
    { q: "A flashing red traffic signal means:", options: ["Stop, then proceed when safe", "Reduce speed", "Merge traffic", "Construction ahead"], answer: 0 },
    { q: "What should you do if your vehicle breaks down on a highway?", options: ["Stay in the vehicle", "Move to the shoulder and use hazard lights", "Walk along the highway", "Stop in the middle"], answer: 1 },
];

const MockTest = () => {
    const [started, setStarted] = useState(false);
    const [currentQ, setCurrentQ] = useState(0);
    const [selected, setSelected] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [savedRecord, setSavedRecord] = useState(null); // holds the saved DB record
    const [testHistory, setTestHistory] = useState([]);
    const [timeLeft, setTimeLeft] = useState(30);
    const [activeView, setActiveView] = useState('start'); // 'start' | 'test' | 'result'
    const navigate = useNavigate();

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) { navigate('/login'); return; }
        fetchHistory();
    }, [navigate]);

    useEffect(() => {
        if (activeView !== 'test') return;
        if (timeLeft === 0) { handleNext(true); return; }
        const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
        return () => clearInterval(timer);
    }, [activeView, timeLeft]);

    const fetchHistory = async () => {
        const userStr = localStorage.getItem('user');
        if (!userStr) return;
        const user = JSON.parse(userStr);
        const userId = user._id || user.id;
        try {
            const res = await axios.get(`/api/mocktests?user=${userId}`);
            setTestHistory(res.data);
        } catch (e) { console.error(e); }
    };

    const startTest = () => {
        setActiveView('test');
        setCurrentQ(0);
        setSelected(null);
        setAnswers([]);
        setSubmitted(false);
        setScore(0);
        setSavedRecord(null);
        setTimeLeft(30);
    };

    const handleSelect = (idx) => {
        if (selected !== null) return;
        setSelected(idx);
    };

    const handleNext = (timedOut = false) => {
        const ans = timedOut ? -1 : selected;
        const newAnswers = [...answers, { q: currentQ, selected: ans, correct: questions[currentQ].answer }];
        setAnswers(newAnswers);

        if (currentQ + 1 < questions.length) {
            setCurrentQ(currentQ + 1);
            setSelected(null);
            setTimeLeft(30);
        } else {
            const finalScore = newAnswers.filter(a => a.selected === a.correct).length;
            setScore(finalScore);
            submitTest(finalScore, newAnswers);
        }
    };

    const submitTest = async (finalScore, finalAnswers) => {
        try {
            const userStr = localStorage.getItem('user');
            const user = JSON.parse(userStr);
            const testDate = new Date();
            const res = await axios.post('/api/mocktests', {
                user: user._id || user.id,
                score: finalScore,
                test_date: testDate,
                status: 'Completed'
            });
            setSavedRecord(res.data);
            fetchHistory();
        } catch (e) {
            console.error(e);
            // Still show result even if save fails
            setSavedRecord({ score: finalScore, test_date: new Date(), status: 'Completed', _id: 'local' });
        } finally {
            setActiveView('result');
        }
    };

    const getScoreColor = (s, total = questions.length) => {
        const pct = (s / total) * 100;
        if (pct >= 80) return '#10b981';
        if (pct >= 60) return '#f59e0b';
        return '#ef4444';
    };

    const getStatusBadge = (status, s) => {
        const passed = s >= 7;
        return (
            <span style={{
                padding: '3px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700,
                background: status === 'Completed' ? (passed ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)') : 'rgba(245,158,11,0.2)',
                color: status === 'Completed' ? (passed ? '#10b981' : '#ef4444') : '#f59e0b'
            }}>
                {status === 'Completed' ? (passed ? '✓ PASSED' : '✗ FAILED') : '⏳ Pending'}
            </span>
        );
    };

    // ── RESULT SCREEN ──────────────────────────────────────────────────────────
    if (activeView === 'result') {
        const passed = score >= 7;
        return (
            <motion.div className="container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ padding: '3rem 20px', maxWidth: '750px', margin: '0 auto' }}>

                {/* Score Card */}
                <div className="glass-panel" style={{ padding: '2.5rem 2rem', textAlign: 'center', marginBottom: '2rem' }}>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}>
                        {passed
                            ? <Trophy size={64} color="#f59e0b" style={{ margin: '0 auto 1rem' }} />
                            : <XCircle size={64} color="#ef4444" style={{ margin: '0 auto 1rem' }} />}
                    </motion.div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                        {passed ? '🎉 Test Passed!' : '😢 Test Failed'}
                    </h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                        {passed ? 'Congratulations! You are eligible to apply for a license.' : "Don't worry, you can try again!"}
                    </p>
                    <div style={{ fontSize: '4.5rem', fontWeight: 800, color: getScoreColor(score), lineHeight: 1 }}>
                        {score}<span style={{ fontSize: '2rem', color: 'var(--text-muted)' }}>/{questions.length}</span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: '2rem', fontSize: '1.1rem' }}>
                        {Math.round((score / questions.length) * 100)}% correct
                    </p>
                </div>

                {/* Schema Data Card — all fields from DB */}
                {savedRecord && (
                    <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.2rem', color: 'var(--primary)' }}>
                            📄 Saved Record (Mock Test Schema)
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
                            {[
                                { icon: <Hash size={14} />, label: 'mocktest_id', value: savedRecord._id?.substring(0, 10) + '…', mono: true },
                                { icon: <User size={14} />, label: 'user_id', value: (() => { const u = JSON.parse(localStorage.getItem('user') || '{}'); return (u._id || u.id || '').substring(0, 10) + '…'; })(), mono: true },
                                { icon: <Star size={14} />, label: 'score', value: `${score} / ${questions.length}`, color: getScoreColor(score) },
                                { icon: <CalendarDays size={14} />, label: 'test_date', value: new Date(savedRecord.test_date || new Date()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) },
                                { icon: <Activity size={14} />, label: 'status', value: savedRecord.status || 'Completed', color: '#10b981' },
                            ].map((field, i) => (
                                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '14px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        {field.icon} {field.label}
                                    </div>
                                    <p style={{ fontWeight: 700, fontSize: '0.95rem', fontFamily: field.mono ? 'monospace' : 'inherit', color: field.color || 'var(--text-main)', wordBreak: 'break-all' }}>
                                        {field.value}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Q&A Breakdown */}
                <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.2rem' }}>Answer Breakdown</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        {answers.map((a, i) => (
                            <div key={i} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '10px 14px', borderRadius: '8px',
                                background: a.selected === a.correct ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                                border: `1px solid ${a.selected === a.correct ? '#10b981' : '#ef4444'}25`
                            }}>
                                <span style={{ fontSize: '0.88rem' }}>
                                    <strong>Q{i + 1}:</strong> {questions[i].q.substring(0, 48)}…
                                </span>
                                {a.selected === -1
                                    ? <span style={{ fontSize: '0.78rem', color: '#f59e0b', fontWeight: 700 }}>⏱ Timed Out</span>
                                    : a.selected === a.correct
                                        ? <CheckCircle size={17} color="#10b981" />
                                        : <XCircle size={17} color="#ef4444" />}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={startTest}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--primary)', color: 'white', padding: '12px 28px', borderRadius: '10px', fontWeight: 700 }}>
                        <RotateCcw size={17} /> Try Again
                    </motion.button>
                    {passed && (
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/apply-license')}
                            style={{ background: '#10b981', color: 'white', padding: '12px 28px', borderRadius: '10px', fontWeight: 700 }}>
                            Apply for License →
                        </motion.button>
                    )}
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setActiveView('start')}
                        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid var(--border-color)', color: 'white', padding: '12px 28px', borderRadius: '10px', fontWeight: 700 }}>
                        View History
                    </motion.button>
                </div>
            </motion.div>
        );
    }

    // ── TEST SCREEN ────────────────────────────────────────────────────────────
    if (activeView === 'test') {
        const q = questions[currentQ];
        return (
            <motion.div className="container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ padding: '4rem 20px', maxWidth: '700px', margin: '0 auto' }}>
                <div className="glass-panel" style={{ padding: '2.5rem 2rem' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                        <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Question {currentQ + 1} of {questions.length}</span>
                        <motion.div
                            animate={{ color: timeLeft <= 10 ? '#ef4444' : '#3b82f6' }}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '1rem' }}
                        >
                            <Clock size={18} />
                            <motion.span key={timeLeft} initial={{ scale: 1.3 }} animate={{ scale: 1 }}>{timeLeft}s</motion.span>
                        </motion.div>
                    </div>

                    {/* Progress bar */}
                    <div style={{ height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '5px', marginBottom: '2rem', overflow: 'hidden' }}>
                        <motion.div
                            animate={{ width: `${((currentQ) / questions.length) * 100}%` }}
                            style={{ height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--secondary))', borderRadius: '5px' }}
                        />
                    </div>

                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '2rem', lineHeight: 1.5 }}>{q.q}</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                        {q.options.map((opt, idx) => {
                            let bg = 'rgba(255,255,255,0.04)';
                            let border = '1px solid var(--border-color)';
                            if (selected !== null) {
                                if (idx === q.answer) { bg = 'rgba(16,185,129,0.18)'; border = '1px solid #10b981'; }
                                else if (idx === selected && idx !== q.answer) { bg = 'rgba(239,68,68,0.18)'; border = '1px solid #ef4444'; }
                            } else if (selected === idx) {
                                bg = 'rgba(59,130,246,0.18)'; border = '1px solid var(--primary)';
                            }
                            return (
                                <motion.button key={idx}
                                    whileHover={selected === null ? { scale: 1.015, backgroundColor: 'rgba(59,130,246,0.1)' } : {}}
                                    whileTap={selected === null ? { scale: 0.985 } : {}}
                                    onClick={() => handleSelect(idx)}
                                    style={{
                                        padding: '14px 18px', borderRadius: '10px', background: bg, border,
                                        color: 'white', textAlign: 'left', fontWeight: 500,
                                        cursor: selected !== null ? 'default' : 'pointer', fontSize: '0.98rem',
                                        transition: 'background 0.2s, border 0.2s'
                                    }}
                                >
                                    <span style={{ marginRight: '12px', opacity: 0.5, fontWeight: 700 }}>{String.fromCharCode(65 + idx)}.</span>{opt}
                                </motion.button>
                            );
                        })}
                    </div>

                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => handleNext()}
                        disabled={selected === null}
                        style={{
                            marginTop: '2rem', width: '100%', padding: '14px',
                            background: selected === null ? 'rgba(255,255,255,0.08)' : 'var(--primary)',
                            color: selected === null ? 'var(--text-muted)' : 'white',
                            borderRadius: '10px', fontWeight: 700, fontSize: '1rem',
                            cursor: selected === null ? 'not-allowed' : 'pointer', border: 'none', transition: 'all 0.2s'
                        }}
                    >
                        {currentQ + 1 === questions.length ? 'Submit Test ✓' : 'Next Question →'}
                    </motion.button>
                </div>
            </motion.div>
        );
    }

    // ── START / HISTORY SCREEN ─────────────────────────────────────────────────
    return (
        <motion.div className="container" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            style={{ padding: '3rem 20px', maxWidth: '900px', margin: '0 auto' }}>

            {/* Hero */}
            <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ background: 'rgba(245,158,11,0.1)', padding: '18px', borderRadius: '18px', width: 'fit-content', margin: '0 auto 1.5rem' }}>
                    <BookOpen size={52} color="#f59e0b" />
                </div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>
                    Driving <span className="gradient-text">Mock Test</span>
                </h1>
                <p style={{ color: 'var(--text-muted)', maxWidth: '520px', margin: '0 auto 2rem', lineHeight: 1.7 }}>
                    Test your knowledge of Indian traffic rules. <strong style={{ color: 'white' }}>{questions.length} questions</strong> · <strong style={{ color: 'white' }}>30 seconds</strong> per question · Score <strong style={{ color: '#10b981' }}>7+</strong> to pass.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
                    {[
                        { label: 'Questions', value: questions.length, color: '#3b82f6' },
                        { label: 'Time / Q', value: '30s', color: '#f59e0b' },
                        { label: 'Pass Mark', value: '70%', color: '#10b981' }
                    ].map((s, i) => (
                        <div key={i} style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '2.2rem', fontWeight: 800, color: s.color }}>{s.value}</p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{s.label}</p>
                        </div>
                    ))}
                </div>
                <motion.button
                    whileHover={{ scale: 1.05, boxShadow: '0 15px 40px rgba(59,130,246,0.45)' }}
                    whileTap={{ scale: 0.95 }} onClick={startTest}
                    style={{
                        background: 'var(--primary)', color: 'white', padding: '16px 52px',
                        borderRadius: '30px', fontWeight: 800, fontSize: '1.1rem',
                        boxShadow: '0 8px 25px rgba(59,130,246,0.4)', border: 'none', cursor: 'pointer'
                    }}
                >
                    Start Mock Test
                </motion.button>
            </div>

            {/* History Table — all schema fields */}
            {testHistory.length > 0 && (
                <div className="glass-panel" style={{ padding: '2rem', overflowX: 'auto' }}>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                        Test History
                        <span style={{ marginLeft: '10px', fontSize: '0.85rem', background: 'rgba(59,130,246,0.15)', color: 'var(--primary)', padding: '3px 10px', borderRadius: '20px' }}>
                            {testHistory.length} attempt{testHistory.length !== 1 ? 's' : ''}
                        </span>
                    </h2>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                <th style={{ padding: '0.8rem 1rem' }}>mocktest_id</th>
                                <th style={{ padding: '0.8rem 1rem' }}>Score</th>
                                <th style={{ padding: '0.8rem 1rem' }}>test_date</th>
                                <th style={{ padding: '0.8rem 1rem' }}>Status</th>
                                <th style={{ padding: '0.8rem 1rem' }}>Result</th>
                            </tr>
                        </thead>
                        <tbody>
                            {testHistory.map((t, i) => (
                                <motion.tr key={t._id || i}
                                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                                    style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        {(t._id || '').substring(0, 10)}…
                                    </td>
                                    <td style={{ padding: '1rem', fontWeight: 700, color: getScoreColor(t.score) }}>
                                        {t.score} / {questions.length}
                                        <span style={{ marginLeft: '6px', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                                            ({Math.round((t.score / questions.length) * 100)}%)
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                                        {new Date(t.test_date || t.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        <span style={{ display: 'block', fontSize: '0.78rem' }}>
                                            {new Date(t.test_date || t.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '3px 12px', borderRadius: '20px', fontWeight: 700, fontSize: '0.8rem',
                                            background: t.status === 'Completed' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                                            color: t.status === 'Completed' ? '#10b981' : '#f59e0b'
                                        }}>
                                            {t.status || 'Completed'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        {getStatusBadge(t.status || 'Completed', t.score)}
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </motion.div>
    );
};

export default MockTest;
