import { baseApi } from '../generated/baseApi';

// Create service wrapper for Rating
export const ratingService = {
    // Get all ratings
    getAllRatings: async() => {
        try {
            const response = await baseApi.ratings.ratingControllerFindAll();
            console.log('getAllRatings response:', response);
            return response.data;
        } catch (error) {
            console.error('Error fetching all ratings:', error);
            throw error;
        }
    },

    // Get rating by ID
    getRatingById: async(ratingId) => {
        try {
            if (!ratingId) {
                throw new Error('Rating ID is required');
            }

            const response = await baseApi.ratings.ratingControllerFindOne(ratingId);
            console.log('getRatingById response:', response);
            return response.data;
        } catch (error) {
            console.error(`Error fetching rating with ID ${ratingId}:`, error);
            throw error;
        }
    },

    // Create new rating
    createRating: async(ratingData) => {
        try {
            if (!ratingData || !ratingData.course || !ratingData.stars) {
                throw new Error('Course ID and stars rating are required');
            }

            // Make sure stars is between 1-5
            if (ratingData.stars < 1 || ratingData.stars > 5) {
                throw new Error('Stars rating must be between 1 and 5');
            }

            // Make sure student ID is included
            const fullRatingData = {
                ...ratingData,
                student: ratingData.student || localStorage.getItem('userId')
            };

            const response = await baseApi.ratings.ratingControllerCreate(fullRatingData);
            console.log('createRating response:', response);
            return response.data;
        } catch (error) {
            console.error('Error creating rating:', error);
            throw error;
        }
    },

    // Update rating
    updateRating: async(ratingId, ratingData) => {
        try {
            if (!ratingId) {
                throw new Error('Rating ID is required');
            }

            // Make sure stars is between 1-5 if provided
            if (ratingData.stars && (ratingData.stars < 1 || ratingData.stars > 5)) {
                throw new Error('Stars rating must be between 1 and 5');
            }

            const response = await baseApi.ratings.ratingControllerUpdate(ratingId, ratingData);
            console.log('updateRating response:', response);
            return response.data;
        } catch (error) {
            console.error(`Error updating rating ID ${ratingId}:`, error);
            throw error;
        }
    },

    // Delete rating
    deleteRating: async(ratingId) => {
        try {
            if (!ratingId) {
                throw new Error('Rating ID is required');
            }

            const response = await baseApi.ratings.ratingControllerRemove(ratingId);
            console.log('deleteRating response:', response);
            return response.data;
        } catch (error) {
            console.error(`Error deleting rating ID ${ratingId}:`, error);
            throw error;
        }
    },

    // Get current student's ratings
    getMyRatings: async() => {
        try {
            const response = await baseApi.ratings.ratingControllerFindMyRatings();
            console.log('getMyRatings response:', response);
            return response.data;
        } catch (error) {
            console.error('Error fetching my ratings:', error);
            throw error;
        }
    },

    // Get stats for a course's ratings
    getCourseRatingStats: async(courseId) => {
        try {
            if (!courseId) {
                throw new Error('Course ID is required');
            }

            const response = await baseApi.ratings.ratingControllerGetCourseRatingStats(courseId);
            console.log('getCourseRatingStats response:', response);
            return response.data;
        } catch (error) {
            console.error(`Error fetching rating stats for course ID ${courseId}:`, error);
            throw error;
        }
    },

    // Get ratings for a specific student and course
    getRatingByStudentAndCourse: async(studentId, courseId) => {
        try {
            if (!studentId || !courseId) {
                throw new Error('Student ID and Course ID are required');
            }

            const response = await baseApi.ratings.ratingControllerFindByStudentAndCourse(studentId, courseId);
            console.log('getRatingByStudentAndCourse response:', response);
            return response.data;
        } catch (error) {
            console.error(`Error fetching rating for student ${studentId} and course ${courseId}:`, error);
            throw error;
        }
    },

    // Get all ratings by student
    getRatingsByStudent: async(studentId) => {
        try {
            if (!studentId) {
                throw new Error('Student ID is required');
            }

            const response = await baseApi.ratings.ratingControllerFindByStudent(studentId);
            console.log('getRatingsByStudent response:', response);
            return response.data;
        } catch (error) {
            console.error(`Error fetching ratings for student ${studentId}:`, error);
            throw error;
        }
    },

    // Get all ratings for a course
    getRatingsByCourse: async(courseId) => {
        try {
            if (!courseId) {
                throw new Error('Course ID is required');
            }

            const response = await baseApi.ratings.ratingControllerFindByCourse(courseId);
            console.log('getRatingsByCourse response:', response);
            return response.data;
        } catch (error) {
            console.error(`Error fetching ratings for course ${courseId}:`, error);
            throw error;
        }
    }
};