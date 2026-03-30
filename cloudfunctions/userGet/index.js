// 云函数: userGet - 获取当前用户信息
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  
  try {
    const userRes = await db.collection('users').where({
      _openid: openid
    }).get()
    
    if (userRes.data.length === 0) {
      return { success: true, exists: false }
    }
    
    // 映射字段名，保持和前端约定一致
    const rawUser = userRes.data[0]
    const user = {
      age: rawUser.age,
      height: rawUser.height,
      weight: rawUser.weight,
      gender_calc: rawUser.gender_calc || rawUser.gender,
      goal: rawUser.goal,
      exercise_level: rawUser.exercise_level || rawUser.exerciseLevel,
      bmr: rawUser.bmr,
      tdee: rawUser.tdee,
      target_cal: rawUser.target_cal || rawUser.targetCal
    }
    
    return { 
      success: true, 
      exists: true,
      user
    }
  } catch (err) {
    return { success: false, error: err.message }
  }
}
