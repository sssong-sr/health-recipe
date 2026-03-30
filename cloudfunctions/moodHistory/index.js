// 云函数: moodHistory - 获取心情历史
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  
  const { days = 7 } = event
  
  try {
    // 计算日期范围
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    const recordsRes = await db.collection('mood_records').where({
      _openid: openid,
      date: db.command.gte(startDate.toISOString().split('T')[0])
    }).orderBy('date', 'desc').limit(days).get()
    
    return {
      success: true,
      records: recordsRes.data
    }
  } catch (err) {
    return { success: false, error: err.message }
  }
}
