const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Serve uploaded files (issue photos, etc.)
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

app.get('/', (req, res) => {
    res.send('RTO Management System API is running...');
});

// Import Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/vehicles', require('./routes/vehicleRoutes'));
app.use('/api/licenses', require('./routes/licenseRoutes'));
app.use('/api/mocktests', require('./routes/mockTestRoutes'));
app.use('/api/issues', require('./routes/issueRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/officials', require('./routes/officialRoutes'));

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    let mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rto-management';
    
    try {
        await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
        console.log('✅ MongoDB connected successfully');
    } catch (err) {
        console.warn('\n⚠️ Local MongoDB connection failed. Starting in-memory database fallback...');
        try {
            const { MongoMemoryServer } = require('mongodb-memory-server');
            const mongod = await MongoMemoryServer.create();
            mongoUri = mongod.getUri();
            await mongoose.connect(mongoUri);
            console.log('✅ In-memory MongoDB started successfully. Data will be temporary.');
        } catch (memErr) {
            console.error('❌ Failed to start in-memory MongoDB:', memErr.message);
        }
    }

    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
};

startServer();
