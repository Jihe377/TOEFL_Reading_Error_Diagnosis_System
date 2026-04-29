import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import QuestionPage from './pages/QuestionPage'
import ReflectionPage from './pages/ReflectionPage'
import DiagnosisPage from './pages/DiagnosisPage'
import AdminPage from './pages/AdminPage'
import PracticePage from './pages/PracticePage'
import JijingPage from './pages/JijingPage'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route path="/practice" element={<PracticePage />} />

          <Route path="/jijing" element={<JijingPage />} />

          <Route path="/question/:id" element={<QuestionPage />} />

          <Route path="/reflection/:answerId" element={<ReflectionPage />} />

          <Route path="/diagnosis/:answerId" element={<DiagnosisPage />} />

          <Route path="/admin" element={<AdminPage />} />
          
          <Route path="*" element={
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
                <p className="text-gray-600">Page Not Found</p>
              </div>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  )
}

export default App