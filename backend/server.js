const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const MONGODB_URI = 'mongodb+srv://sandeep05kumar1997_db_user:DbXbLWP19@pps.grrdy3k.mongodb.net/complaintDB?retryWrites=true&w=majority&appName=pps';

mongoose.connect(MONGODB_URI.replace('<db_password>', 'YOUR_PASSWORD_HERE'))
  .then(() => console.log('MongoDB se successfully connect ho gaya!'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Complaint Schema
const complaintSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  mobile: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  complaint: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: 'Pending',
    enum: ['Pending', 'In Progress', 'Resolved']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Complaint Model
const Complaint = mongoose.model('Complaint', complaintSchema);

// Routes

// Home Route
app.get('/', (req, res) => {
  res.json({ message: 'Complaint System API chal raha hai!' });
});

// Submit Complaint
app.post('/api/complaints', async (req, res) => {
  try {
    const { name, mobile, email, address, complaint } = req.body;

    // Validation
    if (!name || !mobile || !email || !address || !complaint) {
      return res.status(400).json({ 
        success: false, 
        message: 'Sabhi fields zaroori hain!' 
      });
    }

    // Create new complaint
    const newComplaint = new Complaint({
      name,
      mobile,
      email,
      address,
      complaint
    });

    // Save to database
    await newComplaint.save();

    res.status(201).json({
      success: true,
      message: 'Complaint successfully submit ho gayi!',
      data: newComplaint
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error! Complaint submit nahi ho payi.',
      error: error.message
    });
  }
});

// Get All Complaints
app.get('/api/complaints', async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: complaints.length,
      data: complaints
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Complaints fetch nahi ho payi',
      error: error.message
    });
  }
});

// Get Single Complaint by ID
app.get('/api/complaints/:id', async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint nahi mili'
      });
    }
    res.json({
      success: true,
      data: complaint
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching complaint',
      error: error.message
    });
  }
});

// Update Complaint Status
app.patch('/api/complaints/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint nahi mili'
      });
    }
    
    res.json({
      success: true,
      message: 'Status update ho gaya!',
      data: complaint
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Status update nahi ho payi',
      error: error.message
    });
  }
});

// Delete Complaint
app.delete('/api/complaints/:id', async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint nahi mili'
      });
    }
    res.json({
      success: true,
      message: 'Complaint delete ho gayi!'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Complaint delete nahi ho payi',
      error: error.message
    });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server port ${PORT} par chal raha hai`);
});