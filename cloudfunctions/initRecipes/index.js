// 云函数: initRecipes - 初始化菜谱测试数据
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  try {
    // 先清空旧数据
    const oldData = await db.collection('recipes').get()
    if (oldData.data.length > 0) {
      const ids = oldData.data.map(item => item._id)
      for (const id of ids) {
        await db.collection('recipes').doc(id).remove()
      }
    }
    
    const recipes = [
      {
        name: '番茄鸡蛋面',
        image: 'https://picsum.photos/seed/tomato/400/225',
        category: 'lunch',
        goal: 'fat_loss',
        total_cal: 450,
        difficulty: '简单',
        time: 15,
        servings: 1,
        ingredients: [
          { name: '番茄', amount: 1, unit: '个' },
          { name: '鸡蛋', amount: 2, unit: '个' },
          { name: '面条', amount: 100, unit: 'g' },
          { name: '油', amount: 10, unit: 'ml' }
        ],
        steps: [
          { step: 1, description: '番茄切块，鸡蛋打散' },
          { step: 2, description: '热油炒番茄至出汁' },
          { step: 3, description: '加入鸡蛋炒匀' },
          { step: 4, description: '煮面条至软，加入番茄鸡蛋' }
        ],
        nutrition: { protein: 18, carbs: 55, fat: 12, fiber: 3 },
        tags: ['低脂', '高蛋白', '快手菜']
      },
      {
        name: '鸡胸肉沙拉',
        image: 'https://picsum.photos/seed/salad/400/225',
        category: 'lunch',
        goal: 'muscle',
        total_cal: 380,
        difficulty: '简单',
        time: 10,
        servings: 1,
        ingredients: [
          { name: '鸡胸肉', amount: 150, unit: 'g' },
          { name: '生菜', amount: 100, unit: 'g' },
          { name: '番茄', amount: 1, unit: '个' },
          { name: '橄榄油', amount: 15, unit: 'ml' }
        ],
        steps: [
          { step: 1, description: '鸡胸肉煮熟切块' },
          { step: 2, description: '生菜和番茄切块' },
          { step: 3, description: '混合所有材料' },
          { step: 4, description: '淋上橄榄油和柠檬汁' }
        ],
        nutrition: { protein: 42, carbs: 8, fat: 15, fiber: 2 },
        tags: ['高蛋白', '低碳水', '健身餐']
      },
      {
        name: '燕麦粥',
        image: 'https://picsum.photos/seed/oatmeal/400/225',
        category: 'breakfast',
        goal: 'both',
        total_cal: 280,
        difficulty: '简单',
        time: 5,
        servings: 1,
        ingredients: [
          { name: '燕麦', amount: 50, unit: 'g' },
          { name: '牛奶', amount: 200, unit: 'ml' },
          { name: '蜂蜜', amount: 10, unit: 'g' },
          { name: '蓝莓', amount: 50, unit: 'g' }
        ],
        steps: [
          { step: 1, description: '燕麦加入牛奶' },
          { step: 2, description: '微波炉加热3分钟' },
          { step: 3, description: '加入蜂蜜搅拌' },
          { step: 4, description: '撒上蓝莓装饰' }
        ],
        nutrition: { protein: 10, carbs: 45, fat: 6, fiber: 5 },
        tags: ['高纤维', '饱腹感强', '早餐']
      },
      {
        name: '清蒸鱼',
        image: 'https://picsum.photos/seed/fish/400/225',
        category: 'dinner',
        goal: 'fat_loss',
        total_cal: 320,
        difficulty: '中等',
        time: 20,
        servings: 1,
        ingredients: [
          { name: '鱼', amount: 200, unit: 'g' },
          { name: '生姜', amount: 10, unit: 'g' },
          { name: '葱', amount: 20, unit: 'g' },
          { name: '酱油', amount: 10, unit: 'ml' }
        ],
        steps: [
          { step: 1, description: '鱼洗净放盘中' },
          { step: 2, description: '铺上生姜和葱段' },
          { step: 3, description: '蒸锅烧开，放入蒸15分钟' },
          { step: 4, description: '淋上酱油即可' }
        ],
        nutrition: { protein: 38, carbs: 2, fat: 10, fiber: 0 },
        tags: ['低脂', '高蛋白', '清淡']
      },
      {
        name: '牛肉炒饭',
        image: 'https://picsum.photos/seed/beef/400/225',
        category: 'lunch',
        goal: 'muscle',
        total_cal: 520,
        difficulty: '中等',
        time: 15,
        servings: 1,
        ingredients: [
          { name: '牛肉', amount: 100, unit: 'g' },
          { name: '米饭', amount: 150, unit: 'g' },
          { name: '鸡蛋', amount: 1, unit: '个' },
          { name: '豌豆', amount: 50, unit: 'g' }
        ],
        steps: [
          { step: 1, description: '牛肉切粒炒至变色' },
          { step: 2, description: '加入米饭炒散' },
          { step: 3, description: '打入鸡蛋炒匀' },
          { step: 4, description: '加入豌豆，调味即可' }
        ],
        nutrition: { protein: 28, carbs: 62, fat: 14, fiber: 2 },
        tags: ['高蛋白', '增肌', '能量餐']
      },
      {
        name: '蛋白质煎饼',
        image: 'https://picsum.photos/seed/pancake/400/225',
        category: 'breakfast',
        goal: 'muscle',
        total_cal: 350,
        difficulty: '简单',
        time: 10,
        servings: 1,
        ingredients: [
          { name: '鸡蛋', amount: 3, unit: '个' },
          { name: '燕麦粉', amount: 50, unit: 'g' },
          { name: '香蕉', amount: 1, unit: '个' },
          { name: '油', amount: 5, unit: 'ml' }
        ],
        steps: [
          { step: 1, description: '鸡蛋打散，加入燕麦粉' },
          { step: 2, description: '香蕉捣碎加入混合' },
          { step: 3, description: '平底锅热油，倒入面糊' },
          { step: 4, description: '两面煎至金黄即可' }
        ],
        nutrition: { protein: 20, carbs: 38, fat: 10, fiber: 3 },
        tags: ['高蛋白', '早餐', '增肌']
      },
      {
        name: '西兰花炒虾仁',
        image: 'https://picsum.photos/seed/broccoli/400/225',
        category: 'lunch',
        goal: 'fat_loss',
        total_cal: 280,
        difficulty: '中等',
        time: 12,
        servings: 1,
        ingredients: [
          { name: '虾仁', amount: 150, unit: 'g' },
          { name: '西兰花', amount: 200, unit: 'g' },
          { name: '大蒜', amount: 3, unit: '瓣' },
          { name: '油', amount: 8, unit: 'ml' }
        ],
        steps: [
          { step: 1, description: '西兰花切小朵，虾仁洗净' },
          { step: 2, description: '热油炒大蒜香' },
          { step: 3, description: '加入虾仁炒至变红' },
          { step: 4, description: '加入西兰花炒至熟，调味' }
        ],
        nutrition: { protein: 35, carbs: 12, fat: 8, fiber: 3 },
        tags: ['低脂', '高蛋白', '清淡']
      },
      {
        name: '红豆薏米粥',
        image: 'https://picsum.photos/seed/porridge/400/225',
        category: 'breakfast',
        goal: 'fat_loss',
        total_cal: 220,
        difficulty: '简单',
        time: 30,
        servings: 1,
        ingredients: [
          { name: '红豆', amount: 50, unit: 'g' },
          { name: '薏米', amount: 30, unit: 'g' },
          { name: '水', amount: 500, unit: 'ml' },
          { name: '冰糖', amount: 5, unit: 'g' }
        ],
        steps: [
          { step: 1, description: '红豆和薏米提前浸泡' },
          { step: 2, description: '加水烧开' },
          { step: 3, description: '转小火煮30分钟' },
          { step: 4, description: '加冰糖调味即可' }
        ],
        nutrition: { protein: 8, carbs: 42, fat: 2, fiber: 6 },
        tags: ['低脂', '高纤维', '养生']
      },
      {
        name: '黑椒牛排',
        image: 'https://picsum.photos/seed/steak/400/225',
        category: 'dinner',
        goal: 'muscle',
        total_cal: 480,
        difficulty: '中等',
        time: 15,
        servings: 1,
        ingredients: [
          { name: '牛排', amount: 200, unit: 'g' },
          { name: '黑椒', amount: 5, unit: 'g' },
          { name: '盐', amount: 2, unit: 'g' },
          { name: '油', amount: 10, unit: 'ml' }
        ],
        steps: [
          { step: 1, description: '牛排室温放置30分钟' },
          { step: 2, description: '两面撒盐和黑椒' },
          { step: 3, description: '热锅下油，牛排煎3-4分钟' },
          { step: 4, description: '翻面再煎3-4分钟，静置5分钟' }
        ],
        nutrition: { protein: 45, carbs: 0, fat: 28, fiber: 0 },
        tags: ['高蛋白', '增肌', '低碳水']
      },
      {
        name: '豆腐脑',
        image: 'https://picsum.photos/seed/tofu/400/225',
        category: 'breakfast',
        goal: 'fat_loss',
        total_cal: 150,
        difficulty: '简单',
        time: 5,
        servings: 1,
        ingredients: [
          { name: '豆腐脑', amount: 300, unit: 'g' },
          { name: '酱油', amount: 10, unit: 'ml' },
          { name: '醋', amount: 5, unit: 'ml' },
          { name: '葱', amount: 5, unit: 'g' }
        ],
        steps: [
          { step: 1, description: '豆腐脑盛入碗中' },
          { step: 2, description: '淋上酱油和醋' },
          { step: 3, description: '撒上葱花' },
          { step: 4, description: '即可食用' }
        ],
        nutrition: { protein: 15, carbs: 8, fat: 5, fiber: 1 },
        tags: ['低脂', '高蛋白', '清淡']
      },
      {
        name: '糙米饭配烤鸡腿',
        image: 'https://picsum.photos/seed/chicken/400/225',
        category: 'lunch',
        goal: 'muscle',
        total_cal: 550,
        difficulty: '中等',
        time: 40,
        servings: 1,
        ingredients: [
          { name: '鸡腿', amount: 200, unit: 'g' },
          { name: '糙米', amount: 100, unit: 'g' },
          { name: '盐', amount: 2, unit: 'g' },
          { name: '黑椒', amount: 3, unit: 'g' }
        ],
        steps: [
          { step: 1, description: '糙米洗净加水煮' },
          { step: 2, description: '鸡腿撒盐和黑椒腌制' },
          { step: 3, description: '烤箱200度烤25分钟' },
          { step: 4, description: '配糙米饭食用' }
        ],
        nutrition: { protein: 40, carbs: 50, fat: 16, fiber: 3 },
        tags: ['高蛋白', '增肌', '能量餐']
      },
      {
        name: '清汤面条',
        image: 'https://picsum.photos/seed/noodle/400/225',
        category: 'dinner',
        goal: 'fat_loss',
        total_cal: 280,
        difficulty: '简单',
        time: 10,
        servings: 1,
        ingredients: [
          { name: '面条', amount: 100, unit: 'g' },
          { name: '青菜', amount: 100, unit: 'g' },
          { name: '清汤', amount: 500, unit: 'ml' },
          { name: '盐', amount: 2, unit: 'g' }
        ],
        steps: [
          { step: 1, description: '清汤烧开' },
          { step: 2, description: '加入面条煮至软' },
          { step: 3, description: '加入青菜继续煮' },
          { step: 4, description: '调味即可' }
        ],
        nutrition: { protein: 10, carbs: 48, fat: 3, fiber: 2 },
        tags: ['低脂', '清淡', '晚餐']
      },
      {
        name: '酸奶水果碗',
        image: 'https://picsum.photos/seed/yogurt/400/225',
        category: 'breakfast',
        goal: 'both',
        total_cal: 200,
        difficulty: '简单',
        time: 3,
        servings: 1,
        ingredients: [
          { name: '希腊酸奶', amount: 150, unit: 'g' },
          { name: '蓝莓', amount: 50, unit: 'g' },
          { name: '草莓', amount: 50, unit: 'g' },
          { name: '坚果', amount: 20, unit: 'g' }
        ],
        steps: [
          { step: 1, description: '酸奶倒入碗中' },
          { step: 2, description: '加入新鲜水果' },
          { step: 3, description: '撒上坚果' },
          { step: 4, description: '即可享用' }
        ],
        nutrition: { protein: 18, carbs: 22, fat: 6, fiber: 3 },
        tags: ['高蛋白', '低脂', '早餐']
      },
      {
        name: '番茄牛肉汤',
        image: 'https://picsum.photos/seed/soup/400/225',
        category: 'dinner',
        goal: 'fat_loss',
        total_cal: 320,
        difficulty: '中等',
        time: 30,
        servings: 1,
        ingredients: [
          { name: '牛肉', amount: 150, unit: 'g' },
          { name: '番茄', amount: 2, unit: '个' },
          { name: '洋葱', amount: 50, unit: 'g' },
          { name: '清汤', amount: 400, unit: 'ml' }
        ],
        steps: [
          { step: 1, description: '牛肉切块焯水' },
          { step: 2, description: '番茄和洋葱切块' },
          { step: 3, description: '加清汤烧开转小火' },
          { step: 4, description: '煮20分钟至牛肉软烂' }
        ],
        nutrition: { protein: 32, carbs: 15, fat: 10, fiber: 2 },
        tags: ['低脂', '高蛋白', '汤类']
      }
    ]
    
    // 批量插入
    let insertedCount = 0
    for (const recipe of recipes) {
      await db.collection('recipes').add({ data: recipe })
      insertedCount++
    }
    
    console.log('成功插入', insertedCount, '条菜谱')
    
    return {
      success: true,
      message: `成功创建 ${insertedCount} 条菜谱数据`
    }
  } catch (err) {
    console.error('创建菜谱数据失败:', err)
    return { success: false, error: err.message }
  }
}