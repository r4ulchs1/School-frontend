import AppRouter from "./router/AppRouter"
import { AuthProvider } from './contexts/AuthContext.jsx'
import { BrowserRouter as Router } from "react-router-dom"

function App() {

  return (
    <>
      <Router>
        <AuthProvider>
          <AppRouter/>
        </AuthProvider>
      </Router>
    </>
  )
}

export default App
