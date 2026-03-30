# 健康食谱体重管理小程序

> 智能体重管理 + AI 健康顾问，让健康管理更简单

## 功能特性

### 📊 数据管理
- 用户档案：输入身高、体重、年龄，自动计算 BMI、基础代谢(BMR)、每日消耗(TDEE)
- 体重记录：每日记录体重，生成趋势图表
- 目标追踪：设定减脂/增肌目标，实时显示距离目标的进度

### 🍽️ 饮食推荐
- 智能菜谱推荐：根据用户目标和热量需求推荐合适的食谱
- 我的收藏：收藏喜欢的菜谱
- 自定义菜单：定制个人专属的每日饮食计划

### 🤖 AI 健康顾问
- 接入智谱 AI (GLM-4)，智能回答健康相关问题
- 根据知识库提供科学的减脂、增肌建议
- 支持流式输出，对话体验流畅

### 📈 数据可视化
- Canvas 绘制体重趋势折线图
- BMI 实时计算与状态显示
- 热量缺口精准计算

## 技术栈

| 技术 | 说明 |
|------|------|
| 微信小程序 | 移动端开发框架 |
| 云开发 | 云函数 + 云数据库，免服务器 |
| 智谱 AI (GLM-4) | 国内 AI 大模型，智能问答 |
| Canvas | 原生绘制体重趋势图表 |
| JavaScript | 核心开发语言 |

## 项目结构

```
├── miniprogram/           # 小程序主体
│   ├── pages/
│   │   ├── index/         # 首页（档案 + 体重 + 心情）
│   │   ├── recipes/        # 菜谱列表与筛选
│   │   ├── recipe-detail/ # 菜谱详情
│   │   ├── ai-chat/       # AI 健康顾问
│   │   ├── ai-history/    # AI 对话历史
│   │   ├── profile/       # 个人中心
│   │   ├── calculator/     # 修改档案
│   │   ├── collections/   # 我的收藏
│   │   └── my-menu/      # 我的菜单
│   ├── app.js
│   └── app.json
├── cloudfunctions/       # 云函数
│   ├── aiChat/            # AI 对话云函数
│   ├── userGet/            # 获取用户信息
│   ├── userCreate/         # 创建/更新用户档案
│   ├── weightRecords/      # 体重记录 CRUD
│   ├── moodHistory/        # 心情记录
│   ├── recipeList/         # 菜谱列表
│   └── aiHistory/          # AI 对话历史
└── images/                # 项目截图
    ├── home.png
    ├── recipes.png
    └── ai-chat.png
```

## 截图预览

![首页](images/截图 2026-03-30 133004.png)
![菜谱列表](images/截图 2026-03-30 133013.png)
![体重记录](images/截图 2026-03-30 133020.png)
![AI对话](images/截图 2026-03-30 133033.png)
![心情记录](images/截图 2026-03-30 133042.png)
![收藏](images/截图 2026-03-30 133058.png)
![档案](images/截图 2026-03-30 133245.png)

## 快速开始

### 1. 克隆项目
```bash
git clone https://github.com/sssong-sr/health-recipe.git
cd health-recipe
```

### 2. 导入小程序
1. 打开 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 选择「导入项目」
3. 填入 AppID
4. 目录选择项目根目录

### 3. 配置云开发
1. 开通 [微信云开发](https://cloud.weixin.qq.com/)
2. 创建云环境
3. 在 `app.js` 中配置云环境 ID

### 4. 配置 AI API
在 `cloudfunctions/aiChat/index.js` 中配置智谱 AI 的 API Key：
```javascript
const ZHIPU_API_KEY = 'your-api-key'
```

## 核心功能实现

### BMI 计算
```javascript
const BMI = weight / (height / 100) ** 2
```

### 基础代谢计算 (Mifflin-St Jeor)
```javascript
// 男性: BMR = 10×体重 + 6.25×身高 - 5×年龄 + 5
// 女性: BMR = 10×体重 + 6.25×身高 - 5×年龄 - 161
```

### 智谱 AI 调用
```javascript
const response = await axios.post('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
  model: 'glm-4-flash',
  messages: [
    { role: 'system', content: '你是专业的体重管理顾问' },
    { role: 'user', content: userMessage }
  ]
})
```

### Canvas 折线图绘制
```javascript
ctx.beginPath()
records.forEach((record, index) => {
  const x = padding.left + pointSpacing * index
  const y = padding.top + chartHeight - ((record.weight - minWeight) / weightRange) * chartHeight
  index === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
})
ctx.stroke()
```

## 学习收获

通过这个项目，我掌握了：

- ✅ 微信小程序完整开发流程
- ✅ 云开发（云函数、数据库）的实际应用
- ✅ AI API 接入与 Prompt Engineering
- ✅ Canvas 图表绘制
- ✅ 用户体验设计与交互优化

## License

MIT License
