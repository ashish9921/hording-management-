// backend/scripts/seedHoardings.js - Add hoardings to database

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Hoarding = require('../src/models/Hoarding');
const User = require('../src/models/User');

const hoardings = [
    {
        hoardingId: 'H001',
        location: 'Karve Rd / Paud Rd',
        address: 'Karve Road, Erandwane, Pune, Maharashtra 411004',
        coordinates: {
            type: 'Point',
            coordinates: [73.8567, 18.5204] // [longitude, latitude]
        },
        size: '20x10 ft',
        baseRent: 15000,
        status: 'available',
        images: []
    },
    {
        hoardingId: 'H002',
        location: 'Shivaji Nagar',
        address: 'Shivaji Nagar, Pune, Maharashtra 411005',
        coordinates: {
            type: 'Point',
            coordinates: [73.8467, 18.5304]
        },
        size: '15x10 ft',
        baseRent: 12000,
        status: 'available',
        images: []
    },
    {
        hoardingId: 'H003',
        location: 'FC Road',
        address: 'Fergusson College Road, Pune, Maharashtra 411004',
        coordinates: {
            type: 'Point',
            coordinates: [73.8667, 18.5104]
        },
        size: '20x15 ft',
        baseRent: 20000,
        status: 'available',
        images: []
    },
    {
        hoardingId: 'H004',
        location: 'Kothrud',
        address: 'Kothrud, Pune, Maharashtra 411038',
        coordinates: {
            type: 'Point',
            coordinates: [73.8367, 18.5404]
        },
        size: '18x12 ft',
        baseRent: 16000,
        status: 'available',
        images: []
    },
    {
        hoardingId: 'H005',
        location: 'Camp Area',
        address: 'Camp Area, Pune, Maharashtra 411001',
        coordinates: {
            type: 'Point',
            coordinates: [73.8767, 18.5004]
        },
        size: '25x12 ft',
        baseRent: 18000,
        status: 'available',
        images: []
    }
];

async function seedHoardings() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find a PMC user to set as creator
        let pmcUser = await User.findOne({ userType: 'pmc' });

        if (!pmcUser) {
            console.log('⚠️  No PMC user found. Creating one...');
            pmcUser = await User.create({
                name: 'PMC Admin',
                email: 'admin@pmc.gov.in',
                password: 'admin123',
                userType: 'pmc',
                phone: '9876543210',
                employeeId: 'PMC001',
                department: 'Town Planning'
            });
            console.log('✅ PMC user created');
        }

        // Clear existing hoardings (optional)
        await Hoarding.deleteMany({});
        console.log('🗑️  Cleared existing hoardings');

        // Add createdBy field to each hoarding
        const hoardingsWithCreator = hoardings.map(h => ({
            ...h,
            createdBy: pmcUser._id
        }));

        // Insert hoardings
        const result = await Hoarding.insertMany(hoardingsWithCreator);

        console.log(`✅ Added ${result.length} hoardings to database`);
        console.log('\n📍 Hoardings created:');
        result.forEach(h => {
            console.log(`  ${h.hoardingId}: ${h.location} (${h.size}) - MongoDB ID: ${h._id}`);
        });

        mongoose.connection.close();
        console.log('\n✅ Done! Hoardings are ready to use.');

    } catch (error) {
        console.error('❌ Error:', error);
        mongoose.connection.close();
        process.exit(1);
    }
}

seedHoardings();