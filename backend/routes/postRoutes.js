const express = require("express")
const router = express.Router()

const auth = require("../middleware/authMiddleware")
const upload = require("../middleware/upload")

const {
  createPost,
  getPosts,
  deletePost,
  updatePost
} = require("../controllers/postController")

router.post("/", auth, upload.single("image"), createPost)

router.get("/", auth, getPosts)

router.delete("/:id", auth, deletePost)

router.put("/:id", auth, updatePost)

module.exports = router