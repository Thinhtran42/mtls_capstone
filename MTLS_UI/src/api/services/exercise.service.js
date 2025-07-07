import { baseApi } from '../generated/baseApi'

// Tạo service wrapper cho Exercise
export const exerciseService = {
    // Lấy tất cả bài tập
    getAllExercises: async() => {
        try {
            const response = await baseApi.instance.get('/exercises')
            return response.data
        } catch (error) {
            console.error('Lỗi khi lấy danh sách bài tập:', error)
            throw error
        }
    },

    // Lấy chi tiết bài tập theo ID
    getExerciseById: async(exerciseId) => {
        try {

            if (!exerciseId) {
                console.error(
                    'exercise.service: Invalid exerciseId provided:',
                    exerciseId
                )
                throw new Error('ExerciseID is required')
            }

            // Cố gắng lấy tất cả exercises trước, vì có thể backend không hỗ trợ lấy theo ID
            const response = await baseApi.instance.get('/exercises')

            // Xử lý cấu trúc dữ liệu - tìm exercise theo ID
            let exerciseData = null

            if (response && response.data) {

                // Kiểm tra cấu trúc data.exercises[array]
                if (
                    response.data.data &&
                    response.data.data.exercises &&
                    Array.isArray(response.data.data.exercises)
                ) {
                    const exercises = response.data.data.exercises
                    exerciseData = exercises.find((ex) => ex._id === exerciseId)
                }
                // Kiểm tra cấu trúc data[array]
                else if (response.data.data && Array.isArray(response.data.data)) {
                    const exercises = response.data.data
                    exerciseData = exercises.find((ex) => ex._id === exerciseId)
                }
                // Kiểm tra cấu trúc exercises[array]
                else if (
                    response.data.exercises &&
                    Array.isArray(response.data.exercises)
                ) {
                    const exercises = response.data.exercises
                    exerciseData = exercises.find((ex) => ex._id === exerciseId)
                }
            }


            if (!exerciseData) {
                console.error('exercise.service: Exercise not found in the response')
                return { data: null, error: 'Exercise not found' }
            }

            return { data: exerciseData }
        } catch (error) {
            console.error(
                `exercise.service: Error when fetching exercise ID ${exerciseId}:`,
                error
            )

            if (error.response) {
                console.error(
                    'exercise.service: Error response status:',
                    error.response.status
                )
                console.error(
                    'exercise.service: Error response data:',
                    error.response.data
                )
            }

            throw error
        }
    },

    // Lấy bài tập theo section
    getExercisesBySection: async(sectionId) => {
        try {
            const response = await baseApi.instance.get(
                `/exercises/section/${sectionId}`
            )
            return response.data
        } catch (error) {
            console.error(`Lỗi khi lấy bài tập của section ID ${sectionId}:`, error)
            throw error
        }
    },

    // Tạo bài tập mới
    createExercise: async(exerciseData) => {
        try {

            // Trực tiếp trả về đối tượng response để xử lý linh hoạt hơn
            const response = await baseApi.instance.post('/exercises', exerciseData)


            // Kiểm tra cấu trúc phản hồi
            if (response && response.data) {
                console.log('Exercise response data:', response.data)
                return response.data
            } else if (response && response.statusText === 'Created') {
                // Trong trường hợp API trả về 201 nhưng không có data
                console.log('Exercise created but no data returned')
                return response
            } else {
                console.log('Unexpected response structure:', response)
                return response // Trả về bất kỳ cái gì nhận được
            }
        } catch (error) {
            console.error('Lỗi khi tạo bài tập mới:', error)
            if (error.response) {
                console.error('Error response:', error.response)
                console.error('Error data:', error.response.data)
            }
            throw error
        }
    },

    // Cập nhật bài tập
    updateExercise: async(exerciseId, exerciseData) => {
        try {
            const response = await baseApi.instance.put(
                `/exercises/${exerciseId}`,
                exerciseData
            )
            return response.data
        } catch (error) {
            console.error(`Lỗi khi cập nhật bài tập ID ${exerciseId}:`, error)
            throw error
        }
    },

    // Lấy trạng thái làm bài exercise của học viên
    getExerciseStatus: async(studentId, exerciseId) => {
        try {
            // Kiểm tra tham số
            if (!studentId || !exerciseId) {
                console.error('Missing studentId or exerciseId for getExerciseStatus');
                return {
                    started: false,
                    completed: false,
                    error: 'Missing required parameters'
                };
            }

            // Gọi API status
            const response = await baseApi.doExercises.doExerciseControllerGetStudentExerciseStatus(studentId, exerciseId);

            // Kiểm tra và trả về dữ liệu
            if (response && response.data) {
                return {
                    started: response.data.started || false,
                    completed: response.data.completed || false
                };
            }

            return { started: false, completed: false };
        } catch (error) {
            console.error(`Lỗi khi lấy trạng thái exercise - studentId: ${studentId}, exerciseId: ${exerciseId}:`, error);
            return {
                started: false,
                completed: false,
                error: error.message || 'Error fetching exercise status'
            };
        }
    },

    // Xóa bài tập
    deleteExercise: async(exerciseId) => {
        try {
            const response = await baseApi.instance.delete(`/exercises/${exerciseId}`)
            return response.data
        } catch (error) {
            console.error(`Lỗi khi xóa bài tập ID ${exerciseId}:`, error)
            throw error
        }
    },

    // Lấy bài tập theo section
    getExerciseBySectionId: async(sectionId) => {
        try {
            // Đảm bảo sectionId là chuỗi
            const id = typeof sectionId === 'object' ? sectionId._id : sectionId

            // Gọi API baseApi để lấy exercise theo section
            const response =
                await baseApi.exercises.exerciseControllerFindBySectionId(id)

            return response.data
        } catch (error) {
            console.error(
                `exercise.service: Lỗi khi lấy bài tập theo section ID ${sectionId}:`,
                error
            )
            throw error
        }
    },

    // Lấy doExercise dựa trên ID học sinh và ID bài exercise
    getDoExerciseByStudentAndExerciseId: async(studentId, exerciseId) => {
        try {
            // Gọi trực tiếp API để lấy doExercise theo studentId và exerciseId
            const response =
                await baseApi.doExercises.doExerciseControllerFindByStudentIdAndExerciseId(
                    studentId,
                    exerciseId
                )

            const doExerciseData = response && response.data

            // Nếu doExerciseData là một mảng, lấy phần tử mới nhất
            if (Array.isArray(doExerciseData) && doExerciseData.length > 0) {
                // Sắp xếp theo thời gian tạo (mới nhất trước)
                const sortedExercises = [...doExerciseData].sort(
                    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                )
                return {
                    data: sortedExercises[0],
                    allAttempts: sortedExercises,
                }
            }
            // Nếu doExerciseData là một đối tượng đơn lẻ
            else if (doExerciseData && !Array.isArray(doExerciseData)) {
                return {
                    data: doExerciseData,
                    allAttempts: [doExerciseData],
                }
            }
            // Không tìm thấy dữ liệu
            else {
                return null
            }
        } catch (error) {
            console.error(
                `Lỗi khi tìm doExercise của học sinh ${studentId} và exercise ${exerciseId}:`,
                error
            )
            throw error
        }
    },

    // Lấy chi tiết một bài exercise đã làm
    getExerciseSubmissionDetails: async(doExerciseId) => {
        try {
            // Lấy thông tin bài làm
            const submissionResponse = await baseApi.doExercises.doExerciseControllerFindOne(doExerciseId);

            // Lấy các câu trả lời
            const answersResponse = await baseApi.submitAnswers.submitAnswerControllerFindByDoExerciseId(doExerciseId);

            // Kết hợp thông tin
            return {
                submission: submissionResponse.data,
                answers: answersResponse.data
            };
        } catch (error) {
            console.error(`Lỗi khi lấy chi tiết bài làm exercise ID ${doExerciseId}:`, error);
            throw error;
        }
    },

    // Lấy danh sách câu hỏi và câu trả lời đã được xáo trộn của một exercise
    getShuffledQuestionsForExercise: async(exerciseId, shuffleQuestions = true, shuffleOptions = true) => {
        try {
            if (!exerciseId) {
                throw new Error('Exercise ID là bắt buộc');
            }

            console.log(`Fetching shuffled questions for exercise ${exerciseId}, shuffleQuestions=${shuffleQuestions}, shuffleOptions=${shuffleOptions}`);
            
            // Gọi API endpoint mới để lấy câu hỏi đã xáo trộn
            const response = await baseApi.instance.get(
                `/do-exercises/shuffle-questions/${exerciseId}?shuffleQuestions=${shuffleQuestions}&shuffleOptions=${shuffleOptions}`
            );
            
            // Kiểm tra và trả về dữ liệu
            if (response && response.data && response.data.data) {
                console.log(`Retrieved ${response.data.data.count} shuffled questions`);
                return response.data.data;
            }
            
            return { questions: [], count: 0 };
        } catch (error) {
            console.error(`Lỗi khi lấy câu hỏi đã xáo trộn cho exercise ID ${exerciseId}:`, error);
            throw error;
        }
    },
}