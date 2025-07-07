import axios from 'axios';

// Hàm để lấy biến môi trường
const getEnvVariable = (key, defaultValue = '') => {
  // Convert REACT_APP prefix to VITE prefix
  const viteKey = key.replace('REACT_APP_', 'VITE_');
  
  // Thứ tự ưu tiên:
  // 1. import.meta.env (Vite environment variables)
  if (import.meta && import.meta.env && import.meta.env[viteKey]) {
    return import.meta.env[viteKey];
  }
  
  // 2. window._env_ (Runtime environment variables)
  if (window && window._env_ && window._env_[key]) {
    return window._env_[key];
  }
  
  // 3. window.env (Runtime environment variables)
  if (window && window.env && window.env[key]) {
    return window.env[key];
  }
  
  return defaultValue;
};

// Configuration for the AI services
const AI_SERVICE_CONFIG = {
  // OpenAI API endpoint
  openai: {
    apiUrl: getEnvVariable('REACT_APP_OPENAI_API_URL', 'https://api.openai.com/v1/chat/completions'),
    apiKey: getEnvVariable('REACT_APP_OPENAI_API_KEY', ''),
    model: getEnvVariable('REACT_APP_OPENAI_MODEL', 'gpt-4-turbo-2024-04-09'),
    defaultTimeout: 120000, // 120 seconds for processing files and detailed analysis
  },
  // Current active provider - only OpenAI is supported now
  activeProvider: 'openai',
  // Fallback settings - disabled since we only use OpenAI
  useFallback: false,
};

/**
 * Service for generating AI feedback on user exercises using OpenAI
 */
class AIFeedbackService {
  /**
   * Generate feedback for a single question using OpenAI
   * 
   * @param {Object} questionContext - Context about the question and user's answer
   * @param {File} [fileContent] - Optional file content for analysis
   * @returns {Promise<Object>} - AI feedback response
   */
  async generateFeedback(questionContext, fileContent = null) {
    try {
      // Lấy API key từ biến môi trường
      const apiKey = getEnvVariable('REACT_APP_OPENAI_API_KEY', '');
      
      // Check if API key is configured
      if (!apiKey) {
        console.warn('No OpenAI API key configured. Using mock feedback data.');
        return this.generateMockFeedback(questionContext);
      }
      
      // Validate API key before proceeding
      const isApiKeyValid = await this.validateApiKey(apiKey);
      if (!isApiKeyValid) {
        console.error('Invalid OpenAI API key. Using mock feedback data.');
        return {
          error: true,
          errorType: 'auth_error',
          errorMessage: 'Invalid API key. Please check your OpenAI API key in the configuration.',
          feedbackText: 'Unable to generate feedback due to authentication error.'
        };
      }
      
      // Log the request for debugging
      console.log('Generating AI feedback with real API call for:', {
        title: questionContext.title,
        description: questionContext.description,
        fileType: fileContent ? fileContent.type : 'none',
        fileName: fileContent ? fileContent.name : 'none',
        apiKey: apiKey ? 'Configured (hidden)' : 'Not configured',
        model: getEnvVariable('REACT_APP_OPENAI_MODEL', 'gpt-4')
      });
      
      // Only OpenAI is supported now
      return await this.generateOpenAIFeedback(questionContext, fileContent, apiKey);
    } catch (error) {
      console.error('Error generating AI feedback:', error);
      console.error('Error details:', error.message);
      
      // Check if it's an API key issue
      if (error.response) {
        if (error.response.status === 401) {
          return {
            error: true,
            errorType: 'auth_error',
            errorMessage: 'Invalid API key or authentication error. Please check your OpenAI API key.',
            feedbackText: 'Unable to generate feedback due to authentication error.'
          };
        } else if (error.response.status === 429) {
          return {
            error: true,
            errorType: 'rate_limit',
            errorMessage: 'Rate limit exceeded. Please try again later.',
            feedbackText: 'Unable to generate feedback due to rate limiting.'
          };
        } else if (error.response.status === 500) {
          return {
            error: true,
            errorType: 'server_error',
            errorMessage: 'OpenAI server error. Please try again later.',
            feedbackText: 'Unable to generate feedback due to server error.'
          };
        }
      }
      
      // Return mock feedback as fallback
      console.warn('Falling back to mock feedback due to error');
      return this.generateMockFeedback(questionContext);
    }
  }

  /**
   * Check if the API key has a valid format
   * 
   * @param {string} apiKey - The API key to check
   * @returns {boolean} - Whether the API key has a valid format
   */
  isValidApiKeyFormat(apiKey) {
    // OpenAI API keys typically start with "sk-" and are 51 characters long
    return typeof apiKey === 'string' && 
           apiKey.startsWith('sk-') && 
           apiKey.length >= 40;
  }

  /**
   * Validate the OpenAI API key
   * 
   * @param {string} apiKey - The API key to validate
   * @returns {Promise<boolean>} - Whether the API key is valid
   */
  async validateApiKey(apiKey) {
    try {
      if (!apiKey) {
        console.error('No API key found for validation');
        return false;
      }
      
      // Log API key for debugging (showing only first 4 and last 4 characters)
      const maskedKey = apiKey.length > 8 
        ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`
        : '****';
      console.log('Validating API key (masked):', maskedKey);
      console.log('API key length:', apiKey.length);
      console.log('API key starts with "sk-":', apiKey.startsWith('sk-'));
      
      // Check if the API key has a valid format before making the API call
      if (!this.isValidApiKeyFormat(apiKey)) {
        console.error('API key has invalid format');
        return false;
      }
      
      const apiUrl = getEnvVariable('REACT_APP_OPENAI_API_URL', 'https://api.openai.com/v1/chat/completions');
      console.log('Making validation API call to:', apiUrl);
      
      // Make a simple API call to validate the key
      await axios.post(
        apiUrl,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: "system",
              content: "This is a test message to validate the API key."
            },
            {
              role: "user",
              content: "Hello"
            }
          ],
          max_tokens: 5
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          timeout: 10000, // 10 seconds timeout for validation
        }
      );
      
      // If we get here, the API key is valid
      console.log('API key validation successful');
      return true;
    } catch (error) {
      console.error('API key validation failed:', error.message);
      
      // Check for specific error responses
      if (error.response) {
        console.error('API error status:', error.response.status);
        console.error('API error data:', JSON.stringify(error.response.data, null, 2));
        console.error('API error headers:', JSON.stringify(error.response.headers, null, 2));
        
        // Check for specific error messages related to permissions
        const errorMessage = error.response.data?.error?.message || '';
        console.error('Error message from API:', errorMessage);
        
        if (errorMessage.includes('auth method') && errorMessage.includes('inference')) {
          console.error('API key permission issue: Inference not allowed');
          return {
            error: true,
            errorType: 'auth_error',
            errorMessage: 'Your API key doesn\'t have permission to make inference requests. Please check your OpenAI account settings and ensure your API key has the correct permissions.',
            feedbackText: 'Unable to generate feedback due to API key permission issues.'
          };
        }
        
        if (errorMessage.includes('permission') || errorMessage.includes('not authorized')) {
          console.error('API key permission issue detected');
          return {
            error: true,
            errorType: 'auth_error',
            errorMessage: 'Your API key doesn\'t have the required permissions. Please check your OpenAI account settings.',
            feedbackText: 'Unable to generate feedback due to API key permission issues.'
          };
        }
        
        if (errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
          console.error('Account quota or rate limit issue');
          return {
            error: true,
            errorType: 'quota_error',
            errorMessage: 'Your OpenAI account has reached its quota or rate limit. Please check your billing status.',
            feedbackText: 'Unable to generate feedback due to account quota or rate limit issues.'
          };
        }
        
        if (error.response.status === 401) {
          return {
            error: true,
            errorType: 'auth_error',
            errorMessage: 'Invalid API key. Please check your OpenAI API key in the configuration.',
            feedbackText: 'Unable to generate feedback due to authentication error.'
          };
        }
        
        if (error.response.status === 429) {
          console.error('Rate limit exceeded (429 Too Many Requests)');
          
          // Check if this is a tier/quota issue or just a rate limit
          const retryAfter = error.response.headers['retry-after'] || error.response.headers['x-ratelimit-reset-requests'];
          const isBillingIssue = errorMessage.includes('billing') || errorMessage.includes('quota');
          
          if (isBillingIssue) {
            return {
              error: true,
              errorType: 'quota_error',
              errorMessage: 'You have exceeded your current OpenAI API usage quota. Please check your billing details and limits at https://platform.openai.com/account/billing.',
              feedbackText: 'Unable to generate feedback because your OpenAI account has reached its usage limit.'
            };
          } else {
            return {
              error: true,
              errorType: 'rate_limit',
              errorMessage: `Rate limit exceeded. Please try again ${retryAfter ? `after ${retryAfter} seconds` : 'in a few minutes'}.`,
              retryAfter: retryAfter ? parseInt(retryAfter) : 60,
              feedbackText: 'Unable to generate feedback due to OpenAI rate limiting. This typically happens when making too many requests in a short period.'
            };
          }
        }
        
        if (error.response.status === 500) {
          return {
            error: true,
            errorType: 'server_error',
            errorMessage: 'OpenAI server error. Please try again later.',
            feedbackText: 'Unable to generate feedback due to server error.'
          };
        }
        
        // Generic error with the actual error message from OpenAI
        return {
          error: true,
          errorType: 'api_error',
          errorMessage: `OpenAI API error: ${errorMessage || 'Unknown error'}`,
          feedbackText: 'Unable to generate feedback due to an API error.'
        };
      }
      
      // Network or other errors
      return {
        error: true,
        errorType: 'network_error',
        errorMessage: `Network or other error: ${error.message}`,
        feedbackText: 'Unable to generate feedback due to a network or system error.'
      };
    }
  }

  /**
   * Convert file to base64 for API submission
   * 
   * @param {File} file - File to convert
   * @returns {Promise<string>} - Base64 encoded file
   */
  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  }

  /**
   * Format AI feedback from JSON to structured text
   * 
   * @param {Object} feedback - The feedback object from AI
   * @returns {Object} - Formatted feedback object
   */
  formatAIFeedback(feedback) {
    // If there's an error, return the original feedback
    if (feedback.error) {
      return feedback;
    }
    
    try {
      // Check if feedback is already in JSON format or needs parsing
      let parsedFeedback = feedback;
      if (typeof feedback === 'string') {
        try {
          // Kiểm tra nếu chuỗi bắt đầu với ``` hoặc ``` json
          if (feedback.trim().startsWith('```')) {
            // Tìm vị trí bắt đầu và kết thúc của JSON
            const jsonStartIndex = feedback.indexOf('{');
            const jsonEndIndex = feedback.lastIndexOf('}') + 1;
            
            if (jsonStartIndex >= 0 && jsonEndIndex > jsonStartIndex) {
              const jsonStr = feedback.substring(jsonStartIndex, jsonEndIndex);
              parsedFeedback = JSON.parse(jsonStr);
            } else {
              return feedback;
            }
          } else if (feedback.trim().startsWith('{') && feedback.trim().endsWith('}')) {
            parsedFeedback = JSON.parse(feedback);
          } else {
            return feedback;
          }
        } catch {
          // If parsing fails, return the original feedback
          console.error('Failed to parse feedback as JSON:', feedback.substring(0, 100) + '...');
          return feedback;
        }
      }
      
      // Format the feedback text with proper structure
      let formattedText = '';
      
      // Add requirement analysis if available
      if (parsedFeedback.requirementAnalysis) {
        formattedText += '**YÊU CẦU BÀI TẬP:**\n';
        formattedText += parsedFeedback.requirementAnalysis + '\n\n';
      }
      
      // Add title and description assessment if available
      if (parsedFeedback.titleDescriptionAssessment) {
        formattedText += '**TITLE & DESCRIPTION ASSESSMENT:**\n';
        formattedText += parsedFeedback.titleDescriptionAssessment + '\n\n';
      }
      
      // Add submission assessment if available
      if (parsedFeedback.submissionAssessment) {
        formattedText += '**ĐÁNH GIÁ BÀI LÀM:**\n';
        formattedText += parsedFeedback.submissionAssessment + '\n\n';
      }
      
      // Add the main feedback text
      if (parsedFeedback.feedbackText) {
        formattedText += '**PHÂN TÍCH CHI TIẾT:**\n';
        formattedText += parsedFeedback.feedbackText + '\n\n';
      }
      
      // Add strengths section if available
      if (parsedFeedback.strengths && parsedFeedback.strengths.length > 0) {
        formattedText += '**ĐIỂM MẠNH:**\n';
        parsedFeedback.strengths.forEach((strength, index) => {
          formattedText += `${index + 1}. ${strength}\n`;
        });
        formattedText += '\n';
      }
      
      // Add improvement areas if available
      if (parsedFeedback.improvementAreas) {
        formattedText += '**ĐIỂM CẦN CẢI THIỆN:**\n';
        formattedText += parsedFeedback.improvementAreas + '\n\n';
      }
      
      // Add suggestions if available
      if (parsedFeedback.suggestions) {
        formattedText += '**GỢI Ý CẢI THIỆN:**\n';
        formattedText += parsedFeedback.suggestions + '\n\n';
      }
      
      // Add recommended resources if available
      if (parsedFeedback.recommendedResources && parsedFeedback.recommendedResources.length > 0) {
        formattedText += '**TÀI LIỆU THAM KHẢO:**\n';
        parsedFeedback.recommendedResources.forEach((resource, index) => {
          formattedText += `${index + 1}. ${resource}\n`;
        });
      }
      
      // Create a new feedback object with the formatted text
      return {
        ...parsedFeedback,
        formattedText: formattedText.trim()
      };
    } catch (error) {
      console.error('Error formatting AI feedback:', error);
      return feedback;
    }
  }

  /**
   * Generate feedback using OpenAI with support for file analysis
   * 
   * @param {Object} questionContext - Context about the question and user's answer
   * @param {File} [fileContent] - Optional file content for analysis
   * @param {string} [apiKey] - API key to use
   * @returns {Promise<Object>} - AI feedback response
   */
  async generateOpenAIFeedback(questionContext, fileContent = null, apiKey = null) {
    // Sử dụng API key được truyền vào hoặc lấy từ biến môi trường
    apiKey = apiKey || getEnvVariable('REACT_APP_OPENAI_API_KEY', '');
    
    // Log API key for debugging (showing only first 4 and last 4 characters)
    if (apiKey) {
      const maskedKey = apiKey.length > 8 
        ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`
        : '****';
      console.log('Using API key (masked for security):', maskedKey);
      console.log('API key length:', apiKey.length);
      console.log('API key starts with "sk-":', apiKey.startsWith('sk-'));
    } else {
      console.log('No API key found');
    }
    
    // For development/testing, use mock data if no API key is configured
    if (!apiKey) {
      console.warn('No OpenAI API key configured. Using mock feedback data.');
      return this.generateMockFeedback(questionContext);
    }

    // Create a dynamic prompt based on the student's information and submission
    let systemPrompt = '';
    
    // Use different prompts for assignments vs. questions
    if (questionContext.assignmentType === "submission") {
      // Extract student information if available
      const studentName = questionContext.studentName || "the student";
      const studentLevel = questionContext.studentLevel || "unknown level";
      const studentBackground = questionContext.studentBackground || "";
      const submissionTitle = questionContext.title || "untitled assignment";
      const submissionDescription = questionContext.description || "";
      const fileType = fileContent ? fileContent.type : "unknown";
      const fileName = fileContent ? fileContent.name : "no file";
      
      // Determine the specific music domain if possible
      const musicDomain = this.determineMusicDomain(submissionTitle, submissionDescription, fileName);
      
      // Create a personalized prompt
      systemPrompt = `
        You are a professional music teacher and expert evaluating a student's assignment submission in a music theory course.
        
        STUDENT CONTEXT:
        You are reviewing work from ${studentName}, a ${studentLevel} student${studentBackground ? ' with background in ' + studentBackground : ''}.
        
        ASSIGNMENT CONTEXT:
        Title: "${submissionTitle}"
        Description: "${submissionDescription}"
        File: ${fileName} (${fileType})
        
        MUSIC DOMAIN FOCUS:
        This submission appears to be related to ${musicDomain}.
        
        TASK:
        Analyze the student's assignment in detail, including the title, description, and most importantly, the CONTENT OF THE UPLOADED FILE.
        
        IMPORTANT ANALYSIS INSTRUCTIONS:
        - FIRST, carefully analyze the assignment title and description to understand the exact requirements of the task.
        - SECOND, analyze the submitted content (file) to determine if it correctly fulfills the assignment requirements.
        - THIRD, evaluate whether the student's work is correct or incorrect based on the assignment requirements.
        - If the file is sheet music: Analyze the notation, composition structure, harmony, melody, rhythm, and any technical elements.
        - If the file is an image: Describe what you see in detail and analyze any musical elements present.
        - If the file is text: Analyze the concepts, arguments, and musical theory discussed.
        - If the file is audio: Describe the musical elements you can identify.
        
        CRITICAL EVALUATION GUIDELINES:
        - Begin by clearly stating whether the student's submission correctly fulfills the assignment requirements or not.
        - Be HONEST and CRITICAL in your assessment - don't just praise everything.
        - If the submission does not match the requirements, clearly explain what was expected vs. what was submitted.
        - If the submission is low quality, unclear, or incorrect, say so directly.
        - Identify specific errors, misconceptions, or areas needing significant improvement.
        - Provide constructive criticism that will help the student improve.
        - Do not generate generic feedback - be specific to this exact submission.
        
        RESPONSE FORMAT:
        Provide a detailed, specific, and personalized evaluation with the following sections:
        
        1. REQUIREMENT ANALYSIS: Clearly state the assignment requirements based on the title and description.
        
        2. SUBMISSION ASSESSMENT: Evaluate whether the submission correctly fulfills the requirements. Be explicit about whether the work is correct or incorrect.
        
        3. DETAILED ANALYSIS: Provide a thorough analysis of the specific content in the file and how it relates to music theory concepts.
           Be extremely specific about what you see/read in the file - mention specific notes, chords, progressions, techniques, etc.
        
        4. STRENGTHS: Identify 3-5 specific strengths in the student's work, with direct references to elements in their submission.
           If there are fewer than 3 strengths, be honest about it.
        
        5. AREAS FOR IMPROVEMENT: Identify 3-5 specific areas where the student could improve, with clear explanations why.
           Be direct and honest about significant issues.
        
        6. SPECIFIC SUGGESTIONS: Provide actionable, detailed advice for improvement, with examples where possible.
        
        7. RECOMMENDED RESOURCES: Suggest specific resources (books, websites, exercises) that would help the student improve.
        
        Return your response in JSON format with the following structure:
        {
          "requirementAnalysis": "Clear statement of what the assignment required the student to do",
          "submissionAssessment": "Evaluation of whether the submission correctly fulfills the requirements",
          "feedbackText": "Detailed analysis of the specific content and concepts in the submission",
          "suggestions": "Specific, actionable improvement suggestions with examples",
          "confidenceScore": 0.95, // Confidence level of assessment (0-1)
          "strengths": ["Specific strength 1 with reference to the content", "Specific strength 2 with reference to the content", ...],
          "improvementAreas": "Detailed explanation of areas needing improvement with specific references to the content",
          "recommendedResources": ["Specific resource 1", "Specific resource 2", ...],
          "score": 7.5 // Đánh giá điểm số trên thang điểm từ 0-10 dựa trên chất lượng bài làm
        }
        
        IMPORTANT GUIDELINES:
        - Be SPECIFIC and DETAILED in your analysis - refer to actual content in the file
        - Avoid generic feedback that could apply to any submission
        - ALL feedback must be in ENGLISH, not Vietnamese
        - Focus on providing constructive, educational feedback
        - If you can't see or analyze the file properly, clearly state what you can and cannot analyze
        - If the submission is poor quality, be honest but constructive
      `;
    } else {
      // For exercises, create a dynamic prompt based on the question type and context
      const questionType = questionContext.questionType || "unknown";
      const questionDifficulty = questionContext.difficulty || "intermediate";
      const isCorrect = questionContext.isCorrect || false;
      
      systemPrompt = `
        You are a professional music teacher evaluating a student's ${questionType} exercise in a music theory course.
        
        QUESTION CONTEXT:
        Difficulty: ${questionDifficulty}
        Type: ${questionType}
        Student's answer is: ${isCorrect ? "correct" : "incorrect"}
        
        TASK:
        Analyze the student's answer to a music theory question and provide detailed, helpful feedback.
        
        MUSIC THEORY CONTEXT:
        This is for a music theory course covering concepts like scales, chords, harmony, composition, notation, and performance techniques.
        
        RESPONSE FORMAT:
        Provide a detailed evaluation with the following sections:
        
        1. ASSESSMENT: Determine if the answer is correct or incorrect, with a detailed explanation why.
        
        2. EXPLANATION: Provide a thorough explanation of the relevant music theory concepts.
        
        3. STRENGTHS/MISCONCEPTIONS: 
           - If correct: Highlight specific strengths in the student's understanding
           - If incorrect: Identify specific misconceptions and explain the correct concepts
        
        4. SUGGESTIONS: Provide specific, actionable advice for improvement or further study.
        
        5. RESOURCES: Suggest specific resources relevant to the topic.
        
        Return your response in JSON format with the following structure:
        {
          "feedbackText": "Detailed assessment and explanation",
          "suggestions": "Specific improvement suggestions",
          "confidenceScore": 0.95, // Confidence level of assessment (0-1)
          "strengths": ["Specific strength 1", "Specific strength 2"], // Only when answer is correct
          "improvementAreas": "Areas needing improvement with specific details", // Only when answer is incorrect
          "commonMisconceptions": ["Specific misconception 1", "Specific misconception 2"], // Only when answer is incorrect
          "recommendedResources": ["Specific resource 1", "Specific resource 2"]
        }
        
        IMPORTANT GUIDELINES:
        - Be SPECIFIC and DETAILED in your analysis
        - Avoid generic feedback that could apply to any answer
        - ALL feedback must be in English, not Vietnamese
        - Focus on providing constructive, educational feedback
      `;
    }

    // Prepare the messages array
    const messages = [
      {
        role: "system",
        content: systemPrompt
      }
    ];

    // If we have a file to analyze and it's for an assignment
    if (fileContent && questionContext.assignmentType === "submission") {
      // Determine if we need to process the file
      const isImageFile = fileContent.type.startsWith('image/');
      const isPdfFile = fileContent.type === 'application/pdf';
      const isTextFile = fileContent.type === 'text/plain' || 
                         fileContent.type === 'text/html' || 
                         fileContent.type === 'text/markdown';
      const isMusicFile = fileContent.type === 'audio/midi' || 
                          fileContent.type === 'audio/mpeg' || 
                          fileContent.type === 'audio/wav' ||
                          fileContent.type === 'audio/mp3' ||
                          fileContent.name.endsWith('.mxl') ||
                          fileContent.name.endsWith('.musicxml') ||
                          fileContent.name.endsWith('.xml');
      
      // Add file details to the context
      questionContext.fileDetails = {
        name: fileContent.name,
        type: fileContent.type,
        size: fileContent.size,
        lastModified: new Date(fileContent.lastModified).toISOString(),
        isMusicNotation: fileContent.name.endsWith('.mxl') || 
                         fileContent.name.endsWith('.musicxml') || 
                         fileContent.name.endsWith('.xml'),
        isAudio: fileContent.type.startsWith('audio/'),
        isImage: isImageFile,
        isPdf: isPdfFile,
        isText: isTextFile
      };
      
      if (isImageFile || isPdfFile) {
        // For image or PDF files, we'll use the vision capabilities
        try {
          // Convert file to base64
          const base64Content = await this.fileToBase64(fileContent);
          
          // Add the context as text and the file as an image
          messages.push({
            role: "user",
            content: [
              {
                type: "text",
                text: `
                # Assignment Analysis Request
                
                ## Student Information
                - Name: ${questionContext.studentName || "Not provided"}
                - Level: ${questionContext.studentLevel || "Not specified"}
                - Background: ${questionContext.studentBackground || "Not provided"}
                
                ## Assignment Information
                - Title: "${questionContext.title}"
                - Description: "${questionContext.description}"
                
                ## File Information
                - Filename: ${fileContent.name}
                - File type: ${fileContent.type}
                - File size: ${(fileContent.size / 1024).toFixed(2)} KB
                
                ## Analysis Instructions
                Please analyze this ${isImageFile ? 'image' : 'PDF'} in detail. 
                ${isImageFile && fileContent.name.toLowerCase().includes('sheet') ? 'This appears to be sheet music. Please analyze the musical notation, composition structure, harmony, melody, rhythm, and any technical elements.' : ''}
                ${isImageFile && fileContent.name.toLowerCase().includes('chord') ? 'This appears to be a chord diagram or progression. Please analyze the chord structure, harmony, and musical theory concepts shown.' : ''}
                ${isPdfFile ? 'This PDF may contain musical notation, theory, or composition. Please analyze all visible musical elements and concepts.' : ''}
                
                Provide specific, detailed feedback on the musical content and concepts shown.
                
                IMPORTANT: Please provide ALL feedback in Vietnamese language.
                `
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${fileContent.type};base64,${base64Content}`
                }
              }
            ]
          });
        } catch (error) {
          console.error('Error processing file for AI analysis:', error);
          // Fall back to text-only if file processing fails
          messages.push({
            role: "user",
            content: `[File processing failed] ${JSON.stringify(questionContext, null, 2)}`
          });
        }
      } else if (isTextFile) {
        // For text files, read the content and include it
        try {
          const textContent = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsText(fileContent);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
          });
          
          // Add both the context and file content
          messages.push({
            role: "user",
            content: `
              # Assignment Analysis Request
              
              ## Student Information
              - Name: ${questionContext.studentName || "Not provided"}
              - Level: ${questionContext.studentLevel || "Not specified"}
              - Background: ${questionContext.studentBackground || "Not provided"}
              
              ## Assignment Information
              - Title: "${questionContext.title}"
              - Description: "${questionContext.description}"
              
              ## File Information
              - Filename: ${fileContent.name}
              - File type: ${fileContent.type}
              - File size: ${(fileContent.size / 1024).toFixed(2)} KB
              
              ## File Content
              \`\`\`
              ${textContent}
              \`\`\`
              
              ## Analysis Instructions
              Please analyze this text content in detail, focusing on any musical theory concepts, composition techniques, or musical analysis present.
              Provide specific, detailed feedback on the musical content and concepts discussed.
              
              IMPORTANT: Please provide ALL feedback in Vietnamese language.
            `
          });
        } catch (error) {
          console.error('Error reading text file:', error);
          // Fall back to metadata only
          messages.push({
            role: "user",
            content: `[File reading failed] ${JSON.stringify(questionContext, null, 2)}`
          });
        }
      } else if (isMusicFile) {
        // For music files, we can't analyze the content directly but can provide metadata
        messages.push({
          role: "user",
          content: `
            # Assignment Analysis Request
            
            ## Student Information
            - Name: ${questionContext.studentName || "Not provided"}
            - Level: ${questionContext.studentLevel || "Not specified"}
            - Background: ${questionContext.studentBackground || "Not provided"}
            
            ## Assignment Information
            - Title: "${questionContext.title}"
            - Description: "${questionContext.description}"
            
            ## File Information
            - Filename: ${fileContent.name}
            - File type: ${fileContent.type}
            - File size: ${(fileContent.size / 1024).toFixed(2)} KB
            
            ## Analysis Instructions
            This is a music file (${fileContent.type === 'audio/midi' ? 'MIDI' : 
                                   fileContent.name.endsWith('.mxl') || fileContent.name.endsWith('.musicxml') || fileContent.name.endsWith('.xml') ? 'MusicXML/notation' : 
                                   'audio'}) which cannot be directly analyzed through this API.
            
            Please provide feedback based on the title and description, focusing on:
            1. What you would expect to find in a ${fileContent.type === 'audio/midi' ? 'MIDI file' : 
                                                   fileContent.name.endsWith('.mxl') || fileContent.name.endsWith('.musicxml') || fileContent.name.endsWith('.xml') ? 'music notation file' : 
                                                   'audio recording'} with this title and description
            2. Common elements to analyze in this type of music file
            3. Suggestions for improvement based on the student's description
            4. Resources specific to working with ${fileContent.type === 'audio/midi' ? 'MIDI' : 
                                                  fileContent.name.endsWith('.mxl') || fileContent.name.endsWith('.musicxml') || fileContent.name.endsWith('.xml') ? 'music notation' : 
                                                  'audio recordings'}
            
            IMPORTANT: Please provide ALL feedback in Vietnamese language.
          `
        });
      } else {
        // For other file types, just use the metadata
        messages.push({
          role: "user",
          content: `
            # Assignment Analysis Request
            
            ## Student Information
            - Name: ${questionContext.studentName || "Not provided"}
            - Level: ${questionContext.studentLevel || "Not specified"}
            - Background: ${questionContext.studentBackground || "Not provided"}
            
            ## Assignment Information
            - Title: "${questionContext.title}"
            - Description: "${questionContext.description}"
            
            ## File Information
            - Filename: ${fileContent.name}
            - File type: ${fileContent.type}
            - File size: ${(fileContent.size / 1024).toFixed(2)} KB
            
            ## Analysis Instructions
            The file type "${fileContent.type}" cannot be directly analyzed through this API.
            Please provide feedback based on the title and description of the assignment.
            If the filename suggests it contains musical content (e.g., composition, analysis, etc.), 
            please provide feedback on what you would expect to find in such a file and suggestions
            for improvement based on best practices in music theory and composition.
            
            IMPORTANT: Please provide ALL feedback in Vietnamese language.
          `
        });
      }
    } else {
      // Standard text-only message for exercises or assignments without files
      messages.push({
        role: "user",
        content: JSON.stringify(questionContext, null, 2)
      });
    }

    // Determine which model to use based on whether we're using vision capabilities
    const useVisionModel = fileContent && 
                          (fileContent.type.startsWith('image/') || 
                           fileContent.type === 'application/pdf');
    
    // Get model from environment variables
    const modelToUse = useVisionModel ? 
                      'gpt-4-turbo-2024-04-09' : 
                      getEnvVariable('REACT_APP_OPENAI_MODEL', 'gpt-4');

    try {
      // Make the API call to OpenAI
      console.log('Making API call to OpenAI with model:', modelToUse);
      const apiUrl = getEnvVariable('REACT_APP_OPENAI_API_URL', 'https://api.openai.com/v1/chat/completions');
      console.log('API URL:', apiUrl);
      
      // Prepare the request payload
      const payload = {
        model: modelToUse,
        messages: messages,
        max_tokens: 4000
      };

      // If using vision model, add specific configuration
      if (useVisionModel) {
        payload.max_tokens = 4096;  // Maximum for vision model
        payload.temperature = 0.7;
      }

      const response = await axios.post(
        apiUrl,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          timeout: AI_SERVICE_CONFIG.openai.defaultTimeout,
        }
      );

      console.log('API call successful');
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      // Parse the response from GPT-4
      const gptResponse = response.data.choices[0].message.content;
      
      try {
        // Try to parse the JSON response
        const parsedResponse = JSON.parse(gptResponse);
        // Format the feedback before returning
        return this.formatAIFeedback(parsedResponse);
      } catch (parseError) {
        console.error('Error parsing GPT response as JSON:', parseError);
        console.log('Raw GPT response:', gptResponse);
        
        // Kiểm tra nếu phản hồi có dạng code block markdown
        if (gptResponse.includes('```json') || gptResponse.includes('```')) {
          try {
            // Tìm vị trí bắt đầu và kết thúc của JSON
            const jsonStartIndex = gptResponse.indexOf('{');
            const jsonEndIndex = gptResponse.lastIndexOf('}') + 1;
            
            if (jsonStartIndex >= 0 && jsonEndIndex > jsonStartIndex) {
              const jsonStr = gptResponse.substring(jsonStartIndex, jsonEndIndex);
              const parsedJson = JSON.parse(jsonStr);
              return this.formatAIFeedback(parsedJson);
            }
          } catch (extractError) {
            console.error('Error extracting JSON from markdown:', extractError);
          }
        }
        
        // If parsing fails, create a simple feedback object from the text
        return {
          feedbackText: gptResponse,
          confidenceScore: 0.7
        };
      }
    } catch (error) {
      console.error('Error calling OpenAI API:', error.message);
      console.error('Error name:', error.name);
      console.error('Error stack:', error.stack);
      
      // Check for specific error responses
      if (error.response) {
        console.error('API error status:', error.response.status);
        console.error('API error data:', JSON.stringify(error.response.data, null, 2));
        console.error('API error headers:', JSON.stringify(error.response.headers, null, 2));
        
        // Check for specific error messages related to permissions
        const errorMessage = error.response.data?.error?.message || '';
        console.error('Error message from API:', errorMessage);
        
        if (errorMessage.includes('auth method') && errorMessage.includes('inference')) {
          console.error('API key permission issue: Inference not allowed');
          return {
            error: true,
            errorType: 'auth_error',
            errorMessage: 'Your API key doesn\'t have permission to make inference requests. Please check your OpenAI account settings and ensure your API key has the correct permissions.',
            feedbackText: 'Unable to generate feedback due to API key permission issues.'
          };
        }
        
        if (errorMessage.includes('permission') || errorMessage.includes('not authorized')) {
          console.error('API key permission issue detected');
          return {
            error: true,
            errorType: 'auth_error',
            errorMessage: 'Your API key doesn\'t have the required permissions. Please check your OpenAI account settings.',
            feedbackText: 'Unable to generate feedback due to API key permission issues.'
          };
        }
        
        if (errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
          console.error('Account quota or rate limit issue');
          return {
            error: true,
            errorType: 'quota_error',
            errorMessage: 'Your OpenAI account has reached its quota or rate limit. Please check your billing status.',
            feedbackText: 'Unable to generate feedback due to account quota or rate limit issues.'
          };
        }
        
        if (error.response.status === 401) {
          return {
            error: true,
            errorType: 'auth_error',
            errorMessage: 'Invalid API key. Please check your OpenAI API key in the configuration.',
            feedbackText: 'Unable to generate feedback due to authentication error.'
          };
        }
        
        if (error.response.status === 429) {
          console.error('Rate limit exceeded (429 Too Many Requests)');
          
          // Check if this is a tier/quota issue or just a rate limit
          const retryAfter = error.response.headers['retry-after'] || error.response.headers['x-ratelimit-reset-requests'];
          const isBillingIssue = errorMessage.includes('billing') || errorMessage.includes('quota');
          
          if (isBillingIssue) {
            return {
              error: true,
              errorType: 'quota_error',
              errorMessage: 'You have exceeded your current OpenAI API usage quota. Please check your billing details and limits at https://platform.openai.com/account/billing.',
              feedbackText: 'Unable to generate feedback because your OpenAI account has reached its usage limit.'
            };
          } else {
            return {
              error: true,
              errorType: 'rate_limit',
              errorMessage: `Rate limit exceeded. Please try again ${retryAfter ? `after ${retryAfter} seconds` : 'in a few minutes'}.`,
              retryAfter: retryAfter ? parseInt(retryAfter) : 60,
              feedbackText: 'Unable to generate feedback due to OpenAI rate limiting. This typically happens when making too many requests in a short period.'
            };
          }
        }
        
        if (error.response.status === 500) {
          return {
            error: true,
            errorType: 'server_error',
            errorMessage: 'OpenAI server error. Please try again later.',
            feedbackText: 'Unable to generate feedback due to server error.'
          };
        }
        
        // Generic error with the actual error message from OpenAI
        return {
          error: true,
          errorType: 'api_error',
          errorMessage: `OpenAI API error: ${errorMessage || 'Unknown error'}`,
          feedbackText: 'Unable to generate feedback due to an API error.'
        };
      }
      
      // Network or other errors
      return {
        error: true,
        errorType: 'network_error',
        errorMessage: `Network or other error: ${error.message}`,
        feedbackText: 'Unable to generate feedback due to a network or system error.'
      };
    }
  }

  /**
   * Determine the music domain based on submission details
   * 
   * @param {string} title - Submission title
   * @param {string} description - Submission description
   * @param {string} fileName - Name of the submitted file
   * @returns {string} - Identified music domain
   */
  determineMusicDomain(title, description, fileName) {
    const combinedText = `${title} ${description} ${fileName}`.toLowerCase();
    
    // Check for common music theory domains
    if (combinedText.includes('harmony') || combinedText.includes('chord') || combinedText.includes('progression')) {
      return 'harmony and chord progressions';
    } else if (combinedText.includes('melody') || combinedText.includes('melodic')) {
      return 'melodic composition and analysis';
    } else if (combinedText.includes('rhythm') || combinedText.includes('beat') || combinedText.includes('tempo')) {
      return 'rhythm and meter';
    } else if (combinedText.includes('composition') || combinedText.includes('compose')) {
      return 'music composition';
    } else if (combinedText.includes('analysis') || combinedText.includes('analyze')) {
      return 'music analysis';
    } else if (combinedText.includes('notation') || combinedText.includes('sheet music')) {
      return 'music notation';
    } else if (combinedText.includes('performance') || combinedText.includes('playing')) {
      return 'music performance';
    } else if (combinedText.includes('history') || combinedText.includes('historical')) {
      return 'music history';
    } else if (combinedText.includes('ear training') || combinedText.includes('aural')) {
      return 'ear training and aural skills';
    } else {
      return 'general music theory';
    }
  }

  /**
   * Generate feedback for multiple questions
   * 
   * @param {Array} questionsContext - Array of question contexts
   * @returns {Promise<Object>} - Object with feedback for each question indexed by question index
   */
  async generateBatchFeedback(questionsContext) {
    try {
      const feedbackResults = {};
      
      // Process each question sequentially to avoid rate limiting
      for (const [index, context] of questionsContext.entries()) {
        if (!context) continue;
        
        const feedback = await this.generateFeedback(context);
        feedbackResults[index] = feedback;
      }
      
      return feedbackResults;
    } catch (error) {
      console.error('Error generating batch AI feedback:', error);
      throw error;
    }
  }

  /**
   * Generate mock feedback for development/testing
   * 
   * @param {Object} questionContext - Context about the question and user's answer
   * @returns {Object} - Mock AI feedback
   */
  generateMockFeedback(questionContext) {
    // Simulate API delay
    return new Promise(resolve => {
      setTimeout(() => {
        // Check if this is an assignment submission
        if (questionContext.assignmentType === "submission") {
          // Analyze the submission quality based on title and description
          const title = questionContext.title || "";
          const description = questionContext.description || "";
          
          // Check if the submission seems low quality (very short or generic)
          const isLowQuality = 
            (title.length < 10 || description.length < 30) || 
            (title.toLowerCase().includes('test') && description.toLowerCase().includes('test'));
          
          // Check if it seems like random input
          const seemsRandom = 
            /[a-z]{1,3}/.test(title) || 
            /[a-z]{1,3}/.test(description) ||
            title.toLowerCase().includes('asdf') ||
            description.toLowerCase().includes('asdf');
          
          if (seemsRandom) {
            // Feedback for random/nonsense submissions
            resolve(this.formatAIFeedback({
              requirementAnalysis: "The assignment requires the student to complete a task related to music theory based on the title and description.",
              titleDescriptionAssessment: "The title and description do not appear to be relevant to the assignment. They contain random text that does not provide any meaningful context for the submission.",
              submissionAssessment: "The submission does not meet the requirements. The content appears to be random text or a test rather than an actual music theory assignment.",
              feedbackText: `I've reviewed your submission titled "${questionContext.title}". This appears to be random text or a test submission rather than a genuine music theory assignment. Please submit a proper assignment with meaningful content for detailed feedback.`,
              suggestions: "Please submit a proper assignment with a clear title, detailed description, and relevant file content related to music theory.",
              confidenceScore: 0.95,
              strengths: ["No specific strengths to highlight as this appears to be a test submission."],
              improvementAreas: "This submission doesn't contain meaningful content for analysis. Please provide a genuine music theory assignment that demonstrates your understanding and skills.",
              recommendedResources: ["Music Theory Fundamentals Guide", "How to Write Effective Music Analysis"],
              score: 7.5,
              scoreJustification: "This is a default score since the submission could not be properly evaluated due to its random nature."
            }));
          } else if (isLowQuality) {
            // Feedback for low quality but not random submissions
            resolve(this.formatAIFeedback({
              requirementAnalysis: "The assignment requires the student to complete a task related to music theory based on the title and description.",
              titleDescriptionAssessment: "The title is very brief and lacks specificity. The description is minimal and does not provide sufficient context for evaluating the submission in relation to music theory concepts.",
              submissionAssessment: "The submission only partially meets the requirements. The content provided is too brief, making comprehensive evaluation difficult.",
              feedbackText: `I've reviewed your submission titled "${questionContext.title}". The content provided is quite minimal, making it difficult to provide comprehensive feedback. For better feedback, please provide more detailed information about your music theory work.`,
              suggestions: "Expand your description with specific details about the musical concepts you're working with. Include information about the techniques, theory, or composition elements you've applied.",
              confidenceScore: 0.85,
              strengths: ["You've initiated the submission process correctly", "The title gives a basic indication of the topic"],
              improvementAreas: "The description is too brief to demonstrate your understanding of music theory concepts. More detailed content would allow for meaningful feedback on your work.",
              recommendedResources: ["Guide to Music Theory Documentation", "How to Describe Musical Compositions Effectively"],
              score: 7.5,
              scoreJustification: "This score reflects a partial completion of the assignment with room for significant improvement in the level of detail provided."
            }));
          } else {
            // Standard mock feedback for reasonable submissions
            resolve(this.formatAIFeedback({
              requirementAnalysis: "The assignment requires the student to complete a task related to music theory based on the title \"" + questionContext.title + "\" and the provided description.",
              titleDescriptionAssessment: "The title is appropriate and clearly indicates the subject matter. The description provides adequate context but could be more detailed to better explain the specific musical concepts being addressed.",
              submissionAssessment: "The submission meets the basic requirements of the assignment, but needs more detail for a complete evaluation.",
              feedbackText: `I've reviewed your assignment titled "${questionContext.title}". Based on the information provided, this appears to be related to music theory, but I would need to see the actual content of your work to provide specific feedback. The description gives some context, but detailed analysis would require examining the musical elements in your submission.`,
              suggestions: "Consider providing more specific examples in your description. Also, make sure your submitted file clearly demonstrates the music theory concepts you're working with.",
              confidenceScore: 0.7,
              strengths: ["Clear title that indicates the subject matter", "Description provides basic context for the assignment", "Submission follows the required format"],
              improvementAreas: "The description could benefit from more technical details about the specific music theory elements you're exploring. Without seeing the actual content of your work, it's difficult to provide targeted feedback.",
              recommendedResources: ["Music Theory Fundamentals Guide", "Composition Techniques for Beginners", "Notation and Analysis Resources"],
              score: 7.5,
              scoreJustification: "This score reflects a satisfactory submission that meets the basic requirements but has room for improvement in providing more detailed content."
            }));
          }
        } else if (questionContext.isCorrect) {
          resolve(this.formatAIFeedback({
            feedbackText: `Correct! ${questionContext.explanation || 'You have selected the right answer.'}`,
            suggestions: "Keep up the good work!",
            confidenceScore: 0.95,
            strengths: ["Good understanding of the concept", "Correct application of theory"],
          }));
        } else {
          let explanation = "";
          
          if (questionContext.questionType === "multipleChoice") {
            const correctOptionText = questionContext.options.find(
              option => option === questionContext.correctAnswer
            );
            explanation = `The correct answer is: ${correctOptionText}. ${questionContext.explanation || ''}`;
          } else if (questionContext.questionType === "trueFalse") {
            explanation = `The correct answer is: ${questionContext.correctAnswer === 'true' ? 'True' : 'False'}. ${questionContext.explanation || ''}`;
          }
          
          resolve(this.formatAIFeedback({
            feedbackText: `Incorrect. ${explanation}`,
            suggestions: "Review the theory related to this question.",
            improvementAreas: "Pay more attention to the details in the question.",
            confidenceScore: 0.85,
            commonMisconceptions: ["Confusion between concepts", "Incomplete understanding of basic theory"],
            recommendedResources: ["Lesson 3 - Basic Theory", "Tutorial Video - Part 2"]
          }));
        }
      }, 500);
    });
  }

  /**
   * Get the current active AI provider
   * 
   * @returns {string} - Name of the active provider ('openai')
   */
  getActiveProvider() {
    return AI_SERVICE_CONFIG.activeProvider;
  }

  /**
   * Get the configuration for the specified provider
   * 
   * @param {string} provider - Provider name ('openai')
   * @returns {Object} - Provider configuration
   */
  getProviderConfig(provider) {
    return AI_SERVICE_CONFIG[provider];
  }

  /**
   * Check if fallback is enabled
   * 
   * @returns {boolean} - Whether fallback is enabled
   */
  isFallbackEnabled() {
    return AI_SERVICE_CONFIG.useFallback;
  }
}

export default new AIFeedbackService(); 