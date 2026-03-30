// 云函数: userCreate - 创建/完善用户档案
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

// 计算基础代谢 BMR (Mifflin-St Jeor)
function calcBMR(age, height, weight, gender) {
  if (gender === 'male') {
    return Math.round(10 * weight + 6.25 * height - 5 * age + 5)
  } else {
    return Math.round(10 * weight + 6.25 * height - 5 * age - 161)
  }
}

// 计算每日总消耗 TDEE
function calcTDEE(bmr, exerciseLevel) {
  return Math.round(bmr * exerciseLevel)
}

// 计算目标热量
function calcTargetCal(tdee, goal) {
  switch (goal) {
    case '减脂': return tdee - 500
    case '增肌': return tdee + 300
    default: return tdee
  }
}

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  
  const { age, height, weight, gender, goal, exerciseLevel } = event
  
  // 参数校验
  if (!age || !height || !weight || !gender || !goal || !exerciseLevel) {
    return { success: false, error: '缺少必要参数' }
  }
  
  // 计算代谢
  const bmr = calcBMR(age, height, weight, gender)
  const tdee = calcTDEE(bmr, exerciseLevel)
  const targetCal = calcTargetCal(tdee, goal)
  
  try {
    // 查询是否已存在用户
    const userRes = await db.collection('users').where({
      _openid: openid
    }).get()
    
    const userData = {
      age,
      height,
      weight,
      gender_calc: gender,
      goal,
      exercise_level: exerciseLevel,
      bmr,
      tdee,
      target_cal: targetCal,
      updated_at: new Date().toISOString()
    }
    
    if (userRes.data.length > 0) {
      // 更新已有用户
      await db.collection('users').doc(userRes.data[0]._id).update({
        data: userData
      })
      return { success: true, type: 'update', bmr, tdee, targetCal }
    } else {
      // 创建新用户
      userData._openid = openid
      userData.created_at = new Date().toISOString()
      await db.collection('users').add({
        data: userData
      })
      return { success: true, type: 'create', bmr, tdee, targetCal }
    }
  } catch (err) {
    return { success: false, error: err.message }
  }
}
