// createAdminUser.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User'); // Dostosuj ścieżkę do modelu User

const createAdminUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const adminEmail = 'kontakt@ecopywriting.pl'; // Zmień na pożądany adres email
    const adminPassword = 'Koszykowka123*'; // Zmień na bezpieczne hasło

    // Sprawdź, czy admin już istnieje
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Utwórz nowego admina
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    const adminUser = new User({
      name: 'Admin User',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      isVerified: true,
      notificationPermissions: {
        browser: true,
        sound: true
      },
      companyDetails: {
        companyName: 'Admin Company',
        nip: '1234567890',
        address: 'Admin Street 1',
        postalCode: '00-000',
        city: 'Admin City',
        buildingNumber: '1'
      },
      accountBalance: 0,
      totalSpent: 0
    });

    await adminUser.save();
    console.log('Admin user created successfully');

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
  }
};

createAdminUser();