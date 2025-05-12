//
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import { User } from "../models/userModel.js";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";

export const getAllUsers = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find({ accountVerified: true });
  res.status(200).json({
    success: true,
    users,
  });
});

export const registerNewAdmin = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Admin avatar is required", 400));
  }
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return next(new ErrorHandler("Please enter all fields.", 400));
  }
  const isRegistered = await User.findOne({
    email,
    accountVerified: true,
  });
  if (isRegistered) {
    return next(new ErrorHandler("User already registered.", 400));
  }
  if (password.length < 8 || password.length > 16) {
    return next(
      new ErrorHandler("Password must be between 8 and 16 characters.", 400),
    );
  }
  const { avatar } = req.files;
  const allowedFormats = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!allowedFormats.includes(avatar.mimetype)) {
    return next(new ErrorHandler("file format not supported", 400));
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const cloudinaryResponse = await cloudinary.uploader.upload(
    avatar.tempFilePath,
    {
      folder: "LIBRARY_MANAGEMENT_SYSTEM_ADMIN_AVATARS",
    },
  );
  if (!cloudinaryResponse || cloudinaryResponse.error) {
    console.error(
      "Cloudinary error:",
      cloudinaryResponse.error || "Unknown cloudinary error",
    );
    return next(
      new ErrorHandler("Failed to upload avatar image to cloudinary.", 500),
    );
  }
  const admin = await User.create({
    name,
    email,
    password: hashedPassword,
    role: "Admin",
    accountVerified: true,
    avatar: {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    },
  });
  res.status(201).json({
    success: true,
    message: "Admin registered successfully",
    admin,
  });
});

export const updateUserProfile = catchAsyncErrors(async (req, res, next) => {
  const { name, email } = req.body;
  
  // Tìm người dùng theo ID
  const user = await User.findById(req.user._id);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  
  // Cập nhật thông tin cơ bản
  if (name) user.name = name;
  if (email && email !== user.email) {
    // Kiểm tra xem email đã tồn tại chưa (nếu người dùng thay đổi email)
    const existingUser = await User.findOne({ email, accountVerified: true });
    if (existingUser) {
      return next(new ErrorHandler("Email already in use", 400));
    }
    user.email = email;
  }
  
  // Xử lý cập nhật avatar nếu có
  if (req.files && req.files.avatar) {
    const { avatar } = req.files;
    const allowedFormats = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedFormats.includes(avatar.mimetype)) {
      return next(new ErrorHandler("File format not supported", 400));
    }
    
    // Xóa avatar cũ nếu tồn tại
    if (user.avatar && user.avatar.public_id) {
      await cloudinary.uploader.destroy(user.avatar.public_id);
    }
    
    // Upload avatar mới
    const cloudinaryResponse = await cloudinary.uploader.upload(
      avatar.tempFilePath,
      {
        folder: user.role === "Admin" 
          ? "LIBRARY_MANAGEMENT_SYSTEM_ADMIN_AVATARS" 
          : "LIBRARY_MANAGEMENT_SYSTEM_USER_AVATARS",
      }
    );
    
    if (!cloudinaryResponse || cloudinaryResponse.error) {
      console.error(
        "Cloudinary error:",
        cloudinaryResponse.error || "Unknown cloudinary error"
      );
      return next(
        new ErrorHandler("Failed to upload avatar image to cloudinary", 500)
      );
    }
    
    user.avatar = {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    };
  }
  
  await user.save();
  
  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user
  });
});

export const toggleUserLock = catchAsyncErrors(async (req, res, next) => {
  const { userId } = req.params;
  
  // Kiểm tra ID người dùng
  if (!userId) {
    return next(new ErrorHandler("User ID is required", 400));
  }

  // Tìm người dùng trong database
  const user = await User.findById(userId);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  // Kiểm tra quyền - chỉ Admin mới có thể khóa/mở khóa tài khoản
  if (req.user.role !== "Admin") {
    return next(new ErrorHandler("Unauthorized to perform this action", 403));
  }

  // Không cho phép khóa tài khoản Admin
  if (user.role === "Admin") {
    return next(new ErrorHandler("Cannot lock admin accounts", 400));
  }

  // Đảo ngược trạng thái khóa
  user.isLocked = !user.isLocked;
  await user.save();

  const action = user.isLocked ? "locked" : "unlocked";

  res.status(200).json({
    success: true,
    message: `User account ${action} successfully`,
    user
  });
});
