import express from "express";
import { register, verifyEmail, login, forgotPassword, resetPassword, getMe } from '../controllers/authController.js'; // Assurez-vous que le chemin est correct
import auth from '../middlewares/authMiddleware.js'; // Assurez-vous que le chemin est correct
import User from '../models/User.js'; // Assurez-vous que le chemin est correct

const router = express.Router();

router.post('/register', register);
router.get('/verify-email/:token', verifyEmail);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', auth, getMe);
// ... autres routes

// Récupérer un utilisateur par ID
router.get('/users/:userId', auth, async (req, res) => {
    try {
      const user = await User.findById(req.params.userId).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });


  export default router;