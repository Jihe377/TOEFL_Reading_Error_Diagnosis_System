import axios from "axios";

// 创建 axios 实例，配置基础 URL
const api = axios.create({
  baseURL: '/api',  // Vite 会通过 proxy 转发到 http://localhost:8000/api
  timeout: 10000,   // 请求超时时间 10 秒
  headers: {
    'Content-Type': 'application/json',
  }
})

// 请求拦截器（可选，用于添加 token 等）
api.interceptors.request.use(
  (config) => {
    // 未来可以在这里添加 JWT token
    // const token = localStorage.getItem('token')
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器（统一错误处理）
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    // 统一错误处理
    if (error.response) {
      // 服务器返回错误
      console.error('API Error:', error.response.status, error.response.data)
      
      // 根据状态码处理
      switch (error.response.status) {
        case 404:
          console.error('资源未找到')
          break
        case 500:
          console.error('服务器内部错误')
          break
        default:
          console.error('请求失败')
      }
    } else if (error.request) {
      // 请求发出但没有收到响应
      console.error('Network Error: 无法连接到服务器')
    } else {
      // 其他错误
      console.error('Error:', error.message)
    }
    return Promise.reject(error)
  }
)

// ============================================
// API 方法定义
// ============================================

/**
 * 获取题目详情
 * @param {number} questionId - 题目 ID
 * @returns {Promise} 题目数据
 */
export const getQuestion = (questionId) => {
  return api.get(`/questions/${questionId}`)
}

/**
 * 提交答案
 * @param {object} answerData - 答案数据
 * @param {number} answerData.user_id - 用户 ID
 * @param {number} answerData.question_id - 题目 ID
 * @param {number} answerData.selected_option_id - 选中的选项 ID
 * @returns {Promise} 答题结果
 */
export const submitAnswer = (answerData) => {
  return api.post('/answers', answerData)
}

/**
 * 获取复盘步骤
 * @param {number} userAnswerId - 答题记录 ID
 * @returns {Promise} 复盘步骤数据
 */
export const getReflectionSteps = (userAnswerId) => {
  return api.get(`/reflections/${userAnswerId}`)
}

/**
 * 提交复盘答案
 * @param {object} reflectionData - 复盘数据
 * @returns {Promise} 诊断结果
 */
export const submitReflection = (reflectionData) => {
  return api.post('/reflections', reflectionData)
}

/**
 * 获取诊断结果（备用方法，如果需要单独获取）
 * @param {number} userAnswerId - 答题记录 ID
 * @returns {Promise} 诊断结果
 */
export const getDiagnosis = (userAnswerId) => {
  return api.get(`/diagnosis/${userAnswerId}`)
}

export default api