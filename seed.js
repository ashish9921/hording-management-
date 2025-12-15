const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Hoarding = require('./src/models/Hoarding');
const User = require('./src/models/User');

// Load environment variables
dotenv.config();

// Connect to database
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err);
        process.exit(1);
    });

// Sample hoarding locations in Pune
const hoardings = [
    {
        location: 'Karve Rd / Paud Rd',
        coordinates: { latitude: 18.5204, longitude: 73.8567 },
        size: '20x10 ft',
        area: 'Karve Nagar',
        baseRent: 15000,
        priceCategory: 'standard',
        status: 'available'
    },
    {
        location: 'Shivaji Nagar',
        coordinates: { latitude: 18.5304, longitude: 73.8467 },
        size: '15x10 ft',
        area: 'Shivaji Nagar',
        baseRent: 12000,
        priceCategory: 'prime',
        status: 'available'
    },
    {
        location: 'FC Road',
        coordinates: { latitude: 18.5104, longitude: 73.8667 },
        size: '20x15 ft',
        area: 'Fergusson College Road',
        baseRent: 20000,
        priceCategory: 'prime',
        status: 'available'
    },
    {
        location: 'Kothrud',
        coordinates: { latitude: 18.5404, longitude: 73.8367 },
        size: '18x12 ft',
        area: 'Kothrud',
        baseRent: 16000,
        priceCategory: 'standard',
        status: 'available'
    },
    {
        location: 'Camp Area',
        coordinates: { latitude: 18.5004, longitude: 73.8767 },
        size: '25x12 ft',
        area: 'Camp',
        baseRent: 18000,
        priceCategory: 'prime',
        status: 'available'
    },
    {
        location: 'Koregaon Park',
        coordinates: { latitude: 18.5389, longitude: 73.8996 },
        size: '20x10 ft',
        area: 'Koregaon Park',
        baseRent: 22000,
        priceCategory: 'prime',
        status: 'available'
    },
    {
        location: 'Hadapsar',
        coordinates: { latitude: 18.5089, longitude: 73.9260 },
        size: '15x10 ft',
        area: 'Hadapsar',
        baseRent: 11000,
        priceCategory: 'standard',
        status: 'available'
    },
    {
        location: 'Baner',
        coordinates: { latitude: 18.5593, longitude: 73.7876 },
        size: '20x10 ft',
        area: 'Baner',
        baseRent: 17000,
        priceCategory: 'prime',
        status: 'available'
    },
    {
        location: 'Aundh',
        coordinates: { latitude: 18.5642, longitude: 73.8079 },
        size: '18x12 ft',
        area: 'Aundh',
        baseRent: 16500,
        priceCategory: 'standard',
        status: 'available'
    },
    {
        location: 'Wakad',
        coordinates: { latitude: 18.5974, longitude: 73.7698 },
        size: '20x10 ft',
        area: 'Wakad',
        baseRent: 14000,
        priceCategory: 'standard',
        status: 'available'
    }
];

// Sample test users
const testUsers = [
    {
        name: 'Test Printing Press',
        email: 'press@example.com',
        password: 'password123',
        phoneNo: '9876543210',
        userType: 'printing_press',
        shopLocation: 'Karve Road, Pune',
        licenseNo: 'LIC123456',
        noOfMachines: '5'
    },
    {
        name: 'Test Public User',
        email: 'public@example.com',
        password: 'password123',
        phoneNo: '9876543211',
        userType: 'public'
    },
    {
        name: 'PMC Officer',
        email: 'officer@pmc.gov.in',
        password: 'password123',
        phoneNo: '9876543212',
        userType: 'pmc',
        employeeId: 'PMC001',
        department: 'Town Planning',
        designation: 'Assistant Engineer',
        verificationStatus: 'approved'
    },
    {
        name: 'EcoRecycle Solutions',
        email: 'recycler@example.com',
        password: 'password123',
        phoneNo: '9876543213',
        userType: 'recycler',
        businessName: 'EcoRecycle Solutions',
        ownerName: 'Amit Patil',
        serviceArea: 'Pune City',
        registrationNo: 'REC12345'
    }
];

const seedDatabase = async () => {
    try {
        console.log('🗑️  Clearing existing data...');

        // Clear existing data
        await Hoarding.deleteMany({});
        await User.deleteMany({});

        console.log('✅ Existing data cleared');

        // Create a PMC user first (needed for hoarding createdBy field)
        console.log('👤 Creating test users...');
        const createdUsers = await User.create(testUsers);
        console.log(`✅ Created ${createdUsers.length} test users`);

        // Add createdBy field to hoardings (use PMC user)
        const pmcUser = createdUsers.find(u => u.userType === 'pmc');
        const hoardingsWithCreator = hoardings.map(h => ({
            ...h,
            createdBy: pmcUser._id
        }));

        // Insert hoarding locations
        console.log('📍 Seeding hoarding locations...');
        const createdHoardings = await Hoarding.insertMany(hoardingsWithCreator);
        console.log(`✅ Created ${createdHoardings.length} hoarding locations`);

        console.log('\n🎉 Database seeded successfully!');
        console.log('\n📝 Test Credentials:');
        console.log('Printing Press: press@example.com / password123');
        console.log('Public: public@example.com / password123');
        console.log('PMC Officer: officer@pmc.gov.in / password123');
        console.log('Recycler: recycler@example.com / password123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

// Run the seed function
seedDatabase();