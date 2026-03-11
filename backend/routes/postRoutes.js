const express = require("express")
const router = express.Router()

const auth = require("../middleware/authMiddleware")
const upload = require("../middleware/upload")

const {
  createPost,
  getPosts,
  deletePost,
  updatePost,
  toggleLike,
  deleteComment,
  addComment
} = require("../controllers/postController")

router.post("/", auth, upload.single("image"), createPost)

router.get("/", auth, getPosts)

// SOCIAL ACTION ROUTES (must come before :id routes)

router.put("/like/:id", auth, toggleLike)

router.post("/comment/:id", auth, addComment)

router.delete("/comment/:postId/:commentId", auth, deleteComment)

// GENERIC ROUTES

router.delete("/:id", auth, deletePost)

router.put("/:id", auth, updatePost)

module.exports = router