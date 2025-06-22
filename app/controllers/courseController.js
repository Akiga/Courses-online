const Course = require('../models/courses');
const Video = require('../models/videos');
const { multipleMongooseToObject } = require('../../util/mongoose');
const { mongooseToObject } = require('../../util/mongoose');

function parseDuration(durationStr) {
  const [min, sec] = durationStr.split(':').map(Number);
  return (min || 0) * 60 + (sec || 0);
}

function convertToEmbed(url) {
  const match = url.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
}

function formatDuration(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}:${sec < 10 ? '0' + sec : sec}`;
}


class CourseController {
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

    createCourseForm(req, res) {
        res.render('me/create-course');
    }

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
            console.error('Error saving course:', err);
            res.status(500).send('Internal Server Error');
        })    
    }

    createVideoCourse(req, res) {
        // Render the form to create a new video course
        // This would typically include fields for the video title, URL, etc.
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
            res.redirect('/course/me');
        })
        .catch(err => {
            console.error('Error saving video course:', err);
            res.status(500).send('Internal Server Error');
        });
    }

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

    async updateCourse(req, res, next){
        try {
            await Course.updateOne({ _id: req.params.id}, req.body);
            res.redirect('/course/me');
        }
        catch(error){
            next(error)
        }
    }

    deleteCourse(req, res, next){
        Course.deleteOne({slug: req.params.slug})
        .then(() => res.redirect('/course/me'))
        .catch(error => next(error))
    }

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

    async updateVideo(req, res, next){
        try {
            if (req.body.duration) {
            req.body.duration = parseDuration(req.body.duration);
        }
            await Video.updateOne({ _id: req.params.id}, req.body);
            res.redirect('/course/me');
        }
        catch(error){
            next(error)
        }
    }

    deleteVideo(req, res, next){
        Video.deleteOne({_id: req.params.id})
        .then(() => res.redirect('/course/me'))
        .catch((error) => next(error))
    }
}

module.exports = new CourseController();