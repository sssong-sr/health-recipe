// pages/collections/collections.js
const app = getApp()

Page({
  data: {
    collections: []
  },

  onShow() {
    this.loadCollections()
  },

  // 加载收藏列表
  loadCollections() {
    const collections = wx.getStorageSync('collections') || []
    this.setData({ collections })
  },

  // 进入菜谱详情
  goToRecipeDetail(e) {
    const recipeId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/recipe-detail/recipe-detail?id=${recipeId}`
    })
  },

  // 取消收藏
  uncollectRecipe(e) {
    const recipeId = e.currentTarget.dataset.id
    const collections = this.data.collections.filter(c => c._id !== recipeId)
    wx.setStorageSync('collections', collections)
    this.setData({ collections })
    
    wx.showToast({
      title: '已取消收藏',
      icon: 'success',
      duration: 1500
    })
  },

  // 跳转菜谱列表
  goToRecipes() {
    wx.navigateTo({
      url: '/pages/recipes/recipes'
    })
  }
})
