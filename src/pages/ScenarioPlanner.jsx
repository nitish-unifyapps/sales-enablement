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

  // Pre-run scenarios
  const preRunScenarios = [
    { name: 'Base Case', bear: 420000, fair: 580000, bull: 720000, winRate: 'Current', slippage: 12, recommended: false },
    { name: 'Optimistic', bear: 560000, fair: 740000, bull: 920000, winRate: '+10%', slippage: 5, recommended: true },
    { name: 'Conservative', bear: 310000, fair: 440000, bull: 560000, winRate: '-10%', slippage: 25, recommended: false },
    { name: 'High Slippage', bear: 280000, fair: 390000, bull: 510000, winRate: 'Current', slippage: 30, recommended: false },
  ]
  const quota = 1850000
  const [showManualModal, setShowManualModal] = useState(false)

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Copilot */}
      {copilotOpen && (
        <div style={{ width: 280, flexShrink: 0 }}>
          <Copilot title="Simulation Copilot" subtitle="Run & compare scenarios" messages={chatMessages} starters={['Run a simulation', 'Create optimistic scenario', 'What if win rate drops?', 'Compare all scenarios']} input={chatInput} setInput={setChatInput} onSend={handleCopilotChat} onClose={() => setCopilotOpen(false)} />
        </div>
      )}

      {/* Main Content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <div className="topbar" style={{ position: 'static' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {!copilotOpen && <button className="btn btn-sm" onClick={() => setCopilotOpen(true)}>AI</button>}
            <h2 style={{ fontSize: 15 }}>Scenario Planner</h2>
          </div>
          <div className="actions">
            <select value={period} onChange={e => setPeriod(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }}><option>Q3 2026</option><option>Q4 2026</option></select>
            <button className="btn btn-primary" onClick={() => setShowManualModal(true)}>Run Manual Analysis</button>
          </div>
        </div>

        <div style={{ padding: 24 }}>
          {/* Recommended Badge */}
          <div style={{ padding: '12px 16px', background: '#fff8f3', border: '1px solid #ffc89e', borderRadius: 8, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FE7916' }} />
            <span style={{ fontSize: 12, color: '#475569' }}><strong style={{ color: '#FE7916' }}>Recommended: Optimistic</strong> — Based on current pipeline velocity and engagement trends, increasing win rates by 10% and reducing slippage to 5% gives the highest probability of exceeding quota.</span>
          </div>

          {/* Scenario Cards — 4 pre-run */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
            {preRunScenarios.map((sc, i) => (
              <div key={i} className="card" style={{ padding: '16px', border: sc.recommended ? '2px solid #FE7916' : '1px solid #e5e7eb', position: 'relative' }}>
                {sc.recommended && <div style={{ position: 'absolute', top: -8, left: 12, background: '#FE7916', color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 4 }}>RECOMMENDED</div>}
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10 }}>{sc.name}</div>
                <div style={{ fontSize: 9, color: '#7B9CAF', marginBottom: 8 }}>Win Rate: {sc.winRate} • Slippage: {sc.slippage}%</div>
                {/* Mini bar chart */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 50, marginBottom: 8 }}>
                  {[{ v: sc.bear, c: '#dc2626', l: 'Bear' }, { v: sc.fair, c: '#FE7916', l: 'Fair' }, { v: sc.bull, c: '#16a34a', l: 'Bull' }].map((b, bi) => (
                    <div key={bi} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: '100%', height: `${(b.v / 920000) * 45}px`, background: b.c, opacity: 0.7, borderRadius: '3px 3px 0 0' }} />
                      <div style={{ fontSize: 8, color: '#7B9CAF', marginTop: 2 }}>{b.l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#1e293b' }}>{fmt(sc.fair)}</div>
                  <div style={{ fontSize: 9, color: '#7B9CAF' }}>Most Likely</div>
                </div>
              </div>
            ))}
          </div>

          {/* Comparison Chart — all scenarios overlaid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div className="card">
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 12 }}>Range Comparison</div>
              {preRunScenarios.map((sc, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600 }}>{sc.name}</span>
                    <span style={{ color: '#7B9CAF' }}>{fmt(sc.bear)} — {fmt(sc.bull)}</span>
                  </div>
                  <div style={{ height: 10, background: '#f1f5f9', borderRadius: 5, position: 'relative', overflow: 'hidden' }}>
                    {/* Range band */}
                    <div style={{ position: 'absolute', left: `${(sc.bear / quota) * 100}%`, width: `${((sc.bull - sc.bear) / quota) * 100}%`, top: 0, bottom: 0, background: sc.recommended ? '#FE7916' : '#7B9CAF', opacity: 0.3, borderRadius: 5 }} />
                    {/* Fair value marker */}
                    <div style={{ position: 'absolute', left: `${(sc.fair / quota) * 100}%`, top: 0, bottom: 0, width: 3, background: sc.recommended ? '#FE7916' : '#475569', borderRadius: 2 }} />
                  </div>
                </div>
              ))}
              {/* Quota line label */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4, fontSize: 9, color: '#7B9CAF' }}>Quota: {fmt(quota)} →</div>
            </div>

            {/* Sensitivity Summary */}
            <div className="card">
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 12 }}>Key Drivers</div>
              {[
                { name: 'Proposal Win Rate', impact: 82000, direction: 'up' },
                { name: 'Deal Slippage', impact: 65000, direction: 'down' },
                { name: 'Negotiation Win Rate', impact: 58000, direction: 'up' },
                { name: 'Net New Pipeline', impact: 24000, direction: 'up' },
              ].map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span style={{ width: 110, fontSize: 10, fontWeight: 500 }}>{d.name}</span>
                  <div style={{ flex: 1, height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(d.impact / 82000) * 100}%`, background: d.direction === 'up' ? '#16a34a' : '#dc2626', borderRadius: 3, opacity: 0.7 }} />
                  </div>
                  <span style={{ fontSize: 9, fontWeight: 600, color: d.direction === 'up' ? '#16a34a' : '#dc2626' }}>±{fmt(d.impact)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Recommendation */}
          <div className="card" style={{ marginTop: 20, padding: '14px 18px', borderLeft: '3px solid #FE7916' }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>AI Analysis Summary</div>
            <div style={{ fontSize: 11, color: '#475569', lineHeight: 1.7 }}>
              The <strong>Optimistic</strong> scenario is most aligned with current signals. Pipeline velocity has increased 18% this month, and 3 commit deals show strong buyer engagement. However, monitor the 4 single-threaded deals — if stakeholder engagement doesn't improve, the Conservative scenario becomes more likely. Recommended action: focus on multi-threading top 4 deals to lock in the optimistic outcome.
            </div>
          </div>
        </div>
      </div>

      {/* Manual Analysis Modal */}
      {showManualModal && (
        <div className="modal-backdrop" onClick={() => setShowManualModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ width: 640 }}>
            <h3>Run Custom Simulation</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 10 }}>Win Rates by Stage</div>
                {active.stages.map((stage, si) => (
                  <div className="slider-group" key={stage.id}>
                    <label><span>{stage.name}</span><span style={{ fontWeight: 700 }}>{stage.winRate}%</span></label>
                    <input type="range" min="0" max="100" value={stage.winRate} onChange={e => updateStage(si, 'winRate', e.target.value)} />
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 10 }}>Variables</div>
                {active.stages.map((stage, si) => (
                  <div className="form-group" key={stage.id} style={{ marginBottom: 8 }}>
                    <label style={{ fontSize: 10 }}>{stage.name} Pipeline ($)</label>
                    <input type="number" value={stage.pipeline} onChange={e => updateStage(si, 'pipeline', e.target.value)} />
                  </div>
                ))}
                <div className="slider-group"><label><span>Slippage</span><span style={{ fontWeight: 700 }}>{active.slippage}%</span></label><input type="range" min="0" max="50" value={active.slippage} onChange={e => updateField('slippage', e.target.value)} /></div>
                <div className="slider-group"><label><span>Volatility</span><span style={{ fontWeight: 700 }}>{active.volatility}%</span></label><input type="range" min="5" max="50" value={active.volatility} onChange={e => updateField('volatility', e.target.value)} /></div>
                <div className="form-group"><label>Net New Pipeline ($)</label><input type="number" value={active.netNew} onChange={e => updateField('netNew', e.target.value)} /></div>
              </div>
            </div>
            {/* Results preview */}
            {results.length > 0 && (() => { const r = results.find(x => x.id === active.id); return r ? (
              <div style={{ marginTop: 16, padding: 14, background: '#f8f9fb', borderRadius: 8, display: 'flex', gap: 20, justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: 9, color: '#dc2626', fontWeight: 700 }}>BEAR</div><div style={{ fontSize: 16, fontWeight: 800, color: '#dc2626' }}>{fmt(r.bear)}</div></div>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: 9, color: '#FE7916', fontWeight: 700 }}>FAIR</div><div style={{ fontSize: 16, fontWeight: 800, color: '#FE7916' }}>{fmt(r.fair)}</div></div>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: 9, color: '#16a34a', fontWeight: 700 }}>BULL</div><div style={{ fontSize: 16, fontWeight: 800, color: '#16a34a' }}>{fmt(r.bull)}</div></div>
              </div>
            ) : null })()}
            <div className="modal-actions">
              <button className="btn" onClick={() => setShowManualModal(false)}>Close</button>
              <button className="btn btn-primary" onClick={() => { handleRun(); }}>Run Simulation</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
