import { baseApi } from '../generated/baseApi';

// Service xử lý các câu hỏi (questions)
export const questionService = {
    // Lấy tất cả câu hỏi
    getAllQuestions: async() => {
        try {
            const response = await baseApi.questions.questionControllerFindAll();
            return response.data;
        } catch (error) {
            console.error('Lỗi khi lấy danh sách câu hỏi:', error);
            throw error;
        }
    },

    // Lấy chi tiết câu hỏi theo ID
    getQuestionById: async(questionId) => {
        try {
            const response = await baseApi.questions.questionControllerFindOne(questionId);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi lấy câu hỏi ID ${questionId}:`, error);
            throw error;
        }
    },

    // Lấy câu hỏi theo quiz ID
    getQuestionsByQuizId: async(quizId) => {
        try {
            console.log(`Đang gọi API lấy câu hỏi cho quiz ID: ${quizId}`);

            // Đảm bảo quizId là một chuỗi hợp lệ
            if (!quizId) {
                console.error('quizId không hợp lệ:', quizId);
                throw new Error('Quiz ID không hợp lệ');
            }

            // Format quizId nếu cần
            const id = typeof quizId === 'object' ? quizId._id : String(quizId);
            console.log(`Quiz ID đã xử lý: ${id}`);

            // Gọi API để lấy câu hỏi theo quizId - sử dụng endpoint mới 
            const response = await baseApi.questions.questionControllerFindByQuizId(id);
            console.log(`Kết quả API câu hỏi:`, response);

            // Xử lý dữ liệu trả về
            let questions = [];
            let count = 0;

            if (response.data && response.data.questions && Array.isArray(response.data.questions)) {
                questions = response.data.questions;
                count = response.data.count || questions.length;
            } else if (Array.isArray(response.data)) {
                questions = response.data;
                count = questions.length;
            } else if (response.data) {
                questions = [response.data]; // Trường hợp chỉ có 1 câu hỏi
                count = 1;
            }

            console.log(`Đã xử lý ${questions.length} câu hỏi`);

            return {
                data: questions,
                count: count
            };
        } catch (error) {
            console.error(`Lỗi khi lấy câu hỏi theo quiz ID ${quizId}:`, error);
            return { data: [], count: 0 };
        }
    },

    // Lấy câu hỏi theo exercise ID
    getQuestionsByExerciseId: async(exerciseId) => {
        try {
            console.log(`Đang gọi API lấy câu hỏi cho exercise ID: ${exerciseId}`);

            // Đảm bảo exerciseId là một chuỗi hợp lệ
            if (!exerciseId) {
                console.error('exerciseId không hợp lệ:', exerciseId);
                throw new Error('Exercise ID không hợp lệ');
            }

            // Format exerciseId nếu cần
            const id = typeof exerciseId === 'object' ? exerciseId._id : String(exerciseId);

            // Gọi API để lấy câu hỏi theo exerciseId
            const response = await baseApi.questions.questionControllerFindByExerciseId(id);
            console.log(`Kết quả API câu hỏi theo exercise:`, response);

            // Xử lý dữ liệu trả về
            let questions = [];
            let count = 0;

            if (response.data && response.data.questions && Array.isArray(response.data.questions)) {
                questions = response.data.questions;
                count = response.data.count || questions.length;
            } else if (Array.isArray(response.data)) {
                questions = response.data;
                count = questions.length;
            }

            return {
                data: questions,
                count: count
            };
        } catch (error) {
            console.error(`Lỗi khi lấy câu hỏi theo exercise ID ${exerciseId}:`, error);
            return { data: [], count: 0 };
        }
    },

    // Tạo câu hỏi mới
    createQuestion: async(questionData) => {
        try {
            const response = await baseApi.questions.questionControllerCreate(questionData);
            return response.data;
        } catch (error) {
            console.error('Lỗi khi tạo câu hỏi mới:', error);
            throw error;
        }
    },

    // Tạo nhiều câu hỏi cùng lúc
    createMultipleQuestions: async(questionsData) => {
        try {
            const response = await baseApi.questions.questionControllerCreateMultiple({
                questions: questionsData
            });
            return response.data;
        } catch (error) {
            console.error('Lỗi khi tạo nhiều câu hỏi cùng lúc:', error);
            throw error;
        }
    },

    // Cập nhật câu hỏi
    updateQuestion: async(questionId, questionData) => {
        try {
            const response = await baseApi.questions.questionControllerUpdate(questionId, questionData);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi cập nhật câu hỏi ID ${questionId}:`, error);
            throw error;
        }
    },

    // Xóa câu hỏi
    deleteQuestion: async(questionId) => {
        try {
            const response = await baseApi.questions.questionControllerRemove(questionId);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi xóa câu hỏi ID ${questionId}:`, error);
            throw error;
        }
    },

    // Alias cho getQuestionsByExerciseId để tương thích ngược
    getQuestionsByExercise: async(exerciseId) => {
        console.log('Using getQuestionsByExercise alias for getQuestionsByExerciseId');
        return questionService.getQuestionsByExerciseId(exerciseId);
    }
};

export default questionService;