const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// 1. Create the Blueprint (The Schema)
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Alias is required'],
  },
  email: {
    type: String,
    required: [true, 'Secure route (email) is required'],
    unique: true, // No duplicate emails allowed
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email format'
    ]
  },
  password: {
    type: String,
    required: [true, 'Encryption key is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  // Setting up the database to hold their saved simulations later!
  simulationHistory: [{
    type: Array, 
    default: []
  }],
  // We can use this later to give you admin privileges 
  role: {
    type: String,
    enum: ['user', 'sysadmin'],
    default: 'user'
  }
}, {
  timestamps: true // Automatically adds 'createdAt' and 'updatedAt'
});

// 2. The Encryption Machine (Runs automatically before saving to MongoDB)
UserSchema.pre('save', async function (next) {
  // If the password wasn't modified, stop here and move on
  if (!this.isModified('password')) {
    return next(); // CRITICAL FIX: Added 'return' here to stop execution!
  }
  
  // Scramble the password 10 times for heavy security
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// 3. The Password Checker (Used during Login)
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Export the model so the rest of our backend can use it
module.exports = mongoose.model('User', UserSchema);