const express = require("express");
const {
  registerUser,
  loginUser,
  logout,
  forgotPassword,
  resetPassword,
  getUserDetails,
  updatePassword,
  updateProfile,
  getAllUsers,
  getSingleDetail,
  updateUserRole,
  deleteUser,
} = require("../controllers/userController");
const { auth, authorizeRole } = require("../middleware/auth");
const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/logout", logout);

router.post("/password/forgot", forgotPassword);

router.put("/password/reset/:token", resetPassword);

router.get("/me", auth, getUserDetails);

router.put("/password/update", auth, updatePassword);

router.put("/me/update", auth, updateProfile);

router.get("/admin/users", auth, authorizeRole("admin"), getAllUsers);

router.get("/admin/user/:id", auth, authorizeRole("admin"), getSingleDetail);

router.put("/admin/user/:id", auth, authorizeRole("admin"), updateUserRole);

router.delete("/admin/user/:id", auth, authorizeRole("admin"), deleteUser);

module.exports = router;
