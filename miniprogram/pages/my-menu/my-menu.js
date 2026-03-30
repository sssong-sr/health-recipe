// pages/my-menu/my-menu.js
const app = getApp()

Page({
  data: {
    today: '',
    menuItems: [],
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
    targetCal: 1500,
    calorieProgress: 0
  },

  onShow() {
    this.setToday()
    this.loadMenu()
    this.loadUserProfile()
  },

  // 设置今天的日期
  setToday() {
    const now = new Date()
    const month = now.getMonth() + 1
    const day = now.getDate()
    this.setData({
      today: `${month}月${day}日`
    })
  },

  // 加载用户档案
  async loadUserProfile() {
    try {
      const res = await app.callCloud('userGet', {})
      if (res.success && res.user) {
        this.setData({
          targetCal: res.user.target_cal || 1500
        })
      }
    } catch (err) {
      console.error('加载用户档案失败:', err)
    }
  },

  // 加载菜单
  loadMenu() {
    const menuItems = wx.getStorageSync('todayMenu') || []
    
    let totalCal = 0
    let totalProtein = 0
    let totalCarbs = 0
    let totalFat = 0
    
    menuItems.forEach(item => {
      totalCal += item.total_cal || 0
      totalProtein += item.nutrition?.protein || 0
      totalCarbs += item.nutrition?.carbs || 0
      totalFat += item.nutrition?.fat || 0
    })
    
    this.setData({
      menuItems,
      totalCalories: Math.round(totalCal),
      totalProtein: Math.round(totalProtein),
      totalCarbs: Math.round(totalCarbs),
      totalFat: Math.round(totalFat),
      calorieProgress: Math.round((totalCal / this.data.targetCal) * 100)
    })
  },

  // 进入菜谱详情
  goToRecipeDetail(e) {
    const recipeId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/recipe-detail/recipe-detail?id=${recipeId}`
    })
  },

  // 从菜单移除
  removeFromMenu(e) {
    const recipeId = e.currentTarget.dataset.id
    const menuItems = this.data.menuItems.filter(item => item._id !== recipeId)
    wx.setStorageSync('todayMenu', menuItems)
    this.loadMenu()
    
    wx.showToast({
      title: '已移除',
      icon: 'success',
      duration: 1500
    })
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
          this.loadMenu()
          wx.showToast({
            title: '已清空',
            icon: 'success',
            duration: 1500
          })
        }
      }
    })
  },

  // 跳转菜谱列表
  goToRecipes() {
    wx.navigateTo({
      url: '/pages/recipes/recipes'
    })
  }
})
