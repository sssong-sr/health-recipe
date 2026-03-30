// pages/index/index.js
const app = getApp()

Page({
  data: {
    // 用户信息
    hasProfile: false,
    userInfo: null,
    showAuthDialog: false,
    
    // 表单数据
    age: '',
    height: '',
    weight: '',
    gender: 'male',
    goal: '减脂',
    exerciseLevel: 1.375,
    sliderValue: 1,
    
    // 计算结果
    bmr: 0,
    tdee: 0,
    targetCal: 0,
    showResult: false,
    
    // 健康数据
    bmi: 0,
    bmiStatus: '',
    initialWeight: 0,  // 档案初始体重（固定）
    targetWeight: 0,   // 目标体重（固定，基于初始体重）
    weightDiff: '',
    currentWeight: 0,  // 当前体重（最新记录）
    
    // 体重输入
    inputWeight: '',
    
    // 体重图表
    weightRecords: [],
    hasWeightData: false,
    chartDays: 7,
    chartDaysOptions: [
      { name: '一周', value: 7 },
      { name: '一个月', value: 30 }
    ],
    
    // 心情记录
    todayMood: '',
    moodOptions: [
      { emoji: '😄', name: '开心', value: 'happy' },
      { emoji: '🙂', name: '不错', value: 'good' },
      { emoji: '😐', name: '一般', value: 'normal' },
      { emoji: '😔', name: '低落', value: 'sad' },
      { emoji: '😤', name: '烦躁', value: 'angry' }
    ],
    moodHistory: [],
    
    // 选项
    goalOptions: [
      { name: '减脂', value: '减脂' },
      { name: '增肌', value: '增肌' },
      { name: '维持', value: '维持' }
    ],
    genderOptions: [
      { name: '男', value: 'male' },
      { name: '女', value: 'female' }
    ],
    exerciseOptions: [
      { label: '久坐', value: 1.2 },
      { label: '轻度', value: 1.375 },
      { label: '中度', value: 1.55 },
      { label: '重度', value: 1.725 },
      { label: '运动员', value: 1.9 }
    ]
  },
  
  onLoad() {
    console.log('===== index 页面加载 =====')
    
    // 加载用户数据
    this.loadUserData()
  },
  
  // 加载用户数据（头像 + 档案）
  async loadUserData() {
    // 1. 先检查本地缓存的头像
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo && userInfo.avatarUrl) {
      this.setData({ userInfo })
    } else {
      // 没有头像，显示授权弹窗
      this.setData({ showAuthDialog: true })
    }
    
    // 2. 加载档案
    await this.loadUserProfile()
    
    // 3. 加载体重记录和心情
    this.updateSliderValue()
    this.loadWeightRecords()
    this.loadMoodHistory()
  },
  
  // 用户授权头像成功
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail
    const userInfo = { avatarUrl }
    wx.setStorageSync('userInfo', userInfo)
    this.setData({ 
      userInfo,
      showAuthDialog: false 
    })
    
    // 授权后检查是否有档案，没有就显示表单
    if (!this.data.hasProfile) {
      this.setData({ showResult: false })
    }
  },
  
  updateSliderValue() {
    const idx = this.data.exerciseOptions.findIndex(o => o.value === this.data.exerciseLevel)
    this.setData({ sliderValue: idx >= 0 ? idx : 1 })
  },
  
  // 计算 BMI
  calculateBMI(height, weight) {
    if (!height || !weight) return 0
    const heightM = height / 100
    return (weight / (heightM * heightM)).toFixed(1)
  },
  
  // 获取 BMI 状态
  getBMIStatus(bmi) {
    if (bmi < 18.5) return { text: '偏瘦', color: '#FF9800' }
    if (bmi < 24) return { text: '正常', color: '#07C160' }
    if (bmi < 28) return { text: '偏胖', color: '#FF9800' }
    return { text: '肥胖', color: '#F44336' }
  },
  
  // 计算目标体重（基于初始体重）
  calculateTargetWeight(initialWeight, goal) {
    switch (goal) {
      case '减脂':
        return (initialWeight * 0.9).toFixed(1)
      case '增肌':
        return (initialWeight * 1.1).toFixed(1)
      default:
        return initialWeight.toFixed(1)
    }
  },
  
  // 计算距离目标（当前体重 vs 目标体重）
  calculateWeightDiff(currentWeight, targetWeight, goal) {
    const current = parseFloat(currentWeight)
    const target = parseFloat(targetWeight)
    const diff = (target - current).toFixed(1)
    
    if (goal === '减脂') {
      // 目标体重 < 当前体重，差值应该是正数表示还需减多少
      if (current > target + 0.1) {
        return `还需减 ${(current - target).toFixed(1)}kg`
      } else if (current < target - 0.1) {
        return `已达标，超减 ${(target - current).toFixed(1)}kg 🎉`
      } else {
        return `已达标 🎉`
      }
    } else if (goal === '增肌') {
      // 目标体重 > 当前体重
      if (current < target - 0.1) {
        return `还需增 ${(target - current).toFixed(1)}kg`
      } else if (current > target + 0.1) {
        return `已达标，超增 ${(current - target).toFixed(1)}kg 🎉`
      } else {
        return `已达标 🎉`
      }
    }
    return '体重稳定'
  },
  
  // 加载用户档案
  async loadUserProfile() {
    console.log('===== 开始加载用户档案 =====')
    try {
      app.showLoading()
      const res = await app.callCloud('userGet', {}, 15000)
      app.hideLoading()
      
      if (res.exists && res.user) {
        const u = res.user
        const initialWeight = parseFloat(u.weight)  // 档案初始体重
        const height = parseInt(u.height)
        const goal = u.goal
        
        // 计算各项指标
        const bmi = this.calculateBMI(height, initialWeight)
        const bmiStatus = this.getBMIStatus(bmi)
        const targetWeight = this.calculateTargetWeight(initialWeight, goal)  // 目标体重固定
        
        // 获取最新体重记录
        const latestWeight = await this.getLatestWeight()
        const currentWeight = latestWeight || initialWeight
        const weightDiff = this.calculateWeightDiff(currentWeight, targetWeight, goal)
        
        // 保留微信头像
        const wxAvatar = this.data.userInfo?.avatarUrl || null
        
        this.setData({
          hasProfile: true,
          userInfo: wxAvatar ? { avatarUrl: wxAvatar } : null,
          age: u.age,
          height: u.height,
          weight: u.weight,
          gender: u.gender_calc,
          goal: u.goal,
          exerciseLevel: u.exercise_level,
          bmr: u.bmr,
          tdee: u.tdee,
          targetCal: u.target_cal,
          initialWeight: initialWeight,
          targetWeight: targetWeight,
          currentWeight: currentWeight,
          weightDiff: weightDiff,
          bmi: bmi,
          bmiStatus: bmiStatus,
          showResult: true
        })
      } else {
        this.setData({
          hasProfile: false,
          showResult: false
        })
      }
    } catch (err) {
      app.hideLoading()
      console.error('加载用户档案失败:', err)
      this.setData({
        hasProfile: false,
        showResult: false
      })
    }
  },
  
  // 获取最新体重
  async getLatestWeight() {
    try {
      const res = await app.callCloud('weightRecords', { days: 1 })
      if (res.success && res.records && res.records.length > 0) {
        const latest = res.records.filter(r => r.weight !== null)
        if (latest.length > 0) {
          return latest[latest.length - 1].weight
        }
      }
      return null
    } catch (err) {
      return null
    }
  },
  
  // 页面渲染完成后缓存 canvas 节点
  onReady() {
    // onReady 时 canvas 可能还没数据，不需要初始化
    // 等 loadWeightRecords 拿到数据后再初始化
  },

  // 初始化 canvas，缓存节点
  initCanvas() {
    this._canvasInited = false
    this._canvas = null
    
    const query = wx.createSelectorQuery().in(this)
    query.select('#weightChart')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (res && res[0] && res[0].node) {
          this._canvasInited = true
          this._canvas = res[0].node
          this._canvasWidth = res[0].width
          this._canvasHeight = res[0].height
          console.log('canvas 初始化成功', this._canvasWidth, this._canvasHeight)
          
          if (this.data.weightRecords && this.data.weightRecords.length > 0) {
            this.doDrawChart(this.data.weightRecords)
          }
        } else {
          console.warn('canvas 初始化失败，1秒后重试')
          setTimeout(() => this.initCanvas(), 1000)
        }
      })
  },

  // 加载体重记录
  async loadWeightRecords() {
    console.log('开始加载体重记录...')
    try {
      const res = await app.callCloud('weightRecords', {
        days: this.data.chartDays
      }, 15000)
      console.log('体重记录响应:', res)
      
      if (res.success && res.records && res.records.length > 0) {
        const validRecords = res.records.filter(r => r.weight !== null)
        
        if (validRecords.length > 0) {
          this.setData({
            weightRecords: validRecords,
            hasWeightData: true
          }, () => {
            // 数据设置后，等待下一帧再绘制
            setTimeout(() => {
              this.initCanvas()
            }, 100)
          })
        } else {
          this.setData({ hasWeightData: false })
        }
      } else {
        this.setData({ hasWeightData: false })
      }
    } catch (err) {
      console.error('加载体重记录失败:', err)
      this.setData({ hasWeightData: false })
    }
  },

  // 绘制折线图（直接使用缓存的 canvas）
  doDrawChart(records) {
    console.log('doDrawChart 被调用', records.length)
    const canvas = this._canvas
    if (!canvas) {
      console.warn('canvas 未就绪，跳过绘制')
      return
    }
    console.log('canvas 尺寸:', this._canvasWidth, this._canvasHeight)
    
    const dpr = wx.getSystemInfoSync().pixelRatio
    const width = this._canvasWidth
    const height = this._canvasHeight
    
    canvas.width = width * dpr
    canvas.height = height * dpr
    
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)
    
    const padding = { top: 30, right: 20, bottom: 50, left: 50 }
    const chartWidth = width - padding.left - padding.right
    const chartHeight = height - padding.top - padding.bottom
    
    // 计算数据范围
    const weights = records.map(r => r.weight)
    const minWeight = Math.floor(Math.min(...weights) - 1)
    const maxWeight = Math.ceil(Math.max(...weights) + 1)
    const weightRange = maxWeight - minWeight || 1
    
    // 清空画布
    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = '#FAFAFA'
    ctx.fillRect(0, 0, width, height)
    
    // 绘制网格线
    ctx.strokeStyle = '#EEEEEE'
    ctx.lineWidth = 1
    const gridCount = 5
    for (let i = 0; i <= gridCount; i++) {
      const y = padding.top + (chartHeight / gridCount) * i
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(width - padding.right, y)
      ctx.stroke()
    }
    
    // 绘制Y轴刻度
    ctx.fillStyle = '#999999'
    ctx.font = '11px Arial'
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    for (let i = 0; i <= gridCount; i++) {
      const weight = maxWeight - (weightRange / gridCount) * i
      const y = padding.top + (chartHeight / gridCount) * i
      ctx.fillText(weight.toFixed(0) + 'kg', padding.left - 5, y)
    }
    
    const pointSpacing = chartWidth / (records.length - 1 || 1)
    
    // 绘制填充区域
    ctx.fillStyle = 'rgba(7, 193, 96, 0.1)'
    ctx.beginPath()
    ctx.moveTo(padding.left, padding.top + chartHeight)
    records.forEach((record, index) => {
      const x = padding.left + pointSpacing * index
      const y = padding.top + chartHeight - ((record.weight - minWeight) / weightRange) * chartHeight
      ctx.lineTo(x, y)
    })
    ctx.lineTo(padding.left + pointSpacing * (records.length - 1), padding.top + chartHeight)
    ctx.closePath()
    ctx.fill()
    
    // 绘制折线
    ctx.strokeStyle = '#07C160'
    ctx.lineWidth = 2
    ctx.beginPath()
    records.forEach((record, index) => {
      const x = padding.left + pointSpacing * index
      const y = padding.top + chartHeight - ((record.weight - minWeight) / weightRange) * chartHeight
      index === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    })
    ctx.stroke()
    
    // 绘制数据点
    records.forEach((record, index) => {
      const x = padding.left + pointSpacing * index
      const y = padding.top + chartHeight - ((record.weight - minWeight) / weightRange) * chartHeight
      
      ctx.fillStyle = '#07C160'
      ctx.beginPath()
      ctx.arc(x, y, 5, 0, 2 * Math.PI)
      ctx.fill()
      
      ctx.fillStyle = '#FFFFFF'
      ctx.beginPath()
      ctx.arc(x, y, 3, 0, 2 * Math.PI)
      ctx.fill()
      
      ctx.fillStyle = '#07C160'
      ctx.font = 'bold 11px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'bottom'
      ctx.fillText(record.weight.toFixed(1), x, y - 10)
      
      ctx.fillStyle = '#999999'
      ctx.font = '10px Arial'
      ctx.textBaseline = 'top'
      ctx.fillText(record.date.substring(5), x, height - padding.bottom + 8)
    })
    
    console.log('chart drawn successfully, records:', records.length)
  },
  
  // 输入体重
  onInputWeightRecord(e) {
    this.setData({ inputWeight: e.detail.value })
  },
  
  // 确认记录体重
  async confirmWeight() {
    const weight = this.data.inputWeight
    if (!weight || parseFloat(weight) < 20 || parseFloat(weight) > 200) {
      app.showToast('请输入有效体重 (20-200kg)')
      return
    }
    
    try {
      app.showLoading('记录中...')
      const res = await app.callCloud('recordWeight', {
        weight: parseFloat(weight),
        date: new Date().toISOString().split('T')[0]
      })
      app.hideLoading()
      
      if (res.success) {
        app.showToast('记录成功 ✅')
        const newWeight = parseFloat(weight)
        
        // 更新当前体重和距离目标（目标体重不变！）
        const weightDiff = this.calculateWeightDiff(newWeight, this.data.targetWeight, this.data.goal)
        const bmi = this.calculateBMI(parseInt(this.data.height), newWeight)
        const bmiStatus = this.getBMIStatus(bmi)
        
        this.setData({
          currentWeight: newWeight,
          inputWeight: '',
          weightDiff: weightDiff,
          bmi: bmi,
          bmiStatus: bmiStatus
        })
        
        // 刷新图表
        await this.loadWeightRecords()
      }
    } catch (err) {
      app.hideLoading()
      app.showToast('记录失败')
      console.error(err)
    }
  },
  
  // 切换图表天数
  onChartDaysChange(e) {
    const idx = parseInt(e.currentTarget.dataset.value)
    const days = this.data.chartDaysOptions[idx].value
    this.setData({ chartDays: days })
    this.loadWeightRecords()
  },
  
  // 加载心情历史
  async loadMoodHistory() {
    try {
      const res = await app.callCloud('moodHistory', {
        days: 7
      })
      
      if (res.success && res.records) {
        const moodMap = {}
        this.data.moodOptions.forEach(m => {
          moodMap[m.value] = { emoji: m.emoji, name: m.name }
        })
        
        const today = new Date().toISOString().split('T')[0]
        const processedRecords = res.records.map(r => {
          const moodInfo = moodMap[r.mood] || { emoji: '😐', name: '未知' }
          return {
            ...r,
            emoji: moodInfo.emoji,
            moodName: moodInfo.name,
            dateLabel: r.date === today ? '今天' : r.date.substring(5)
          }
        })
        
        const todayMood = res.records.find(r => r.date === today)
        
        this.setData({
          moodHistory: processedRecords,
          todayMood: todayMood ? todayMood.mood : ''
        })
      }
    } catch (err) {
      console.error('加载心情历史失败:', err)
    }
  },
  
  // 记录心情
  async onRecordMood(e) {
    const mood = e.currentTarget.dataset.mood
    this.setData({ todayMood: mood })
    
    try {
      const res = await app.callCloud('recordMood', {
        action: 'record',
        mood: mood,
        date: new Date().toISOString().split('T')[0]
      })
      
      if (res.success) {
        app.showToast('记录成功 💕')
        await this.loadMoodHistory()
      } else {
        this.setData({ todayMood: '' })
        app.showToast('记录失败')
      }
    } catch (err) {
      this.setData({ todayMood: '' })
      app.showToast('记录失败')
      console.error(err)
    }
  },
  
  // 表单输入处理
  onInputAge(e) { this.setData({ age: e.detail.value }) },
  onInputHeight(e) { this.setData({ height: e.detail.value }) },
  onInputWeight(e) { this.setData({ weight: e.detail.value }) },
  
  onSelectGender(e) {
    this.setData({ gender: e.currentTarget.dataset.value })
  },
  
  onSelectGoal(e) {
    const goal = e.currentTarget.dataset.value
    this.setData({ goal: goal })
  },
  
  onSliderChange(e) {
    const idx = e.detail.value
    this.setData({ 
      exerciseLevel: this.data.exerciseOptions[idx].value,
      sliderValue: idx
    })
  },
  
  // 保存档案
  async saveProfile() {
    const { age, height, weight, gender, goal, exerciseLevel } = this.data
    
    if (!age || !height || !weight) {
      app.showToast('请填写完整信息')
      return
    }
    
    if (height < 100 || height > 250) {
      app.showToast('请输入合理身高')
      return
    }
    
    if (weight < 30 || weight > 200) {
      app.showToast('请输入合理体重')
      return
    }
    
    const initialWeight = parseFloat(weight)
    const bmi = this.calculateBMI(parseInt(height), initialWeight)
    const bmiStatus = this.getBMIStatus(bmi)
    const targetWeight = this.calculateTargetWeight(initialWeight, goal)
    const weightDiff = this.calculateWeightDiff(initialWeight, targetWeight, goal)
    
    try {
      app.showLoading('保存中...')
      const res = await app.callCloud('userCreate', {
        age: parseInt(age),
        height: parseInt(height),
        weight: initialWeight,
        gender,
        goal,
        exerciseLevel
      })
      app.hideLoading()
      
      if (res.success) {
        this.setData({
          hasProfile: true,
          showResult: true,
          bmr: res.bmr,
          tdee: res.tdee,
          targetCal: res.targetCal,
          initialWeight: initialWeight,
          currentWeight: initialWeight,
          targetWeight: targetWeight,
          weightDiff: weightDiff,
          bmi: bmi,
          bmiStatus: bmiStatus
        })
        app.showToast('保存成功')
        
        // 保存成功后重新加载体重记录和心情
        this.loadWeightRecords()
        this.loadMoodHistory()
      } else {
        app.showToast(res.error || '保存失败')
      }
    } catch (err) {
      app.hideLoading()
      app.showToast('网络错误')
      console.error(err)
    }
  },
  
  goToCalculator() {
    // 保留用户头像，跳转到档案页面
    wx.navigateTo({ url: '/pages/calculator/calculator' })
  },
  
  goToRecipes() {
    wx.navigateTo({ url: '/pages/recipes/recipes' })
  },

  goToAIChat() {
    wx.navigateTo({ url: '/pages/ai-chat/ai-chat' })
  }
})
