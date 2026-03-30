// 云函数: dailyPush - 每日7点定时推送食谱
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

// 三餐分配比例
const MEAL_RATIO = {
  breakfast: 0.25,
  lunch: 0.40,
  dinner: 0.25,
  snack: 0.10
}

// 根据目标获取推荐标签
function getGoalTags(goal) {
  if (goal === '减脂') return '减脂'
  if (goal === '增肌') return '增肌'
  return '维持'
}

// 随机选择菜谱（避免每天重复）
function selectRecipes(recipes, category, targetCal, excludeIds = []) {
  const ratio = MEAL_RATIO[category]
  const targetMealCal = Math.round(targetCal * ratio)
  
  // 筛选该分类且热量接近的菜谱
  const filtered = recipes.filter(r => 
    r.category === category && 
    !excludeIds.includes(r._id) &&
    r.total_cal <= targetMealCal + 100 &&
    r.total_cal >= targetMealCal - 150
  )
  
  if (filtered.length ===) return null
  
  // 随机选择
  const selected = filtered[Math.floor(Math.random() * filtered.length)]
  return {
    recipe_id: selected._id,
    recipe_name: selected.name,
    cal: selected.total_cal,
    image: selected.image
  }
}

exports.main = async (event, context) => {
  const today = new Date().toISOString().split('T')[0]
  
  try {
    // 1. 获取所有开启订阅的用户
    const usersRes = await db.collection('users').where({
      subscribe_enabled: true
    }).get()
    
    if (usersRes.data.length === 0) {
      return { success: true, message: '没有需要推送的用户' }
    }
    
    // 2. 获取所有菜谱
    const recipesRes = await db.collection('recipes').where({
      status: 1
    }).get()
    
    const allRecipes = recipesRes.data
    
    // 3. 遍历用户生成推荐
    const pushResults = []
    
    for (const user of usersRes.data) {
      const targetCal = user.target_cal || 2000
      const goal = user.goal || '维持'
      const excludeIds = [] // 可以根据历史推荐记录排除
      
      // 为用户生成今日推荐
      const breakfast = selectRecipes(allRecipes, '早餐', targetCal, excludeIds)
      const lunch = selectRecipes(allRecipes, '午餐', targetCal, excludeIds)
      const dinner = selectRecipes(allRecipes, '晚餐', targetCal, excludeIds)
      const snack = selectRecipes(allRecipes, '加餐', targetCal, excludeIds)
      
      if (!breakfast || !lunch || !dinner) {
        pushResults.push({ openid: user._openid, success: false, error: '菜谱不足' })
        continue
      }
      
      const totalCal = breakfast.cal + lunch.cal + dinner.cal + (snack?.cal || 0)
      
      // 保存推荐记录
      await db.collection('daily_recommend').add({
        data: {
          openid: user._openid,
          date: today,
          target_cal: targetCal,
          breakfast,
          lunch,
          dinner,
          snack,
          total_cal: totalCal,
          push_status: 0,
          created_at: new Date().toISOString()
        }
      })
      
      // 4. 发送订阅消息
      try {
        await cloud.openapi.subscribeMessage.send({
          touser: user._openid,
          templateId: 'YOUR_TEMPLATE_ID', // 需要在微信后台配置
          page: 'pages/index/index',
          data: {
            thing1: { value: '今日食谱已准备好' },
            thing2: { value: `${breakfast.name} + ${lunch.name} + ${dinner.name}` },
            number3: { value: totalCal },
            thing4: { value: '点击查看详情' }
          }
        })
        
        pushResults.push({ openid: user._openid, success: true })
      } catch (err) {
        pushResults.push({ openid: user._openid, success: false, error: err.message })
      }
    }
    
    return { 
      success: true, 
      date: today,
      totalUsers: usersRes.data.length,
      results: pushResults
    }
  } catch (err) {
    return { success: false, error: err.message }
  }
}
