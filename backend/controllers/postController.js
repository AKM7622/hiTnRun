const Post = require("../models/Post")
const User = require("../models/User")
const cloudinary = require("../config/cloudinary")

// CREATE POST
exports.createPost = async (req, res) => {
  try {

    const caption = req.body.caption || ""
    let imageUrl = ""

    if (!caption && !req.file) {
      return res.status(400).json({
        message: "Post must contain an image or caption"
      })
    }

    if (req.file) {

      const result = await cloudinary.uploader.upload_stream(
        { folder: "posts" },
        async (error, result) => {

          if (error) {
            return res.status(500).json(error)
          }

          const post = new Post({
            user: req.user.id,
            caption,
            image: {
              url: result.secure_url,
              public_id: result.public_id
            }
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

    const user = await User.findById(req.user.id)

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    const posts = await Post.find({
      user: { $in: [...user.following, req.user.id] }
    })
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

    // delete image from cloudinary
    if (post.image && post.image.public_id) {
      await cloudinary.uploader.destroy(post.image.public_id)
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

// LIKE / UNLIKE POST
exports.toggleLike = async (req, res) => {

  try {

    const post = await Post.findById(req.params.id)

    if (!post) {
      return res.status(404).json({ message: "Post not found" })
    }

    const userId = req.user.id

    const alreadyLiked = post.likes.includes(userId)

    if (alreadyLiked) {
      post.likes.pull(userId)
    } else {
      post.likes.push(userId)
    }

    await post.save()

    res.json({
      likes: post.likes.length
    })

  } catch (error) {
    res.status(500).json(error.message)
  }
}

// ADD COMMENT
exports.addComment = async (req, res) => {

  try {

    const post = await Post.findById(req.params.id)

    if (!post) {
      return res.status(404).json({ message: "Post not found" })
    }

    const comment = {
      user: req.user.id,
      text: req.body.text
    }

    post.comments.push(comment)

    await post.save()

    res.json(post.comments)

  } catch (error) {
    res.status(500).json(error.message)
  }

}

// DELETE COMMENT
exports.deleteComment = async (req, res) => {

  try {

    const post = await Post.findById(req.params.postId)

    const comment = post.comments.id(req.params.commentId)

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" })
    }

    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" })
    }

    comment.deleteOne()

    await post.save()

    res.json({ message: "Comment removed" })

  } catch (error) {
    res.status(500).json(error.message)
  }

}