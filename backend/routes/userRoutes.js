const express = require("express")
const router = express.Router()
const auth = require("../middleware/authMiddleware")

const {
  followUser,
  unfollowUser
} = require("../controllers/userController")

router.get("/profile", auth, (req, res) => {
  res.json({
    message: "Protected route accessed",
    userId: req.user.id
  })
})

router.put("/follow/:id", auth, followUser)

router.put("/unfollow/:id", auth, unfollowUser)

module.exports = router