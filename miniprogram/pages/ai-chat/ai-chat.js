// pages/ai-chat/ai-chat.js
const app = getApp()

Page({
  data: {
    messages: [],
    inputMessage: '',
    loading: false,
    scrollToView: '',
    sessionId: null,
    userInfo: null,
    showAuthModal: false  // 是否显示授权弹窗
  },

  onLoad(options) {
    // 检查是否已有用户信息
    this.checkUserInfo()
    if (options.sessionId) {
      this.setData({ sessionId: options.sessionId })
    }
  },

  // 检查用户信息
  checkUserInfo() {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo && userInfo.avatarUrl) {
      this.setData({ userInfo })
    } else {
      // 没有头像，显示授权弹窗
      this.setData({ showAuthModal: true })
    }
  },

  // 用户选择头像
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail
    const userInfo = { avatarUrl }
    this.setData({ 
      userInfo, 
      showAuthModal: false 
    })
    wx.setStorageSync('userInfo', userInfo)
  },

  // 跳过授权
  skipAuth() {
    this.setData({ showAuthModal: false })
  },

  onInputChange(e) {
    this.setData({ inputMessage: e.detail.value })
  },

  // 发送消息
  async sendMessage() {
    const message = this.data.inputMessage.trim()
    if (!message || this.data.loading) return

    const userMessage = {
      _id: 'user_' + Date.now(),
      role: 'user',
      content: message
    }
    
    this.setData({
      messages: [...this.data.messages, userMessage],
      inputMessage: '',
      loading: true
    })

    try {
      const res = await new Promise((resolve, reject) => {
        wx.cloud.callFunction({
          name: 'aiChat',
          data: { message },
          timeout: 20000,
          success: (response) => resolve(response.result),
          fail: (err) => reject(err)
        })
      })

      if (res.success) {
        const fullAnswer = res.answer
        const chars = fullAnswer.split('')
        let currentText = ''
        
        const aiMessage = {
          _id: 'ai_' + Date.now(),
          role: 'assistant',
          content: ''
        }
        this.setData({
          messages: [...this.data.messages, aiMessage],
          loading: false
        })

        for (let i = 0; i < chars.length; i++) {
          currentText += chars[i]
          const messages = this.data.messages
          messages[messages.length - 1].content = currentText
          this.setData({ messages })
          await new Promise(resolve => setTimeout(resolve, 15))
        }
      } else {
        wx.showToast({ title: res.error || '失败', icon: 'error' })
        this.setData({ loading: false })
      }
    } catch (err) {
      console.error('发送失败:', err)
      wx.showToast({ title: err.errMsg || '网络错误', icon: 'error' })
      this.setData({ loading: false })
    }
  },

  sendQuickQuestion(e) {
    const q = e.currentTarget.dataset.q
    this.setData({ inputMessage: q }, () => this.sendMessage())
  },

  newSession() {
    this.setData({ messages: [], sessionId: null, inputMessage: '' })
    wx.showToast({ title: '新对话', icon: 'success' })
  },

  goToHistory() {
    wx.navigateTo({ url: '/pages/ai-history/ai-history' })
  }
})
