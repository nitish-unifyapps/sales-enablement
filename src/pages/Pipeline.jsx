import { useState } from 'react'

const stages = [
  { id: 'discovery', name: 'Discovery', probability: 10 },
  { id: 'qualified', name: 'Qualified', probability: 25 },
  { id: 'proposal', name: 'Proposal', probability: 50 },
  { id: 'negotiation', name: 'Negotiation', probability: 75 },
  { id: 'closed', name: 'Closed Won', probability: 100 },
]

const initialDeals = [
  { id: 1, name: 'Enterprise CRM Suite', company: 'Acme Corp', value: 150000, stage: 'negotiation', owner: 'Sarah K.', closeDate: 'Aug 15', daysInStage: 5, health: 'green', lastTouch: 'Email today' },
  { id: 2, name: 'Cloud Migration', company: 'Beta Inc', value: 85000, stage: 'proposal', owner: 'Mike T.', closeDate: 'Sep 01', daysInStage: 14, health: 'red', lastTouch: '14 days ago' },
  { id: 3, name: 'Security Platform', company: 'Delta LLC', value: 310000, stage: 'qualified', owner: 'Sarah K.', closeDate: 'Nov 10', daysInStage: 3, health: 'green', lastTouch: 'Call yesterday' },
  { id: 4, name: 'Data Analytics Pro', company: 'Omega Co', value: 220000, stage: 'discovery', owner: 'James P.', closeDate: 'Sep 20', daysInStage: 2, health: 'green', lastTouch: 'Meeting tmrw' },
  { id: 5, name: 'API Integration', company: 'Zeta Tech', value: 95000, stage: 'proposal', owner: 'Mike T.', closeDate: 'Aug 30', daysInStage: 8, health: 'yellow', lastTouch: '5 days ago' },
  { id: 6, name: 'HR Automation', company: 'Sigma HR', value: 175000, stage: 'discovery', owner: 'James P.', closeDate: 'Oct 15', daysInStage: 7, health: 'yellow', lastTouch: '7 days ago' },
  { id: 7, name: 'Marketing Suite', company: 'Alpha Media', value: 130000, stage: 'qualified', owner: 'Sarah K.', closeDate: 'Sep 30', daysInStage: 11, health: 'yellow', lastTouch: '3 days ago' },
  { id: 8, name: 'ERP Modernization', company: 'Kappa Mfg', value: 420000, stage: 'negotiation', owner: 'James P.', closeDate: 'Aug 25', daysInStage: 4, health: 'green', lastTouch: 'Call today' },
  { id: 9, name: 'Support Platform', company: 'Lambda SaaS', value: 65000, stage: 'closed', owner: 'Mike T.', closeDate: 'Jun 18', daysInStage: 0, health: 'green', lastTouch: 'Won' },
  { id: 10, name: 'Dev Tools License', company: 'Theta Dev', value: 48000, stage: 'closed', owner: 'Sarah K.', closeDate: 'Jun 20', daysInStage: 0, health: 'green', lastTouch: 'Won' },
]

const fmt = (n) => n >= 1000000 ? `$${(n/1000000).toFixed(1)}M` : n >= 1000 ? `$${(n/1000).toFixed(0)}K` : `$${n}`

export default function Pipeline() {
  const [deals, setDeals] = useState(initialDeals)
  const [view, setView] = useState('analytics')
  const [filterOwner, setFilterOwner] = useState('All')
  const [filterHealth, setFilterHealth] = useState('All')
  const [dragDeal, setDragDeal] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', company: '', value: '', stage: 'discovery', owner: '', closeDate: '' })

  const owners = ['All', ...new Set(deals.map(d => d.owner))]
  const filtered = deals.filter(d => (filterOwner === 'All' || d.owner === filterOwner) && (filterHealth === 'All' || d.health === filterHealth))

  const totalPipeline = deals.reduce((s, d) => s + d.value, 0)
  const totalWon = deals.filter(d => d.stage === 'closed').reduce((s, d) => s + d.value, 0)
  const winRate = deals.length > 0 ? Math.round((deals.filter(d => d.stage === 'closed').length / deals.length) * 100) : 0
  const avgCycle = Math.round(deals.reduce((s, d) => s + d.daysInStage, 0) / deals.length)

  const stageData = stages.map(s => ({
    ...s,
    deals: filtered.filter(d => d.stage === s.id),
    total: filtered.filter(d => d.stage === s.id).reduce((sum, d) => sum + d.value, 0),
    count: filtered.filter(d => d.stage === s.id).length,
  }))

  const addDeal = () => {
    if (!form.name || !form.company) return
    setDeals([...deals, { id: Date.now(), ...form, value: parseInt(form.value) || 0, daysInStage: 0, health: 'green', lastTouch: 'Just created' }])
    setShowModal(false)
    setForm({ name: '', company: '', value: '', stage: 'discovery', owner: '', closeDate: '' })
  }

  const moveDeal = (dealId, newStage) => {
    setDeals(deals.map(d => d.id === dealId ? { ...d, stage: newStage, daysInStage: 0 } : d))
  }

  const deleteDeal = (id) => setDeals(deals.filter(d => d.id !== id))

  return (
    <div>
      <div className="topbar">
        <h2>Pipeline Analytics & Reporting</h2>
        <div className="actions">
          <div className="view-toggle">
            <button className={view === 'analytics' ? 'active' : ''} onClick={() => setView('analytics')}>Analytics</button>
            <button className={view === 'kanban' ? 'active' : ''} onClick={() => setView('kanban')}>Board</button>
            <button className={view === 'table' ? 'active' : ''} onClick={() => setView('table')}>Table</button>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Deal</button>
        </div>
      </div>

      <div style={{ padding: 24 }}>
        {/* Filters */}
        <div className="filter-bar">
          <select value={filterOwner} onChange={e => setFilterOwner(e.target.value)}>
            {owners.map(o => <option key={o} value={o}>{o === 'All' ? 'All Owners' : o}</option>)}
          </select>
          <select value={filterHealth} onChange={e => setFilterHealth(e.target.value)}>
            <option value="All">All Health</option>
            <option value="green">Healthy</option>
            <option value="yellow">At Risk</option>
            <option value="red">Critical</option>
          </select>
          <span style={{ fontSize: 12, color: '#64748b' }}>{filtered.length} deals • {fmt(filtered.reduce((s, d) => s + d.value, 0))} total</span>
        </div>

        {/* ANALYTICS VIEW */}
        {view === 'analytics' && (
          <>
            <div className="stats-grid">
              <div className="stat-box"><div className="value">{fmt(totalPipeline)}</div><div className="label">Total Pipeline</div></div>
              <div className="stat-box"><div className="value">{fmt(totalWon)}</div><div className="label">Closed Won</div></div>
              <div className="stat-box"><div className="value">{winRate}%</div><div className="label">Win Rate</div></div>
              <div className="stat-box"><div className="value">3.2x</div><div className="label">Coverage Ratio</div></div>
              <div className="stat-box"><div className="value">{avgCycle}d</div><div className="label">Avg Days in Stage</div></div>
            </div>

            <div className="card">
              <div className="card-header"><h3>Pipeline Conversion Funnel</h3></div>
              {stageData.map((s, i) => {
                const maxVal = Math.max(...stageData.map(x => x.total))
                const pct = maxVal > 0 ? (s.total / maxVal) * 100 : 0
                const convRate = i > 0 && stageData[i-1].count > 0 ? Math.round((s.count / stageData[i-1].count) * 100) : 100
                return (
                  <div className="funnel-row" key={s.id}>
                    <span className="stage">{s.name}</span>
                    <span className="amount">{fmt(s.total)}</span>
                    <div className="bar-wrap">
                      <div className="bar" style={{ width: `${pct}%` }}><span>{s.count} deals</span></div>
                    </div>
                    <span className="rate">{convRate}%</span>
                  </div>
                )
              })}
            </div>

            <div className="card">
              <div className="card-header"><h3>Deal Velocity — Avg Days per Stage</h3></div>
              {stageData.filter(s => s.id !== 'closed').map(s => {
                const avgDays = s.deals.length > 0 ? Math.round(s.deals.reduce((sum, d) => sum + d.daysInStage, 0) / s.deals.length) : 0
                const maxDays = 20
                const colors = { discovery: '#6366f1', qualified: '#2563eb', proposal: '#0891b2', negotiation: '#16a34a' }
                return (
                  <div className="velocity-card" key={s.id}>
                    <span className="v-stage">{s.name}</span>
                    <div className="v-bar"><div className="v-fill" style={{ width: `${(avgDays / maxDays) * 100}%`, background: colors[s.id] || '#6366f1' }} /></div>
                    <span className="v-days">{avgDays} days</span>
                  </div>
                )
              })}
            </div>

            <div className="card" style={{ background: '#fffbeb', borderColor: '#fde68a' }}>
              <div className="card-header"><h3>⚠️ Risk Signals</h3></div>
              {deals.filter(d => d.health === 'red' || d.daysInStage > 10).map(d => (
                <div key={d.id} style={{ padding: '10px 14px', background: '#fff', borderRadius: 8, marginBottom: 8, fontSize: 13, border: '1px solid #fde68a', display: 'flex', justifyContent: 'space-between' }}>
                  <span><strong>{d.name}</strong> ({d.company}) — stalled {d.daysInStage} days in {stages.find(s => s.id === d.stage)?.name}</span>
                  <span className={`badge ${d.health === 'red' ? 'badge-red' : 'badge-yellow'}`}>{d.health === 'red' ? 'Critical' : 'At Risk'}</span>
                </div>
              ))}
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
                    <div className="stage-meta">{s.count} deals • {fmt(s.total)}</div>
                  </div>
                  <span className="badge badge-gray">{s.probability}%</span>
                </div>
                {s.deals.map(d => (
                  <div key={d.id} className={`deal-card ${dragDeal === d.id ? 'dragging' : ''}`} draggable onDragStart={() => setDragDeal(d.id)} onDragEnd={() => setDragDeal(null)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div className="deal-name">{d.name}</div>
                        <div className="deal-company">{d.company} • {d.owner}</div>
                      </div>
                      <span className={`health-dot ${d.health}`} />
                    </div>
                    <div className="deal-footer">
                      <span className="deal-value">{fmt(d.value)}</span>
                      <span className="deal-date">{d.closeDate} • {d.daysInStage}d</span>
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
                <tr><th>Deal</th><th>Company</th><th>Value</th><th>Stage</th><th>Owner</th><th>Close Date</th><th>Days</th><th>Health</th><th></th></tr>
              </thead>
              <tbody>
                {filtered.map(d => (
                  <tr key={d.id}>
                    <td><strong>{d.name}</strong></td>
                    <td>{d.company}</td>
                    <td style={{ fontWeight: 600 }}>{fmt(d.value)}</td>
                    <td>
                      <select value={d.stage} onChange={e => moveDeal(d.id, e.target.value)} style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '4px 8px', fontSize: 12 }}>
                        {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </td>
                    <td>{d.owner}</td>
                    <td>{d.closeDate}</td>
                    <td>{d.daysInStage}d</td>
                    <td><span className={`health-dot ${d.health}`} /></td>
                    <td><button className="btn btn-sm btn-danger" onClick={() => deleteDeal(d.id)}>✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Add New Deal</h3>
            <div className="form-group"><label>Deal Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Enterprise CRM Suite" /></div>
            <div className="form-group"><label>Company</label><input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="e.g. Acme Corp" /></div>
            <div className="form-group"><label>Deal Value ($)</label><input type="number" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} placeholder="e.g. 150000" /></div>
            <div className="form-group"><label>Stage</label><select value={form.stage} onChange={e => setForm({ ...form, stage: e.target.value })}>{stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
            <div className="form-group"><label>Owner</label><input value={form.owner} onChange={e => setForm({ ...form, owner: e.target.value })} placeholder="e.g. Sarah K." /></div>
            <div className="form-group"><label>Expected Close Date</label><input value={form.closeDate} onChange={e => setForm({ ...form, closeDate: e.target.value })} placeholder="e.g. Aug 30" /></div>
            <div className="modal-actions">
              <button className="btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={addDeal}>Create Deal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
