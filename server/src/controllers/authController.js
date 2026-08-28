import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'shopmyuniform_super_secret_jwt_key_2026', {
    expiresIn: '30d',
  });
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, studentName, grade, schoolId, phone } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'parent',
      studentName: studentName || '',
      grade: grade || '',
      schoolId: schoolId || null,
      phone: phone || '',
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      studentName: user.studentName,
      grade: user.grade,
      schoolId: user.schoolId,
      phone: user.phone,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate('schoolId');
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentName: user.studentName,
        grade: user.grade,
        schoolId: user.schoolId,
        phone: user.phone,
        shippingAddress: user.shippingAddress,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('schoolId').select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.role = req.body.role || user.role;
      user.studentName = req.body.studentName !== undefined ? req.body.studentName : user.studentName;
      user.grade = req.body.grade !== undefined ? req.body.grade : user.grade;
      user.schoolId = req.body.schoolId !== undefined ? req.body.schoolId : user.schoolId;
      user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;

      if (req.body.shippingAddress) {
        user.shippingAddress = {
          ...user.shippingAddress,
          ...req.body.shippingAddress,
        };
      }

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();
      const populatedUser = await User.findById(updatedUser._id).populate('schoolId').select('-password');

      res.json({
        _id: populatedUser._id,
        name: populatedUser.name,
        email: populatedUser.email,
        role: populatedUser.role,
        studentName: populatedUser.studentName,
        grade: populatedUser.grade,
        schoolId: populatedUser.schoolId,
        phone: populatedUser.phone,
        shippingAddress: populatedUser.shippingAddress,
        token: generateToken(populatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};
