import { useParams } from 'react-router-dom'

function DiagnosisPage() {
  const { answerId } = useParams()
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          DiagnosisPage
        </h1>
        <p className="text-gray-600">Answer ID: {answerId}</p>
        <p className="text-sm text-gray-500 mt-2">
          (这是占位页面，下一步将完善)
        </p>
      </div>
    </div>
  )
}

export default DiagnosisPage