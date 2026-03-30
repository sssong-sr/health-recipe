// 云函数: aiChatHttp - HTTP API 版本（无超时限制）
const cloud = require('wx-server-sdk')
const axios = require('axios')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const DEEPSEEK_API_KEY = 'sk-c66e742cee194fd3b6218f57f865b88e'
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com/v1/chat/completions'

const KNOWLEDGE_BASE = `减脂：热量缺口300-500kcal，蛋白质1.6-2.2g/kg，碳水2-4g/kg。BMR男=10×体重+6.25×身高-5×年龄+5，女-161。TDEE=BMR×活动系数。优质蛋白：鸡胸、鱼、蛋。运动：每周3-5次有氧。`

// 配置为 HTTP 触发器
exports.main = async (event, context) => {
  // HTTP 触发器模式
  const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body || event

  const { message } = body

  if (!message) {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, error: '消息不能为空' })
    }
  }

  try {
    const res = await axios.post(
      DEEPSEEK_BASE_URL,
      {
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: `你是体重管理顾问。${KNOWLEDGE_BASE}` },
          { role: 'user', content: message }
        ],
        max_tokens: 500
      },
      {
        headers: { 'Authorization': `Bearer ${DEEPSEEK_API_KEY}`, 'Content-Type': 'application/json' },
        timeout: 15000
      }
    )

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        answer: res.data.choices[0].message.content
      })
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: err.message })
    }
  }
}
