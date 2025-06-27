const Course = require('../models/courses');
const Video = require('../models/videos');
const { multipleMongooseToObject } = require('../../util/mongoose');
const { mongooseToObject } = require('../../util/mongoose');

// Chuyển từ mm:ss sang giây
function parseDuration(durationStr) {
  const [min, sec] = durationStr.split(':').map(Number);
  return (min || 0) * 60 + (sec || 0);
}

// Chuyển link video ytb về định dạng của iframe
function convertToEmbed(url) {
  const match = url.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
}

// Chuyển từ giây về mm:ss
function formatDuration(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}:${sec < 10 ? '0' + sec : sec}`;
}


class CourseController {
    // Render tất cả khóa học và video
    getAllCourses(req, res) {
        Promise.all([
            Course.find({}),
            Video.find({})])
        .then(([courses, videos]) => {
            res.render('me/course', {
                courses: multipleMongooseToObject(courses),
                videos: multipleMongooseToObject(videos)
            });
        })
        .catch(err => {
            console.error('Error fetching courses or videos:', err);
            res.status(500).send('Internal Server Error');
        });
    }

    // Vào trang tạo khóa học
    createCourseForm(req, res) {
        res.render('me/create-course');
    }

    // Tạo khóa học
    storeCourseForm(req, res) {
        const courseData = req.body;
        // Here you would typically save the courseData to a database
        // For now, we'll just log it to the console
        const course = new Course(courseData);
        course.save()
        .then(() => {
            res.redirect('/course/me');
        })
        .catch(err => {
            if (err.code === 11000) {
                // Trùng khóa unique (tên khóa học)
                return res.status(400).send('Tên khóa học đã tồn tại, vui lòng chọn tên khác.');
            }

            console.error('Error saving course:', err);
            res.status(500).send('Đã xảy ra lỗi khi lưu khóa học.');
        });
    }

    // Render the form to create a new video course
    createVideoCourse(req, res) {
        // Render the form to create a new video course
        Course.find({})
        .then(courses => {
            res.render('me/create-video', {
                courses: multipleMongooseToObject(courses)
            });
        })
        .catch(err => {
            console.error('Error fetching courses:', err);
            res.status(500).send('Internal Server Error');
        });
    }

    // Quản lý các video
    async manageVideos(req, res) {
        try {
            const slug = req.query.slug;

            const course = await Course.findOne({ slug });
            if (!course) return res.status(404).send('Không tìm thấy khóa học');

            const videos = await Video.find({ courseId: course._id }).sort({ order: 1 });

            res.render('me/course-videos', {
            course: course.toObject(),
            videos: videos.map(v => ({
                ...v.toObject(),
                durationFormatted: formatDuration(v.duration || 0)
            }))
            });
        } catch (err) {
            console.error('Lỗi khi load video quản lý:', err);
            res.status(500).send('Internal Server Error');
        }
    }

    // Thêm Video
    async storeVideoCourse(req, res) {
        const videoData = req.body;
        const durationSeconds  = parseDuration(videoData.duration);
        const videoUrl = convertToEmbed(videoData.videoUrl);
        const course = await Course.findOne({ slug: videoData.courseId});
        if (!course) {
            return res.status(400).send('Khóa học không tồn tại');
        }
        const video = new Video({
            ...videoData,
            duration: durationSeconds,
            videoUrl: videoUrl,
            courseId: course._id
        });
        await video.save()
        .then(() => {
            res.redirect(`/course/manage-videos?slug=${course.slug}`);
        })
        .catch(err => {
            console.error('Error saving video course:', err);
            res.status(500).send('Internal Server Error');
        });
    }

    // Render ra trang cập nhật khóa học
    updateCourseForm(req, res) {
        Course.findOne({slug: req.params.slug})
        .then(course => {
            res.render('me/update', {
                course: mongooseToObject(course)
            })
        })
        .catch(err => {
            console.error('Lỗi xảy ra khi lấy chi tiết khóa học:', err);
            res.status(500).send('Internal Server Error');
        })
    }

    // Cập nhật khóa học
    async updateCourse(req, res){
        try {
            await Course.updateOne({ _id: req.params.id}, req.body);
            res.redirect('/course/me');
        }
        catch (error) {
        if (error.code === 11000) {
                const course = await Course.findById(req.params.id);
                return res.render('me/update', {
                    course: course.toObject(),
                    error: 'Tên khóa học đã tồn tại!'
                });
            }
        }
    }

    // Xóa khóa học
    deleteCourse(req, res, next){
        Course.deleteOne({slug: req.params.slug})
        .then(() => res.redirect('/course/me'))
        .catch(error => next(error))
    }

    // Render ra trang cập nhật video
    updateVideoCourseForm(req, res) {
        Promise.all([Course.find({}), 
            Video.findById(req.params.id).populate('courseId')
        ])
        .then(([courses, video]) => {
            const formattedVideo = {
            ...video.toObject(),
            durationFormatted: formatDuration(video.duration || 0)
            };
            res.render('me/update-video', {
                courses: multipleMongooseToObject(courses),
                video: formattedVideo
            })
        })
        .catch(error => console.log(error))
    }

    // Cập nhật video
    async updateVideo(req, res, next){
        const videoData = req.body;
        const course = await Course.findById(videoData.courseId);
        if (!course) {
            return res.status(404).send('Course not found');
        }
        try {
            if (req.body.duration) {
            req.body.duration = parseDuration(req.body.duration);
        }
            await Video.updateOne({ _id: req.params.id}, req.body);
            res.redirect(`/course/manage-videos?slug=${course.slug}`);
        }
        catch(error){
            next(error)
        }
    }

    // Xóa video
    async deleteVideo(req, res, next) {
        try {
            const videoData = req.body;

            // Lấy thông tin khóa học
            const course = await Course.findById(videoData.courseId);
            if (!course) {
                return res.status(404).send('Không tìm thấy khóa học.');
            }

            // Xóa video
            await Video.deleteOne({ _id: req.params.id });

            // Chuyển hướng sau khi xóa
            res.redirect(`/course/manage-videos?slug=${course.slug}`);
        } catch (error) {
            next(error);
        }
    }

}

module.exports = new CourseController();