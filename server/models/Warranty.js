const mongoose = require('mongoose');

// Define Warranty Schema
const warrantySchema = new mongoose.Schema({
  userId: { // Link to the user who owns this warranty
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference the User model
    required: true,
    index: true, // Add index for faster querying by user
  },
  productName: { type: String, required: true },
  brand: { type: String },
  purchaseDate: { type: Date, required: true },
  expiryDate: { type: Date, required: true },
  category: { type: String },
  retailer: { type: String },
  serialNumber: { type: String },
  notes: { type: String },
  image: { type: String }, // Store image URL or base64 data URI
  reminderPreference: { // New field for reminder timing
    type: String, // e.g., '1d', '7d', '30d', 'none'
    default: '7d', // Default to 1 week before
  },
  lastNotified: { type: Date }, // Track when the last notification was sent for this warranty
}, { timestamps: true });

const Warranty = mongoose.model('Warranty', warrantySchema);

module.exports = Warranty;
