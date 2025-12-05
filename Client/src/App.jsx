import AppRouter from './router/AppRouter'
import Toast from './pages/common/Toast'
import './App.css'
import './styles/colors.css'
/**
 * Main App Component
 * Renders the application router
 */
function App() {
  return (
    <>
      <AppRouter />
      <Toast />
    </>
  )
}

export default App
