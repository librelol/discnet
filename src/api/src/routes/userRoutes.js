// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController.js');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, userController.getAllUsers);
router.post('/', userController.createUser);
router.get('/:id', authMiddleware, userController.getUserById);

module.exports = router;