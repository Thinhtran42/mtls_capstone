/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface SignUpDto {
  /** @example "John Doe" */
  fullname: string;
  /** @example "johndoe@gmail.com" */
  email: string;
  /** @example "password123" */
  password: string;
  /** @example "0123456789" */
  phoneNumber: string;
  /**
   * User role
   * @default "student"
   * @example "student"
   */
  role: string;
}

export interface LoginDto {
  /**
   * User email
   * @example "johndoe@gmail.com"
   */
  email: string;
  /**
   * @minLength 6
   * @example "password123"
   */
  password: string;
}

export interface ForgotPasswordDto {
  /** User email for password reset */
  email: string;
}

export interface ResetPasswordDto {
  /**
   * Reset password token
   * @example "random_token_123"
   */
  token: string;
  /**
   * New password
   * @minLength 6
   */
  newPassword: string;
}

export interface CreateUserDto {
  /**
   * Full name of the user
   * @example "John Doe"
   */
  fullname: string;
  /**
   * User email
   * @example "johndoe@gmail.com"
   */
  email: string;
  /**
   * User password
   * @minLength 8
   * @example "password123"
   */
  password: string;
  /**
   * User phone number
   * @example "0123456789"
   */
  phoneNumber: string;
  /**
   * User role
   * @example "admin"
   */
  role: "admin" | "student" | "teacher";
  /**
   * Is the user active?
   * @default true
   */
  isActive: boolean;
  /**
   * Creation date
   * @format date-time
   */
  createAt: string;
  /**
   * Update date
   * @format date-time
   */
  updateAt: string;
}

export interface UpdateUserDto {
  /**
   * Full name of the user
   * @example "John Doe"
   */
  fullname?: string;
  /**
   * User email
   * @example "johndoe@example.com"
   */
  email?: string;
  /**
   * User phone number
   * @example "0123456789"
   */
  phoneNumber?: string;
  /**
   * User role
   * @example "admin"
   */
  role?: "admin" | "student" | "teacher";
  /** Is the user active? */
  isActive?: boolean;
  /**
   * Update date
   * @format date-time
   */
  updateAt?: string;
}

export interface CreateCourseDto {
  /**
   * Title of the course
   * @example "Music Theory Basics"
   */
  title: string;
  /**
   * Description of the course
   * @example "Learn the fundamentals of music theory"
   */
  description: string;
  /**
   * Image URL for the course
   * @example "https://example.com/course-image.jpg"
   */
  image: string;
  /**
   * Teacher ID (FK to User)
   * @example "507f1f77bcf86cd799439011"
   */
  teacher: string;
}

export interface UpdateCourseDto {
  /**
   * Title of the course
   * @example "Music Theory Basics"
   */
  title?: string;
  /**
   * Description of the course
   * @example "Learn the fundamentals of music theory"
   */
  description?: string;
  /**
   * Image URL for the course
   * @example "https://example.com/course-image.jpg"
   */
  image?: string;
  /**
   * Teacher ID (FK to User)
   * @example "507f1f77bcf86cd799439011"
   */
  teacher?: string;
}

export interface CreateEnrollmentDto {
  /** @example "507f1f77bcf86cd799439011" */
  student: string;
  /** @example "507f1f77bcf86cd799439012" */
  course: string;
  /** @example "active" */
  status: "active" | "completed" | "dropped";
  /**
   * Date when the student enrolled
   * @format date-time
   */
  enrolledAt: string;
}

export interface UpdateEnrollmentDto {
  /** @example "507f1f77bcf86cd799439011" */
  student?: string;
  /** @example "507f1f77bcf86cd799439012" */
  course?: string;
  /** @example "active" */
  status?: "active" | "completed" | "dropped";
  /**
   * Date when the student enrolled
   * @format date-time
   */
  enrolledAt?: string;
}

export interface CreateModuleDto {
  /** @example "507f1f77bcf86cd799439011" */
  course: string;
  /** @example "Introduction to Music Theory" */
  title: string;
  /** @example "Learn the basics of music theory" */
  description: string;
  /**
   * @default true
   * @example true
   */
  isActive: boolean;
}

export interface UpdateModuleDto {
  /** @example "507f1f77bcf86cd799439011" */
  course?: string;
  /** @example "Introduction to Music Theory" */
  title?: string;
  /** @example "Learn the basics of music theory" */
  description?: string;
  /**
   * @default true
   * @example true
   */
  isActive?: boolean;
}

export interface CreateSectionDto {
  /** @example "507f1f77bcf86cd799439011" */
  module: string;
  /** @example "Introduction to Music Notation" */
  title: string;
  /**
   * Type of section
   * @example "Lesson"
   */
  type: "Lesson" | "Quiz" | "Exercise" | "Assignment";
  /**
   * Duration in minutes
   * @example 30
   */
  duration: number;
  /**
   * Section is active or not
   * @default true
   * @example true
   */
  isActive: boolean;
}

export interface UpdateSectionDto {
  /** @example "507f1f77bcf86cd799439011" */
  module?: string;
  /** @example "Introduction to Music Notation" */
  title?: string;
  /**
   * Type of section
   * @example "Lesson"
   */
  type?: "Lesson" | "Quiz" | "Exercise" | "Assignment";
  /**
   * Duration in minutes
   * @example 30
   */
  duration?: number;
  /**
   * Section is active or not
   * @default true
   * @example true
   */
  isActive?: boolean;
}

export interface CreateLessonDto {
  /**
   * The ID of the section this lesson belongs to
   * @example "507f1f77bcf86cd799439011"
   */
  section: string;
  /**
   * The title of the lesson
   * @example "Introduction to Programming"
   */
  title: string;
  /**
   * The description of the lesson
   * @example "Learn the fundamentals of programming concepts"
   */
  description?: string;
  /**
   * The duration of the lesson in minutes
   * @example 45
   */
  duration: number;
}

export interface UpdateLessonDto {
  /**
   * The ID of the section this lesson belongs to
   * @example "507f1f77bcf86cd799439011"
   */
  section?: string;
  /**
   * The title of the lesson
   * @example "Introduction to Programming"
   */
  title?: string;
  /**
   * The description of the lesson
   * @example "Learn the fundamentals of programming concepts"
   */
  description?: string;
  /**
   * The duration of the lesson in minutes
   * @example 45
   */
  duration?: number;
}

export interface CreateQuizDto {
  /** @example "60d21b4667d0d8992e610c85" */
  section: string;
  /** @example "Music Theory Basics" */
  title: string;
  /** @example "A quiz to test your basic knowledge of music theory." */
  description: string;
  /** @example 30 */
  duration: number;
}

export interface UpdateQuizDto {
  /** @example "60d21b4667d0d8992e610c85" */
  section?: string;
  /** @example "Advanced Music Theory" */
  title?: string;
  /** @example "An advanced quiz to test your knowledge of music theory." */
  description?: string;
  /** @example 45 */
  duration?: number;
  /** @example ["60d21b4667d0d8992e610c85","60d21b4667d0d8992e610c86"] */
  questions?: string[];
}

export interface CreateQuestionDto {
  /**
   * ID của quiz
   * @example "60d21b4667d0d8992e610c85"
   */
  quiz: string;
  /**
   * ID của bài tập nếu câu hỏi thuộc bài tập
   * @example "60d21b4667d0d8992e610c88"
   */
  exercise?: string;
  /**
   * Nội dung câu hỏi
   * @example "What is the capital of France?"
   */
  questionText: string;
  /**
   * Trạng thái hoạt động của câu hỏi
   * @default true
   * @example true
   */
  isActive?: boolean;
  /**
   * Chuỗi notation để hiển thị khuông nhạc
   * @example "c/4/q, e/4/q, g/4/q"
   */
  notation?: string;
  /**
   * Loại câu hỏi
   * @default "multipleChoice"
   * @example "multipleChoice"
   */
  questionType?: "multipleChoice" | "vexFlow";
}

export interface UpdateQuestionDto {
  /**
   * ID của quiz
   * @example "60d21b4667d0d8992e610c85"
   */
  quiz?: string;
  /**
   * ID của bài tập nếu câu hỏi thuộc bài tập
   * @example "60d21b4667d0d8992e610c88"
   */
  exercise?: string;
  /**
   * Nội dung câu hỏi
   * @example "What is the capital of France?"
   */
  questionText?: string;
  /**
   * Trạng thái hoạt động của câu hỏi
   * @default true
   * @example true
   */
  isActive?: boolean;
  /**
   * Chuỗi notation để hiển thị khuông nhạc
   * @example "c/4/q, e/4/q, g/4/q"
   */
  notation?: string;
  /**
   * Loại câu hỏi
   * @default "multipleChoice"
   * @example "multipleChoice"
   */
  questionType?: "multipleChoice" | "vexFlow";
}

export interface CreateMultipleQuestionsDto {
  /**
   * Danh sách các câu hỏi cần tạo
   * @example [{"quiz":"60d21b4667d0d8992e610c85","questionText":"What is the relative minor of C major?","notation":"c/4/q, e/4/q, g/4/q"},{"exercise":"60d21b4667d0d8992e610c90","questionText":"What is the dominant of G major?","notation":"d/4/q, f#/4/q, a/4/q"}]
   */
  questions: CreateQuestionDto[];
}

export interface CreateOptionDto {
  /** @example "60d21b4667d0d8992e610c85" */
  question: string;
  /** @example "Option content here" */
  content: string;
  /** @example true */
  isCorrect: boolean;
  /**
   * Trạng thái hoạt động của tùy chọn
   * @default true
   * @example true
   */
  isActive?: boolean;
}

export interface UpdateOptionDto {
  /** @example "60d21b4667d0d8992e610c85" */
  question?: string;
  /** @example "Updated option content here" */
  content?: string;
  /** @example false */
  isCorrect?: boolean;
}

export interface CreateMultipleOptionsDto {
  /**
   * Danh sách các tùy chọn cần tạo
   * @example [{"question":"60d21b4667d0d8992e610c85","content":"A minor","isCorrect":true},{"question":"60d21b4667d0d8992e610c85","content":"B minor","isCorrect":false}]
   */
  options: CreateOptionDto[];
}

export interface CreateSubmitAnswerDto {
  /** @example "60d21b4667d0d8992e610c85" */
  question: string;
  /** @example "60d21b4667d0d8992e610c86" */
  option: string;
  /** @example "60d21b4667d0d8992e610c87" */
  doQuiz?: string;
  /** @example "60d21b4667d0d8992e610c88" */
  doExercise?: string;
  /** @example "quiz" */
  submitType: string;
}

export interface CreateMultipleSubmitAnswersDto {
  /** Danh sách các câu trả lời cần submit */
  submitAnswers: CreateSubmitAnswerDto[];
}

export interface UpdateMultipleSubmitAnswersDto {
  /** ID của bài làm quiz */
  doQuiz: string;
  /** ID của bài làm exercise */
  doExercise: string;
  /** Danh sách các câu trả lời cần submit */
  submitAnswers: CreateSubmitAnswerDto[];
}

export interface UpdateSubmitAnswerDto {
  /** @example "60d21b4667d0d8992e610c85" */
  question?: string;
  /** @example "60d21b4667d0d8992e610c86" */
  option?: string;
  /** @example "60d21b4667d0d8992e610c87" */
  doQuiz?: string;
  /** @example "60d21b4667d0d8992e610c88" */
  doExercise?: string;
  /** @example "exercise" */
  submitType?: string;
}

export interface CreateExerciseDto {
  /** @example "60d21b4667d0d8992e610c85" */
  section: string;
  /** @example "Music Theory Exercise" */
  title: string;
  /** @example "An exercise to practice music theory." */
  description: string;
  /** @example 45 */
  duration: number;
}

export interface UpdateExerciseDto {
  /** @example "60d21b4667d0d8992e610c85" */
  section?: string;
  /** @example "Advanced Music Theory Exercise" */
  title?: string;
  /** @example "An advanced exercise to practice music theory." */
  description?: string;
  /** @example 60 */
  duration?: number;
}

export interface CreateDoQuizDto {
  /** @example "60d21b4667d0d8992e610c86" */
  quiz: string;
  /** @example 85 */
  score: number;
}

export interface UpdateDoQuizDto {
  /** @example "60d21b4667d0d8992e610c85" */
  student?: string;
  /** @example "60d21b4667d0d8992e610c86" */
  quiz?: string;
  /** @example 90 */
  score?: number;
  /**
   * Trạng thái của bài làm quiz
   * @example true
   */
  status?: boolean;
}

export interface CreateDoExerciseDto {
  /**
   * ID của bài tập
   * @example "60d21b4667d0d8992e610c86"
   */
  exercise: string;
  /**
   * Điểm số
   * @default 0
   * @example 85
   */
  score: number;
}

export interface UpdateDoExerciseDto {
  /**
   * ID của học viên
   * @example "60d21b4667d0d8992e610c85"
   */
  student?: string;
  /**
   * ID của bài tập
   * @example "60d21b4667d0d8992e610c86"
   */
  exercise?: string;
  /**
   * Điểm số
   * @example 90
   */
  score?: number;
  /**
   * Trạng thái của bài làm exercise
   * @example true
   */
  status?: boolean;
}

export interface CreateContentDto {
  /**
   * The ID of the lesson this content belongs to
   * @example "507f1f77bcf86cd799439011"
   */
  lesson: string;
  /**
   * The type of content
   * @example "Video"
   */
  type: "Video" | "Reading" | "Image";
  /**
   * The content data (URL for video, text for reading)
   * @example "https://example.com/video.mp4"
   */
  data: string;
  /**
   * The caption of the content
   * @example "This is a caption"
   */
  caption: string;
}

export interface UpdateContentDto {
  /**
   * The ID of the lesson this content belongs to
   * @example "507f1f77bcf86cd799439011"
   */
  lesson?: string;
  /**
   * The type of content
   * @example "Video"
   */
  type?: "Video" | "Reading" | "Image";
  /**
   * The content data (URL for video, text for reading)
   * @example "https://example.com/video.mp4"
   */
  data?: string;
  /**
   * The caption of the content
   * @example "This is a caption"
   */
  caption?: string;
}

export interface CreateMultipleContentsDto {
  /**
   * Danh sách các nội dung cần tạo
   * @example [{"lesson":"60d21b4667d0d8992e610c85","type":"text","data":"Âm nhạc là một hình thức nghệ thuật..."},{"lesson":"60d21b4667d0d8992e610c85","type":"video","data":"https://example.com/video.mp4"}]
   */
  contents: CreateContentDto[];
}

export interface CreateAssignmentDto {
  /**
   * ID của section mà assignment thuộc về
   * @example "6507d6f6c31c7948c831a123"
   */
  section: string;
  /**
   * Tiêu đề của assignment
   * @example "Bài tập về nhà: Lập trình hướng đối tượng"
   */
  title: string;
  /**
   * Nội dung câu hỏi của assignment
   * @example "Hãy viết một chương trình minh họa tính kế thừa trong OOP"
   */
  questionText?: string;
  /**
   * Mô tả chi tiết về assignment
   * @example "Bài tập này giúp sinh viên hiểu rõ hơn về tính kế thừa trong lập trình hướng đối tượng"
   */
  description?: string;
  /**
   * URL của file đính kèm (nếu có)
   * @example "https://example.com/files/assignment1.pdf"
   */
  fileUrl?: string;
  /**
   * Thời gian làm bài (tính bằng phút)
   * @default 0
   * @example 60
   */
  duration?: number;
}

export interface UpdateAssignmentDto {
  /**
   * ID của section mà assignment thuộc về
   * @example "6507d6f6c31c7948c831a123"
   */
  section?: string;
  /**
   * Tiêu đề của assignment
   * @example "Bài tập về nhà: Lập trình hướng đối tượng (Cập nhật)"
   */
  title?: string;
  /**
   * Nội dung câu hỏi của assignment
   * @example "Hãy viết một chương trình minh họa tính kế thừa và đa hình trong OOP"
   */
  questionText?: string;
  /**
   * Mô tả chi tiết về assignment
   * @example "Bài tập này giúp sinh viên hiểu rõ hơn về tính kế thừa và đa hình trong lập trình hướng đối tượng"
   */
  description?: string;
  /**
   * URL của file đính kèm (nếu có)
   * @example "https://example.com/files/assignment1_updated.pdf"
   */
  fileUrl?: string;
  /**
   * Thời gian làm bài (tính bằng phút)
   * @example 90
   */
  duration?: number;
}

export interface CreateDoAssignmentDto {
  /**
   * ID của assignment
   * @example "6507d6f6c31c7948c831a456"
   */
  assignment: string;
  /**
   * ID của học viên làm assignment
   * @example "6507d6f6c31c7948c831b789"
   */
  student: string;
  /**
   * Tiêu đề của bài làm
   * @example "Bài tập về nhà môn Hóa học"
   */
  title?: string;
  /**
   * Điểm số
   * @default 0
   * @example 85
   */
  score: number;
  /**
   * Mô tả chi tiết của bài làm
   * @example "Bài làm này gồm các phản ứng hóa học cơ bản và giải thích nguyên lý"
   */
  description?: string;
  /**
   * URL của bài nộp
   * @example "https://example.com/submissions/assignment1.pdf"
   */
  submissionUrl?: string;
}

export interface UpdateDoAssignmentDto {
  /**
   * ID của giáo viên chấm assignment
   * @example "6507d6f6c31c7948c831c123"
   */
  teacher?: string;
  /**
   * Điểm số (0-10)
   * @example 8.5
   */
  score?: number;
  /**
   * Nhận xét của giáo viên
   * @example "Bài làm tốt, cần cải thiện phần phân tích yêu cầu"
   */
  comment?: string;
  /**
   * URL của bài nộp
   * @example "https://example.com/submissions/assignment1_updated.pdf"
   */
  submissionUrl?: string;
  /**
   * Trạng thái đã chấm điểm
   * @example true
   */
  isGraded?: boolean;
  /**
   * Trạng thái của bài làm exercise
   * @example true
   */
  status?: boolean;
}

export interface UpdateStudentSubmissionDto {
  /**
   * Tiêu đề của bài làm
   * @example "Bài tập về nhà môn Hóa học (đã cập nhật)"
   */
  title?: string;
  /**
   * Mô tả chi tiết của bài làm
   * @example "Bài làm đã được cập nhật với các phản ứng hóa học mới"
   */
  description?: string;
  /**
   * URL của bài nộp
   * @example "https://example.com/submissions/assignment1_updated.pdf"
   */
  submissionUrl?: string;
  /**
   * Trạng thái của bài làm exercise
   * @example true
   */
  status?: boolean;
}

export interface CreateRatingDto {
  /**
   * ID của khóa học
   * @example "6507d6f6c31c7948c831a123"
   */
  course: string;
  /**
   * ID của khóa học
   * @example "6507d6f6c31c7948c831a123"
   */
  student: string;
  /**
   * Số sao đánh giá (1-5)
   * @min 1
   * @max 5
   * @example 4
   */
  stars: number;
  /**
   * Nhận xét về khóa học
   * @example "Khóa học rất hay và dễ hiểu"
   */
  comment?: string;
}

export interface UpdateRatingDto {
  /**
   * ID của khóa học
   * @example "6507d6f6c31c7948c831a123"
   */
  course?: string;
  /**
   * ID của khóa học
   * @example "6507d6f6c31c7948c831a123"
   */
  student?: string;
  /**
   * Số sao đánh giá (1-5)
   * @min 1
   * @max 5
   * @example 5
   */
  stars?: number;
  /**
   * Nhận xét về khóa học
   * @example "Khóa học rất hay và dễ hiểu"
   */
  comment?: string;
}

export interface CreateDiscussionDto {
  /**
   * ID của module
   * @example "60d21b4667d0d8992e610c85"
   */
  moduleId: string;
  /**
   * Nội dung thảo luận
   * @example "Tôi có thắc mắc về bài học này..."
   */
  content: string;
}

export interface UpdateDiscussionDto {
  /**
   * ID của module
   * @example "60d21b4667d0d8992e610c85"
   */
  moduleId?: string;
  /**
   * Nội dung thảo luận
   * @example "Tôi có thắc mắc về bài học này..."
   */
  content?: string;
}

export interface CreateDiscussionReplyDto {
  /**
   * ID của discussion
   * @example "60d21b4667d0d8992e610c85"
   */
  discussionId: string;
  /**
   * Nội dung phản hồi
   * @example "Đây là câu trả lời cho thắc mắc của bạn..."
   */
  content: string;
  /**
   * Trạng thái active của reply
   * @default true
   */
  isActive: boolean;
}

export interface UpdateDiscussionReplyDto {
  /**
   * ID của discussion
   * @example "60d21b4667d0d8992e610c85"
   */
  discussionId?: string;
  /**
   * Nội dung phản hồi
   * @example "Đây là câu trả lời cho thắc mắc của bạn..."
   */
  content?: string;
  /**
   * Trạng thái active của reply
   * @default true
   */
  isActive?: boolean;
}

export interface CreateNoteDto {
  /**
   * ID của module mà note thuộc về
   * @example "6507d6f6c31c7948c831a123"
   */
  module: string;
  /**
   * ID của học viên (sẽ được lấy từ token)
   * @example "6507d6f6c31c7948c831b789"
   */
  student?: string;
  /**
   * Nội dung ghi chú
   * @example "Cần nhớ về các dấu chấm nhịp trong âm nhạc"
   */
  content: string;
}

export interface UpdateNoteDto {
  /**
   * Nội dung ghi chú
   * @example "Cập nhật: Cần nhớ về các dấu chấm nhịp và dấu lặng trong âm nhạc"
   */
  content?: string;
}

export interface CreateLessonProgressDto {
  /**
   * ID của bài học
   * @example "60d21b4667d0d8992e610c86"
   */
  lesson: string;
  /**
   * Trạng thái hoàn thành bài học
   * @default false
   * @example false
   */
  status: boolean;
  /**
   * Thời gian đánh dấu tiến độ
   * @format date-time
   */
  markAt?: string;
}

export interface UpdateLessonProgressDto {
  /**
   * Trạng thái hoàn thành bài học
   * @example true
   */
  status?: boolean;
  /**
   * Thời gian đánh dấu tiến độ
   * @format date-time
   */
  markAt?: string;
}

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, HeadersDefaults, ResponseType } from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<FullRequestParams, "body" | "method" | "query" | "path">;

export interface ApiConfig<SecurityDataType = unknown> extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({ securityWorker, secure, format, ...axiosConfig }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({ ...axiosConfig, baseURL: axiosConfig.baseURL || "" });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(params1: AxiosRequestConfig, params2?: AxiosRequestConfig): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method && this.instance.defaults.headers[method.toLowerCase() as keyof HeadersDefaults]) || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] = property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(key, isFileType ? formItem : this.stringifyFormItem(formItem));
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (type === ContentType.FormData && body && body !== null && typeof body === "object") {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (type === ContentType.Text && body && body !== null && typeof body !== "string") {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title API Documentation
 * @version 1.0
 * @contact
 *
 * The API's MTLS description
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags App
   * @name AppControllerGetHello
   * @request GET:/
   */
  appControllerGetHello = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/`,
      method: "GET",
      ...params,
    });

  auth = {
    /**
     * No description
     *
     * @tags Auth
     * @name AuthControllerSignup
     * @summary Đăng ký tài khoản mới
     * @request POST:/auth/signup
     */
    authControllerSignup: (data: SignUpDto, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/auth/signup`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Auth
     * @name AuthControllerLogin
     * @summary Đăng nhập hệ thống
     * @request POST:/auth/login
     */
    authControllerLogin: (data: LoginDto, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/auth/login`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Auth
     * @name AuthControllerVerifyGoogleToken
     * @summary Xác thực token Google và đăng nhập
     * @request POST:/auth/verify-google-token
     */
    authControllerVerifyGoogleToken: (
      data: {
        /** Firebase ID Token */
        idToken?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, void>({
        path: `/auth/verify-google-token`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Auth
     * @name AuthControllerGoogleAuthRedirect
     * @request POST:/auth/google/callback
     */
    authControllerGoogleAuthRedirect: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/auth/google/callback`,
        method: "POST",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Auth
     * @name AuthControllerForgotPassword
     * @summary Yêu cầu khôi phục mật khẩu
     * @request POST:/auth/forgot-password
     */
    authControllerForgotPassword: (data: ForgotPasswordDto, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/auth/forgot-password`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Auth
     * @name AuthControllerResetPassword
     * @summary Đặt lại mật khẩu
     * @request POST:/auth/reset-password
     */
    authControllerResetPassword: (data: ResetPasswordDto, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/auth/reset-password`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),
  };
  users = {
    /**
     * No description
     *
     * @tags Users
     * @name UsersControllerCreate
     * @summary Tạo người dùng mới
     * @request POST:/users
     */
    usersControllerCreate: (data: CreateUserDto, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/users`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name UsersControllerFindAll
     * @summary Lấy danh sách tất cả người dùng
     * @request GET:/users
     */
    usersControllerFindAll: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/users`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name UsersControllerFindById
     * @summary Lấy thông tin người dùng theo ID
     * @request GET:/users/{id}
     */
    usersControllerFindById: (id: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/users/${id}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name UsersControllerUpdate
     * @summary Cập nhật thông tin người dùng
     * @request PUT:/users/{id}
     */
    usersControllerUpdate: (id: string, data: UpdateUserDto, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/users/${id}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name UsersControllerRemove
     * @summary Xóa người dùng
     * @request DELETE:/users/{id}
     */
    usersControllerRemove: (id: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/users/${id}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name UsersControllerFindByEmail
     * @summary Lấy thông tin người dùng theo email
     * @request GET:/users/email/{email}
     */
    usersControllerFindByEmail: (email: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/users/email/${email}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name UsersControllerFindAllTeachers
     * @summary Lấy danh sách tất cả giáo viên
     * @request GET:/users/role/teachers
     */
    usersControllerFindAllTeachers: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/users/role/teachers`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name UsersControllerFindAllStudents
     * @summary Lấy danh sách tất cả học viên
     * @request GET:/users/role/students
     */
    usersControllerFindAllStudents: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/users/role/students`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name UsersControllerFindAllLockedUsers
     * @summary Get all locked users
     * @request GET:/users/locked
     */
    usersControllerFindAllLockedUsers: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/users/locked`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name UsersControllerUnlockUser
     * @summary Unlock a user account
     * @request PATCH:/users/{id}/unlock
     */
    usersControllerUnlockUser: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/users/${id}/unlock`,
        method: "PATCH",
        ...params,
      }),
  };
  courses = {
    /**
     * No description
     *
     * @tags courses
     * @name CourseControllerCreate
     * @summary Create a new course
     * @request POST:/courses
     * @secure
     */
    courseControllerCreate: (data: CreateCourseDto, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/courses`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags courses
     * @name CourseControllerFindAll
     * @summary Get all courses
     * @request GET:/courses
     */
    courseControllerFindAll: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/courses`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags courses
     * @name CourseControllerFindById
     * @summary Get a course by ID
     * @request GET:/courses/{id}
     */
    courseControllerFindById: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/courses/${id}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags courses
     * @name CourseControllerUpdate
     * @summary Update a course
     * @request PUT:/courses/{id}
     */
    courseControllerUpdate: (id: string, data: UpdateCourseDto, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/courses/${id}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags courses
     * @name CourseControllerRemove
     * @summary Delete a course
     * @request DELETE:/courses/{id}
     */
    courseControllerRemove: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/courses/${id}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags courses
     * @name CourseControllerFindByTeacherId
     * @summary Get courses by teacher ID
     * @request GET:/courses/teacher/{teacherId}
     */
    courseControllerFindByTeacherId: (teacherId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/courses/teacher/${teacherId}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags courses
     * @name CourseControllerGetCourseWithProgress
     * @summary Lấy chi tiết khóa học kèm tiến trình của học sinh
     * @request GET:/courses/{courseId}/{studentId}/progress
     */
    courseControllerGetCourseWithProgress: (courseId: string, studentId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/courses/${courseId}/${studentId}/progress`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags courses
     * @name CourseControllerGetCourseWithStructure
     * @summary Lấy chi tiết khóa học
     * @request GET:/courses/{courseId}/structure
     */
    courseControllerGetCourseWithStructure: (courseId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/courses/${courseId}/structure`,
        method: "GET",
        ...params,
      }),
  };
  enrollments = {
    /**
     * No description
     *
     * @tags enrollments
     * @name EnrollmentControllerCreate
     * @summary Create a new enrollment
     * @request POST:/enrollments
     * @secure
     */
    enrollmentControllerCreate: (data: CreateEnrollmentDto, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/enrollments`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags enrollments
     * @name EnrollmentControllerFindAll
     * @summary Lấy danh sách tất cả đăng ký
     * @request GET:/enrollments
     */
    enrollmentControllerFindAll: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/enrollments`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags enrollments
     * @name EnrollmentControllerFindById
     * @summary Lấy thông tin đăng ký theo ID
     * @request GET:/enrollments/{id}
     */
    enrollmentControllerFindById: (id: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/enrollments/${id}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags enrollments
     * @name EnrollmentControllerUpdate
     * @summary Cập nhật thông tin đăng ký
     * @request PUT:/enrollments/{id}
     */
    enrollmentControllerUpdate: (id: string, data: UpdateEnrollmentDto, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/enrollments/${id}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags enrollments
     * @name EnrollmentControllerRemove
     * @summary Hủy đăng ký khóa học
     * @request DELETE:/enrollments/{id}
     */
    enrollmentControllerRemove: (id: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/enrollments/${id}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags enrollments
     * @name EnrollmentControllerFindByStudentId
     * @summary Lấy danh sách đăng ký theo học viên
     * @request GET:/enrollments/student/{studentId}
     */
    enrollmentControllerFindByStudentId: (studentId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/enrollments/student/${studentId}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags enrollments
     * @name EnrollmentControllerFindByCourseId
     * @summary Lấy danh sách đăng ký theo khóa học
     * @request GET:/enrollments/course/{courseId}
     */
    enrollmentControllerFindByCourseId: (courseId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/enrollments/course/${courseId}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags enrollments
     * @name EnrollmentControllerFindByStudentAndCourse
     * @summary Kiểm tra đăng ký của học viên cho khóa học
     * @request GET:/enrollments/student/{studentId}/course/{courseId}
     */
    enrollmentControllerFindByStudentAndCourse: (studentId: string, courseId: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/enrollments/student/${studentId}/course/${courseId}`,
        method: "GET",
        ...params,
      }),
  };
  modules = {
    /**
     * No description
     *
     * @tags modules
     * @name ModuleControllerCreate
     * @summary Create a new module
     * @request POST:/modules
     */
    moduleControllerCreate: (data: CreateModuleDto, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/modules`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags modules
     * @name ModuleControllerFindAll
     * @summary Get all active modules
     * @request GET:/modules
     */
    moduleControllerFindAll: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/modules`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags modules
     * @name ModuleControllerFindById
     * @summary Get a module by ID
     * @request GET:/modules/{id}
     */
    moduleControllerFindById: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/modules/${id}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags modules
     * @name ModuleControllerUpdate
     * @summary Update a module
     * @request PUT:/modules/{id}
     */
    moduleControllerUpdate: (id: string, data: UpdateModuleDto, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/modules/${id}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags modules
     * @name ModuleControllerRemove
     * @summary Soft delete a module
     * @request DELETE:/modules/{id}
     */
    moduleControllerRemove: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/modules/${id}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags modules
     * @name ModuleControllerFindByCourseId
     * @summary Get modules by course ID
     * @request GET:/modules/course/{courseId}
     */
    moduleControllerFindByCourseId: (courseId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/modules/course/${courseId}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags modules
     * @name ModuleControllerUpdateStatus
     * @summary Update module status
     * @request PUT:/modules/{id}/status
     */
    moduleControllerUpdateStatus: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/modules/${id}/status`,
        method: "PUT",
        ...params,
      }),
  };
  sections = {
    /**
     * No description
     *
     * @tags sections
     * @name SectionControllerCreate
     * @summary Tạo section mới trong module học
     * @request POST:/sections
     */
    sectionControllerCreate: (data: CreateSectionDto, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/sections`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags sections
     * @name SectionControllerFindAll
     * @summary Lấy danh sách tất cả section
     * @request GET:/sections
     */
    sectionControllerFindAll: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/sections`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags sections
     * @name SectionControllerFindById
     * @summary Lấy thông tin section theo ID
     * @request GET:/sections/{id}
     */
    sectionControllerFindById: (id: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/sections/${id}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags sections
     * @name SectionControllerUpdate
     * @summary Cập nhật section
     * @request PUT:/sections/{id}
     */
    sectionControllerUpdate: (id: string, data: UpdateSectionDto, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/sections/${id}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags sections
     * @name SectionControllerRemove
     * @summary Xóa section
     * @request DELETE:/sections/{id}
     */
    sectionControllerRemove: (id: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/sections/${id}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags sections
     * @name SectionControllerFindByModuleId
     * @summary Lấy danh sách section theo module
     * @request GET:/sections/module/{moduleId}
     */
    sectionControllerFindByModuleId: (moduleId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/sections/module/${moduleId}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags sections
     * @name SectionControllerFindByType
     * @summary Lấy danh sách section theo loại
     * @request GET:/sections/type/{type}
     */
    sectionControllerFindByType: (type: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/sections/type/${type}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags sections
     * @name SectionControllerUpdateStatus
     * @summary Cập nhật trạng thái section
     * @request PUT:/sections/{id}/status
     */
    sectionControllerUpdateStatus: (
      id: string,
      data: {
        isActive?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/sections/${id}/status`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags sections
     * @name SectionControllerAddLessonToSection
     * @summary Thêm bài học vào section
     * @request POST:/sections/{id}/lessons
     */
    sectionControllerAddLessonToSection: (id: string, data: CreateLessonDto, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/sections/${id}/lessons`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),
  };
  lessons = {
    /**
     * No description
     *
     * @tags lessons
     * @name LessonControllerCreate
     * @summary Tạo bài học mới
     * @request POST:/lessons
     */
    lessonControllerCreate: (data: CreateLessonDto, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/lessons`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags lessons
     * @name LessonControllerFindAll
     * @summary Lấy danh sách tất cả bài học
     * @request GET:/lessons
     */
    lessonControllerFindAll: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/lessons`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags lessons
     * @name LessonControllerFindOne
     * @summary Lấy thông tin bài học theo ID
     * @request GET:/lessons/{id}
     */
    lessonControllerFindOne: (id: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/lessons/${id}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags lessons
     * @name LessonControllerUpdate
     * @summary Cập nhật bài học
     * @request PUT:/lessons/{id}
     */
    lessonControllerUpdate: (id: string, data: UpdateLessonDto, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/lessons/${id}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags lessons
     * @name LessonControllerRemove
     * @summary Xóa bài học
     * @request DELETE:/lessons/{id}
     */
    lessonControllerRemove: (id: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/lessons/${id}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags lessons
     * @name LessonControllerFindBySection
     * @summary Lấy danh sách bài học theo section
     * @request GET:/lessons/section/{sectionId}
     */
    lessonControllerFindBySection: (sectionId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/lessons/section/${sectionId}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags lessons
     * @name LessonControllerAddLessonToSection
     * @summary Thêm bài học vào section
     * @request POST:/lessons/section/{sectionId}
     */
    lessonControllerAddLessonToSection: (sectionId: string, data: CreateLessonDto, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/lessons/section/${sectionId}`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),
  };
  quizzes = {
    /**
     * No description
     *
     * @tags quizzes
     * @name QuizControllerCreate
     * @summary Tạo bài kiểm tra mới
     * @request POST:/quizzes
     */
    quizControllerCreate: (data: CreateQuizDto, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/quizzes`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags quizzes
     * @name QuizControllerFindAll
     * @summary Lấy danh sách tất cả quiz
     * @request GET:/quizzes
     */
    quizControllerFindAll: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/quizzes`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags quizzes
     * @name QuizControllerFindOne
     * @summary Lấy thông tin bài kiểm tra theo ID
     * @request GET:/quizzes/{id}
     */
    quizControllerFindOne: (id: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/quizzes/${id}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags quizzes
     * @name QuizControllerUpdate
     * @summary Cập nhật bài kiểm tra
     * @request PUT:/quizzes/{id}
     */
    quizControllerUpdate: (id: string, data: UpdateQuizDto, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/quizzes/${id}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags quizzes
     * @name QuizControllerRemove
     * @summary Xóa bài kiểm tra
     * @request DELETE:/quizzes/{id}
     */
    quizControllerRemove: (id: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/quizzes/${id}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags quizzes
     * @name QuizControllerFindBySectionId
     * @summary Lấy danh sách bài kiểm tra theo ID của section
     * @request GET:/quizzes/section/{id}
     */
    quizControllerFindBySectionId: (id: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/quizzes/section/${id}`,
        method: "GET",
        ...params,
      }),
  };
  questions = {
    /**
     * No description
     *
     * @tags questions
     * @name QuestionControllerCreate
     * @summary Tạo câu hỏi mới
     * @request POST:/questions
     */
    questionControllerCreate: (data: CreateQuestionDto, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/questions`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags questions
     * @name QuestionControllerFindAll
     * @summary Lấy danh sách tất cả câu hỏi
     * @request GET:/questions
     */
    questionControllerFindAll: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/questions`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags questions
     * @name QuestionControllerFindOne
     * @summary Lấy thông tin câu hỏi theo ID
     * @request GET:/questions/{id}
     */
    questionControllerFindOne: (id: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/questions/${id}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags questions
     * @name QuestionControllerUpdate
     * @summary Cập nhật câu hỏi
     * @request PUT:/questions/{id}
     */
    questionControllerUpdate: (id: string, data: UpdateQuestionDto, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/questions/${id}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags questions
     * @name QuestionControllerRemove
     * @summary Xóa câu hỏi
     * @request DELETE:/questions/{id}
     */
    questionControllerRemove: (id: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/questions/${id}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags questions
     * @name QuestionControllerFindByQuizId
     * @summary Lấy danh sách câu hỏi theo ID của quiz
     * @request GET:/questions/quiz/{id}
     */
    questionControllerFindByQuizId: (id: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/questions/quiz/${id}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags questions
     * @name QuestionControllerFindByExerciseId
     * @summary Lấy danh sách câu hỏi theo ID của exercise
     * @request GET:/questions/exercise/{id}
     */
    questionControllerFindByExerciseId: (id: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/questions/exercise/${id}`,
        method: "GET",
        ...params,
      }),

    /**
     * @description Tạo nhiều câu hỏi thuộc quiz hoặc exercise cùng lúc
     *
     * @tags questions
     * @name QuestionControllerCreateMultiple
     * @summary Tạo nhiều câu hỏi cùng lúc
     * @request POST:/questions/batch
     */
    questionControllerCreateMultiple: (data: CreateMultipleQuestionsDto, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/questions/batch`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),
  };
  options = {
    /**
     * No description
     *
     * @tags options
     * @name OptionControllerCreate
     * @summary Tạo tùy chọn mới cho câu hỏi
     * @request POST:/options
     */
    optionControllerCreate: (data: CreateOptionDto, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/options`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags options
     * @name OptionControllerFindAll
     * @summary Lấy danh sách tất cả các tùy chọn
     * @request GET:/options
     */
    optionControllerFindAll: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/options`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags options
     * @name OptionControllerFindOne
     * @summary Lấy thông tin tùy chọn theo ID
     * @request GET:/options/{id}
     */
    optionControllerFindOne: (id: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/options/${id}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags options
     * @name OptionControllerUpdate
     * @summary Cập nhật tùy chọn
     * @request PUT:/options/{id}
     */
    optionControllerUpdate: (id: string, data: UpdateOptionDto, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/options/${id}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags options
     * @name OptionControllerRemove
     * @summary Xóa tùy chọn
     * @request DELETE:/options/{id}
     */
    optionControllerRemove: (id: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/options/${id}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags options
     * @name OptionControllerFindListOptionByQuestionId
     * @summary Lấy danh sách tùy chọn theo ID của câu hỏi
     * @request GET:/options/question/{id}
     */
    optionControllerFindListOptionByQuestionId: (id: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/options/question/${id}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags options
     * @name OptionControllerCreateMultiple
     * @summary Tạo nhiều tùy chọn cùng lúc
     * @request POST:/options/batch
     */
    optionControllerCreateMultiple: (data: CreateMultipleOptionsDto, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/options/batch`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),
  };
  submitAnswers = {
    /**
     * No description
     *
     * @tags submit-answers
     * @name SubmitAnswerControllerCreateMultiple
     * @summary Submit nhiều câu trả lời cùng lúc
     * @request POST:/submit-answers/multiple
     */
    submitAnswerControllerCreateMultiple: (data: CreateMultipleSubmitAnswersDto, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/submit-answers/multiple`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags submit-answers
     * @name SubmitAnswerControllerUpdateMultiple
     * @summary Cập nhật nhiều câu trả lời cùng lúc
     * @request PUT:/submit-answers/multiple
     */
    submitAnswerControllerUpdateMultiple: (data: UpdateMultipleSubmitAnswersDto, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/submit-answers/multiple`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags submit-answers
     * @name SubmitAnswerControllerGetByDoQuizId
     * @summary Lấy ra các câu trả lời của 1 bài quiz
     * @request GET:/submit-answers/do-quiz/{doQuizId}
     */
    submitAnswerControllerGetByDoQuizId: (doQuizId: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/submit-answers/do-quiz/${doQuizId}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags submit-answers
     * @name SubmitAnswerControllerGetCorrectOptionCountAndUpdateScore
     * @summary Đếm số câu đúng rồi cập nhật điểm cho bài quiz
     * @request GET:/submit-answers/do-quiz/{doQuizId}/correct-count
     */
    submitAnswerControllerGetCorrectOptionCountAndUpdateScore: (doQuizId: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/submit-answers/do-quiz/${doQuizId}/correct-count`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags submit-answers
     * @name SubmitAnswerControllerFindByDoExerciseId
     * @summary Lấy tất cả câu trả lời của một bài làm exercise
     * @request GET:/submit-answers/do-exercise/{doExerciseId}
     */
    submitAnswerControllerFindByDoExerciseId: (doExerciseId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/submit-answers/do-exercise/${doExerciseId}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags submit-answers
     * @name SubmitAnswerControllerCalculateExerciseScore
     * @summary Đếm số câu đúng và cập nhật điểm cho bài làm exercise
     * @request GET:/submit-answers/do-exercise/{doExerciseId}/score
     */
    submitAnswerControllerCalculateExerciseScore: (doExerciseId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/submit-answers/do-exercise/${doExerciseId}/score`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags submit-answers
     * @name SubmitAnswerControllerCreate
     * @summary Tạo câu trả lời mới
     * @request POST:/submit-answers
     */
    submitAnswerControllerCreate: (data: CreateSubmitAnswerDto, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/submit-answers`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags submit-answers
     * @name SubmitAnswerControllerFindAll
     * @summary Lấy danh sách tất cả câu trả lời
     * @request GET:/submit-answers
     */
    submitAnswerControllerFindAll: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/submit-answers`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags submit-answers
     * @name SubmitAnswerControllerFindOne
     * @summary Lấy thông tin câu trả lời theo ID
     * @request GET:/submit-answers/{id}
     */
    submitAnswerControllerFindOne: (id: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/submit-answers/${id}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags submit-answers
     * @name SubmitAnswerControllerUpdate
     * @summary Cập nhật câu trả lời
     * @request PUT:/submit-answers/{id}
     */
    submitAnswerControllerUpdate: (id: string, data: UpdateSubmitAnswerDto, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/submit-answers/${id}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags submit-answers
     * @name SubmitAnswerControllerRemove
     * @summary Xóa câu trả lời
     * @request DELETE:/submit-answers/{id}
     */
    submitAnswerControllerRemove: (id: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/submit-answers/${id}`,
        method: "DELETE",
        ...params,
      }),
  };
  exercises = {
    /**
     * No description
     *
     * @tags exercises
     * @name ExerciseControllerCreate
     * @summary Tạo bài tập mới
     * @request POST:/exercises
     */
    exerciseControllerCreate: (data: CreateExerciseDto, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/exercises`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags exercises
     * @name ExerciseControllerFindAll
     * @summary Lấy danh sách tất cả bài tập
     * @request GET:/exercises
     */
    exerciseControllerFindAll: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/exercises`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags exercises
     * @name ExerciseControllerFindOne
     * @summary Lấy thông tin bài tập theo ID
     * @request GET:/exercises/{id}
     */
    exerciseControllerFindOne: (id: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/exercises/${id}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags exercises
     * @name ExerciseControllerUpdate
     * @summary Cập nhật bài tập
     * @request PUT:/exercises/{id}
     */
    exerciseControllerUpdate: (id: string, data: UpdateExerciseDto, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/exercises/${id}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags exercises
     * @name ExerciseControllerRemove
     * @summary Xóa bài tập
     * @request DELETE:/exercises/{id}
     */
    exerciseControllerRemove: (id: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/exercises/${id}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags exercises
     * @name ExerciseControllerFindBySectionId
     * @summary Lấy danh sách bài tập theo ID của section
     * @request GET:/exercises/section/{id}
     */
    exerciseControllerFindBySectionId: (id: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/exercises/section/${id}`,
        method: "GET",
        ...params,
      }),
  };
  doQuizzes = {
    /**
     * No description
     *
     * @tags do-quizzes
     * @name DoQuizControllerCreate
     * @summary Nộp bài quiz
     * @request POST:/do-quizzes
     * @secure
     */
    doQuizControllerCreate: (data: CreateDoQuizDto, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/do-quizzes`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags do-quizzes
     * @name DoQuizControllerFindAll
     * @summary Lấy danh sách tất cả bài làm quiz
     * @request GET:/do-quizzes
     */
    doQuizControllerFindAll: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/do-quizzes`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags do-quizzes
     * @name DoQuizControllerFindOne
     * @summary Lấy thông tin bản ghi làm bài kiểm tra theo ID
     * @request GET:/do-quizzes/{id}
     */
    doQuizControllerFindOne: (id: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/do-quizzes/${id}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags do-quizzes
     * @name DoQuizControllerUpdate
     * @summary Cập nhật bản ghi làm bài kiểm tra
     * @request PUT:/do-quizzes/{id}
     */
    doQuizControllerUpdate: (id: string, data: UpdateDoQuizDto, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/do-quizzes/${id}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags do-quizzes
     * @name DoQuizControllerRemove
     * @summary Xóa bản ghi làm bài kiểm tra
     * @request DELETE:/do-quizzes/{id}
     */
    doQuizControllerRemove: (id: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/do-quizzes/${id}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags do-quizzes
     * @name DoQuizControllerFindByQuizId
     * @summary Lấy danh sách bài làm quiz theo quiz ID
     * @request GET:/do-quizzes/quiz/{quizId}
     */
    doQuizControllerFindByQuizId: (quizId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/do-quizzes/quiz/${quizId}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags do-quizzes
     * @name DoQuizControllerFindByStudentId
     * @summary Lấy danh sách bài làm quiz của học sinh
     * @request GET:/do-quizzes/student/{studentId}
     */
    doQuizControllerFindByStudentId: (studentId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/do-quizzes/student/${studentId}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags do-quizzes
     * @name DoQuizControllerGetStudentQuizStatus
     * @summary Kiểm tra trạng thái làm bài quiz của học viên
     * @request GET:/do-quizzes/status/{studentId}/{quizId}
     */
    doQuizControllerGetStudentQuizStatus: (studentId: string, quizId: string, params: RequestParams = {}) =>
      this.request<
        {
          /** Học viên đã bắt đầu làm bài */
          started?: boolean;
          /** Học viên đã hoàn thành bài */
          completed?: boolean;
        },
        any
      >({
        path: `/do-quizzes/status/${studentId}/${quizId}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags do-quizzes
     * @name DoQuizControllerFindByStudentIdAndQuizId
     * @summary Lấy bài làm quiz của học sinh theo quiz ID
     * @request GET:/do-quizzes/student/{studentId}/quiz/{quizId}
     */
    doQuizControllerFindByStudentIdAndQuizId: (studentId: string, quizId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/do-quizzes/student/${studentId}/quiz/${quizId}`,
        method: "GET",
        ...params,
      }),
  };
  doExercises = {
    /**
     * No description
     *
     * @tags do-exercises
     * @name DoExerciseControllerCreate
     * @summary Nộp bài exercise
     * @request POST:/do-exercises
     * @secure
     */
    doExerciseControllerCreate: (data: CreateDoExerciseDto, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/do-exercises`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags do-exercises
     * @name DoExerciseControllerFindAll
     * @summary Lấy danh sách tất cả bài làm exercise
     * @request GET:/do-exercises
     */
    doExerciseControllerFindAll: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/do-exercises`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags do-exercises
     * @name DoExerciseControllerFindOne
     * @summary Lấy thông tin bản ghi làm bài tập theo ID
     * @request GET:/do-exercises/{id}
     */
    doExerciseControllerFindOne: (id: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/do-exercises/${id}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags do-exercises
     * @name DoExerciseControllerUpdate
     * @summary Cập nhật bản ghi làm bài tập
     * @request PUT:/do-exercises/{id}
     */
    doExerciseControllerUpdate: (id: string, data: UpdateDoExerciseDto, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/do-exercises/${id}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags do-exercises
     * @name DoExerciseControllerRemove
     * @summary Xóa bản ghi làm bài tập
     * @request DELETE:/do-exercises/{id}
     */
    doExerciseControllerRemove: (id: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/do-exercises/${id}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags do-exercises
     * @name DoExerciseControllerFindByExerciseId
     * @summary Lấy danh sách bài làm exercise theo exercise ID
     * @request GET:/do-exercises/exercise/{exerciseId}
     */
    doExerciseControllerFindByExerciseId: (exerciseId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/do-exercises/exercise/${exerciseId}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags do-exercises
     * @name DoExerciseControllerFindByStudentId
     * @summary Lấy danh sách bài làm exercise của học sinh
     * @request GET:/do-exercises/student/{studentId}
     */
    doExerciseControllerFindByStudentId: (studentId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/do-exercises/student/${studentId}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags do-exercises
     * @name DoExerciseControllerGetStudentExerciseStatus
     * @summary Kiểm tra trạng thái làm bài exercise của học viên
     * @request GET:/do-exercises/status/{studentId}/{exerciseId}
     */
    doExerciseControllerGetStudentExerciseStatus: (studentId: string, exerciseId: string, params: RequestParams = {}) =>
      this.request<
        {
          /** Học viên đã bắt đầu làm bài */
          started?: boolean;
          /** Học viên đã hoàn thành bài */
          completed?: boolean;
        },
        any
      >({
        path: `/do-exercises/status/${studentId}/${exerciseId}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags do-exercises
     * @name DoExerciseControllerFindByStudentIdAndExerciseId
     * @summary Lấy bài làm exercise của học sinh theo exercise ID
     * @request GET:/do-exercises/student/{studentId}/exercise/{exerciseId}
     */
    doExerciseControllerFindByStudentIdAndExerciseId: (
      studentId: string,
      exerciseId: string,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/do-exercises/student/${studentId}/exercise/${exerciseId}`,
        method: "GET",
        ...params,
      }),
  };
  contents = {
    /**
     * No description
     *
     * @tags contents
     * @name ContentControllerCreate
     * @summary Create a new content
     * @request POST:/contents
     */
    contentControllerCreate: (data: CreateContentDto, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/contents`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags contents
     * @name ContentControllerFindAll
     * @summary Get all contents
     * @request GET:/contents
     */
    contentControllerFindAll: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/contents`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags contents
     * @name ContentControllerFindOne
     * @summary Get a content by ID
     * @request GET:/contents/{id}
     */
    contentControllerFindOne: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/contents/${id}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags contents
     * @name ContentControllerUpdate
     * @summary Update a content
     * @request PUT:/contents/{id}
     */
    contentControllerUpdate: (id: string, data: UpdateContentDto, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/contents/${id}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags contents
     * @name ContentControllerRemove
     * @summary Delete a content
     * @request DELETE:/contents/{id}
     */
    contentControllerRemove: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/contents/${id}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags contents
     * @name ContentControllerFindByLesson
     * @summary Get contents by lesson ID
     * @request GET:/contents/lesson/{lessonId}
     */
    contentControllerFindByLesson: (lessonId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/contents/lesson/${lessonId}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags contents
     * @name ContentControllerAddContentToLesson
     * @summary Add a content to a lesson
     * @request POST:/contents/lesson/{lessonId}
     */
    contentControllerAddContentToLesson: (lessonId: string, data: CreateContentDto, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/contents/lesson/${lessonId}`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags contents
     * @name ContentControllerFindByType
     * @summary Get contents by type (Video or Reading)
     * @request GET:/contents/type/{type}
     */
    contentControllerFindByType: (type: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/contents/type/${type}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags contents
     * @name ContentControllerCreateMultiple
     * @summary Tạo nhiều nội dung cùng lúc
     * @request POST:/contents/batch
     */
    contentControllerCreateMultiple: (data: CreateMultipleContentsDto, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/contents/batch`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),
  };
  assignments = {
    /**
     * No description
     *
     * @tags assignments
     * @name AssignmentControllerCreate
     * @summary Tạo bài tập mới
     * @request POST:/assignments
     */
    assignmentControllerCreate: (data: CreateAssignmentDto, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/assignments`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags assignments
     * @name AssignmentControllerFindAll
     * @summary Lấy danh sách tất cả bài tập được giao
     * @request GET:/assignments
     */
    assignmentControllerFindAll: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/assignments`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags assignments
     * @name AssignmentControllerFindOne
     * @summary Lấy thông tin bài tập theo ID
     * @request GET:/assignments/{id}
     */
    assignmentControllerFindOne: (id: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/assignments/${id}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags assignments
     * @name AssignmentControllerUpdate
     * @summary Cập nhật bài tập
     * @request PATCH:/assignments/{id}
     */
    assignmentControllerUpdate: (id: string, data: UpdateAssignmentDto, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/assignments/${id}`,
        method: "PATCH",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags assignments
     * @name AssignmentControllerRemove
     * @summary Xóa bài tập
     * @request DELETE:/assignments/{id}
     */
    assignmentControllerRemove: (id: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/assignments/${id}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags assignments
     * @name AssignmentControllerFindBySection
     * @summary Lấy danh sách bài tập theo section
     * @request GET:/assignments/section/{sectionId}
     */
    assignmentControllerFindBySection: (sectionId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/assignments/section/${sectionId}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags assignments
     * @name AssignmentControllerFindOneWithSubmissions
     * @summary Lấy danh sách bài nộp của bài tập
     * @request GET:/assignments/{id}/submissions
     */
    assignmentControllerFindOneWithSubmissions: (id: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/assignments/${id}/submissions`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags assignments
     * @name AssignmentControllerGetStudentsWhoSubmitted
     * @summary Lấy danh sách học viên đã làm bài tập
     * @request GET:/assignments/{id}/students
     */
    assignmentControllerGetStudentsWhoSubmitted: (id: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/assignments/${id}/students`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags assignments
     * @name AssignmentControllerGetAssignmentStats
     * @summary Lấy thống kê bài tập
     * @request GET:/assignments/{id}/stats
     */
    assignmentControllerGetAssignmentStats: (id: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/assignments/${id}/stats`,
        method: "GET",
        ...params,
      }),
  };
  doAssignments = {
    /**
     * No description
     *
     * @tags do-assignments
     * @name DoAssignmentControllerCreate
     * @summary Nộp bài assignment
     * @request POST:/do-assignments
     * @secure
     */
    doAssignmentControllerCreate: (data: CreateDoAssignmentDto, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/do-assignments`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags do-assignments
     * @name DoAssignmentControllerFindAll
     * @summary Lấy danh sách tất cả bài nộp hoặc theo filter
     * @request GET:/do-assignments
     */
    doAssignmentControllerFindAll: (
      query?: {
        /** ID của assignment để lọc bài nộp */
        assignment?: string;
        /** ID của học viên để lọc bài nộp */
        student?: string;
        /** ID của giáo viên để lọc bài nộp */
        teacher?: string;
        /** Lọc bài nộp chưa chấm điểm */
        ungraded?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/do-assignments`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags do-assignments
     * @name DoAssignmentControllerFindOne
     * @summary Lấy thông tin một bài nộp theo ID
     * @request GET:/do-assignments/{id}
     */
    doAssignmentControllerFindOne: (id: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/do-assignments/${id}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags do-assignments
     * @name DoAssignmentControllerUpdate
     * @summary Cập nhật thông tin bài nộp (chấm điểm)
     * @request PATCH:/do-assignments/{id}
     * @secure
     */
    doAssignmentControllerUpdate: (id: string, data: UpdateDoAssignmentDto, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/do-assignments/${id}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags do-assignments
     * @name DoAssignmentControllerRemove
     * @summary Xóa một bài nộp
     * @request DELETE:/do-assignments/{id}
     */
    doAssignmentControllerRemove: (id: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/do-assignments/${id}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags do-assignments
     * @name DoAssignmentControllerFindOneDetailed
     * @summary Lấy thông tin chi tiết một bài nộp theo ID
     * @request GET:/do-assignments/{id}/detailed
     */
    doAssignmentControllerFindOneDetailed: (id: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/do-assignments/${id}/detailed`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags do-assignments
     * @name DoAssignmentControllerFindByStudentAndAssignment
     * @summary Lấy danh sách bài nộp theo student ID và assignment ID
     * @request GET:/do-assignments/student/{studentId}/assignment/{assignmentId}
     */
    doAssignmentControllerFindByStudentAndAssignment: (
      studentId: string,
      assignmentId: string,
      params: RequestParams = {},
    ) =>
      this.request<void, void>({
        path: `/do-assignments/student/${studentId}/assignment/${assignmentId}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags do-assignments
     * @name DoAssignmentControllerFindByAssignment
     * @summary Lấy danh sách bài nộp theo assignment ID
     * @request GET:/do-assignments/assignment/{assignmentId}
     */
    doAssignmentControllerFindByAssignment: (assignmentId: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/do-assignments/assignment/${assignmentId}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags do-assignments
     * @name DoAssignmentControllerFindByStudent
     * @summary Lấy danh sách bài nộp theo student ID
     * @request GET:/do-assignments/student/{studentId}
     */
    doAssignmentControllerFindByStudent: (studentId: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/do-assignments/student/${studentId}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags do-assignments
     * @name DoAssignmentControllerFindByTeacher
     * @summary Lấy danh sách bài nộp theo teacher ID
     * @request GET:/do-assignments/teacher/{teacherId}
     */
    doAssignmentControllerFindByTeacher: (teacherId: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/do-assignments/teacher/${teacherId}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags do-assignments
     * @name DoAssignmentControllerGetSubmissionDetails
     * @summary Lấy chi tiết đầy đủ về một bài nộp
     * @request GET:/do-assignments/details/{id}
     */
    doAssignmentControllerGetSubmissionDetails: (id: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/do-assignments/details/${id}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags do-assignments
     * @name DoAssignmentControllerGetGradedSubmissions
     * @summary Lấy danh sách tất cả bài nộp đã được chấm điểm
     * @request GET:/do-assignments/graded
     */
    doAssignmentControllerGetGradedSubmissions: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/do-assignments/graded`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags do-assignments
     * @name DoAssignmentControllerGetAssignmentStatistics
     * @summary Lấy thống kê điểm số cho một assignment
     * @request GET:/do-assignments/statistics/assignment/{assignmentId}
     */
    doAssignmentControllerGetAssignmentStatistics: (assignmentId: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/do-assignments/statistics/assignment/${assignmentId}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags do-assignments
     * @name DoAssignmentControllerGetStudentSubmissionsByAssignment
     * @summary Lấy danh sách học sinh đã làm assignment và trạng thái chấm điểm
     * @request GET:/do-assignments/students/assignment/{assignmentId}
     */
    doAssignmentControllerGetStudentSubmissionsByAssignment: (assignmentId: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/do-assignments/students/assignment/${assignmentId}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags do-assignments
     * @name DoAssignmentControllerGetAssignmentSubmissionsByStudent
     * @summary Lấy danh sách assignment mà học sinh đã làm và trạng thái chấm điểm
     * @request GET:/do-assignments/assignments/student/{studentId}
     */
    doAssignmentControllerGetAssignmentSubmissionsByStudent: (studentId: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/do-assignments/assignments/student/${studentId}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags do-assignments
     * @name DoAssignmentControllerGetGradedSubmissionsByTeacher
     * @summary Lấy danh sách bài đã chấm của giáo viên
     * @request GET:/do-assignments/graded/teacher/{teacherId}
     */
    doAssignmentControllerGetGradedSubmissionsByTeacher: (teacherId: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/do-assignments/graded/teacher/${teacherId}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags do-assignments
     * @name DoAssignmentControllerUpdateStudentSubmission
     * @summary Học viên cập nhật bài nộp của mình
     * @request PATCH:/do-assignments/{id}/student-update
     * @secure
     */
    doAssignmentControllerUpdateStudentSubmission: (
      id: string,
      data: UpdateStudentSubmissionDto,
      params: RequestParams = {},
    ) =>
      this.request<void, void>({
        path: `/do-assignments/${id}/student-update`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags do-assignments
     * @name DoAssignmentControllerGetStudentAssignmentStatus
     * @summary Kiểm tra trạng thái làm bài assignment của học viên
     * @request GET:/do-assignments/status/{studentId}/{assignmentId}
     */
    doAssignmentControllerGetStudentAssignmentStatus: (
      studentId: string,
      assignmentId: string,
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** Học viên đã bắt đầu làm bài */
          started?: boolean;
          /** Học viên đã hoàn thành bài */
          completed?: boolean;
        },
        any
      >({
        path: `/do-assignments/status/${studentId}/${assignmentId}`,
        method: "GET",
        format: "json",
        ...params,
      }),
  };
  ratings = {
    /**
     * No description
     *
     * @tags ratings
     * @name RatingControllerCreate
     * @summary Tạo đánh giá mới cho khóa học
     * @request POST:/ratings
     * @secure
     */
    ratingControllerCreate: (data: CreateRatingDto, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/ratings`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags ratings
     * @name RatingControllerFindAll
     * @summary Lấy tất cả đánh giá
     * @request GET:/ratings
     */
    ratingControllerFindAll: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/ratings`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags ratings
     * @name RatingControllerFindOne
     * @summary Lấy đánh giá theo ID
     * @request GET:/ratings/{id}
     */
    ratingControllerFindOne: (id: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/ratings/${id}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags ratings
     * @name RatingControllerUpdate
     * @summary Cập nhật đánh giá
     * @request PATCH:/ratings/{id}
     * @secure
     */
    ratingControllerUpdate: (id: string, data: UpdateRatingDto, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/ratings/${id}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags ratings
     * @name RatingControllerRemove
     * @summary Xóa đánh giá
     * @request DELETE:/ratings/{id}
     */
    ratingControllerRemove: (id: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/ratings/${id}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags ratings
     * @name RatingControllerFindMyRatings
     * @summary Lấy đánh giá của học viên hiện tại
     * @request GET:/ratings/student/my-ratings
     * @secure
     */
    ratingControllerFindMyRatings: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/ratings/student/my-ratings`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags ratings
     * @name RatingControllerGetCourseRatingStats
     * @summary Lấy thống kê đánh giá của khóa học
     * @request GET:/ratings/course/{courseId}/stats
     */
    ratingControllerGetCourseRatingStats: (courseId: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/ratings/course/${courseId}/stats`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags ratings
     * @name RatingControllerFindByStudentAndCourse
     * @summary Lấy đánh giá của học viên cho khóa học cụ thể
     * @request GET:/ratings/student/{studentId}/course/{courseId}
     */
    ratingControllerFindByStudentAndCourse: (studentId: string, courseId: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/ratings/student/${studentId}/course/${courseId}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags ratings
     * @name RatingControllerFindByStudent
     * @summary Lấy tất cả đánh giá của học viên
     * @request GET:/ratings/student/{studentId}
     */
    ratingControllerFindByStudent: (studentId: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/ratings/student/${studentId}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags ratings
     * @name RatingControllerFindByCourse
     * @summary Lấy tất cả đánh giá của khóa học
     * @request GET:/ratings/course/{courseId}
     */
    ratingControllerFindByCourse: (courseId: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/ratings/course/${courseId}`,
        method: "GET",
        ...params,
      }),
  };
  discussions = {
    /**
     * No description
     *
     * @tags discussions
     * @name DiscussionControllerCreate
     * @summary Tạo một thảo luận mới
     * @request POST:/discussions
     * @secure
     */
    discussionControllerCreate: (data: CreateDiscussionDto, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/discussions`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags discussions
     * @name DiscussionControllerFindAll
     * @summary Lấy danh sách tất cả thảo luận
     * @request GET:/discussions
     */
    discussionControllerFindAll: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/discussions`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags discussions
     * @name DiscussionControllerFindOne
     * @summary Lấy thông tin một thảo luận theo ID
     * @request GET:/discussions/{id}
     */
    discussionControllerFindOne: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/discussions/${id}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags discussions
     * @name DiscussionControllerUpdate
     * @summary Cập nhật thông tin thảo luận
     * @request PUT:/discussions/{id}
     */
    discussionControllerUpdate: (id: string, data: UpdateDiscussionDto, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/discussions/${id}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags discussions
     * @name DiscussionControllerRemove
     * @summary Xóa một thảo luận
     * @request DELETE:/discussions/{id}
     */
    discussionControllerRemove: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/discussions/${id}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags discussions
     * @name DiscussionControllerFindByModule
     * @summary Lấy danh sách thảo luận theo module
     * @request GET:/discussions/module/{moduleId}
     */
    discussionControllerFindByModule: (moduleId: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/discussions/module/${moduleId}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags discussions
     * @name DiscussionControllerFindByStudentId
     * @summary Lấy danh sách thảo luận theo học viên
     * @request GET:/discussions/student/{studentId}
     */
    discussionControllerFindByStudentId: (studentId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/discussions/student/${studentId}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags discussions
     * @name DiscussionControllerFindByStudentAndModule
     * @summary Lấy danh sách thảo luận của học viên theo module
     * @request GET:/discussions/student/{studentId}/module/{moduleId}
     */
    discussionControllerFindByStudentAndModule: (studentId: string, moduleId: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/discussions/student/${studentId}/module/${moduleId}`,
        method: "GET",
        ...params,
      }),
  };
  discussionReplies = {
    /**
     * No description
     *
     * @tags discussion-replies
     * @name DiscussionReplyControllerCreate
     * @summary Tạo một reply mới
     * @request POST:/discussion-replies
     * @secure
     */
    discussionReplyControllerCreate: (data: CreateDiscussionReplyDto, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/discussion-replies`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags discussion-replies
     * @name DiscussionReplyControllerFindAll
     * @summary Lấy danh sách tất cả replies
     * @request GET:/discussion-replies
     */
    discussionReplyControllerFindAll: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/discussion-replies`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags discussion-replies
     * @name DiscussionReplyControllerFindOne
     * @summary Lấy thông tin một reply theo ID
     * @request GET:/discussion-replies/{id}
     */
    discussionReplyControllerFindOne: (id: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/discussion-replies/${id}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags discussion-replies
     * @name DiscussionReplyControllerUpdate
     * @summary Cập nhật thông tin reply
     * @request PUT:/discussion-replies/{id}
     * @secure
     */
    discussionReplyControllerUpdate: (id: string, data: UpdateDiscussionReplyDto, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/discussion-replies/${id}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags discussion-replies
     * @name DiscussionReplyControllerRemove
     * @summary Xóa một reply (soft delete)
     * @request DELETE:/discussion-replies/{id}
     * @secure
     */
    discussionReplyControllerRemove: (id: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/discussion-replies/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags discussion-replies
     * @name DiscussionReplyControllerFindByDiscussion
     * @summary Lấy danh sách trả lời theo thảo luận
     * @request GET:/discussion-replies/discussion/{discussionId}
     */
    discussionReplyControllerFindByDiscussion: (discussionId: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/discussion-replies/discussion/${discussionId}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags discussion-replies
     * @name DiscussionReplyControllerFindByStudent
     * @summary Lấy tất cả trả lời của học viên
     * @request GET:/discussion-replies/student/{studentId}
     */
    discussionReplyControllerFindByStudent: (studentId: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/discussion-replies/student/${studentId}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags discussion-replies
     * @name DiscussionReplyControllerFindByStudentAndDiscussion
     * @summary Lấy danh sách trả lời của học viên theo thảo luận
     * @request GET:/discussion-replies/student/{studentId}/discussion/{discussionId}
     */
    discussionReplyControllerFindByStudentAndDiscussion: (
      studentId: string,
      discussionId: string,
      params: RequestParams = {},
    ) =>
      this.request<void, void>({
        path: `/discussion-replies/student/${studentId}/discussion/${discussionId}`,
        method: "GET",
        ...params,
      }),
  };
  notes = {
    /**
     * No description
     *
     * @tags notes
     * @name NoteControllerCreate
     * @summary Tạo ghi chú mới cho module
     * @request POST:/notes
     * @secure
     */
    noteControllerCreate: (data: CreateNoteDto, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/notes`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags notes
     * @name NoteControllerFindAll
     * @summary Lấy danh sách tất cả ghi chú
     * @request GET:/notes
     */
    noteControllerFindAll: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/notes`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags notes
     * @name NoteControllerFindOne
     * @summary Lấy thông tin ghi chú theo ID
     * @request GET:/notes/{id}
     */
    noteControllerFindOne: (id: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/notes/${id}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags notes
     * @name NoteControllerUpdate
     * @summary Cập nhật ghi chú
     * @request PATCH:/notes/{id}
     * @secure
     */
    noteControllerUpdate: (id: string, data: UpdateNoteDto, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/notes/${id}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags notes
     * @name NoteControllerRemove
     * @summary Xóa ghi chú
     * @request DELETE:/notes/{id}
     * @secure
     */
    noteControllerRemove: (id: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/notes/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags notes
     * @name NoteControllerFindMyNotes
     * @summary Lấy danh sách ghi chú của học viên đang đăng nhập
     * @request GET:/notes/student/me
     * @secure
     */
    noteControllerFindMyNotes: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/notes/student/me`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags notes
     * @name NoteControllerFindByStudentId
     * @summary Lấy danh sách ghi chú của học viên theo ID
     * @request GET:/notes/student/{studentId}
     */
    noteControllerFindByStudentId: (studentId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/notes/student/${studentId}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags notes
     * @name NoteControllerFindByModuleId
     * @summary Lấy danh sách ghi chú của module theo ID
     * @request GET:/notes/module/{moduleId}
     */
    noteControllerFindByModuleId: (moduleId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/notes/module/${moduleId}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags notes
     * @name NoteControllerFindByStudentAndModule
     * @summary Lấy danh sách ghi chú của học viên cho một module cụ thể
     * @request GET:/notes/student/{studentId}/module/{moduleId}
     */
    noteControllerFindByStudentAndModule: (studentId: string, moduleId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/notes/student/${studentId}/module/${moduleId}`,
        method: "GET",
        ...params,
      }),
  };
  lessonProgress = {
    /**
     * No description
     *
     * @tags lesson-progress
     * @name LessonProgressControllerCreate
     * @summary Tạo bản ghi tiến độ bài học mới
     * @request POST:/lesson-progress
     * @secure
     */
    lessonProgressControllerCreate: (data: CreateLessonProgressDto, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/lesson-progress`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags lesson-progress
     * @name LessonProgressControllerFindAll
     * @summary Lấy danh sách tất cả bản ghi tiến độ
     * @request GET:/lesson-progress
     */
    lessonProgressControllerFindAll: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/lesson-progress`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags lesson-progress
     * @name LessonProgressControllerFindOne
     * @summary Lấy thông tin bản ghi tiến độ theo ID
     * @request GET:/lesson-progress/{id}
     */
    lessonProgressControllerFindOne: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/lesson-progress/${id}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags lesson-progress
     * @name LessonProgressControllerUpdate
     * @summary Cập nhật tiến độ học tập
     * @request PATCH:/lesson-progress/{id}
     * @secure
     */
    lessonProgressControllerUpdate: (id: string, data: UpdateLessonProgressDto, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/lesson-progress/${id}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags lesson-progress
     * @name LessonProgressControllerRemove
     * @summary Xóa bản ghi tiến độ học tập
     * @request DELETE:/lesson-progress/{id}
     * @secure
     */
    lessonProgressControllerRemove: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/lesson-progress/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags lesson-progress
     * @name LessonProgressControllerFindByStudent
     * @summary Lấy danh sách tiến độ của học viên
     * @request GET:/lesson-progress/student/{studentId}
     */
    lessonProgressControllerFindByStudent: (studentId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/lesson-progress/student/${studentId}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags lesson-progress
     * @name LessonProgressControllerFindByStudentAndLesson
     * @summary Lấy tiến độ của học viên cho một bài học cụ thể
     * @request GET:/lesson-progress/student/{studentId}/lesson/{lessonId}
     */
    lessonProgressControllerFindByStudentAndLesson: (studentId: string, lessonId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/lesson-progress/student/${studentId}/lesson/${lessonId}`,
        method: "GET",
        ...params,
      }),
  };
}
