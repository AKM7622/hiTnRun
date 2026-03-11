const User = require("../models/User")

// FOLLOW USER
exports.followUser = async (req, res) => {

  try {

    const userToFollow = await User.findById(req.params.id)
    const currentUser = await User.findById(req.user.id)

    if (!userToFollow) {
      return res.status(404).json({ message: "User not found" })
    }

    if (currentUser.following.includes(userToFollow._id)) {
      return res.status(400).json({ message: "Already following" })
    }

    currentUser.following.push(userToFollow._id)
    userToFollow.followers.push(currentUser._id)

    await currentUser.save()
    await userToFollow.save()

    res.json({ message: "User followed" })

  } catch (error) {
    res.status(500).json(error.message)
  }

}

// UNFOLLOW USER
exports.unfollowUser = async (req, res) => {

  try {

    const userToUnfollow = await User.findById(req.params.id)
    const currentUser = await User.findById(req.user.id)

    currentUser.following.pull(userToUnfollow._id)
    userToUnfollow.followers.pull(currentUser._id)

    await currentUser.save()
    await userToUnfollow.save()

    res.json({ message: "User unfollowed" })

  } catch (error) {
    res.status(500).json(error.message)
  }

}