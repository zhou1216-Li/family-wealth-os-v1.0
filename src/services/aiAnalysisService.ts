/**
 * 扩展 AI 分析服务 - 支持多种类型的分析和决策
 */

import { supabase } from '@/lib/supabase'

// 分析类型定义
export type AnalysisType = 
  | 'stock'           // 股票分析
  | 'crypto'          // 加密货币分析
  | 'gold'            // 黄金分析
  | 'real_estate'     // 房地产分析
  | 'car_purchase'    // 购车决策
  | 'investment'      // 投资决策
  | 'budget'          // 预算规划
  | 'debt'            // 债务管理
  | 'insurance'       // 保险规划
  | 'retirement'      // 退休规划
  | 'tax'             // 税务优化
  | 'education'       // 教育储蓄
  | 'general'         // 通用咨询

export interface AnalysisRequest {
  type: AnalysisType
  question: string
  context?: Record<string, any>
  userId?: string
}

export interface AnalysisResponse {
  success: boolean
  type: AnalysisType
  summary: string
  recommendations: Recommendation[]
  details?: Record<string, any>
  confidence: number
  timestamp: string
}

export interface Recommendation {
  id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  action: string
  estimatedImpact?: string
}

// 预设的分析模板
const ANALYSIS_PROMPTS: Record<AnalysisType, string> = {
  stock: `作为专业的股票分析师，分析以下股票并给出投资建议：
  - 股票代码: {{symbol}}
  - 当前价格: {{price}}
  - 市场环境分析
  - 技术指标分析（MACD、RSI、均线）
  - 基本面分析（PE、EPS、营收增长）
  - 风险评估
  - 买入/持有/卖出建议
  - 目标价和止损价`,

  crypto: `作为加密货币分析师，分析以下加密货币：
  - 币种: {{symbol}}
  - 当前价格: {{price}}
  - 市场趋势分析
  - 技术面分析
  - 基本面分析（采用率、生态发展）
  - 风险评估（波动性、监管风险）
  - 投资建议
  - 适合的投资比例`,

  gold: `作为贵金属分析师，分析黄金投资：
  - 当前金价: {{price}}
  - 宏观经济环境（利率、通胀）
  - 地缘政治风险
  - 供需分析
  - 投资时机建议
  - 配置比例建议`,

  real_estate: `作为房地产顾问，分析购房决策：
  - 城市/区域: {{location}}
  - 预算: {{budget}}
  - 房型需求: {{type}}
  - 市场趋势分析
  - 投资回报率分析
  - 贷款方案建议
  - 购房时机建议`,

  car_purchase: `作为购车顾问，分析购车决策：
  - 预算: {{budget}}
  - 用途: {{purpose}}（家用/商务/代步）
  - 偏好: {{preferences}}（燃油/电动/混动）
  - 车型推荐
  - 购车时机
  - 贷款方案
  - 维护成本估算`,

  investment: `作为投资顾问，分析投资组合：
  - 当前资产配置
  - 风险承受能力
  - 投资目标
  - 资产配置建议
  - 分散投资建议
  - 定期再平衡建议`,

  budget: `作为财务规划师，分析预算：
  - 收入情况
  - 支出明细
  - 储蓄率分析
  - 预算优化建议
  - 削减开支建议
  - 储蓄目标设定`,

  debt: `作为债务管理顾问：
  - 债务类型和利率
  - 债务偿还策略（雪崩法/雪球法）
  - 利率优化建议
  - 提前还款分析`,

  insurance: `作为保险规划师：
  - 当前保障情况
  - 家庭结构
  - 保额需求分析
  - 险种推荐
  - 性价比分析`,

  retirement: `作为退休规划师：
  - 当前年龄和储蓄
  - 预期退休年龄
  - 退休目标
  - 储蓄率建议
  - 投资策略
  - 养老金规划`,

  tax: `作为税务顾问：
  - 收入结构
  - 投资收益
  - 税务优化建议
  - 合法避税策略
  - 年度税务规划`,

  education: `作为教育规划师：
  - 子女年龄
  - 教育目标
  - 预期费用
  - 储蓄计划
  - 投资工具推荐`,

  general: `作为家庭财富顾问，回答以下问题：
  {{question}}
  
  请提供专业、全面的分析和建议。`,
}

// 获取分析类型的中文名称
export function getAnalysisTypeName(type: AnalysisType): string {
  const names: Record<AnalysisType, string> = {
    stock: '股票分析',
    crypto: '加密货币',
    gold: '黄金分析',
    real_estate: '房产分析',
    car_purchase: '购车决策',
    investment: '投资决策',
    budget: '预算规划',
    debt: '债务管理',
    insurance: '保险规划',
    retirement: '退休规划',
    tax: '税务优化',
    education: '教育储蓄',
    general: '综合咨询',
  }
  return names[type]
}

// 获取分析类型图标
export function getAnalysisTypeIcon(type: AnalysisType): string {
  const icons: Record<AnalysisType, string> = {
    stock: '📈',
    crypto: '🪙',
    gold: '🥇',
    real_estate: '🏠',
    car_purchase: '🚗',
    investment: '💼',
    budget: '💰',
    debt: '📊',
    insurance: '🛡️',
    retirement: '👴',
    tax: '📝',
    education: '🎓',
    general: '🤔',
  }
  return icons[type]
}

// 构建分析提示词
function buildPrompt(type: AnalysisType, question: string, context?: Record<string, any>): string {
  let prompt = ANALYSIS_PROMPTS[type]
  
  // 替换上下文变量
  if (context) {
    for (const [key, value] of Object.entries(context)) {
      prompt = prompt.replace(`{{${key}}}`, String(value))
    }
  }
  
  // 添加通用问题
  if (question && type !== 'general') {
    prompt += `\n\n额外问题：${question}`
  }
  
  if (type === 'general') {
    prompt = prompt.replace('{{question}}', question)
  }
  
  return prompt
}

// 调用 AI 分析
export async function analyze(
  request: AnalysisRequest
): Promise<AnalysisResponse> {
  const { type, question, context, userId } = request
  
  // 检查是否配置了 AI 服务
  const aiConfig = await getAIConfig(userId)
  
  if (!aiConfig.enabled) {
    // 返回模拟数据
    return generateMockAnalysis(type, question, context)
  }
  
  try {
    const prompt = buildPrompt(type, question, context)
    
    // 调用 AI 服务
    const response = await fetchAI(prompt, aiConfig)
    
    return parseAIResponse(response, type)
  } catch (error) {
    console.error('AI analysis error:', error)
    // 降级到模拟数据
    return generateMockAnalysis(type, question, context)
  }
}

// 调用外部 AI 服务
async function fetchAI(prompt: string, config: AIConfig): Promise<string> {
  const provider = config.provider || 'deepseek'
  
  switch (provider) {
    case 'deepseek':
      return callDeepSeek(prompt, config)
    case 'openai':
      return callOpenAI(prompt, config)
    case 'anthropic':
      return callAnthropic(prompt, config)
    case 'gemini':
      return callGemini(prompt, config)
    default:
      return callDeepSeek(prompt, config)
  }
}

// DeepSeek API 调用
async function callDeepSeek(prompt: string, config: AIConfig): Promise<string> {
  const apiKey = config.apiKey
  const model = config.model || 'deepseek-chat'
  
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: '你是一位专业的家庭财富管理顾问，擅长股票分析、投资决策、财务规划等领域。请提供专业、全面、可操作的建议。',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  })
  
  if (!response.ok) {
    throw new Error(`DeepSeek API error: ${response.status}`)
  }
  
  const data = await response.json()
  return data.choices[0].message.content
}

// OpenAI API 调用
async function callOpenAI(prompt: string, config: AIConfig): Promise<string> {
  const apiKey = config.apiKey
  const model = config.model || 'gpt-4o-mini'
  const baseUrl = config.baseUrl || 'https://api.openai.com/v1'
  
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: '你是一位专业的家庭财富管理顾问。',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  })
  
  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`)
  }
  
  const data = await response.json()
  return data.choices[0].message.content
}

// Anthropic API 调用
async function callAnthropic(prompt: string, config: AIConfig): Promise<string> {
  const apiKey = config.apiKey
  const model = config.model || 'claude-3-sonnet-20240229'
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      system: '你是一位专业的家庭财富管理顾问。',
      max_tokens: 2000,
    }),
  })
  
  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status}`)
  }
  
  const data = await response.json()
  return data.content[0].text
}

// Gemini API 调用
async function callGemini(prompt: string, config: AIConfig): Promise<string> {
  const apiKey = config.apiKey
  const model = config.model || 'gemini-1.5-flash'
  
  const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2000,
      },
    }),
  })
  
  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`)
  }
  
  const data = await response.json()
  return data.candidates[0].content.parts[0].text
}

// 解析 AI 响应
function parseAIResponse(response: string, type: AnalysisType): AnalysisResponse {
  // 简单解析 - 在实际应用中可以使用更复杂的解析
  const recommendations: Recommendation[] = []
  
  // 尝试提取建议
  const lines = response.split('\n')
  let currentRec: Partial<Recommendation> = {}
  
  for (const line of lines) {
    if (line.match(/^(建议|推荐|行动|措施)\s*[1-9]/i)) {
      if (currentRec.title) {
        recommendations.push(currentRec as Recommendation)
      }
      currentRec = {
        id: `rec-${Date.now()}-${recommendations.length}`,
        title: line.replace(/^(建议|推荐|行动|措施)\s*[1-9][.\uff0e、]\s*/i, ''),
        priority: 'medium',
        action: '',
      }
    } else if (currentRec.title && !currentRec.description) {
      currentRec.description = line.trim()
    }
  }
  
  if (currentRec.title) {
    recommendations.push(currentRec as Recommendation)
  }
  
  return {
    success: true,
    type,
    summary: response.substring(0, 200) + (response.length > 200 ? '...' : ''),
    recommendations: recommendations.length > 0 ? recommendations : generateDefaultRecommendations(type),
    confidence: 85,
    timestamp: new Date().toISOString(),
  }
}

// AI 配置类型
export interface AIConfig {
  enabled: boolean
  provider: 'deepseek' | 'openai' | 'anthropic' | 'gemini'
  apiKey: string
  model?: string
  baseUrl?: string
}

// 获取 AI 配置
export async function getAIConfig(userId?: string): Promise<AIConfig> {
  // 优先从环境变量获取
  const envConfig: AIConfig = {
    enabled: process.env.NEXT_PUBLIC_AI_ENABLED === 'true',
    provider: (process.env.NEXT_PUBLIC_AI_PROVIDER as AIConfig['provider']) || 'deepseek',
    apiKey: process.env.NEXT_PUBLIC_AI_API_KEY || '',
    model: process.env.NEXT_PUBLIC_AI_MODEL || undefined,
    baseUrl: process.env.NEXT_PUBLIC_AI_BASE_URL || undefined,
  }
  
  // 如果用户已登录，尝试获取用户自定义配置
  if (userId) {
    try {
      const { data } = await supabase
        .from('user_settings')
        .select('ai_enabled, ai_provider, ai_api_key, ai_model')
        .eq('user_id', userId)
        .single()
      
      if (data) {
        return {
          enabled: data.ai_enabled || envConfig.enabled,
          provider: (data.ai_provider as AIConfig['provider']) || envConfig.provider,
          apiKey: data.ai_api_key || envConfig.apiKey,
          model: data.ai_model || envConfig.model,
        }
      }
    } catch {
      // 忽略错误，返回环境变量配置
    }
  }
  
  return envConfig
}

// 保存 AI 配置
export async function saveAIConfig(userId: string, config: Partial<AIConfig>): Promise<void> {
  await supabase
    .from('user_settings')
    .upsert({
      user_id: userId,
      ai_enabled: config.enabled,
      ai_provider: config.provider,
      ai_api_key: config.apiKey,
      ai_model: config.model,
    })
}

// 生成默认建议
function generateDefaultRecommendations(type: AnalysisType): Recommendation[] {
  const defaults: Record<AnalysisType, Recommendation[]> = {
    stock: [
      { id: '1', title: '评估风险承受能力', description: '根据您的投资目标和时间周期评估合适的仓位', priority: 'high', action: '查看风险测评' },
      { id: '2', title: '分散投资', description: '不要把所有鸡蛋放在一个篮子里', priority: 'high', action: '调整资产配置' },
      { id: '3', title: '设置止损', description: '为每笔投资设置合理的止损点', priority: 'medium', action: '设置提醒' },
    ],
    crypto: [
      { id: '1', title: '控制仓位', description: '加密货币风险较高，建议配置不超过总资产的5-10%', priority: 'high', action: '查看持仓' },
      { id: '2', title: '选择主流币种', description: '优先选择市值靠前的币种', priority: 'high', action: '了解币种' },
      { id: '3', title: '使用冷钱包', description: '大额资产建议使用硬件钱包', priority: 'medium', action: '了解安全存储' },
    ],
    gold: [
      { id: '1', title: '作为避险资产', description: '黄金适合作为对冲通胀和地缘风险的工具', priority: 'high', action: '查看配置' },
      { id: '2', title: '合理配置比例', description: '建议配置5-15%的黄金资产', priority: 'medium', action: '调整配置' },
      { id: '3', title: '选择合适工具', description: '可以选择黄金ETF、实物黄金或账户金', priority: 'medium', action: '了解投资方式' },
    ],
    real_estate: [
      { id: '1', title: '评估负担能力', description: '月供不应超过月收入的30%', priority: 'high', action: '计算能力' },
      { id: '2', title: '选择地段', description: '地段是房地产投资的关键', priority: 'high', action: '了解区域' },
      { id: '3', title: '考虑持有成本', description: '包括物业费、税费、维护等', priority: 'medium', action: '计算成本' },
    ],
    car_purchase: [
      { id: '1', title: '确定预算', description: '包括购车款、保险、保养、油费等', priority: 'high', action: '预算规划' },
      { id: '2', title: '新能源还是燃油', description: '根据使用场景和充电条件选择', priority: 'high', action: '对比车型' },
      { id: '3', title: '新车还是二手车', description: '考虑折旧成本和可靠性', priority: 'medium', action: '对比分析' },
    ],
    investment: [
      { id: '1', title: '明确投资目标', description: '短期目标和长期目标需要不同的策略', priority: 'high', action: '设定目标' },
      { id: '2', title: '评估风险偏好', description: '保守型、稳健型还是进取型', priority: 'high', action: '风险测评' },
      { id: '3', title: '定期再平衡', description: '保持目标资产配置比例', priority: 'medium', action: '设置提醒' },
    ],
    budget: [
      { id: '1', title: '追踪支出', description: '了解钱花在哪里', priority: 'high', action: '开始记账' },
      { id: '2', title: '设定储蓄目标', description: '建议储蓄率不低于20%', priority: 'high', action: '设定目标' },
      { id: '3', title: '削减不必要开支', description: '识别并减少冲动消费', priority: 'medium', action: '分析支出' },
    ],
    debt: [
      { id: '1', title: '优先偿还高息债务', description: '贷款利率高于投资收益时应优先偿还', priority: 'high', action: '查看债务' },
      { id: '2', title: '考虑债务整合', description: '将高息债务转换为低息贷款', priority: 'medium', action: '咨询顾问' },
      { id: '3', title: '避免新增高息债务', description: '谨慎使用信用卡分期', priority: 'medium', action: '设置预算' },
    ],
    insurance: [
      { id: '1', title: '配置足额保障', description: '重疾险、医疗险、寿险缺一不可', priority: 'high', action: '评估保障' },
      { id: '2', title: '优先保障家庭支柱', description: '家庭经济来源者需要最高保额', priority: 'high', action: '配置保险' },
      { id: '3', title: '定期检视', description: '每年Review保障是否充足', priority: 'medium', action: '设置提醒' },
    ],
    retirement: [
      { id: '1', title: '尽早开始', description: '复利的力量需要时间', priority: 'high', action: '开始储蓄' },
      { id: '2', title: '合理配置', description: '根据年龄调整风险资产比例', priority: 'high', action: '调整配置' },
      { id: '3', title: '多种来源', description: '养老金、企业年金、个人储蓄', priority: 'medium', action: '规划来源' },
    ],
    tax: [
      { id: '1', title: '利用税收优惠', description: '了解个税专项附加扣除', priority: 'high', action: '查看政策' },
      { id: '2', title: '投资避税', description: '利用免税账户和优惠产品', priority: 'medium', action: '了解产品' },
      { id: '3', title: '年度规划', description: '年底前进行税务筹划', priority: 'medium', action: '设置提醒' },
    ],
    education: [
      { id: '1', title: '尽早规划', description: '教育费用逐年上涨', priority: 'high', action: '开始储蓄' },
      { id: '2', title: '选择合适工具', description: '教育金保险、基金定投等', priority: 'high', action: '了解产品' },
      { id: '3', title: '考虑汇率风险', description: '留学需要考虑外汇', priority: 'medium', action: '规划外汇' },
    ],
    general: [
      { id: '1', title: '明确目标', description: '清晰定义您的财务目标', priority: 'high', action: '设定目标' },
      { id: '2', title: '制定计划', description: '分解目标并制定执行计划', priority: 'high', action: '制定计划' },
      { id: '3', title: '定期复盘', description: '定期检查进度并调整', priority: 'medium', action: '设置提醒' },
    ],
  }
  
  return defaults[type]
}

// 生成模拟分析数据
function generateMockAnalysis(
  type: AnalysisType,
  question: string,
  context?: Record<string, any>
): AnalysisResponse {
  const summaries: Record<AnalysisType, string> = {
    stock: `根据市场分析，当前股票市场整体呈现震荡态势。建议关注基本面稳健、估值合理的优质标的。分散投资是降低风险的有效方式。`,
    crypto: `加密货币市场近期波动较大，建议控制仓位。优先关注比特币、以太坊等主流币种，同时注意监管政策风险。`,
    gold: `黄金作为传统避险资产，在当前宏观环境下具有配置价值。建议配置比例在5-15%之间，可选择黄金ETF或实物黄金。`,
    real_estate: `房地产市场处于调整期，建议观望为主。购房前需充分评估自身负担能力，月供不宜超过月收入的30%。`,
    car_purchase: `购车决策需综合考虑预算、用途和使用成本。新能源汽车在长期使用成本上具有优势，但需考虑充电便利性。`,
    investment: `投资决策应基于风险承受能力和投资目标。建议采用多元化资产配置，定期进行再平衡。`,
    budget: `预算规划是财务管理的基础。建议先追踪支出了解消费习惯，再设定合理的储蓄目标。`,
    debt: `债务管理的关键是优先偿还高息债务。建议制定还款计划，避免新增高息负债。`,
    insurance: `保险规划是风险管理的重要组成部分。建议优先配置重疾险和医疗险，确保家庭财务安全。`,
    retirement: `退休规划应尽早开始，利用复利的力量。建议根据年龄调整资产配置比例。`,
    tax: `合理的税务规划可以有效节省开支。建议了解个税优惠政策，合理利用税收优惠。`,
    education: `教育储蓄需要长期规划。建议选择适合的投资工具，定期定额投资。`,
    general: `感谢您的咨询！根据您的问题，我为您提供以下分析和建议...`,
  }
  
  return {
    success: true,
    type,
    summary: summaries[type],
    recommendations: generateDefaultRecommendations(type),
    confidence: 80,
    timestamp: new Date().toISOString(),
  }
}

// 获取所有分析类型
export function getAllAnalysisTypes(): { type: AnalysisType; name: string; icon: string }[] {
  const types: AnalysisType[] = [
    'stock', 'crypto', 'gold', 'real_estate', 'car_purchase', 
    'investment', 'budget', 'debt', 'insurance', 'retirement', 
    'tax', 'education', 'general'
  ]
  
  return types.map(type => ({
    type,
    name: getAnalysisTypeName(type),
    icon: getAnalysisTypeIcon(type),
  }))
}
