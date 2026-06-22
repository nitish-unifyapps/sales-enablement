import { useState, useRef, useEffect } from 'react'

const stepTypes = [
  { type: 'auto_email', label: 'Automated Email', cat: 'auto' },
  { type: 'manual_email', label: 'Manual Email', cat: 'manual' },
  { type: 'phone', label: 'Phone Call', cat: 'manual' },
  { type: 'linkedin_connect', label: 'LinkedIn Connect', cat: 'auto' },
  { type: 'linkedin_msg', label: 'LinkedIn Message', cat: 'auto' },
  { type: 'linkedin_inmail', label: 'LinkedIn InMail', cat: 'auto' },
  { type: 'task', label: 'Generic Task', cat: 'manual' },
  { type: 'ai_branch', label: 'AI Branch', cat: 'auto' },
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

const initialSteps = [
  { id: 1, type: 'auto_email', title: 'Intro Email', desc: 'Personalized intro referencing {{company_industry}}', day: 1 },
  { id: 2, type: 'linkedin_connect', title: 'LinkedIn Connection', desc: 'Connect with personalized note', day: 1 },
  { id: 3, type: 'auto_email', title: 'Follow-up #1', desc: 'Value-add content if no reply', day: 3 },
  { id: 4, type: 'phone', title: 'Discovery Call', desc: 'Use discovery script. Voicemail if no answer.', day: 4 },
  { id: 5, type: 'linkedin_msg', title: 'LinkedIn Message', desc: 'Reference email + ask for meeting', day: 5 },
  { id: 6, type: 'ai_branch', title: 'AI: Sentiment Check', desc: 'Positive → meeting. Objection → handler. Silent → continue.', day: 6 },
  { id: 7, type: 'auto_email', title: 'Case Study Email', desc: 'Send relevant case study', day: 8 },
  { id: 8, type: 'phone', title: 'Call #2 + Voicemail', desc: 'Mention LinkedIn, drop voicemail', day: 10 },
  { id: 9, type: 'auto_email', title: 'Breakup Email', desc: 'Final touch — create urgency', day: 12 },
  { id: 10, type: 'task', title: 'Review & Disposition', desc: 'Mark lost / nurture / escalate', day: 14 },
]

const initialProspects = [
  { id: 1, name: 'Sarah Chen', company: 'Acme Corp', title: 'VP Sales', email: 'sarah@acme.com', state: 'active', currentStep: 3, lastContacted: '2 hours ago', opened: true, clicked: true, replied: false, sequenceId: 1, owner: 'You' },
  { id: 2, name: 'James Park', company: 'Beta Inc', title: 'CTO', email: 'james@beta.io', state: 'active', currentStep: 5, lastContacted: 'Yesterday', opened: true, clicked: false, replied: false, sequenceId: 1, owner: 'You' },
  { id: 3, name: 'Mike Torres', company: 'Delta LLC', title: 'Director Ops', email: 'mike@delta.co', state: 'finished_replied', currentStep: 2, lastContacted: '3 days ago', opened: true, clicked: true, replied: true, sequenceId: 2, owner: 'You' },
  { id: 4, name: 'Lisa Wang', company: 'Omega Co', title: 'Head of Product', email: 'lisa@omega.com', state: 'paused', currentStep: 4, lastContacted: '5 days ago', opened: true, clicked: false, replied: false, sequenceId: 1, owner: 'You' },
  { id: 5, name: 'Tom Harris', company: 'Zeta Tech', title: 'CEO', email: 'tom@zeta.io', state: 'active', currentStep: 1, lastContacted: 'Today', opened: false, clicked: false, replied: false, sequenceId: 3, owner: 'Mike T.' },
  { id: 6, name: 'Anna Lee', company: 'Sigma HR', title: 'VP Eng', email: 'anna@sigma.com', state: 'bounced', currentStep: 1, lastContacted: 'Jun 16', opened: false, clicked: false, replied: false, sequenceId: 4, owner: 'You' },
  { id: 7, name: 'Ben Cross', company: 'Alpha Media', title: 'CMO', email: 'ben@alpha.co', state: 'active', currentStep: 7, lastContacted: '1 day ago', opened: true, clicked: true, replied: false, sequenceId: 2, owner: 'Mike T.' },
  { id: 8, name: 'Raj Patel', company: 'Lambda SaaS', title: 'Dir Sales', email: 'raj@lambda.io', state: 'active', currentStep: 6, lastContacted: 'Today', opened: true, clicked: true, replied: false, sequenceId: 3, owner: 'You' },
]

const initialRules = [
  { id: 1, trigger: 'Prospect replies', action: 'Pause sequence', enabled: true },
  { id: 2, trigger: 'Meeting booked', action: 'Finish sequence (success)', enabled: true },
  { id: 3, trigger: 'Email bounced', action: 'Remove & flag', enabled: true },
  { id: 4, trigger: 'Out-of-office detected', action: 'Pause 5 days then resume', enabled: true },
  { id: 5, trigger: 'LinkedIn accepted', action: 'Skip to LinkedIn message', enabled: true },
]

const conversationStarters = [
  'Add a LinkedIn step after day 3',
  'Make this sequence more aggressive — shorten delays',
  'Add an AI branch after the first email',
  'Generate a 7-step cold outbound sequence for CTOs',
  'Add a breakup email at the end',
  'Change all delays to 2 days',
  'Add a phone call on day 5',
  'Insert an objection-handling email after step 4',
]


export default function Sequences() {
  const [view, setView] = useState('list')
  const [listTab, setListTab] = useState('sequences')
  const [sequences] = useState(initialSequences)
  const [steps, setSteps] = useState(initialSteps)
  const [rules, setRules] = useState(initialRules)
  const [prospects, setProspects] = useState(initialProspects)
  const [selectedSeq, setSelectedSeq] = useState(null)
  const [builderTab, setBuilderTab] = useState('steps')
  const [chatMessages, setChatMessages] = useState([{ role: 'ai', text: 'Hi! I\'m your sequence copilot. I can help you build, edit, and optimize your outreach sequence. Try asking me to add steps, change timing, or generate a new sequence.' }])
  const [chatInput, setChatInput] = useState('')
  const chatEndRef = useRef(null)

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [chatMessages])

  const openSequence = (seq) => { setSelectedSeq(seq); setView('builder') }
  const backToList = () => { setSelectedSeq(null); setView('list') }

  // Simulated AI responses that actually modify steps
  const handleChat = () => {
    if (!chatInput.trim()) return
    const userMsg = chatInput.trim()
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setChatInput('')

    setTimeout(() => {
      let aiResponse = ''
      const lower = userMsg.toLowerCase()

      if (lower.includes('add') && lower.includes('linkedin')) {
        const day = steps.length > 0 ? steps[steps.length - 1].day + 1 : 1
        setSteps(prev => [...prev, { id: Date.now(), type: 'linkedin_msg', title: 'LinkedIn Message', desc: 'AI-generated: Personalized LinkedIn outreach', day }])
        aiResponse = `Done! I've added a LinkedIn Message step on Day ${day}. You can edit it manually or tell me to adjust the timing.`
      } else if (lower.includes('add') && lower.includes('call') || lower.includes('phone')) {
        const day = parseInt(lower.match(/day (\d+)/)?.[1]) || (steps.length > 0 ? steps[steps.length - 1].day + 2 : 5)
        setSteps(prev => [...prev, { id: Date.now(), type: 'phone', title: 'Phone Call', desc: 'AI-generated: Discovery call with personalized talk track', day }])
        aiResponse = `Added a Phone Call step on Day ${day}. I've set it up with a discovery call script.`
      } else if (lower.includes('add') && lower.includes('email')) {
        const day = parseInt(lower.match(/day (\d+)/)?.[1]) || (steps.length > 0 ? steps[steps.length - 1].day + 2 : 1)
        setSteps(prev => [...prev, { id: Date.now(), type: 'auto_email', title: 'Follow-up Email', desc: 'AI-generated: Personalized follow-up based on engagement signals', day }])
        aiResponse = `Added an Automated Email on Day ${day}. It'll use personalization based on engagement signals.`
      } else if (lower.includes('add') && lower.includes('ai branch')) {
        const day = parseInt(lower.match(/day (\d+)/)?.[1]) || (steps.length > 0 ? Math.ceil(steps[steps.length - 1].day / 2) + 1 : 3)
        setSteps(prev => [...prev, { id: Date.now(), type: 'ai_branch', title: 'AI: Decision Point', desc: 'AI analyzes engagement: route to meeting, objection handler, or continue', day }])
        aiResponse = `Added an AI Branch on Day ${day}. It'll analyze prospect engagement and route accordingly.`
      } else if (lower.includes('shorten') || lower.includes('aggressive')) {
        setSteps(prev => prev.map((s, i) => ({ ...s, day: Math.max(1, Math.ceil(s.day * 0.6)) })))
        aiResponse = 'Done! I\'ve compressed all delays by ~40%. The sequence is now more aggressive with shorter intervals between touches.'
      } else if (lower.includes('remove') && lower.includes('last')) {
        setSteps(prev => prev.slice(0, -1))
        aiResponse = 'Removed the last step from the sequence.'
      } else if (lower.includes('breakup') || lower.includes('break up')) {
        const day = steps.length > 0 ? steps[steps.length - 1].day + 3 : 14
        setSteps(prev => [...prev, { id: Date.now(), type: 'auto_email', title: 'Breakup Email', desc: 'Final touch — closing the loop with urgency', day }])
        aiResponse = `Added a Breakup Email on Day ${day} — the final touch before closing out the sequence.`
      } else if (lower.includes('generate') || lower.includes('create') && lower.includes('sequence')) {
        setSteps([
          { id: Date.now(), type: 'auto_email', title: 'Intro Email', desc: 'Personalized cold intro based on trigger event', day: 1 },
          { id: Date.now() + 1, type: 'linkedin_connect', title: 'LinkedIn Connect', desc: 'Connection request with personalized note', day: 1 },
          { id: Date.now() + 2, type: 'auto_email', title: 'Follow-up Email', desc: 'Value-add content, reference intro', day: 3 },
          { id: Date.now() + 3, type: 'phone', title: 'Phone Call', desc: 'Discovery call attempt', day: 4 },
          { id: Date.now() + 4, type: 'linkedin_msg', title: 'LinkedIn DM', desc: 'Casual message referencing email', day: 5 },
          { id: Date.now() + 5, type: 'auto_email', title: 'Case Study', desc: 'Relevant social proof', day: 7 },
          { id: Date.now() + 6, type: 'auto_email', title: 'Breakup', desc: 'Final touch — close the loop', day: 10 },
        ])
        aiResponse = 'Generated a fresh 7-step multi-channel sequence! It includes email, LinkedIn, and a phone call spread over 10 days. Feel free to ask me to adjust anything.'
      } else if (lower.includes('rule') && lower.includes('add')) {
        setRules(prev => [...prev, { id: Date.now(), trigger: 'Custom trigger', action: 'Custom action', enabled: true }])
        aiResponse = 'Added a new automation rule. You can edit the trigger and action in the Rules tab.'
      } else {
        aiResponse = `I can help with that! Here are some things I can do:\n• Add steps (email, call, LinkedIn, AI branch)\n• Generate a complete sequence\n• Shorten delays / make more aggressive\n• Remove steps\n• Add automation rules\n\nTry: "Add a LinkedIn message after day 3" or "Generate a 7-step sequence for CTOs"`
      }
      setChatMessages(prev => [...prev, { role: 'ai', text: aiResponse }])
    }, 600)
  }

  const deleteStep = (id) => setSteps(steps.filter(s => s.id !== id))
  const toggleRule = (id) => setRules(rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r))
  const removeProspect = (id) => setProspects(prospects.filter(p => p.id !== id))
  const changeProspectSeq = (pid, sid) => setProspects(prospects.map(p => p.id === pid ? { ...p, sequenceId: parseInt(sid), currentStep: 1 } : p))


  return (
    <div>
      {/* LIST VIEW with Tabs */}
      {view === 'list' && (
        <>
          <div className="topbar">
            <h2>Sequences</h2>
            <div className="actions"><button className="btn btn-primary">+ Create Sequence</button></div>
          </div>
          <div style={{ padding: 24 }}>
            <div className="tabs">
              <button className={listTab === 'sequences' ? 'active' : ''} onClick={() => setListTab('sequences')}>Sequences ({sequences.length})</button>
              <button className={listTab === 'prospects' ? 'active' : ''} onClick={() => setListTab('prospects')}>Prospects ({prospects.length})</button>
            </div>

            {listTab === 'sequences' && (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table>
                  <thead><tr><th>Name</th><th>Status</th><th>Score</th><th>Prospects</th><th>Contacted</th><th>Opened</th><th>Replied</th><th>Last Run</th><th>Owner</th></tr></thead>
                  <tbody>
                    {sequences.map(seq => (
                      <tr key={seq.id} style={{ cursor: 'pointer' }} onClick={() => openSequence(seq)}>
                        <td>
                          <div><strong>{seq.name}</strong></div>
                          <div style={{ fontSize: 11, color: '#94a3b8' }}>{seq.steps} steps • {seq.days}d • {seq.tags.join(', ')}</div>
                        </td>
                        <td><span className={`badge ${seq.active ? 'badge-green' : 'badge-gray'}`}>{seq.active ? 'Active' : 'Paused'}</span></td>
                        <td><span style={{ color: seq.score >= 70 ? '#16a34a' : seq.score >= 40 ? '#d97706' : '#dc2626', fontWeight: 700 }}>{seq.score}</span></td>
                        <td style={{ fontSize: 12 }}>{seq.prospects.active} active</td>
                        <td>{seq.contacted.toLocaleString()}</td>
                        <td>{seq.opened}%</td>
                        <td style={{ fontWeight: 600 }}>{seq.replied}%</td>
                        <td style={{ fontSize: 12, color: '#64748b' }}>{seq.lastRun}</td>
                        <td><div style={{ width: 26, height: 26, borderRadius: '50%', background: '#1e293b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>{seq.owner}</div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {listTab === 'prospects' && (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table>
                  <thead><tr><th>Prospect</th><th>Company</th><th>Sequence</th><th>State</th><th>Step</th><th>Last Contact</th><th>Engagement</th><th></th></tr></thead>
                  <tbody>
                    {prospects.map(p => (
                      <tr key={p.id}>
                        <td><strong>{p.name}</strong><div style={{ fontSize: 11, color: '#94a3b8' }}>{p.title}</div></td>
                        <td>{p.company}</td>
                        <td><select value={p.sequenceId} onChange={e => changeProspectSeq(p.id, e.target.value)} style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '3px 6px', fontSize: 11 }}>{sequences.map(s => <option key={s.id} value={s.id}>{s.name.substring(0, 25)}</option>)}</select></td>
                        <td><span className={`badge ${p.state === 'active' ? 'badge-green' : p.state.includes('finished') ? 'badge-blue' : p.state === 'bounced' || p.state === 'opted_out' ? 'badge-red' : 'badge-yellow'}`}>{p.state.replace('_', ' ')}</span></td>
                        <td>{p.currentStep}</td>
                        <td style={{ fontSize: 12, color: '#64748b' }}>{p.lastContacted}</td>
                        <td style={{ fontSize: 12 }}>{p.opened ? '○' : '·'}{p.clicked ? '○' : '·'}{p.replied ? '●' : '·'}</td>
                        <td><button className="btn btn-sm btn-danger" onClick={() => removeProspect(p.id)}>×</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}


      {/* BUILDER VIEW — Copilot Layout */}
      {view === 'builder' && (
        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', height: 'calc(100vh - 0px)' }}>
          {/* LEFT: AI Copilot */}
          <div style={{ borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', background: '#fff' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Sequence Copilot</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>AI-assisted sequence builder</div>
            </div>

            {/* Chat messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {chatMessages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{ maxWidth: '85%', padding: '10px 14px', borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px', background: msg.role === 'user' ? '#6366f1' : '#f1f5f9', color: msg.role === 'user' ? '#fff' : '#1e293b', fontSize: 13, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Conversation starters */}
            {chatMessages.length <= 1 && (
              <div style={{ padding: '0 16px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>Try asking</div>
                {conversationStarters.slice(0, 4).map((s, i) => (
                  <button key={i} onClick={() => { setChatInput(s); }} style={{ textAlign: 'left', padding: '8px 12px', background: '#f8f9fb', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, color: '#475569', cursor: 'pointer' }}>{s}</button>
                ))}
              </div>
            )}

            {/* Input */}
            <div style={{ padding: '12px 16px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: 8 }}>
              <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleChat()} placeholder="Ask copilot to modify sequence..." style={{ flex: 1, padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13 }} />
              <button className="btn btn-primary" onClick={handleChat} style={{ padding: '10px 14px' }}>→</button>
            </div>
          </div>

          {/* RIGHT: Sequence Content */}
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div className="topbar" style={{ position: 'static' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button className="btn btn-sm" onClick={backToList}>←</button>
                <h2 style={{ fontSize: 15 }}>{selectedSeq?.name}</h2>
              </div>
              <div className="view-toggle">
                <button className={builderTab === 'steps' ? 'active' : ''} onClick={() => setBuilderTab('steps')}>Steps</button>
                <button className={builderTab === 'rules' ? 'active' : ''} onClick={() => setBuilderTab('rules')}>Rules</button>
                <button className={builderTab === 'prospects' ? 'active' : ''} onClick={() => setBuilderTab('prospects')}>Prospects</button>
                <button className={builderTab === 'settings' ? 'active' : ''} onClick={() => setBuilderTab('settings')}>Settings</button>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
              {/* STEPS TAB */}
              {builderTab === 'steps' && (
                <>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
                    {stepTypes.map(t => (
                      <button key={t.type} className="btn btn-sm" onClick={() => { setSteps([...steps, { id: Date.now(), type: t.type, title: t.label, desc: '', day: steps.length > 0 ? steps[steps.length - 1].day + 2 : 1 }]) }}>+ {t.label}</button>
                    ))}
                  </div>
                  {steps.map((step, idx) => {
                    const st = stepTypes.find(t => t.type === step.type) || stepTypes[0]
                    const isNewDay = idx === 0 || step.day !== steps[idx - 1].day
                    return (
                      <div key={step.id}>
                        {isNewDay && <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', padding: '10px 0 4px', textTransform: 'uppercase', letterSpacing: 0.5 }}>Day {step.day}</div>}
                        <div className="seq-step">
                          <div style={{ width: 24, height: 24, borderRadius: 6, border: '2px solid #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#64748b', flexShrink: 0 }}>{idx + 1}</div>
                          <div className="step-body">
                            <div className="title">{step.title} <span className={`badge ${st.cat === 'auto' ? 'badge-blue' : 'badge-gray'}`} style={{ fontSize: 9 }}>{st.cat}</span></div>
                            <div className="desc">{step.desc}</div>
                          </div>
                          <div className="step-actions">
                            <button onClick={() => deleteStep(step.id)} title="Delete"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </>
              )}

              {/* RULES TAB */}
              {builderTab === 'rules' && (
                <div className="card">
                  <div className="card-header"><h3>Automation Rules</h3></div>
                  {rules.map(r => (
                    <div key={r.id} className="rule-row">
                      <span className="trigger">{r.trigger}</span>
                      <span style={{ color: '#94a3b8' }}>→</span>
                      <span className="action">{r.action}</span>
                      <div className={`toggle ${r.enabled ? 'on' : ''}`} onClick={() => toggleRule(r.id)} />
                    </div>
                  ))}
                </div>
              )}

              {/* PROSPECTS TAB */}
              {builderTab === 'prospects' && (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <table>
                    <thead><tr><th>Prospect</th><th>State</th><th>Step</th><th>Engagement</th><th></th></tr></thead>
                    <tbody>
                      {prospects.filter(p => p.sequenceId === selectedSeq?.id).map(p => (
                        <tr key={p.id}>
                          <td><strong>{p.name}</strong><div style={{ fontSize: 11, color: '#94a3b8' }}>{p.company} • {p.title}</div></td>
                          <td><span className={`badge ${p.state === 'active' ? 'badge-green' : 'badge-yellow'}`}>{p.state}</span></td>
                          <td>Step {p.currentStep}</td>
                          <td style={{ fontSize: 12 }}>{p.opened ? 'Opened' : ''} {p.clicked ? '• Clicked' : ''} {p.replied ? '• Replied' : ''}</td>
                          <td><button className="btn btn-sm btn-danger" onClick={() => removeProspect(p.id)}>×</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* SETTINGS TAB */}
              {builderTab === 'settings' && (
                <div className="card">
                  <div className="card-header"><h3>Sequence Settings</h3></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="form-group"><label>Send Window</label><select><option>8:00 AM — 6:00 PM (Prospect TZ)</option></select></div>
                    <div className="form-group"><label>Active Days</label><select><option>Weekdays Only</option></select></div>
                    <div className="form-group"><label>Email Throttle</label><input type="number" defaultValue={200} /></div>
                    <div className="form-group"><label>LinkedIn Limit</label><input type="number" defaultValue={50} /></div>
                  </div>
                  <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {['Pause on reply', 'Pause on bounce', 'Skip weekends', 'Auto-detect OOO'].map((s, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f8f9fb', borderRadius: 8 }}>
                        <span style={{ fontSize: 13 }}>{s}</span><div className="toggle on" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
