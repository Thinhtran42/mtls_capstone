import PropTypes from 'prop-types'
import Button from '@mui/material/Button'

const CustomButton = ({
  color,
  variant,
  size,
  onClick,
  children,
  borderRadius,
}) => {
  return (
    <Button
      color={color}
      variant={variant}
      size={size}
      onClick={onClick}
      sx={{ borderRadius: borderRadius }}
    >
      {children}
    </Button>
  )
}

CustomButton.propTypes = {
  color: PropTypes.oneOf(['default', 'inherit', 'primary', 'secondary']),
  variant: PropTypes.oneOf(['text', 'outlined', 'contained']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  onClick: PropTypes.func,
  children: PropTypes.node.isRequired,
  borderRadius: PropTypes.string,
}

CustomButton.defaultProps = {
  color: 'primary',
  variant: 'contained',
  size: 'medium',
  onClick: () => {},
  borderRadius: '4px',
}

export default CustomButton
