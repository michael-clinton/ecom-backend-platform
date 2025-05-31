const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
    {
        username: { type: String, required: true },
        email: { type: String, unique: true, required: true },
        password: { type: String, required: true },
        isEmailVerified: { type: Boolean, default: false },
        otp: { type: String },
        otpExpires: { type: Date },
        failedOtpAttempts: { type: Number, default: 0 }
    },
    {
        timestamps: true // This automatically adds `createdAt` and `updatedAt`
    }
);

// Method to compare passwords
UserSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);
