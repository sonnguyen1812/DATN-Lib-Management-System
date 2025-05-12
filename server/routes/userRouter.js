// 
import express from 'express';
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddleware.js";
import { getAllUsers, registerNewAdmin, updateUserProfile, toggleUserLock } from "../controllers/userController.js";

const router = express.Router();

router.get('/all', isAuthenticated, isAuthorized("Admin"), getAllUsers);
router.post('/add/new-admin', isAuthenticated, isAuthorized("Admin"), registerNewAdmin);
router.put('/update/profile', isAuthenticated, updateUserProfile);
router.put('/toggle-lock/:userId', isAuthenticated, isAuthorized("Admin"), toggleUserLock);

export default router;