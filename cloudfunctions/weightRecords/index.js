// 云函数: weightRecords - 获取体重记录
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  
  const { days = 7 } = event
  
  try {
    // 计算日期范围（包含今天）
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days + 1)  // +1 确保包含今天
    
    const startStr = startDate.toISOString().split('T')[0]
    const endStr = endDate.toISOString().split('T')[0]
    
    console.log('查询日期范围:', startStr, '-', endStr)
    
    const recordsRes = await db.collection('weight_records').where({
      _openid: openid,
      date: _.gte(startStr)
    }).orderBy('date', 'asc').get()
    
    console.log('查询到记录数:', recordsRes.data.length)
    
    // 填充缺失的日期
    const records = []
    const dateMap = {}
    recordsRes.data.forEach(item => {
      dateMap[item.date] = item.weight
    })
    
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate)
      d.setDate(d.getDate() + i)
      const dateStr = d.toISOString().split('T')[0]
      records.push({
        date: dateStr,
        weight: dateMap[dateStr] || null
      })
    }
    
    return {
      success: true,
      records
    }
  } catch (err) {
    console.error('查询失败:', err)
    return { success: false, error: err.message }
  }
}
