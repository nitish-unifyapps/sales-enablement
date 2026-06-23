import { useState, useRef, useEffect } from 'react'
import Copilot from './Copilot'

const initialMetricRules = [
  { id: 1, name: 'Reply Rate', source: 'sequence', metric: 'reply_rate', operator: '>=', threshold: 40, unit: '%', current: 34, status: 'below', period: 'weekly' },
  { id: 2, name: 'Meetings Booked', source: 'sequence', metric: 'meetings_booked', operator: '>=', threshold: 80, unit: '', current: 68, status: 'below', period: 'monthly' },
  { id: 3, name: 'Pipeline Generated', source: 'account', metric: 'pipeline_value', operator: '>=', threshold: 1500000, unit: '$', current: 1200000, status: 'below', period: 'quarterly' },
  { id: 4, name: 'Email Deliverability', source: 'sequence', metric: 'deliverability_rate', operator: '>=', threshold: 98, unit: '%', current: 96.2, status: 'below', period: 'daily' },
  { id: 5, name: 'Avg Response Time', source: 'sequence', metric: 'avg_response_time', operator: '<=', threshold: 4, unit: 'hrs', current: 3.2, status: 'met', period: 'weekly' },
  { id: 6, name: 'Bounce Rate', source: 'sequence', metric: 'bounce_rate', operator: '<=', threshold: 3, unit: '%', current: 2.1, status: 'met', period: 'weekly' },
]

const initialMilestones = [
  { id: 1, title: 'Define ICP & Target Account List', assignee: 'Sales Ops', target: '2026-06-01', status: 'done', priority: 'high' },
  { id: 2, title: 'Build Multi-Channel Cadence', assignee: 'Enablement', target: '2026-06-08', status: 'done', priority: 'high' },
  { id: 3, title: 'A/B Test & Optimize Templates', assignee: 'Marketing', target: '2026-06-30', status: 'partial', priority: 'medium' },
  { id: 4, title: 'Launch AI Agent Rules', assignee: 'Revenue Ops', target: '2026-07-15', status: 'pending', priority: 'high' },
  { id: 5, title: 'Achieve 40% Reply Rate', assignee: 'SDR Team', target: '2026-08-01', status: 'pending', priority: 'critical' },
  { id: 6, title: 'Quarterly Review', assignee: 'Enablement', target: '2026-09-15', status: 'pending', priority: 'medium' },
]

const fmtVal = (v, unit) => unit === '$' ? (v >= 1000000 ? `$${(v/1000000).toFixed(1)}M` : `$${Math.round(v/1000)}K`) : `${v}${unit}`

export default function SuccessPlan() {
  const [rules, setRules] = useState(initialMetricRules)
  const [milestones, setMilestones] = useState(initialMilestones)
  const [copilotOpen, setCopilotOpen] = useState(true)
  const [showRuleModal, setShowRuleModal] = useState(false)
  const [showMilestoneModal, setShowMilestoneModal] = useState(false)
  const [editingRule, setEditingRule] = useState(null)
  const [editingMilestone, setEditingMilestone] = useState(null)
  const [ruleForm, setRuleForm] = useState({ name: '', source: 'sequence', metric: '', operator: '>=', threshold: 0, unit: '%', period: 'weekly' })
  const [milestoneForm, setMilestoneForm] = useState({ title: '', assignee: '', target: '', priority: 'medium' })
  const [chatMessages, setChatMessages] = useState([{ role: 'ai', text: 'I can help manage your success plan. Ask me about metric status, add new rules, or check milestone progress.' }])
  const [chatInput, setChatInput] = useState('')
  const chatEndRef = useRef(null)

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [chatMessages])

  const handleChat = () => {
    if (!chatInput.trim()) return
    const msg = chatInput.trim()
    setChatMessages(prev => [...prev, { role: 'user', text: msg }])
    setChatInput('')
    const lower = msg.toLowerCase()
    setTimeout(() => {
      let reply = ''
      if (lower.includes('below') || lower.includes('risk') || lower.includes('status')) {
        const below = rules.filter(r => r.status === 'below')
        reply = `${below.length} metrics are below target:\n${below.map(r => `• ${r.name}: ${fmtVal(r.current, r.unit)} (target: ${fmtVal(r.threshold, r.unit)})`).join('\n')}`
      } else if (lower.includes('add') && lower.includes('rule')) {
        reply = 'To add a metric rule, I need:\n1. Metric name\n2. Target value\n3. Measurement period\n\nOr click the + button in the metrics section.'
      } else if (lower.includes('milestone') || lower.includes('progress')) {
        const done = milestones.filter(m => m.status === 'done').length
        reply = `Milestone progress: ${done}/${milestones.length} complete (${Math.round(done/milestones.length*100)}%).\n\nOverdue: ${milestones.filter(m => m.status !== 'done' && new Date(m.target) < new Date()).length}`
      } else if (lower.includes('suggest') || lower.includes('improve')) {
        reply = 'Suggestions:\n• Reply rate (34%) is 6% below target — consider A/B testing subject lines\n• Meetings (68/80) — add more call steps to sequences\n• Pipeline is 80% to goal — on track if current velocity holds'
      } else {
        reply = "I can help with:\n• \"What metrics are below target?\"\n• \"Show milestone progress\"\n• \"Suggest improvements\"\n• \"Add a new metric rule\""
      }
      setChatMessages(prev => [...prev, { role: 'ai', text: reply }])
    }, 400)
  }

  const cycleStatus = (id) => setMilestones(milestones.map(m => m.id === id ? { ...m, status: { pending: 'partial', partial: 'done', done: 'pending' }[m.status] } : m))
  const metRules = rules.filter(r => r.status === 'met').length

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Copilot */}
      {copilotOpen && (
        <div style={{ width: 300, borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', background: '#fff', flexShrink: 0 }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Success Copilot</div>
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
              {['What metrics are below target?', 'Show milestone progress', 'Suggest improvements', 'Add a new metric rule'].map((s, i) => (
                <button key={i} onClick={() => setChatInput(s)} style={{ textAlign: 'left', padding: '6px 10px', background: '#f8f9fb', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 10, color: '#475569', cursor: 'pointer' }}>{s}</button>
              ))}
            </div>
          )}
          <div style={{ padding: '8px 12px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: 6 }}>
            <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleChat()} placeholder="Ask about metrics..." style={{ flex: 1, padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 11 }} />
            <button className="btn btn-primary" onClick={handleChat} style={{ padding: '8px 10px', fontSize: 11 }}>→</button>
          </div>
        </div>
      )}

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="topbar" style={{ position: 'static' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {!copilotOpen && <button className="btn btn-sm" onClick={() => setCopilotOpen(true)}>AI</button>}
            <h2 style={{ fontSize: 15 }}>Success Plan</h2>
          </div>
          <span style={{ fontSize: 12, color: '#64748b' }}>{metRules}/{rules.length} metrics met</span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {/* Performance Overview - KPI cards at top */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, marginBottom: 24 }}>
            {rules.map(r => {
              const pct = r.operator.includes('>') ? Math.min((r.current / r.threshold) * 100, 100) : (r.current <= r.threshold ? 100 : Math.max(0, (r.threshold / r.current) * 100))
              const met = r.status === 'met'
              return (
                <div key={r.id} style={{ padding: 16, background: '#fff', border: `1px solid ${met ? '#dcfce7' : '#e5e7eb'}`, borderRadius: 10, borderLeft: `4px solid ${met ? '#16a34a' : pct >= 70 ? '#d97706' : '#dc2626'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{r.name}</span>
                    <span style={{ fontSize: 9, color: '#94a3b8' }}>{r.period} • {r.source}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                    <span style={{ fontSize: 20, fontWeight: 800 }}>{fmtVal(r.current, r.unit)}</span>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>{r.operator} {fmtVal(r.threshold, r.unit)}</span>
                  </div>
                  <div style={{ height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: met ? '#16a34a' : pct >= 70 ? '#d97706' : '#dc2626', borderRadius: 3 }} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Metric Rules Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700 }}>Metric Rules</h3>
              <button className="btn btn-sm btn-primary" onClick={() => setShowRuleModal(true)}>+ Add Rule</button>
            </div>
            <table>
              <thead><tr><th>Metric</th><th>Rule</th><th>Source</th><th>Period</th><th>Current</th><th>Target</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {rules.map(r => (
                  <tr key={r.id}>
                    <td><strong>{r.name}</strong></td>
                    <td style={{ fontSize: 11 }}><code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>{r.metric} {r.operator} {fmtVal(r.threshold, r.unit)}</code></td>
                    <td><span className={`badge ${r.source === 'sequence' ? 'badge-blue' : 'badge-purple'}`}>{r.source}</span></td>
                    <td style={{ fontSize: 12 }}>{r.period}</td>
                    <td style={{ fontWeight: 600 }}>{fmtVal(r.current, r.unit)}</td>
                    <td style={{ color: '#64748b' }}>{fmtVal(r.threshold, r.unit)}</td>
                    <td><span className={`badge ${r.status === 'met' ? 'badge-green' : 'badge-red'}`}>{r.status === 'met' ? 'Met' : 'Below'}</span></td>
                    <td><button className="btn btn-sm" onClick={() => { setEditingRule(r); setRuleForm({ name: r.name, source: r.source, metric: r.metric, operator: r.operator, threshold: r.threshold, unit: r.unit, period: r.period }); setShowRuleModal(true) }}>Edit</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Milestones */}
          <div className="card">
            <div className="card-header">
              <h3>Milestones ({milestones.filter(m => m.status === 'done').length}/{milestones.length})</h3>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ width: 100, height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(milestones.filter(m => m.status === 'done').length / milestones.length) * 100}%`, background: '#16a34a', borderRadius: 3 }} />
                </div>
                <button className="btn btn-sm btn-primary" onClick={() => { setEditingMilestone(null); setMilestoneForm({ title: '', assignee: '', target: '', priority: 'medium' }); setShowMilestoneModal(true) }}>+ Add</button>
              </div>
            </div>
            {milestones.map(m => {
              const overdue = m.status !== 'done' && new Date(m.target) < new Date()
              return (
                <div key={m.id} className="milestone-item" style={{ borderColor: overdue ? '#fecaca' : undefined }}>
                  <div className={`checkbox ${m.status}`} onClick={() => cycleStatus(m.id)}>{m.status === 'done' ? '✓' : m.status === 'partial' ? '◐' : ''}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{m.title}</span>
                      {overdue && <span className="badge badge-red" style={{ fontSize: 9 }}>Overdue</span>}
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{m.assignee} • {m.target}</div>
                  </div>
                  <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: m.priority === 'critical' ? '#fee2e2' : m.priority === 'high' ? '#fef9c3' : '#f1f5f9', color: m.priority === 'critical' ? '#dc2626' : m.priority === 'high' ? '#a16207' : '#64748b', fontWeight: 600 }}>{m.priority}</span>
                  <button className="btn btn-sm" onClick={() => { setEditingMilestone(m); setMilestoneForm({ title: m.title, assignee: m.assignee, target: m.target, priority: m.priority }); setShowMilestoneModal(true) }}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => setMilestones(milestones.filter(x => x.id !== m.id))}>×</button>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Rule Modal */}
      {showRuleModal && (
        <div className="modal-backdrop" onClick={() => setShowRuleModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{editingRule ? 'Edit Metric Rule' : 'Add Metric Rule'}</h3>
            <div className="form-group"><label>Name</label><input value={ruleForm.name} onChange={e => setRuleForm({ ...ruleForm, name: e.target.value })} placeholder="e.g. Reply Rate Target" /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group"><label>Source</label><select value={ruleForm.source} onChange={e => setRuleForm({ ...ruleForm, source: e.target.value })}><option value="sequence">Sequence</option><option value="account">Account</option></select></div>
              <div className="form-group"><label>Metric</label><input value={ruleForm.metric} onChange={e => setRuleForm({ ...ruleForm, metric: e.target.value })} placeholder="e.g. reply_rate" /></div>
              <div className="form-group"><label>Operator</label><select value={ruleForm.operator} onChange={e => setRuleForm({ ...ruleForm, operator: e.target.value })}><option value=">=">≥</option><option value="<=">≤</option><option value=">">{'>'}</option><option value="<">{'<'}</option></select></div>
              <div className="form-group"><label>Threshold</label><input type="number" value={ruleForm.threshold} onChange={e => setRuleForm({ ...ruleForm, threshold: parseFloat(e.target.value) || 0 })} /></div>
              <div className="form-group"><label>Unit</label><select value={ruleForm.unit} onChange={e => setRuleForm({ ...ruleForm, unit: e.target.value })}><option value="%">%</option><option value="$">$</option><option value="">Count</option><option value="hrs">Hours</option></select></div>
              <div className="form-group"><label>Period</label><select value={ruleForm.period} onChange={e => setRuleForm({ ...ruleForm, period: e.target.value })}><option>daily</option><option>weekly</option><option>monthly</option><option>quarterly</option></select></div>
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={() => setShowRuleModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => { if (!ruleForm.name) return; if (editingRule) { setRules(rules.map(r => r.id === editingRule.id ? { ...r, ...ruleForm } : r)) } else { setRules([...rules, { id: Date.now(), ...ruleForm, current: 0, status: 'below' }]) } setShowRuleModal(false); setEditingRule(null) }}>{editingRule ? 'Save' : 'Add'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Milestone Modal */}
      {showMilestoneModal && (
        <div className="modal-backdrop" onClick={() => setShowMilestoneModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{editingMilestone ? 'Edit Milestone' : 'Add Milestone'}</h3>
            <div className="form-group"><label>Title</label><input value={milestoneForm.title} onChange={e => setMilestoneForm({ ...milestoneForm, title: e.target.value })} placeholder="What needs to be achieved?" /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group"><label>Owner</label><input value={milestoneForm.assignee} onChange={e => setMilestoneForm({ ...milestoneForm, assignee: e.target.value })} /></div>
              <div className="form-group"><label>Target Date</label><input type="date" value={milestoneForm.target} onChange={e => setMilestoneForm({ ...milestoneForm, target: e.target.value })} /></div>
              <div className="form-group"><label>Priority</label><select value={milestoneForm.priority} onChange={e => setMilestoneForm({ ...milestoneForm, priority: e.target.value })}><option value="critical">Critical</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></div>
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={() => setShowMilestoneModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => { if (!milestoneForm.title) return; if (editingMilestone) { setMilestones(milestones.map(m => m.id === editingMilestone.id ? { ...m, ...milestoneForm } : m)) } else { setMilestones([...milestones, { id: Date.now(), ...milestoneForm, status: 'pending' }]) } setShowMilestoneModal(false); setEditingMilestone(null) }}>{editingMilestone ? 'Save' : 'Add'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
