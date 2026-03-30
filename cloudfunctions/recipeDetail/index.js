// 云函数: recipeDetail - 获取菜谱详情
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { id } = event  // 改为 id，与前端保持一致
  
  if (!id) {
    return { success: false, error: '缺少菜谱ID' }
  }
  
  try {
    // 获取菜谱详情
    const recipeRes = await db.collection('recipes').doc(id).get()
    
    if (!recipeRes.data) {
      return { success: false, error: '菜谱不存在' }
    }
    
    // 增加浏览次数
    await db.collection('recipes').doc(id).update({
      data: {
        views: _.inc(1)
      }
    })
    
    return { 
      success: true, 
      recipe: recipeRes.data
    }
  } catch (err) {
    return { success: false, error: err.message }
  }
}
