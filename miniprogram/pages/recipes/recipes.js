// pages/recipes/recipes.js
const app = getApp()

Page({
  data: {
    userGoal: '减脂',
    targetCal: 1500,
    
    mealTypes: [
      { name: '全部', value: 'all' },
      { name: '早餐', value: 'breakfast' },
      { name: '午餐', value: 'lunch' },
      { name: '晚餐', value: 'dinner' }
    ],
    goalOptions: [
      { name: '全部', value: 'all' },
      { name: '增肌', value: 'muscle' },
      { name: '减脂', value: 'fat_loss' }
    ],
    
    selectedMealTypes: ['all'],
    selectedGoals: ['all'],
    searchKeyword: '',
    
    allRecipes: [],
    filteredRecipes: [],
    
    // 已选菜谱 ID 列表（从 storage 同步）
    selectedRecipeIds: [],
    
    // 已收藏菜谱 ID 列表
    collectionIds: [],
    
    // 统计数据
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0
  },

  onLoad() {
    this.loadUserProfile()
    this.loadRecipes()
  },

  // 每次显示页面时同步菜单和收藏状态（从 my-menu 返回时刷新）
  onShow() {
    this.syncMenuState()
    this.syncCollectionState()
  },

  // 从 storage 同步菜单状态
  syncMenuState() {
    const todayMenu = wx.getStorageSync('todayMenu') || []
    const selectedRecipeIds = todayMenu.map(m => m._id)
    
    let totalCal = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0
    todayMenu.forEach(item => {
      totalCal += item.total_cal || 0
      totalProtein += (item.nutrition && item.nutrition.protein) || 0
      totalCarbs += (item.nutrition && item.nutrition.carbs) || 0
      totalFat += (item.nutrition && item.nutrition.fat) || 0
    })
    
    this.setData({
      selectedRecipeIds,
      totalCalories: Math.round(totalCal),
      totalProtein: Math.round(totalProtein),
      totalCarbs: Math.round(totalCarbs),
      totalFat: Math.round(totalFat)
    })
  },

  // 同步收藏状态
  syncCollectionState() {
    const collections = wx.getStorageSync('collections') || []
    const collectionIds = collections.map(c => c._id)
    this.setData({ collectionIds })
  },

  // 加载用户档案
  async loadUserProfile() {
    try {
      const res = await app.callCloud('userGet', {})
      if (res.success && res.user) {
        // 正确的 goal 映射
        const goalMap = {
          '增肌': 'muscle',
          '减脂': 'fat_loss',
          '维持': 'both'
        }
        const goal = goalMap[res.user.goal] || 'both'
        this.setData({
          userGoal: res.user.goal,
          targetCal: res.user.target_cal || 1500,
          selectedGoals: [goal]
        })
      }
    } catch (err) {
      console.error('加载用户档案失败:', err)
    }
  },

  // 加载菜谱列表
  async loadRecipes() {
    try {
      const res = await app.callCloud('recipeList', {})
      if (res.success && res.recipes && res.recipes.length > 0) {
        this.setData({
          allRecipes: res.recipes,
          filteredRecipes: res.recipes
        })
        this.filterRecipes()
      } else {
        await this.initTestRecipes()
      }
    } catch (err) {
      console.error('加载菜谱失败:', err)
      await this.initTestRecipes()
    }
  },

  async initTestRecipes() {
    try {
      const res = await app.callCloud('initRecipes', {})
      if (res.success) {
        setTimeout(() => this.loadRecipes(), 500)
      }
    } catch (err) {
      wx.showToast({ title: '加载菜谱失败', icon: 'error' })
    }
  },

  // 时段筛选
  onMealTypeChange(e) {
    const value = e.currentTarget.dataset.value
    let selected = [...this.data.selectedMealTypes]
    if (value === 'all') {
      selected = ['all']
    } else {
      selected = selected.filter(v => v !== 'all')
      if (selected.includes(value)) {
        selected = selected.filter(v => v !== value)
      } else {
        selected.push(value)
      }
      if (selected.length === 0) selected = ['all']
    }
    this.setData({ selectedMealTypes: selected })
    this.filterRecipes()
  },

  // 目标筛选
  onGoalChange(e) {
    const value = e.currentTarget.dataset.value
    let selected = [...this.data.selectedGoals]
    if (value === 'all') {
      selected = ['all']
    } else {
      selected = selected.filter(v => v !== 'all')
      if (selected.includes(value)) {
        selected = selected.filter(v => v !== value)
      } else {
        selected.push(value)
      }
      if (selected.length === 0) selected = ['all']
    }
    this.setData({ selectedGoals: selected })
    this.filterRecipes()
  },

  // 搜索
  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value })
    this.filterRecipes()
  },

  // 筛选菜谱
  filterRecipes() {
    const { allRecipes, selectedMealTypes, selectedGoals, searchKeyword } = this.data
    let filtered = allRecipes.filter(recipe => {
      if (!selectedMealTypes.includes('all') && !selectedMealTypes.includes(recipe.category)) return false
      if (!selectedGoals.includes('all')) {
        if (recipe.goal !== 'both' && !selectedGoals.includes(recipe.goal)) return false
      }
      if (searchKeyword) {
        const kw = searchKeyword.toLowerCase()
        const matchName = recipe.name.toLowerCase().includes(kw)
        const matchIng = (recipe.ingredients || []).some(ing => ing.name.toLowerCase().includes(kw))
        if (!matchName && !matchIng) return false
      }
      return true
    })
    this.setData({ filteredRecipes: filtered })
  },

  // 进入菜谱详情
  goToRecipeDetail(e) {
    wx.navigateTo({
      url: `/pages/recipe-detail/recipe-detail?id=${e.currentTarget.dataset.id}`
    })
  },

  // 快速加入/移除菜单
  quickAddToMenu(e) {
    const recipe = e.currentTarget.dataset.recipe
    const recipeId = recipe._id
    let todayMenu = wx.getStorageSync('todayMenu') || []
    
    const isInMenu = todayMenu.some(m => m._id === recipeId)
    if (isInMenu) {
      todayMenu = todayMenu.filter(m => m._id !== recipeId)
      wx.showToast({ title: '已移除', icon: 'success', duration: 1000 })
    } else {
      todayMenu.push(recipe)
      wx.showToast({ title: '已加入菜单', icon: 'success', duration: 1000 })
    }
    
    wx.setStorageSync('todayMenu', todayMenu)
    this.syncMenuState()
  },

  // 快速收藏/取消收藏
  quickCollect(e) {
    const recipe = e.currentTarget.dataset.recipe
    const recipeId = recipe._id
    let collections = wx.getStorageSync('collections') || []
    
    const isCollected = collections.some(c => c._id === recipeId)
    if (isCollected) {
      collections = collections.filter(c => c._id !== recipeId)
      wx.showToast({ title: '已取消收藏', icon: 'success', duration: 1000 })
    } else {
      collections.push(recipe)
      wx.showToast({ title: '已收藏', icon: 'success', duration: 1000 })
    }
    
    wx.setStorageSync('collections', collections)
    // 刷新收藏状态
    const collectionIds = collections.map(c => c._id)
    this.setData({ collectionIds })
  },

  // 清空菜单
  clearMenu() {
    wx.showModal({
      title: '清空菜单',
      content: '确定要清空今日菜单吗？',
      confirmText: '确定',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          wx.setStorageSync('todayMenu', [])
          this.syncMenuState()
        }
      }
    })
  },

  // 查看菜单详情
  viewMenuDetail() {
    wx.navigateTo({ url: '/pages/my-menu/my-menu' })
  },

  goToCollections() {
    wx.navigateTo({ url: '/pages/collections/collections' })
  },

  goToMyMenu() {
    wx.navigateTo({ url: '/pages/my-menu/my-menu' })
  }
})
