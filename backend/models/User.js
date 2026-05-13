const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
  {
    name:  { type:String, required:[true,'Name is required'], trim:true, maxlength:80 },
    email: { type:String, required:[true,'Email is required'], unique:true, lowercase:true, match:[/^\S+@\S+\.\S+$/,'Please enter a valid email'] },
    phone: { type:String, default:'' },
    password: { type:String, required:[true,'Password is required'], minlength:6, select:false },
    role:  { type:String, enum:['user','admin'], default:'user' },
    avatar: { type:String, default:'' },
    isActive: { type:Boolean, default:true },
    address: {
      street: String, city: String, state: String,
      pincode: String, country: { type:String, default:'India' },
    },
    cart: [{
      product:  { type:mongoose.Schema.Types.ObjectId, ref:'Product' },
      quantity: { type:Number, default:1 },
      size:     String,
    }],
    wishlist: [{ type:mongoose.Schema.Types.ObjectId, ref:'Product' }],
    resetPasswordToken:  String,
    resetPasswordExpire: Date,
  },
  { timestamps:true }
);

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.getSignedToken = function() {
  return jwt.sign({ id:this._id, role:this.role }, process.env.JWT_SECRET, { expiresIn:process.env.JWT_EXPIRE });
};

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
