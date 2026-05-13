const User = require('../models/User');
const { validationResult } = require('express-validator');
const crypto = require('crypto');
const { uploadBufferToCloudinary, deleteCloudinaryAsset } = require('../utils/cloudinary');

// @desc  Register
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success:false, errors: errors.array() });
  const { name, email, password, phone } = req.body;
  try {
    if (await User.findOne({ email }))
      return res.status(400).json({ success:false, message:'Email already registered' });
    const user = await User.create({ name, email, password, phone });
    const token = user.getSignedToken();
    res.status(201).json({ success:true, token, user:{ id:user._id, name:user.name, email:user.email, role:user.role } });
  } catch(err){ res.status(500).json({ success:false, message:err.message }); }
};

// @desc  Login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success:false, message:'Email and password required' });
  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success:false, message:'Invalid credentials' });
    if (!user.isActive)
      return res.status(403).json({ success:false, message:'Your account has been deactivated. Contact support.' });
    const token = user.getSignedToken();
    res.json({ success:true, token, user:{ id:user._id, name:user.name, email:user.email, role:user.role, avatar:user.avatar } });
  } catch(err){ res.status(500).json({ success:false, message:err.message }); }
};

// @desc  Get current user
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('cart.product').populate('wishlist');
    res.json({ success:true, user });
  } catch(err){ res.status(500).json({ success:false, message:err.message }); }
};

// @desc  Update profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id, { name, phone, address, avatar },
      { new:true, runValidators:true }
    );
    res.json({ success:true, user });
  } catch(err){ res.status(500).json({ success:false, message:err.message }); }
};

// @desc  Upload profile image
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success:false, message:'Image file is required' });

    const existingUser = await User.findById(req.user.id);
    if (!existingUser) return res.status(404).json({ success:false, message:'User not found' });

    const uploaded = await uploadBufferToCloudinary(req.file.buffer, 'wyw/avatars');
    if (existingUser.avatar?.startsWith('http')) {
      await deleteCloudinaryAsset(existingUser.avatar);
    }

    existingUser.avatar = uploaded.secure_url;
    await existingUser.save({ validateBeforeSave:false });
    res.json({ success:true, avatar: existingUser.avatar, user: existingUser });
  } catch(err){ res.status(500).json({ success:false, message:err.message }); }
};

// @desc  Change password (logged in)
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ success:false, message:'Both passwords required' });
    if (newPassword.length < 6)
      return res.status(400).json({ success:false, message:'New password must be at least 6 characters' });
    const user = await User.findById(req.user.id).select('+password');
    if (!(await user.matchPassword(currentPassword)))
      return res.status(401).json({ success:false, message:'Current password is incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ success:true, message:'Password changed successfully' });
  } catch(err){ res.status(500).json({ success:false, message:err.message }); }
};

// @desc  Forgot password — generate reset token
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success:false, message:'Email is required' });
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ success:false, message:'No account found with that email' });

    // Generate 6-digit OTP token (simpler than URL links for this setup)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    user.resetPasswordToken = hashedOtp;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save({ validateBeforeSave: false });

    // In production wire to nodemailer — for now return OTP in response (dev mode)
    if (process.env.NODE_ENV === 'development') {
      return res.json({ success:true, message:'OTP generated (dev mode — check response)', otp, email });
    }

    // Production: send email (nodemailer setup)
    try {
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST, port: process.env.EMAIL_PORT,
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      });
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: 'WYW Jewellery — Password Reset OTP',
        html: `
          <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#111;color:#f0ebe0;padding:2rem;border:1px solid rgba(201,168,76,0.3)">
            <h2 style="color:#C9A84C;letter-spacing:4px;font-size:1.5rem">WYW</h2>
            <p>You requested a password reset. Use this OTP:</p>
            <div style="font-size:2.5rem;font-weight:bold;color:#C9A84C;letter-spacing:8px;text-align:center;padding:1.5rem;border:1px solid #C9A84C;margin:1.5rem 0">${otp}</div>
            <p style="color:#888;font-size:0.85rem">This OTP expires in <strong style="color:#f0ebe0">15 minutes</strong>. Do not share it with anyone.</p>
            <p style="color:#888;font-size:0.85rem">If you didn't request this, ignore this email.</p>
          </div>
        `,
      });
      res.json({ success:true, message:`OTP sent to ${user.email}` });
    } catch(emailErr) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      res.status(500).json({ success:false, message:'Failed to send email. Try again later.' });
    }
  } catch(err){ res.status(500).json({ success:false, message:err.message }); }
};

// @desc  Verify OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ success:false, message:'Email and OTP required' });
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
    const user = await User.findOne({
      email,
      resetPasswordToken: hashedOtp,
      resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ success:false, message:'Invalid or expired OTP' });
    res.json({ success:true, message:'OTP verified', email });
  } catch(err){ res.status(500).json({ success:false, message:err.message }); }
};

// @desc  Reset password with OTP
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword)
      return res.status(400).json({ success:false, message:'All fields required' });
    if (newPassword.length < 6)
      return res.status(400).json({ success:false, message:'Password must be at least 6 characters' });
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
    const user = await User.findOne({
      email,
      resetPasswordToken: hashedOtp,
      resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ success:false, message:'Invalid or expired OTP' });
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    const token = user.getSignedToken();
    res.json({ success:true, message:'Password reset successful', token, user:{ id:user._id, name:user.name, email:user.email, role:user.role } });
  } catch(err){ res.status(500).json({ success:false, message:err.message }); }
};

// ── ADMIN ─────────────────────────────────────────────────────────────────

// @desc  Get all users (admin)
exports.getAllUsers = async (req, res) => {
  try {
    const { search, role, status, page=1, limit=20 } = req.query;
    const query = {};
    if (role) query.role = role;
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;
    if (search) query.$or = [
      { name: { $regex:search, $options:'i' } },
      { email: { $regex:search, $options:'i' } },
    ];
    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt:-1 }).skip((page-1)*limit).limit(Number(limit)),
      User.countDocuments(query),
    ]);
    res.json({ success:true, users, total });
  } catch(err){ res.status(500).json({ success:false, message:err.message }); }
};

// @desc  Get single user (admin)
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success:false, message:'User not found' });
    res.json({ success:true, user });
  } catch(err){ res.status(500).json({ success:false, message:err.message }); }
};

// @desc  Update user (admin) — name, email, role, isActive, phone
exports.adminUpdateUser = async (req, res) => {
  try {
    const { name, email, phone, role, isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, role, isActive },
      { new:true, runValidators:true }
    );
    if (!user) return res.status(404).json({ success:false, message:'User not found' });
    res.json({ success:true, user });
  } catch(err){ res.status(400).json({ success:false, message:err.message }); }
};

// @desc  Toggle user active/inactive (admin)
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success:false, message:'User not found' });
    if (user.role === 'admin') return res.status(403).json({ success:false, message:'Cannot deactivate admin' });
    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave:false });
    res.json({ success:true, user, message: user.isActive ? 'User activated' : 'User deactivated' });
  } catch(err){ res.status(500).json({ success:false, message:err.message }); }
};
