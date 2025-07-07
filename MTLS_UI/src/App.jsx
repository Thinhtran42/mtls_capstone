import AppRoutes from './routes'
import { UserProvider } from './contexts/UserContext'
import { SnackbarProvider } from './contexts/SnackbarContext'

function App() {
  return (
    <UserProvider>
      <SnackbarProvider>
        <AppRoutes />
      </SnackbarProvider>
    </UserProvider>
  )
}

export default App
