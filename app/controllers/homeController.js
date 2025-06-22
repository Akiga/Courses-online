const Course = require('../models/courses');
const Video = require('../models/videos');
const Enrollment = require('../models/enrollments');
const User = require('../models/users')
const { multipleMongooseToObject } = require('../../util/mongoose');
const { mongooseToObject } = require('../../util/mongoose');

function formatDuration(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}:${sec < 10 ? '0' + sec : sec}`;
}

class HomeController {
    index(req, res) {
        const query = req.query.q || '';
        const searchCondition = query
            ? { name: { $regex: query, $options: 'i' } } // tìm không phân biệt hoa thường
            : {};
        Course.find({status: 'open', ...searchCondition})
        .then(courses => {
            res.render('pages/home', {
                courses: multipleMongooseToObject(courses)
            });
        })
        .catch(err => {
            console.error('Lỗi xảy ra khi lấy khóa học:', err);
            res.status(500).send('Internal Server Error');
        });

    }


    async detail(req, res) {
        try {
            const course = await Course.findOne({ slug: req.params.slug });
            if (!course) {
            return res.status(404).send('Course not found');
            }

            // Lấy danh sách video và số lượng
            const [videoCount, videos] = await Promise.all([
            Video.countDocuments({ courseId: course._id }),
            Video.find({ courseId: course._id }).sort({ order: 1 })
            ]);

            // Format duration
            const videosFormatted = videos.map(v => {
            const plain = v.toObject();
            return {
                ...plain,
                durationFormatted: formatDuration(plain.duration || 0)
            };
            });

            // Kiểm tra đã mua chưa
            let purchased = false;
            const user = req.session.account;
            if (user) {
            const enrollment = await Enrollment.findOne({
                userId: user._id,
                courseSlug: course.slug
            });
            purchased = !!enrollment;
            }

            // Truyền sang view
            res.render('pages/course', {
            course: {
                ...mongooseToObject(course),
                purchased
            },
            videoCount,
            videos: videosFormatted
            });

        } catch (err) {
            console.error('Lỗi xảy ra khi lấy chi tiết khóa học:', err);
            res.status(500).send('Internal Server Error');
        }
        }


    async courseVideo(req, res) {
        const { slug, index } = req.params;

        try {
            const course = await Course.findOne({ slug });
            const videos = await Video.find({ courseId: course._id }).sort({ order: 1 });
            const i = parseInt(index);

            if (!course || isNaN(i) || i < 0 || i >= videos.length) {
            return res.status(404).send('Video không tồn tại');
            }

            const rawVideos = videos.map(v => mongooseToObject(v));
            const videosFormatted = rawVideos.map(v => ({
            ...v,
            durationFormatted: formatDuration(v.duration || 0)
            }));


            const video = videos[i];

            res.render('pages/course-video', {
            course: mongooseToObject(course),
            video,
            videos: videosFormatted,
            index: i
            });
        } catch (err) {
            res.status(500).send('Internal Server Error');
        }
    }

    async buyCourse(req, res, next){
        const slug = req.params.slug;
        const user = req.session.account;
    
        if (!user) {
        return res.status(401).send('Vui lòng đăng nhập để mua khóa học');
        }
    
        try {
        // Tìm khóa học theo slug
        const course = await Course.findOne({ slug });
        if (!course) {
            return res.status(404).send('Không tìm thấy khóa học');
        }
    
        // Kiểm tra đã mua chưa
        const enrolled = await Enrollment.findOne({ userId: user._id, courseId: course._id });
        if (enrolled) {
            return res.redirect(`/home/${course.slug}/videos/0`);
        }
    
        // Chưa mua thì tạo mới
        await Enrollment.create({ userId: user._id, courseId: course._id, courseSlug: course.slug });
    
        return res.redirect(`/home/${course.slug}/videos/0`);
        } catch (err) {
        console.error('Lỗi mua khóa học:', err);
        next(err);
        }
    }

    async infor(req, res, next){
        try{
            const user = req.session.account;
            // Tìm tất cả khóa học đã mua
            const enrollments = await Enrollment.find({ userId: user._id });

            const slugs = enrollments.map(enr => enr.courseSlug);

            // Lấy danh sách khóa học theo slug
            const courses = await Course.find({ slug: { $in: slugs } });

            res.render('pages/infor', {
                user,
                courses: courses.map(course => course.toObject())
            });
        }catch (err) {
        console.error('Lỗi lấy thông tin cá nhân:', err);
        res.status(500).send('Lỗi máy chủ');
        }
    }
}

module.exports = new HomeController();