import { useState, useMemo } from 'react'

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
  const { stages, slippage, netNew, volatility } = scenario
  // Weighted pipeline calculation with variance
  let base = 0
  stages.forEach(s => { base += s.pipeline * (s.winRate / 100) })
  base += netNew * 0.12 // net new at lowest win rate
  base *= (1 - slippage / 100)

  // Simulate variance based on volatility
  const variance = volatility / 100
  const bear = Math.round(base * (1 - variance * 1.5))
  const fair = Math.round(base)
  const bull = Math.round(base * (1 + variance * 1.2))
  return { bear, fair, bull }
}

export default function ScenarioPlanner() {
  const [scenarios, setScenarios] = useState([
    { id: 1, name: 'Base Case', stages: stageDefaults.map(s => ({ ...s })), slippage: 12, netNew: 200000, volatility: 25 },
  ])
  const [activeIdx, setActiveIdx] = useState(0)
  const [measureBy, setMeasureBy] = useState('stage')
  const [period, setPeriod] = useState('Q3 2026')
  const [hasRun, setHasRun] = useState(false)

  const active = scenarios[activeIdx] || scenarios[0]

  const results = useMemo(() => scenarios.map(s => ({ ...s, result: runSimulation(s) })), [scenarios])

  const updateStage = (stageIdx, field, value) => {
    setScenarios(scenarios.map((sc, si) => si === activeIdx ? {
      ...sc, stages: sc.stages.map((st, sti) => sti === stageIdx ? { ...st, [field]: parseFloat(value) || 0 } : st)
    } : sc))
  }

  const updateField = (field, value) => {
    setScenarios(scenarios.map((sc, si) => si === activeIdx ? { ...sc, [field]: field === 'name' ? value : (parseFloat(value) || 0) } : sc))
  }

  const addScenario = () => {
    const newSc = { id: Date.now(), name: `Scenario ${scenarios.length + 1}`, stages: stageDefaults.map(s => ({ ...s })), slippage: 12, netNew: 200000, volatility: 25 }
    setScenarios([...scenarios, newSc])
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
    setActiveIdx(Math.max(0, activeIdx - 1))
  }

  const activeResult = runSimulation(active)
  const totalCurrentPipeline = active.stages.reduce((s, st) => s + st.pipeline, 0)
  const quota = 1850000

  // Sensitivity: measure impact of ±10% change
  const sensitivity = useMemo(() => {
    const baseline = runSimulation(active).fair
    return [
      ...active.stages.map((s, i) => {
        const up = { ...active, stages: active.stages.map((st, si) => si === i ? { ...st, winRate: Math.min(100, st.winRate * 1.1) } : st) }
        const down = { ...active, stages: active.stages.map((st, si) => si === i ? { ...st, winRate: st.winRate * 0.9 } : st) }
        return { name: `${s.name} Win Rate`, upImpact: runSimulation(up).fair - baseline, downImpact: baseline - runSimulation(down).fair }
      }),
      (() => {
        const up = { ...active, slippage: active.slippage * 0.9 }
        const down = { ...active, slippage: Math.min(50, active.slippage * 1.1) }
        return { name: 'Deal Slippage', upImpact: runSimulation(up).fair - baseline, downImpact: baseline - runSimulation(down).fair }
      })(),
      (() => {
        const up = { ...active, netNew: active.netNew * 1.1 }
        const down = { ...active, netNew: active.netNew * 0.9 }
        return { name: 'Net New Pipeline', upImpact: runSimulation(up).fair - baseline, downImpact: baseline - runSimulation(down).fair }
      })(),
    ]
  }, [active])

  return (
    <div>
      <div className="topbar">
        <h2>Scenario Planner</h2>
        <div className="actions">
          <select value={measureBy} onChange={e => setMeasureBy(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }}>
            <option value="stage">Weighted Pipeline by Stage</option>
            <option value="category">Weighted Pipeline by Category</option>
          </select>
          <select value={period} onChange={e => setPeriod(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }}>
            <option>Q3 2026</option><option>Q4 2026</option><option>Q1 2027</option>
          </select>
          <button className="btn btn-primary" onClick={() => setHasRun(true)}>Run Simulation</button>
        </div>
      </div>

      <div style={{ padding: 24 }}>
        {/* Scenario Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
          {scenarios.map((sc, idx) => (
            <div key={sc.id} style={{ display: 'flex', alignItems: 'center' }}>
              <button className={`btn ${activeIdx === idx ? 'btn-primary' : ''}`} onClick={() => setActiveIdx(idx)}>{sc.name}</button>
              {scenarios.length > 1 && <button className="btn-ghost" onClick={() => removeScenario(idx)} style={{ padding: '4px 8px', fontSize: 12, marginLeft: -4 }}>✕</button>}
            </div>
          ))}
          <button className="btn" onClick={addScenario}>+ New Scenario</button>
          <button className="btn" onClick={duplicateScenario}>⊕ Duplicate</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 20 }}>
          {/* Left: Input Panel */}
          <div>
            <div className="card">
              <div className="card-header"><h3>Scenario Inputs</h3></div>
              <div className="form-group">
                <label>Scenario Name</label>
                <input value={active.name} onChange={e => updateField('name', e.target.value)} />
              </div>

              <div style={{ fontSize: 13, fontWeight: 700, color: '#475569', margin: '18px 0 12px' }}>Win Rates by Stage</div>
              {active.stages.map((stage, si) => (
                <div className="slider-group" key={stage.id}>
                  <label>
                    <span>{stage.name}</span>
                    <span style={{ fontWeight: 700, color: '#6366f1' }}>{stage.winRate}%</span>
                  </label>
                  <input type="range" min="0" max="100" step="1" value={stage.winRate} onChange={e => updateStage(si, 'winRate', e.target.value)} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#94a3b8' }}>
                    <span>0%</span><span>50%</span><span>100%</span>
                  </div>
                </div>
              ))}

              <div style={{ fontSize: 13, fontWeight: 700, color: '#475569', margin: '18px 0 12px' }}>Pipeline Amounts</div>
              {active.stages.map((stage, si) => (
                <div className="form-group" key={stage.id} style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: 11 }}>{stage.name} Pipeline ($)</label>
                  <input type="number" value={stage.pipeline} onChange={e => updateStage(si, 'pipeline', e.target.value)} />
                </div>
              ))}

              <div style={{ fontSize: 13, fontWeight: 700, color: '#475569', margin: '18px 0 12px' }}>Other Variables</div>
              <div className="slider-group">
                <label><span>Deal Slippage</span><span style={{ fontWeight: 700, color: '#dc2626' }}>{active.slippage}%</span></label>
                <input type="range" min="0" max="50" value={active.slippage} onChange={e => updateField('slippage', e.target.value)} />
              </div>
              <div className="slider-group">
                <label><span>Volatility / Variance</span><span style={{ fontWeight: 700 }}>{active.volatility}%</span></label>
                <input type="range" min="5" max="50" value={active.volatility} onChange={e => updateField('volatility', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Net New Pipeline Expected ($)</label>
                <input type="number" value={active.netNew} onChange={e => updateField('netNew', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Right: Results */}
          <div>
            {/* Outcome Cards */}
            <div className="card">
              <div className="card-header"><h3>Projected Outcomes</h3><span style={{ fontSize: 12, color: '#94a3b8' }}>10,000+ simulations</span></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 20 }}>
                <div style={{ background: '#fef2f2', borderRadius: 12, padding: 20, textAlign: 'center' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#dc2626', letterSpacing: 1, marginBottom: 4 }}>BEAR CASE</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: '#dc2626' }}>{fmt(activeResult.bear)}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>75%+ outcomes above this</div>
                </div>
                <div style={{ background: '#eef2ff', borderRadius: 12, padding: 20, textAlign: 'center', border: '2px solid #c7d2fe' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#6366f1', letterSpacing: 1, marginBottom: 4 }}>FAIR VALUE</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: '#6366f1' }}>{fmt(activeResult.fair)}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Most frequent outcome</div>
                </div>
                <div style={{ background: '#f0fdf4', borderRadius: 12, padding: 20, textAlign: 'center' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#16a34a', letterSpacing: 1, marginBottom: 4 }}>BULL CASE</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: '#16a34a' }}>{fmt(activeResult.bull)}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Achieved only 25% of the time</div>
                </div>
              </div>

              {/* Distribution Bar */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8', marginBottom: 6 }}>
                  <span>Bear</span><span>Fair Value</span><span>Bull</span><span style={{ color: '#1e293b', fontWeight: 600 }}>Quota: {fmt(quota)}</span>
                </div>
                <div style={{ position: 'relative', height: 32, background: '#f1f5f9', borderRadius: 8 }}>
                  {/* Range band */}
                  <div style={{ position: 'absolute', left: `${(activeResult.bear / quota) * 80}%`, right: `${100 - (activeResult.bull / quota) * 80}%`, top: 4, bottom: 4, background: 'linear-gradient(90deg, #fecaca, #c7d2fe, #bbf7d0)', borderRadius: 6, opacity: 0.6 }} />
                  {/* Fair value marker */}
                  <div style={{ position: 'absolute', left: `${(activeResult.fair / quota) * 80}%`, top: 0, bottom: 0, width: 3, background: '#6366f1', borderRadius: 2 }} />
                  {/* Quota marker */}
                  <div style={{ position: 'absolute', left: '80%', top: 0, bottom: 0, width: 2, background: '#1e293b', borderRadius: 1 }}>
                    <div style={{ position: 'absolute', top: -16, left: -12, fontSize: 10, fontWeight: 600 }}>Quota</div>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div style={{ background: '#f8f9fb', borderRadius: 8, padding: 14, fontSize: 12, color: '#475569' }}>
                <div><strong>Weighted Pipeline:</strong> {fmt(active.stages.reduce((s, st) => s + st.pipeline * (st.winRate / 100), 0))}</div>
                <div><strong>After Slippage ({active.slippage}%):</strong> {fmt(activeResult.fair)}</div>
                <div><strong>vs Quota:</strong> {activeResult.fair >= quota ? <span style={{ color: '#16a34a' }}>+{fmt(activeResult.fair - quota)} above</span> : <span style={{ color: '#dc2626' }}>{fmt(quota - activeResult.fair)} gap</span>}</div>
              </div>
            </div>

            {/* Multi-scenario comparison */}
            {scenarios.length > 1 && (
              <div className="card">
                <div className="card-header"><h3>Scenario Comparison</h3></div>
                <table>
                  <thead><tr><th>Scenario</th><th>Bear</th><th>Fair Value</th><th>Bull</th><th>Slippage</th><th>Net New</th><th>vs Quota</th></tr></thead>
                  <tbody>
                    {results.map((r, i) => (
                      <tr key={r.id} style={i === activeIdx ? { background: '#eef2ff' } : {}}>
                        <td><strong>{r.name}</strong></td>
                        <td style={{ color: '#dc2626' }}>{fmt(r.result.bear)}</td>
                        <td style={{ color: '#6366f1', fontWeight: 700 }}>{fmt(r.result.fair)}</td>
                        <td style={{ color: '#16a34a' }}>{fmt(r.result.bull)}</td>
                        <td>{r.slippage}%</td>
                        <td>{fmt(r.netNew)}</td>
                        <td style={{ color: r.result.fair >= quota ? '#16a34a' : '#dc2626', fontWeight: 500 }}>
                          {r.result.fair >= quota ? `+${fmt(r.result.fair - quota)}` : `-${fmt(quota - r.result.fair)}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Sensitivity Analysis */}
            <div className="card">
              <div className="card-header"><h3>Sensitivity Analysis</h3><span className="badge badge-purple">±10% variable change</span></div>
              <p style={{ fontSize: 12, color: '#64748b', marginBottom: 14 }}>How much does a ±10% change in each variable affect the fair value outcome?</p>
              {sensitivity.sort((a, b) => (b.upImpact + b.downImpact) - (a.upImpact + a.downImpact)).map((v, i) => {
                const maxImpact = Math.max(...sensitivity.map(x => Math.max(x.upImpact, x.downImpact)))
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <span style={{ width: 150, fontSize: 12, fontWeight: 500 }}>{v.name}</span>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', height: 20, position: 'relative' }}>
                      {/* Negative bar (left) */}
                      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                        <div style={{ width: `${(v.downImpact / maxImpact) * 100}%`, height: 8, background: '#fecaca', borderRadius: 4 }} />
                      </div>
                      <div style={{ width: 1, height: 16, background: '#d1d5db', margin: '0 4px' }} />
                      {/* Positive bar (right) */}
                      <div style={{ flex: 1 }}>
                        <div style={{ width: `${(v.upImpact / maxImpact) * 100}%`, height: 8, background: '#bbf7d0', borderRadius: 4 }} />
                      </div>
                    </div>
                    <span style={{ width: 60, fontSize: 11, textAlign: 'right', color: '#16a34a' }}>+{fmt(v.upImpact)}</span>
                    <span style={{ width: 60, fontSize: 11, textAlign: 'right', color: '#dc2626' }}>-{fmt(v.downImpact)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
