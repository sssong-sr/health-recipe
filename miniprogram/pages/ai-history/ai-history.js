// pages/ai-history/ai-history.js
const app = getApp()

Page({
  data: {
    sessions: []
  },

  onShow() {
    this.loadSessions()
  },

  async loadSessions() {
    try {
      const res = await app.callCloud('aiHistory', {
        type: 'sessions'
      })

      if (res.success) {
        // 格式化时间
        const sessions = res.sessions.map(s => ({
          ...s,
          last_time_str: this.formatTime(s.last_time)
        }))

        this.setData({ sessions })
      }
    } catch (err) {
      console.error('加载会话失败:', err)
    }
  },

  formatTime(dateStr) {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now - date
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60))
      if (hours === 0) {
        const mins = Math.floor(diff / (1000 * 60))
        return mins <= 1 ? '刚刚' : `${mins}分钟前`
      }
      return `${hours}小时前`
    } else if (days === 1) {
      return '昨天'
    } else if (days < 7) {
      return `${days}天前`
    } else {
      const month = date.getMonth() + 1
      const day = date.getDate()
      return `${month}月${day}日`
    }
  },

  openSession(e) {
    const sessionId = e.currentTarget.dataset.id
    wx.redirectTo({
      url: `/pages/ai-chat/ai-chat?sessionId=${sessionId}`
    })
  },

  async deleteSession(e) {
    const sessionId = e.currentTarget.dataset.id

    wx.showModal({
      title: '删除对话',
      content: '确定要删除这个对话吗？',
      confirmText: '删除',
      confirmColor: '#FF4D4F',
      cancelText: '取消',
      success: async (res) => {
        if (res.confirm) {
          try {
            await app.callCloud('aiHistory', {
              type: 'delete',
              sessionId
            })
            this.loadSessions()
            wx.showToast({ title: '已删除', icon: 'success' })
          } catch (err) {
            wx.showToast({ title: '删除失败', icon: 'error' })
          }
        }
      }
    })
  },

  startNew() {
    wx.redirectTo({
      url: '/pages/ai-chat/ai-chat'
    })
  }
})
