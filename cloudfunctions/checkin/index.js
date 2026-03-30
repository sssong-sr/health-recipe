// 云函数: checkin - 用户打卡
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  
  const { breakfast, lunch, dinner, snack, exercise, water, weight, mood } = event
  
  const today = new Date().toISOString().split('T')[0]
  
  try {
    // 查询用户信息获取连续打卡天数
    const userRes = await db.collection('users').where({
      _openid: openid
    }).get()
    
    if (userRes.data.length === 0) {
      return { success: false, error: '请先完善档案' }
    }
    
    const user = userRes.data[0]
    const lastDate = user.checkin?.last_date || null
    const currentStreak = user.checkin?.streak || 0
    
    // 计算连续天数
    let newStreak = 1
    if (lastDate) {
      const last = new Date(lastDate)
      const now = new Date(today)
      const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24))
      
      if (diffDays === 1) {
        newStreak = currentStreak + 1
      } else if (diffDays === 0) {
        newStreak = currentStreak // 同一天打卡
      }
      // diffDays > 1 则重新开始
    }
    
    // 检查是否获得徽章
    let badgeGot = ''
    if (newStreak === 7) badgeGot = '一周坚持'
    if (newStreak === 30) badgeGot = '月度达人'
    if (newStreak === 100) badgeGot = '百日英雄'
    
    // 记录打卡
    const checkinData = {
      user_id: openid,
      date: today,
      checkin_data: {
        breakfast: breakfast || false,
        lunch: lunch || false,
        dinner: dinner || false,
        snack: snack || false,
        exercise: exercise || false,
        water: water || 0,
        weight: weight || null,
        mood: mood || ''
      },
      result: {
        streak_before: currentStreak,
        streak_after: newStreak,
        badge_got: badgeGot,
        points: newStreak * 10
      },
      created_at: new Date().toISOString()
    }
    
    await db.collection('user_checkin').add({
      data: checkinData
    })
    
    // 更新用户打卡信息
    // badges 数组：如果获得新徽章就添加，否则保持不变
    const updateData = {
      checkin: {
        streak: newStreak,
        total_days: _.inc(1),
        last_date: today
      }
    }
    
    if (badgeGot) {
      // 获得新徽章，添加到数组
      updateData['checkin.badges'] = _.push(badgeGot)
    }
    
    await db.collection('users').where({
      _openid: openid
    }).update({
      data: updateData
    })
    
    return { 
      success: true, 
      streak: newStreak,
      badge: badgeGot,
      points: newStreak * 10
    }
  } catch (err) {
    return { success: false, error: err.message }
  }
}
