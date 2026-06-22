import { useState } from 'react'

const initialMilestones = [
  { id: 1, title: 'Define ICP & Target Account List', desc: 'Finalize ideal customer profile criteria and build target list of 500+ accounts', assignee: 'Sales Ops', stakeholder: 'VP Sales', target: '2026-06-01', status: 'done', priority: 'high', category: 'strategy', notes: 'Completed on time. 520 accounts identified.', completedDate: '2026-05-29' },
  { id: 2, title: 'Build Multi-Channel Cadence', desc: 'Create 10+ step sequence combining email, LinkedIn, and call touchpoints', assignee: 'Sales Enablement', stakeholder: 'SDR Team', target: '2026-06-08', status: 'done', priority: 'high', category: 'execution', notes: 'Built 4 cadences for different personas.', completedDate: '2026-06-07' },
  { id: 3, title: 'A/B Test Templates & Optimize', desc: 'Run A/B tests on top 5 email templates, achieve statistical significance', assignee: 'Marketing', stakeholder: 'SDR Lead', target: '2026-06-30', status: 'partial', priority: 'medium', category: 'optimization', notes: '3 of 5 tests complete. Variant B winning on CXO template.', completedDate: null },
  { id: 4, title: 'Launch AI Agent Rules', desc: 'Configure intent-based triggers and AI branching for automated responses', assignee: 'Revenue Ops', stakeholder: 'CRO', target: '2026-07-15', status: 'pending', priority: 'high', category: 'execution', notes: '', completedDate: null },
  { id: 5, title: 'Achieve 40% Reply Rate', desc: 'Sustained 40% reply rate across all active sequences for 2 consecutive weeks', assignee: 'SDR Team', stakeholder: 'VP Sales', target: '2026-08-01', status: 'pending', priority: 'high', category: 'kpi', notes: '', completedDate: null },
  { id: 6, title: 'Book 80 Meetings/Month', desc: 'Consistent monthly output of 80+ qualified meetings from outbound efforts', assignee: 'SDR Team', stakeholder: 'VP Sales', target: '2026-08-01', status: 'pending', priority: 'high', category: 'kpi', notes: '', completedDate: null },
  { id: 7, title: 'Generate $1.5M Pipeline', desc: 'Create $1.5M in qualified pipeline from cadence-sourced opportunities', assignee: 'AE Team', stakeholder: 'CRO', target: '2026-08-15', status: 'pending', priority: 'critical', category: 'kpi', notes: '', completedDate: null },
  { id: 8, title: 'Quarterly Review & Cadence Refresh', desc: 'Full review of all cadences, retire underperformers, refresh messaging', assignee: 'Sales Enablement', stakeholder: 'All', target: '2026-09-15', status: 'pending', priority: 'medium', category: 'strategy', notes: '', completedDate: null },
]

const initialKPIs = [
  { id: 1, name: 'Reply Rate', current: 34, target: 40, unit: '%', trend: 'up' },
  { id: 2, name: 'Meetings Booked (Monthly)', current: 68, target: 80, unit: '', trend: 'up' },
  { id: 3, name: 'Pipeline Generated', current: 1200000, target: 1500000, unit: '$', trend: 'up' },
  { id: 4, name: 'Avg Meetings per Rep', current: 17, target: 20, unit: '', trend: 'up' },
  { id: 5, name: 'Sequence Completion Rate', current: 62, target: 75, unit: '%', trend: 'down' },
  { id: 6, name: 'Email Deliverability', current: 96, target: 98, unit: '%', trend: 'flat' },
]

const categories = ['all', 'strategy', 'execution', 'optimization', 'kpi']
const priorities = ['critical', 'high', 'medium', 'low']
const statuses = ['pending', 'partial', 'done']

const fmtVal = (v, unit) => unit === '$' ? (v >= 1000000 ? `$${(v/1000000).toFixed(1)}M` : `$${Math.round(v/1000)}K`) : `${v}${unit}`

export default function SuccessPlan() {
  const [milestones, setMilestones] = useState(initialMilestones)
  const [kpis, setKpis] = useState(initialKPIs)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [filterCat, setFilterCat] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [form, setForm] = useState({ title: '', desc: '', assignee: '', stakeholder: '', target: '', priority: 'medium', category: 'execution', notes: '' })
  const [showKpiModal, setShowKpiModal] = useState(false)
  const [kpiForm, setKpiForm] = useState({ name: '', current: '', target: '', unit: '%' })

  const openAdd = () => { setEditing(null); setForm({ title: '', desc: '', assignee: '', stakeholder: '', target: '', priority: 'medium', category: 'execution', notes: '' }); setShowModal(true) }
  const openEdit = (m) => { setEditing(m); setForm({ title: m.title, desc: m.desc, assignee: m.assignee, stakeholder: m.stakeholder, target: m.target, priority: m.priority, category: m.category, notes: m.notes }); setShowModal(true) }

  const save = () => {
    if (!form.title) return
    if (editing) {
      setMilestones(milestones.map(m => m.id === editing.id ? { ...m, ...form } : m))
    } else {
      setMilestones([...milestones, { id: Date.now(), ...form, status: 'pending', completedDate: null }])
    }
    setShowModal(false)
  }

  const cycleStatus = (id) => {
    setMilestones(milestones.map(m => {
      if (m.id !== id) return m
      const next = { pending: 'partial', partial: 'done', done: 'pending' }
      return { ...m, status: next[m.status], completedDate: next[m.status] === 'done' ? new Date().toISOString().split('T')[0] : null }
    }))
  }

  const deleteMilestone = (id) => setMilestones(milestones.filter(m => m.id !== id))

  const addKpi = () => {
    if (!kpiForm.name) return
    setKpis([...kpis, { id: Date.now(), name: kpiForm.name, current: parseFloat(kpiForm.current) || 0, target: parseFloat(kpiForm.target) || 0, unit: kpiForm.unit, trend: 'flat' }])
    setShowKpiModal(false)
    setKpiForm({ name: '', current: '', target: '', unit: '%' })
  }

  const updateKpiCurrent = (id, value) => {
    setKpis(kpis.map(k => k.id === id ? { ...k, current: parseFloat(value) || 0 } : k))
  }

  const filtered = milestones.filter(m => (filterCat === 'all' || m.category === filterCat) && (filterStatus === 'all' || m.status === filterStatus))
  const doneCount = milestones.filter(m => m.status === 'done').length
  const progress = milestones.length > 0 ? Math.round((doneCount / milestones.length) * 100) : 0
  const priorityColor = { critical: '#dc2626', high: '#d97706', medium: '#6366f1', low: '#64748b' }

  return (
    <div>
      <div className="topbar">
        <h2>Success Plan</h2>
        <div className="actions">
          <button className="btn" onClick={openAdd}>+ Add Milestone</button>
          <button className="btn" onClick={() => setShowKpiModal(true)}>+ Add KPI</button>
          <button className="btn btn-primary">Share Plan</button>
        </div>
      </div>

      <div style={{ padding: 24 }}>
        {/* Overview */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
          <div className="stat-box"><div className="value">{progress}%</div><div className="label">Overall Progress</div></div>
          <div className="stat-box"><div className="value">{doneCount}/{milestones.length}</div><div className="label">Milestones Done</div></div>
          <div className="stat-box"><div className="value">{milestones.filter(m => m.status === 'partial').length}</div><div className="label">In Progress</div></div>
          <div className="stat-box"><div className="value">{milestones.filter(m => m.priority === 'critical' && m.status !== 'done').length}</div><div className="label">Critical Pending</div></div>
          <div className="stat-box"><div className="value">{milestones.filter(m => m.status === 'pending' && new Date(m.target) < new Date()).length}</div><div className="label">Overdue</div></div>
        </div>

        {/* KPI Tracking */}
        <div className="card">
          <div className="card-header"><h3>Key Performance Indicators</h3><span className="badge badge-green">{kpis.filter(k => k.current >= k.target).length}/{kpis.length} met</span></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {kpis.map(k => {
              const pct = k.target > 0 ? Math.min((k.current / k.target) * 100, 100) : 0
              const met = k.current >= k.target
              return (
                <div key={k.id} style={{ padding: 16, border: '1px solid #e5e7eb', borderRadius: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{k.name}</span>
                    {met && <span className="badge badge-green">Met</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
                    <span style={{ fontSize: 22, fontWeight: 800 }}>{fmtVal(k.current, k.unit)}</span>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>/ {fmtVal(k.target, k.unit)}</span>
                  </div>
                  <div className="progress-bar"><div className="fill" style={{ width: `${pct}%`, background: met ? '#16a34a' : pct >= 70 ? '#6366f1' : '#d97706' }} /></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: '#94a3b8' }}>
                    <span>{Math.round(pct)}% achieved</span>
                    <span>{fmtVal(Math.max(0, k.target - k.current), k.unit)} remaining</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Milestones */}
        <div className="card">
          <div className="card-header">
            <h3>Milestones</h3>
            <div style={{ display: 'flex', gap: 6 }}>
              {categories.map(c => <button key={c} className={`btn btn-sm ${filterCat === c ? 'btn-primary' : ''}`} onClick={() => setFilterCat(c)}>{c === 'all' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1)}</button>)}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
            {['all', 'pending', 'partial', 'done'].map(s => <button key={s} className={`btn btn-sm ${filterStatus === s ? 'btn-primary' : ''}`} onClick={() => setFilterStatus(s)}>{s === 'all' ? 'All Status' : s === 'partial' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}</button>)}
          </div>

          {filtered.map(m => {
            const overdue = m.status !== 'done' && new Date(m.target) < new Date()
            return (
              <div key={m.id} className="milestone-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8, borderColor: overdue ? '#fecaca' : undefined }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className={`checkbox ${m.status}`} onClick={() => cycleStatus(m.id)}>
                    {m.status === 'done' ? '✓' : m.status === 'partial' ? '◐' : ''}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{m.title}</span>
                      <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: priorityColor[m.priority] + '15', color: priorityColor[m.priority], fontWeight: 700 }}>{m.priority}</span>
                      <span className="badge badge-gray" style={{ fontSize: 9 }}>{m.category}</span>
                      {overdue && <span className="badge badge-red" style={{ fontSize: 9 }}>Overdue</span>}
                    </div>
                    {m.desc && <div style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>{m.desc}</div>}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 12, color: overdue ? '#dc2626' : '#64748b' }}>{m.target}</div>
                    {m.completedDate && <div style={{ fontSize: 11, color: '#16a34a' }}>Done {m.completedDate}</div>}
                  </div>
                  <button className="btn btn-sm" onClick={() => openEdit(m)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => deleteMilestone(m.id)}>×</button>
                </div>
                <div style={{ display: 'flex', gap: 16, paddingLeft: 40, fontSize: 12, color: '#64748b' }}>
                  <span>Owner: <strong>{m.assignee}</strong></span>
                  <span>Stakeholder: <strong>{m.stakeholder}</strong></span>
                  {m.notes && <span style={{ color: '#475569' }}>Note: {m.notes}</span>}
                </div>
              </div>
            )
          })}
        </div>

        {/* Channel Performance */}
        <div className="card">
          <div className="card-header"><h3>Channel Performance</h3></div>
          <table>
            <thead><tr><th>Channel</th><th>Sent</th><th>Opened</th><th>Replied</th><th>Meetings</th><th>Conversion</th><th>Trend</th></tr></thead>
            <tbody>
              <tr><td>Email</td><td>3,420</td><td>2,189 (64%)</td><td>342 (10%)</td><td>48</td><td>1.4%</td><td style={{ color: '#16a34a' }}>↑ +2%</td></tr>
              <tr><td>LinkedIn</td><td>890</td><td>374 (42%)</td><td>160 (18%)</td><td>14</td><td>1.6%</td><td style={{ color: '#16a34a' }}>↑ +5%</td></tr>
              <tr><td>Phone</td><td>210</td><td>59 (28%)</td><td>—</td><td>6</td><td>2.9%</td><td style={{ color: '#dc2626' }}>↓ -1%</td></tr>
            </tbody>
          </table>
        </div>

        {/* AI Recommendations */}
        <div className="card">
          <div className="card-header"><h3>AI Recommendations</h3></div>
          {['LinkedIn messages on Tuesdays 9-11am have 2.3x higher accept rate. Shift schedule.', 'Template "CXO Value Prop" Variant B outperforms A by 18%. Make B default.', 'Calls within 1 hour of email open have 4x meeting rate. Enable real-time alert.'].map((r, i) => (
            <div key={i} style={{ padding: '10px 14px', background: '#f8f9fb', borderRadius: 8, marginBottom: 6, fontSize: 13 }}>{r}</div>
          ))}
        </div>
      </div>

      {/* Milestone Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ width: 580 }}>
            <h3>{editing ? 'Edit Milestone' : 'Add Milestone'}</h3>
            <div className="form-group"><label>Title</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="What needs to be achieved?" /></div>
            <div className="form-group"><label>Description</label><textarea value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} placeholder="Detailed description of this milestone, success criteria, and deliverables..." /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group"><label>Owner / Assignee</label><input value={form.assignee} onChange={e => setForm({ ...form, assignee: e.target.value })} placeholder="Who is responsible?" /></div>
              <div className="form-group"><label>Stakeholder</label><input value={form.stakeholder} onChange={e => setForm({ ...form, stakeholder: e.target.value })} placeholder="Who benefits/reviews?" /></div>
              <div className="form-group"><label>Target Date</label><input type="date" value={form.target} onChange={e => setForm({ ...form, target: e.target.value })} /></div>
              <div className="form-group"><label>Priority</label>
                <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                  {priorities.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {categories.filter(c => c !== 'all').map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group"><label>Notes / Comments</label><textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Progress notes, blockers, updates..." style={{ minHeight: 60 }} /></div>
            <div className="modal-actions">
              <button className="btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save}>{editing ? 'Save Changes' : 'Add Milestone'}</button>
            </div>
          </div>
        </div>
      )}

      {/* KPI Modal */}
      {showKpiModal && (
        <div className="modal-backdrop" onClick={() => setShowKpiModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Add KPI</h3>
            <div className="form-group"><label>KPI Name</label><input value={kpiForm.name} onChange={e => setKpiForm({ ...kpiForm, name: e.target.value })} placeholder="e.g. Reply Rate, Pipeline Generated" /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div className="form-group"><label>Current Value</label><input type="number" value={kpiForm.current} onChange={e => setKpiForm({ ...kpiForm, current: e.target.value })} /></div>
              <div className="form-group"><label>Target Value</label><input type="number" value={kpiForm.target} onChange={e => setKpiForm({ ...kpiForm, target: e.target.value })} /></div>
              <div className="form-group"><label>Unit</label><select value={kpiForm.unit} onChange={e => setKpiForm({ ...kpiForm, unit: e.target.value })}><option value="%">%</option><option value="$">$</option><option value="">Count</option></select></div>
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={() => setShowKpiModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={addKpi}>Add KPI</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
