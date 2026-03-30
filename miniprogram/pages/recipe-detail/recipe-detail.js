// pages/recipe-detail/recipe-detail.js
const app = getApp()

Page({
  data: {
    recipeId: '',
    recipe: {
      name: '',
      image: '',
      total_cal: 0,
      difficulty: '',
      time: 0,
      servings: 1,
      ingredients: [],
      steps: [],
      nutrition: {
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0
      },
      tags: []
    },
    
    // 展开状态
    showIngredients: true,
    showSteps: false,
    showNutrition: false,
    
    // 交互状态
    checkedIngredients: [],
    isCollected: false,
    isInMenu: false
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ recipeId: options.id })
      this.loadRecipeDetail()
    }
  },

  // 加载菜谱详情
  async loadRecipeDetail() {
    try {
      console.log('开始加载菜谱详情, id:', this.data.recipeId)
      
      const res = await app.callCloud('recipeDetail', {
        id: this.data.recipeId
      })
      
      console.log('菜谱详情返回:', res)
      
      if (res.success && res.recipe) {
        // 检查是否已收藏
        const collections = wx.getStorageSync('collections') || []
        const isCollected = collections.some(c => c._id === res.recipe._id)
        
        // 检查是否已在菜单中
        const todayMenu = wx.getStorageSync('todayMenu') || []
        const isInMenu = todayMenu.some(m => m._id === res.recipe._id)
        
        this.setData({ 
          recipe: res.recipe,
          isCollected,
          isInMenu
        })
      } else {
        console.error('获取菜谱失败:', res.error)
        wx.showToast({
          title: res.error || '获取详情失败',
          icon: 'error'
        })
      }
    } catch (err) {
      console.error('加载菜谱详情失败:', err)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    }
  },

  // 切换食材展开
  toggleIngredients() {
    this.setData({ showIngredients: !this.data.showIngredients })
  },

  // 切换步骤展开
  toggleSteps() {
    this.setData({ showSteps: !this.data.showSteps })
  },

  // 切换营养信息展开
  toggleNutrition() {
    this.setData({ showNutrition: !this.data.showNutrition })
  },

  // 收藏菜谱
  collectRecipe() {
    const isCollected = !this.data.isCollected
    
    // 获取收藏列表
    let collections = wx.getStorageSync('collections') || []
    
    if (isCollected) {
      // 添加到收藏
      collections.push(this.data.recipe)
      wx.showToast({
        title: '已收藏',
        icon: 'success',
        duration: 1500
      })
    } else {
      // 取消收藏
      collections = collections.filter(c => c._id !== this.data.recipe._id)
      wx.showToast({
        title: '已取消收藏',
        icon: 'success',
        duration: 1500
      })
    }
    
    wx.setStorageSync('collections', collections)
    this.setData({ isCollected })
  },

  // 加入菜单
  addToMenu() {
    const isInMenu = !this.data.isInMenu
    
    // 获取菜单列表
    let todayMenu = wx.getStorageSync('todayMenu') || []
    
    if (isInMenu) {
      // 添加到菜单
      todayMenu.push(this.data.recipe)
      wx.showToast({
        title: '已加入菜单',
        icon: 'success',
        duration: 1500
      })
    } else {
      // 从菜单移除
      todayMenu = todayMenu.filter(m => m._id !== this.data.recipe._id)
      wx.showToast({
        title: '已移除菜单',
        icon: 'success',
        duration: 1500
      })
    }
    
    wx.setStorageSync('todayMenu', todayMenu)
    this.setData({ isInMenu })
  },

  // 跳转我的收藏
  goToCollections() {
    wx.navigateTo({
      url: '/pages/collections/collections'
    })
  },

  // 跳转我的菜单
  goToMyMenu() {
    wx.navigateTo({
      url: '/pages/my-menu/my-menu'
    })
  }
})
