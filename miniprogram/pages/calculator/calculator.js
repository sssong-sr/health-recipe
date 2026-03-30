// pages/calculator/calculator.js
const app = getApp()

Page({
  data: {
    // 表单数据
    age: '',
    height: '',
    weight: '',
    gender: 'male',
    goal: '减脂',
    exerciseLevel: 1.375,
    sliderValue: 1,
    
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
    this.loadProfile()
  },

  async loadProfile() {
    try {
      const res = await app.callCloud('userGet', {}, 15000)
      if (res.exists && res.user) {
        const u = res.user
        const idx = this.data.exerciseOptions.findIndex(o => o.value === u.exercise_level)
        this.setData({
          age: String(u.age),
          height: String(u.height),
          weight: String(u.weight),
          gender: u.gender_calc || u.gender,
          goal: u.goal,
          exerciseLevel: u.exercise_level || 1.375,
          sliderValue: idx >= 0 ? idx : 1
        })
      }
    } catch (err) {
      console.error('加载档案失败:', err)
    }
  },

  onInputAge(e) { this.setData({ age: e.detail.value }) },
  onInputHeight(e) { this.setData({ height: e.detail.value }) },
  onInputWeight(e) { this.setData({ weight: e.detail.value }) },

  onSelectGender(e) {
    this.setData({ gender: e.currentTarget.dataset.value })
  },

  onSelectGoal(e) {
    this.setData({ goal: e.currentTarget.dataset.value })
  },

  onSliderChange(e) {
    const idx = e.detail.value
    this.setData({
      exerciseLevel: this.data.exerciseOptions[idx].value,
      sliderValue: idx
    })
  },

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

    try {
      app.showLoading('保存中...')
      const res = await app.callCloud('userCreate', {
        age: parseInt(age),
        height: parseInt(height),
        weight: parseFloat(weight),
        gender,
        goal,
        exerciseLevel
      })
      app.hideLoading()

      if (res.success) {
        app.showToast('保存成功')
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      } else {
        app.showToast(res.error || '保存失败')
      }
    } catch (err) {
      app.hideLoading()
      app.showToast('网络错误')
      console.error(err)
    }
  }
})
