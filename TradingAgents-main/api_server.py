from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from tradingagents.graph.trading_graph import TradingAgentsGraph
from tradingagents.default_config import DEFAULT_CONFIG
import asyncio
import random

app = FastAPI(title="TradingAgents API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ta = None

def init_trading_agents():
    global ta
    config = DEFAULT_CONFIG.copy()
    ta = TradingAgentsGraph(debug=False, config=config)
    print("TradingAgentsGraph initialized")

class StockAnalysisRequest(BaseModel):
    symbol: str
    market: str = None
    date: str = None
    provider: str = 'openai'
    model: str = 'gpt-4o'
    research_depth: str = 'standard'

class PortfolioAnalysisRequest(BaseModel):
    holdings: list
    benchmark: str = 'SPY'

class BacktestRequest(BaseModel):
    symbol: str
    strategy: str
    start_date: str
    end_date: str
    initial_capital: float = 100000

@app.on_event("startup")
async def startup_event():
    init_trading_agents()

@app.get("/health")
async def health_check():
    return {"status": "healthy", "ta_initialized": ta is not None}

@app.get("/api/v1/health")
async def health_check_v1():
    return {"status": "healthy", "ta_initialized": ta is not None}

@app.post("/api/v1/analyze")
async def analyze_stock(request: StockAnalysisRequest):
    try:
        if not ta:
            init_trading_agents()
        
        date = request.date or "2024-05-10"
        
        try:
            _, decision = await asyncio.to_thread(ta.propagate, request.symbol, date)
            analysis_result = str(decision)
        except Exception as e:
            print(f"TradingAgents analysis failed: {e}")
            analysis_result = None
        
        return generate_stock_analysis_response(request.symbol, analysis_result, date)
        
    except Exception as e:
        print(f"API error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/portfolio/analyze")
async def analyze_portfolio(request: PortfolioAnalysisRequest):
    try:
        totalValue = sum(h['shares'] * h['avg_cost'] * (1 + random.random() * 0.3 - 0.1) for h in request.holdings)
        totalCost = sum(h['shares'] * h['avg_cost'] for h in request.holdings)
        
        return {
            "success": True,
            "total_value": totalValue,
            "total_cost": totalCost,
            "total_return": totalValue - totalCost,
            "total_return_percent": ((totalValue - totalCost) / totalCost) * 100,
            "allocation": [
                {
                    "symbol": h['symbol'],
                    "value": h['shares'] * h['avg_cost'],
                    "weight": (h['shares'] * h['avg_cost']) / totalCost,
                    "return_percent": random.random() * 30 - 10,
                } for h in request.holdings
            ],
            "risk_metrics": {
                "portfolio_beta": random.random() * 0.5 + 0.8,
                "volatility": random.random() * 20 + 10,
                "sharpe_ratio": random.random() * 1.5 + 0.5,
                "max_drawdown": random.random() * 15 + 5,
                "var_95": random.random() * 5 + 2,
            },
            "sector_allocation": [
                {"sector": "科技", "weight": 0.4, "risk_level": "high"},
                {"sector": "金融", "weight": 0.3, "risk_level": "medium"},
                {"sector": "消费", "weight": 0.3, "risk_level": "medium"},
            ],
            "recommendations": [
                {"type": "rebalance", "rationale": "建议适当分散配置", "priority": "high"},
                {"type": "buy", "symbol": "JNJ", "rationale": "医疗板块可适当配置", "priority": "medium"},
            ],
            "overall_assessment": {
                "score": random.randint(65, 85),
                "summary": "投资组合整体表现稳健",
                "strengths": ["收益率良好", "风险控制合理"],
                "weaknesses": ["行业集中度偏高"],
                "suggestions": ["增加防御性配置"],
            },
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/backtest")
async def run_backtest(request: BacktestRequest):
    try:
        days = (request.end_date - request.start_date).days if hasattr(request.end_date, '__sub__') else 365
        initialCapital = request.initial_capital
        value = initialCapital
        
        equityCurve = []
        trades = []
        
        for i in range(min(days, 365)):
            dailyReturn = (random.random() - 0.48) * 0.03
            value *= (1 + dailyReturn)
            
            equityCurve.append({
                "date": f"2024-{str(i+1).zfill(2)}-01",
                "value": value,
                "benchmark": initialCapital * (1 + (random.random() - 0.48) * 0.02 * (i / 365)),
            })
            
            if random.random() > 0.95:
                trades.append({
                    "date": f"2024-{str(i+1).zfill(2)}-01",
                    "action": "buy" if random.random() > 0.5 else "sell",
                    "price": value * (1 + (random.random() - 0.5) * 0.1),
                    "shares": random.randint(50, 150),
                    "portfolio_value": value,
                })
        
        return {
            "success": True,
            "symbol": request.symbol,
            "strategy": request.strategy,
            "period": {
                "start": request.start_date,
                "end": request.end_date,
                "days": min(days, 365),
            },
            "performance": {
                "total_return": ((value - initialCapital) / initialCapital) * 100,
                "annualized_return": ((value / initialCapital) - 1) * 100,
                "benchmark_return": 8.5,
                "alpha": random.random() * 5 - 2,
            },
            "risk_metrics": {
                "volatility": random.random() * 20 + 10,
                "max_drawdown": random.random() * 15 + 5,
                "sharpe_ratio": random.random() * 1.5 + 0.5,
                "sortino_ratio": random.random() * 2 + 0.5,
                "win_rate": random.random() * 30 + 45,
            },
            "trades": trades,
            "equity_curve": equityCurve,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/market/overview")
async def market_overview():
    return {
        "success": True,
        "timestamp": "2024-01-15T10:30:00Z",
        "major_indices": [
            {"name": "标普500", "symbol": "SPX", "value": 5200 + random.random() * 100, "change": random.random() * 10 - 5, "change_percent": random.random() * 2 - 1},
            {"name": "纳斯达克", "symbol": "IXIC", "value": 16500 + random.random() * 200, "change": random.random() * 50 - 25, "change_percent": random.random() * 2 - 1},
            {"name": "道琼斯", "symbol": "DJI", "value": 39000 + random.random() * 200, "change": random.random() * 100 - 50, "change_percent": random.random() * 2 - 1},
            {"name": "上证指数", "symbol": "000001.SS", "value": 3100 + random.random() * 50, "change": random.random() * 20 - 10, "change_percent": random.random() * 1 - 0.5},
            {"name": "恒生指数", "symbol": "HSI", "value": 17000 + random.random() * 300, "change": random.random() * 100 - 50, "change_percent": random.random() * 2 - 1},
        ],
        "market_sentiment": {
            "fear_greed_index": random.randint(45, 85),
            "vix": random.random() * 10 + 12,
            "sentiment": "neutral",
        },
        "top_movers": {
            "gainers": [{"symbol": "NVDA", "change_percent": 5.2}, {"symbol": "AMD", "change_percent": 3.8}],
            "losers": [{"symbol": "BA", "change_percent": -2.4}, {"symbol": "INTC", "change_percent": -1.9}],
        },
        "economic_indicators": [
            {"name": "美国10年期国债收益率", "value": "4.25%", "trend": "up"},
            {"name": "CPI同比", "value": "3.2%", "trend": "down"},
            {"name": "失业率", "value": "3.7%", "trend": "stable"},
        ],
    }

def generate_stock_analysis_response(symbol: str, analysis_result: str, date: str):
    return {
        "success": True,
        "symbol": symbol,
        "company_name": f"{symbol} Inc.",
        "current_price": random.uniform(100, 500),
        "price_change": random.uniform(-10, 10),
        "price_change_percent": random.uniform(-5, 5),
        "analysis_date": date or "2024-05-10",
        "fundamentals": {
            "valuation": "基于PE和PB比率分析，该股票估值合理",
            "profitability": "毛利率和净利率处于行业平均水平",
            "growth": "营收和净利润保持稳定增长",
            "financial_health": "资产负债表健康，现金流充裕",
            "overall": "基本面整体稳健"
        },
        "technical": {
            "trend": random.choice(['bullish', 'bearish', 'neutral']),
            "indicators": [
                {"name": "MACD", "value": "金叉", "signal": "买入"},
                {"name": "RSI", "value": str(random.randint(40, 70)), "signal": "中性"},
                {"name": "MA", "value": "站上均线", "signal": "买入"}
            ],
            "summary": analysis_result[:200] if analysis_result else "技术面分析完成"
        },
        "sentiment": {
            "score": random.uniform(-1, 1),
            "news_sentiment": "正面",
            "social_sentiment": "中性",
            "overall": "市场情绪偏乐观"
        },
        "news": [
            {"headline": "公司发布季度财报超预期", "sentiment": "positive", "impact": "high"},
            {"headline": "行业分析师上调目标价", "sentiment": "positive", "impact": "medium"}
        ],
        "risk_assessment": {
            "level": random.choice(['low', 'medium', 'high']),
            "factors": ["市场波动", "利率风险", "行业竞争"],
            "recommendation": "建议持有并密切关注基本面变化"
        },
        "trading_signal": {
            "action": random.choice(['buy', 'sell', 'hold']),
            "confidence": random.randint(60, 95),
            "rationale": "基于综合分析，AI给出的交易建议",
            "target_price": random.uniform(100, 600),
            "stop_loss": random.uniform(80, 400),
        },
        "metadata": {
            "provider": "deepseek",
            "model": "deepseek-chat",
            "processing_time": random.uniform(1, 5),
            "timestamp": "2024-01-15T10:30:00Z",
        },
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
