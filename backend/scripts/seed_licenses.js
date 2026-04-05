const mongoose = require('mongoose');
const User = require('../models/User');
const License = require('../models/License');
const dotenv = require('dotenv');

dotenv.config();

const seedLicenses = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rto-management';
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        const users = await User.find();
        if (users.length === 0) {
            console.log('No users found. Please register a user first.');
            process.exit(0);
        }

        const licenses = [
            {
                user_id: users[0]._id,
                license_no: 'DL-2024-0012345',
                expiry_date: new Date('2034-01-01'),
                slot: '2026-04-15T10:00:00',
                status: 'Approved'
            },
            {
                user_id: users[0]._id,
                license_no: 'LL-2024-0056789',
                expiry_date: new Date('2024-12-31'),
                slot: '2026-05-20T14:30:00',
                status: 'Pending'
            }
        ];

        // Seed for Alice as well if she exists
        const alice = users.find(u => u.username === 'alice_final');
        if (alice) {
            licenses.push({
                user_id: alice._id,
                license_no: 'DL-ALICE-999',
                expiry_date: new Date('2035-05-05'),
                slot: '2026-06-10T11:00:00',
                status: 'Approved'
            });
        }

        await License.deleteMany({}); // Optional: clear existing
        await License.insertMany(licenses);

        console.log('✅ Seeded license records successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err.message);
        process.exit(1);
    }
};

seedLicenses();
