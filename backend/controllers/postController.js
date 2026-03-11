const Post = require("../models/Post")
const cloudinary = require("../config/cloudinary")

// CREATE POST
exports.createPost = async (req, res) => {
  try {

    const caption = req.body.caption || ""
    let imageUrl = ""

    if (req.file) {

      const result = await cloudinary.uploader.upload_stream(
        { folder: "posts" },
        async (error, result) => {

          if (error) {
            return res.status(500).json(error)
          }

          imageUrl = result.secure_url

          const post = new Post({
            user: req.user.id,
            caption,
            image: imageUrl
          })

          await post.save()

          res.json(post)
        }
      )

      result.end(req.file.buffer)

    } else {

      const post = new Post({
        user: req.user.id,
        caption
      })

      await post.save()

      res.json(post)
    }

  } catch (error) {
    res.status(500).json(error.message)
  }
}

// GET FEED
exports.getPosts = async (req, res) => {
  try {

    const posts = await Post.find()
      .populate("user", "username profilePic")
      .sort({ createdAt: -1 })

    res.json(posts)

  } catch (error) {
    res.status(500).json(error.message)
  }
}

// DELETE POST
exports.deletePost = async (req, res) => {
  try {

    const post = await Post.findById(req.params.id)

    if (!post) {
      return res.status(404).json({ message: "Post not found" })
    }

    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" })
    }

    await post.deleteOne()

    res.json({ message: "Post deleted" })

  } catch (error) {
    res.status(500).json(error.message)
  }
}

// EDIT POST
exports.updatePost = async (req, res) => {

  try {

    const post = await Post.findById(req.params.id)

    if (!post) {
      return res.status(404).json({ message: "Post not found" })
    }

    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" })
    }

    post.caption = req.body.caption || post.caption

    await post.save()

    res.json(post)

  } catch (error) {
    res.status(500).json(error.message)
  }
}