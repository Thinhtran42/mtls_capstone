import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App'
import React from 'react'
import { ThemeProvider } from '@emotion/react'
import { theme } from './styles/theme'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { HelmetProvider } from 'react-helmet-async'
import './i18n'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <div
            style={{
              minHeight: '100vh',
              backgroundColor: theme.palette.background.default,
            }}
          >
            <App />
          </div>
        </LocalizationProvider>
      </ThemeProvider>
    </HelmetProvider>
  </React.StrictMode>
)
