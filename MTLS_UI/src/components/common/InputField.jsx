/* eslint-disable react/prop-types */
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { IconButton, InputAdornment, TextField } from '@mui/material'
import { useFormContext } from 'react-hook-form'

const InputField = ({
  name,
  label,
  type,
  validation,
  showPassword,
  setShowPassword,
  ...props
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext()

  return (
    <TextField
      {...props}
      label={label}
      variant='outlined'
      fullWidth
      margin='normal'
      type={type}
      {...register(name, validation)}
      error={!!errors[name]}
      helperText={errors[name] ? errors[name].message : ''}
      InputProps={{
        sx: {
          borderRadius: '30px',
          backgroundColor: '#f0f0f0',
        },
        endAdornment: (name === 'password' || name === 'confirmPassword') && (
          <InputAdornment position='end'>
            <IconButton
              onClick={() => setShowPassword(!showPassword)} // Cập nhật trạng thái hiển thị mật khẩu
              edge='end'
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}{' '}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  )
}

export default InputField
