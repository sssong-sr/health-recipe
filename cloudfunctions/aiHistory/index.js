// 云函数: aiHistory - 获取AI对话历史
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  
  const { type, sessionId, page = 1, size = 20 } = event
  
  try {
    // 获取会话列表
    if (type === 'sessions') {
      const sessionsRes = await db.collection('ai_sessions')
        .where({ _openid: openid, status: 1 })
        .orderBy('last_time', 'desc')
        .skip((page - 1) * size)
        .limit(size)
        .get()
      
      const countRes = await db.collection('ai_sessions')
        .where({ _openid: openid, status: 1 })
        .count()
      
      return {
        success: true,
        sessions: sessionsRes.data,
        total: countRes.total,
        page,
        size
      }
    }
    
    // 获取某个会话的消息列表
    if (type === 'messages' && sessionId) {
      const messagesRes = await db.collection('ai_messages')
        .where({ _openid: openid, session_id: sessionId, status: 1 })
        .orderBy('created_at', 'asc')
        .get()
      
      return {
        success: true,
        messages: messagesRes.data
      }
    }
    
    // 创建新会话
    if (type === 'new') {
      const res = await db.collection('ai_sessions').add({
        data: {
          _openid: openid,
          ragflow_session_id: null,
          ragflow_chat_id: null,
          title: '新对话',
          message_count: 0,
          last_message: '',
          last_time: db.serverDate(),
          status: 1,
          created_at: db.serverDate(),
          updated_at: db.serverDate()
        }
      })
      
      return { success: true, sessionId: res._id }
    }
    
    // 删除会话
    if (type === 'delete' && sessionId) {
      await db.collection('ai_sessions').doc(sessionId).update({
        data: { status: 0 }
      })
      await db.collection('ai_messages')
        .where({ session_id: sessionId })
        .update({ data: { status: 0 } })
      
      return { success: true }
    }
    
    return { success: false, error: '未知操作' }
  } catch (err) {
    console.error('获取历史失败:', err)
    return { success: false, error: err.message }
  }
}
