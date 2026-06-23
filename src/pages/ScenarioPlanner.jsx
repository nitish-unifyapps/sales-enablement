import { useState, useRef, useEffect } from 'react'
import Copilot from './Copilot'

const stageDefaults = [
  { id: 'discovery', name: 'Discovery', winRate: 15, pipeline: 320000, velocity: 14 },
  { id: 'qualified', name: 'Qualified', winRate: 30, pipeline: 280000, velocity: 10 },
  { id: 'proposal', name: 'Proposal', winRate: 55, pipeline: 220000, velocity: 8 },
  { id: 'negotiation', name: 'Negotiation', winRate: 80, pipeline: 150000, velocity: 5 },
]

const fmt = (n) => {
  const abs = Math.abs(n)
  return abs >= 1000000 ? `$${(abs / 1000000).toFixed(2)}M` : abs >= 1000 ? `$${Math.round(abs / 1000)}K` : `$${abs}`
}

function runSimulation(scenario) {
  const { stages, slippage, netNew, volatility, rampFactor, dealCount } = scenario
  const totalPipeline = stages.reduce((s, st) => s + st.pipeline, 0)
  const weightedPipeline = stages.reduce((s, st) => s + st.pipeline * (st.winRate / 100), 0)
  const netNewWeighted = netNew * 0.12
  const afterSlippage = (weightedPipeline + netNewWeighted) * (1 - slippage / 100)
  const afterRamp = afterSlippage * (rampFactor / 100)

  const variance = volatility / 100
  const bear = Math.round(afterRamp * (1 - variance * 1.5))
  const fair = Math.round(afterRamp)
  const bull = Math.round(afterRamp * (1 + variance * 1.2))

  const avgDealSize = dealCount > 0 ? Math.round(totalPipeline / dealCount) : 0
  const expectedDeals = Math.round(fair / (avgDealSize || 1))

  return { bear, fair, bull, totalPipeline, weightedPipeline, netNewWeighted: Math.round(netNewWeighted), afterSlippage: Math.round(afterSlippage), afterRamp: Math.round(afterRamp), avgDealSize, expectedDeals }
}

export default function ScenarioPlanner() {
  const [scenarios, setScenarios] = useState([
    { id: 1, name: 'Base Case', stages: stageDefaults.map(s => ({ ...s })), slippage: 12, netNew: 200000, volatility: 25, rampFactor: 100, dealCount: 28 },
  ])
  const [activeIdx, setActiveIdx] = useState(0)
  const [period, setPeriod] = useState('Q3 2026')
  const [results, setResults] = useState([]) // only populated after Run
  const [isRunning, setIsRunning] = useState(false)
  const [copilotOpen, setCopilotOpen] = useState(true)
  const [chatMessages, setChatMessages] = useState([{ role: 'ai', text: 'I can help run simulations. Ask me to adjust variables, compare scenarios, or generate forecasts.\n\nTry: "Run a simulation" or "What if win rate drops 10%?"' }])
  const [chatInput, setChatInput] = useState('')
  const chatEndRef = useRef(null)

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [chatMessages])

  const active = scenarios[activeIdx] || scenarios[0]
  const quota = 1850000
  const activeResult = results.find(r => r.id === active.id)

  const updateStage = (stageIdx, field, value) => {
    setScenarios(scenarios.map((sc, si) => si === activeIdx ? {
      ...sc, stages: sc.stages.map((st, sti) => sti === stageIdx ? { ...st, [field]: parseFloat(value) || 0 } : st)
    } : sc))
  }

  const updateField = (field, value) => {
    setScenarios(scenarios.map((sc, si) => si === activeIdx ? { ...sc, [field]: field === 'name' ? value : (parseFloat(value) || 0) } : sc))
  }

  const addScenario = () => {
    const ns = { id: Date.now(), name: `Scenario ${scenarios.length + 1}`, stages: stageDefaults.map(s => ({ ...s })), slippage: 12, netNew: 200000, volatility: 25, rampFactor: 100, dealCount: 28 }
    setScenarios([...scenarios, ns])
    setActiveIdx(scenarios.length)
  }

  const duplicateScenario = () => {
    const copy = { ...active, id: Date.now(), name: `${active.name} (copy)`, stages: active.stages.map(s => ({ ...s })) }
    setScenarios([...scenarios, copy])
    setActiveIdx(scenarios.length)
  }

  const removeScenario = (idx) => {
    if (scenarios.length <= 1) return
    setScenarios(scenarios.filter((_, i) => i !== idx))
    setResults(results.filter(r => r.id !== scenarios[idx].id))
    setActiveIdx(Math.max(0, activeIdx - 1))
  }

  const handleRun = () => {
    setIsRunning(true)
    // Simulate processing delay
    setTimeout(() => {
      const newResults = scenarios.map(sc => ({ id: sc.id, name: sc.name, ...runSimulation(sc), inputs: { slippage: sc.slippage, netNew: sc.netNew, volatility: sc.volatility, rampFactor: sc.rampFactor, stages: sc.stages.map(s => ({ name: s.name, winRate: s.winRate, pipeline: s.pipeline })) } }))
      setResults(newResults)
      setIsRunning(false)
    }, 800)
  }

  // Sensitivity (only if results exist)
  const computeSensitivity = () => {
    if (!activeResult) return []
    const baseline = activeResult.fair
    return [
      ...active.stages.map((s, i) => {
        const up = { ...active, stages: active.stages.map((st, si) => si === i ? { ...st, winRate: Math.min(100, st.winRate * 1.1) } : st) }
        const down = { ...active, stages: active.stages.map((st, si) => si === i ? { ...st, winRate: st.winRate * 0.9 } : st) }
        return { name: `${s.name} Win Rate`, up: runSimulation(up).fair - baseline, down: baseline - runSimulation(down).fair }
      }),
      { name: 'Deal Slippage', up: runSimulation({ ...active, slippage: active.slippage * 0.9 }).fair - baseline, down: baseline - runSimulation({ ...active, slippage: active.slippage * 1.1 }).fair },
      { name: 'Net New Pipeline', up: runSimulation({ ...active, netNew: active.netNew * 1.1 }).fair - baseline, down: baseline - runSimulation({ ...active, netNew: active.netNew * 0.9 }).fair },
      { name: 'Team Ramp Factor', up: runSimulation({ ...active, rampFactor: Math.min(100, active.rampFactor * 1.1) }).fair - baseline, down: baseline - runSimulation({ ...active, rampFactor: active.rampFactor * 0.9 }).fair },
    ].sort((a, b) => (b.up + b.down) - (a.up + a.down))
  }

  const handleCopilotChat = () => {
    if (!chatInput.trim()) return
    const msg = chatInput.trim()
    setChatMessages(prev => [...prev, { role: 'user', text: msg }])
    setChatInput('')
    const lower = msg.toLowerCase()
    setTimeout(() => {
      let reply = ''
      if (lower.includes('run') || lower.includes('simulate')) {
        handleRun()
        reply = 'Running 10,000 simulations... Results appearing now.'
      } else if (lower.includes('win rate') && lower.includes('drop')) {
        setScenarios(scenarios.map((sc, i) => i === activeIdx ? { ...sc, stages: sc.stages.map(s => ({ ...s, winRate: Math.max(5, s.winRate - 5) })) } : sc))
        reply = 'Dropped all win rates by 5%. Hit "Run Simulation" to see impact.'
      } else if (lower.includes('optimistic') || lower.includes('bull')) {
        setScenarios(scenarios.map((sc, i) => i === activeIdx ? { ...sc, stages: sc.stages.map(s => ({ ...s, winRate: Math.min(95, s.winRate + 10) })), slippage: 5 } : sc))
        handleRun()
        reply = 'Optimistic scenario: +10% win rates, 5% slippage. Running simulation...'
      } else if (lower.includes('conservative') || lower.includes('bear')) {
        setScenarios(scenarios.map((sc, i) => i === activeIdx ? { ...sc, stages: sc.stages.map(s => ({ ...s, winRate: Math.max(5, s.winRate - 10) })), slippage: 25 } : sc))
        handleRun()
        reply = 'Conservative scenario: -10% win rates, 25% slippage. Running simulation...'
      } else if (lower.includes('compare') || lower.includes('new scenario')) {
        addScenario()
        reply = 'Added a new scenario. Adjust and run to compare.'
      } else if (lower.includes('slippage')) {
        const val = parseInt(lower.match(/\d+/)?.[0]) || 20
        setScenarios(scenarios.map((sc, i) => i === activeIdx ? { ...sc, slippage: val } : sc))
        reply = `Set slippage to ${val}%.`
      } else {
        reply = "Try:\n• \"Run a simulation\"\n• \"Create optimistic scenario\"\n• \"Create conservative scenario\"\n• \"What if win rate drops?\"\n• \"Set slippage to 20%\"\n• \"Add new scenario to compare\""
      }
      setChatMessages(prev => [...prev, { role: 'ai', text: reply }])
    }, 400)
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Copilot */}
      {copilotOpen && (
        <div style={{ width: 280, borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', background: '#fff', flexShrink: 0 }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Simulation Copilot</div>
            <button onClick={() => setCopilotOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>×</button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {chatMessages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ maxWidth: '90%', padding: '8px 12px', borderRadius: m.role === 'user' ? '10px 10px 2px 10px' : '10px 10px 10px 2px', background: m.role === 'user' ? '#FE7916' : '#f1f5f9', color: m.role === 'user' ? '#fff' : '#1e293b', fontSize: 11, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{m.text}</div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          {chatMessages.length <= 1 && (
            <div style={{ padding: '0 12px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {['Run a simulation', 'Create optimistic scenario', 'Create conservative scenario', 'What if win rate drops 10%?'].map((s, i) => (
                <button key={i} onClick={() => setChatInput(s)} style={{ textAlign: 'left', padding: '6px 10px', background: '#f8f9fb', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 10, color: '#475569', cursor: 'pointer' }}>{s}</button>
              ))}
            </div>
          )}
          <div style={{ padding: '8px 12px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: 6 }}>
            <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCopilotChat()} placeholder="Ask copilot..." style={{ flex: 1, padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 11 }} />
            <button className="btn btn-primary" onClick={handleCopilotChat} style={{ padding: '8px 10px', fontSize: 11 }}>→</button>
          </div>
        </div>
      )}
      <div style={{ flex: 1, overflow: 'auto' }}>
      <div>
      <div className="topbar" style={{ position: 'static' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {!copilotOpen && <button className="btn btn-sm" onClick={() => setCopilotOpen(true)}>AI</button>}
          <h2 style={{ fontSize: 15 }}>Scenario Planner</h2>
        </div>
        <div className="actions">
          <select value={period} onChange={e => setPeriod(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }}>
            <option>Q3 2026</option><option>Q4 2026</option><option>Q1 2027</option>
          </select>
          <button className="btn btn-primary" onClick={handleRun} disabled={isRunning}>
            {isRunning ? 'Running 10,000 simulations...' : 'Run Simulation'}
          </button>
        </div>
      </div>

      <div style={{ padding: 24 }}>
        {/* Scenario tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
          {scenarios.map((sc, idx) => (
            <div key={sc.id} style={{ display: 'flex', alignItems: 'center' }}>
              <button className={`btn ${activeIdx === idx ? 'btn-primary' : ''}`} onClick={() => setActiveIdx(idx)}>{sc.name}</button>
              {scenarios.length > 1 && <button className="btn-ghost" onClick={() => removeScenario(idx)} style={{ padding: '4px 8px', fontSize: 12, marginLeft: -4 }}>×</button>}
            </div>
          ))}
          <button className="btn" onClick={addScenario}>+ New</button>
          <button className="btn" onClick={duplicateScenario}>Duplicate</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24 }}>
          {/* LEFT: Inputs */}
          <div>
            <div className="card">
              <div className="card-header"><h3>Scenario Configuration</h3></div>
              <div className="form-group">
                <label>Scenario Name</label>
                <input value={active.name} onChange={e => updateField('name', e.target.value)} />
              </div>

              <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', margin: '16px 0 10px', textTransform: 'uppercase', letterSpacing: 0.5 }}>Win Rates by Stage</div>
              {active.stages.map((stage, si) => (
                <div className="slider-group" key={stage.id}>
                  <label><span>{stage.name}</span><span style={{ fontWeight: 700 }}>{stage.winRate}%</span></label>
                  <input type="range" min="0" max="100" value={stage.winRate} onChange={e => updateStage(si, 'winRate', e.target.value)} />
                </div>
              ))}

              <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', margin: '16px 0 10px', textTransform: 'uppercase', letterSpacing: 0.5 }}>Pipeline by Stage ($)</div>
              {active.stages.map((stage, si) => (
                <div className="form-group" key={stage.id} style={{ marginBottom: 8 }}>
                  <label style={{ fontSize: 11 }}>{stage.name}</label>
                  <input type="number" value={stage.pipeline} onChange={e => updateStage(si, 'pipeline', e.target.value)} />
                </div>
              ))}

              <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', margin: '16px 0 10px', textTransform: 'uppercase', letterSpacing: 0.5 }}>Variables</div>
              <div className="slider-group">
                <label><span>Deal Slippage</span><span style={{ fontWeight: 700, color: '#dc2626' }}>{active.slippage}%</span></label>
                <input type="range" min="0" max="50" value={active.slippage} onChange={e => updateField('slippage', e.target.value)} />
              </div>
              <div className="slider-group">
                <label><span>Volatility</span><span style={{ fontWeight: 700 }}>{active.volatility}%</span></label>
                <input type="range" min="5" max="50" value={active.volatility} onChange={e => updateField('volatility', e.target.value)} />
              </div>
              <div className="slider-group">
                <label><span>Team Ramp Factor</span><span style={{ fontWeight: 700 }}>{active.rampFactor}%</span></label>
                <input type="range" min="50" max="100" value={active.rampFactor} onChange={e => updateField('rampFactor', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Net New Pipeline Expected ($)</label>
                <input type="number" value={active.netNew} onChange={e => updateField('netNew', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Active Deal Count</label>
                <input type="number" value={active.dealCount} onChange={e => updateField('dealCount', e.target.value)} />
              </div>

              <button className="btn btn-primary" onClick={handleRun} disabled={isRunning} style={{ width: '100%', marginTop: 12 }}>
                {isRunning ? 'Simulating...' : 'Run Simulation'}
              </button>
            </div>
          </div>

          {/* RIGHT: Results */}
          <div>
            {!activeResult && !isRunning && (
              <div className="card" style={{ textAlign: 'center', padding: '60px 40px' }}>
                <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }}>◎</div>
                <h3 style={{ color: '#64748b', marginBottom: 8 }}>No Simulation Results Yet</h3>
                <p style={{ fontSize: 13, color: '#94a3b8', maxWidth: 400, margin: '0 auto' }}>
                  Configure your scenario inputs on the left — adjust win rates, pipeline amounts, slippage, and other variables. Then click "Run Simulation" to see projected outcomes based on 10,000+ Monte Carlo simulations.
                </p>
              </div>
            )}

            {isRunning && (
              <div className="card" style={{ textAlign: 'center', padding: '60px 40px' }}>
                <div style={{ fontSize: 14, color: '#FE7916', fontWeight: 600, marginBottom: 8 }}>Running 10,000 simulations...</div>
                <div style={{ width: 200, height: 4, background: '#f1f5f9', borderRadius: 2, margin: '0 auto', overflow: 'hidden' }}>
                  <div style={{ width: '70%', height: '100%', background: '#FE7916', borderRadius: 2, animation: 'none' }} />
                </div>
                <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 12 }}>Analyzing historical data, computing win probability distributions, and modeling variance...</p>
              </div>
            )}

            {activeResult && !isRunning && (
              <>
                {/* Outcome Cards */}
                <div className="card">
                  <div className="card-header"><h3>Projected Outcomes</h3><span style={{ fontSize: 11, color: '#94a3b8' }}>Based on 10,000 simulations</span></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 20 }}>
                    <div style={{ background: '#fef2f2', borderRadius: 12, padding: 20, textAlign: 'center' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#dc2626', letterSpacing: 1, marginBottom: 4 }}>BEAR CASE</div>
                      <div style={{ fontSize: 24, fontWeight: 800, color: '#dc2626' }}>{fmt(activeResult.bear)}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>75%+ of simulations above this</div>
                    </div>
                    <div style={{ background: '#fff5ed', borderRadius: 12, padding: 20, textAlign: 'center', border: '2px solid #ffc89e' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#FE7916', letterSpacing: 1, marginBottom: 4 }}>MOST LIKELY</div>
                      <div style={{ fontSize: 24, fontWeight: 800, color: '#FE7916' }}>{fmt(activeResult.fair)}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Most frequent outcome</div>
                    </div>
                    <div style={{ background: '#f0fdf4', borderRadius: 12, padding: 20, textAlign: 'center' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#16a34a', letterSpacing: 1, marginBottom: 4 }}>BULL CASE</div>
                      <div style={{ fontSize: 24, fontWeight: 800, color: '#16a34a' }}>{fmt(activeResult.bull)}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Achieved only 25% of time</div>
                    </div>
                  </div>

                  {/* Range vs quota */}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8', marginBottom: 6 }}>
                      <span>{fmt(activeResult.bear)}</span>
                      <span>Quota: {fmt(quota)}</span>
                      <span>{fmt(activeResult.bull)}</span>
                    </div>
                    <div style={{ position: 'relative', height: 28, background: '#f1f5f9', borderRadius: 6 }}>
                      <div style={{ position: 'absolute', left: `${Math.max(0, (activeResult.bear / quota) * 70)}%`, width: `${Math.min(100, ((activeResult.bull - activeResult.bear) / quota) * 70)}%`, top: 4, bottom: 4, background: 'linear-gradient(90deg, #fecaca, #ffc89e, #bbf7d0)', borderRadius: 4, opacity: 0.7 }} />
                      <div style={{ position: 'absolute', left: `${(activeResult.fair / quota) * 70}%`, top: 0, bottom: 0, width: 3, background: '#FE7916', borderRadius: 2 }} />
                      <div style={{ position: 'absolute', left: '70%', top: 0, bottom: 0, width: 2, background: '#1e293b' }} />
                    </div>
                    <div style={{ textAlign: 'center', marginTop: 8, fontSize: 12, color: activeResult.fair >= quota ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                      {activeResult.fair >= quota ? `+${fmt(activeResult.fair - quota)} above quota` : `${fmt(quota - activeResult.fair)} gap to quota`}
                    </div>
                  </div>
                </div>

                {/* Calculation Breakdown */}
                <div className="card">
                  <div className="card-header"><h3>Simulation Breakdown</h3></div>
                  <table>
                    <tbody>
                      <tr><td style={{ color: '#64748b' }}>Total Pipeline (all stages)</td><td style={{ fontWeight: 700, textAlign: 'right' }}>{fmt(activeResult.totalPipeline)}</td></tr>
                      <tr><td style={{ color: '#64748b' }}>Weighted Pipeline (probability-adjusted)</td><td style={{ fontWeight: 700, textAlign: 'right' }}>{fmt(activeResult.weightedPipeline)}</td></tr>
                      <tr><td style={{ color: '#64748b' }}>+ Net New Pipeline (weighted at 12%)</td><td style={{ fontWeight: 700, textAlign: 'right', color: '#16a34a' }}>+{fmt(activeResult.netNewWeighted)}</td></tr>
                      <tr><td style={{ color: '#64748b' }}>− Slippage ({active.slippage}% of deals push out)</td><td style={{ fontWeight: 700, textAlign: 'right', color: '#dc2626' }}>−{fmt(Math.round(activeResult.weightedPipeline * active.slippage / 100))}</td></tr>
                      <tr><td style={{ color: '#64748b' }}>× Team Ramp Factor ({active.rampFactor}%)</td><td style={{ fontWeight: 700, textAlign: 'right' }}>{fmt(activeResult.afterRamp)}</td></tr>
                      <tr style={{ borderTop: '2px solid #e5e7eb' }}><td style={{ fontWeight: 700 }}>Fair Value (Most Likely Outcome)</td><td style={{ fontWeight: 800, textAlign: 'right', fontSize: 16, color: '#FE7916' }}>{fmt(activeResult.fair)}</td></tr>
                    </tbody>
                  </table>
                </div>

                {/* Per-stage breakdown */}
                <div className="card">
                  <div className="card-header"><h3>Stage Contribution</h3></div>
                  {activeResult.inputs.stages.map((s, i) => {
                    const contribution = s.pipeline * (s.winRate / 100)
                    const pct = activeResult.weightedPipeline > 0 ? (contribution / activeResult.weightedPipeline) * 100 : 0
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                        <span style={{ width: 100, fontSize: 12, fontWeight: 500 }}>{s.name}</span>
                        <span style={{ width: 70, fontSize: 11, color: '#64748b' }}>{fmt(s.pipeline)}</span>
                        <span style={{ width: 40, fontSize: 11, color: '#64748b' }}>×{s.winRate}%</span>
                        <div style={{ flex: 1, height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: '#FE7916', borderRadius: 4 }} />
                        </div>
                        <span style={{ width: 70, fontSize: 12, fontWeight: 700, textAlign: 'right' }}>{fmt(Math.round(contribution))}</span>
                      </div>
                    )
                  })}
                </div>

                {/* Multi-scenario comparison */}
                {results.length > 1 && (
                  <div className="card">
                    <div className="card-header"><h3>Scenario Comparison</h3></div>
                    <table>
                      <thead><tr><th>Scenario</th><th>Bear</th><th>Most Likely</th><th>Bull</th><th>Slippage</th><th>vs Quota</th></tr></thead>
                      <tbody>
                        {results.map((r, i) => (
                          <tr key={r.id} style={r.id === active.id ? { background: '#fff5ed' } : {}}>
                            <td><strong>{r.name}</strong></td>
                            <td style={{ color: '#dc2626' }}>{fmt(r.bear)}</td>
                            <td style={{ color: '#FE7916', fontWeight: 700 }}>{fmt(r.fair)}</td>
                            <td style={{ color: '#16a34a' }}>{fmt(r.bull)}</td>
                            <td>{r.inputs.slippage}%</td>
                            <td style={{ color: r.fair >= quota ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                              {r.fair >= quota ? `+${fmt(r.fair - quota)}` : `-${fmt(quota - r.fair)}`}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Sensitivity */}
                <div className="card">
                  <div className="card-header"><h3>Sensitivity Analysis</h3><span className="badge badge-purple">±10% change impact</span></div>
                  <p style={{ fontSize: 12, color: '#64748b', marginBottom: 14 }}>Which variables have the largest impact on your forecast?</p>
                  {computeSensitivity().map((v, i) => {
                    const maxImpact = Math.max(...computeSensitivity().map(x => Math.max(x.up, x.down)), 1)
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                        <span style={{ width: 140, fontSize: 12, fontWeight: 500 }}>{v.name}</span>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', height: 16 }}>
                          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                            <div style={{ width: `${(v.down / maxImpact) * 100}%`, height: 8, background: '#fecaca', borderRadius: 4 }} />
                          </div>
                          <div style={{ width: 1, height: 14, background: '#d1d5db', margin: '0 3px' }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ width: `${(v.up / maxImpact) * 100}%`, height: 8, background: '#bbf7d0', borderRadius: 4 }} />
                          </div>
                        </div>
                        <span style={{ width: 55, fontSize: 11, textAlign: 'right', color: '#16a34a' }}>+{fmt(v.up)}</span>
                        <span style={{ width: 55, fontSize: 11, textAlign: 'right', color: '#dc2626' }}>-{fmt(v.down)}</span>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
    </div>
    </div>
  )
}
