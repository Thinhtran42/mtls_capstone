import { styled } from '@mui/material/styles';
import { Button } from '@mui/material';
import PropTypes from 'prop-types';

const StyledButton = styled(Button)(({ theme }) => ({
  minWidth: '70px',
  width: '100px',
  height: '70px',
  margin: theme.spacing(0.5),
  borderRadius: '12px',
  fontSize: '1.8rem',
  fontWeight: 'bold',
  backgroundColor: '#f8f9fa',
  color: '#212529',
  border: '1px solid #dee2e6',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.2s ease',
  padding: 0,
  lineHeight: 1,
  '&:hover': {
    backgroundColor: '#e9ecef',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)',
  },
  '&:active': {
    backgroundColor: '#dee2e6',
    transform: 'translateY(0)',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  '&.correct': {
    backgroundColor: '#4caf50',
    color: '#fff',
    '&:hover': {
      backgroundColor: '#45a049',
    }
  },
  '&.incorrect': {
    backgroundColor: '#ffcdd2',
    color: '#c62828',
    '&:hover': {
      backgroundColor: '#ffcdd2',
    }
  }
}));

const PracticeButton = ({ children, correct, incorrect, ...props }) => {
  let className = '';
  if (correct) className = 'correct';
  if (incorrect) className = 'incorrect';

  return (
    <StyledButton 
      className={className}
      disableRipple 
      {...props}
    >
      {children}
    </StyledButton>
  );
};

PracticeButton.propTypes = {
  children: PropTypes.node.isRequired,
  correct: PropTypes.bool,
  incorrect: PropTypes.bool
};

export default PracticeButton; 