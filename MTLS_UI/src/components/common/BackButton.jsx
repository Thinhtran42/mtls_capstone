import { Button } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import PropTypes from 'prop-types';

/**
 * BackButton - A reusable styled back button component
 * 
 * @param {Object} props - Component props
 * @param {string} props.text - Button text (default: "Back")
 * @param {Function} props.onClick - Click handler function
 * @param {Object} props.sx - Additional MUI sx styles to apply
 * @returns {JSX.Element} A styled back button component
 */
const BackButton = ({ text = "Back", onClick, sx = {} }) => {
  return (
    <Button
      startIcon={<ArrowBackIcon />}
      onClick={onClick}
      variant="outlined"
      sx={{
        color: "#0F62FE",
        borderColor: "#0F62FE",
        "&:hover": { bgcolor: "rgba(15, 98, 254, 0.08)" },
        textTransform: "none",
        mb: 2,
        ...sx
      }}
    >
      {text}
    </Button>
  );
};

BackButton.propTypes = {
  text: PropTypes.string,
  onClick: PropTypes.func.isRequired,
  sx: PropTypes.object
};

export default BackButton; 