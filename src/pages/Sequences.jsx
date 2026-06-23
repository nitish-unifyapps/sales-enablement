import { useState, useRef, useEffect } from 'react'
import Copilot from './Copilot'

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
  id: 'start', type: 'trigger', title: 'Lead Enters Sequence', desc: 'New prospect added', day: 0,
  next: [{
    id: 'd1_email', type: 'auto_email', title: 'Intro Email', desc: 'Personalized cold intro', day: 1,
    next: [{
      id: 'd1_li', type: 'linkedin_connect', title: 'LinkedIn Connect', desc: 'Connection request with note', day: 1,
      next: [{
        id: 'c1', type: 'condition', title: 'Email Opened?', desc: '', day: 2,
        branches: [
          { label: 'YES', color: '#16a34a', next: [{
            id: 'c2', type: 'condition', title: 'Link Clicked?', desc: '', day: 2,
            branches: [
              { label: 'YES', color: '#16a34a', next: [{
                id: 'd3_hotcall', type: 'phone', title: 'Priority Call', desc: 'High-intent — call now', day: 3,
                next: [{
                  id: 'c3', type: 'condition', title: 'Call Connected?', desc: '', day: 3,
                  branches: [
                    { label: 'YES', color: '#16a34a', next: [{ id: 'end_book', type: 'ai_branch', title: 'AI: Book Meeting', desc: 'Auto-schedule via agent', day: 3, next: [] }] },
                    { label: 'NO', color: '#dc2626', next: [{ id: 'd4_vm', type: 'auto_email', title: 'Voicemail + Email', desc: 'Reference call attempt', day: 4, next: [] }] }
                  ]
                }]
              }] },
              { label: 'NO', color: '#dc2626', next: [{
                id: 'd3_warmcall', type: 'phone', title: 'Warm Call', desc: 'Opened email — good timing', day: 3,
                next: [{
                  id: 'c4', type: 'condition', title: 'Connected?', desc: '', day: 3,
                  branches: [
                    { label: 'YES', color: '#16a34a', next: [{ id: 'd3_qualify', type: 'task', title: 'Qualify + Next Steps', desc: 'Discovery on call', day: 3, next: [] }] },
                    { label: 'NO', color: '#dc2626', next: [{ id: 'd5_case', type: 'auto_email', title: 'Case Study Email', desc: 'Social proof follow-up', day: 5, next: [] }] }
                  ]
                }]
              }] }
            ]
          }] },
          { label: 'NO', color: '#dc2626', next: [{
            id: 'c5', type: 'condition', title: 'LinkedIn Accepted?', desc: '', day: 3,
            branches: [
              { label: 'YES', color: '#16a34a', next: [{
                id: 'd4_lidm', type: 'linkedin_msg', title: 'LinkedIn DM', desc: 'Mention email + ask for time', day: 4,
                next: [{
                  id: 'c6', type: 'condition', title: 'DM Replied?', desc: '', day: 5,
                  branches: [
                    { label: 'YES', color: '#16a34a', next: [{ id: 'end_book2', type: 'ai_branch', title: 'AI: Schedule', desc: 'Book meeting from DM', day: 5, next: [] }] },
                    { label: 'NO', color: '#dc2626', next: [{ id: 'd7_break1', type: 'auto_email', title: 'Breakup Email', desc: 'Final attempt', day: 7, next: [] }] }
                  ]
                }]
              }] },
              { label: 'NO', color: '#dc2626', next: [{
                id: 'd4_retry', type: 'auto_email', title: 'Follow-up Email #2', desc: 'New angle/subject line', day: 4,
                next: [{
                  id: 'c7', type: 'condition', title: 'Email #2 Opened?', desc: '', day: 5,
                  branches: [
                    { label: 'YES', color: '#16a34a', next: [{ id: 'd6_call2', type: 'phone', title: 'Follow-up Call', desc: 'They engaged — try now', day: 6, next: [] }] },
                    { label: 'NO', color: '#dc2626', next: [{ id: 'd7_break2', type: 'auto_email', title: 'Breakup Email', desc: 'Close the loop', day: 7, next: [] }] }
                  ]
                }]
              }] }
            ]
          }] }
        ]
      }]
    }]
  }]
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
  const [builderTab, setBuilderTab] = useState('cards')
  const [selectedStep, setSelectedStep] = useState(null)
  const [copilotOpen, setCopilotOpen] = useState(true)

  // Block-based structure: each day has blocks, blocks can be unconditional (steps) or conditional (conditions + steps)
  const [cardBlocks, setCardBlocks] = useState([
    { id: 'b1', day: 1, type: 'steps', conditions: [], steps: [
      { id: 1, type: 'auto_email', title: 'Intro Email', desc: 'Personalized cold intro with {{company_industry}} reference', metrics: { replyRate: 12, openRate: 64, sent: 248 } },
      { id: 2, type: 'linkedin_connect', title: 'LinkedIn Connect', desc: 'Connection request with personalized note', metrics: { replyRate: 0, openRate: 42, sent: 248 } },
    ]},
    { id: 'b2', day: 3, type: 'conditional', conditions: [{ id: 'c1', from: 'Intro Email', condition: 'Email opened' }, { id: 'c2', from: 'Intro Email', condition: 'Link clicked' }], steps: [
      { id: 3, type: 'phone', title: 'Priority Call', desc: 'High-intent prospect — call immediately', metrics: { logged: 34 } },
      { id: 4, type: 'ai_branch', title: 'AI: Book Meeting', desc: 'Auto-schedule via calendar agent', metrics: {} },
    ]},
    { id: 'b3', day: 3, type: 'conditional', conditions: [{ id: 'c3', from: 'Intro Email', condition: 'Email opened' }, { id: 'c4', from: 'Intro Email', condition: 'No link click' }], steps: [
      { id: 5, type: 'phone', title: 'Warm Call', desc: 'They opened email — good timing to call', metrics: { logged: 42 } },
      { id: 6, type: 'task', title: 'Qualify + Next Steps', desc: 'Discovery conversation — qualify the lead', metrics: {} },
    ]},
    { id: 'b4', day: 4, type: 'conditional', conditions: [{ id: 'c5', from: 'Priority Call', condition: 'No answer' }], steps: [
      { id: 7, type: 'auto_email', title: 'Voicemail + Email', desc: 'Reference the call attempt, offer meeting link', metrics: { replyRate: 8, openRate: 52, sent: 18 } },
    ]},
    { id: 'b5', day: 4, type: 'conditional', conditions: [{ id: 'c6', from: 'Intro Email', condition: 'Not opened' }, { id: 'c7', from: 'LinkedIn Connect', condition: 'Accepted' }], steps: [
      { id: 8, type: 'linkedin_msg', title: 'LinkedIn DM', desc: 'Mention email + ask for quick chat', metrics: { replyRate: 18, sent: 64 } },
    ]},
    { id: 'b6', day: 4, type: 'conditional', conditions: [{ id: 'c8', from: 'Intro Email', condition: 'Not opened' }, { id: 'c9', from: 'LinkedIn Connect', condition: 'Not accepted' }], steps: [
      { id: 9, type: 'auto_email', title: 'Follow-up Email #2', desc: 'Different angle — new subject line', metrics: { replyRate: 5, openRate: 38, sent: 86 } },
    ]},
    { id: 'b7', day: 5, type: 'conditional', conditions: [{ id: 'c10', from: 'Warm Call', condition: 'No answer' }], steps: [
      { id: 10, type: 'auto_email', title: 'Case Study Email', desc: 'Send relevant social proof + CTA', metrics: { replyRate: 6, openRate: 48, sent: 28 } },
    ]},
    { id: 'b8', day: 5, type: 'conditional', conditions: [{ id: 'c11', from: 'LinkedIn DM', condition: 'Replied' }], steps: [
      { id: 11, type: 'ai_branch', title: 'AI: Schedule Meeting', desc: 'Auto-book from LinkedIn reply', metrics: {} },
    ]},
    { id: 'b9', day: 6, type: 'conditional', conditions: [{ id: 'c12', from: 'Follow-up Email #2', condition: 'Email opened' }], steps: [
      { id: 12, type: 'phone', title: 'Follow-up Call', desc: 'They engaged with email #2 — call now', metrics: { logged: 22 } },
    ]},
    { id: 'b10', day: 7, type: 'conditional', conditions: [{ id: 'c13', from: 'LinkedIn DM', condition: 'No reply' }, { id: 'c14', from: 'Follow-up Email #2', condition: 'Not opened' }], steps: [
      { id: 13, type: 'auto_email', title: 'Breakup Email', desc: 'Final touch — close the loop with urgency', metrics: { replyRate: 4, openRate: 45, sent: 108 } },
    ]},
  ])

  // Helpers for block manipulation
  const allStepTitles = cardBlocks.flatMap(b => b.steps.map(s => s.title))
  const addStepToBlock = (blockId) => { setCardBlocks(cardBlocks.map(b => b.id === blockId ? { ...b, steps: [...b.steps, { id: Date.now(), type: 'auto_email', title: 'New Step', desc: '', metrics: {} }] } : b)) }
  const addConditionToBlock = (blockId) => { setCardBlocks(cardBlocks.map(b => b.id === blockId ? { ...b, conditions: [...b.conditions, { id: 'c' + Date.now(), from: allStepTitles[0] || '', condition: 'No reply' }] } : b)) }
  const removeConditionFromBlock = (blockId, condIdx) => { setCardBlocks(cardBlocks.map(b => b.id === blockId ? { ...b, conditions: b.conditions.filter((_, i) => i !== condIdx) } : b)) }
  const removeStepFromBlock = (blockId, stepId) => { setCardBlocks(cardBlocks.map(b => b.id === blockId ? { ...b, steps: b.steps.filter(s => s.id !== stepId) } : b)) }
  const addBlock = (day, type) => { setCardBlocks([...cardBlocks, { id: 'b' + Date.now(), day, type, conditions: type === 'conditional' ? [{ id: 'c' + Date.now(), from: allStepTitles[allStepTitles.length - 1] || '', condition: 'No reply' }] : [], steps: [{ id: Date.now(), type: 'auto_email', title: 'New Step', desc: '', metrics: {} }] }]) }
  const addNewDay = () => { const lastDay = Math.max(...cardBlocks.map(b => b.day), 0); addBlock(lastDay + 2, 'steps') }
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [pendingStep, setPendingStep] = useState(null)

  useEffect(() => {
    const ctx = copilotContexts[builderTab] || copilotContexts.steps
    setChatMessages([{ role: 'ai', text: ctx.greeting }])
    setPendingStep(null)
  }, [builderTab])

  const openSequence = (seq) => { setSelectedSeq(seq); setView('builder'); setBuilderTab('cards') }
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
      <div onClick={() => !isTrigger && setSelectedStep(node)} style={{ padding: isTrigger ? '10px 20px' : '12px 16px', background: isTrigger ? '#16a34a' : isSelected ? '#fff5ed' : '#fff', color: isTrigger ? '#fff' : '#1e293b', border: isTrigger ? 'none' : `2px solid ${isSelected ? '#FE7916' : '#e5e7eb'}`, borderRadius: isTrigger ? 24 : isCondition ? 12 : 10, cursor: isTrigger ? 'default' : 'pointer', minWidth: 140, textAlign: 'center', boxShadow: isSelected ? '0 4px 12px rgba(99,102,241,.12)' : '0 1px 4px rgba(0,0,0,.04)' }}>
        {!isTrigger && <div style={{ fontSize: 9, color: isSelected ? '#FE7916' : '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: 3 }}>{st.label}</div>}
        <div style={{ fontSize: 12, fontWeight: 600 }}>{node.title}</div>
        {node.desc && !isTrigger && !isCondition && <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 3 }}>{node.desc.substring(0, 40)}</div>}
        {node.day > 0 && !isTrigger && <div style={{ fontSize: 9, color: '#FE7916', marginTop: 4 }}>Day {node.day}</div>}
      </div>
    )

    // Condition: show node, then split into columns side by side
    if (isCondition && node.branches) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {nodeBox}
          {/* Vertical line down from condition */}
          <div style={{ width: 2, height: 16, background: '#d1d5db' }} />
          {/* Horizontal line spanning branches */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start' }}>
            {/* Horizontal bar connecting all branches */}
            <div style={{ position: 'absolute', top: 0, left: '25%', right: '25%', height: 2, background: '#d1d5db' }} />
            {/* Branches side by side */}
            {node.branches.map((branch, bi) => (
              <div key={bi} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 160, padding: '0 16px' }}>
                {/* Vertical line from horizontal bar down to label */}
                <div style={{ width: 2, height: 16, background: branch.color }} />
                {/* Branch label */}
                <span style={{ fontSize: 10, fontWeight: 700, color: branch.color, background: branch.color + '15', padding: '3px 10px', borderRadius: 10, marginBottom: 6 }}>{branch.label}</span>
                {/* Vertical connector to children */}
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
          <div style={{ width: copilotOpen ? 300 : 0, overflow: 'hidden', transition: 'width .2s', flexShrink: 0 }}>
            <Copilot title="Copilot" subtitle={builderTab === 'cards' ? 'Steps Builder' : builderTab} messages={chatMessages} starters={currentCtx.starters} input={chatInput} setInput={setChatInput} onSend={handleChat} onClose={() => setCopilotOpen(false)} />
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
                <button className={builderTab === 'cards' ? 'active' : ''} onClick={() => setBuilderTab('cards')}>Steps</button>
                <button className={builderTab === 'steps' ? 'active' : ''} onClick={() => setBuilderTab('steps')}>Flow</button>
                <button className={builderTab === 'prospects' ? 'active' : ''} onClick={() => setBuilderTab('prospects')}>Prospects</button>
                <button className={builderTab === 'settings' ? 'active' : ''} onClick={() => setBuilderTab('settings')}>Settings</button>
              </div>
            </div>

            {/* Canvas area */}
            <div style={{ flex: 1, overflow: 'auto', background: '#fafbfc', position: 'relative' }}>

              {/* CARDS VIEW — block-based builder */}
              {builderTab === 'cards' && (
                <div style={{ padding: 20 }}>
                  {/* Auto-exit bar */}
                  <div style={{ display: 'flex', gap: 8, padding: '10px 14px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#475569' }}>EXIT ON:</span>
                    {['Reply', 'Meeting Booked', 'Opt-out', 'Bounce'].map((e, i) => (
                      <span key={i} style={{ fontSize: 10, padding: '2px 8px', background: '#f0fdf4', border: '1px solid #dcfce7', borderRadius: 10, color: '#16a34a' }}>{e}</span>
                    ))}
                    <span style={{ fontSize: 9, color: '#7B9CAF', marginLeft: 'auto' }}>Outbound • All Tiers</span>
                  </div>

                  {/* Blocks grouped by day */}
                  {[...new Set(cardBlocks.map(b => b.day))].sort((a, b) => a - b).map((day, dayIdx) => {
                    const dayBlocks = cardBlocks.filter(b => b.day === day)
                    return (
                      <div key={day} style={{ marginBottom: 24 }}>
                        {/* Day header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                          <div style={{ background: '#FE7916', color: '#fff', fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 4 }}>DAY {day}</div>
                          <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
                          {dayIdx > 0 && <span style={{ fontSize: 9, color: '#7B9CAF' }}>+{day - [...new Set(cardBlocks.map(b => b.day))].sort((a,b)=>a-b)[dayIdx-1]}d wait</span>}
                        </div>

                        {/* Blocks for this day */}
                        {dayBlocks.map((block) => (
                          <div key={block.id} style={{ marginBottom: 12, marginLeft: block.type === 'conditional' ? 0 : 0 }}>
                            {/* Condition header for conditional blocks */}
                            {block.type === 'conditional' && (
                              <div style={{ padding: '8px 14px', background: '#fafbfc', border: '1px solid #f1f5f9', borderRadius: '8px 8px 0 0', borderLeft: '3px solid #FE7916', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                <span style={{ fontSize: 10, fontWeight: 700, color: '#FE7916' }}>IF</span>
                                {block.conditions.map((c, ci) => (
                                  <span key={c.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                    {ci > 0 && <span style={{ fontSize: 9, color: '#7B9CAF', fontWeight: 600 }}>AND</span>}
                                    <span style={{ fontSize: 10, padding: '3px 8px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 4, color: '#475569' }}>{c.from} — {c.condition}</span>
                                    <button onClick={() => removeConditionFromBlock(block.id, ci)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 12, padding: 0, lineHeight: 1 }}>‒</button>
                                  </span>
                                ))}
                                <button onClick={() => addConditionToBlock(block.id)} style={{ width: 18, height: 18, borderRadius: 4, border: '1px dashed #FE7916', background: '#fff', color: '#FE7916', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>+</button>
                              </div>
                            )}

                            {/* Steps inside the block */}
                            <div style={{ border: block.type === 'conditional' ? '1px solid #f1f5f9' : 'none', borderTop: block.type === 'conditional' ? 'none' : undefined, borderRadius: block.type === 'conditional' ? '0 0 8px 8px' : 0, borderLeft: block.type === 'conditional' ? '3px solid #FE7916' : 'none', overflow: 'hidden' }}>
                              {block.steps.map((step) => {
                                const isSelected = selectedStep?.id === step.id
                                return (
                                  <div key={step.id} onClick={() => setSelectedStep({ ...step, blockId: block.id })} style={{ background: isSelected ? '#fff8f3' : '#fff', borderBottom: '1px solid #f8f9fb', padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, transition: 'background .1s' }}>
                                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: isSelected ? '#FE7916' : '#d1d5db', flexShrink: 0 }} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{ fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                                        {step.title}
                                        <span style={{ fontSize: 9, padding: '1px 6px', background: '#f1f5f9', borderRadius: 3, color: '#7B9CAF' }}>{stepTypes.find(t => t.type === step.type)?.label}</span>
                                      </div>
                                      {step.desc && <div style={{ fontSize: 10, color: '#7B9CAF', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{step.desc}</div>}
                                    </div>
                                    <div style={{ display: 'flex', gap: 10, flexShrink: 0, fontSize: 10 }}>
                                      {step.metrics?.openRate > 0 && <div style={{ textAlign: 'center' }}><div style={{ fontWeight: 700, fontSize: 12 }}>{step.metrics.openRate}%</div><div style={{ color: '#7B9CAF' }}>Open</div></div>}
                                      {step.metrics?.replyRate > 0 && <div style={{ textAlign: 'center' }}><div style={{ fontWeight: 700, fontSize: 12 }}>{step.metrics.replyRate}%</div><div style={{ color: '#7B9CAF' }}>Reply</div></div>}
                                      {step.metrics?.sent > 0 && <div style={{ textAlign: 'center' }}><div style={{ fontWeight: 700, fontSize: 12 }}>{step.metrics.sent}</div><div style={{ color: '#7B9CAF' }}>Sent</div></div>}
                                      {step.metrics?.logged > 0 && <div style={{ textAlign: 'center' }}><div style={{ fontWeight: 700, fontSize: 12 }}>{step.metrics.logged}</div><div style={{ color: '#7B9CAF' }}>Calls</div></div>}
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); removeStepFromBlock(block.id, step.id) }} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 14, padding: '0 4px', opacity: 0.5 }}>‒</button>
                                  </div>
                                )
                              })}
                              {/* Add step within block */}
                              <div onClick={() => addStepToBlock(block.id)} style={{ padding: '8px 14px', cursor: 'pointer', color: '#7B9CAF', fontSize: 10, textAlign: 'center', background: '#fafbfc' }}>+ Add step here</div>
                            </div>
                          </div>
                        ))}

                        {/* Add block buttons */}
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                          <button onClick={() => addBlock(day, 'steps')} style={{ padding: '5px 12px', background: '#fff', border: '1px dashed #e5e7eb', borderRadius: 6, fontSize: 10, color: '#7B9CAF', cursor: 'pointer' }}>+ Steps</button>
                          <button onClick={() => addBlock(day, 'conditional')} style={{ padding: '5px 12px', background: '#fff', border: '1px dashed #FE7916', borderRadius: 6, fontSize: 10, color: '#FE7916', cursor: 'pointer' }}>+ Conditional Block</button>
                        </div>
                      </div>
                    )
                  })}

                  {/* Add new day */}
                  <div style={{ textAlign: 'center', marginTop: 8 }}>
                    <button onClick={addNewDay} style={{ padding: '8px 16px', background: '#fff', border: '1px dashed #e5e7eb', borderRadius: 8, fontSize: 11, color: '#7B9CAF', cursor: 'pointer' }}>+ Add Day</button>
                  </div>
                </div>
              )}

              {/* FLOW VIEW */}
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
          {selectedStep && (builderTab === 'steps' || builderTab === 'cards') && (
            <div style={{ width: 320, borderLeft: '1px solid #e5e7eb', background: '#fff', overflowY: 'auto', flexShrink: 0 }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>Step Properties</span>
                <button onClick={() => setSelectedStep(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#94a3b8' }}>×</button>
              </div>
              <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="form-group"><label>Type</label>
                  <select value={selectedStep.type} onChange={e => { const u = { ...selectedStep, type: e.target.value }; setSelectedStep(u); setCardBlocks(cardBlocks.map(b => b.id === selectedStep.blockId ? { ...b, steps: b.steps.map(s => s.id === u.id ? u : s) } : b)) }}>
                    {stepTypes.map(t => <option key={t.type} value={t.type}>{t.label}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Title</label>
                  <input value={selectedStep.title} onChange={e => { const u = { ...selectedStep, title: e.target.value }; setSelectedStep(u); setCardBlocks(cardBlocks.map(b => b.id === selectedStep.blockId ? { ...b, steps: b.steps.map(s => s.id === u.id ? u : s) } : b)) }} />
                </div>
                <div className="form-group"><label>Description</label>
                  <textarea value={selectedStep.desc || ''} onChange={e => { const u = { ...selectedStep, desc: e.target.value }; setSelectedStep(u); setCardBlocks(cardBlocks.map(b => b.id === selectedStep.blockId ? { ...b, steps: b.steps.map(s => s.id === u.id ? u : s) } : b)) }} style={{ minHeight: 60 }} />
                </div>
                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div className="form-group"><label>Send Window</label><select defaultValue="8am-6pm"><option>8am — 6pm</option><option>9am — 5pm</option><option>Morning only</option></select></div>
                  <div className="form-group"><label>Priority</label><select defaultValue="normal"><option value="high">High</option><option value="normal">Normal</option><option value="low">Low</option></select></div>
                  <div className="form-group"><label>Template</label>
                    <select value={selectedStep.template || ''} onChange={e => { const u = { ...selectedStep, template: e.target.value }; setSelectedStep(u); setCardBlocks(cardBlocks.map(b => b.id === selectedStep.blockId ? { ...b, steps: b.steps.map(s => s.id === u.id ? u : s) } : b)) }}>
                      <option value="">None</option><option>CXO Value Prop — Q3</option><option>Follow-up After No Reply</option><option>LinkedIn Warm Connect</option><option>Cold Call — Discovery</option><option>Breakup Email</option><option>Case Study Share</option>
                    </select>
                  </div>
                </div>
                <button className="btn btn-danger" style={{ marginTop: 8 }} onClick={() => { removeStepFromBlock(selectedStep.blockId, selectedStep.id); setSelectedStep(null) }}>Delete Step</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
