// pages/profile/profile.js
const app = getApp()

Page({
  data: {
    userInfo: null,
    hasProfile: false,
    checkin: {
      streak: 0,
      total_days: 0,
      badges: []
    },
    todayCheckin: false,
    subscribeEnabled: false,
    pushTime: '07:00',
    dailyMsg: '坚持就是胜利，加油！'
  },
  
  onShow() {
    this.loadUserData()
  },
  
  async loadUserData() {
    try {
      app.showLoading()
      const res = await app.callCloud('userGet')
      app.hideLoading()
      
      if (res.exists && res.user) {
        this.setData({
          userInfo: res.user,
          hasProfile: true,
          checkin: res.user.checkin || { streak: 0, total_days: 0, badges: [] },
          subscribeEnabled: res.user.subscribe_enabled || false,
          pushTime: res.user.push_time || '07:00'
        })
      }
    } catch (err) {
      console.error(err)
    }
  },
  
  // 打卡
  async doCheckin() {
    if (this.data.todayCheckin) {
      app.showToast('今日已打卡')
      return
    }
    
    try {
      app.showLoading('打卡中...')
      const res = await app.callCloud('checkin', {
        breakfast: true,
        lunch: true,
        dinner: true,
        exercise: true,
        water: 8
      })
      app.hideLoading()
      
      if (res.success) {
        this.setData({
          todayCheckin: true,
          checkin: {
            streak: res.streak,
            total_days: this.data.checkin.total_days + 1,
            badges: res.badge ? [...this.data.checkin.badges, res.badge] : this.data.checkin.badges
          }
        })
        
        let msg = `打卡成功！连续${res.streak}天`
        if (res.badge) msg += `\n🎉 获得徽章：${res.badge}`
        app.showToast(msg)
      }
    } catch (err) {
      app.hideLoading()
      app.showToast('打卡失败')
    }
  },
  
  // 切换订阅
  onToggleSubscribe(e) {
    const enabled = e.detail.value
    this.setData({ subscribeEnabled: enabled })
    app.showToast(enabled ? '已开启订阅' : '已关闭订阅')
  },
  
  // 选择推送时间
  onTimeChange(e) {
    this.setData({ pushTime: e.detail.value })
    app.showToast('推送时间已设置')
  },
  
  // 徽章说明
  showBadges() {
    wx.showModal({
      title: '🏆 徽章说明',
      content: '一周坚持：连续打卡7天\n月度达人：连续打卡30天\n百日英雄：连续打卡100天',
      showCancel: false
    })
  }
})
