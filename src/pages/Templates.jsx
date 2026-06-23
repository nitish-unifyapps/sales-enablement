import { useState, useRef, useEffect } from 'react'
import Copilot from './Copilot'
import TemplateEditor from './TemplateEditor'

const initialTemplates = [
  { id: 1, name: 'CXO Value Prop — Q3', type: 'Email', owner: 'Marketing', subject: 'Quick question regarding {{company_industry}}', body: 'Hi {{first_name}},\n\nI noticed {{company}} recently expanded into {{company_industry}}...', openRate: 64, replyRate: 12, meetings: 8, sent: 142 },
  { id: 2, name: 'LinkedIn Connection — Warm', type: 'LinkedIn', owner: 'Sales', subject: '', body: 'Hi {{first_name}}, came across your work at {{company}} — impressed by {{recent_achievement}}.', openRate: 42, replyRate: 18, meetings: 12, sent: 386 },
  { id: 3, name: 'Follow-Up After Demo', type: 'Email', owner: 'Sales', subject: 'Re: Our conversation about {{use_case}}', body: 'Thanks for the time today, {{first_name}}.\n\nBased on what you shared about {{pain_point}}...', openRate: 72, replyRate: 24, meetings: 18, sent: 89 },
  { id: 4, name: 'Cold Call Script — Discovery', type: 'Call Script', owner: 'Sales Ops', subject: '', body: 'Opening: "Hi {{first_name}}, this is {{sender_name}} from {{sender_company}}..."\nPurpose: Identify pain point around {{pain_point}}', openRate: 28, replyRate: 14, meetings: 22, sent: 210 },
  { id: 5, name: 'Breakup Email', type: 'Email', owner: 'Sales', subject: 'Closing the loop, {{first_name}}', body: '{{first_name}}, I\'ve reached out a few times and haven\'t heard back...', openRate: 45, replyRate: 6, meetings: 4, sent: 298 },
]

const templateStarters = [
  'Create an intro email for VP of Sales',
  'Write a follow-up for someone who opened but didn\'t reply',
  'Generate a LinkedIn connection message',
  'Create a breakup email with urgency',
  'Improve my open rate — rewrite the subject line',
  'Make this template shorter and more direct',
]

export default function Templates() {
  const [templates, setTemplates] = useState(initialTemplates)
  const [editorMode, setEditorMode] = useState(null)
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [chatMessages, setChatMessages] = useState([{ role: 'ai', text: 'I can help you create and optimize templates. Ask me to generate emails, LinkedIn messages, call scripts, or improve existing ones.' }])
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
      if (lower.includes('intro') || lower.includes('cold email') || (lower.includes('create') && lower.includes('email'))) {
        const persona = lower.includes('vp') ? 'VP' : lower.includes('cto') ? 'CTO' : lower.includes('cmo') ? 'CMO' : 'decision-maker'
        const newTpl = { id: Date.now(), name: `AI: Intro Email — ${persona}`, type: 'Email', owner: 'AI Generated', subject: `Quick thought on {{company_industry}}, {{first_name}}`, body: `Hi {{first_name}},\n\nI came across {{company}} and noticed {{trigger_event}}. Many ${persona}s in {{company_industry}} are dealing with {{pain_point}} right now.\n\nWe helped {{similar_company}} achieve {{result}} — thought it might resonate.\n\nWorth a 15-min chat?\n\n{{sender_name}}`, openRate: 0, replyRate: 0, meetings: 0, sent: 0 }
        setTemplates(prev => [newTpl, ...prev])
        reply = `Created "${newTpl.name}"! It's now at the top of your template list. You can click "Edit" to refine it with the full editor and variable panel.`
      } else if (lower.includes('linkedin') || lower.includes('connection')) {
        const newTpl = { id: Date.now(), name: 'AI: LinkedIn Connect — Personalized', type: 'LinkedIn', owner: 'AI Generated', subject: '', body: `Hi {{first_name}}, noticed your work at {{company}} — particularly {{recent_achievement}}. I help teams in {{company_industry}} with {{use_case}}. Would love to connect.`, openRate: 0, replyRate: 0, meetings: 0, sent: 0 }
        setTemplates(prev => [newTpl, ...prev])
        reply = 'Created a personalized LinkedIn connection template! It references their recent achievement and ties it to your value prop.'
      } else if (lower.includes('breakup') || lower.includes('final')) {
        const newTpl = { id: Date.now(), name: 'AI: Breakup — Closing Loop', type: 'Email', owner: 'AI Generated', subject: `Closing the loop, {{first_name}}`, body: `{{first_name}},\n\nI've reached out a few times without hearing back — totally understand if the timing isn't right.\n\nI'll close this out, but if {{pain_point}} becomes a priority, my door's open.\n\nWishing you and {{company}} all the best.\n\n{{sender_name}}`, openRate: 0, replyRate: 0, meetings: 0, sent: 0 }
        setTemplates(prev => [newTpl, ...prev])
        reply = 'Created a breakup email template. It closes the loop gracefully while leaving the door open.'
      } else if (lower.includes('follow') || lower.includes('opened')) {
        const newTpl = { id: Date.now(), name: 'AI: Follow-up — Opened No Reply', type: 'Email', owner: 'AI Generated', subject: `Re: {{previous_subject}}`, body: `{{first_name}},\n\nI noticed you had a chance to look at my previous note. Wanted to add one thought:\n\n{{personalized_opener}}\n\nWould {{meeting_times}} work for a quick chat?\n\n{{sender_name}}`, openRate: 0, replyRate: 0, meetings: 0, sent: 0 }
        setTemplates(prev => [newTpl, ...prev])
        reply = 'Created a follow-up template for prospects who opened but didn\'t reply. It acknowledges the open signal without being pushy.'
      } else if (lower.includes('improve') || lower.includes('rewrite') || lower.includes('shorter')) {
        reply = 'To improve a specific template, click "Edit" on that template to open the full editor. I\'ll have the variable panel ready for you. Or tell me which template name and I\'ll suggest improvements here.'
      } else {
        reply = "I can help with templates! Try:\n• \"Create an intro email for VPs\"\n• \"Write a LinkedIn connection message\"\n• \"Create a breakup email\"\n• \"Generate a follow-up for opened-no-reply\"\n\nOr click Edit on any template to use the full editor with the variable panel."
      }
      setChatMessages(prev => [...prev, { role: 'ai', text: reply }])
    }, 500)
  }

  const openEdit = (t) => { setEditingTemplate(t); setEditorMode('edit') }
  const handleSave = (data) => {
    if (editorMode === 'edit' && editingTemplate) {
      setTemplates(templates.map(t => t.id === editingTemplate.id ? { ...t, ...data } : t))
    } else {
      setTemplates([{ id: Date.now(), ...data, openRate: 0, replyRate: 0, meetings: 0, sent: 0 }, ...templates])
    }
    setEditorMode(null); setEditingTemplate(null)
  }

  if (editorMode) return <TemplateEditor template={editingTemplate} onSave={handleSave} onCancel={() => { setEditorMode(null); setEditingTemplate(null) }} />

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', height: '100vh' }}>
      {/* LEFT: Copilot */}
      <div style={{ width: 320 }}>
        <Copilot title="Template Copilot" subtitle="Generate & refine with AI" messages={chatMessages} starters={templateStarters.slice(0, 4)} input={chatInput} setInput={setChatInput} onSend={handleChat} />
      </div>

      {/* RIGHT: Template List */}
      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="topbar" style={{ position: 'static' }}>
          <h2 style={{ fontSize: 15 }}>Templates</h2>
          <button className="btn btn-primary" onClick={() => { setEditingTemplate(null); setEditorMode('create') }}>+ Create Manually</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {templates.map(t => (
            <div key={t.id} className="template-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="name">{t.name}</div>
                  <div className="meta">{t.type} — {t.owner}</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-sm" onClick={() => openEdit(t)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => setTemplates(templates.filter(x => x.id !== t.id))}>×</button>
                </div>
              </div>
              <div className="metrics">
                <div className="metric"><div className="val">{t.openRate}%</div><div className="lbl">Open</div></div>
                <div className="metric"><div className="val">{t.replyRate}%</div><div className="lbl">Reply</div></div>
                <div className="metric"><div className="val">{t.meetings}</div><div className="lbl">Meetings</div></div>
                <div className="metric"><div className="val">{t.sent}</div><div className="lbl">Sent</div></div>
              </div>
              {t.body && <div className="variant" style={{ marginTop: 10 }}>{t.body.substring(0, 100)}...</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
