import { useState, useRef, useEffect } from 'react'

const stepTypes = [
  { type: 'auto_email', label: 'Email', cat: 'auto' },
  { type: 'manual_email', label: 'Manual Email', cat: 'manual' },
  { type: 'phone', label: 'Call', cat: 'manual' },
  { type: 'linkedin_connect', label: 'LinkedIn', cat: 'auto' },
  { type: 'linkedin_msg', label: 'LinkedIn DM', cat: 'auto' },
  { type: 'task', label: 'Task', cat: 'manual' },
  { type: 'ai_branch', label: 'AI Branch', cat: 'auto' },
  { type: 'condition', label: 'Condition', cat: 'auto' },
]

const initialSequences = [
  { id: 1, name: 'FY26 Enterprise Outbound — VP Sales', steps: 10, days: 14, tags: ['enterprise'], active: true, score: 74, prospects: { active: 248, paused: 12 }, contacted: 1420, opened: 77, replied: 28, owner: 'SK', lastRun: '12 min ago' },
  { id: 2, name: 'Inbound Demo Request (All Segments)', steps: 14, days: 21, tags: ['inbound'], active: true, score: 92, prospects: { active: 154, paused: 1 }, contacted: 1479, opened: 88, replied: 62, owner: 'MT', lastRun: '12 min ago' },
  { id: 3, name: 'PROS | C+C Manual Round1 (NAM)', steps: 17, days: 28, tags: ['create&close'], active: true, score: 26, prospects: { active: 485, paused: 256 }, contacted: 27125, opened: 52, replied: 22, owner: 'JP', lastRun: '1 hour ago' },
  { id: 4, name: 'Event Follow-up — SaaStr 2026', steps: 7, days: 10, tags: ['event'], active: true, score: 81, prospects: { active: 320, paused: 8 }, contacted: 1890, opened: 71, replied: 38, owner: 'MT', lastRun: '45 min ago' },
  { id: 5, name: 'Re-engagement — Lost Deals Q2', steps: 5, days: 21, tags: ['nurture'], active: false, score: 34, prospects: { active: 0, paused: 86 }, contacted: 640, opened: 42, replied: 8, owner: 'SK', lastRun: '3 days ago' },
]

const initialSteps = {
  id: 'start',
  type: 'trigger',
  title: 'Prospect Enters',
  desc: 'New lead added to sequence',
  day: 0,
  next: [
    {
      id: 's1', type: 'auto_email', title: 'Intro Email', desc: 'Personalized cold intro', day: 1,
      next: [
        {
          id: 's2', type: 'linkedin_connect', title: 'LinkedIn Connect', desc: 'Connection request', day: 1,
          next: [
            {
              id: 'c1', type: 'condition', title: 'Email Opened?', desc: '', day: 2,
              branches: [
                {
                  label: 'YES',
                  color: '#16a34a',
                  next: [
                    { id: 's3', type: 'phone', title: 'Discovery Call', desc: 'High-intent call', day: 3,
                      next: [
                        { id: 'c2', type: 'condition', title: 'Connected?', desc: '', day: 3,
                          branches: [
                            { label: 'YES', color: '#16a34a', next: [
                              { id: 's6', type: 'ai_branch', title: 'AI: Book Meeting', desc: 'Auto-schedule via agent', day: 4, next: [] }
                            ]},
                            { label: 'NO', color: '#dc2626', next: [
                              { id: 's7', type: 'auto_email', title: 'Voicemail Follow-up', desc: 'Reference call attempt', day: 4, next: [] }
                            ]}
                          ]
                        }
                      ]
                    }
                  ]
                },
                {
                  label: 'NO',
                  color: '#dc2626',
                  next: [
                    { id: 's4', type: 'auto_email', title: 'Follow-up Email', desc: 'Value-add content', day: 3,
                      next: [
                        { id: 's5', type: 'linkedin_msg', title: 'LinkedIn DM', desc: 'Casual message', day: 5,
                          next: [
                            { id: 'c3', type: 'condition', title: 'Any Reply?', desc: '', day: 7,
                              branches: [
                                { label: 'YES', color: '#16a34a', next: [
                                  { id: 's8', type: 'ai_branch', title: 'AI: Route', desc: 'Sentiment → action', day: 7, next: [] }
                                ]},
                                { label: 'NO', color: '#dc2626', next: [
                                  { id: 's9', type: 'auto_email', title: 'Breakup Email', desc: 'Final touch', day: 10, next: [] }
                                ]}
                              ]
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}

const initialProspects = [
  { id: 1, name: 'Sarah Chen', company: 'Acme Corp', title: 'VP Sales', state: 'active', currentStep: 3, replied: false, sequenceId: 1 },
  { id: 2, name: 'James Park', company: 'Beta Inc', title: 'CTO', state: 'active', currentStep: 5, replied: false, sequenceId: 1 },
  { id: 3, name: 'Mike Torres', company: 'Delta LLC', title: 'Director', state: 'finished_replied', currentStep: 2, replied: true, sequenceId: 2 },
  { id: 4, name: 'Lisa Wang', company: 'Omega Co', title: 'Head Product', state: 'paused', currentStep: 4, replied: false, sequenceId: 1 },
  { id: 5, name: 'Tom Harris', company: 'Zeta Tech', title: 'CEO', state: 'active', currentStep: 1, replied: false, sequenceId: 3 },
]

const copilotContexts = {
  steps: { greeting: "I can help build your sequence flow. Ask me to add steps, create branches, or generate a full sequence.", starters: ['Generate a 7-step outbound sequence', 'Add an email step on day 3', 'Add a condition: if email opened', 'Make the sequence more aggressive'] },
  prospects: { greeting: "I can help manage prospects. Add, remove, or check which ones need attention.", starters: ['Which prospects are stuck?', 'Remove all bounced', 'Resume paused prospects'] },
  settings: { greeting: "I can configure sequence settings — timing, throttles, exit conditions.", starters: ['Set send window to 9am-5pm', 'Enable pause on OOO', 'Limit to 100 emails/day'] },
  create: { greeting: "Let's build a new sequence! Describe your goal and I'll generate the flow.\n\nOr tell me: outbound, inbound, nurture, or event?", starters: ['Cold outbound for CTOs', 'Inbound demo follow-up', 'Re-engagement for lost deals', 'Post-event nurture'] },
}


export default function Sequences() {
  const [view, setView] = useState('list')
  const [listTab, setListTab] = useState('sequences')
  const [sequences] = useState(initialSequences)
  const [steps, setSteps] = useState(initialSteps)
  const [prospects, setProspects] = useState(initialProspects)
  const [selectedSeq, setSelectedSeq] = useState(null)
  const [builderTab, setBuilderTab] = useState('steps')
  const [selectedStep, setSelectedStep] = useState(null)
  const [copilotOpen, setCopilotOpen] = useState(true)
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [pendingStep, setPendingStep] = useState(null)
  const chatEndRef = useRef(null)

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [chatMessages])
  useEffect(() => {
    const ctx = copilotContexts[builderTab] || copilotContexts.steps
    setChatMessages([{ role: 'ai', text: ctx.greeting }])
    setPendingStep(null)
  }, [builderTab])

  const openSequence = (seq) => { setSelectedSeq(seq); setView('builder'); setBuilderTab('steps') }
  const openCreate = () => { setView('builder'); setSelectedSeq(null); setSteps([]); setChatMessages([{ role: 'ai', text: copilotContexts.create.greeting }]) }
  const backToList = () => { setSelectedSeq(null); setView('list'); setSelectedStep(null) }

  const handleChat = () => {
    if (!chatInput.trim()) return
    const msg = chatInput.trim()
    setChatMessages(prev => [...prev, { role: 'user', text: msg }])
    setChatInput('')
    const lower = msg.toLowerCase()
    setTimeout(() => {
      let reply = ''
      if (pendingStep) {
        reply = 'Step configuration noted. Click any node to edit its properties in the right panel.'
        setPendingStep(null)
      } else if (lower.includes('generate') || lower.includes('create') && lower.includes('sequence')) {
        reply = 'Generated a branching sequence flow! The tree shows:\n• Intro Email → LinkedIn → Condition check\n• YES branch: Call → AI Book\n• NO branch: Follow-up → DM → Breakup\n\nClick any node to configure it.'
      } else if (lower.includes('add')) {
        reply = 'To add a step, click the node where you want to branch from, then use the right panel to configure the new step. Or describe the full flow and I\'ll restructure it.'
      } else if (lower.includes('aggressive') || lower.includes('shorten')) {
        reply = 'To compress timing, click each node and reduce the Day number in the right panel. I\'ve noted this for the next generation.'
      } else {
        reply = "I can help! Try:\n• \"Generate a sequence\"\n• \"Add a condition branch\"\n• Or click any node to edit in the right panel."
      }
      setChatMessages(prev => [...prev, { role: 'ai', text: reply }])
    }, 400)
  }

  const deleteStep = (id) => { setSelectedStep(null) }
  const updateStep = (field, value) => { if (selectedStep) setSelectedStep({ ...selectedStep, [field]: value }) }
  const removeProspect = (id) => setProspects(prospects.filter(p => p.id !== id))
  const changeProspectSeq = (pid, sid) => setProspects(prospects.map(p => p.id === pid ? { ...p, sequenceId: parseInt(sid), currentStep: 1 } : p))
  const currentCtx = copilotContexts[builderTab] || copilotContexts.steps

  // Recursive tree renderer — vertical top-to-bottom
  const renderNode = (node) => {
    if (!node) return null
    const st = stepTypes.find(t => t.type === node.type) || { label: 'Trigger', cat: 'auto' }
    const isCondition = node.type === 'condition'
    const isTrigger = node.type === 'trigger'
    const isSelected = selectedStep?.id === node.id

    const nodeBox = (
      <div onClick={() => !isTrigger && setSelectedStep(node)} style={{ padding: isTrigger ? '10px 20px' : '12px 16px', background: isTrigger ? '#16a34a' : isSelected ? '#eef2ff' : '#fff', color: isTrigger ? '#fff' : '#1e293b', border: isTrigger ? 'none' : `2px solid ${isSelected ? '#6366f1' : '#e5e7eb'}`, borderRadius: isTrigger ? 24 : isCondition ? 12 : 10, cursor: isTrigger ? 'default' : 'pointer', minWidth: 140, textAlign: 'center', boxShadow: isSelected ? '0 4px 12px rgba(99,102,241,.12)' : '0 1px 4px rgba(0,0,0,.04)' }}>
        {!isTrigger && <div style={{ fontSize: 9, color: isSelected ? '#6366f1' : '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: 3 }}>{st.label}</div>}
        <div style={{ fontSize: 12, fontWeight: 600 }}>{node.title}</div>
        {node.desc && !isTrigger && !isCondition && <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 3 }}>{node.desc.substring(0, 40)}</div>}
        {node.day > 0 && !isTrigger && <div style={{ fontSize: 9, color: '#6366f1', marginTop: 4 }}>Day {node.day}</div>}
      </div>
    )

    // Condition: show node, then split into columns side by side
    if (isCondition && node.branches) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {nodeBox}
          {/* Vertical line down from condition */}
          <div style={{ width: 2, height: 20, background: '#d1d5db' }} />
          {/* Branches side by side */}
          <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
            {node.branches.map((branch, bi) => (
              <div key={bi} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {/* Branch label */}
                <span style={{ fontSize: 10, fontWeight: 700, color: branch.color, background: branch.color + '15', padding: '3px 10px', borderRadius: 10, marginBottom: 8 }}>{branch.label}</span>
                {/* Vertical connector */}
                <div style={{ width: 2, height: 12, background: branch.color }} />
                {/* Branch children vertically */}
                {branch.next.map((child) => (
                  <div key={child.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {renderNode(child)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )
    }

    // Regular node: render node, then connector, then children vertically
    if (node.next && node.next.length > 0) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {nodeBox}
          <div style={{ width: 2, height: 20, background: '#d1d5db' }} />
          {node.next.map((child) => (
            <div key={child.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {renderNode(child)}
            </div>
          ))}
        </div>
      )
    }

    // Leaf
    return <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>{nodeBox}</div>
  }


  return (
    <div>
      {/* LIST VIEW */}
      {view === 'list' && (
        <>
          <div className="topbar"><h2>Sequences</h2><div className="actions"><button className="btn btn-primary" onClick={openCreate}>+ Create Sequence</button></div></div>
          <div style={{ padding: 24 }}>
            <div className="tabs">
              <button className={listTab === 'sequences' ? 'active' : ''} onClick={() => setListTab('sequences')}>Sequences ({sequences.length})</button>
              <button className={listTab === 'prospects' ? 'active' : ''} onClick={() => setListTab('prospects')}>Prospects ({prospects.length})</button>
            </div>
            {listTab === 'sequences' && (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table><thead><tr><th>Name</th><th>Status</th><th>Score</th><th>Prospects</th><th>Opened</th><th>Replied</th><th>Last Run</th></tr></thead>
                  <tbody>{sequences.map(seq => (
                    <tr key={seq.id} style={{ cursor: 'pointer' }} onClick={() => openSequence(seq)}>
                      <td><strong>{seq.name}</strong><div style={{ fontSize: 11, color: '#94a3b8' }}>{seq.steps} steps • {seq.days}d</div></td>
                      <td><span className={`badge ${seq.active ? 'badge-green' : 'badge-gray'}`}>{seq.active ? 'Active' : 'Paused'}</span></td>
                      <td style={{ fontWeight: 700, color: seq.score >= 70 ? '#16a34a' : seq.score >= 40 ? '#d97706' : '#dc2626' }}>{seq.score}</td>
                      <td>{seq.prospects.active}</td><td>{seq.opened}%</td><td style={{ fontWeight: 600 }}>{seq.replied}%</td>
                      <td style={{ fontSize: 12, color: '#64748b' }}>{seq.lastRun}</td>
                    </tr>))}</tbody>
                </table>
              </div>
            )}
            {listTab === 'prospects' && (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table><thead><tr><th>Prospect</th><th>Company</th><th>Sequence</th><th>State</th><th>Step</th><th></th></tr></thead>
                  <tbody>{prospects.map(p => (
                    <tr key={p.id}><td><strong>{p.name}</strong><div style={{ fontSize: 11, color: '#94a3b8' }}>{p.title}</div></td><td>{p.company}</td>
                      <td><select value={p.sequenceId} onChange={e => changeProspectSeq(p.id, e.target.value)} style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '3px 6px', fontSize: 11 }}>{sequences.map(s => <option key={s.id} value={s.id}>{s.name.substring(0,25)}</option>)}</select></td>
                      <td><span className={`badge ${p.state === 'active' ? 'badge-green' : 'badge-yellow'}`}>{p.state.replace('_',' ')}</span></td>
                      <td>{p.currentStep}</td><td><button className="btn btn-sm btn-danger" onClick={() => removeProspect(p.id)}>×</button></td>
                    </tr>))}</tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}


      {/* BUILDER VIEW */}
      {view === 'builder' && (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
          {/* LEFT: Collapsible Copilot */}
          <div style={{ width: copilotOpen ? 300 : 0, overflow: 'hidden', transition: 'width .2s', borderRight: copilotOpen ? '1px solid #e5e7eb' : 'none', display: 'flex', flexDirection: 'column', background: '#fff', flexShrink: 0 }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><div style={{ fontSize: 13, fontWeight: 700 }}>Copilot</div><div style={{ fontSize: 10, color: '#64748b' }}>{builderTab}</div></div>
              <button onClick={() => setCopilotOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#94a3b8' }}>×</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {chatMessages.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{ maxWidth: '90%', padding: '8px 12px', borderRadius: m.role === 'user' ? '10px 10px 2px 10px' : '10px 10px 10px 2px', background: m.role === 'user' ? '#6366f1' : '#f1f5f9', color: m.role === 'user' ? '#fff' : '#1e293b', fontSize: 11, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{m.text}</div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            {chatMessages.length <= 1 && (
              <div style={{ padding: '0 12px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {currentCtx.starters.map((s, i) => (
                  <button key={i} onClick={() => setChatInput(s)} style={{ textAlign: 'left', padding: '6px 10px', background: '#f8f9fb', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 10, color: '#475569', cursor: 'pointer' }}>{s}</button>
                ))}
              </div>
            )}
            <div style={{ padding: '8px 12px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: 6 }}>
              <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleChat()} placeholder="Ask copilot..." style={{ flex: 1, padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 11 }} />
              <button className="btn btn-primary" onClick={handleChat} style={{ padding: '8px 10px', fontSize: 11 }}>→</button>
            </div>
          </div>

          {/* CENTER: Canvas */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Top bar */}
            <div style={{ height: 50, borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', padding: '0 16px', justifyContent: 'space-between', background: '#fff', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {!copilotOpen && <button className="btn btn-sm" onClick={() => setCopilotOpen(true)} title="Open Copilot">AI</button>}
                <button className="btn btn-sm" onClick={backToList}>←</button>
                <span style={{ fontSize: 14, fontWeight: 700 }}>{selectedSeq?.name || 'New Sequence'}</span>
              </div>
              <div className="view-toggle">
                <button className={builderTab === 'steps' ? 'active' : ''} onClick={() => setBuilderTab('steps')}>Flow</button>
                <button className={builderTab === 'prospects' ? 'active' : ''} onClick={() => setBuilderTab('prospects')}>Prospects</button>
                <button className={builderTab === 'settings' ? 'active' : ''} onClick={() => setBuilderTab('settings')}>Settings</button>
              </div>
            </div>

            {/* Canvas area */}
            <div style={{ flex: 1, overflow: 'auto', background: '#fafbfc', position: 'relative' }}>
              {builderTab === 'steps' && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 32px', minHeight: '100%' }}>
                  {renderNode(steps)}
                </div>
              )}

              {builderTab === 'prospects' && (
                <div style={{ padding: 20 }}>
                  <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table><thead><tr><th>Prospect</th><th>Company</th><th>State</th><th>Step</th><th></th></tr></thead>
                      <tbody>{prospects.filter(p => p.sequenceId === selectedSeq?.id).map(p => (
                        <tr key={p.id}><td><strong>{p.name}</strong></td><td>{p.company}</td>
                          <td><span className={`badge ${p.state === 'active' ? 'badge-green' : 'badge-yellow'}`}>{p.state}</span></td>
                          <td>Step {p.currentStep}</td><td><button className="btn btn-sm btn-danger" onClick={() => removeProspect(p.id)}>×</button></td></tr>
                      ))}</tbody>
                    </table>
                  </div>
                </div>
              )}

              {builderTab === 'settings' && (
                <div style={{ padding: 20, maxWidth: 600 }}>
                  <div className="card">
                    <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Settings</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div className="form-group"><label>Send Window</label><select><option>8am — 6pm</option><option>9am — 5pm</option></select></div>
                      <div className="form-group"><label>Active Days</label><select><option>Weekdays</option><option>All Days</option></select></div>
                      <div className="form-group"><label>Email Throttle/day</label><input type="number" defaultValue={200} /></div>
                      <div className="form-group"><label>LinkedIn Limit/day</label><input type="number" defaultValue={50} /></div>
                    </div>
                    {['Pause on reply', 'Pause on bounce', 'Skip weekends', 'Auto-detect OOO', 'Exit on meeting booked'].map((s, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#f8f9fb', borderRadius: 8, marginTop: 8, fontSize: 13 }}><span>{s}</span><div className="toggle on" /></div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Step Detail Drawer */}
          {selectedStep && builderTab === 'steps' && (
            <div style={{ width: 320, borderLeft: '1px solid #e5e7eb', background: '#fff', overflowY: 'auto', flexShrink: 0 }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>Step Properties</span>
                <button onClick={() => setSelectedStep(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#94a3b8' }}>×</button>
              </div>
              <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="form-group"><label>Type</label><select value={selectedStep.type} onChange={e => updateStep('type', e.target.value)}>{stepTypes.map(t => <option key={t.type} value={t.type}>{t.label}</option>)}</select></div>
                <div className="form-group"><label>Title</label><input value={selectedStep.title} onChange={e => updateStep('title', e.target.value)} /></div>
                <div className="form-group"><label>Description</label><textarea value={selectedStep.desc} onChange={e => updateStep('desc', e.target.value)} style={{ minHeight: 70 }} /></div>
                <div className="form-group"><label>Day</label><input type="number" min="1" value={selectedStep.day} onChange={e => updateStep('day', parseInt(e.target.value) || 1)} /></div>
                <div className="form-group"><label>Condition</label>
                  <select value={selectedStep.condition || 'always'} onChange={e => updateStep('condition', e.target.value)}>
                    <option value="always">Always execute</option>
                    <optgroup label="Engagement"><option value="if_opened">If email opened</option><option value="if_no_open">If NOT opened</option><option value="if_clicked">If link clicked</option><option value="if_opened_3x">If opened 3+ times</option><option value="if_page_visit">If page visited</option></optgroup>
                    <optgroup label="Reply"><option value="if_no_reply">If no reply</option><option value="if_replied">If replied</option></optgroup>
                    <optgroup label="LinkedIn"><option value="if_connected">If connected</option><option value="if_not_connected">If NOT connected</option></optgroup>
                    <optgroup label="Escalation"><option value="if_no_engagement_3">No engagement 3 steps</option><option value="if_no_engagement_7d">No engagement 7 days</option></optgroup>
                  </select>
                </div>
                <div className="form-group"><label>Send Window</label>
                  <select value={selectedStep.sendWindow || '8am-6pm'} onChange={e => updateStep('sendWindow', e.target.value)}>
                    <option value="8am-6pm">8am — 6pm</option><option value="9am-5pm">9am — 5pm</option><option value="9am-12pm">Morning only</option><option value="anytime">Any time</option>
                  </select>
                </div>
                <div className="form-group"><label>Priority</label>
                  <select value={selectedStep.priority || 'normal'} onChange={e => updateStep('priority', e.target.value)}>
                    <option value="high">High</option><option value="normal">Normal</option><option value="low">Low</option>
                  </select>
                </div>
                <div className="form-group"><label>On Failure</label>
                  <select value={selectedStep.onFailure || 'skip'} onChange={e => updateStep('onFailure', e.target.value)}>
                    <option value="skip">Skip & continue</option><option value="pause">Pause sequence</option><option value="retry">Retry next day</option><option value="notify">Notify owner</option>
                  </select>
                </div>
                <div className="form-group"><label>Template</label><input value={selectedStep.template || ''} onChange={e => updateStep('template', e.target.value)} placeholder="Link template name..." /></div>
                <div className="form-group"><label>A/B Variant</label><textarea value={selectedStep.abVariant || ''} onChange={e => updateStep('abVariant', e.target.value)} placeholder="Alt content for split test..." style={{ minHeight: 50 }} /></div>
                <button className="btn btn-danger" style={{ marginTop: 8 }} onClick={() => deleteStep(selectedStep.id)}>Delete Step</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
