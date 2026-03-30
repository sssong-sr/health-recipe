// 云函数: initTestData - 初始化测试数据
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  
  try {
    // 体重记录
    const weightRecords = [
      { date: '2026-03-18', weight: 75.0 },
      { date: '2026-03-19', weight: 74.8 },
      { date: '2026-03-20', weight: 74.5 },
      { date: '2026-03-21', weight: 74.6 },
      { date: '2026-03-22', weight: 74.3 },
      { date: '2026-03-23', weight: 74.0 },
      { date: '2026-03-24', weight: 73.8 },
      { date: '2026-03-25', weight: 73.5 }
    ]
    
    for (const record of weightRecords) {
      await db.collection('weight_records').add({
        data: {
          _openid: openid,
          weight: record.weight,
          date: record.date,
          created_at: new Date().toISOString()
        }
      })
    }
    
    // 心情记录
    const moodRecords = [
      { date: '2026-03-21', mood: 'happy' },
      { date: '2026-03-22', mood: 'sad' },
      { date: '2026-03-23', mood: 'normal' },
      { date: '2026-03-24', mood: 'good' },
      { date: '2026-03-25', mood: 'happy' }
    ]
    
    for (const record of moodRecords) {
      await db.collection('mood_records').add({
        data: {
          _openid: openid,
          mood: record.mood,
          date: record.date,
          created_at: new Date().toISOString()
        }
      })
    }
    
    return {
      success: true,
      message: '测试数据创建成功！'
    }
  } catch (err) {
    return { success: false, error: err.message }
  }
}
