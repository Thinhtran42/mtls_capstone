import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  getAllExercises, 
  getExerciseById, 
  getUserProgress, 
  saveUserProgress
} from '../services/noteIdentificationService';

const NoteIdentificationContext = createContext();

export const useNoteIdentification = () => {
  const context = useContext(NoteIdentificationContext);
  if (!context) {
    throw new Error('useNoteIdentification must be used within a NoteIdentificationProvider');
  }
  return context;
};

export const NoteIdentificationProvider = ({ children }) => {
  const [exercises, setExercises] = useState([]);
  const [currentExercise, setCurrentExercise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [practiceStats, setPracticeStats] = useState({
    correctAnswers: 0,
    wrongAnswers: 0,
    exerciseId: null
  });

  // Fetch all available exercises when the component mounts
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setLoading(true);
        const data = await getAllExercises();
        setExercises(data);
        
        // Try to get user progress
        const userId = 'user123'; // In a real app, this would come from authentication
        const progress = await getUserProgress(userId);
        
        // If user has a current exercise, load it
        if (progress.currentExercise) {
          const exerciseData = await getExerciseById(progress.currentExercise.exerciseId);
          setCurrentExercise(exerciseData);
          
          // Set practice stats from saved progress if available
          if (progress.stats) {
            setPracticeStats({
              correctAnswers: progress.stats.correctAnswers || 0,
              wrongAnswers: progress.stats.wrongAnswers || 0,
              exerciseId: exerciseData.id
            });
          }
        } else if (data.length > 0) {
          // If no current exercise, load the first one
          setCurrentExercise(data[0]);
          setPracticeStats({
            correctAnswers: 0,
            wrongAnswers: 0,
            exerciseId: data[0].id
          });
        }
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchExercises();
  }, []);

  // Load a specific exercise by ID
  const loadExercise = async (exerciseId) => {
    try {
      setLoading(true);
      const exerciseData = await getExerciseById(exerciseId);
      setCurrentExercise(exerciseData);
      
      // Reset practice stats for the new exercise
      setPracticeStats({
        correctAnswers: 0,
        wrongAnswers: 0,
        exerciseId: exerciseData.id
      });
      
      setLoading(false);
      return exerciseData;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const recordAttempt = (isCorrect) => {
    if (isCorrect) {
      setPracticeStats(prev => ({
        ...prev,
        correctAnswers: prev.correctAnswers + 1
      }));
    } else {
      setPracticeStats(prev => ({
        ...prev,
        wrongAnswers: prev.wrongAnswers + 1
      }));
    }
    
    // Save progress to "backend"
    const userId = 'user123'; // In a real app, this would come from authentication
    saveUserProgress(userId, {
      exerciseId: practiceStats.exerciseId,
      stats: {
        correctAnswers: isCorrect ? practiceStats.correctAnswers + 1 : practiceStats.correctAnswers,
        wrongAnswers: isCorrect ? practiceStats.wrongAnswers : practiceStats.wrongAnswers + 1
      }
    }).catch(err => {
      console.error('Error saving progress:', err);
    });
  };

  const nextQuestion = () => {
    // In infinite mode, we just move to next question without tracking index
    // This will be handled by the component regenerating a random note
  };

  const resetStats = () => {
    if (!currentExercise) return;
    
    setPracticeStats({
      correctAnswers: 0,
      wrongAnswers: 0,
      exerciseId: currentExercise.id
    });
  };

  const value = {
    exercises,
    currentExercise,
    practiceStats,
    loading,
    error,
    loadExercise,
    recordAttempt,
    nextQuestion,
    resetStats
  };

  return (
    <NoteIdentificationContext.Provider value={value}>
      {children}
    </NoteIdentificationContext.Provider>
  );
};

NoteIdentificationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default NoteIdentificationContext;