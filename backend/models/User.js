const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Alias is required'],
  },
  email: {
    type: String,
    required: [true, 'Secure route (email) is required'],
    unique: true,
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
  // --- NEW: THE ECONOMIC IDENTITY PROFILE ---
  // Using 'type: Object' makes it scalable for any new onboarding questions
  profile: {
    type: Object,
    default: {}
  },
  onboardingComplete: {
    type: Boolean,
    default: false
  },
  simulationHistory: {
    type: Array, 
    default: []
  },
  role: {
    type: String,
    enum: ['user', 'sysadmin'],
    default: 'user'
  }
}, {
  timestamps: true 
});

// Encryption logic (Keep your existing pre-save hook here)
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);