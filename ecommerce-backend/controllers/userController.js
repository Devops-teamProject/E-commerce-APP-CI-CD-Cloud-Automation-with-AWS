import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import asyncHandler from "express-async-handler";

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};


export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }


    const user = await User.create({
      name,
      email,
      password,
      role: req.body.role || "user",
    });


 
    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    next(error);
  }
};


export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
      createdAt: user.createdAt,
    });
  } catch (error) {
    next(error);
  }
};


export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password"); 
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};


export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = asyncHandler(async (req, res) => {
  const deletedUser = await User.findByIdAndDelete(req.params.id);
  if (!deletedUser) {
    res.status(404);
    throw new Error("User not found");
  }
  res.status(200).json({ message: "User deleted successfully" });
});

export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    
    if (req.body.password) user.password = req.body.password;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      token: generateToken(updatedUser._id, updatedUser.role),
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  console.log("Incoming UPDATE ID:", id);
  console.log("Body:", req.body);

  const user = await User.findById(id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.name = req.body.name ?? user.name;
  user.email = req.body.email ?? user.email;
  user.role = req.body.role ?? user.role;

  if (req.body.password && req.body.password.trim() !== "") {
    user.password = req.body.password;
  }

  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
  });
});


