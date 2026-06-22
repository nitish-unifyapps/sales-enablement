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

const initialSteps = [
  { id: 1, type: 'auto_email', title: 'Intro Email', desc: 'Personalized intro with {{company_industry}}', day: 1, condition: 'always', sendWindow: '8am-6pm', priority: 'normal' },
  { id: 2, type: 'linkedin_connect', title: 'LinkedIn Connect', desc: 'Personalized connection note', day: 1, condition: 'always', sendWindow: '9am-5pm', priority: 'normal' },
  { id: 3, type: 'condition', title: 'Email Opened?', desc: 'Check if intro email was opened', day: 2, condition: 'if_opened', branches: { yes: 'Route to call', no: 'Send follow-up email' } },
  { id: 4, type: 'auto_email', title: 'Follow-up #1', desc: 'Value-add content if no reply', day: 3, condition: 'if_no_reply', sendWindow: '8am-6pm', priority: 'normal' },
  { id: 5, type: 'phone', title: 'Discovery Call', desc: 'Call with discovery script', day: 4, condition: 'if_opened', sendWindow: '9am-12pm', priority: 'high' },
  { id: 6, type: 'linkedin_msg', title: 'LinkedIn DM', desc: 'Reference email + ask for meeting', day: 5, condition: 'if_connected', sendWindow: '9am-5pm', priority: 'normal' },
  { id: 7, type: 'ai_branch', title: 'AI: Evaluate', desc: 'Sentiment analysis + routing', day: 6, condition: 'always', branches: { positive: 'Book meeting', objection: 'Handle objection', silent: 'Continue sequence' } },
  { id: 8, type: 'auto_email', title: 'Case Study', desc: 'Industry-relevant social proof', day: 8, condition: 'always', sendWindow: '8am-6pm', priority: 'normal' },
  { id: 9, type: 'auto_email', title: 'Breakup', desc: 'Final touch — close the loop', day: 12, condition: 'if_no_reply', sendWindow: '8am-6pm', priority: 'low' },
]

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
  const [selectedStep, setSelectedStep] = useState(null) // right drawer
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
        if (pendingStep.awaiting === 'desc') {
          setPendingStep({ ...pendingStep, step: { ...pendingStep.step, desc: msg }, awaiting: 'day' })
          reply = `Got it. What day? (last step is Day ${steps.length > 0 ? steps[steps.length-1].day : 0})`
        } else if (pendingStep.awaiting === 'day') {
          const day = parseInt(msg) || (steps.length > 0 ? steps[steps.length-1].day + 2 : 1)
          setSteps(prev => [...prev, { ...pendingStep.step, day, id: Date.now(), condition: 'always', sendWindow: '8am-6pm', priority: 'normal' }])
          reply = `Added "${pendingStep.step.title}" on Day ${day}.`
          setPendingStep(null)
        }
      } else if (lower.includes('generate') || lower.includes('create') && lower.includes('sequence')) {
        const persona = lower.includes('cto') ? 'CTOs' : lower.includes('vp') ? 'VPs' : 'prospects'
        setSteps([
          { id: Date.now(), type: 'auto_email', title: 'Intro Email', desc: `Personalized cold intro for ${persona}`, day: 1, condition: 'always', sendWindow: '8am-6pm', priority: 'normal' },
          { id: Date.now()+1, type: 'linkedin_connect', title: 'LinkedIn Connect', desc: 'Connection with personalized note', day: 1, condition: 'always', sendWindow: '9am-5pm', priority: 'normal' },
          { id: Date.now()+2, type: 'condition', title: 'Email Opened?', desc: 'Check engagement signal', day: 2, condition: 'if_opened', branches: { yes: 'Call', no: 'Follow-up email' } },
          { id: Date.now()+3, type: 'auto_email', title: 'Follow-up', desc: 'Value-add if no reply', day: 3, condition: 'if_no_reply', sendWindow: '8am-6pm', priority: 'normal' },
          { id: Date.now()+4, type: 'phone', title: 'Call', desc: 'Discovery call', day: 5, condition: 'if_opened', sendWindow: '9am-12pm', priority: 'high' },
          { id: Date.now()+5, type: 'ai_branch', title: 'AI Evaluate', desc: 'Route by sentiment', day: 7, condition: 'always', branches: { positive: 'Meeting', objection: 'Handler', silent: 'Continue' } },
          { id: Date.now()+6, type: 'auto_email', title: 'Breakup', desc: 'Final touch', day: 10, condition: 'if_no_reply', sendWindow: '8am-6pm', priority: 'low' },
        ])
        reply = `Generated 7-step flow for ${persona} over 10 days. Click any node to customize.`
      } else if (lower.includes('add') && (lower.includes('email') || lower.includes('call') || lower.includes('linkedin') || lower.includes('task') || lower.includes('condition') || lower.includes('branch'))) {
        const type = lower.includes('call') || lower.includes('phone') ? 'phone' : lower.includes('linkedin') ? 'linkedin_msg' : lower.includes('condition') ? 'condition' : lower.includes('branch') || lower.includes('ai') ? 'ai_branch' : lower.includes('task') ? 'task' : 'auto_email'
        const label = stepTypes.find(t => t.type === type)?.label || 'Step'
        setPendingStep({ step: { type, title: label }, awaiting: 'desc' })
        reply = `Adding ${label}. What should it do? Describe briefly:`
      } else if (lower.includes('aggressive') || lower.includes('shorten')) {
        setSteps(prev => prev.map(s => ({ ...s, day: Math.max(1, Math.ceil(s.day * 0.6)) })))
        reply = 'Compressed timing by ~40%.'
      } else if (lower.includes('remove') && lower.includes('last')) {
        setSteps(prev => prev.slice(0, -1))
        reply = 'Removed last step.'
      } else {
        reply = "Try:\n• \"Generate a 7-step sequence\"\n• \"Add an email step\"\n• \"Add a condition\"\n• \"Make it aggressive\""
      }
      setChatMessages(prev => [...prev, { role: 'ai', text: reply }])
    }, 400)
  }

  const deleteStep = (id) => { setSteps(steps.filter(s => s.id !== id)); if (selectedStep?.id === id) setSelectedStep(null) }
  const updateStep = (field, value) => { const updated = { ...selectedStep, [field]: value }; setSelectedStep(updated); setSteps(steps.map(s => s.id === updated.id ? updated : s)) }
  const removeProspect = (id) => setProspects(prospects.filter(p => p.id !== id))
  const changeProspectSeq = (pid, sid) => setProspects(prospects.map(p => p.id === pid ? { ...p, sequenceId: parseInt(sid), currentStep: 1 } : p))
  const currentCtx = copilotContexts[builderTab] || copilotContexts.steps
  const maxDay = steps.length > 0 ? Math.max(...steps.map(s => s.day)) : 1


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
                <div style={{ display: 'flex', alignItems: 'center', minHeight: '100%', padding: '40px 32px', minWidth: 'fit-content' }}>
                  {/* Flow canvas — vertically centered */}
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {/* Start node */}
                    <div style={{ padding: '8px 14px', background: '#16a34a', color: '#fff', borderRadius: 20, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>START</div>
                    <div style={{ width: 24, height: 2, background: '#16a34a' }} />

                    {steps.map((step, idx) => {
                      const st = stepTypes.find(t => t.type === step.type) || stepTypes[0]
                      const isCondition = step.type === 'condition' || step.type === 'ai_branch'
                      const isSelected = selectedStep?.id === step.id
                      const prevDay = idx > 0 ? steps[idx-1].day : 0
                      const dayGap = step.day - prevDay

                      return (
                        <div key={step.id} style={{ display: 'flex', alignItems: 'center' }}>
                          {/* Connector with day gap */}
                          <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                            {dayGap > 0 && idx > 0 ? (
                              <>
                                <div style={{ width: 40, position: 'relative' }}>
                                  <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 2, background: '#d1d5db' }} />
                                  {/* Day dashed separator */}
                                  <div style={{ position: 'absolute', top: -30, left: 18, bottom: -30, borderLeft: '1.5px dashed #c7d2fe' }} />
                                  <div style={{ position: 'absolute', top: -24, left: 8, fontSize: 9, fontWeight: 700, color: '#6366f1', background: '#eef2ff', padding: '1px 6px', borderRadius: 8, whiteSpace: 'nowrap' }}>D{step.day}</div>
                                </div>
                              </>
                            ) : idx > 0 ? (
                              <div style={{ width: 28, height: 2, background: '#d1d5db' }} />
                            ) : null}
                          </div>

                          {/* Node */}
                          {isCondition ? (
                            /* Diamond/condition node */
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <div onClick={() => setSelectedStep(step)} style={{ width: 120, padding: '14px 12px', background: isSelected ? '#eef2ff' : '#fff', border: `2px solid ${isSelected ? '#6366f1' : '#e5e7eb'}`, borderRadius: 12, cursor: 'pointer', textAlign: 'center', boxShadow: isSelected ? '0 4px 12px rgba(99,102,241,.1)' : '0 1px 4px rgba(0,0,0,.04)' }}>
                                <div style={{ fontSize: 9, color: '#6366f1', fontWeight: 700, marginBottom: 3 }}>{st.label.toUpperCase()}</div>
                                <div style={{ fontSize: 11, fontWeight: 600, color: '#1e293b' }}>{step.title}</div>
                              </div>
                              {/* YES / NO branches */}
                              {step.branches && (
                                <div style={{ display: 'flex', gap: 20, marginTop: 8 }}>
                                  {Object.entries(step.branches).map(([key, val]) => (
                                    <div key={key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                      <div style={{ width: 1, height: 12, background: key === 'yes' || key === 'positive' ? '#16a34a' : key === 'no' || key === 'silent' ? '#dc2626' : '#d97706' }} />
                                      <span style={{ fontSize: 9, fontWeight: 700, color: key === 'yes' || key === 'positive' ? '#16a34a' : key === 'no' || key === 'silent' ? '#dc2626' : '#d97706', textTransform: 'uppercase' }}>{key}</span>
                                      <div style={{ padding: '5px 10px', background: '#f8f9fb', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 10, color: '#475569', marginTop: 4, whiteSpace: 'nowrap' }}>{val}</div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            /* Regular step node */
                            <div onClick={() => setSelectedStep(step)} style={{ width: 140, padding: '14px 14px', background: isSelected ? '#eef2ff' : '#fff', border: `2px solid ${isSelected ? '#6366f1' : '#e5e7eb'}`, borderRadius: 10, cursor: 'pointer', boxShadow: isSelected ? '0 4px 12px rgba(99,102,241,.1)' : '0 1px 4px rgba(0,0,0,.04)', transition: 'all .15s' }}>
                              <div style={{ fontSize: 9, color: '#64748b', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.3 }}>{st.label}</div>
                              <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', marginBottom: 2 }}>{step.title}</div>
                              {step.desc && <div style={{ fontSize: 10, color: '#94a3b8', lineHeight: 1.4 }}>{step.desc.substring(0, 40)}{step.desc.length > 40 ? '...' : ''}</div>}
                              {step.condition && step.condition !== 'always' && (
                                <div style={{ marginTop: 6, fontSize: 9, color: '#6366f1', background: '#eef2ff', padding: '2px 6px', borderRadius: 4, display: 'inline-block' }}>{step.condition.replace(/_/g, ' ')}</div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}

                    {/* End connector + add */}
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{ width: 28, height: 2, background: '#d1d5db' }} />
                      <div onClick={() => setSteps([...steps, { id: Date.now(), type: 'auto_email', title: 'New Step', desc: '', day: (steps[steps.length-1]?.day || 0) + 2, condition: 'always', sendWindow: '8am-6pm', priority: 'normal' }])} style={{ width: 32, height: 32, borderRadius: '50%', border: '2px dashed #c7d2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 14, color: '#6366f1', background: '#fff' }}>+</div>
                    </div>
                  </div>
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
