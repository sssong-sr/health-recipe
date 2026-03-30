// 云函数: recipeList - 获取菜谱列表
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { 
    category,   // 分类: breakfast/lunch/dinner
    goal,       // 目标: fat_loss/muscle/both
    keyword,    // 搜索关键词
    page = 1, 
    size = 20 
  } = event
  
  try {
    let query = db.collection('recipes')
    let whereConditions = {}
    
    // 按分类筛选
    if (category && category !== 'all') {
      whereConditions.category = category
    }
    
    // 按目标筛选
    if (goal && goal !== 'all') {
      // goal 可能是 'fat_loss', 'muscle', 或 'both'
      whereConditions.goal = _.in([goal, 'both'])
    }
    
    // 应用 where 条件
    if (Object.keys(whereConditions).length > 0) {
      query = query.where(whereConditions)
    }
    
    // 搜索关键词（按名称搜索）
    if (keyword) {
      query = query.where({
        name: db.RegExp({
          regexp: keyword,
          options: 'i'
        })
      })
    }
    
    // 获取总数
    const countRes = await query.count()
    const total = countRes.total
    
    // 分页查询
    const skip = (page - 1) * size
    const listRes = await query.orderBy('_id', 'desc').skip(skip).limit(size).get()
    
    console.log('查询菜谱:', {
      category,
      goal,
      keyword,
      total,
      returned: listRes.data.length
    })
    
    return { 
      success: true, 
      recipes: listRes.data,
      total,
      page,
      size
    }
  } catch (err) {
    console.error('查询菜谱失败:', err)
    return { success: false, error: err.message }
  }
}
