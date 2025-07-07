import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';

const NoteListeningContext = createContext();

export const useNoteListening = () => {
  const context = useContext(NoteListeningContext);
  if (!context) {
    throw new Error('useNoteListening must be used within a NoteListeningProvider');
  }
  return context;
};

export const NoteListeningProvider = ({ children }) => {
  const [currentNote, setCurrentNote] = useState(null);
  const [wrongAttempts, setWrongAttempts] = useState([]);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const reset = useCallback(() => {
    setCurrentNote(null);
    setWrongAttempts(Array(10).fill(0));
    setScore(0);
    setTotalQuestions(10);
    setIsCompleted(false);
    setCurrentQuestionIndex(0);
  }, []);

  const checkAnswer = useCallback((selectedNote) => {
    if (currentNote === selectedNote) {
      setScore(prev => prev + 1);
      return true;
    } else {
      setWrongAttempts(prev => {
        const newAttempts = [...prev];
        newAttempts[currentQuestionIndex] = (newAttempts[currentQuestionIndex] || 0) + 1;
        return newAttempts;
      });
      return false;
    }
  }, [currentNote, currentQuestionIndex]);

  useEffect(() => {
    // Initialize wrongAttempts array when totalQuestions is set
    if (totalQuestions > 0) {
      setWrongAttempts(Array(totalQuestions).fill(0));
    }
  }, [totalQuestions]);

  const getEvaluation = useCallback((attempts) => {
    if (attempts === 0) return 'Excellent! You identified the note correctly right away.';
    if (attempts === 1) return 'Good! You only missed once.';
    if (attempts === 2) return 'Good! You needed 2 attempts to find the correct answer.';
    return `You tried ${attempts} times before finding the correct answer.`;
  }, []);

  const getFinalEvaluation = useCallback(() => {
    const percentageCorrect = (score / totalQuestions) * 100;
    if (percentageCorrect >= 90) return 'Excellent! You have shown a good understanding of note identification.';
    if (percentageCorrect >= 70) return 'Very good! You have shown a good understanding of note identification.';
    if (percentageCorrect >= 50) return 'Very good! You have shown a good understanding of note identification.';
    return 'Need to try harder! Spend more time practicing note identification.';
  }, [score, totalQuestions]);

  const value = {
    currentNote,
    setCurrentNote,
    wrongAttempts,
    score,
    totalQuestions,
    setTotalQuestions,
    isCompleted,
    setIsCompleted,
    checkAnswer,
    reset,
    getEvaluation,
    getFinalEvaluation,
    currentQuestionIndex,
    setCurrentQuestionIndex
  };

  return (
    <NoteListeningContext.Provider value={value}>
      {children}
    </NoteListeningContext.Provider>
  );
};

NoteListeningProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
