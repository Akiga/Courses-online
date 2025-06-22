const Comment = require('../models/comments');
class commentController{
    
    async add(req, res){
        const { content, videoId } = req.body;
        const userId = req.session.account._id;

        try {
            const comment = await Comment.create({ content, videoId, userId });
            const populated = await comment.populate('userId', 'fullname');
            res.json({ success: true, comment: populated });
        } catch (err) {
            console.error('Lỗi khi thêm bình luận:', err);
            res.status(500).json({ success: false });
        }
    }

    async view(req, res){
        try {
            const comments = await Comment.find({ videoId: req.params.videoId })
              .populate('userId', 'fullname')
              .sort({ createdAt: 1 });
            res.json(comments);
        } catch (err) {
            res.status(500).json([]);
        }
    }

}

module.exports = new commentController()