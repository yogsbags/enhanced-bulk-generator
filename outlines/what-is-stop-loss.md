# What is Stop Loss?

## Article Structure

### H1: What is Stop Loss? Types, How it Works & When to Use

**Introductory Content:**
- Start the paragraph with "Stop Loss"
- Definition: Order to sell a security when it reaches a specific price
- Risk management tool to limit losses on investments
- Why it matters for Indian investors: Protects capital during market crashes
- Context: Circuit breakers and stop-loss orders prevent panic losses
- Available on NSE/BSE for stocks, F&O, commodities
- Essential for traders (intraday, swing) and risk-conscious investors

### H2: What is Stop Loss Order?

- **Definition**: Pre-set order to automatically sell a stock when price falls to specified level
- **Purpose**: Cap potential losses on a trade or investment
- **How It Works**: Order placed with broker → Activated when trigger price hit → Stock sold at market price
- **Indian Example**:
  - Buy Reliance at ₹2,500
  - Set stop-loss at ₹2,400 (4% below purchase price)
  - If Reliance falls to ₹2,400, order triggers and sells automatically
  - Maximum loss capped at ₹100 per share (4%)
- **Order Types in India**:
  - **Stop-Loss Market Order (SL-M)**: Executes at market price when trigger hit
  - **Stop-Loss Limit Order (SL)**: Executes at specified limit price or better
- **Trigger Price vs Limit Price**:
  - Trigger Price: Price at which order gets activated
  - Limit Price: Minimum price you're willing to accept (for SL orders)

### H2: How a Stop Loss Order Works?

**Step-by-Step Process:**

1. **Place Buy Order**: Purchase stock at ₹1,000
2. **Set Stop-Loss Order**:
   - Trigger Price: ₹950 (5% below purchase)
   - Order Type: SL-M (Stop-Loss Market)
3. **Stock Price Fluctuates**:
   - Price goes to ₹1,050 → No action
   - Price falls to ₹980 → No action
   - Price touches ₹950 → **Order Activated**
4. **Order Execution**:
   - SL-M: Sells at prevailing market price (could be ₹948-₹952)
   - SL (Limit): Sells only if price ≥ ₹945 (your limit price)
5. **Position Closed**: Loss limited to ~₹50 per share (5%)

**Indian Example - TCS Trade:**
- Buy TCS at ₹3,500
- Set SL-M at ₹3,400 (₹100 stop-loss, ~3%)
- TCS falls to ₹3,400 → Order triggers
- Execution at ₹3,398 (market price)
- Actual loss: ₹102 per share (vs potential unlimited loss without SL)

**Gap Down Risk:**
- If stock opens at ₹3,200 (below SL), executes at ₹3,200 (not ₹3,400)
- Stop-loss is trigger, not guaranteed execution price
- Use Stop-Loss Limit orders to avoid worst-case slippage

### H2: Types of Stop-Loss Orders

#### H3: Stop-Loss Market Order (SL-M)
- Order triggers at stop price, executes immediately at market price
- Pros: Guaranteed execution once triggered
- Cons: Execution price may differ from trigger price (slippage)
- **Indian Example**: Stock trigger ₹500 → Sells at ₹498 (market price)
- **Use Case**: Fast-moving stocks, intraday trading, when exit certainty more important than price

#### H3: Stop-Loss Limit Order (SL)
- Order triggers at stop price, but executes only at limit price or better
- Pros: Control over execution price
- Cons: May not execute if price falls too fast (unfilled order)
- **Indian Example**: Trigger ₹500, Limit ₹495 → Only sells between ₹495-₹500
- **Use Case**: Slower stocks, positional trades, when price control important

#### H3: Trailing Stop-Loss
- Stop-loss automatically adjusts upward as stock price rises
- Locks in profits while protecting from downside
- **Manual Trailing in India** (auto-trail not widely supported):
  - Buy at ₹1,000, set SL at ₹950 (5% trail)
  - Stock rises to ₹1,100 → Manually adjust SL to ₹1,045 (5% below new high)
  - Stock rises to ₹1,200 → Adjust SL to ₹1,140
  - If falls to ₹1,140, exit with ₹140 profit instead of ₹0
- **Use Case**: Trending markets, capturing maximum upside with downside protection

#### H3: Percentage-Based Stop-Loss
- Stop-loss set at fixed percentage below entry price
- Example: Always use 5% SL → Buy at ₹500, SL at ₹475
- **Common Percentages**:
  - Conservative: 2-3% (tight SL for large caps)
  - Moderate: 5-7% (standard for swing trading)
  - Aggressive: 10-15% (loose SL for volatile small caps)
- **Use Case**: Systematic traders, algorithmic strategies

#### H3: Support/Resistance-Based Stop-Loss
- Stop-loss placed just below key support level (technical analysis)
- **Indian Example**: Nifty 50 support at 21,000 → Set SL at 20,950
- Allows stock room to breathe within support-resistance range
- **Use Case**: Technical traders, swing traders, chart pattern traders

### H2: Stop-Loss Order vs Market Order

| Parameter | Stop-Loss Order | Market Order |
|-----------|----------------|--------------|
| Definition | Conditional order triggered at specific price | Immediate order at current market price |
| Execution Timing | Triggered when price hits stop level | Executes instantly |
| Purpose | Risk management, limit losses | Enter/exit position quickly |
| Price Control | Trigger price set by trader | No control, accepts market price |
| Guarantee | Execution not guaranteed (SL-Limit), price not guaranteed (SL-M) | Execution guaranteed, price not guaranteed |
| Use Case | Protecting existing positions | Urgent entry/exit |
| Indian Example | Reliance SL at ₹2,400 (triggers only if price falls there) | Buy Reliance "at market" (executes at ₹2,505 or ₹2,498) |
| Order Status | Pending until triggered | Immediate execution |
| Ideal For | Risk-conscious traders/investors | Quick trades, high liquidity stocks |

### H2: Advantages & Disadvantages of Stop-Loss Orders

| Advantages | Disadvantages |
|-----------|--------------|
| **Limits Losses**: Caps downside to predefined % (e.g., 5% max loss) | **Whipsaw Risk**: Stock triggers SL, then reverses and rallies |
| **Emotionless Trading**: Removes fear and greed from decision-making | **Gap Down Execution**: Opens below SL, executes at much lower price |
| **Automatic Protection**: No need to monitor market constantly | **Short-term Volatility**: Normal fluctuations may trigger premature exit |
| **Preserves Capital**: Protects from catastrophic losses (e.g., Yes Bank, DHFL crashes) | **Missed Recoveries**: Exited stock may recover after SL triggered |
| **Discipline**: Forces risk management planning before trade | **Slippage**: SL-M may execute far from trigger in illiquid stocks |
| **Free Tool**: No extra charges for stop-loss orders (part of trading) | **Not Foolproof**: Gap downs, circuit filters can bypass SL |
| **Works 24/7**: Protects position even when you're not watching | **Requires Reactivation**: SL canceled at day-end for intraday (must re-enter) |

**Indian Real-World Example:**
- **Advantage**: Investor had SL at ₹1,200 for Yes Bank in 2019 → Saved from ₹40 crash
- **Disadvantage**: Reliance hit SL at ₹2,400 during COVID (March 2020) → Then rallied to ₹2,800 in 6 months

### H2: How Does a Stop-Loss Order Limit Loss?

- **Pre-Defined Exit Point**: Forces exit at specific loss level
  - Example: 5% SL = Maximum ₹5,000 loss on ₹1 lakh investment
- **Prevents Emotional Holding**: Removes "hope" that falling stock will recover
  - Common mistake: Holding Yes Bank from ₹300 → ₹40 → ₹15 hoping for recovery
- **Position Sizing Benefit**: Knowing max loss allows proper capital allocation
  - Formula: Position Size = (Total Capital × Risk % per Trade) / Stop-Loss %
  - Example: ₹10 lakh capital, 2% risk per trade, 5% SL → Position size = ₹4 lakh
- **Catastrophic Loss Prevention**: Protects from black swan events
  - IL&FS, Satyam, Yes Bank, DHFL crashes would've wiped out portfolios without SL
- **Compounds Losses Management**: Small losses easier to recover than large losses
  - 10% loss requires 11% gain to breakeven
  - 50% loss requires 100% gain to breakeven
  - 80% loss requires 400% gain to breakeven

### H2: Do Long-Term Investors Need Stop-Loss Orders?

**Arguments FOR Stop-Loss (Even for Long-Term):**
- **Fraud/Bankruptcy Protection**: Satyam, Yes Bank, DHFL fell 90%+ (SL would've saved capital)
- **Sector Shifts**: Telecom sector (Idea, Vodafone) declined permanently → SL limits damage
- **Opportunity Cost**: Capital trapped in falling stock could be reallocated to better opportunities
- **Market Crashes**: 2008 crash, COVID 2020 → Temporary SLs would've preserved capital for re-entry lower
- **Modified Approach**: Use wider SL (20-30%) for long-term vs 5-10% for trading

**Arguments AGAINST Stop-Loss (Long-Term Buy & Hold):**
- **Quality Stocks Recover**: TCS, Infosys, HDFC Bank always recovered from corrections
- **Rupee Cost Averaging**: SIP investors don't need SL (buying at all levels)
- **Dividend Income**: Long-term dividend stocks provide cash flow during downturns
- **Tax Efficiency**: Frequent exits trigger capital gains tax, reducing compounding
- **Volatility is Normal**: 20-30% corrections are healthy, not permanent declines

**Recommended Approach:**
- **For Quality Large Caps (Nifty 50)**: Optional SL, focus on fundamentals
- **For Mid/Small Caps**: 20-30% SL to protect from permanent capital loss
- **For Speculative Bets**: Mandatory 5-10% SL, treat as trading positions

### H2: Conclusion

- Stop-loss is an automatic sell order triggered at predefined price level
- Types: SL-M (market execution), SL (limit execution), Trailing SL, Support-based SL
- Limits losses to predefined percentage (e.g., 5% max loss)
- Advantages: Preserves capital, removes emotions, automatic protection
- Disadvantages: Whipsaw risk, gap down execution, missed recoveries
- Essential for traders (intraday, swing, F&O)
- Optional for long-term investors in quality stocks (wider 20-30% SL recommended)
- Call-to-action: Open PL Capital account with advanced SL order options

### H2: FAQs on Stop Loss

#### H3: What is Stop-Loss with Example?

- **Definition**: Order to sell stock automatically when price falls to trigger level
- **Indian Example - Reliance Trade**:
  - **Entry**: Buy 100 Reliance shares at ₹2,500/share = ₹2,50,000 investment
  - **Stop-Loss**: Set SL-M at ₹2,400 (4% below entry)
  - **Scenario 1 - Profit**: Reliance rises to ₹2,700 → No SL trigger, book profit manually
  - **Scenario 2 - SL Hit**: Reliance falls to ₹2,400 → SL triggers, sells at ₹2,398
    - Loss: (₹2,500 - ₹2,398) × 100 = ₹10,200 (4% loss)
    - **Without SL**: If Reliance crashed to ₹2,000 → Loss would be ₹50,000 (20%)
- **Key Benefit**: Limited loss to ₹10,200 instead of potential ₹50,000

#### H3: What is the 7% Stop-Loss Rule?

- **Definition**: Always exit trade when loss reaches 7% of entry price
- **Origin**: Popularized by William O'Neil (CANSLIM strategy)
- **Logic**: Prevents small losses from becoming large losses
  - 7% loss requires 7.5% gain to breakeven (manageable)
  - 25% loss requires 33% gain to breakeven (difficult)
  - 50% loss requires 100% gain to breakeven (very difficult)
- **Indian Application**:
  - Buy TCS at ₹3,500 → Set SL at ₹3,255 (7% below)
  - Buy Nifty 50 ETF at ₹230 → Set SL at ₹213.90
- **Not Universal**: Adjust based on stock volatility
  - Large caps (TCS, Reliance): 5-7% SL works
  - Small caps (high volatility): 10-15% SL may be needed to avoid premature exits
- **Discipline is Key**: Cut losses at 7%, let profits run beyond 7% gain

#### H3: When Should I Use a Stop-Loss?

- **Mandatory SL Scenarios**:
  - **Intraday Trading**: Always use SL (market closes, positions squared off)
  - **F&O Trading**: Leverage magnifies losses, SL essential
  - **Swing Trading**: 3-10 day trades need SL to protect overnight risk
  - **Speculative Stocks**: Small caps, penny stocks, unproven companies
  - **Margin Trading**: Borrowed funds at risk, broker may liquidate without SL
- **Recommended SL Scenarios**:
  - **Mid-Cap Investing**: 15-20% SL for mid-cap portfolios
  - **Sector Bets**: Thematic investments (EV, renewable, etc.) need SL
  - **During Uncertain Markets**: Elections, Fed meetings, geopolitical tensions
- **Optional SL Scenarios**:
  - **Nifty 50 Long-Term**: Quality large caps, fundamental approach
  - **SIP Investors**: Rupee cost averaging strategy (buying at all levels)
  - **Dividend Stocks**: Focus on income, not price fluctuations
- **Never Skip SL**: Trading account with real money (vs. demo/paper trading)

#### H3: Is Stop-Loss Only for Intraday Trading?

- **No, stop-loss is NOT only for intraday**:
- **Intraday Trading**: Mandatory SL (positions squared off at 3:20 PM)
  - Example: Buy Nifty futures at 21,000 → SL at 20,950 (50 points)
- **Swing Trading (2-10 days)**: SL protects overnight gaps
  - Example: Buy Reliance at ₹2,500 → SL at ₹2,400 (valid for 10 days or until exit)
- **Positional Trading (Weeks/Months)**: SL prevents long-term capital erosion
  - Example: Buy mid-cap stock at ₹500 → SL at ₹450 (10% SL for 3-month holding)
- **Long-Term Investing**: Optional but recommended for non-blue-chips
  - Example: Nifty Next 50 stock → 20-30% SL to prevent permanent loss
- **F&O Trading (Futures & Options)**: Mandatory SL due to leverage
  - Example: Sell Nifty 21,000 CE option → SL at ₹120 (if option premium rises)
- **Verdict**: Stop-loss is universal risk management tool, not limited to intraday

## Content Guidelines

- Focus on Indian market context (NSE, BSE, Nifty, Sensex, Indian stocks)
- Include practical examples with Indian blue-chip stocks (Reliance, TCS, Infosys)
- Use natural language (avoid keyword stuffing)
- Provide actionable insights for retail traders and investors
- Add risk disclaimer: "Stop-loss orders subject to market conditions, gap downs, and circuit filters. Not a guaranteed loss-prevention mechanism."
- Include current market dynamics (Nov 2025)
- Mention PL Capital trading platform with SL-M and SL order types
- Keep tone professional yet accessible for beginners
- Explain SL-M vs SL difference clearly with examples
- Use Indian rupee examples and realistic stock prices
- Emphasize risk management discipline (cut losses, let profits run)
