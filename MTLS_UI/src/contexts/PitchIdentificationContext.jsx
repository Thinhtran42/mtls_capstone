import { createContext, useContext, useState, useCallback } from 'react';
import PropTypes from 'prop-types';

const PitchIdentificationContext = createContext();

export const usePitchIdentification = () => {
  const context = useContext(PitchIdentificationContext);
  if (!context) {
    throw new Error('usePitchIdentification must be used within a PitchIdentificationProvider');
  }
  return context;
};

export const PitchIdentificationProvider = ({ children }) => {
  const [currentNote, setCurrentNote] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [detectedPitch, setDetectedPitch] = useState(null);
  const [feedback, setFeedback] = useState('');

  const reset = useCallback(() => {
    setCurrentNote(null);
    setIsCompleted(false);
    setCurrentQuestionIndex(0);
    setIsListening(false);
    setDetectedPitch(null);
    setFeedback('');
  }, []);

  const checkAnswer = useCallback((detectedNote) => {
    if (currentNote === detectedNote) {

      return true;
    } else {
      return false;
    }
  }, [currentNote, currentQuestionIndex]);

  const value = {
    currentNote,
    setCurrentNote,
    isCompleted,
    setIsCompleted,
    checkAnswer,
    reset,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    isListening,
    setIsListening,
    detectedPitch,
    setDetectedPitch,
    feedback,
    setFeedback
  };

  return (
    <PitchIdentificationContext.Provider value={value}>
      {children}
    </PitchIdentificationContext.Provider>
  );
};

PitchIdentificationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};