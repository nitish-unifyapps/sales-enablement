import { useState } from 'react'

const initialMetricRules = [
  { id: 1, name: 'Reply Rate', source: 'sequence', metric: 'reply_rate', operator: '>=', threshold: 40, period: 'weekly', unit: '%', current: 34, status: 'below', linkedSequences: ['Enterprise Outbound', 'Inbound Demo Request'] },
  { id: 2, name: 'Meetings Booked', source: 'sequence', metric: 'meetings_booked', operator: '>=', threshold: 80, period: 'monthly', unit: '', current: 68, status: 'below', linkedSequences: ['All Active Sequences'] },
  { id: 3, name: 'Pipeline Generated', source: 'account', metric: 'pipeline_value', operator: '>=', threshold: 1500000, period: 'quarterly', unit: '$', current: 1200000, status: 'below', linkedSequences: [] },
  { id: 4, name: 'Email Deliverability', source: 'sequence', metric: 'deliverability_rate', operator: '>=', threshold: 98, period: 'daily', unit: '%', current: 96.2, status: 'below', linkedSequences: ['All Active Sequences'] },
  { id: 5, name: 'Avg Response Time', source: 'sequence', metric: 'avg_response_time', operator: '<=', threshold: 4, period: 'weekly', unit: 'hrs', current: 3.2, status: 'met', linkedSequences: ['Inbound Demo Request'] },
  { id: 6, name: 'Sequence Completion Rate', source: 'sequence', metric: 'completion_rate', operator: '>=', threshold: 75, period: 'monthly', unit: '%', current: 62, status: 'below', linkedSequences: ['Enterprise Outbound', 'PROS | C+C Manual'] },
  { id: 7, name: 'Bounce Rate', source: 'sequence', metric: 'bounce_rate', operator: '<=', threshold: 3, period: 'weekly', unit: '%', current: 2.1, status: 'met', linkedSequences: ['All Active Sequences'] },
  { id: 8, name: 'Accounts Engaged', source: 'account', metric: 'accounts_engaged', operator: '>=', threshold: 120, period: 'monthly', unit: '', current: 98, status: 'below', linkedSequences: [] },
]

const initialMilestones = [
  { id: 1, title: 'Define ICP & Target Account List', desc: 'Finalize ideal customer profile and build 500+ account list', assignee: 'Sales Ops', stakeholder: 'VP Sales', target: '2026-06-01', status: 'done', priority: 'high', category: 'strategy', notes: 'Completed. 520 accounts identified.', completedDate: '2026-05-29' },
  { id: 2, title: 'Build Multi-Channel Cadence', desc: 'Create 10+ step sequences with email, LinkedIn, call', assignee: 'Sales Enablement', stakeholder: 'SDR Team', target: '2026-06-08', status: 'done', priority: 'high', category: 'execution', notes: '4 cadences built.', completedDate: '2026-06-07' },
  { id: 3, title: 'A/B Test & Optimize Templates', desc: 'Run tests on top 5 templates, achieve stat significance', assignee: 'Marketing', stakeholder: 'SDR Lead', target: '2026-06-30', status: 'partial', priority: 'medium', category: 'optimization', notes: '3 of 5 complete.', completedDate: null },
  { id: 4, title: 'Launch AI Agent Rules', desc: 'Configure intent triggers and AI branching', assignee: 'Revenue Ops', stakeholder: 'CRO', target: '2026-07-15', status: 'pending', priority: 'high', category: 'execution', notes: '', completedDate: null },
  { id: 5, title: 'Achieve Reply Rate Target (40%)', desc: 'Sustained 40% across active sequences for 2 weeks', assignee: 'SDR Team', stakeholder: 'VP Sales', target: '2026-08-01', status: 'pending', priority: 'critical', category: 'kpi', notes: '', completedDate: null },
  { id: 6, title: 'Quarterly Review', desc: 'Full cadence review, retire underperformers', assignee: 'Enablement', stakeholder: 'All', target: '2026-09-15', status: 'pending', priority: 'medium', category: 'strategy', notes: '', completedDate: null },
]

const metricOptions = [
  { value: 'reply_rate', label: 'Reply Rate', source: 'sequence' },
  { value: 'open_rate', label: 'Open Rate', source: 'sequence' },
  { value: 'click_rate', label: 'Click Rate', source: 'sequence' },
  { value: 'bounce_rate', label: 'Bounce Rate', source: 'sequence' },
  { value: 'meetings_booked', label: 'Meetings Booked', source: 'sequence' },
  { value: 'deliverability_rate', label: 'Deliverability Rate', source: 'sequence' },
  { value: 'completion_rate', label: 'Sequence Completion Rate', source: 'sequence' },
  { value: 'avg_response_time', label: 'Avg Response Time', source: 'sequence' },
  { value: 'prospects_contacted', label: 'Prospects Contacted', source: 'sequence' },
  { value: 'pipeline_value', label: 'Pipeline Value', source: 'account' },
  { value: 'accounts_engaged', label: 'Accounts Engaged', source: 'account' },
  { value: 'deal_conversion', label: 'Deal Conversion Rate', source: 'account' },
  { value: 'avg_deal_size', label: 'Avg Deal Size', source: 'account' },
  { value: 'win_rate', label: 'Win Rate', source: 'account' },
]

const sequences = ['All Active Sequences', 'Enterprise Outbound', 'Inbound Demo Request', 'PROS | C+C Manual', 'Pick up the Convo', 'UK Automated Reply', 'Event Follow-up']
const operators = [{ v: '>=', l: 'Greater than or equal to' }, { v: '<=', l: 'Less than or equal to' }, { v: '>', l: 'Greater than' }, { v: '<', l: 'Less than' }, { v: '==', l: 'Equal to' }]
const periods = ['daily', 'weekly', 'monthly', 'quarterly']
const priorities = ['critical', 'high', 'medium', 'low']
const priorityColor = { critical: '#dc2626', high: '#d97706', medium: '#6366f1', low: '#64748b' }

const fmtVal = (v, unit) => unit === '$' ? (v >= 1000000 ? `$${(v/1000000).toFixed(1)}M` : v >= 1000 ? `$${Math.round(v/1000)}K` : `$${v}`) : `${v}${unit}`

export default function SuccessPlan() {
  const [tab, setTab] = useState('metrics')
  const [rules, setRules] = useState(initialMetricRules)
  const [milestones, setMilestones] = useState(initialMilestones)
  const [showRuleModal, setShowRuleModal] = useState(false)
  const [showMilestoneModal, setShowMilestoneModal] = useState(false)
  const [editingRule, setEditingRule] = useState(null)
  const [editingMilestone, setEditingMilestone] = useState(null)
  const [ruleForm, setRuleForm] = useState({ name: '', source: 'sequence', metric: 'reply_rate', operator: '>=', threshold: '', period: 'weekly', unit: '%', linkedSequences: [] })
  const [milestoneForm, setMilestoneForm] = useState({ title: '', desc: '', assignee: '', stakeholder: '', target: '', priority: 'medium', category: 'execution', notes: '' })

  // Rule CRUD
  const openAddRule = () => { setEditingRule(null); setRuleForm({ name: '', source: 'sequence', metric: 'reply_rate', operator: '>=', threshold: '', period: 'weekly', unit: '%', linkedSequences: [] }); setShowRuleModal(true) }
  const openEditRule = (r) => { setEditingRule(r); setRuleForm({ name: r.name, source: r.source, metric: r.metric, operator: r.operator, threshold: r.threshold, period: r.period, unit: r.unit, linkedSequences: r.linkedSequences }); setShowRuleModal(true) }
  const saveRule = () => {
    if (!ruleForm.name || !ruleForm.threshold) return
    if (editingRule) {
      setRules(rules.map(r => r.id === editingRule.id ? { ...r, ...ruleForm, threshold: parseFloat(ruleForm.threshold) } : r))
    } else {
      setRules([...rules, { id: Date.now(), ...ruleForm, threshold: parseFloat(ruleForm.threshold), current: 0, status: 'below' }])
    }
    setShowRuleModal(false)
  }
  const deleteRule = (id) => setRules(rules.filter(r => r.id !== id))

  // Milestone CRUD
  const openAddMilestone = () => { setEditingMilestone(null); setMilestoneForm({ title: '', desc: '', assignee: '', stakeholder: '', target: '', priority: 'medium', category: 'execution', notes: '' }); setShowMilestoneModal(true) }
  const openEditMilestone = (m) => { setEditingMilestone(m); setMilestoneForm({ title: m.title, desc: m.desc, assignee: m.assignee, stakeholder: m.stakeholder, target: m.target, priority: m.priority, category: m.category, notes: m.notes }); setShowMilestoneModal(true) }
  const saveMilestone = () => {
    if (!milestoneForm.title) return
    if (editingMilestone) {
      setMilestones(milestones.map(m => m.id === editingMilestone.id ? { ...m, ...milestoneForm } : m))
    } else {
      setMilestones([...milestones, { id: Date.now(), ...milestoneForm, status: 'pending', completedDate: null }])
    }
    setShowMilestoneModal(false)
  }
  const cycleStatus = (id) => setMilestones(milestones.map(m => m.id === id ? { ...m, status: { pending: 'partial', partial: 'done', done: 'pending' }[m.status], completedDate: { pending: null, partial: new Date().toISOString().split('T')[0], done: null }[m.status] } : m))
  const deleteMilestone = (id) => setMilestones(milestones.filter(m => m.id !== id))

  const toggleSeq = (seq) => {
    setRuleForm({ ...ruleForm, linkedSequences: ruleForm.linkedSequences.includes(seq) ? ruleForm.linkedSequences.filter(s => s !== seq) : [...ruleForm.linkedSequences, seq] })
  }

  const metRules = rules.filter(r => r.status === 'met').length
  const doneM = milestones.filter(m => m.status === 'done').length
  const progress = milestones.length > 0 ? Math.round((doneM / milestones.length) * 100) : 0

  return (
    <div>
      <div className="topbar">
        <h2>Success Plan</h2>
        <div className="actions">
          <div className="view-toggle">
            <button className={tab === 'metrics' ? 'active' : ''} onClick={() => setTab('metrics')}>Metrics & Rules</button>
            <button className={tab === 'milestones' ? 'active' : ''} onClick={() => setTab('milestones')}>Milestones</button>
          </div>
          <button className="btn btn-primary" onClick={tab === 'metrics' ? openAddRule : openAddMilestone}>+ Add {tab === 'metrics' ? 'Metric Rule' : 'Milestone'}</button>
        </div>
      </div>

      <div style={{ padding: 24 }}>
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
          <div className="stat-box"><div className="value">{metRules}/{rules.length}</div><div className="label">Metrics Met</div></div>
          <div className="stat-box"><div className="value">{progress}%</div><div className="label">Milestone Progress</div></div>
          <div className="stat-box"><div className="value">{rules.filter(r => r.status === 'below' && r.source === 'sequence').length}</div><div className="label">Sequence Metrics Below</div></div>
          <div className="stat-box"><div className="value">{rules.filter(r => r.status === 'below' && r.source === 'account').length}</div><div className="label">Account Metrics Below</div></div>
          <div className="stat-box"><div className="value">{milestones.filter(m => m.status !== 'done' && new Date(m.target) < new Date()).length}</div><div className="label">Overdue Items</div></div>
        </div>

        {/* METRICS & RULES TAB */}
        {tab === 'metrics' && (
          <>
            <div className="card">
              <div className="card-header"><h3>Success Metric Rules</h3><span style={{ fontSize: 12, color: '#64748b' }}>Define how success is measured from sequences and accounts</span></div>
              <table>
                <thead><tr><th>Metric</th><th>Rule</th><th>Data Source</th><th>Period</th><th>Current</th><th>Target</th><th>Status</th><th>Linked To</th><th></th></tr></thead>
                <tbody>
                  {rules.map(r => {
                    const pct = r.operator.includes('>') ? Math.min((r.current / r.threshold) * 100, 100) : Math.min((r.threshold / (r.current || 1)) * 100, 100)
                    return (
                      <tr key={r.id}>
                        <td><strong>{r.name}</strong></td>
                        <td style={{ fontSize: 12 }}><code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>{r.metric} {r.operator} {fmtVal(r.threshold, r.unit)}</code></td>
                        <td><span className={`badge ${r.source === 'sequence' ? 'badge-blue' : 'badge-purple'}`}>{r.source}</span></td>
                        <td style={{ fontSize: 12 }}>{r.period}</td>
                        <td style={{ fontWeight: 700 }}>{fmtVal(r.current, r.unit)}</td>
                        <td style={{ color: '#64748b' }}>{fmtVal(r.threshold, r.unit)}</td>
                        <td><span className={`badge ${r.status === 'met' ? 'badge-green' : 'badge-red'}`}>{r.status === 'met' ? 'Met' : 'Below'}</span></td>
                        <td style={{ fontSize: 11, color: '#64748b', maxWidth: 140 }}>{r.linkedSequences.join(', ') || '—'}</td>
                        <td style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-sm" onClick={() => openEditRule(r)}>Edit</button>
                          <button className="btn btn-sm btn-danger" onClick={() => deleteRule(r.id)}>×</button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Visual KPI Cards */}
            <div className="card">
              <div className="card-header"><h3>Performance Overview</h3></div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 14 }}>
                {rules.map(r => {
                  const pct = r.operator.includes('>') ? Math.min((r.current / r.threshold) * 100, 120) : (r.current <= r.threshold ? 100 : Math.max(0, (r.threshold / r.current) * 100))
                  const met = r.status === 'met'
                  return (
                    <div key={r.id} style={{ padding: 14, border: '1px solid #e5e7eb', borderRadius: 10, borderLeft: `4px solid ${met ? '#16a34a' : '#dc2626'}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 12, fontWeight: 600 }}>{r.name}</span>
                        <span className={`badge ${r.source === 'sequence' ? 'badge-blue' : 'badge-purple'}`} style={{ fontSize: 9 }}>{r.source}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                        <span style={{ fontSize: 20, fontWeight: 800 }}>{fmtVal(r.current, r.unit)}</span>
                        <span style={{ fontSize: 11, color: '#94a3b8' }}>{r.operator} {fmtVal(r.threshold, r.unit)}</span>
                      </div>
                      <div className="progress-bar"><div className="fill" style={{ width: `${Math.min(pct, 100)}%`, background: met ? '#16a34a' : pct >= 70 ? '#d97706' : '#dc2626' }} /></div>
                      <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>{r.period} • {r.linkedSequences[0] || 'All'}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}

        {/* MILESTONES TAB */}
        {tab === 'milestones' && (
          <>
            <div className="card">
              <div className="card-header">
                <h3>Milestones ({doneM}/{milestones.length})</h3>
                <div className="progress-bar" style={{ width: 140 }}><div className="fill" style={{ width: `${progress}%`, background: '#16a34a' }} /></div>
              </div>
              {milestones.map(m => {
                const overdue = m.status !== 'done' && new Date(m.target) < new Date()
                return (
                  <div key={m.id} className="milestone-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 6, borderColor: overdue ? '#fecaca' : undefined }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className={`checkbox ${m.status}`} onClick={() => cycleStatus(m.id)}>{m.status === 'done' ? '✓' : m.status === 'partial' ? '◐' : ''}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontWeight: 600, fontSize: 13 }}>{m.title}</span>
                          <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: priorityColor[m.priority] + '18', color: priorityColor[m.priority], fontWeight: 700 }}>{m.priority}</span>
                          <span className="badge badge-gray" style={{ fontSize: 9 }}>{m.category}</span>
                          {overdue && <span className="badge badge-red" style={{ fontSize: 9 }}>Overdue</span>}
                        </div>
                        {m.desc && <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{m.desc}</div>}
                      </div>
                      <span style={{ fontSize: 12, color: overdue ? '#dc2626' : '#94a3b8' }}>{m.target}</span>
                      <button className="btn btn-sm" onClick={() => openEditMilestone(m)}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => deleteMilestone(m.id)}>×</button>
                    </div>
                    <div style={{ paddingLeft: 40, fontSize: 11, color: '#64748b', display: 'flex', gap: 14 }}>
                      <span>Owner: <strong>{m.assignee}</strong></span>
                      <span>Stakeholder: <strong>{m.stakeholder}</strong></span>
                      {m.notes && <span>— {m.notes}</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* RULE MODAL */}
      {showRuleModal && (
        <div className="modal-backdrop" onClick={() => setShowRuleModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ width: 600 }}>
            <h3>{editingRule ? 'Edit Metric Rule' : 'Define Metric Rule'}</h3>
            <div className="form-group"><label>Rule Name</label><input value={ruleForm.name} onChange={e => setRuleForm({ ...ruleForm, name: e.target.value })} placeholder="e.g. Reply Rate Target" /></div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label>Data Source</label>
                <select value={ruleForm.source} onChange={e => setRuleForm({ ...ruleForm, source: e.target.value })}>
                  <option value="sequence">Sequence Metrics</option>
                  <option value="account">Account / Pipeline Metrics</option>
                </select>
              </div>
              <div className="form-group">
                <label>Metric</label>
                <select value={ruleForm.metric} onChange={e => setRuleForm({ ...ruleForm, metric: e.target.value })}>
                  {metricOptions.filter(m => m.source === ruleForm.source).map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label>Condition</label>
                <select value={ruleForm.operator} onChange={e => setRuleForm({ ...ruleForm, operator: e.target.value })}>
                  {operators.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Threshold Value</label>
                <input type="number" value={ruleForm.threshold} onChange={e => setRuleForm({ ...ruleForm, threshold: e.target.value })} placeholder="e.g. 40" />
              </div>
              <div className="form-group">
                <label>Unit</label>
                <select value={ruleForm.unit} onChange={e => setRuleForm({ ...ruleForm, unit: e.target.value })}>
                  <option value="%">%</option><option value="$">$</option><option value="">Count</option><option value="hrs">Hours</option><option value="days">Days</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Measurement Period</label>
              <select value={ruleForm.period} onChange={e => setRuleForm({ ...ruleForm, period: e.target.value })}>
                {periods.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>

            {ruleForm.source === 'sequence' && (
              <div className="form-group">
                <label>Linked Sequences (which sequences feed this metric)</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                  {sequences.map(seq => (
                    <button key={seq} className={`btn btn-sm ${ruleForm.linkedSequences.includes(seq) ? 'btn-primary' : ''}`} onClick={() => toggleSeq(seq)} style={{ fontSize: 11 }}>{seq}</button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ padding: 12, background: '#f8f9fb', borderRadius: 8, marginTop: 8, fontSize: 12, color: '#475569' }}>
              <strong>Rule Summary:</strong> {ruleForm.name || '[Name]'} — Measure <code>{ruleForm.metric}</code> from {ruleForm.source} data, expect it {ruleForm.operator} {ruleForm.threshold || '?'}{ruleForm.unit}, checked {ruleForm.period}.
            </div>

            <div className="modal-actions">
              <button className="btn" onClick={() => setShowRuleModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveRule}>{editingRule ? 'Save Changes' : 'Create Rule'}</button>
            </div>
          </div>
        </div>
      )}

      {/* MILESTONE MODAL */}
      {showMilestoneModal && (
        <div className="modal-backdrop" onClick={() => setShowMilestoneModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ width: 580 }}>
            <h3>{editingMilestone ? 'Edit Milestone' : 'Add Milestone'}</h3>
            <div className="form-group"><label>Title</label><input value={milestoneForm.title} onChange={e => setMilestoneForm({ ...milestoneForm, title: e.target.value })} placeholder="What needs to be achieved?" /></div>
            <div className="form-group"><label>Description</label><textarea value={milestoneForm.desc} onChange={e => setMilestoneForm({ ...milestoneForm, desc: e.target.value })} placeholder="Success criteria, deliverables..." /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group"><label>Owner</label><input value={milestoneForm.assignee} onChange={e => setMilestoneForm({ ...milestoneForm, assignee: e.target.value })} /></div>
              <div className="form-group"><label>Stakeholder</label><input value={milestoneForm.stakeholder} onChange={e => setMilestoneForm({ ...milestoneForm, stakeholder: e.target.value })} /></div>
              <div className="form-group"><label>Target Date</label><input type="date" value={milestoneForm.target} onChange={e => setMilestoneForm({ ...milestoneForm, target: e.target.value })} /></div>
              <div className="form-group"><label>Priority</label><select value={milestoneForm.priority} onChange={e => setMilestoneForm({ ...milestoneForm, priority: e.target.value })}>{priorities.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
            </div>
            <div className="form-group"><label>Category</label><select value={milestoneForm.category} onChange={e => setMilestoneForm({ ...milestoneForm, category: e.target.value })}><option value="strategy">Strategy</option><option value="execution">Execution</option><option value="optimization">Optimization</option><option value="kpi">KPI</option></select></div>
            <div className="form-group"><label>Notes</label><textarea value={milestoneForm.notes} onChange={e => setMilestoneForm({ ...milestoneForm, notes: e.target.value })} placeholder="Progress updates, blockers..." style={{ minHeight: 60 }} /></div>
            <div className="modal-actions">
              <button className="btn" onClick={() => setShowMilestoneModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveMilestone}>{editingMilestone ? 'Save' : 'Add'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
