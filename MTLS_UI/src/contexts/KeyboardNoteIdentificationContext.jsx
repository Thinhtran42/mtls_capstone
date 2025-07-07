import { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';

const KeyboardNoteIdentificationContext = createContext();

export const useKeyboardNoteIdentification = () => {
  const context = useContext(KeyboardNoteIdentificationContext);
  if (!context) {
    throw new Error('useKeyboardNoteIdentification must be used within a KeyboardNoteIdentificationProvider');
  }
  return context;
};

export const KeyboardNoteIdentificationProvider = ({ children }) => {
  const totalQuestions = 10;
  const [practiceSession, setPracticeSession] = useState({
    currentQuestionIndex: 0,
    wrongAttempts: Array(totalQuestions).fill(0),
    score: 0,
    isComplete: false,
    totalQuestions,
  });

  const recordAttempt = (isCorrect) => {
    const currentQuestionIndex = practiceSession.currentQuestionIndex;
    
    if (isCorrect) {
      // Add 1 point for correct answer, regardless of attempts
      setPracticeSession(prev => ({
        ...prev,
        score: prev.score + 1,
      }));
    } else {
      // Record wrong attempt
      setPracticeSession(prev => {
        const newWrongAttempts = [...prev.wrongAttempts];
        newWrongAttempts[currentQuestionIndex]++;
        return {
          ...prev,
          wrongAttempts: newWrongAttempts,
        };
      });
    }
  };

  const nextQuestion = () => {
    setPracticeSession(prev => {
      const nextIndex = prev.currentQuestionIndex + 1;
      return {
        ...prev,
        currentQuestionIndex: nextIndex,
        isComplete: nextIndex >= totalQuestions,
      };
    });
  };

  const getEvaluation = (attempts) => {
    if (attempts === 0) return "Excellent! You identified the note correctly right away.";
    if (attempts === 1) return "Good! You only missed once.";
    if (attempts === 2) return "Good! You needed 2 attempts to find the correct answer.";
    return `You tried ${attempts} times before finding the correct answer.`;
  };

  const getFinalEvaluation = () => {
    const percentage = (practiceSession.score / totalQuestions) * 100;
    if (percentage >= 90) return "Excellent! You really understand the position of the piano notes!";
    if (percentage >= 70) return "Very good! You have shown a good understanding of the position of the piano notes.";
    if (percentage >= 50) return "Very good! You have shown a good understanding of the position of the piano notes.";
    return "Need to try harder! Spend more time practicing keyboard note identification.";
  };

  const resetSession = () => {
    setPracticeSession({
      currentQuestionIndex: 0,
      wrongAttempts: Array(totalQuestions).fill(0),
      score: 0,
      isComplete: false,
      totalQuestions,
    });
  };

  return (
    <KeyboardNoteIdentificationContext.Provider
      value={{
        practiceSession,
        recordAttempt,
        nextQuestion,
        getEvaluation,
        getFinalEvaluation,
        resetSession,
      }}
    >
      {children}
    </KeyboardNoteIdentificationContext.Provider>
  );
};

KeyboardNoteIdentificationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default KeyboardNoteIdentificationProvider; 