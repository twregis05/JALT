const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); 
const { protect } = require('../middleware/auth'); 

// --- REGISTER IDENTITY ---
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'Identity already exists.' });

        // Password hashing happens in UserSchema pre-save hook
        user = new User({ name, email, password });
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.status(201).json({ success: true, token, user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Registration failure.' });
    }
});

// --- LOGIN IDENTITY ---
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        // select('+password') is required because password is select: false in schema
        const user = await User.findOne({ email }).select('+password');
        
        if (!user) return res.status(401).json({ message: 'Invalid credentials.' });

        const isMatch = await user.matchPassword(password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials.' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.status(200).json({ success: true, token, user });
    } catch (err) {
        res.status(500).json({ message: 'Login failure.' });
    }
});

// --- SECURE PROFILE UPDATE (CONFIG-AWARE) ---
router.put('/secure-update', protect, async (req, res) => {
    try {
        const { password, updates } = req.body;
        const user = await User.findById(req.user.id).select('+password');
        
        if (!user) return res.status(404).json({ message: 'User not found.' });

        const isMatch = await user.matchPassword(password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid key. Access denied.' });

        if (updates.email) user.email = updates.email;
        if (updates.profilePicture) user.profilePicture = updates.profilePicture;

        if (updates.profile) {
            // Merge existing profile with new updates
            user.profile = { ...user.profile, ...updates.profile };
            // Mongoose needs this for Mixed/Object types to detect changes
            user.markModified('profile'); 
        }
        
        // If coming from onboarding, set flag to true
        if (req.body.onboardingComplete) {
            user.onboardingComplete = true;
        }

        await user.save();
        res.status(200).json({ success: true, message: 'Calibration synchronized.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server core failure.' });
    }
});

// --- GET CURRENT USER IDENTITY ---
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({ success: true, user });
    } catch (err) {
        res.status(500).json({ message: 'Identity fetch failed.' });
    }
});

// backend/routes/auth.js

router.put('/secure-update', protect, async (req, res) => {
    try {
        const { password, updates, onboardingComplete } = req.body;
        
        // Fetch user with password for comparison
        const user = await User.findById(req.user.id).select('+password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // --- THE FIX: BYPASS PASSWORD IF ONBOARDING ---
        // Only enforce the password check if the user is ALREADY calibrated.
        if (user.onboardingComplete) {
            const isMatch = await user.matchPassword(password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid encryption key. Access denied.' });
            }
        }

        // Apply dynamic profile updates from your config
        if (updates && updates.profile) {
            user.profile = { ...user.profile, ...updates.profile };
            user.markModified('profile'); // Tell Mongoose the Object changed
        }

        // Set the onboarding flag to true if sent from frontend
        if (onboardingComplete) {
            user.onboardingComplete = true;
        }

        await user.save();
        res.status(200).json({ success: true, message: 'Calibration synchronized.' });

    } catch (err) {
        console.error("Update Error:", err);
        res.status(500).json({ message: 'Server core failure.' });
    }
});


module.exports = router;