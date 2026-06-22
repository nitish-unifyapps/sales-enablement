import { useState, useRef, useEffect } from 'react'

const stepTypes = [
  { type: 'auto_email', label: 'Automated Email', cat: 'auto' },
  { type: 'manual_email', label: 'Manual Email', cat: 'manual' },
  { type: 'phone', label: 'Phone Call', cat: 'manual' },
  { type: 'linkedin_connect', label: 'LinkedIn Connect', cat: 'auto' },
  { type: 'linkedin_msg', label: 'LinkedIn Message', cat: 'auto' },
  { type: 'task', label: 'Generic Task', cat: 'manual' },
  { type: 'ai_branch', label: 'AI Branch', cat: 'auto' },
]

const initialSequences = [
  { id: 1, name: 'FY26 Enterprise Outbound — VP Sales', steps: 10, days: 14, tags: ['enterprise'], active: true, score: 74, prospects: { active: 248, paused: 12 }, contacted: 1420, opened: 77, replied: 28, owner: 'SK', lastRun: '12 min ago' },
  { id: 2, name: 'Inbound Demo Request (All Segments)', steps: 14, days: 21, tags: ['inbound'], active: true, score: 92, prospects: { active: 154, paused: 1 }, contacted: 1479, opened: 88, replied: 62, owner: 'MT', lastRun: '12 min ago' },
  { id: 3, name: 'PROS | C+C Manual Round1 (NAM)', steps: 17, days: 28, tags: ['create&close'], active: true, score: 26, prospects: { active: 485, paused: 256 }, contacted: 27125, opened: 52, replied: 22, owner: 'JP', lastRun: '1 hour ago' },
  { id: 4, name: 'Event Follow-up — SaaStr 2026', steps: 7, days: 10, tags: ['event'], active: true, score: 81, prospects: { active: 320, paused: 8 }, contacted: 1890, opened: 71, replied: 38, owner: 'MT', lastRun: '45 min ago' },
  { id: 5, name: 'Re-engagement — Lost Deals Q2', steps: 5, days: 21, tags: ['nurture'], active: false, score: 34, prospects: { active: 0, paused: 86 }, contacted: 640, opened: 42, replied: 8, owner: 'SK', lastRun: '3 days ago' },
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
]

const initialRules = [
  { id: 1, trigger: 'Prospect replies', action: 'Pause sequence', enabled: true },
  { id: 2, trigger: 'Meeting booked', action: 'Finish sequence (success)', enabled: true },
  { id: 3, trigger: 'Email bounced', action: 'Remove & flag', enabled: true },
  { id: 4, trigger: 'Out-of-office detected', action: 'Pause 5 days then resume', enabled: true },
  { id: 5, trigger: 'LinkedIn accepted', action: 'Skip to LinkedIn message', enabled: true },
]

const initialProspects = [
  { id: 1, name: 'Sarah Chen', company: 'Acme Corp', title: 'VP Sales', state: 'active', currentStep: 3, replied: false, sequenceId: 1 },
  { id: 2, name: 'James Park', company: 'Beta Inc', title: 'CTO', state: 'active', currentStep: 5, replied: false, sequenceId: 1 },
  { id: 3, name: 'Mike Torres', company: 'Delta LLC', title: 'Director Ops', state: 'finished_replied', currentStep: 2, replied: true, sequenceId: 2 },
  { id: 4, name: 'Lisa Wang', company: 'Omega Co', title: 'Head of Product', state: 'paused', currentStep: 4, replied: false, sequenceId: 1 },
  { id: 5, name: 'Tom Harris', company: 'Zeta Tech', title: 'CEO', state: 'active', currentStep: 1, replied: false, sequenceId: 3 },
  { id: 6, name: 'Ben Cross', company: 'Alpha Media', title: 'CMO', state: 'active', currentStep: 7, replied: false, sequenceId: 2 },
  { id: 7, name: 'Raj Patel', company: 'Lambda SaaS', title: 'Dir Sales', state: 'active', currentStep: 6, replied: false, sequenceId: 3 },
]

const copilotContexts = {
  steps: {
    greeting: "I'm ready to help build your sequence steps. I can add, remove, or modify steps. What would you like to do?",
    starters: ['Add an automated email on day 1', 'Add a LinkedIn step after day 3', 'Generate a complete 7-step sequence', 'Make the sequence more aggressive', 'Add an AI branch after step 2', 'Remove the last step']
  },
  rules: {
    greeting: "Let's configure automation rules. I can add triggers and actions that fire automatically based on prospect behavior.",
    starters: ['Add a rule: pause on reply', 'Add a rule: if email opened 3x, create call task', 'Add a rule: if no engagement after 7 days, move to nurture', 'Disable all rules', 'Show me best practice rules for cold outbound']
  },
  prospects: {
    greeting: "I can help manage prospects in this sequence. I can add prospects, remove inactive ones, or suggest which prospects need attention.",
    starters: ['Add a new prospect to this sequence', 'Remove all bounced prospects', 'Which prospects are stuck?', 'Show me prospects who haven\'t been contacted in 7 days']
  },
  settings: {
    greeting: "I can help configure sequence settings — send windows, throttles, timezone handling, and automation behavior.",
    starters: ['Set send window to 9am-5pm', 'Limit to 100 emails per day', 'Enable pause on out-of-office', 'Change to prospect timezone sending']
  },
  create: {
    greeting: "Let's create a new sequence! I'll guide you through it. First, what type of sequence are you building?\n\n1. Cold outbound prospecting\n2. Inbound follow-up\n3. Re-engagement / Nurture\n4. Event follow-up\n\nOr just describe your goal and I'll build it for you.",
    starters: ['Create a cold outbound sequence for CTOs', 'Build an inbound demo follow-up', 'I need a re-engagement sequence for lost deals', 'Create a post-event follow-up for conference attendees']
  }
}


export default function Sequences() {
  const [view, setView] = useState('list')
  const [listTab, setListTab] = useState('sequences')
  const [sequences, setSequences] = useState(initialSequences)
  const [steps, setSteps] = useState(initialSteps)
  const [rules, setRules] = useState(initialRules)
  const [prospects, setProspects] = useState(initialProspects)
  const [selectedSeq, setSelectedSeq] = useState(null)
  const [builderTab, setBuilderTab] = useState('steps')
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [pendingStep, setPendingStep] = useState(null) // for multi-turn step creation
  const [editingStep, setEditingStep] = useState(null)
  const chatEndRef = useRef(null)

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [chatMessages])

  // Reset copilot when tab changes
  useEffect(() => {
    const ctx = copilotContexts[builderTab] || copilotContexts.steps
    setChatMessages([{ role: 'ai', text: ctx.greeting }])
    setPendingStep(null)
  }, [builderTab])

  const openSequence = (seq) => { setSelectedSeq(seq); setView('builder'); setBuilderTab('steps') }
  const openCreate = () => { setView('builder'); setSelectedSeq(null); setBuilderTab('steps'); setSteps([]); setChatMessages([{ role: 'ai', text: copilotContexts.create.greeting }]) }
  const backToList = () => { setSelectedSeq(null); setView('list') }

  const handleChat = () => {
    if (!chatInput.trim()) return
    const msg = chatInput.trim()
    setChatMessages(prev => [...prev, { role: 'user', text: msg }])
    setChatInput('')
    const lower = msg.toLowerCase()

    setTimeout(() => {
      let reply = ''

      // If we're in a pending step creation flow
      if (pendingStep) {
        if (pendingStep.awaiting === 'day') {
          const day = parseInt(msg) || (steps.length > 0 ? steps[steps.length - 1].day + 2 : 1)
          const newStep = { ...pendingStep.step, day, id: Date.now() }
          setSteps(prev => [...prev, newStep])
          reply = `Added "${newStep.title}" on Day ${day}. The step is: ${newStep.desc}\n\nWant to add another step or modify this one?`
          setPendingStep(null)
        } else if (pendingStep.awaiting === 'desc') {
          const updated = { ...pendingStep.step, desc: msg }
          setPendingStep({ ...pendingStep, step: updated, awaiting: 'day' })
          reply = `Got it. What day should this step execute? (Current last step is Day ${steps.length > 0 ? steps[steps.length - 1].day : 0})`
        }
        setChatMessages(prev => [...prev, { role: 'ai', text: reply }])
        return
      }

      // STEPS tab handlers
      if (builderTab === 'steps' || !selectedSeq) {
        if (lower.includes('add') && (lower.includes('email') || lower.includes('mail'))) {
          setPendingStep({ step: { type: 'auto_email', title: 'Email Step' }, awaiting: 'desc' })
          reply = "I'll add an email step. What should the email be about? (e.g. \"Personalized intro mentioning their recent funding round\")"
        } else if (lower.includes('add') && lower.includes('linkedin')) {
          setPendingStep({ step: { type: lower.includes('connect') ? 'linkedin_connect' : 'linkedin_msg', title: lower.includes('connect') ? 'LinkedIn Connect' : 'LinkedIn Message' }, awaiting: 'desc' })
          reply = "Adding a LinkedIn step. What should the message/note say? Describe the content:"
        } else if (lower.includes('add') && (lower.includes('call') || lower.includes('phone'))) {
          setPendingStep({ step: { type: 'phone', title: 'Phone Call' }, awaiting: 'desc' })
          reply = "Adding a phone call step. What's the call objective? (e.g. \"Discovery call — identify pain points\")"
        } else if (lower.includes('add') && lower.includes('ai')) {
          setPendingStep({ step: { type: 'ai_branch', title: 'AI Decision Point' }, awaiting: 'desc' })
          reply = "Adding an AI branch. What should the AI evaluate? (e.g. \"Check sentiment: positive → meeting, objection → handler, silence → continue\")"
        } else if (lower.includes('add') && lower.includes('task')) {
          setPendingStep({ step: { type: 'task', title: 'Manual Task' }, awaiting: 'desc' })
          reply = "Adding a manual task. What should the rep do? Describe the task:"
        } else if (lower.includes('generate') || (lower.includes('create') && lower.includes('sequence'))) {
          const persona = lower.includes('cto') ? 'CTOs' : lower.includes('vp') ? 'VPs' : lower.includes('cmo') ? 'CMOs' : 'decision-makers'
          setSteps([
            { id: Date.now(), type: 'auto_email', title: 'Personalized Intro', desc: `Cold intro to ${persona} referencing trigger event`, day: 1 },
            { id: Date.now()+1, type: 'linkedin_connect', title: 'LinkedIn Connect', desc: 'Connection request with personalized note', day: 1 },
            { id: Date.now()+2, type: 'auto_email', title: 'Value-Add Follow-up', desc: 'Share relevant insight if no reply', day: 3 },
            { id: Date.now()+3, type: 'phone', title: 'Discovery Call', desc: 'Call with persona-specific talk track', day: 5 },
            { id: Date.now()+4, type: 'linkedin_msg', title: 'LinkedIn DM', desc: 'Casual message referencing previous touches', day: 6 },
            { id: Date.now()+5, type: 'ai_branch', title: 'AI: Evaluate Engagement', desc: 'Route based on engagement signals', day: 7 },
            { id: Date.now()+6, type: 'auto_email', title: 'Breakup Email', desc: 'Final touch — close loop with urgency', day: 10 },
          ])
          reply = `Generated a 7-step multi-channel sequence targeting ${persona}!\n\n✓ Day 1: Email + LinkedIn Connect\n✓ Day 3: Follow-up email\n✓ Day 5: Phone call\n✓ Day 6: LinkedIn DM\n✓ Day 7: AI evaluation\n✓ Day 10: Breakup\n\nWant me to adjust timing, add more steps, or change anything?`
        } else if (lower.includes('aggressive') || lower.includes('shorten')) {
          setSteps(prev => prev.map(s => ({ ...s, day: Math.max(1, Math.ceil(s.day * 0.6)) })))
          reply = 'Done! Compressed all delays by ~40%. The cadence is now more aggressive.'
        } else if (lower.includes('remove') && lower.includes('last')) {
          setSteps(prev => prev.slice(0, -1))
          reply = 'Removed the last step.'
        } else {
          reply = "I can help! Tell me what to do:\n• \"Add an email step\" — I'll ask for details\n• \"Add a LinkedIn connect\"\n• \"Add a phone call\"\n• \"Add an AI branch\"\n• \"Generate a complete sequence\"\n• \"Make it more aggressive\"\n• \"Remove last step\""
        }
      }
      // RULES tab handlers
      else if (builderTab === 'rules') {
        if (lower.includes('add') && lower.includes('rule')) {
          let trigger = '', action = ''
          if (lower.includes('reply')) { trigger = 'Prospect replies'; action = 'Pause sequence' }
          else if (lower.includes('open') && lower.includes('3')) { trigger = 'Email opened 3+ times'; action = 'Create urgent call task' }
          else if (lower.includes('no engagement') || lower.includes('7 day')) { trigger = 'No engagement after 7 days'; action = 'Move to nurture cadence' }
          else if (lower.includes('bounce')) { trigger = 'Email bounced'; action = 'Remove and flag' }
          else { trigger = 'Custom trigger'; action = 'Custom action' }
          setRules(prev => [...prev, { id: Date.now(), trigger, action, enabled: true }])
          reply = `Added rule: "${trigger}" → "${action}". It's enabled by default.`
        } else if (lower.includes('disable all')) {
          setRules(prev => prev.map(r => ({ ...r, enabled: false })))
          reply = 'All rules disabled.'
        } else if (lower.includes('best practice')) {
          reply = "Best practice rules for cold outbound:\n• Pause on reply (always on)\n• Finish on meeting booked\n• Remove on hard bounce\n• Pause 5d on out-of-office\n• Skip LinkedIn if email opened 3x\n\nWant me to add any of these?"
        } else {
          reply = "I can manage rules. Try:\n• \"Add a rule: pause on reply\"\n• \"Add a rule: if opened 3x, create call task\"\n• \"Disable all rules\"\n• \"Show best practice rules\""
        }
      }
      // PROSPECTS tab handlers
      else if (builderTab === 'prospects') {
        if (lower.includes('add') && lower.includes('prospect')) {
          reply = "To add a prospect, I need:\n1. Name\n2. Company\n3. Title\n\nOr you can paste an email and I'll look up the details. What's the prospect info?"
        } else if (lower.includes('remove') && lower.includes('bounced')) {
          setProspects(prev => prev.filter(p => p.state !== 'bounced'))
          reply = 'Removed all bounced prospects from this sequence.'
        } else if (lower.includes('stuck') || lower.includes('attention')) {
          const stuck = prospects.filter(p => p.sequenceId === selectedSeq?.id && p.state === 'paused')
          reply = stuck.length > 0 ? `${stuck.length} prospects are paused:\n${stuck.map(p => `• ${p.name} (${p.company}) — Step ${p.currentStep}`).join('\n')}\n\nWant me to resume them?` : 'No stuck prospects! Everyone is progressing normally.'
        } else if (lower.includes('resume')) {
          setProspects(prev => prev.map(p => p.state === 'paused' && p.sequenceId === selectedSeq?.id ? { ...p, state: 'active' } : p))
          reply = 'Resumed all paused prospects in this sequence.'
        } else {
          reply = "I can help with prospects:\n• \"Add a new prospect\"\n• \"Remove all bounced prospects\"\n• \"Which prospects are stuck?\"\n• \"Resume paused prospects\""
        }
      }
      // SETTINGS tab handlers
      else if (builderTab === 'settings') {
        if (lower.includes('send window') || lower.includes('9') && lower.includes('5')) {
          reply = 'Updated send window to 9:00 AM — 5:00 PM in prospect timezone.'
        } else if (lower.includes('throttle') || lower.includes('100') || lower.includes('limit')) {
          reply = 'Email throttle updated to 100 emails/day. LinkedIn actions capped at 50/day.'
        } else if (lower.includes('timezone')) {
          reply = 'Switched to prospect timezone sending. Emails will deliver based on each prospect\'s local time.'
        } else {
          reply = "I can adjust settings:\n• \"Set send window to 9am-5pm\"\n• \"Limit to 100 emails per day\"\n• \"Use prospect timezone\"\n• \"Enable pause on out-of-office\""
        }
      }

      setChatMessages(prev => [...prev, { role: 'ai', text: reply }])
    }, 500)
  }

  const deleteStep = (id) => setSteps(steps.filter(s => s.id !== id))
  const toggleRule = (id) => setRules(rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r))
  const removeProspect = (id) => setProspects(prospects.filter(p => p.id !== id))
  const changeProspectSeq = (pid, sid) => setProspects(prospects.map(p => p.id === pid ? { ...p, sequenceId: parseInt(sid), currentStep: 1 } : p))

  const currentContext = selectedSeq ? (copilotContexts[builderTab] || copilotContexts.steps) : copilotContexts.create


  return (
    <div>
      {/* LIST VIEW */}
      {view === 'list' && (
        <>
          <div className="topbar">
            <h2>Sequences</h2>
            <div className="actions"><button className="btn btn-primary" onClick={openCreate}>+ Create Sequence</button></div>
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
                        <td><strong>{seq.name}</strong><div style={{ fontSize: 11, color: '#94a3b8' }}>{seq.steps} steps • {seq.days}d • {seq.tags.join(', ')}</div></td>
                        <td><span className={`badge ${seq.active ? 'badge-green' : 'badge-gray'}`}>{seq.active ? 'Active' : 'Paused'}</span></td>
                        <td style={{ color: seq.score >= 70 ? '#16a34a' : seq.score >= 40 ? '#d97706' : '#dc2626', fontWeight: 700 }}>{seq.score}</td>
                        <td style={{ fontSize: 12 }}>{seq.prospects.active} active</td>
                        <td>{seq.contacted.toLocaleString()}</td>
                        <td>{seq.opened}%</td>
                        <td style={{ fontWeight: 600 }}>{seq.replied}%</td>
                        <td style={{ fontSize: 12, color: '#64748b' }}>{seq.lastRun}</td>
                        <td><div style={{ width: 24, height: 24, borderRadius: '50%', background: '#1e293b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700 }}>{seq.owner}</div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {listTab === 'prospects' && (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table>
                  <thead><tr><th>Prospect</th><th>Company</th><th>Sequence</th><th>State</th><th>Step</th><th></th></tr></thead>
                  <tbody>
                    {prospects.map(p => (
                      <tr key={p.id}>
                        <td><strong>{p.name}</strong><div style={{ fontSize: 11, color: '#94a3b8' }}>{p.title}</div></td>
                        <td>{p.company}</td>
                        <td><select value={p.sequenceId} onChange={e => changeProspectSeq(p.id, e.target.value)} style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '3px 6px', fontSize: 11 }}>{sequences.map(s => <option key={s.id} value={s.id}>{s.name.substring(0, 25)}</option>)}</select></td>
                        <td><span className={`badge ${p.state === 'active' ? 'badge-green' : p.state.includes('finished') ? 'badge-blue' : 'badge-yellow'}`}>{p.state.replace('_', ' ')}</span></td>
                        <td>{p.currentStep}</td>
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


      {/* BUILDER VIEW */}
      {view === 'builder' && (
        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', height: '100vh' }}>
          {/* LEFT: AI Copilot */}
          <div style={{ borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', background: '#fff' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>Copilot — {builderTab.charAt(0).toUpperCase() + builderTab.slice(1)}</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{selectedSeq ? 'Editing sequence' : 'Creating new sequence'}</div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {chatMessages.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{ maxWidth: '88%', padding: '9px 13px', borderRadius: m.role === 'user' ? '10px 10px 2px 10px' : '10px 10px 10px 2px', background: m.role === 'user' ? '#6366f1' : '#f1f5f9', color: m.role === 'user' ? '#fff' : '#1e293b', fontSize: 12, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {m.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Conversation starters */}
            {chatMessages.length <= 1 && (
              <div style={{ padding: '0 14px 10px', display: 'flex', flexDirection: 'column', gap: 5 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>Suggestions</div>
                {currentContext.starters.slice(0, 4).map((s, i) => (
                  <button key={i} onClick={() => setChatInput(s)} style={{ textAlign: 'left', padding: '7px 11px', background: '#f8f9fb', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 11, color: '#475569', cursor: 'pointer' }}>{s}</button>
                ))}
              </div>
            )}

            <div style={{ padding: '10px 14px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: 6 }}>
              <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleChat()} placeholder="Ask copilot..." style={{ flex: 1, padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }} />
              <button className="btn btn-primary" onClick={handleChat} style={{ padding: '9px 12px', fontSize: 12 }}>Send</button>
            </div>
          </div>

          {/* RIGHT: Content */}
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div className="topbar" style={{ position: 'static' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button className="btn btn-sm" onClick={backToList}>←</button>
                <h2 style={{ fontSize: 14 }}>{selectedSeq?.name || 'New Sequence'}</h2>
              </div>
              <div className="view-toggle">
                <button className={builderTab === 'steps' ? 'active' : ''} onClick={() => setBuilderTab('steps')}>Steps</button>
                <button className={builderTab === 'rules' ? 'active' : ''} onClick={() => setBuilderTab('rules')}>Rules</button>
                <button className={builderTab === 'prospects' ? 'active' : ''} onClick={() => setBuilderTab('prospects')}>Prospects</button>
                <button className={builderTab === 'settings' ? 'active' : ''} onClick={() => setBuilderTab('settings')}>Settings</button>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
              {/* STEPS */}
              {builderTab === 'steps' && (
                <>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
                    {stepTypes.map(t => (
                      <button key={t.type} className="btn btn-sm" onClick={() => setSteps([...steps, { id: Date.now(), type: t.type, title: t.label, desc: '', day: steps.length > 0 ? steps[steps.length - 1].day + 2 : 1 }])}>+ {t.label}</button>
                    ))}
                  </div>
                  {steps.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
                      <div style={{ fontSize: 13 }}>No steps yet. Use the copilot or buttons above to add steps.</div>
                    </div>
                  )}
                  {steps.map((step, idx) => {
                    const st = stepTypes.find(t => t.type === step.type) || stepTypes[0]
                    const isNewDay = idx === 0 || step.day !== steps[idx - 1]?.day
                    return (
                      <div key={step.id}>
                        {isNewDay && <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', padding: '10px 0 4px', textTransform: 'uppercase' }}>Day {step.day}</div>}
                        <div className="seq-step">
                          <div style={{ width: 22, height: 22, borderRadius: 5, border: '2px solid #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#64748b', flexShrink: 0 }}>{idx + 1}</div>
                          <div className="step-body">
                            <div className="title">{step.title} <span className={`badge ${st.cat === 'auto' ? 'badge-blue' : 'badge-gray'}`} style={{ fontSize: 9 }}>{st.cat}</span></div>
                            {step.desc && <div className="desc">{step.desc}</div>}
                          </div>
                          <div className="step-actions">
                            <button onClick={() => setEditingStep(step)} title="Edit"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                            <button onClick={() => deleteStep(step.id)} title="Delete"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </>
              )}

              {/* RULES */}
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

              {/* PROSPECTS */}
              {builderTab === 'prospects' && (
                <>
                  <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 16 }}>
                    <div className="stat-box"><div className="value">{prospects.filter(p => p.sequenceId === selectedSeq?.id).length}</div><div className="label">Total</div></div>
                    <div className="stat-box"><div className="value">{prospects.filter(p => p.sequenceId === selectedSeq?.id && p.state === 'active').length}</div><div className="label">Active</div></div>
                    <div className="stat-box"><div className="value">{prospects.filter(p => p.sequenceId === selectedSeq?.id && p.replied).length}</div><div className="label">Replied</div></div>
                    <div className="stat-box"><div className="value">{prospects.filter(p => p.sequenceId === selectedSeq?.id && p.state === 'paused').length}</div><div className="label">Paused</div></div>
                  </div>
                  <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table>
                      <thead><tr><th>Prospect</th><th>Company</th><th>State</th><th>Current Step</th><th>Replied</th><th>Actions</th></tr></thead>
                      <tbody>
                        {prospects.filter(p => p.sequenceId === selectedSeq?.id).map(p => (
                          <tr key={p.id}>
                            <td><strong>{p.name}</strong><div style={{ fontSize: 11, color: '#94a3b8' }}>{p.title}</div></td>
                            <td>{p.company}</td>
                            <td><span className={`badge ${p.state === 'active' ? 'badge-green' : p.state.includes('finished') ? 'badge-blue' : p.state === 'bounced' ? 'badge-red' : 'badge-yellow'}`}>{p.state.replace('_', ' ')}</span></td>
                            <td>Step {p.currentStep} / {steps.length}</td>
                            <td style={{ color: p.replied ? '#16a34a' : '#94a3b8' }}>{p.replied ? 'Yes' : 'No'}</td>
                            <td style={{ display: 'flex', gap: 4 }}>
                              {p.state === 'active' && <button className="btn btn-sm" onClick={() => setProspects(prospects.map(pr => pr.id === p.id ? { ...pr, state: 'paused' } : pr))}>Pause</button>}
                              {p.state === 'paused' && <button className="btn btn-sm" onClick={() => setProspects(prospects.map(pr => pr.id === p.id ? { ...pr, state: 'active' } : pr))}>Resume</button>}
                              <button className="btn btn-sm btn-danger" onClick={() => removeProspect(p.id)}>×</button>
                            </td>
                          </tr>
                        ))}
                        {prospects.filter(p => p.sequenceId === selectedSeq?.id).length === 0 && (
                          <tr><td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8', padding: 30 }}>No prospects. Ask copilot to add some.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* SETTINGS */}
              {builderTab === 'settings' && (
                <div className="card">
                  <div className="card-header"><h3>Settings</h3></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div className="form-group"><label>Send Window</label><select><option>8:00 AM — 6:00 PM</option><option>9:00 AM — 5:00 PM</option></select></div>
                    <div className="form-group"><label>Active Days</label><select><option>Weekdays</option><option>All Days</option></select></div>
                    <div className="form-group"><label>Email Throttle/day</label><input type="number" defaultValue={200} /></div>
                    <div className="form-group"><label>LinkedIn Limit/day</label><input type="number" defaultValue={50} /></div>
                  </div>
                  {['Pause on reply', 'Pause on bounce', 'Skip weekends', 'Auto-detect OOO'].map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f8f9fb', borderRadius: 8, marginTop: 8 }}>
                      <span style={{ fontSize: 13 }}>{s}</span><div className="toggle on" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* EDIT STEP MODAL */}
      {editingStep && (
        <div className="modal-backdrop" onClick={() => setEditingStep(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Edit Step</h3>
            <div className="form-group">
              <label>Step Type</label>
              <select value={editingStep.type} onChange={e => setEditingStep({ ...editingStep, type: e.target.value })}>
                {stepTypes.map(t => <option key={t.type} value={t.type}>{t.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Title</label>
              <input value={editingStep.title} onChange={e => setEditingStep({ ...editingStep, title: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Description / Content</label>
              <textarea value={editingStep.desc} onChange={e => setEditingStep({ ...editingStep, desc: e.target.value })} placeholder="Step instructions, message content..." />
            </div>
            <div className="form-group">
              <label>Day</label>
              <input type="number" min="1" value={editingStep.day} onChange={e => setEditingStep({ ...editingStep, day: parseInt(e.target.value) || 1 })} />
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={() => setEditingStep(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => { setSteps(steps.map(s => s.id === editingStep.id ? editingStep : s)); setEditingStep(null) }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
