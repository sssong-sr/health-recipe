// 云函数: aiChat - 智谱 AI 版本（含历史记录保存）
const cloud = require('wx-server-sdk')
const axios = require('axios')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

const ZHIPU_API_KEY = 'c6b41467b11b400eae0837cefe2b5a03.vAypM8bhpiTbXlTp'
const ZHIPU_BASE_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'

const KB = '减脂:热量缺口300-500kcal,蛋白质1.6-2.2g/kg,碳水2-4g/kg,脂肪0.8-1.2g/kg。BMR男=10×体重+6.25×身高-5×年龄+5,女-161。TDEE=BMR×活动系数(久坐1.2/轻度1.375/中度1.55/高度1.725)。优质蛋白:鸡胸、鱼、蛋、豆腐、牛肉。优质碳水:燕麦、糙米、红薯。运动:每周3-5次有氧+2-4次力量训练。'

exports.main = async (event, context) => {
  const { message, sessionId } = event
  if (!message) return { success: false, error: '消息为空' }

  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  try {
    // 1. 调用智谱 AI
    const res = await axios.post(
      ZHIPU_BASE_URL,
      {
        model: 'glm-4-flash',
        messages: [
          { role: 'system', content: '你是专业的体重管理顾问，根据知识库回答问题，简洁实用。' + KB },
          { role: 'user', content: message }
        ],
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': 'Bearer ' + ZHIPU_API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    )

    const answer = res.data.choices[0].message.content

    // 2. 异步保存到数据库（不阻塞返回）
    saveToDb(openid, sessionId, message, answer).catch(err => {
      console.error('保存数据库失败:', err.message)
    })

    return { success: true, answer }

  } catch (err) {
    console.error('错误:', err.message)
    return { success: false, error: err.message }
  }
}

// 异步保存对话记录
async function saveToDb(openid, sessionId, question, answer) {
  let sid = sessionId

  // 没有 sessionId 就创建新会话
  if (!sid) {
    const newSession = await db.collection('ai_sessions').add({
      data: {
        _openid: openid,
        title: question.length > 20 ? question.substring(0, 20) + '...' : question,
        message_count: 0,
        last_message: answer.substring(0, 50),
        last_time: db.serverDate(),
        status: 1,
        created_at: db.serverDate(),
        updated_at: db.serverDate()
      }
    })
    sid = newSession._id
  }

  // 保存用户消息
  await db.collection('ai_messages').add({
    data: {
      _openid: openid,
      session_id: sid,
      role: 'user',
      content: question,
      status: 1,
      created_at: db.serverDate()
    }
  })

  // 保存 AI 回复
  await db.collection('ai_messages').add({
    data: {
      _openid: openid,
      session_id: sid,
      role: 'assistant',
      content: answer,
      status: 1,
      created_at: db.serverDate()
    }
  })

  // 更新会话最后消息
  await db.collection('ai_sessions').doc(sid).update({
    data: {
      last_message: answer.substring(0, 50),
      last_time: db.serverDate(),
      message_count: db.command.inc(2),
      updated_at: db.serverDate()
    }
  })

  return sid
}
