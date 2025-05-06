require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken'); // Import jsonwebtoken

const authRoutes = require('./routes/auth');
const User = require('./models/User'); // Import User model
const Warranty = require('./models/Warranty'); // Import Warranty model

const app = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// MongoDB Connection
const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
  console.error('Error: MONGODB_URI environment variable not set.');
  process.exit(1); // Exit if connection string is missing
}

mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected successfully.'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit on connection failure
  });

// --- Authentication Middleware ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) return res.sendStatus(401); // if there isn't any token

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
        console.error("JWT Verification Error:", err);
        return res.sendStatus(403); // Forbidden if token is invalid
    }
    req.user = user; // Add the decoded user payload (contains user.id) to the request object
    next(); // pass the execution off to whatever request the client intended
  });
};

// --- API Routes ---

// Auth routes (public)
app.use('/api/auth', authRoutes);

// Warranty routes (protected)
// POST /api/warranties - Add a new warranty (requires authentication)
app.post('/api/warranties', authenticateToken, async (req, res) => {
  console.log('Received POST /api/warranties request by user:', req.user.user.id);
  console.log('Request Body:', req.body);

  try {
    // Include reminderPreference in the destructuring
    const { productName, purchaseDate, expiryDate, reminderPreference, ...restData } = req.body;
    const userId = req.user.user.id; // Get user ID from authenticated token

    if (!productName || !purchaseDate || !expiryDate) {
      console.error('Validation Error: Missing required fields.');
      return res.status(400).json({ message: 'Missing required warranty fields: productName, purchaseDate, expiryDate.' });
    }

    const warranty = new Warranty({
      ...restData,
      productName,
      purchaseDate,
      expiryDate,
      reminderPreference, // Save the preference
      userId: userId, // Associate warranty with the logged-in user
    });

    const savedWarranty = await warranty.save();
    console.log('Warranty saved successfully:', savedWarranty);
    res.status(201).json(savedWarranty);
  } catch (error) {
    console.error('Error during warranty save process:', error);
    if (error.name === 'ValidationError') {
        return res.status(400).json({ message: 'Validation Error', errors: error.errors });
    }
    res.status(500).json({ message: 'Error saving warranty to database.' });
  }
});

// GET /api/warranties - Get all warranties for the logged-in user (requires authentication)
app.get('/api/warranties', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.user.id; // Get user ID from token
        const warranties = await Warranty.find({ userId: userId }).sort({ expiryDate: 1 }); // Find warranties for this user, sort by expiry
        res.status(200).json(warranties);
    } catch (error) {
        console.error('Error fetching warranties:', error);
        res.status(500).json({ message: 'Error fetching warranties from database.' });
    }
});

// GET /api/warranties/:id - Get a specific warranty (requires authentication)
app.get('/api/warranties/:id', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.user.id;
        const warrantyId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(warrantyId)) {
            return res.status(400).json({ message: 'Invalid warranty ID format.' });
        }

        const warranty = await Warranty.findOne({ _id: warrantyId, userId: userId });

        if (!warranty) {
            return res.status(404).json({ message: 'Warranty not found or you do not have permission to view it.' });
        }

        res.status(200).json(warranty);
    } catch (error) {
        console.error('Error fetching warranty details:', error);
        res.status(500).json({ message: 'Error fetching warranty details from database.' });
    }
});

// DELETE /api/warranties/:id - Delete a warranty (requires authentication)
app.delete('/api/warranties/:id', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.user.id;
        const warrantyId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(warrantyId)) {
            return res.status(400).json({ message: 'Invalid warranty ID format.' });
        }

        const result = await Warranty.findOneAndDelete({ _id: warrantyId, userId: userId });

        if (!result) {
            return res.status(404).json({ message: 'Warranty not found or you do not have permission to delete it.' });
        }

        res.status(200).json({ message: 'Warranty deleted successfully' });
    } catch (error) {
        console.error('Error deleting warranty:', error);
        res.status(500).json({ message: 'Error deleting warranty from database.' });
    }
});

// PUT /api/warranties/:id - Update a warranty (requires authentication)
app.put('/api/warranties/:id', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.user.id;
        const warrantyId = req.params.id;
        // Include reminderPreference in updateData if sent
        const { reminderPreference, ...updateData } = req.body;

        if (!mongoose.Types.ObjectId.isValid(warrantyId)) {
            return res.status(400).json({ message: 'Invalid warranty ID format.' });
        }

        // Ensure userId is not accidentally updated
        delete updateData.userId;

        // Prepare the full update object
        const fullUpdate = { ...updateData };
        if (reminderPreference !== undefined) {
            fullUpdate.reminderPreference = reminderPreference;
        }

        const updatedWarranty = await Warranty.findOneAndUpdate(
            { _id: warrantyId, userId: userId },
            fullUpdate, // Use the combined update object
            { new: true, runValidators: true } // Return the updated document and run schema validators
        );

        if (!updatedWarranty) {
            return res.status(404).json({ message: 'Warranty not found or you do not have permission to update it.' });
        }

        res.status(200).json(updatedWarranty);
    } catch (error) {
        console.error('Error updating warranty:', error);
         if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation Error', errors: error.errors });
        }
        res.status(500).json({ message: 'Error updating warranty in database.' });
    }
});

// --- Nodemailer Setup ---
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587', 10),
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error('Nodemailer configuration error:', error);
  } else {
    console.log('Nodemailer is configured and ready to send emails.');
  }
});

// --- Notification Sending Function ---
async function sendNotification(warranty, user) {
  if (!user || !user.notificationEmail) {
    console.log(`Skipping notification for ${warranty.productName}: User or notification email not found.`);
    return;
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: user.notificationEmail,
    subject: `Warranty Expiry Reminder: ${warranty.productName}`,
    text: `Hi ${user.name || 'there'},\n\nThis is a reminder that the warranty for your product "${warranty.productName}" (Brand: ${warranty.brand || 'N/A'}) is expiring on ${new Date(warranty.expiryDate).toLocaleDateString()}.

Regards,\nWarranty Vault`,
    // html: `<p>Hi ${user.name || 'there'},</p><p>This is a reminder...</p>`
  };

  try {
    let info = await transporter.sendMail(mailOptions);
    console.log(`Notification email sent for ${warranty.productName} to ${user.notificationEmail}: ${info.messageId}`);
    // Update lastNotified timestamp on the warranty
    warranty.lastNotified = new Date();
    await warranty.save();
  } catch (error) {
    console.error(`Error sending notification email for ${warranty.productName} to ${user.notificationEmail}:`, error);
  }
}

// --- Scheduled Task (Cron Job) ---
cron.schedule('07 7 * * *', async () => { // Run daily at 9:30 AM IST
  console.log('Running daily warranty notification check...');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate notification trigger dates
  const oneDayBefore = new Date(today); oneDayBefore.setDate(today.getDate() + 1);
  const oneWeekBefore = new Date(today); oneWeekBefore.setDate(today.getDate() + 7);
  const oneMonthBefore = new Date(today); oneMonthBefore.setMonth(today.getMonth() + 1);

  try {
    // Find warranties expiring exactly 1 day, 1 week, or 1 month from today
    // Also ensure we haven't notified for this expiry recently (e.g., within the last 12 hours)
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);

    const warrantiesToNotify = await Warranty.find({
      $or: [
        { expiryDate: oneDayBefore },
        { expiryDate: oneWeekBefore },
        { expiryDate: oneMonthBefore },
      ],
      $or: [
          { lastNotified: { $lt: twelveHoursAgo } }, // Last notified more than 12 hours ago
          { lastNotified: { $exists: false } }      // Never notified
      ]
    }).populate('userId'); // Populate the user details to get notificationEmail

    console.log(`Found ${warrantiesToNotify.length} warranties due for notification.`);

    for (const warranty of warrantiesToNotify) {
      if (warranty.userId) { // Check if user details were populated
        console.log(`Triggering notification for ${warranty.productName} (User: ${warranty.userId.email}, Expires: ${new Date(warranty.expiryDate).toLocaleDateString()})`);
        await sendNotification(warranty, warranty.userId);
      } else {
          console.warn(`Skipping notification for warranty ${warranty._id}: User details not found.`);
      }
    }
    console.log('Finished daily warranty notification check.');
  } catch (error) {
    console.error('Error during scheduled notification check:', error);
  }
}, {
  scheduled: true,
  timezone: "Asia/Kolkata"
});

console.log('Cron job for warranty notifications scheduled.');

// Base route
app.get('/', (req, res) => {
  res.send('Warranty Vault API is running!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
