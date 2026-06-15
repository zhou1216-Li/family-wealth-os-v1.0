'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/shared/MainLayout'
import {
  analyze,
  getAllAnalysisTypes,
  getAnalysisTypeName,
  getAnalysisTypeIcon,
  type AnalysisType,
  type AnalysisRequest,
  type AnalysisResponse,
  type Recommendation,
} from '@/services/aiAnalysisService'
import { 
  Search, Brain, Sparkles, ChevronRight, 
  AlertTriangle, CheckCircle, Clock, Zap,
  TrendingUp, TrendingDown, DollarSign,
  Home, Car, Briefcase, PiggyBank,
  Shield, Calendar, FileText, GraduationCap,
  MessageCircle, Coins, Award, Target
} from 'lucide-react'

const iconMap: Record<string, typeof Brain> = {
  stock: TrendingUp,
  crypto: Coins,
  gold: Award,
  real_estate: Home,
  car_purchase: Car,
  investment: Briefcase,
  budget: PiggyBank,
  debt: TrendingDown,
  insurance: Shield,
  retirement: Calendar,
  tax: FileText,
  education: GraduationCap,
  general: MessageCircle,
}

export default function AIAnalysisPage() {
  const [selectedType, setSelectedType] = useState<AnalysisType>('general')
  const [question, setQuestion] = useState('')
  const [context, setContext] = useState<Record<string, string>>({})
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [goalTitle, setGoalTitle] = useState('')
  const [goalAmount, setGoalAmount] = useState('')
  const [goalDate, setGoalDate] = useState('')
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [planTitle, setPlanTitle] = useState('')
  const [showReminderModal, setShowReminderModal] = useState(false)
  const [reminderTitle, setReminderTitle] = useState('')
  const [reminderDate, setReminderDate] = useState('')
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' }[]>([])
  
  const analysisTypes = getAllAnalysisTypes()

  const addToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }

  const handleSetGoal = () => {
    if (!goalTitle || !goalAmount) {
      addToast('请填写完整的目标信息', 'error')
      return
    }
    addToast(`目标「${goalTitle}」已设定，金额：${goalAmount}元`)
    setShowGoalModal(false)
    setGoalTitle('')
    setGoalAmount('')
    setGoalDate('')
  }

  const handleCreatePlan = () => {
    if (!planTitle) {
      addToast('请填写计划名称', 'error')
      return
    }
    addToast(`计划「${planTitle}」已创建`)
    setShowPlanModal(false)
    setPlanTitle('')
  }

  const handleSetReminder = () => {
    if (!reminderTitle || !reminderDate) {
      addToast('请填写完整的提醒信息', 'error')
      return
    }
    addToast(`提醒「${reminderTitle}」已设置，日期：${reminderDate}`)
    setShowReminderModal(false)
    setReminderTitle('')
    setReminderDate('')
  }

  // 处理上下文输入变化
  const handleContextChange = (key: string, value: string) => {
    setContext(prev => ({ ...prev, [key]: value }))
  }

  // 获取上下文字段
  const getContextFields = (type: AnalysisType): { key: string; label: string; placeholder: string }[] => {
    const fields: Record<AnalysisType, { key: string; label: string; placeholder: string }[]> = {
      stock: [
        { key: 'symbol', label: '股票代码', placeholder: '如 AAPL, 600519.SS' },
        { key: 'price', label: '当前价格', placeholder: '可选' },
      ],
      crypto: [
        { key: 'symbol', label: '币种', placeholder: '如 BTC, ETH' },
        { key: 'price', label: '当前价格', placeholder: '可选' },
      ],
      gold: [
        { key: 'price', label: '当前金价', placeholder: '可选' },
      ],
      real_estate: [
        { key: 'location', label: '城市/区域', placeholder: '如 北京 朝阳区' },
        { key: 'budget', label: '预算（万元）', placeholder: '如 500' },
        { key: 'type', label: '房型', placeholder: '如 三居室' },
      ],
      car_purchase: [
        { key: 'budget', label: '预算（万元）', placeholder: '如 30' },
        { key: 'purpose', label: '用途', placeholder: '家用/商务/代步' },
        { key: 'preferences', label: '偏好', placeholder: '燃油/电动/混动' },
      ],
      investment: [
        { key: 'goal', label: '投资目标', placeholder: '如 稳健增值' },
        { key: 'risk', label: '风险承受能力', placeholder: '保守/稳健/进取' },
        { key: 'timeframe', label: '投资期限', placeholder: '短期/中期/长期' },
      ],
      budget: [
        { key: 'income', label: '月收入', placeholder: '如 20000' },
        { key: 'expenses', label: '月支出', placeholder: '如 10000' },
      ],
      debt: [
        { key: 'type', label: '债务类型', placeholder: '房贷/车贷/信用卡' },
        { key: 'amount', label: '债务金额', placeholder: '如 500000' },
        { key: 'rate', label: '利率', placeholder: '如 4.2%' },
      ],
      insurance: [
        { key: 'type', label: '保障类型', placeholder: '重疾/医疗/寿险' },
        { key: 'coverage', label: '当前保额', placeholder: '如 50万' },
      ],
      retirement: [
        { key: 'age', label: '当前年龄', placeholder: '如 30' },
        { key: 'target', label: '退休目标', placeholder: '如 1000万' },
      ],
      tax: [
        { key: 'income', label: '年收入', placeholder: '如 500000' },
        { key: 'investments', label: '投资收益', placeholder: '可选' },
      ],
      education: [
        { key: 'childAge', label: '子女年龄', placeholder: '如 5' },
        { key: 'goal', label: '教育目标', placeholder: '如 海外留学' },
      ],
      general: [],
    }
    return fields[type]
  }

  // 提交分析请求
  const handleSubmit = async () => {
    if (!question.trim()) {
      setError('请输入您的问题或分析需求')
      return
    }

    setLoading(true)
    setError(null)
    setAnalysisResult(null)

    const request: AnalysisRequest = {
      type: selectedType,
      question: question.trim(),
      context: Object.fromEntries(
        Object.entries(context).filter(([, value]) => value.trim())
      ),
    }

    try {
      const result = await analyze(request)
      setAnalysisResult(result)
    } catch (err) {
      setError('分析失败，请稍后重试')
      console.error('Analysis error:', err)
    } finally {
      setLoading(false)
    }
  }

  // 获取优先级样式
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-rose-100 text-rose-700 border-rose-200'
      case 'medium':
        return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'low':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return '高优先级'
      case 'medium':
        return '中优先级'
      case 'low':
        return '低优先级'
      default:
        return priority
    }
  }

  return (
    <MainLayout title="AI 智能分析" subtitle="您的专属家庭财富顾问">
      <div className="space-y-6">
        {/* 标题区域 */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
            <Brain className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">AI 智能分析</h1>
            <p className="text-muted-foreground">专业的家庭财富管理顾问，支持股票、房产、保险等全方位分析</p>
          </div>
        </div>

        {/* 分析类型选择 */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Sparkles size={18} className="text-amber-500" />
            选择分析类型
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {analysisTypes.map((item) => {
              const Icon = iconMap[item.type] || Brain
              return (
                <button
                  key={item.type}
                  onClick={() => {
                    setSelectedType(item.type)
                    setContext({})
                  }}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    selectedType === item.type
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50 hover:bg-muted'
                  }`}
                >
                  <Icon size={24} />
                  <span className="text-xs font-medium">{item.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* 上下文输入 */}
        {getContextFields(selectedType).length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">补充信息（可选）</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getContextFields(selectedType).map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium mb-2">{field.label}</label>
                  <input
                    type="text"
                    value={context[field.key] || ''}
                    onChange={(e) => handleContextChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 问题输入 */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">您的问题或需求</h2>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={`请描述您想分析的问题，例如：
- 分析一下茅台(600519)这只股票怎么样？
- 我有500万预算，在北京买房合适吗？
- 我30岁，如何规划退休储蓄？
- 现在适合投资黄金吗？
- 新能源车和燃油车怎么选？`}
            rows={4}
            className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
          
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-4 w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                AI 分析中...
              </>
            ) : (
              <>
                <Zap size={18} />
                开始分析
              </>
            )}
          </button>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center gap-3">
            <AlertTriangle className="text-rose-500" size={20} />
            <span className="text-rose-700">{error}</span>
          </div>
        )}

        {/* 分析结果 */}
        {analysisResult && (
          <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
            {/* 结果头部 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="text-emerald-500" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold">分析完成</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Clock size={14} />
                    {new Date(analysisResult.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                  {getAnalysisTypeName(analysisResult.type)}
                </span>
                <span className="px-3 py-1 bg-muted text-sm rounded-full">
                  置信度: {analysisResult.confidence}%
                </span>
              </div>
            </div>

            {/* 分析摘要 */}
            <div className="bg-gradient-to-r from-primary/5 to-purple-50 rounded-xl p-4">
              <p className="text-foreground leading-relaxed">{analysisResult.summary}</p>
            </div>

            {/* 建议列表 */}
            {analysisResult.recommendations.length > 0 && (
              <div>
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Target className="text-amber-500" size={18} />
                  行动建议
                </h4>
                <div className="space-y-3">
                  {analysisResult.recommendations.map((rec: Recommendation) => (
                    <div
                      key={rec.id}
                      className="bg-muted/50 rounded-xl p-4 border border-transparent hover:border-border transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-medium">{rec.title}</h5>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded border ${getPriorityStyle(rec.priority)}`}>
                              {getPriorityLabel(rec.priority)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{rec.description}</p>
                        </div>
                        <button 
                          onClick={() => {
                            if (rec.action === '设定目标') setShowGoalModal(true)
                            else if (rec.action === '制定计划') setShowPlanModal(true)
                            else if (rec.action === '设置提醒') setShowReminderModal(true)
                            else addToast(`已执行：${rec.action}`)
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm hover:bg-primary/20 transition-colors"
                        >
                          {rec.action}
                          <ChevronRight size={14} />
                        </button>
                      </div>
                      {rec.estimatedImpact && (
                        <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                          <DollarSign size={12} />
                          预计影响: {rec.estimatedImpact}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 详细数据 */}
            {analysisResult.details && Object.keys(analysisResult.details).length > 0 && (
              <div>
                <h4 className="font-semibold mb-4">详细分析</h4>
                <div className="bg-muted/50 rounded-xl p-4">
                  <pre className="text-sm text-muted-foreground overflow-x-auto">
                    {JSON.stringify(analysisResult.details, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 使用说明 */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <AlertTriangle className="text-amber-600" size={16} />
            使用说明
          </h4>
          <ul className="text-sm text-amber-800 space-y-1">
            <li>• 当前使用模拟数据演示，如需真实 AI 分析，需要配置 API Key</li>
            <li>• 支持 DeepSeek、OpenAI、Anthropic、Gemini 等多种 AI 提供商</li>
            <li>• 在设置页面可以配置您的 AI 偏好</li>
            <li>• 投资有风险，AI 建议仅供参考，不构成投资建议</li>
          </ul>
        </div>
      </div>

      {/* Toast 提示 */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div key={toast.id} className={`px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 ${
            toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
          }`}>
            {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
            <span className="text-sm">{toast.message}</span>
          </div>
        ))}
      </div>

      {/* 设定目标模态框 */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">设定财务目标</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">目标名称</label>
                <input
                  type="text"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  placeholder="如：买房首付"
                  className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">目标金额（元）</label>
                <input
                  type="number"
                  value={goalAmount}
                  onChange={(e) => setGoalAmount(e.target.value)}
                  placeholder="如：500000"
                  className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">目标日期（可选）</label>
                <input
                  type="date"
                  value={goalDate}
                  onChange={(e) => setGoalDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowGoalModal(false)}
                className="flex-1 px-4 py-2.5 bg-muted rounded-xl text-sm hover:bg-muted/80 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSetGoal}
                className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm hover:bg-primary/90 transition-colors"
              >
                确认设定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 制定计划模态框 */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">制定计划</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">计划名称</label>
                <input
                  type="text"
                  value={planTitle}
                  onChange={(e) => setPlanTitle(e.target.value)}
                  placeholder="如：每月定投计划"
                  className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">计划说明</label>
                <textarea
                  placeholder="描述你的计划内容..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPlanModal(false)}
                className="flex-1 px-4 py-2.5 bg-muted rounded-xl text-sm hover:bg-muted/80 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCreatePlan}
                className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm hover:bg-primary/90 transition-colors"
              >
                创建计划
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 设置提醒模态框 */}
      {showReminderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">设置提醒</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">提醒事项</label>
                <input
                  type="text"
                  value={reminderTitle}
                  onChange={(e) => setReminderTitle(e.target.value)}
                  placeholder="如：缴纳房贷"
                  className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">提醒日期</label>
                <input
                  type="date"
                  value={reminderDate}
                  onChange={(e) => setReminderDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowReminderModal(false)}
                className="flex-1 px-4 py-2.5 bg-muted rounded-xl text-sm hover:bg-muted/80 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSetReminder}
                className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm hover:bg-primary/90 transition-colors"
              >
                设置提醒
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  )
}
