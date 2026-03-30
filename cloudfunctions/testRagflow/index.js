// 云函数: testRagflow - 测试RAGFlow连接
const cloud = require('wx-server-sdk')
const axios = require('axios')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const RAGFLOW_BASE_URL = 'https://182e4cb6.r25.cpolar.top'
const RAGFLOW_API_KEY = 'ragflow-C1XHvj-O8VBqFaR565aslXD_XfKdcIAhQfTheQCy9kA'
const RAGFLOW_CHAT_ID = '9772373f29b011f18f2a9ee5f05cbf38'

exports.main = async (event, context) => {
  console.log('=== 测试 RAGFlow 连接 ===')
  
  try {
    // 1. 创建 Session
    console.log('1. 创建 Session...')
    const sessionRes = await axios.post(
      `${RAGFLOW_BASE_URL}/api/v1/chats/${RAGFLOW_CHAT_ID}/sessions`,
      { name: `test_${Date.now()}` },
      { headers: { 'Authorization': `Bearer ${RAGFLOW_API_KEY}`, 'Content-Type': 'application/json' }, timeout: 10000 }
    )
    console.log('创建 Session 响应:', JSON.stringify(sessionRes.data))
    
    if (sessionRes.data.code !== 0) {
      return { success: false, error: sessionRes.data.message }
    }
    
    const sessionId = sessionRes.data.data.id
    console.log('Session ID:', sessionId)
    
    // 2. 发送消息 - 使用正确的 API 路径: /api/v1/chats/{chat_id}/completions
    console.log('2. 发送测试消息...')
    
    const res = await axios.post(
      `${RAGFLOW_BASE_URL}/api/v1/chats/${RAGFLOW_CHAT_ID}/completions`,
      { 
        question: '减脂期间怎么吃？', 
        stream: false,
        session_id: sessionId
      },
      { headers: { 'Authorization': `Bearer ${RAGFLOW_API_KEY}`, 'Content-Type': 'application/json' }, timeout: 30000 }
    )
    console.log('成功! 响应:', JSON.stringify(res.data))
    return { success: true, response: res.data }
    
  } catch (err) {
    console.error('测试失败:', err)
    return { success: false, error: err.message, response: err.response?.data }
  }
}
