import {
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import { ShieldCloseIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const DAYS = [
  { label: 'M', value: 'monday' },
  { label: 'T', value: 'tuesday' },
  { label: 'W', value: 'wednesday' },
  { label: 'T', value: 'thursday' },
  { label: 'F', value: 'friday' },
  { label: 'S', value: 'saturday' },
  { label: 'S', value: 'sunday' },
]

export function GoalTracker() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [selectedDays, setSelectedDays] = useState([])
  const [hasGoal, setHasGoal] = useState(false)

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const handleDayToggle = (event, newDays) => {
    setSelectedDays(newDays)
  }

  const handleSave = () => {
    setHasGoal(true)
    handleClose()
  }
  return (
    <>
      <Card
        sx={{
          p: 3,
          borderRadius: 2,
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
          mb: 2,
        }}
      >
        <Typography
          variant='h6'
          gutterBottom
          fontWeight='600'
        >
          {t('goalTracker.title')}
        </Typography>

        {!hasGoal ? (
          <>
            <Typography
              color='text.secondary'
              sx={{ mb: 2 }}
            >
              {t('goalTracker.description')}
            </Typography>

            <Button
              variant='outlined'
              color='primary'
              onClick={handleOpen}
              sx={{
                textTransform: 'none',
                borderRadius: 1.5,
              }}
            >
              {t('goalTracker.setGoal')}
            </Button>
          </>
        ) : (
          <>
            <Typography
              color='text.secondary'
              sx={{ mb: 2 }}
            >
              {t('goalTracker.commitment', { days: selectedDays.length })}
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              {DAYS.map((day) => (
                <Box
                  key={day.value}
                  sx={{
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    backgroundColor: selectedDays.includes(day.value)
                      ? '#D9EEFB'
                      : 'transparent',
                    color: selectedDays.includes(day.value)
                      ? '#1976d2'
                      : 'text.secondary',
                    fontWeight: selectedDays.includes(day.value) ? 600 : 400,
                  }}
                >
                  {day.label}
                </Box>
              ))}
            </Box>

            <Button
              color='primary'
              onClick={handleOpen}
              sx={{
                textTransform: 'none',
                p: 0,
                '&:hover': {
                  backgroundColor: 'transparent',
                },
              }}
            >
              {t('goalTracker.editGoal')}
            </Button>
          </>
        )}
      </Card>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>
          <Box
            display='flex'
            justifyContent='space-between'
            alignItems='center'
          >
            <Typography variant='h6'>{t('goalTracker.setGoal')}</Typography>
            <IconButton
              onClick={handleClose}
              size='small'
            >
              <ShieldCloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography
            color='text.secondary'
            sx={{ mb: 3 }}
          >
            {t('goalTracker.selectDays')}
          </Typography>

          <ToggleButtonGroup
            value={selectedDays}
            onChange={handleDayToggle}
            aria-label='learning days'
            sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}
          >
            {DAYS.map((day) => (
              <ToggleButton
                key={day.value}
                value={day.value}
                sx={{
                  borderRadius: '50%',
                  width: 40,
                  height: 40,
                  p: 0,
                  border: '1px solid #e0e0e0',
                  '&.Mui-selected': {
                    backgroundColor: '#D9EEFB',
                    color: '#1976d2',
                    '&:hover': {
                      backgroundColor: '#D9EEFB',
                    },
                  },
                }}
              >
                {day.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            variant='contained'
            onClick={handleSave}
            disabled={selectedDays.length === 0}
            fullWidth
            sx={{
              textTransform: 'none',
              borderRadius: 1.5,
            }}
          >
            {t('goalTracker.saveGoal')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
