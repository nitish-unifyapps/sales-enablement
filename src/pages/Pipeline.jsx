import { useState, useMemo } from 'react'

const stages = [
  { id: 'discovery', name: 'Discovery', probability: 10, expectedDays: 14 },
  { id: 'qualified', name: 'Qualified', probability: 25, expectedDays: 12 },
  { id: 'proposal', name: 'Proposal', probability: 50, expectedDays: 10 },
  { id: 'negotiation', name: 'Negotiation', probability: 75, expectedDays: 7 },
  { id: 'closed_won', name: 'Closed Won', probability: 100, expectedDays: 0 },
  { id: 'closed_lost', name: 'Closed Lost', probability: 0, expectedDays: 0 },
]

const initialDeals = [
  { id: 1, name: 'Enterprise CRM Suite', company: 'Acme Corp', contact: 'Sarah Chen', value: 150000, stage: 'negotiation', owner: 'Sarah Kim', closeDate: '2026-08-15', createdDate: '2026-04-10', daysInStage: 5, health: 92, lastActivity: 'Email sent today', nextStep: 'Contract review call', tags: ['enterprise', 'crm'], source: 'Outbound', activities: 24, stakeholders: 4 },
  { id: 2, name: 'Cloud Migration Platform', company: 'Beta Inc', contact: 'James Park', value: 85000, stage: 'proposal', owner: 'Mike Torres', closeDate: '2026-09-01', createdDate: '2026-03-22', daysInStage: 14, health: 38, lastActivity: '14 days ago', nextStep: 'Follow up on proposal', tags: ['cloud', 'infrastructure'], source: 'Inbound', activities: 8, stakeholders: 2 },
  { id: 3, name: 'Security Platform License', company: 'Delta LLC', contact: 'Mike Torres', value: 310000, stage: 'qualified', owner: 'Sarah Kim', closeDate: '2026-11-10', createdDate: '2026-05-15', daysInStage: 3, health: 88, lastActivity: 'Call yesterday', nextStep: 'Technical demo with IT team', tags: ['security', 'enterprise'], source: 'Partner', activities: 12, stakeholders: 3 },
  { id: 4, name: 'Data Analytics Pro', company: 'Omega Co', contact: 'Lisa Wang', value: 220000, stage: 'discovery', owner: 'James Park', closeDate: '2026-09-20', createdDate: '2026-06-01', daysInStage: 2, health: 75, lastActivity: 'Meeting tomorrow', nextStep: 'Discovery call', tags: ['analytics', 'data'], source: 'Outbound', activities: 4, stakeholders: 1 },
  { id: 5, name: 'API Integration Layer', company: 'Zeta Tech', contact: 'Tom Harris', value: 95000, stage: 'proposal', owner: 'Mike Torres', closeDate: '2026-08-30', createdDate: '2026-04-08', daysInStage: 8, health: 55, lastActivity: '5 days ago', nextStep: 'Pricing discussion', tags: ['api', 'integration'], source: 'Inbound', activities: 15, stakeholders: 2 },
  { id: 6, name: 'HR Automation Suite', company: 'Sigma HR', contact: 'Anna Lee', value: 175000, stage: 'discovery', owner: 'James Park', closeDate: '2026-10-15', createdDate: '2026-05-28', daysInStage: 7, health: 48, lastActivity: '7 days ago', nextStep: 'Qualification call', tags: ['hr', 'automation'], source: 'Event', activities: 3, stakeholders: 1 },
  { id: 7, name: 'Marketing Automation', company: 'Alpha Media', contact: 'Ben Cross', value: 130000, stage: 'qualified', owner: 'Sarah Kim', closeDate: '2026-09-30', createdDate: '2026-04-20', daysInStage: 11, health: 62, lastActivity: '3 days ago', nextStep: 'ROI analysis presentation', tags: ['marketing'], source: 'Outbound', activities: 18, stakeholders: 3 },
  { id: 8, name: 'ERP Modernization', company: 'Kappa Manufacturing', contact: 'Dave Miller', value: 420000, stage: 'negotiation', owner: 'James Park', closeDate: '2026-08-25', createdDate: '2026-02-15', daysInStage: 4, health: 85, lastActivity: 'Call today', nextStep: 'Final pricing + legal review', tags: ['erp', 'enterprise'], source: 'Outbound', activities: 42, stakeholders: 6 },
  { id: 9, name: 'Support Platform', company: 'Lambda SaaS', contact: 'Raj Patel', value: 65000, stage: 'closed_won', owner: 'Mike Torres', closeDate: '2026-06-18', createdDate: '2026-03-01', daysInStage: 0, health: 100, lastActivity: 'Won', nextStep: 'Handoff to CS', tags: ['support'], source: 'Inbound', activities: 22, stakeholders: 3 },
  { id: 10, name: 'Dev Tools License', company: 'Theta Dev', contact: 'Kim Yu', value: 48000, stage: 'closed_won', owner: 'Sarah Kim', closeDate: '2026-06-20', createdDate: '2026-04-05', daysInStage: 0, health: 100, lastActivity: 'Won', nextStep: 'Onboarding scheduled', tags: ['devtools'], source: 'Outbound', activities: 16, stakeholders: 2 },
  { id: 11, name: 'Legacy System Replace', company: 'Nu Corp', contact: 'Ellen Marsh', value: 280000, stage: 'closed_lost', owner: 'James Park', closeDate: '2026-06-10', createdDate: '2026-01-20', daysInStage: 0, health: 0, lastActivity: 'Lost — went with competitor', nextStep: '', tags: ['legacy'], source: 'Outbound', activities: 30, stakeholders: 5 },
]

const fmt = (n) => n >= 1000000 ? `$${(n/1000000).toFixed(1)}M` : n >= 1000 ? `$${Math.round(n/1000)}K` : `$${n}`

export default function Pipeline() {
  const [deals, setDeals] = useState(initialDeals)
  const [view, setView] = useState('dashboard')
  const [filterOwner, setFilterOwner] = useState('All')
  const [filterStage, setFilterStage] = useState('All')
  const [filterHealth, setFilterHealth] = useState('All')
  const [filterSource, setFilterSource] = useState('All')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('value')
  const [sortDir, setSortDir] = useState('desc')
  const [dragDeal, setDragDeal] = useState(null)
  const [selectedDeal, setSelectedDeal] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [dealForm, setDealForm] = useState({ name: '', company: '', contact: '', value: '', stage: 'discovery', owner: '', closeDate: '', source: 'Outbound', nextStep: '', tags: '' })

  const [copilotOpen, setCopilotOpen] = useState(false)
  const [copilotMessages, setCopilotMessages] = useState([])
  const [copilotInput, setCopilotInput] = useState('')

  const copilotStarters = ['Show at-risk deals', 'Move deal to negotiation', "What's my pipeline coverage?"]
  const sendCopilot = (msg) => {
    const text = msg || copilotInput
    if (!text.trim()) return
    setCopilotMessages(prev => [...prev, { role: 'user', text }, { role: 'ai', text: `Analyzing: "${text}"... This is a demo response. In production, this would connect to your AI backend.` }])
    setCopilotInput('')
  }

  const owners = ['All', ...new Set(deals.map(d => d.owner))]
  const sources = ['All', ...new Set(deals.map(d => d.source))]

  const filtered = useMemo(() => {
    let d = deals.filter(dl => {
      if (filterOwner !== 'All' && dl.owner !== filterOwner) return false
      if (filterStage !== 'All' && dl.stage !== filterStage) return false
      if (filterHealth === 'good' && dl.health < 70) return false
      if (filterHealth === 'risk' && (dl.health < 40 || dl.health >= 70)) return false
      if (filterHealth === 'critical' && dl.health >= 40) return false
      if (filterSource !== 'All' && dl.source !== filterSource) return false
      if (search && !dl.name.toLowerCase().includes(search.toLowerCase()) && !dl.company.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
    d.sort((a, b) => sortDir === 'desc' ? b[sortBy] - a[sortBy] : a[sortBy] - b[sortBy])
    return d
  }, [deals, filterOwner, filterStage, filterHealth, filterSource, search, sortBy, sortDir])

  const activeDeals = deals.filter(d => !d.stage.startsWith('closed'))
  const totalPipeline = activeDeals.reduce((s, d) => s + d.value, 0)
  const weightedPipeline = activeDeals.reduce((s, d) => s + d.value * ((stages.find(st => st.id === d.stage)?.probability || 0) / 100), 0)
  const wonDeals = deals.filter(d => d.stage === 'closed_won')
  const lostDeals = deals.filter(d => d.stage === 'closed_lost')
  const totalWon = wonDeals.reduce((s, d) => s + d.value, 0)
  const winRate = wonDeals.length + lostDeals.length > 0 ? Math.round((wonDeals.length / (wonDeals.length + lostDeals.length)) * 100) : 0
  const avgDealSize = activeDeals.length > 0 ? Math.round(totalPipeline / activeDeals.length) : 0
  const atRisk = activeDeals.filter(d => d.health < 50).length

  const moveDeal = (dealId, newStage) => setDeals(deals.map(d => d.id === dealId ? { ...d, stage: newStage, daysInStage: 0 } : d))
  const deleteDeal = (id) => { setDeals(deals.filter(d => d.id !== id)); setSelectedDeal(null) }
  const addDeal = () => {
    if (!dealForm.name || !dealForm.company) return
    setDeals([...deals, { id: Date.now(), ...dealForm, value: parseInt(dealForm.value) || 0, daysInStage: 0, health: 70, lastActivity: 'Just created', activities: 0, stakeholders: 0, tags: dealForm.tags.split(',').map(t => t.trim()).filter(Boolean), createdDate: new Date().toISOString().split('T')[0] }])
    setShowAddModal(false)
    setDealForm({ name: '', company: '', contact: '', value: '', stage: 'discovery', owner: '', closeDate: '', source: 'Outbound', nextStep: '', tags: '' })
  }

  const healthColor = (h) => h >= 70 ? '#16a34a' : h >= 40 ? '#d97706' : '#dc2626'
  const healthLabel = (h) => h >= 70 ? 'Healthy' : h >= 40 ? 'At Risk' : 'Critical'

  const stageData = stages.filter(s => !s.id.startsWith('closed')).map(s => ({
    ...s,
    deals: filtered.filter(d => d.stage === s.id),
    total: filtered.filter(d => d.stage === s.id).reduce((sum, d) => sum + d.value, 0),
    count: filtered.filter(d => d.stage === s.id).length,
  }))


  return (
    <div style={{ display: 'flex', height: '100%' }}>
      {/* AI COPILOT SIDEBAR */}
      <div style={{ width: copilotOpen ? 300 : 0, minWidth: copilotOpen ? 300 : 0, transition: 'all 0.2s', borderRight: copilotOpen ? '1px solid #e2e8f0' : 'none', display: 'flex', flexDirection: 'column', background: '#f8fafc', overflow: 'hidden', flexShrink: 0 }}>
        {copilotOpen && (
          <>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>🤖 AI Copilot</span>
              <button onClick={() => setCopilotOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#64748b' }}>✕</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {copilotMessages.length === 0 && (
                <div style={{ padding: 12, fontSize: 12, color: '#64748b', textAlign: 'center' }}>
                  <p style={{ marginBottom: 12 }}>Ask me anything about your pipeline</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {copilotStarters.map(s => (
                      <button key={s} onClick={() => sendCopilot(s)} style={{ padding: '8px 12px', fontSize: 12, border: '1px solid #e2e8f0', borderRadius: 8, background: '#fff', cursor: 'pointer', textAlign: 'left' }}>{s}</button>
                    ))}
                  </div>
                </div>
              )}
              {copilotMessages.map((m, i) => (
                <div key={i} style={{ padding: '8px 12px', borderRadius: 8, fontSize: 12, background: m.role === 'user' ? '#6366f1' : '#fff', color: m.role === 'user' ? '#fff' : '#1e293b', alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%', border: m.role === 'ai' ? '1px solid #e2e8f0' : 'none' }}>{m.text}</div>
              ))}
            </div>
            <div style={{ padding: 12, borderTop: '1px solid #e2e8f0', display: 'flex', gap: 6 }}>
              <input value={copilotInput} onChange={e => setCopilotInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendCopilot()} placeholder="Ask about pipeline..." style={{ flex: 1, padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }} />
              <button onClick={() => sendCopilot()} style={{ padding: '8px 12px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>Send</button>
            </div>
          </>
        )}
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, overflow: 'auto' }}>
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {!copilotOpen && <button onClick={() => setCopilotOpen(true)} style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 13 }}>🤖</button>}
          <h2>Pipeline Analytics & Reporting</h2>
        </div>
        <div className="actions">
          <div className="view-toggle">
            <button className={view === 'dashboard' ? 'active' : ''} onClick={() => setView('dashboard')}>Dashboard</button>
            <button className={view === 'kanban' ? 'active' : ''} onClick={() => setView('kanban')}>Board</button>
            <button className={view === 'table' ? 'active' : ''} onClick={() => setView('table')}>Table</button>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>+ New Deal</button>
        </div>
      </div>

      <div style={{ padding: 24 }}>
        {/* Filters */}
        <div className="filter-bar">
          <input className="search-box" style={{ width: 240 }} placeholder="Search deals..." value={search} onChange={e => setSearch(e.target.value)} />
          <select value={filterOwner} onChange={e => setFilterOwner(e.target.value)}>{owners.map(o => <option key={o} value={o}>{o === 'All' ? 'All Owners' : o}</option>)}</select>
          <select value={filterStage} onChange={e => setFilterStage(e.target.value)}>
            <option value="All">All Stages</option>
            {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={filterHealth} onChange={e => setFilterHealth(e.target.value)}>
            <option value="All">All Health</option>
            <option value="good">Healthy (70+)</option>
            <option value="risk">At Risk (40-69)</option>
            <option value="critical">Critical (&lt;40)</option>
          </select>
          <select value={filterSource} onChange={e => setFilterSource(e.target.value)}>{sources.map(s => <option key={s} value={s}>{s === 'All' ? 'All Sources' : s}</option>)}</select>
          <span style={{ fontSize: 12, color: '#64748b', marginLeft: 'auto' }}>{filtered.length} deals — {fmt(filtered.reduce((s, d) => s + d.value, 0))}</span>
        </div>

        {/* DASHBOARD VIEW */}
        {view === 'dashboard' && (
          <>
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)', marginBottom: 20 }}>
              <div className="stat-box"><div className="value">{fmt(totalPipeline)}</div><div className="label">Active Pipeline</div></div>
              <div className="stat-box"><div className="value">{fmt(weightedPipeline)}</div><div className="label">Weighted Pipeline</div></div>
              <div className="stat-box"><div className="value" style={{ color: '#16a34a' }}>{fmt(totalWon)}</div><div className="label">Closed Won</div></div>
              <div className="stat-box"><div className="value">{winRate}%</div><div className="label">Win Rate</div></div>
              <div className="stat-box"><div className="value">{fmt(avgDealSize)}</div><div className="label">Avg Deal Size</div></div>
              <div className="stat-box"><div className="value" style={{ color: atRisk > 0 ? '#dc2626' : '#16a34a' }}>{atRisk}</div><div className="label">Deals at Risk</div></div>
            </div>

            {/* 2-Column Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {/* LEFT COLUMN: Funnel + Deal Health */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div className="card">
                  <div className="card-header"><h3>Pipeline Funnel</h3></div>
                  {stageData.map((s, i) => {
                    const maxVal = Math.max(...stageData.map(x => x.total), 1)
                    const pct = (s.total / maxVal) * 100
                    const convRate = i > 0 && stageData[i-1].count > 0 ? Math.round((s.count / stageData[i-1].count) * 100) : 100
                    return (
                      <div className="funnel-row" key={s.id}>
                        <span className="stage">{s.name}</span>
                        <span className="amount">{fmt(s.total)}</span>
                        <div className="bar-wrap"><div className="bar" style={{ width: `${pct}%` }}><span>{s.count}</span></div></div>
                        <span className="rate">{convRate}%</span>
                      </div>
                    )
                  })}
                </div>

                <div className="card">
                  <div className="card-header"><h3>Deal Health Distribution</h3></div>
                  {[
                    { label: 'Healthy (70–100)', count: activeDeals.filter(d => d.health >= 70).length, color: '#16a34a' },
                    { label: 'At Risk (40–69)', count: activeDeals.filter(d => d.health >= 40 && d.health < 70).length, color: '#d97706' },
                    { label: 'Critical (0–39)', count: activeDeals.filter(d => d.health < 40).length, color: '#dc2626' },
                  ].map(h => (
                    <div key={h.label} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: h.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, flex: 1 }}>{h.label}</span>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{h.count}</span>
                      <div style={{ width: 100, height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${activeDeals.length > 0 ? (h.count / activeDeals.length) * 100 : 0}%`, background: h.color, borderRadius: 3 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT COLUMN: Stage Velocity + At-Risk Deals */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div className="card">
                  <div className="card-header"><h3>Stage Velocity (Avg Days)</h3></div>
                  {stageData.map(s => {
                    const avg = s.deals.length > 0 ? Math.round(s.deals.reduce((sum, d) => sum + d.daysInStage, 0) / s.deals.length) : 0
                    const overdue = avg > s.expectedDays
                    return (
                      <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <span style={{ fontSize: 13, width: 100 }}>{s.name}</span>
                        <div style={{ flex: 1, height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${Math.min((avg / 20) * 100, 100)}%`, background: overdue ? '#dc2626' : '#6366f1', borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: overdue ? '#dc2626' : '#1e293b', width: 50, textAlign: 'right' }}>{avg}d / {s.expectedDays}d</span>
                      </div>
                    )
                  })}
                </div>

                {atRisk > 0 && (
                  <div className="card" style={{ borderColor: '#fde68a' }}>
                    <div className="card-header"><h3>Deals Needing Attention</h3><span className="badge badge-red">{atRisk} at risk</span></div>
                    <table>
                      <thead><tr><th>Deal</th><th>Value</th><th>Health</th><th>Days</th><th>Next Step</th></tr></thead>
                      <tbody>
                        {activeDeals.filter(d => d.health < 50).map(d => (
                          <tr key={d.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedDeal(d)}>
                            <td><strong>{d.name}</strong><div style={{ fontSize: 11, color: '#64748b' }}>{d.company}</div></td>
                            <td style={{ fontWeight: 600 }}>{fmt(d.value)}</td>
                            <td><span style={{ color: healthColor(d.health), fontWeight: 700 }}>{d.health}</span></td>
                            <td style={{ color: d.daysInStage > 10 ? '#dc2626' : 'inherit' }}>{d.daysInStage}d</td>
                            <td style={{ fontSize: 12 }}>{d.nextStep}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Activity-to-Revenue Funnel */}
            <div className="card">
              <div className="card-header"><h3>Activity → Revenue Funnel</h3></div>
              {[
                { stage: 'Calls Made', count: 842, color: '#6366f1' },
                { stage: 'Conversations', count: 234, color: '#818cf8' },
                { stage: 'Meetings Set', count: 68, color: '#0891b2' },
                { stage: 'Pipeline Created', count: 42, color: '#d97706' },
                { stage: 'Closed Won', count: 10, color: '#16a34a' },
              ].map((s, i, arr) => {
                const pct = (s.count / arr[0].count) * 100
                const convRate = i > 0 ? Math.round((s.count / arr[i-1].count) * 100) : 100
                return (
                  <div key={i} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, color: '#475569' }}>{s.stage}</span>
                      <span><strong>{s.count}</strong>{i > 0 && <span style={{ color: '#94a3b8', marginLeft: 6 }}>{convRate}% conv.</span>}</span>
                    </div>
                    <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: s.color, borderRadius: 4 }} />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* What's Working + Where Losing — side by side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div className="card" style={{ borderLeft: '4px solid #16a34a' }}>
                <div className="card-header"><h3>What's Working</h3></div>
                {[
                  { insight: 'LinkedIn → Call combo', detail: '3.2x higher meeting rate than email-only' },
                  { insight: 'Day 4-5 call timing', detail: '28% connect rate vs 12% on Day 1' },
                  { insight: 'Personalized case studies', detail: '42% reply rate (2x avg)' },
                  { insight: 'Enterprise Outbound sequence', detail: 'Best pipeline/rep: $180K generated' },
                ].map((item, i) => (
                  <div key={i} style={{ padding: '8px 0', borderBottom: i < 3 ? '1px solid #f1f5f9' : 'none' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>{item.insight}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{item.detail}</div>
                  </div>
                ))}
              </div>
              <div className="card" style={{ borderLeft: '4px solid #dc2626' }}>
                <div className="card-header"><h3>Where We're Losing Deals</h3></div>
                {[
                  { insight: 'Proposal → Negotiation drop-off', detail: '45% of proposals stall (avg 14d no activity)' },
                  { insight: 'Single-threaded deals', detail: '68% of lost deals had only 1 stakeholder' },
                  { insight: 'No follow-up after day 7', detail: '22% of prospects go cold without touch' },
                  { insight: 'Budget objection unhandled', detail: '35% of lost deals cite budget — handler sent only 12% of time' },
                ].map((item, i) => (
                  <div key={i} style={{ padding: '8px 0', borderBottom: i < 3 ? '1px solid #f1f5f9' : 'none' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>{item.insight}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{item.detail}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pipeline Attribution */}
            <div className="card">
              <div className="card-header"><h3>Pipeline Attribution</h3></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
                {/* By Sequence */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 8, textTransform: 'uppercase' }}>By Sequence</div>
                  {[{ name: 'Enterprise Outbound', value: 820000 }, { name: 'Inbound Demo', value: 540000 }, { name: 'Event Follow-up', value: 310000 }, { name: 'Re-engagement', value: 95000 }].map((s, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9', fontSize: 12 }}>
                      <span>{s.name}</span><span style={{ fontWeight: 600 }}>{fmt(s.value)}</span>
                    </div>
                  ))}
                </div>
                {/* By Channel */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 8, textTransform: 'uppercase' }}>By Channel</div>
                  {[{ name: 'Email', value: 680000 }, { name: 'Phone/Call', value: 420000 }, { name: 'LinkedIn', value: 380000 }, { name: 'Event/Referral', value: 285000 }].map((s, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9', fontSize: 12 }}>
                      <span>{s.name}</span><span style={{ fontWeight: 600 }}>{fmt(s.value)}</span>
                    </div>
                  ))}
                </div>
                {/* By Rep */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 8, textTransform: 'uppercase' }}>By Rep</div>
                  {[{ name: 'Sarah Kim', value: 580000 }, { name: 'James Park', value: 520000 }, { name: 'Mike Torres', value: 410000 }, { name: 'Lisa Chen', value: 255000 }].map((s, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9', fontSize: 12 }}>
                      <span>{s.name}</span><span style={{ fontWeight: 600 }}>{fmt(s.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* KANBAN VIEW */}
        {view === 'kanban' && (
          <div className="kanban">
            {stageData.map(s => (
              <div key={s.id} className="kanban-col" onDragOver={e => e.preventDefault()} onDrop={() => { if (dragDeal) { moveDeal(dragDeal, s.id); setDragDeal(null) } }}>
                <div className="kanban-col-header">
                  <div>
                    <div className="stage-name">{s.name}</div>
                    <div className="stage-meta">{s.count} deals — {fmt(s.total)}</div>
                  </div>
                  <span className="badge badge-gray">{s.probability}%</span>
                </div>
                {s.deals.map(d => (
                  <div key={d.id} className={`deal-card ${dragDeal === d.id ? 'dragging' : ''}`} draggable onDragStart={() => setDragDeal(d.id)} onDragEnd={() => setDragDeal(null)} onClick={() => setSelectedDeal(d)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                      <div className="deal-name">{d.name}</div>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: healthColor(d.health), flexShrink: 0, marginTop: 4 }} />
                    </div>
                    <div className="deal-company">{d.company}</div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>{d.nextStep}</div>
                    <div className="deal-footer">
                      <span className="deal-value">{fmt(d.value)}</span>
                      <span className="deal-date">{d.daysInStage}d — {d.owner.split(' ')[0]}</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* TABLE VIEW */}
        {view === 'table' && (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table>
              <thead>
                <tr>
                  <th style={{ cursor: 'pointer' }} onClick={() => { setSortBy('name'); setSortDir(sortDir === 'asc' ? 'desc' : 'asc') }}>Deal {sortBy === 'name' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                  <th>Company</th>
                  <th style={{ cursor: 'pointer' }} onClick={() => { setSortBy('value'); setSortDir(sortDir === 'asc' ? 'desc' : 'asc') }}>Value {sortBy === 'value' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                  <th>Stage</th>
                  <th>Owner</th>
                  <th>Close Date</th>
                  <th style={{ cursor: 'pointer' }} onClick={() => { setSortBy('daysInStage'); setSortDir(sortDir === 'asc' ? 'desc' : 'asc') }}>Days {sortBy === 'daysInStage' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                  <th style={{ cursor: 'pointer' }} onClick={() => { setSortBy('health'); setSortDir(sortDir === 'asc' ? 'desc' : 'asc') }}>Health {sortBy === 'health' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                  <th>Next Step</th>
                  <th>Source</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(d => (
                  <tr key={d.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedDeal(d)}>
                    <td><strong>{d.name}</strong></td>
                    <td>{d.company}<div style={{ fontSize: 11, color: '#94a3b8' }}>{d.contact}</div></td>
                    <td style={{ fontWeight: 700 }}>{fmt(d.value)}</td>
                    <td>
                      <select value={d.stage} onClick={e => e.stopPropagation()} onChange={e => moveDeal(d.id, e.target.value)} style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '4px 8px', fontSize: 11 }}>
                        {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </td>
                    <td style={{ fontSize: 12 }}>{d.owner}</td>
                    <td style={{ fontSize: 12 }}>{d.closeDate}</td>
                    <td style={{ color: d.daysInStage > 10 ? '#dc2626' : 'inherit', fontWeight: 500 }}>{d.daysInStage}d</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 32, height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${d.health}%`, background: healthColor(d.health), borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: healthColor(d.health) }}>{d.health}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 12, color: '#64748b', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.nextStep}</td>
                    <td><span className="badge badge-gray" style={{ fontSize: 10 }}>{d.source}</span></td>
                    <td onClick={e => e.stopPropagation()}><button className="btn btn-sm btn-danger" onClick={() => deleteDeal(d.id)}>×</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* DEAL DETAIL PANEL */}
      {selectedDeal && (
        <div className="modal-backdrop" onClick={() => setSelectedDeal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ width: 640, maxHeight: '90vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <h3 style={{ marginBottom: 4 }}>{selectedDeal.name}</h3>
                <div style={{ fontSize: 13, color: '#64748b' }}>{selectedDeal.company} — {selectedDeal.contact}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 24, fontWeight: 800, color: healthColor(selectedDeal.health) }}>{selectedDeal.health}</span>
                <span style={{ fontSize: 11, color: healthColor(selectedDeal.health), fontWeight: 600 }}>{healthLabel(selectedDeal.health)}</span>
              </div>
            </div>

            {/* Key metrics row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
              <div style={{ background: '#f8f9fb', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{fmt(selectedDeal.value)}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>Deal Value</div>
              </div>
              <div style={{ background: '#f8f9fb', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{selectedDeal.daysInStage}d</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>Days in Stage</div>
              </div>
              <div style={{ background: '#f8f9fb', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{selectedDeal.activities}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>Activities</div>
              </div>
              <div style={{ background: '#f8f9fb', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{selectedDeal.stakeholders}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>Stakeholders</div>
              </div>
            </div>

            {/* Deal details grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20, fontSize: 13 }}>
              <div><span style={{ color: '#64748b' }}>Stage:</span> <strong>{stages.find(s => s.id === selectedDeal.stage)?.name}</strong></div>
              <div><span style={{ color: '#64748b' }}>Owner:</span> <strong>{selectedDeal.owner}</strong></div>
              <div><span style={{ color: '#64748b' }}>Close Date:</span> <strong>{selectedDeal.closeDate}</strong></div>
              <div><span style={{ color: '#64748b' }}>Created:</span> <strong>{selectedDeal.createdDate}</strong></div>
              <div><span style={{ color: '#64748b' }}>Source:</span> <strong>{selectedDeal.source}</strong></div>
              <div><span style={{ color: '#64748b' }}>Last Activity:</span> <strong>{selectedDeal.lastActivity}</strong></div>
            </div>

            {/* Next step */}
            <div style={{ background: '#f8f9fb', borderRadius: 8, padding: 14, marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 4 }}>NEXT STEP</div>
              <div style={{ fontSize: 13 }}>{selectedDeal.nextStep || 'No next step defined'}</div>
            </div>

            {/* Tags */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6 }}>TAGS</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {selectedDeal.tags?.map(t => <span key={t} className="badge badge-gray">{t}</span>)}
              </div>
            </div>

            {/* Health signals */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>HEALTH SIGNALS</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8f9fb', borderRadius: 6 }}>
                  <span>Activity recency</span>
                  <span style={{ fontWeight: 600, color: selectedDeal.lastActivity.includes('today') || selectedDeal.lastActivity.includes('yesterday') ? '#16a34a' : '#d97706' }}>
                    {selectedDeal.lastActivity.includes('today') || selectedDeal.lastActivity.includes('yesterday') ? 'Good' : 'Needs attention'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8f9fb', borderRadius: 6 }}>
                  <span>Stage aging</span>
                  <span style={{ fontWeight: 600, color: selectedDeal.daysInStage <= (stages.find(s => s.id === selectedDeal.stage)?.expectedDays || 14) ? '#16a34a' : '#dc2626' }}>
                    {selectedDeal.daysInStage}d / {stages.find(s => s.id === selectedDeal.stage)?.expectedDays || 14}d expected
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8f9fb', borderRadius: 6 }}>
                  <span>Stakeholder engagement</span>
                  <span style={{ fontWeight: 600, color: selectedDeal.stakeholders >= 3 ? '#16a34a' : '#d97706' }}>{selectedDeal.stakeholders} engaged</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8f9fb', borderRadius: 6 }}>
                  <span>Total activities</span>
                  <span style={{ fontWeight: 600 }}>{selectedDeal.activities}</span>
                </div>
              </div>
            </div>

            {/* Stage change */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Move to:</span>
              {stages.filter(s => s.id !== selectedDeal.stage).map(s => (
                <button key={s.id} className="btn btn-sm" onClick={() => { moveDeal(selectedDeal.id, s.id); setSelectedDeal({ ...selectedDeal, stage: s.id }) }}>{s.name}</button>
              ))}
            </div>

            <div className="modal-actions">
              <button className="btn btn-danger" onClick={() => deleteDeal(selectedDeal.id)}>Delete Deal</button>
              <button className="btn" onClick={() => setSelectedDeal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD DEAL MODAL */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Add New Deal</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group"><label>Deal Name</label><input value={dealForm.name} onChange={e => setDealForm({ ...dealForm, name: e.target.value })} placeholder="e.g. Enterprise CRM Suite" /></div>
              <div className="form-group"><label>Company</label><input value={dealForm.company} onChange={e => setDealForm({ ...dealForm, company: e.target.value })} placeholder="e.g. Acme Corp" /></div>
              <div className="form-group"><label>Contact</label><input value={dealForm.contact} onChange={e => setDealForm({ ...dealForm, contact: e.target.value })} placeholder="e.g. Sarah Chen" /></div>
              <div className="form-group"><label>Deal Value ($)</label><input type="number" value={dealForm.value} onChange={e => setDealForm({ ...dealForm, value: e.target.value })} /></div>
              <div className="form-group"><label>Stage</label><select value={dealForm.stage} onChange={e => setDealForm({ ...dealForm, stage: e.target.value })}>{stages.filter(s => !s.id.startsWith('closed')).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
              <div className="form-group"><label>Owner</label><input value={dealForm.owner} onChange={e => setDealForm({ ...dealForm, owner: e.target.value })} placeholder="e.g. Sarah Kim" /></div>
              <div className="form-group"><label>Expected Close Date</label><input type="date" value={dealForm.closeDate} onChange={e => setDealForm({ ...dealForm, closeDate: e.target.value })} /></div>
              <div className="form-group"><label>Source</label><select value={dealForm.source} onChange={e => setDealForm({ ...dealForm, source: e.target.value })}><option>Outbound</option><option>Inbound</option><option>Partner</option><option>Event</option></select></div>
            </div>
            <div className="form-group"><label>Next Step</label><input value={dealForm.nextStep} onChange={e => setDealForm({ ...dealForm, nextStep: e.target.value })} placeholder="e.g. Schedule discovery call" /></div>
            <div className="form-group"><label>Tags (comma separated)</label><input value={dealForm.tags} onChange={e => setDealForm({ ...dealForm, tags: e.target.value })} placeholder="e.g. enterprise, crm, priority" /></div>
            <div className="modal-actions">
              <button className="btn" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={addDeal}>Create Deal</button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
