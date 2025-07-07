import { baseApi } from '../generated/baseApi';

// Tạo service wrapper cho Quiz
export const quizService = {
    // Lấy tất cả quiz
    getAllQuizzes: async() => {
        try {
            const response = await baseApi.quizzes.quizControllerFindAll();
            return response.data;
        } catch (error) {
            console.error('Lỗi khi lấy danh sách quiz:', error);
            throw error;
        }
    },

    // Lấy chi tiết quiz theo ID
    getQuizById: async(quizId) => {
        try {
            console.log('quiz.service: Fetching quiz with ID:', quizId, 'type:', typeof quizId);

            // Kiểm tra và xử lý quizId
            if (!quizId) {
                console.error('quiz.service: Invalid quizId (undefined/null)');
                throw new Error('QuizID is required');
            }

            // Xử lý trường hợp quizId là object
            let processedId = quizId;
            if (typeof quizId === 'object' && quizId !== null) {
                if (quizId._id) {
                    processedId = quizId._id;
                    console.log('quiz.service: Extracted _id from quizId object:', processedId);
                } else {
                    console.error('quiz.service: quizId is an object without _id property:', quizId);
                    throw new Error('Invalid quizId format: object without _id');
                }
            }

            // Đảm bảo quizId là string
            processedId = String(processedId);
            console.log('quiz.service: Final processed quizId:', processedId);

            console.log('quiz.service: Making API call to endpoint with ID:', processedId);
            const response = await baseApi.quizzes.quizControllerFindOne(processedId);
            console.log('quiz.service: API response received');

            // Lấy dữ liệu quiz
            const quizData = response.data;
            console.log('quiz.service: Quiz data received:', quizData ? 'success' : 'null/undefined');

            // Nếu quiz có questions array nhưng không có dữ liệu chi tiết câu hỏi
            if (quizData && quizData.questions && quizData.questions.length > 0 &&
                typeof quizData.questions[0] === 'string') {
                try {
                    console.log('quiz.service: Fetching question details for quiz');
                    // Import questionService để lấy danh sách câu hỏi
                    const { questionService } = await
                    import ('./question.service');
                    const questionsResponse = await questionService.getQuestionsByQuizId(processedId);

                    if (questionsResponse && questionsResponse.questions) {
                        console.log('quiz.service: Question details fetched successfully:', questionsResponse.questions.length, 'questions');
                        // Gán dữ liệu câu hỏi chi tiết vào quiz
                        quizData.questionDetails = questionsResponse.questions;
                    }
                } catch (questionError) {
                    console.error('quiz.service: Error fetching question details:', questionError);
                }
            }

            return quizData;
        } catch (error) {
            console.error(`quiz.service: Error when fetching quiz ID ${quizId}:`, error);

            if (error.response) {
                console.error('quiz.service: Error response status:', error.response.status);
                console.error('quiz.service: Error response data:', error.response.data);
            }

            throw error;
        }
    },

    // Tìm quiz theo section ID
    getQuizBySectionId: async(sectionId) => {
        try {
            // Đảm bảo sectionId là chuỗi
            const id = typeof sectionId === 'object' ? sectionId._id : sectionId;


            // SỬA LỖI: Sử dụng trực tiếp Axios để gọi API thay vì dùng baseApi.quizzes
            // Điều này đảm bảo chúng ta gọi đúng endpoint cho quiz
            const response = await baseApi.instance.get(`/quizzes/section/${id}`);

            // Kiểm tra xem response có phải là exercise không
            const responseData = response.data;
            const firstItemId = Array.isArray(responseData) && responseData.length > 0 ?
                responseData[0]._id :
                (responseData.data && Array.isArray(responseData.data) && responseData.data.length > 0 ?
                    responseData.data[0]._id :
                    null);

            if (firstItemId && String(firstItemId).startsWith('67e70c')) {
                // Cố gắng gọi đúng API quiz một lần nữa
                const correctResponse = await baseApi.instance.get(`/quizzes/section/${id}`);
                return correctResponse;
            }

            // Trả về đúng cấu trúc dữ liệu ban đầu
            return response;
        } catch (error) {
            console.error(`Lỗi khi lấy quiz theo section ID ${sectionId}:`, error);

            // Nếu lỗi 404, trả về một đối tượng trống thay vì throw lỗi
            if (error.response && error.response.status === 404) {
                console.log('Không tìm thấy quiz cho section này (404), trả về dữ liệu trống');
                return { data: [] };
            }

            // Với các lỗi khác, vẫn trả về đối tượng trống nhưng ghi log lỗi
            console.warn('Trả về dữ liệu trống do lỗi khi gọi API');
            return { data: [] };
        }
    },

    // Tạo quiz mới
    createQuiz: async(quizData) => {
        try {
            // Kiểm tra dữ liệu đầu vào
            if (!quizData.section) {
                throw new Error('Section ID là bắt buộc');
            }

            if (!quizData.title || !quizData.description) {
                throw new Error('Title và description là bắt buộc');
            }

            if (typeof quizData.duration !== 'number' || quizData.duration <= 0) {
                throw new Error('Duration phải là số dương');
            }

            // Đảm bảo dữ liệu được gửi đúng định dạng
            const requestData = {
                section: quizData.section,
                title: quizData.title,
                description: quizData.description,
                duration: quizData.duration
            };

            const response = await baseApi.quizzes.quizControllerCreate(requestData);
            return response;
        } catch (error) {
            console.error('Chi tiết lỗi khi tạo quiz mới:', error);

            if (error.response) {
                // Phản hồi từ server với mã lỗi
                console.error('Phản hồi lỗi từ server:', error.response.status, error.response.data);
            } else if (error.request) {
                // Không nhận được phản hồi từ server
                console.error('Không nhận được phản hồi từ request:', error.request);
            } else {
                // Lỗi khác
                console.error('Lỗi khi thiết lập request:', error.message);
            }

            throw error;
        }
    },

    // Cập nhật quiz
    updateQuiz: async(quizId, quizData) => {
        try {
            const response = await baseApi.quizzes.quizControllerUpdate(quizId, quizData);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi cập nhật quiz ID ${quizId}:`, error);
            throw error;
        }
    },

    // Xóa quiz
    deleteQuiz: async(quizId) => {
        try {
            const response = await baseApi.quizzes.quizControllerRemove(quizId);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi xóa quiz ID ${quizId}:`, error);
            throw error;
        }
    },

    // Gửi câu trả lời quiz
    submitQuizAnswer: async(submitData) => {
        try {
            const response = await baseApi.submitAnswers.submitAnswerControllerCreate(submitData);
            return response.data;
        } catch (error) {
            console.error('Lỗi khi gửi câu trả lời quiz:', error);
            throw error;
        }
    },

    // Lấy tất cả câu trả lời của một bài quiz
    getAnswersByDoQuizId: async(doQuizId) => {
        try {
            const response = await baseApi.submitAnswers.submitAnswerControllerGetByDoQuizId(doQuizId);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi lấy câu trả lời của quiz ID ${doQuizId}:`, error);
            throw error;
        }
    },

    // Lấy số câu đúng và cập nhật điểm
    calculateQuizScore: async(doQuizId) => {
        try {
            const response = await baseApi.submitAnswers.submitAnswerControllerGetCorrectOptionCountAndUpdateScore(doQuizId);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi tính điểm quiz ID ${doQuizId}:`, error);
            throw error;
        }
    },

    // Lấy danh sách bài quiz đã làm của một học sinh
    getStudentQuizHistory: async(studentId) => {
        try {
            const response = await baseApi.doQuizzes.doQuizControllerFindAll({
                student: studentId
            });
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi lấy lịch sử làm quiz của học sinh ID ${studentId}:`, error);
            throw error;
        }
    },

    // Lấy doQuiz dựa trên ID học sinh và ID bài quiz
    getDoQuizByStudentAndQuizId: async(studentId, quizId) => {
        try {
            console.log(`Fetching doQuiz for student ${studentId} and quiz ${quizId}`);
            
            const response = await baseApi.doQuizzes.doQuizControllerFindByStudentIdAndQuizId(studentId, quizId);
            
            return response?.data ? response : { data: null };
        } catch (error) {
            console.warn(`Error fetching doQuiz: ${error.message}`);
            
            // Nếu là lỗi 404, không coi là lỗi nghiêm trọng - học sinh chưa làm bài
            if (error.response && error.response.status === 404) {
                return { data: null, status: 'not_found' };
            }
            
            // Các lỗi khác thì throw
            throw error;
        }
    },

    // Lấy chi tiết một bài quiz đã làm
    getQuizSubmissionDetails: async(doQuizId) => {
        try {
            // Lấy thông tin bài làm
            const submissionResponse = await baseApi.doQuizzes.doQuizControllerFindOne(doQuizId);

            // Lấy các câu trả lời
            const answersResponse = await baseApi.submitAnswers.submitAnswerControllerGetByDoQuizId(doQuizId);

            // Kết hợp thông tin
            return {
                submission: submissionResponse.data,
                answers: answersResponse.data
            };
        } catch (error) {
            console.error(`Lỗi khi lấy chi tiết bài làm quiz ID ${doQuizId}:`, error);
            throw error;
        }
    },

    // Lấy thống kê điểm quiz của học sinh
    getStudentQuizStatistics: async(studentId) => {
        try {
            const response = await baseApi.doQuizzes.doQuizControllerFindAll({
                student: studentId
            });

            // Tính toán thống kê
            const quizzes = response.data || [];
            const statistics = {
                total: quizzes.length,
                averageScore: 0,
                highestScore: 0,
                lowestScore: 100,
                recentSubmissions: quizzes.slice(0, 5) // 5 bài gần nhất
            };

            if (quizzes.length > 0) {
                const totalScore = quizzes.reduce((sum, quiz) => sum + (quiz.score || 0), 0);
                statistics.averageScore = totalScore / quizzes.length;
                statistics.highestScore = Math.max(...quizzes.map(quiz => quiz.score || 0));
                statistics.lowestScore = Math.min(...quizzes.map(quiz => quiz.score || 0));
            }

            return statistics;
        } catch (error) {
            console.error(`Lỗi khi lấy thống kê quiz của học sinh ID ${studentId}:`, error);
            throw error;
        }
    },

    // Lấy trạng thái làm bài quiz của học viên
    getQuizStatus: async(studentId, quizId) => {
        try {
            // Kiểm tra tham số
            if (!studentId || !quizId) {
                console.error('Missing studentId or quizId for getQuizStatus');
                return {
                    started: false,
                    completed: false,
                    error: 'Missing required parameters'
                };
            }

            // Gọi API status
            const response = await baseApi.doQuizzes.doQuizControllerGetStudentQuizStatus(studentId, quizId);

            // Kiểm tra và trả về dữ liệu
            if (response && response.data) {
                return {
                    started: response.data.started || false,
                    completed: response.data.completed || false
                };
            }

            return { started: false, completed: false };
        } catch (error) {
            return {
                started: false,
                completed: false,
                error: error.message || 'Error fetching quiz status'
            };
        }
    },

    // Lấy quiz theo sectionId
    getQuizzesBySection: async(sectionId) => {
        try {

            // Đảm bảo sectionId là chuỗi
            const id = typeof sectionId === 'object' ? sectionId._id : sectionId;

            // Sử dụng endpoint chuyên biệt để lấy quiz theo section ID
            const response = await baseApi.quizzes.quizControllerFindBySectionId(id);


            // Kiểm tra cấu trúc dữ liệu phản hồi
            let quizzes = [];
            let count = 0;

            if (response && response.data) {
                if (response.data.quizzes && Array.isArray(response.data.quizzes)) {
                    quizzes = response.data.quizzes;
                    count = response.data.count;
                } else if (Array.isArray(response.data)) {
                    quizzes = response.data;
                    count = response.data.length;
                } else if (response.data.data && response.data.data.quizzes) {
                    quizzes = response.data.data.quizzes;
                    count = response.data.data.count || quizzes.length;
                } else if (typeof response.data === 'object' && !Array.isArray(response.data)) {
                    // Trường hợp API trả về một đối tượng quiz duy nhất
                    quizzes = [response.data];
                    count = 1;
                }
            }

            return {
                data: quizzes,
                count: count
            };
        } catch (error) {
            console.error(`Lỗi khi lấy quizzes của section ID ${sectionId}:`, error);
            return {
                data: [],
                count: 0
            };
        }
    },

    // Cập nhật danh sách câu hỏi của quiz
    updateQuizQuestions: async(quizId, questionIds) => {
        try {
            if (!quizId) {
                throw new Error('Quiz ID là bắt buộc');
            }

            if (!Array.isArray(questionIds)) {
                throw new Error('questionIds phải là một mảng');
            }

            // Gọi API để cập nhật danh sách câu hỏi
            const response = await baseApi.post(
                `/quizzes/${quizId}/questions`, { questionIds }
            );

            return response.data;
        } catch (error) {
            console.error(`Lỗi khi cập nhật câu hỏi cho quiz ID ${quizId}:`, error);
            throw error;
        }
    },

    // Lấy danh sách câu hỏi và câu trả lời đã được xáo trộn của một quiz
    getShuffledQuestionsForQuiz: async(quizId, shuffleQuestions = true, shuffleOptions = true) => {
        try {
            if (!quizId) {
                throw new Error('Quiz ID là bắt buộc');
            }

            console.log(`Fetching shuffled questions for quiz ${quizId}, shuffleQuestions=${shuffleQuestions}, shuffleOptions=${shuffleOptions}`);
            
            // Gọi API endpoint mới để lấy câu hỏi đã xáo trộn
            const response = await baseApi.instance.get(
                `/do-quizzes/shuffle-questions/${quizId}?shuffleQuestions=${shuffleQuestions}&shuffleOptions=${shuffleOptions}`
            );
            
            // Kiểm tra và trả về dữ liệu
            if (response && response.data && response.data.data) {
                console.log(`Retrieved ${response.data.data.count} shuffled questions`);
                return response.data.data;
            }
            
            return { questions: [], count: 0 };
        } catch (error) {
            console.error(`Lỗi khi lấy câu hỏi đã xáo trộn cho quiz ID ${quizId}:`, error);
            throw error;
        }
    },
};

// Định nghĩa exerciseService đã được chuyển sang file exercises.service.js
// Không định nghĩa lại ở đây để tránh xung đột