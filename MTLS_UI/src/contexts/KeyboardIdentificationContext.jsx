import { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';

const KeyboardIdentificationContext = createContext();

export const useKeyboardIdentification = () => {
  const context = useContext(KeyboardIdentificationContext);
  if (!context) {
    throw new Error('useKeyboardIdentification must be used within a KeyboardIdentificationProvider');
  }
  return context;
};

export const KeyboardIdentificationProvider = ({ children }) => {
  const totalQuestions = 10;
  const [practiceSession, setPracticeSession] = useState({
    currentQuestionIndex: 0,
    wrongAttempts: Array(totalQuestions).fill(0),
    score: 0,
    isComplete: false,
    totalQuestions,
  });

  const recordAttempt = (isCorrect) => {
    setPracticeSession(prev => {
      const newWrongAttempts = [...prev.wrongAttempts];
      if (!isCorrect) {
        newWrongAttempts[prev.currentQuestionIndex]++;
      }

      return {
        ...prev,
        wrongAttempts: newWrongAttempts,
        score: isCorrect 
          ? prev.score + Math.max(0, 10 - newWrongAttempts[prev.currentQuestionIndex])
          : prev.score,
      };
    });
  };

  const nextQuestion = () => {
    setPracticeSession(prev => ({
      ...prev,
      currentQuestionIndex: prev.currentQuestionIndex + 1,
      isComplete: prev.currentQuestionIndex + 1 >= totalQuestions,
    }));
  };

  const getEvaluation = (attempts) => {
    if (attempts === 0) return "Excellent! You answered correctly right away!";
    if (attempts === 1) return "Good! You only missed once.";
    if (attempts === 2) return "Good! You needed 2 attempts to find the correct answer.";
    return `You tried ${attempts} times before finding the correct answer.`;
  };

  const getFinalEvaluation = () => {
    const percentage = (practiceSession.score / (totalQuestions * 10)) * 100;
    if (percentage >= 90) return "Excellent! You really understand the position of the piano keys!";
    if (percentage >= 70) return "Very good! You have shown a good understanding of the position of the piano keys.";
    if (percentage >= 50) return "Very good! You have shown a good understanding of the position of the piano keys.";
    return "Need to try harder! Spend more time practicing keyboard identification.";
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
    <KeyboardIdentificationContext.Provider
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
    </KeyboardIdentificationContext.Provider>
  );
};

KeyboardIdentificationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default KeyboardIdentificationProvider; 