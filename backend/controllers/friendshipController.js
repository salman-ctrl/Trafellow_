const Friendship = require('../models/Friendship');

exports.sendFriendRequest = async (req, res) => {
  try {
    const { friend_id } = req.body;
    const userId = req.user.user_id;

    if (userId === parseInt(friend_id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Tidak bisa menambahkan diri sendiri' 
      });
    }

    const existingRequest = await Friendship.findRequest(userId, friend_id);
    if (existingRequest) {
      return res.status(400).json({ 
        success: false, 
        message: 'Permintaan pertemanan sudah ada' 
      });
    }

    const friendshipId = await Friendship.sendRequest(userId, friend_id);

    res.status(201).json({
      success: true,
      message: 'Permintaan pertemanan berhasil dikirim',
      data: { friendship_id: friendshipId }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

exports.respondFriendRequest = async (req, res) => {
  try {
    const { friendship_id } = req.params;
    const { status } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Status tidak valid' 
      });
    }

    await Friendship.updateStatus(friendship_id, status);

    res.json({
      success: true,
      message: `Permintaan pertemanan ${status === 'accepted' ? 'diterima' : 'ditolak'}`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

exports.getFriends = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const friends = await Friendship.getFriendsByUserId(userId);

    res.json({
      success: true,
      data: friends
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

exports.getPendingRequests = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const requests = await Friendship.getPendingRequests(userId);

    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

exports.deleteFriendship = async (req, res) => {
  try {
    const { friendship_id } = req.params;

    await Friendship.delete(friendship_id);

    res.json({
      success: true,
      message: 'Pertemanan berhasil dihapus'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};