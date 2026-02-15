import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import QuestionPage from './pages/QuestionPage'
import ReflectionPage from './pages/ReflectionPage'
import DiagnosisPage from './pages/DiagnosisPage'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Routes>
          <Route path="/" element={<Navigate to="/question/1" replace />} />
          
          <Route path="/question/:id" element={<QuestionPage />} />
          
          <Route path="/reflection/:answerId" element={<ReflectionPage />} />
          
          <Route path="/diagnosis/:answerId" element={<DiagnosisPage />} />
          
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