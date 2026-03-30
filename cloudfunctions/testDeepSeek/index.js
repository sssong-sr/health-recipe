// 云函数: testDeepSeek - 测试 DeepSeek API 连接（带数据库操作）
const cloud = require('wx-server-sdk')
const axios = require('axios')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const DEEPSEEK_API_KEY = 'sk-c66e742cee194fd3b6218f57f865b88e'
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com/v1/chat/completions'

const KNOWLEDGE_BASE = `
# 体重管理知识库
减脂期蛋白质推荐：1.6-2.2 g/kg体重
碳水推荐：2-4 g/kg体重
脂肪推荐：0.8-1.2 g/kg体重
`

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { message } = event
  
  console.log('=== 开始测试 ===', new Date().toISOString())
  
  try {
    const startTime = Date.now()
    
    // 构建消息
    const messages = [
      { role: 'system', content: `你是体重管理顾问。\n${KNOWLEDGE_BASE}` },
      { role: 'user', content: message || '你好' }
    ]
    
    console.log('1. 调用 DeepSeek API...')
    const apiStart = Date.now()
    
    const res = await axios.post(
      DEEPSEEK_BASE_URL,
      {
        model: 'deepseek-chat',
        messages: messages,
        temperature: 0.7,
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    )
    
    console.log('API 耗时:', Date.now() - apiStart, 'ms')
    
    const answer = res.data.choices[0].message.content
    const tokens = res.data.usage?.total_tokens || 0
    
    console.log('2. 写入数据库...')
    const dbStart = Date.now()
    
    // 测试数据库写入
    await db.collection('ai_messages').add({
      data: {
        _openid: openid,
        role: 'user',
        content: message || '测试',
        created_at: new Date()
      }
    })
    
    console.log('数据库写入耗时:', Date.now() - dbStart, 'ms')
    
    const totalElapsed = Date.now() - startTime
    console.log('总耗时:', totalElapsed, 'ms')
    
    return {
      success: true,
      answer: answer,
      tokens: tokens,
      elapsed: totalElapsed
    }
    
  } catch (err) {
    console.error('失败:', err.message)
    return {
      success: false,
      error: err.message
    }
  }
}
