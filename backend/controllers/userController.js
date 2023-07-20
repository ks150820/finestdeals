const User = require("../models/userModel");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/errorhandler");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const cloudinary = require('cloudinary').v2; 
const crypto = require("crypto");

exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  const myCloud = await cloudinary.uploader.upload(req.body.avatar, {
    folder: "avatars",
    width: 150,
    crop: "scale",
  })
  const { name, email, password } = req.body;

  let user = new User({
    name,
    email,
    password,
    avatar: {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    },
  });

  await user.save();

  sendToken(user, 201, res);
});

exports.loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  console.log(req.body);

  if (!email || !password)
    return next(new ErrorHandler("Please enter Email & password"), 400);

  const user = await User.findOne({ email }).select("+password");

  if (!user) return next(new ErrorHandler("Invalide email or password."), 401);

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched)
    return next(new ErrorHandler("Invalid email or password."), 401);

  sendToken(user, 200, res);
};

exports.logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    messsage: "Logged out successfully.",
  });
});

// forgot password
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  console.log("email", req.body)
  const user = await User.findOne({ email: req.body.email });

  if (!user) return next(new ErrorHandler("User not found.", 404));

  // Get Resetpassword Token
  const resetPasswordToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const getHost = req.get("host");

  // const resetPasswordUrl = `${req.protocol}://${getHost}/api/v1/password/reset/${resetPasswordToken}`;
  const resetPasswordUrl = `${req.protocol}://${req.get("host")}/password/reset/${resetPasswordToken}`;

  const message = `Your password reset token is: \n\n ${resetPasswordUrl} \n\n If you have not requested this email then, please ignore it.`;

  try {
    await sendEmail({
      email: user.email,
      subject: "FinesDeals password recovery.",
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully.`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler(error.message, 500));
  }
});

// reset password
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user)
    return next(
      new ErrorHandler("Reset password token is invalid or has expired", 400)
    );

  if (req.body.password !== req.body.confirmPassword)
    return next(new ErrorHandler("confirm is not matched.", 400));

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendToken(user, 200, res);
});

// get user details
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
  console.log('user id =>', req.user.id);
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});

// update password
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched)
    return next(new ErrorHandler("Old password is incorrect."), 400);

  if (req.body.newPassword !== req.body.confirmPassword)
    return next(new ErrorHandler("Password doesn't match."), 400);

  user.password = req.body.newPassword;
  await user.save();

  sendToken(user, 200, res);
});

// update user profile
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  };

  if(req.body.avatar !== ""){
    const user = await User.findById(req.user.id);
    const imageId = user.avatar.public_id;
    await cloudinary.uploader.destroy(imageId);

    const myCloud = await cloudinary.uploader.upload(req.body.avatar, {
      folder: "avatars",
      width: 150,
      crop: "scale",
    });
    newUserData.avatar = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    }
  }

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

// get all users (admin)
exports.getAllUsers = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users,
  });
});

// get  user detail (admin)
exports.getSingleDetail = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user)
    return next(
      new ErrorHandler(`User does not exist with this ID: ${req.params.id}`)
    );

  res.status(200).json({
    success: true,
    user,
  });
});

// update user role -- Admin
exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  let user = User.findById(req.params.id);

  if(!user) {
    return next(
      new ErrorHandler(`User does not exist with this id ${req.params.id}`, 400)
    )
  }

  user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

// delete user -- Admin
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
  let user = await User.findById(req.params.id);

  if (!user)
    return next(
      new ErrorHandler(`User doesn't exist with this id ${req.params.id}`)
    );

  const imageId = user.avatar.public_id;
  await cloudinary.uploader.destroy(imageId);

  await user.remove();

  res.status(200).json({
    success: true,
    message: "User deleted successfully.",
  });
});
