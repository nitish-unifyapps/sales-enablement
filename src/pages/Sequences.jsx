import { useState } from 'react'

const stepTypes = [
  { type: 'auto_email', label: 'Automated Email', icon: '○', cat: 'auto' },
  { type: 'manual_email', label: 'Manual Email', icon: '○', cat: 'manual' },
  { type: 'phone', label: 'Phone Call', icon: '○', cat: 'manual' },
  { type: 'linkedin_connect', label: 'LinkedIn Connect', icon: '○', cat: 'auto' },
  { type: 'linkedin_msg', label: 'LinkedIn Message', icon: '○', cat: 'auto' },
  { type: 'linkedin_inmail', label: 'LinkedIn InMail', icon: '○', cat: 'auto' },
  { type: 'task', label: 'Generic Task', icon: '○', cat: 'manual' },
  { type: 'ai_branch', label: 'AI Branch', icon: '○', cat: 'auto' },
]

const initialSequences = [
  { id: 1, name: 'FY26 Enterprise Outbound — VP Sales', steps: 10, days: 14, type: 'interval', tags: ['create&close', 'enterprise'], active: true, score: 74, prospects: { active: 248, paused: 12, failed: 2, bounced: 18 }, contacted: 1420, opened: 77, clicked: 6, replied: 28, owner: 'SK', lastRun: '12 min ago' },
  { id: 2, name: 'Inbound Demo Request (All Segments)', steps: 14, days: 21, type: 'interval', tags: ['inbound', 'new logo'], active: true, score: 92, prospects: { active: 154, paused: 1, failed: 4, bounced: 31 }, contacted: 1479, opened: 88, clicked: 0, replied: 62, owner: 'MT', lastRun: '12 min ago' },
  { id: 3, name: 'PROS | C+C Manual Round1 (All Segments | NAM)', steps: 17, days: 28, type: 'interval', tags: ['create&close', 'public'], active: true, score: 26, prospects: { active: 485, paused: 256, failed: 5, bounced: 2485 }, contacted: 27125, opened: 52, clicked: 0, replied: 22, owner: 'JP', lastRun: '1 hour ago' },
  { id: 4, name: 'PROS | Pick up the Convo (NAM)', steps: 14, days: 18, type: 'interval', tags: ['PUC', 'EMEA'], active: true, score: 60, prospects: { active: 502, paused: 150, failed: 8, bounced: 414 }, contacted: 10470, opened: 58, clicked: 0, replied: 31, owner: 'JP', lastRun: '22 min ago' },
  { id: 5, name: 'C+C Personalized Round1 (Sales ATL | NAM)', steps: 17, days: 28, type: 'interval', tags: ['create&close', 'public'], active: true, score: 44, prospects: { active: 425, paused: 124, failed: 19, bounced: 846 }, contacted: 10858, opened: 53, clicked: 0, replied: 24, owner: 'JP', lastRun: '1 hour ago' },
  { id: 6, name: 'UK — Automated Reply FUP', steps: 6, days: 8, type: 'interval', tags: ['EMEA', 'reply FUPs'], active: true, score: 79, prospects: { active: 2, paused: 0, failed: 2, bounced: 3 }, contacted: 222, opened: 65, clicked: 0, replied: 90, owner: 'SK', lastRun: '18 min ago' },
  { id: 7, name: 'Inbound Demo Request (Global)', steps: 14, days: 21, type: 'interval', tags: ['inbound', 'new logo'], active: true, score: 89, prospects: { active: 278, paused: 14, failed: 6, bounced: 117 }, contacted: 2514, opened: 77, clicked: 0, replied: 54, owner: 'MT', lastRun: '37 min ago' },
  { id: 8, name: 'Re-engagement — Lost Deals Q2', steps: 5, days: 21, type: 'interval', tags: ['nurture'], active: false, score: 34, prospects: { active: 0, paused: 86, failed: 3, bounced: 12 }, contacted: 640, opened: 42, clicked: 2, replied: 8, owner: 'SK', lastRun: '3 days ago' },
  { id: 9, name: 'Event Follow-up — SaaStr 2026', steps: 7, days: 10, type: 'interval', tags: ['event', 'inbound'], active: true, score: 81, prospects: { active: 320, paused: 8, failed: 1, bounced: 22 }, contacted: 1890, opened: 71, clicked: 4, replied: 38, owner: 'MT', lastRun: '45 min ago' },
  { id: 10, name: 'APAC Cold Outbound — Mid-Market', steps: 12, days: 16, type: 'interval', tags: ['APAC', 'cold'], active: true, score: 52, prospects: { active: 190, paused: 45, failed: 6, bounced: 88 }, contacted: 4200, opened: 48, clicked: 1, replied: 15, owner: 'JP', lastRun: '2 hours ago' },
]

const sampleTemplates = [
  { id: 1, name: 'CXO Value Prop — Q3', type: 'Email', subject: 'Quick question regarding {{company_industry}}', body: 'Hi {{first_name}},\n\nI noticed {{company}} recently expanded into {{industry}}...' },
  { id: 2, name: 'Follow-up After No Reply', type: 'Email', subject: 'Re: {{previous_subject}}', body: '{{first_name}}, wanted to bump this — any thoughts?' },
  { id: 3, name: 'LinkedIn Warm Connect', type: 'LinkedIn', subject: '', body: 'Hi {{first_name}}, came across your work at {{company}} — impressed by {{achievement}}. Would love to connect.' },
  { id: 4, name: 'Cold Call — Discovery', type: 'Call Script', subject: '', body: 'Opening: "Hi {{first_name}}, this is [name] from [company]..."\nPurpose: Identify pain point around {{topic}}' },
  { id: 5, name: 'Breakup Email', type: 'Email', subject: 'Closing the loop, {{first_name}}', body: 'I don\'t want to be a pest — if timing isn\'t right, no worries...' },
  { id: 6, name: 'Case Study Share', type: 'Email', subject: 'How {{similar_company}} achieved {{result}}', body: 'Hi {{first_name}},\n\nThought you\'d find this relevant...' },
  { id: 7, name: 'Objection: Budget', type: 'Email', subject: 'Re: budget concerns', body: 'Totally understand, {{first_name}}. Here\'s how other teams approach this...' },
  { id: 8, name: 'Meeting Confirmation', type: 'Email', subject: 'Confirmed: {{meeting_time}}', body: 'Looking forward to our call. Here\'s what I\'d like to cover...' },
]

const initialSteps = [
  { id: 1, type: 'auto_email', title: 'Intro Email', desc: 'Personalized intro referencing {{company_industry}}', day: 1, delay: 0, variant: true, templateId: 1, conditions: [] },
  { id: 2, type: 'linkedin_connect', title: 'LinkedIn Connection', desc: 'Connect with personalized note', day: 1, delay: 120, variant: false, templateId: 3, conditions: [] },
  { id: 3, type: 'auto_email', title: 'Follow-up #1', desc: 'Value-add content based on persona', day: 3, delay: 0, variant: true, templateId: 2, conditions: [{ type: 'if_no_reply', days: 2 }] },
  { id: 4, type: 'phone', title: 'Discovery Call Attempt', desc: 'Use discovery script. Log voicemail if no answer.', day: 4, delay: 0, variant: false, templateId: 4, conditions: [] },
  { id: 5, type: 'linkedin_msg', title: 'LinkedIn Message', desc: 'Reference email + ask for meeting', day: 5, delay: 0, variant: false, templateId: null, conditions: [{ type: 'if_connected', days: 0 }] },
  { id: 6, type: 'ai_branch', title: 'AI: Sentiment Check', desc: 'If positive → schedule meeting. If objection → insert handler. If silent → continue.', day: 6, delay: 0, variant: false, templateId: null, conditions: [] },
  { id: 7, type: 'auto_email', title: 'Case Study Email', desc: 'Send relevant case study based on {{industry}}', day: 8, delay: 0, variant: true, templateId: 6, conditions: [] },
  { id: 8, type: 'phone', title: 'Call #2 + Voicemail', desc: 'Mention LinkedIn interaction, drop voicemail', day: 10, delay: 0, variant: false, templateId: 4, conditions: [] },
  { id: 9, type: 'auto_email', title: 'Breakup Email', desc: 'Final touch — create urgency', day: 12, delay: 0, variant: false, templateId: 5, conditions: [] },
  { id: 10, type: 'task', title: 'Review & Disposition', desc: 'Mark as lost / move to nurture / escalate', day: 14, delay: 0, variant: false, templateId: null, conditions: [] },
]

const initialRules = [
  { id: 1, trigger: 'Prospect replies', action: 'Pause sequence', enabled: true },
  { id: 2, trigger: 'Meeting booked', action: 'Mark as success & finish sequence', enabled: true },
  { id: 3, trigger: 'Email bounced', action: 'Remove from sequence, flag for review', enabled: true },
  { id: 4, trigger: 'Out-of-office detected', action: 'Pause for 5 days then resume', enabled: true },
  { id: 5, trigger: 'LinkedIn accepted', action: 'Skip to LinkedIn message step', enabled: true },
  { id: 6, trigger: 'Prospect opens email 3+ times', action: 'Create urgent call task', enabled: false },
  { id: 7, trigger: 'No engagement after all steps', action: 'Move to re-engagement cadence', enabled: true },
]

const initialProspects = [
  { id: 1, name: 'Sarah Chen', company: 'Acme Corp', title: 'VP of Sales', email: 'sarah@acme.com', state: 'active', currentStep: 3, lastContacted: '2 hours ago', opened: true, clicked: true, replied: false, addedAt: 'Jun 15', owner: 'You' },
  { id: 2, name: 'James Park', company: 'Beta Inc', title: 'CTO', email: 'james@beta.io', state: 'active', currentStep: 5, lastContacted: 'Yesterday', opened: true, clicked: false, replied: false, addedAt: 'Jun 12', owner: 'You' },
  { id: 3, name: 'Mike Torres', company: 'Delta LLC', title: 'Director of Ops', email: 'mike@delta.co', state: 'finished_replied', currentStep: 2, lastContacted: '3 days ago', opened: true, clicked: true, replied: true, addedAt: 'Jun 10', owner: 'You' },
  { id: 4, name: 'Lisa Wang', company: 'Omega Co', title: 'Head of Product', email: 'lisa@omega.com', state: 'paused', currentStep: 4, lastContacted: '5 days ago', opened: true, clicked: false, replied: false, addedAt: 'Jun 14', owner: 'You' },
  { id: 5, name: 'Tom Harris', company: 'Zeta Tech', title: 'CEO', email: 'tom@zeta.io', state: 'active', currentStep: 1, lastContacted: 'Today', opened: false, clicked: false, replied: false, addedAt: 'Jun 20', owner: 'Mike T.' },
  { id: 6, name: 'Anna Lee', company: 'Sigma HR', title: 'VP Engineering', email: 'anna@sigma.com', state: 'bounced', currentStep: 1, lastContacted: 'Jun 16', opened: false, clicked: false, replied: false, addedAt: 'Jun 16', owner: 'You' },
  { id: 7, name: 'Ben Cross', company: 'Alpha Media', title: 'CMO', email: 'ben@alpha.co', state: 'active', currentStep: 7, lastContacted: '1 day ago', opened: true, clicked: true, replied: false, addedAt: 'Jun 08', owner: 'Mike T.' },
  { id: 8, name: 'Kim Yu', company: 'Theta Dev', title: 'Engineering Lead', email: 'kim@theta.dev', state: 'finished_no_reply', currentStep: 10, lastContacted: 'Jun 10', opened: true, clicked: false, replied: false, addedAt: 'Jun 01', owner: 'You' },
  { id: 9, name: 'Dave Miller', company: 'Kappa Mfg', title: 'COO', email: 'dave@kappa.com', state: 'paused_ooo', currentStep: 4, lastContacted: '4 days ago', opened: true, clicked: false, replied: false, addedAt: 'Jun 11', owner: 'You' },
  { id: 10, name: 'Ellen Marsh', company: 'Nu Corp', title: 'VP Sales', email: 'ellen@nu.co', state: 'opted_out', currentStep: 2, lastContacted: 'Jun 13', opened: true, clicked: false, replied: false, addedAt: 'Jun 13', owner: 'Mike T.' },
  { id: 11, name: 'Raj Patel', company: 'Lambda SaaS', title: 'Director Sales', email: 'raj@lambda.io', state: 'active', currentStep: 6, lastContacted: 'Today', opened: true, clicked: true, replied: false, addedAt: 'Jun 09', owner: 'You' },
  { id: 12, name: 'Nina Scott', company: 'Phi Analytics', title: 'CFO', email: 'nina@phi.com', state: 'finished_replied', currentStep: 3, lastContacted: '2 days ago', opened: true, clicked: true, replied: true, addedAt: 'Jun 07', owner: 'Mike T.' },
]


export default function Sequences() {
  const [view, setView] = useState('list')
  const [sequences, setSequences] = useState(initialSequences)
  const [steps, setSteps] = useState(initialSteps)
  const [rules, setRules] = useState(initialRules)
  const [selectedSeq, setSelectedSeq] = useState(null)
  const [showStepModal, setShowStepModal] = useState(false)
  const [showRuleModal, setShowRuleModal] = useState(false)
  const [showNewSeqModal, setShowNewSeqModal] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [editingStep, setEditingStep] = useState(null)
  const [stepForm, setStepForm] = useState({ type: 'auto_email', title: '', desc: '', day: 1, delay: 0, templateId: null, sendWindow: '8am-6pm', priority: 'normal', abVariant: '', conditions: [] })
  const [ruleForm, setRuleForm] = useState({ trigger: '', action: '' })
  const [newSeqForm, setNewSeqForm] = useState({ name: '', type: 'outbound', schedule: 'weekdays', throttle: 200, timezone: 'prospect' })
  const [dragIdx, setDragIdx] = useState(null)
  const [templatePickFor, setTemplatePickFor] = useState(null)
  const [builderTab, setBuilderTab] = useState('steps')
  const [prospects, setProspects] = useState(initialProspects)
  const [prospectFilter, setProspectFilter] = useState('all')

  const openSequence = (seq) => { setSelectedSeq(seq); setView('builder'); setBuilderTab('steps') }
  const backToList = () => { setSelectedSeq(null); setView('list') }

  // New Sequence
  const createSequence = () => {
    if (!newSeqForm.name) return
    const seq = { id: Date.now(), name: newSeqForm.name, steps: 0, days: 0, prospects: 0, active: false, replyRate: 0, meetingRate: 0 }
    setSequences([...sequences, seq])
    setSteps([])
    setShowNewSeqModal(false)
    setNewSeqForm({ name: '', type: 'outbound', schedule: 'weekdays', throttle: 200, timezone: 'prospect' })
    openSequence(seq)
  }

  // Step CRUD
  const openAddStep = (type) => {
    const st = stepTypes.find(t => t.type === type) || stepTypes[0]
    setEditingStep(null)
    setStepForm({ type: type || 'auto_email', title: st.label, desc: '', day: steps.length > 0 ? steps[steps.length - 1].day + 2 : 1, delay: 0, templateId: null, sendWindow: '8am-6pm', priority: 'normal', abVariant: '', conditions: [] })
    setShowStepModal(true)
  }
  const openEditStep = (s) => {
    setEditingStep(s)
    setStepForm({ type: s.type, title: s.title, desc: s.desc, day: s.day, delay: s.delay, templateId: s.templateId, sendWindow: '8am-6pm', priority: 'normal', abVariant: '', conditions: s.conditions || [] })
    setShowStepModal(true)
  }
  const saveStep = () => {
    if (!stepForm.title) return
    if (editingStep) {
      setSteps(steps.map(s => s.id === editingStep.id ? { ...s, type: stepForm.type, title: stepForm.title, desc: stepForm.desc, day: stepForm.day, delay: stepForm.delay, templateId: stepForm.templateId, conditions: stepForm.conditions } : s))
    } else {
      setSteps([...steps, { id: Date.now(), type: stepForm.type, title: stepForm.title, desc: stepForm.desc, day: stepForm.day, delay: stepForm.delay, variant: false, templateId: stepForm.templateId, conditions: stepForm.conditions }])
    }
    setShowStepModal(false)
  }
  const deleteStep = (id) => setSteps(steps.filter(s => s.id !== id))
  const duplicateStep = (step) => setSteps([...steps, { ...step, id: Date.now(), title: `${step.title} (copy)` }])

  // Template linking
  const pickTemplate = (stepId) => { setTemplatePickFor(stepId); setShowTemplateModal(true) }
  const selectTemplate = (tpl) => {
    if (templatePickFor === 'form') {
      setStepForm({ ...stepForm, templateId: tpl.id, desc: tpl.body.substring(0, 80) + '...' })
    } else {
      setSteps(steps.map(s => s.id === templatePickFor ? { ...s, templateId: tpl.id } : s))
    }
    setShowTemplateModal(false)
    setTemplatePickFor(null)
  }

  // Drag reorder
  const onDragStart = (idx) => setDragIdx(idx)
  const onDragOver = (e, idx) => { e.preventDefault(); if (dragIdx === null || dragIdx === idx) return; const r = [...steps]; const [m] = r.splice(dragIdx, 1); r.splice(idx, 0, m); setSteps(r); setDragIdx(idx) }
  const onDragEnd = () => setDragIdx(null)

  // Rules
  const toggleRule = (id) => setRules(rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r))
  const deleteRule = (id) => setRules(rules.filter(r => r.id !== id))
  const saveRule = () => { if (!ruleForm.trigger) return; setRules([...rules, { id: Date.now(), ...ruleForm, enabled: true }]); setShowRuleModal(false); setRuleForm({ trigger: '', action: '' }) }

  const getStepType = (type) => stepTypes.find(t => t.type === type) || stepTypes[0]
  const getTemplate = (id) => sampleTemplates.find(t => t.id === id)


  return (
    <div>
      {/* LIST VIEW */}
      {view === 'list' && (
        <>
          <div className="topbar">
            <h2>Sequences</h2>
            <div className="actions"><button className="btn btn-primary" onClick={() => setShowNewSeqModal(true)}>+ Create Sequence</button></div>
          </div>
          <div style={{ padding: 24 }}>
            <div className="stats-grid">
              <div className="stat-box"><div className="value">{sequences.length}</div><div className="label">Total Sequences</div></div>
              <div className="stat-box"><div className="value">{sequences.filter(s => s.active).length}</div><div className="label">Active</div></div>
              <div className="stat-box"><div className="value">{sequences.reduce((s, q) => s + q.prospects.active + q.prospects.paused, 0).toLocaleString()}</div><div className="label">Total Prospects</div></div>
              <div className="stat-box"><div className="value">{sequences.reduce((s, q) => s + q.contacted, 0).toLocaleString()}</div><div className="label">Total Contacted</div></div>
            </div>

            {/* Sequences Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 24 }}>
              <table>
                <thead>
                  <tr><th style={{ width: 280 }}>Name</th><th>Tags</th><th>Score</th><th>Current Prospects</th><th>Contacted</th><th>Opened</th><th>Clicked</th><th>Replied</th><th>Last Run</th><th>Owner</th><th></th></tr>
                </thead>
                <tbody>
                  {sequences.map(seq => {
                    const totalProspects = seq.prospects.active + seq.prospects.paused + seq.prospects.failed + seq.prospects.bounced
                    const scoreColor = seq.score >= 70 ? '#16a34a' : seq.score >= 40 ? '#d97706' : '#dc2626'
                    return (
                      <tr key={seq.id} style={{ cursor: 'pointer' }} onClick={() => openSequence(seq)}>
                        <td>
                          <div><strong>{seq.name}</strong></div>
                          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{seq.steps} steps by {seq.type}</div>
                          <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                            {seq.tags.map(tag => <span key={tag} style={{ fontSize: 10, padding: '1px 6px', background: '#f1f5f9', borderRadius: 10, color: '#64748b' }}>{tag}</span>)}
                          </div>
                        </td>
                        <td><span className={`badge ${seq.active ? 'badge-green' : 'badge-gray'}`}>{seq.active ? 'Active' : 'Paused'}</span></td>
                        <td>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', border: `3px solid ${scoreColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: scoreColor }}>{seq.score}</div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 10, fontSize: 12 }}>
                            <span><strong style={{ color: '#16a34a' }}>{seq.prospects.active}</strong> <span style={{ color: '#94a3b8' }}>Active</span></span>
                            <span><strong style={{ color: '#d97706' }}>{seq.prospects.paused}</strong> <span style={{ color: '#94a3b8' }}>Paused</span></span>
                            <span><strong style={{ color: '#dc2626' }}>{seq.prospects.failed}</strong> <span style={{ color: '#94a3b8' }}>Failed</span></span>
                            <span><strong style={{ color: '#64748b' }}>{seq.prospects.bounced}</strong> <span style={{ color: '#94a3b8' }}>Bounced</span></span>
                          </div>
                        </td>
                        <td style={{ fontWeight: 500 }}>{seq.contacted.toLocaleString()}</td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{seq.opened}%</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{seq.clicked}%</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{seq.replied}%</div>
                        </td>
                        <td style={{ fontSize: 12, color: '#64748b', whiteSpace: 'nowrap' }}>{seq.lastRun}</td>
                        <td>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#1e293b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>{seq.owner}</div>
                        </td>
                        <td><button className="btn btn-sm" onClick={e => { e.stopPropagation(); openSequence(seq) }}>→</button></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* All Prospects Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: 15, fontWeight: 700 }}>All Prospects in Sequences</h3>
                <span style={{ fontSize: 12, color: '#64748b' }}>{prospects.length} prospects</span>
              </div>
              <table>
                <thead>
                  <tr><th>Prospect</th><th>Company</th><th>Sequence</th><th>State</th><th>Current Step</th><th>Last Contacted</th><th>Opened</th><th>Clicked</th><th>Replied</th><th>Owner</th></tr>
                </thead>
                <tbody>
                  {prospects.map(p => {
                    const stateLabels = { active: 'Active', paused: 'Paused', paused_ooo: 'Paused (OOO)', bounced: 'Bounced', finished_replied: 'Finished (Replied)', finished_no_reply: 'Finished (No Reply)', opted_out: 'Opted Out' }
                    const stateBadge = { active: 'badge-green', paused: 'badge-yellow', paused_ooo: 'badge-yellow', bounced: 'badge-red', finished_replied: 'badge-blue', finished_no_reply: 'badge-gray', opted_out: 'badge-red' }
                    return (
                      <tr key={p.id}>
                        <td>
                          <div><strong>{p.name}</strong></div>
                          <div style={{ fontSize: 11, color: '#94a3b8' }}>{p.title}</div>
                        </td>
                        <td>{p.company}</td>
                        <td style={{ fontSize: 12 }}>{sequences[p.id % sequences.length]?.name.substring(0, 30)}...</td>
                        <td><span className={`badge ${stateBadge[p.state] || 'badge-gray'}`}>{stateLabels[p.state]}</span></td>
                        <td style={{ fontWeight: 500 }}>Step {p.currentStep}/{steps.length}</td>
                        <td style={{ fontSize: 12, color: '#64748b' }}>{p.lastContacted}</td>
                        <td style={{ textAlign: 'center' }}>{p.opened ? '●' : '○'}</td>
                        <td style={{ textAlign: 'center' }}>{p.clicked ? '●' : '○'}</td>
                        <td style={{ textAlign: 'center', color: p.replied ? '#16a34a' : 'inherit' }}>{p.replied ? '●' : '○'}</td>
                        <td style={{ fontSize: 12 }}>{p.owner}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* BUILDER VIEW */}
      {view === 'builder' && (
        <>
          <div className="topbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button className="btn btn-sm" onClick={backToList}>←</button>
              <h2>{selectedSeq?.name}</h2>
              <span className="badge badge-green">Active</span>
            </div>
            <div className="actions">
              <div className="view-toggle">
                <button className={builderTab === 'steps' ? 'active' : ''} onClick={() => setBuilderTab('steps')}>Steps</button>
                <button className={builderTab === 'prospects' ? 'active' : ''} onClick={() => setBuilderTab('prospects')}>Prospects</button>
                <button className={builderTab === 'rules' ? 'active' : ''} onClick={() => setBuilderTab('rules')}>Rules</button>
                <button className={builderTab === 'settings' ? 'active' : ''} onClick={() => setBuilderTab('settings')}>Settings</button>
              </div>
            </div>
          </div>
          <div style={{ padding: 24 }}>

            {/* STEPS TAB */}
            {builderTab === 'steps' && (
              <>
                {/* Step type palette */}
                <div className="card" style={{ padding: '14px 20px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Add Step</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {stepTypes.map(t => (
                      <button key={t.type} className="btn btn-sm" onClick={() => openAddStep(t.type)} style={{ fontSize: 12 }}>
                        + {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Steps timeline */}
                <div className="card">
                  <div className="card-header">
                    <h3>{steps.length} Steps — {steps.length > 0 ? steps[steps.length - 1].day : 0} Days</h3>
                  </div>

                  {steps.map((step, idx) => {
                    const st = getStepType(step.type)
                    const tpl = getTemplate(step.templateId)
                    const isNewDay = idx === 0 || step.day !== steps[idx - 1].day
                    return (
                      <div key={step.id}>
                        {isNewDay && (
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', padding: '14px 0 6px', borderTop: idx > 0 ? '1px solid #f1f5f9' : 'none', marginTop: idx > 0 ? 8 : 0 }}>
                            DAY {step.day}
                          </div>
                        )}
                        <div className="seq-step" draggable onDragStart={() => onDragStart(idx)} onDragOver={e => onDragOver(e, idx)} onDragEnd={onDragEnd} style={dragIdx === idx ? { opacity: 0.4 } : {}}>
                          <span className="drag-handle">⋮⋮</span>
                          <div style={{ width: 32, height: 32, borderRadius: 6, border: '2px solid #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#64748b', flexShrink: 0 }}>
                            {idx + 1}
                          </div>
                          <div className="step-body">
                            <div className="title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              {step.title}
                              <span className={`badge ${st.cat === 'auto' ? 'badge-blue' : 'badge-gray'}`} style={{ fontSize: 10 }}>{st.cat === 'auto' ? 'Auto' : 'Manual'}</span>
                              {step.variant && <span className="badge badge-purple" style={{ fontSize: 10 }}>A/B</span>}
                            </div>
                            <div className="desc">{step.desc}</div>
                            {tpl && (
                              <div style={{ marginTop: 4, fontSize: 11, color: '#475569', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ color: '#94a3b8' }}>Template:</span>
                                <strong>{tpl.name}</strong>
                                {tpl.subject && <span style={{ color: '#94a3b8' }}>— "{tpl.subject}"</span>}
                              </div>
                            )}
                            {step.conditions?.length > 0 && (
                              <div style={{ marginTop: 4, fontSize: 11, color: '#6366f1' }}>
                                Condition: {step.conditions[0].type === 'if_no_reply' ? `Only if no reply after ${step.conditions[0].days}d` : step.conditions[0].type === 'if_connected' ? 'Only if LinkedIn connected' : step.conditions[0].type}
                              </div>
                            )}
                          </div>
                          <div className="step-meta">
                            {step.delay > 0 && <span className="delay">+{step.delay}m</span>}
                            <span className="delay">Day {step.day}</span>
                            <div className="step-actions">
                              <button onClick={() => pickTemplate(step.id)} title="Link template"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></button>
                              <button onClick={() => openEditStep(step)} title="Edit"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                              <button onClick={() => duplicateStep(step)} title="Duplicate"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
                              <button onClick={() => deleteStep(step.id)} title="Delete"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div className="add-step-bar" onClick={() => openAddStep('auto_email')}>+ Add Step</div>
                </div>
              </>
            )}

            {/* PROSPECTS TAB */}
            {builderTab === 'prospects' && (() => {
              const stateLabels = { active: 'Active', paused: 'Paused', paused_ooo: 'Paused (OOO)', bounced: 'Bounced', finished_replied: 'Finished (Replied)', finished_no_reply: 'Finished (No Reply)', opted_out: 'Opted Out' }
              const stateBadge = { active: 'badge-green', paused: 'badge-yellow', paused_ooo: 'badge-yellow', bounced: 'badge-red', finished_replied: 'badge-blue', finished_no_reply: 'badge-gray', opted_out: 'badge-red' }
              const filteredProspects = prospects.filter(p => prospectFilter === 'all' || p.state === prospectFilter || (prospectFilter === 'finished' && p.state.startsWith('finished')))
              const counts = { all: prospects.length, active: prospects.filter(p => p.state === 'active').length, paused: prospects.filter(p => p.state.startsWith('paused')).length, finished: prospects.filter(p => p.state.startsWith('finished')).length, bounced: prospects.filter(p => p.state === 'bounced').length, opted_out: prospects.filter(p => p.state === 'opted_out').length }
              return (
                <>
                  {/* Prospect overview stats */}
                  <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                    <div className="stat-box"><div className="value">{prospects.length}</div><div className="label">Total Prospects</div></div>
                    <div className="stat-box"><div className="value">{counts.active}</div><div className="label">Active</div></div>
                    <div className="stat-box"><div className="value">{prospects.filter(p => p.replied).length}</div><div className="label">Replied</div></div>
                    <div className="stat-box"><div className="value">{prospects.filter(p => p.opened).length}</div><div className="label">Opened</div></div>
                    <div className="stat-box"><div className="value">{prospects.filter(p => p.clicked).length}</div><div className="label">Clicked</div></div>
                  </div>

                  {/* State filter tabs */}
                  <div className="card" style={{ padding: '12px 20px' }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {[['all', `All (${counts.all})`], ['active', `Active (${counts.active})`], ['paused', `Paused (${counts.paused})`], ['finished', `Finished (${counts.finished})`], ['bounced', `Bounced (${counts.bounced})`], ['opted_out', `Opted Out (${counts.opted_out})`]].map(([key, label]) => (
                        <button key={key} className={`btn btn-sm ${prospectFilter === key ? 'btn-primary' : ''}`} onClick={() => setProspectFilter(key)}>{label}</button>
                      ))}
                    </div>
                  </div>

                  {/* Prospects table */}
                  <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table>
                      <thead>
                        <tr><th>Prospect</th><th>Company</th><th>State</th><th>Current Step</th><th>Last Contacted</th><th>Opened</th><th>Clicked</th><th>Replied</th><th>Added</th><th></th></tr>
                      </thead>
                      <tbody>
                        {filteredProspects.map(p => (
                          <tr key={p.id}>
                            <td>
                              <div><strong>{p.name}</strong></div>
                              <div style={{ fontSize: 11, color: '#94a3b8' }}>{p.title} — {p.email}</div>
                            </td>
                            <td>{p.company}</td>
                            <td><span className={`badge ${stateBadge[p.state] || 'badge-gray'}`}>{stateLabels[p.state] || p.state}</span></td>
                            <td style={{ fontWeight: 500 }}>Step {p.currentStep}/{steps.length}</td>
                            <td style={{ fontSize: 12, color: '#64748b' }}>{p.lastContacted}</td>
                            <td style={{ textAlign: 'center' }}>{p.opened ? '●' : '○'}</td>
                            <td style={{ textAlign: 'center' }}>{p.clicked ? '●' : '○'}</td>
                            <td style={{ textAlign: 'center', color: p.replied ? '#16a34a' : 'inherit', fontWeight: p.replied ? 700 : 400 }}>{p.replied ? '●' : '○'}</td>
                            <td style={{ fontSize: 11, color: '#94a3b8' }}>{p.addedAt}</td>
                            <td>
                              <select defaultValue="" onChange={e => { if (e.target.value === 'pause') setProspects(prospects.map(pr => pr.id === p.id ? { ...pr, state: 'paused' } : pr)); if (e.target.value === 'resume') setProspects(prospects.map(pr => pr.id === p.id ? { ...pr, state: 'active' } : pr)); if (e.target.value === 'finish') setProspects(prospects.map(pr => pr.id === p.id ? { ...pr, state: 'finished_no_reply' } : pr)); if (e.target.value === 'remove') setProspects(prospects.filter(pr => pr.id !== p.id)); e.target.value = '' }} style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '4px 8px', fontSize: 11 }}>
                                <option value="">Actions</option>
                                {p.state === 'active' && <option value="pause">Pause</option>}
                                {(p.state === 'paused' || p.state === 'paused_ooo') && <option value="resume">Resume</option>}
                                <option value="finish">Mark Finished</option>
                                <option value="remove">Remove</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Step-by-step engagement breakdown */}
                  <div className="card">
                    <div className="card-header"><h3>Engagement by Step</h3></div>
                    {steps.map((step, idx) => {
                      const atStep = prospects.filter(p => p.currentStep === idx + 1 && p.state === 'active').length
                      const passedStep = prospects.filter(p => p.currentStep > idx + 1 || p.state.startsWith('finished')).length
                      const total = prospects.length
                      return (
                        <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                          <span style={{ width: 24, fontSize: 11, fontWeight: 700, color: '#64748b' }}>{idx + 1}</span>
                          <span style={{ width: 160, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{step.title}</span>
                          <div style={{ flex: 1, height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${total > 0 ? (passedStep / total) * 100 : 0}%`, background: '#6366f1', borderRadius: 3 }} />
                          </div>
                          <span style={{ width: 80, fontSize: 11, color: '#64748b', textAlign: 'right' }}>{passedStep} passed</span>
                          <span style={{ width: 60, fontSize: 11, color: atStep > 0 ? '#6366f1' : '#94a3b8', fontWeight: atStep > 0 ? 600 : 400 }}>{atStep} here</span>
                        </div>
                      )
                    })}
                  </div>
                </>
              )
            })()}

            {/* RULES TAB */}
            {builderTab === 'rules' && (
              <>
                <div className="card">
                  <div className="card-header">
                    <h3>Automation Rules</h3>
                    <button className="btn btn-sm btn-primary" onClick={() => { setRuleForm({ trigger: '', action: '' }); setShowRuleModal(true) }}>+ Add Rule</button>
                  </div>
                  <table>
                    <thead><tr><th>When (Trigger)</th><th></th><th>Then (Action)</th><th>Active</th><th></th></tr></thead>
                    <tbody>
                      {rules.map(r => (
                        <tr key={r.id}>
                          <td><strong>{r.trigger}</strong></td>
                          <td style={{ color: '#94a3b8' }}>→</td>
                          <td>{r.action}</td>
                          <td><div className={`toggle ${r.enabled ? 'on' : ''}`} onClick={() => toggleRule(r.id)} /></td>
                          <td><button className="btn btn-sm btn-danger" onClick={() => deleteRule(r.id)}>×</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="card">
                  <div className="card-header"><h3>Exit Conditions</h3></div>
                  {['Prospect replies to any email', 'Meeting is booked', 'All steps completed', 'Manually removed by rep', 'Added to another sequence'].map((c, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#f8f9fb', borderRadius: 8, marginBottom: 6 }}>
                      <div className="toggle on" />
                      <span style={{ fontSize: 13 }}>{c}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* SETTINGS TAB */}
            {builderTab === 'settings' && (
              <div className="card">
                <div className="card-header"><h3>Sequence Settings</h3></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div className="form-group">
                    <label>Sequence Name</label>
                    <input defaultValue={selectedSeq?.name} />
                  </div>
                  <div className="form-group">
                    <label>Sequence Type</label>
                    <select defaultValue="outbound"><option value="outbound">Outbound Prospecting</option><option value="inbound">Inbound Follow-up</option><option value="nurture">Re-engagement / Nurture</option><option value="event">Event Follow-up</option></select>
                  </div>
                  <div className="form-group">
                    <label>Send Window</label>
                    <select><option>8:00 AM — 6:00 PM (Prospect Timezone)</option><option>9:00 AM — 5:00 PM (Prospect Timezone)</option><option>Custom Window</option></select>
                  </div>
                  <div className="form-group">
                    <label>Active Days</label>
                    <select><option>Weekdays Only (Mon–Fri)</option><option>All Days</option><option>Custom</option></select>
                  </div>
                  <div className="form-group">
                    <label>Email Throttle (per day)</label>
                    <input type="number" defaultValue={200} />
                  </div>
                  <div className="form-group">
                    <label>LinkedIn Actions (per day)</label>
                    <input type="number" defaultValue={50} />
                  </div>
                  <div className="form-group">
                    <label>Timezone Handling</label>
                    <select><option>Send in prospect's timezone</option><option>Send in sender's timezone</option></select>
                  </div>
                  <div className="form-group">
                    <label>Reply Detection</label>
                    <select><option>Auto-pause on any reply</option><option>Pause only on positive reply</option><option>Never auto-pause</option></select>
                  </div>
                </div>
                <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#f8f9fb', borderRadius: 8 }}>
                    <span style={{ fontSize: 13 }}>Pause on email bounce</span><div className="toggle on" />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#f8f9fb', borderRadius: 8 }}>
                    <span style={{ fontSize: 13 }}>Skip weekends for delays</span><div className="toggle on" />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#f8f9fb', borderRadius: 8 }}>
                    <span style={{ fontSize: 13 }}>Auto-detect out-of-office & pause</span><div className="toggle on" />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#f8f9fb', borderRadius: 8 }}>
                    <span style={{ fontSize: 13 }}>Exclude prospects already in active sequence</span><div className="toggle" />
                  </div>
                </div>
                <div style={{ marginTop: 20, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button className="btn">Cancel</button>
                  <button className="btn btn-primary">Save Settings</button>
                </div>
              </div>
            )}

          </div>
        </>
      )}

      {/* NEW SEQUENCE MODAL */}
      {showNewSeqModal && (
        <div className="modal-backdrop" onClick={() => setShowNewSeqModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Create New Sequence</h3>
            <div className="form-group">
              <label>Sequence Name</label>
              <input value={newSeqForm.name} onChange={e => setNewSeqForm({ ...newSeqForm, name: e.target.value })} placeholder="e.g. Enterprise Outbound — CTO" />
            </div>
            <div className="form-group">
              <label>Type</label>
              <select value={newSeqForm.type} onChange={e => setNewSeqForm({ ...newSeqForm, type: e.target.value })}>
                <option value="outbound">Outbound Prospecting</option>
                <option value="inbound">Inbound Follow-up</option>
                <option value="nurture">Re-engagement / Nurture</option>
                <option value="event">Event Follow-up</option>
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label>Send Window</label>
                <select value={newSeqForm.schedule} onChange={e => setNewSeqForm({ ...newSeqForm, schedule: e.target.value })}>
                  <option value="weekdays">Weekdays only</option>
                  <option value="all">All days</option>
                </select>
              </div>
              <div className="form-group">
                <label>Timezone</label>
                <select value={newSeqForm.timezone} onChange={e => setNewSeqForm({ ...newSeqForm, timezone: e.target.value })}>
                  <option value="prospect">Prospect timezone</option>
                  <option value="sender">Sender timezone</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Daily Email Throttle</label>
              <input type="number" value={newSeqForm.throttle} onChange={e => setNewSeqForm({ ...newSeqForm, throttle: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={() => setShowNewSeqModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={createSequence}>Create Sequence</button>
            </div>
          </div>
        </div>
      )}

      {/* STEP EDITOR MODAL */}
      {showStepModal && (
        <div className="modal-backdrop" onClick={() => setShowStepModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ width: 600 }}>
            <h3>{editingStep ? 'Edit Step' : 'Add Step'}</h3>
            <div className="form-group">
              <label>Step Type</label>
              <select value={stepForm.type} onChange={e => setStepForm({ ...stepForm, type: e.target.value })}>
                {stepTypes.map(t => <option key={t.type} value={t.type}>{t.label} ({t.cat})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Step Title</label>
              <input value={stepForm.title} onChange={e => setStepForm({ ...stepForm, title: e.target.value })} placeholder="e.g. Intro Email, Follow-up Call" />
            </div>
            <div className="form-group">
              <label>Description / Instructions</label>
              <textarea value={stepForm.desc} onChange={e => setStepForm({ ...stepForm, desc: e.target.value })} placeholder="What should happen in this step? Content, instructions, or notes for the rep..." />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label>Day (in sequence)</label>
                <input type="number" min="1" value={stepForm.day} onChange={e => setStepForm({ ...stepForm, day: parseInt(e.target.value) || 1 })} />
              </div>
              <div className="form-group">
                <label>Delay (min after prev)</label>
                <input type="number" min="0" value={stepForm.delay} onChange={e => setStepForm({ ...stepForm, delay: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select value={stepForm.priority} onChange={e => setStepForm({ ...stepForm, priority: e.target.value })}>
                  <option value="normal">Normal</option>
                  <option value="high">High — send first</option>
                  <option value="low">Low — send last</option>
                </select>
              </div>
            </div>

            {/* Template Linking */}
            <div className="form-group">
              <label>Template</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1, padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, background: '#f8f9fb', color: stepForm.templateId ? '#1e293b' : '#94a3b8' }}>
                  {stepForm.templateId ? getTemplate(stepForm.templateId)?.name : 'No template selected'}
                </div>
                <button className="btn btn-sm" onClick={() => { setTemplatePickFor('form'); setShowTemplateModal(true) }}>Browse</button>
                {stepForm.templateId && <button className="btn btn-sm" onClick={() => setStepForm({ ...stepForm, templateId: null })}>Clear</button>}
              </div>
            </div>

            {/* Conditions */}
            <div className="form-group">
              <label>Conditions (optional)</label>
              <select value={stepForm.conditions.length > 0 ? stepForm.conditions[0].type : ''} onChange={e => setStepForm({ ...stepForm, conditions: e.target.value ? [{ type: e.target.value, days: 2 }] : [] })}>
                <option value="">No condition — always execute</option>
                <option value="if_no_reply">Only if no reply to previous email</option>
                <option value="if_no_open">Only if previous email not opened</option>
                <option value="if_connected">Only if LinkedIn connected</option>
                <option value="if_opened">Only if email was opened</option>
                <option value="if_clicked">Only if link was clicked</option>
              </select>
            </div>

            {/* A/B Variant */}
            <div className="form-group">
              <label>A/B Variant (optional — leave empty for single version)</label>
              <textarea value={stepForm.abVariant} onChange={e => setStepForm({ ...stepForm, abVariant: e.target.value })} placeholder="Alternative message for B variant..." style={{ minHeight: 60 }} />
            </div>

            <div className="modal-actions">
              <button className="btn" onClick={() => setShowStepModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveStep}>{editingStep ? 'Save Changes' : 'Add Step'}</button>
            </div>
          </div>
        </div>
      )}

      {/* RULE MODAL */}
      {showRuleModal && (
        <div className="modal-backdrop" onClick={() => setShowRuleModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Add Automation Rule</h3>
            <div className="form-group">
              <label>When (Trigger)</label>
              <select value={ruleForm.trigger} onChange={e => setRuleForm({ ...ruleForm, trigger: e.target.value })}>
                <option value="">Select trigger...</option>
                <option>Prospect replies</option>
                <option>Email bounced</option>
                <option>Email opened 3+ times</option>
                <option>LinkedIn connection accepted</option>
                <option>Meeting booked</option>
                <option>Out-of-office detected</option>
                <option>No engagement after X days</option>
                <option>Prospect clicks link</option>
              </select>
            </div>
            <div className="form-group">
              <label>Then (Action)</label>
              <select value={ruleForm.action} onChange={e => setRuleForm({ ...ruleForm, action: e.target.value })}>
                <option value="">Select action...</option>
                <option>Pause sequence</option>
                <option>Finish sequence (success)</option>
                <option>Remove from sequence</option>
                <option>Skip to next step</option>
                <option>Create urgent task</option>
                <option>Move to another sequence</option>
                <option>Send notification to owner</option>
                <option>Pause for X days then resume</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={() => setShowRuleModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveRule}>Add Rule</button>
            </div>
          </div>
        </div>
      )}

      {/* TEMPLATE PICKER MODAL */}
      {showTemplateModal && (
        <div className="modal-backdrop" onClick={() => setShowTemplateModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ width: 600 }}>
            <h3>Select Template</h3>
            <input className="search-box" placeholder="Search templates..." style={{ marginBottom: 16 }} />
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              {sampleTemplates.map(tpl => (
                <div key={tpl.id} onClick={() => selectTemplate(tpl)} style={{ padding: '14px 16px', border: '1px solid #e5e7eb', borderRadius: 8, marginBottom: 8, cursor: 'pointer', transition: 'all .1s' }} onMouseOver={e => e.currentTarget.style.borderColor = '#6366f1'} onMouseOut={e => e.currentTarget.style.borderColor = '#e5e7eb'}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{tpl.name}</div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{tpl.type}{tpl.subject && ` — "${tpl.subject}"`}</div>
                    </div>
                    <span className="badge badge-gray">{tpl.type}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#475569', marginTop: 8, background: '#f8f9fb', padding: '8px 10px', borderRadius: 6, whiteSpace: 'pre-wrap', maxHeight: 60, overflow: 'hidden' }}>{tpl.body}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
