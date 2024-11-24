// src/services/userService.js
const User = require('../models/userModel');

exports.getAllUsers = async () => {
  return await User.findAll();
};

exports.createUser = async (data) => {
  return await User.create(data);
};

exports.getUserById = async (id) => {
  return await User.findByPk(id);
};