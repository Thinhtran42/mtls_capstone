import { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';

const KeySignatureContext = createContext();

export const useKeySignature = () => {
  const context = useContext(KeySignatureContext);
  if (!context) {
    throw new Error('useKeySignature must be used within a KeySignatureProvider');
  }
  return context;
};

const KeySignatureProvider = ({ children }) => {
  const [practiceSession, setPracticeSession] = useState({
    currentQuestionIndex: 0,
    totalQuestions: 10,
    wrongAttempts: Array(10).fill(0),
    isComplete: false,
    score: 0
  });

  const recordAttempt = (isCorrect) => {
    if (!isCorrect) {
      setPracticeSession(prev => {
        const newWrongAttempts = [...prev.wrongAttempts];
        newWrongAttempts[prev.currentQuestionIndex]++;
        return {
          ...prev,
          wrongAttempts: newWrongAttempts
        };
      });
    } else {
      // Tăng điểm khi trả lời đúng
      setPracticeSession(prev => ({
        ...prev,
        score: prev.score + 1
      }));
    }
  };

  const nextQuestion = () => {
    setPracticeSession(prev => {
      const nextIndex = prev.currentQuestionIndex + 1;
      const isComplete = nextIndex >= prev.totalQuestions;
      return {
        ...prev,
        currentQuestionIndex: nextIndex,
        isComplete
      };
    });
  };

  const getEvaluation = (wrongAttempts) => {
    if (wrongAttempts === 0) return "Excellent! You identified the key signature correctly immediately.";
    if (wrongAttempts === 1) return "Good! You only missed once.";
    if (wrongAttempts <= 3) return "Good! You need to practice a little more.";
    return "Need to improve! Spend more time practicing this key signature.";
  };

  const getFinalEvaluation = () => {
    const totalWrongAttempts = practiceSession.wrongAttempts.reduce((a, b) => a + b, 0);
    if (totalWrongAttempts === 0) return "Excellent! You completed the exercise perfectly!";
    if (totalWrongAttempts <= 5) return "Very good! You have shown a good understanding of the key signature.";
    if (totalWrongAttempts <= 10) return "Good! Continue to practice to improve.";
    return "Need to try harder! Spend more time practicing key signature identification.";
  };

  const resetSession = () => {
    setPracticeSession({
      currentQuestionIndex: 0,
      totalQuestions: 10,
      wrongAttempts: Array(10).fill(0),
      isComplete: false,
      score: 0
    });
  };

  const value = {
    practiceSession,
    recordAttempt,
    nextQuestion,
    getEvaluation,
    getFinalEvaluation,
    resetSession
  };

  return (
    <KeySignatureContext.Provider value={value}>
      {children}
    </KeySignatureContext.Provider>
  );
};

KeySignatureProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { KeySignatureProvider };
export default KeySignatureContext; 