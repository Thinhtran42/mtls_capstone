import {
  Box,
  Typography,
  Paper,
  TextField,
  Input,
  Button,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  AlertTitle,
  Chip,
  Link as MuiLink,
} from "@mui/material";
import {
  SmartToy,
  Settings,
  Psychology,
  CheckCircleOutline,
  MenuBook,
  OpenInNew,
  Refresh
} from "@mui/icons-material";
import AIModelInfo from "../common/AIModelInfo";
import { Link } from "react-router-dom";

const AssignmentContent = ({
  content,
  isCurrentSectionCompleted,
  file,
  submissionTitle,
  submissionName,
  submissionDescription,
  aiFeedback,
  isGeneratingFeedback,
  feedbackCancelled,
  navigate,
  handleFileChange,
  setSubmissionTitle,
  setSubmissionDescription,
  handleSubmitAssignment,
  generateAssignmentAIFeedback,
  setFeedbackCancelled,
  setIsGeneratingFeedback,
  activeProvider,
  providerConfig,
  hasFallback,
  modelName,
  getStudentInfo,
  isWebLink,
  ensureHttpPrefix,
  currentCourse,
  currentModule,
  selectedSection,
  hideAIFeatures = true  // Default to hiding AI features
}) => {
  if (!content || content.length === 0) {
    return <Typography>There is no content in this assignment.</Typography>;
  }

  return (
    <Box
      sx={{
        maxWidth: "800px",
        width: "100%",
      }}
    >
      {/* Hiển thị thông tin về AI model - only show if not hidden */}
      {!hideAIFeatures && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <AIModelInfo
            modelName={modelName}
            isActive={file !== null || isCurrentSectionCompleted}
            provider={activeProvider}
            hasFallback={hasFallback}
          />
          <Button
            variant="text"
            size="small"
            startIcon={<Settings />}
            onClick={() => navigate('/admin/ai-config')}
            sx={{ ml: 2 }}
          >
            Cấu hình AI
          </Button>
        </Box>
      )}

      {/* AI model info for images - only show if not hidden */}
      {!hideAIFeatures && file && providerConfig.model === 'gpt-4o' && file.type.startsWith('image/') && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Bạn đang sử dụng GPT-4o. Model này có thể phân tích trực tiếp nội dung hình ảnh của bạn
            và cung cấp phản hồi chi tiết về các yếu tố âm nhạc trong hình ảnh.
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Phản hồi sẽ được cung cấp bằng tiếng Việt để dễ dàng hiểu và áp dụng.
          </Typography>
        </Alert>
      )}

      <Paper
        elevation={3}
        sx={{
          p: 3,
          borderRadius: "8px",
          backgroundColor: "#f9f9f9",
          mb: 3
        }}
      >
        {content.map((item, index) => (
          <Box key={index} sx={{ mb: 3 }}>
            {item.type === "submission" ? (
              <>
                <Typography sx={{ fontSize: "1.2rem", fontWeight: 600, mb: 2 }}>
                  Assignment: {item.data && item.data.question ? item.data.question : ""}
                </Typography>
                <Typography
                  color="text.secondary"
                  sx={{ mb: 2, fontStyle: "italic" }}
                >
                  {item.data && item.data.submissionInstructions ? item.data.submissionInstructions : ""}
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  Allowed file formats: {item.data && item.data.allowedFileTypes ? item.data.allowedFileTypes.join(", ") : "All formats"}
                </Typography>
                {!isCurrentSectionCompleted && (
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    <TextField
                      label="Title"
                      value={submissionTitle}
                      onChange={(e) => setSubmissionTitle(e.target.value)}
                      fullWidth
                      variant="outlined"
                      required
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      label="Description"
                      value={submissionDescription}
                      onChange={(e) => setSubmissionDescription(e.target.value)}
                      fullWidth
                      variant="outlined"
                      multiline
                      rows={3}
                      sx={{ mb: 2 }}
                    />
                    <Input
                      type="file"
                      onChange={handleFileChange}
                      inputProps={{
                        accept: item.data && item.data.allowedFileTypes ? item.data.allowedFileTypes.join(",") : "*",
                      }}
                      sx={{ mb: 2 }}
                    />

                    {/* AI Feedback Request Button - only show if not hidden */}
                    {!hideAIFeatures && file && submissionTitle && submissionDescription && !isGeneratingFeedback && !feedbackCancelled && (
                      <Box sx={{ mb: 2 }}>
                        <Button
                          variant="outlined"
                          color="primary"
                          startIcon={<SmartToy />}
                          onClick={generateAssignmentAIFeedback}
                          sx={{ borderRadius: 2, mb: 1 }}
                        >
                          Get Personalized AI Feedback
                        </Button>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 1 }}>
                          AI will analyze your assignment details and the content of your uploaded file, providing personalized feedback based on your progress in the course.
                          {file && file.type.startsWith('image/') && " The AI will analyze the visual content, musical notation, and theory concepts in your image."}
                          {file && file.name.toLowerCase().includes('sheet') && " Sheet music will be analyzed for notation, harmony, melody, and composition structure."}
                          {file && file.type === 'application/pdf' && " The AI will analyze the text and visual content of your PDF, including any musical notation or theory."}
                          {file && file.type === 'text/plain' && " The AI will analyze the musical concepts and theory in your text content."}
                          {file && (file.type === 'audio/midi' || file.type === 'audio/mpeg' || file.type === 'audio/wav' || file.type === 'audio/mp3') && " For audio files, the AI will provide feedback based on your description and title."}
                        </Typography>
                      </Box>
                    )}

                    {/* Try Again button - only show if not hidden */}
                    {!hideAIFeatures && feedbackCancelled && !isGeneratingFeedback && (
                      <Box sx={{ mb: 2 }}>
                        <Button
                          variant="outlined"
                          color="primary"
                          startIcon={<SmartToy />}
                          onClick={() => {
                            setFeedbackCancelled(false);
                            generateAssignmentAIFeedback();
                          }}
                          sx={{ borderRadius: 2, mb: 1 }}
                        >
                          Try AI Feedback Again
                        </Button>
                      </Box>
                    )}

                    {/* AI feedback generation indicator - only show if not hidden */}
                    {!hideAIFeatures && isGeneratingFeedback && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                        <CircularProgress size={24} sx={{ mr: 1 }} />
                        <Typography sx={{ flexGrow: 1 }}>Creating personalized feedback based on your submission and course progress (this may take up to 2 minutes)...</Typography>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => {
                            setIsGeneratingFeedback(false);
                            setFeedbackCancelled(true);
                          }}
                          sx={{ ml: 2 }}
                        >
                          Cancel
                        </Button>
                      </Box>
                    )}

                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSubmitAssignment}
                      disabled={!file || !submissionTitle || !submissionName}
                    >
                      Submit
                    </Button>
                  </Box>
                )}
                {isCurrentSectionCompleted && (
                  <Typography color="success.main" sx={{ fontWeight: 500 }}>
                    Assignment has been submitted!
                  </Typography>
                )}
              </>
            ) : item.type === "text" ? (
              <Typography sx={{ fontSize: "1rem", mb: 2 }}>
                {item.data}
              </Typography>
            ) : (
              <Typography>Content type unknown: {item.type}</Typography>
            )}
          </Box>
        ))}
      </Paper>

      {/* AI Feedback Display - only show if not hidden */}
      {!hideAIFeatures && aiFeedback && aiFeedback.assignment && (
        <Paper
          elevation={3}
          sx={{
            p: 3,
            borderRadius: "8px",
            mb: 3
          }}
        >
          <Box
            sx={{
              p: 2,
              bgcolor: aiFeedback.assignment.error ? '#fff8f8' : '#f8f8ff',
              border: `1px solid ${aiFeedback.assignment.error ? '#ffcccc' : '#e0e0e0'}`,
              borderRadius: 1
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Psychology sx={{ mr: 1, color: aiFeedback.assignment.error ? 'error.main' : 'primary.main' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                {aiFeedback.assignment.error ? 'AI Error' : 'Personalized AI Feedback'}
              </Typography>
            </Box>

            {aiFeedback.assignment.error ? (
              <>
                <Typography variant="body1" sx={{ mb: 1, color: 'error.main' }}>
                  {aiFeedback.assignment.errorMessage || 'An error occurred while generating AI feedback.'}
                </Typography>
                {aiFeedback.assignment.errorType === 'auth_error' && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      This error typically occurs when your API key doesn&apos;t have the necessary permissions for inference requests. To fix this:
                    </Typography>
                    <Typography component="ol" variant="body2" sx={{ pl: 2 }}>
                      <li>Go to <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">OpenAI API Keys</a></li>
                      <li>Create a new API key with <strong>no scope restrictions</strong></li>
                      <li>Copy the new key and update it in the AI configuration</li>
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ mt: 1 }}
                      component={Link}
                      to="/admin/ai-config"
                    >
                      Go to AI Configuration
                    </Button>
                  </Box>
                )}
                {aiFeedback.assignment.errorType === 'quota_error' && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      This error occurs when you&apos;ve reached your OpenAI usage limits. To fix this:
                    </Typography>
                    <Typography component="ol" variant="body2" sx={{ pl: 2 }}>
                      <li>Check your <a href="https://platform.openai.com/account/billing/overview" target="_blank" rel="noopener noreferrer">billing status</a> on OpenAI</li>
                      <li>Ensure you have a payment method set up at <a href="https://platform.openai.com/account/billing/payment-methods" target="_blank" rel="noopener noreferrer">payment methods</a></li>
                      <li>If you&apos;re on a free tier, consider upgrading to a paid account</li>
                      <li>Check your <a href="https://platform.openai.com/account/limits" target="_blank" rel="noopener noreferrer">rate limits</a> to understand your current usage</li>
                    </Typography>
                    <Alert severity="info" sx={{ mt: 2 }}>
                      New OpenAI accounts have a $5 credit that expires after 3 months. After that, you need to add a payment method to continue using the API.
                    </Alert>
                    <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        component="a"
                        href="https://platform.openai.com/account/billing/overview"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Check Billing Status
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        component={Link}
                        to="/admin/ai-config"
                      >
                        Go to AI Configuration
                      </Button>
                    </Box>
                  </Box>
                )}
                {aiFeedback.assignment.errorType === 'rate_limit' && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      You&apos;ve hit a rate limit with the OpenAI API. This typically happens when making too many requests in a short period.
                    </Typography>
                    {aiFeedback.assignment.retryAfter ? (
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Please wait <strong>{aiFeedback.assignment.retryAfter}</strong> seconds before trying again.
                      </Typography>
                    ) : (
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Please wait a few minutes before trying again.
                      </Typography>
                    )}
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ mt: 1 }}
                      onClick={generateAssignmentAIFeedback}
                      startIcon={<Refresh />}
                    >
                      Retry Now
                    </Button>
                  </Box>
                )}
              </>
            ) : (
              <>
                {/* Check if feedback indicates low quality submission */}
                {aiFeedback.assignment.strengths &&
                 aiFeedback.assignment.strengths.length === 1 &&
                 aiFeedback.assignment.strengths[0].includes("No specific strengths") && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    <Typography variant="subtitle2">Low Quality Submission Detected</Typography>
                    <Typography variant="body2">
                      Your submission appears to be incomplete or a test. For meaningful feedback, please provide a proper assignment with detailed content.
                    </Typography>
                  </Alert>
                )}

                {/* Student Level Info */}
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <Chip
                    size="small"
                    label={`${getStudentInfo().level.charAt(0).toUpperCase() + getStudentInfo().level.slice(1)} Level`}
                    color={
                      getStudentInfo().level === 'beginner' ? 'success' :
                      getStudentInfo().level === 'intermediate' ? 'primary' :
                      'secondary'
                    }
                    sx={{ mr: 1 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Feedback tailored to your current level and course progress
                  </Typography>
                </Box>

                {/* Check if submission has been assessed for correctness */}
                {aiFeedback.assignment.submissionAssessment && (
                  <Alert
                    severity={
                      aiFeedback.assignment.submissionAssessment.toLowerCase().includes('đúng') ||
                      aiFeedback.assignment.submissionAssessment.toLowerCase().includes('chính xác') ||
                      aiFeedback.assignment.submissionAssessment.toLowerCase().includes('hoàn thành') ?
                      'success' : 'warning'
                    }
                    sx={{ mb: 2 }}
                  >
                    <AlertTitle>Đánh giá bài làm</AlertTitle>
                    {aiFeedback.assignment.submissionAssessment}
                  </Alert>
                )}

                {/* Overall Feedback */}
                <Typography variant="body1" sx={{ mb: 2, fontWeight: 'medium' }}>
                  {aiFeedback.assignment.formattedText ? (
                    // Nếu có formattedText, hiển thị nó với định dạng
                    <>
                      {aiFeedback.assignment.formattedText.split('\n').map((line, index) => {
                        // Kiểm tra nếu là tiêu đề (bắt đầu bằng **)
                        if (line.startsWith('**') && line.endsWith(':**')) {
                          return (
                            <Typography
                              key={index}
                              variant="subtitle1"
                              sx={{
                                fontWeight: 'bold',
                                color:
                                  line.includes('ĐIỂM MẠNH') ? 'success.main' :
                                  line.includes('ĐIỂM CẦN CẢI THIỆN') ? 'warning.main' :
                                  line.includes('GỢI Ý') ? 'info.main' :
                                  line.includes('TÀI LIỆU') ? 'primary.main' : 'text.primary',
                                mt: 2,
                                mb: 1
                              }}
                            >
                              {line.replace(/\*\*/g, '')}
                            </Typography>
                          );
                        }
                        // Kiểm tra nếu là mục danh sách (bắt đầu bằng số và dấu chấm)
                        else if (/^\d+\.\s/.test(line)) {
                          // Kiểm tra xem dòng có chứa tên miền không
                          const extractedText = line.substring(line.indexOf('.') + 1).trim();
                          const containsWebLink = isWebLink(extractedText);

                          // Kiểm tra xem dòng có chứa tên miền cụ thể không
                          const specificDomains = ['musictheory.net', 'teoria.com', 'openai.com', 'github.com'];
                          const domainMatch = specificDomains.find(domain => line.includes(domain));

                          if (containsWebLink || domainMatch) {
                            // Nếu là mục danh sách có chứa liên kết web
                            return (
                              <Box key={index} sx={{ display: 'flex', ml: 2, mb: 0.5 }}>
                                <Typography variant="body2" sx={{ fontWeight: 'medium', mr: 1 }}>
                                  {line.split('.')[0]}.
                                </Typography>
                                <Typography variant="body2">
                                  {domainMatch ? (
                                    <>
                                      {line.substring(line.indexOf('.') + 1).split(domainMatch)[0]}
                                      <MuiLink
                                        href={ensureHttpPrefix(domainMatch)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        sx={{
                                          color: 'primary.main',
                                          textDecoration: 'none',
                                          '&:hover': {
                                            textDecoration: 'underline',
                                          },
                                        }}
                                      >
                                        {domainMatch} <OpenInNew fontSize="small" sx={{ fontSize: '0.8rem', ml: 0.5, verticalAlign: 'text-top' }} />
                                      </MuiLink>
                                      {line.substring(line.indexOf('.') + 1).split(domainMatch)[1] || ''}
                                    </>
                                  ) : (
                                    <MuiLink
                                      href={ensureHttpPrefix(extractedText)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      sx={{
                                        color: 'primary.main',
                                        textDecoration: 'none',
                                        '&:hover': {
                                          textDecoration: 'underline',
                                        },
                                      }}
                                    >
                                      {extractedText} <OpenInNew fontSize="small" sx={{ fontSize: '0.8rem', ml: 0.5, verticalAlign: 'text-top' }} />
                                    </MuiLink>
                                  )}
                                </Typography>
                              </Box>
                            );
                          } else {
                            // Mục danh sách thông thường không có liên kết web
                            return (
                              <Box key={index} sx={{ display: 'flex', ml: 2, mb: 0.5 }}>
                                <Typography variant="body2" sx={{ fontWeight: 'medium', mr: 1 }}>
                                  {line.split('.')[0]}.
                                </Typography>
                                <Typography variant="body2">
                                  {line.substring(line.indexOf('.') + 1)}
                                </Typography>
                              </Box>
                            );
                          }
                        }
                        // Dòng trống
                        else if (line.trim() === '') {
                          return <Box key={index} sx={{ height: '0.5rem' }} />;
                        }
                        // Dòng văn bản thông thường
                        else {
                          // Kiểm tra xem dòng có chứa tên miền cụ thể không
                          const specificDomains = ['musictheory.net', 'teoria.com', 'openai.com', 'github.com'];
                          const domainMatch = specificDomains.find(domain => line.includes(domain));

                          if (domainMatch) {
                            return (
                              <Typography key={index} variant="body2" paragraph sx={{ ml: line.startsWith(' ') ? 2 : 0, mb: 1 }}>
                                {line.split(domainMatch)[0]}
                                <MuiLink
                                  href={ensureHttpPrefix(domainMatch)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  sx={{
                                    color: 'primary.main',
                                    textDecoration: 'none',
                                    '&:hover': {
                                      textDecoration: 'underline',
                                    },
                                  }}
                                >
                                  {domainMatch} <OpenInNew fontSize="small" sx={{ fontSize: '0.8rem', ml: 0.5, verticalAlign: 'text-top' }} />
                                </MuiLink>
                                {line.split(domainMatch)[1] || ''}
                              </Typography>
                            );
                          } else {
                            return (
                              <Typography key={index} variant="body2" paragraph sx={{ ml: line.startsWith(' ') ? 2 : 0, mb: 1 }}>
                                {line}
                              </Typography>
                            );
                          }
                        }
                      })}
                    </>
                  ) : (
                    // Nếu không có formattedText, hiển thị feedbackText như trước
                    aiFeedback.assignment.feedbackText
                  )}
                </Typography>

                {/* Chỉ hiển thị các phần riêng lẻ nếu không có formattedText */}
                {!aiFeedback.assignment.formattedText && (
                  <>
                    {/* Strengths */}
                    {aiFeedback.assignment.strengths && aiFeedback.assignment.strengths.length > 0 &&
                    !aiFeedback.assignment.strengths[0].includes("No specific strengths") && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                          Your Strengths:
                        </Typography>
                        <List dense disablePadding>
                          {aiFeedback.assignment.strengths.map((strength, i) => (
                            <ListItem key={i} sx={{ py: 0.5 }}>
                              <ListItemIcon sx={{ minWidth: 30 }}>
                                <CheckCircleOutline color="success" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText primary={strength} />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}

                    {/* Improvement Areas */}
                    {aiFeedback.assignment.improvementAreas && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                          Areas for Your Improvement:
                        </Typography>
                        <Typography variant="body2" sx={{ ml: 4 }}>
                          {aiFeedback.assignment.improvementAreas}
                        </Typography>
                      </Box>
                    )}

                    {/* Suggestions */}
                    {aiFeedback.assignment.suggestions && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                          Personalized Suggestions:
                        </Typography>
                        <Typography variant="body2" sx={{ ml: 4 }}>
                          {aiFeedback.assignment.suggestions}
                        </Typography>
                      </Box>
                    )}

                    {/* Recommended Resources */}
                    {aiFeedback.assignment.recommendedResources && aiFeedback.assignment.recommendedResources.length > 0 && (
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                          Recommended Resources for Your Level:
                        </Typography>
                        <List dense disablePadding>
                          {aiFeedback.assignment.recommendedResources.map((resource, i) => (
                            <ListItem key={i} sx={{ py: 0.5 }}>
                              <ListItemIcon sx={{ minWidth: 30 }}>
                                <MenuBook color="primary" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText
                                primary={
                                  isWebLink(resource) ? (
                                    <MuiLink
                                      href={ensureHttpPrefix(resource)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      sx={{
                                        color: 'primary.main',
                                        textDecoration: 'none',
                                        '&:hover': {
                                          textDecoration: 'underline',
                                        },
                                      }}
                                    >
                                      {resource} <OpenInNew fontSize="small" sx={{ fontSize: '0.8rem', ml: 0.5, verticalAlign: 'text-top' }} />
                                    </MuiLink>
                                  ) : (
                                    resource
                                  )
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}
                  </>
                )}
              </>
            )}
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default AssignmentContent; 