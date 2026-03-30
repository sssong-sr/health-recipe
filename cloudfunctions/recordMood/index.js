// 云函数: getMood / recordMood - 获取/记录心情
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

// 获取心情
async function getMoodByDate(openid, date) {
  const res = await db.collection('mood_records').where({
    _openid: openid,
    date: date
  }).get()
  
  if (res.data.length > 0) {
    return { success: true, mood: res.data[0].mood }
  }
  return { success: true, mood: null }
}

// 记录心情
async function recordMoodByDate(openid, date, mood) {
  const existRes = await db.collection('mood_records').where({
    _openid: openid,
    date: date
  }).get()
  
  if (existRes.data.length > 0) {
    await db.collection('mood_records').doc(existRes.data[0]._id).update({
      data: {
        mood: mood,
        updated_at: new Date().toISOString()
      }
    })
  } else {
    await db.collection('mood_records').add({
      data: {
        _openid: openid,
        mood: mood,
        date: date,
        created_at: new Date().toISOString()
      }
    })
  }
  
  return { success: true }
}

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  
  const { action, date, mood } = event
  
  try {
    if (action === 'get') {
      return await getMoodByDate(openid, date)
    } else if (action === 'record') {
      return await recordMoodByDate(openid, date, mood)
    } else {
      // 兼容旧接口
      if (mood) {
        return await recordMoodByDate(openid, date, mood)
      } else {
        return await getMoodByDate(openid, date)
      }
    }
  } catch (err) {
    return { success: false, error: err.message }
  }
}
