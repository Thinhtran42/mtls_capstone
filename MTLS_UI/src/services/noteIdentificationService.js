import exercisesData from '../data/noteIdentificationExercises.json';

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Get all available exercises
export const getAllExercises = async () => {
  // Simulate API call
  await delay(300);
  return exercisesData.exercises;
};

// Get a specific exercise by ID
export const getExerciseById = async (exerciseId) => {
  // Simulate API call
  await delay(200);
  const exercise = exercisesData.exercises.find(ex => ex.id === exerciseId);
  
  if (!exercise) {
    throw new Error(`Exercise with ID ${exerciseId} not found`);
  }
  
  return exercise;
};

// Get user progress
export const getUserProgress = async (userId) => {
  // Simulate API call
  await delay(200);
  
  // In a real API, you would fetch the user's progress based on their ID
  // For now, we'll just return the mock data
  if (exercisesData.userProgress.userId === userId) {
    return exercisesData.userProgress;
  }
  
  // If no progress found, return default progress
  return {
    userId,
    completedExercises: [],
    currentExercise: null
  };
};

// Save user progress
export const saveUserProgress = async (userId, progressData) => {
  // Simulate API call
  await delay(300);
  
  // In a real API, you would save this data to the database
  console.log('Saving progress for user:', userId, progressData);
  
  // Return success response
  return {
    success: true,
    message: 'Progress saved successfully'
  };
};

// Save completed exercise
export const saveCompletedExercise = async (userId, exerciseResult) => {
  // Simulate API call
  await delay(300);
  
  // In a real API, you would save this data to the database
  console.log('Saving completed exercise for user:', userId, exerciseResult);
  
  // Return success response
  return {
    success: true,
    message: 'Exercise completion saved successfully'
  };
};

// Get application settings
export const getSettings = async () => {
  // Simulate API call
  await delay(100);
  return exercisesData.settings;
};

// Update application settings
export const updateSettings = async (newSettings) => {
  // Simulate API call
  await delay(200);
  
  // In a real API, you would save this data to the database
  console.log('Updating settings:', newSettings);
  
  // Return success response
  return {
    success: true,
    message: 'Settings updated successfully'
  };
}; 