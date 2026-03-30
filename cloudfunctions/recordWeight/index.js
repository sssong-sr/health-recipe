// 云函数: recordWeight - 记录体重
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  
  const { weight, date } = event
  
  if (!weight || !date) {
    return { success: false, error: '缺少参数' }
  }
  
  try {
    // 检查今天是否已有记录
    const existRes = await db.collection('weight_records').where({
      _openid: openid,
      date: date
    }).get()
    
    if (existRes.data.length > 0) {
      // 更新
      await db.collection('weight_records').doc(existRes.data[0]._id).update({
        data: {
          weight: parseFloat(weight),
          updated_at: new Date().toISOString()
        }
      })
    } else {
      // 新增
      await db.collection('weight_records').add({
        data: {
          _openid: openid,
          weight: parseFloat(weight),
          date: date,
          created_at: new Date().toISOString()
        }
      })
    }
    
    return { success: true }
  } catch (err) {
    return { success: false, error: err.message }
  }
}
