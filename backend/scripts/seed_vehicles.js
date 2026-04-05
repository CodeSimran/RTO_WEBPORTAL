const mongoose = require('mongoose');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const dotenv = require('dotenv');

dotenv.config();

const seedData = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rto-management';
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        const users = await User.find();
        if (users.length === 0) {
            console.log('No users found. Please register a user first.');
            process.exit(0);
        }

        const vehicles = [
            {
                user_id: users[0]._id,
                registration_date: new Date('2023-01-15'),
                rc_number: 'KA-01-MJ-1111',
                insurance_no: 'INS-001-XYZ',
                status: 'Approved'
            },
            {
                user_id: users[0]._id,
                registration_date: new Date('2023-05-20'),
                rc_number: 'KA-02-AB-2222',
                insurance_no: 'INS-002-ABC',
                status: 'Pending'
            }
        ];

        // Add a vehicle for Alice if she exists
        const alice = users.find(u => u.username === 'alice_final');
        if (alice) {
            vehicles.push({
                user_id: alice._id,
                registration_date: new Date(),
                rc_number: 'KA-01-AB-9999',
                insurance_no: 'INS-ALICE-101',
                status: 'Approved'
            });
        }

        await Vehicle.deleteMany({}); // Clear existing vehicles for clean seed
        await Vehicle.insertMany(vehicles);

        console.log('✅ Seeded 3 vehicle records successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err.message);
        process.exit(1);
    }
};

seedData();
