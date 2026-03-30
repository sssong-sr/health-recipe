// app.js - 全局入口
App({
  onLaunch() {
    // 初始化云开发
    if (wx.cloud) {
      wx.cloud.init({
        env: 'cloud1-7gnwzpwhf7d728bb',
        traceUser: true
      })
    }
  },
  
  globalData: {
    userInfo: null,
    userMetabolism: null
  },
  
  // 调用云函数
  callCloud(functionName, data = {}, timeout = 30000) {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: functionName,
        data,
        timeout: timeout,
        success: res => resolve(res.result),
        fail: err => reject(err)
      })
    })
  },
  
  // 显示加载提示
  showLoading(title = '加载中...') {
    wx.showLoading({ title, mask: true })
  },
  
  // 隐藏加载
  hideLoading() {
    wx.hideLoading()
  },
  
  // 显示Toast
  showToast(title, icon = 'none') {
    wx.showToast({ title, icon })
  }
})
