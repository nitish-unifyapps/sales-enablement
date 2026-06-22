import { useState } from 'react'
import TemplateEditor from './TemplateEditor'

const initialTemplates = [
  { id: 1, name: 'CXO Value Prop — Q3', type: 'Email', owner: 'Marketing Team', subject: 'Quick question regarding {{company_industry}}', body: 'Hi {{first_name}},\n\nI noticed {{company}} recently expanded into {{company_industry}} — quick thought on how we\'ve helped similar teams tackle {{pain_point}}.\n\nWould you be open to a 15-min chat this week?\n\nBest,\n{{sender_name}}', cadences: 4, openRate: 64, replyRate: 12, meetings: 8, sent: 142, badge: 'Top Performer' },
  { id: 2, name: 'LinkedIn Connection — Warm', type: 'LinkedIn', owner: 'Sales Team', subject: '', body: 'Hi {{first_name}}, I came across your work at {{company}} — impressed by {{recent_achievement}}. Would love to connect.', cadences: 6, openRate: 42, replyRate: 18, meetings: 12, sent: 386, badge: 'High Volume' },
  { id: 3, name: 'Follow-Up After Demo', type: 'Email', owner: 'Sales Team', subject: 'Re: Our conversation about {{use_case}}', body: 'Thanks for the time today, {{first_name}}.\n\nBased on what you shared about {{pain_point}}, here\'s how we\'d approach it:\n\n1. [Key point 1]\n2. [Key point 2]\n\nWould {{meeting_times}} work for a follow-up?\n\n{{sender_name}}\n{{sender_title}}', cadences: 3, openRate: 72, replyRate: 24, meetings: 18, sent: 89, badge: 'AI Enhanced' },
  { id: 4, name: 'Objection Handler — Budget', type: 'Email', owner: 'Enablement', subject: 'Re: budget concerns', body: 'Totally understand, {{first_name}}. Budget timing is real.\n\nHere\'s what teams like {{company}} typically do:\n- Start with a pilot scope\n- Show ROI within 30 days\n- Expand from there\n\nWould a smaller starting point make sense to explore?', cadences: 2, openRate: 58, replyRate: 9, meetings: 3, sent: 64, badge: 'Standard' },
  { id: 5, name: 'Cold Call Script — Discovery', type: 'Call Script', owner: 'Sales Ops', subject: '', body: 'Opening: "Hi {{first_name}}, this is {{sender_name}} from {{sender_company}}."\n\nReason for call: "I\'m reaching out because companies in {{company_industry}} are dealing with {{pain_point}} and I wanted to see if that resonates with you."\n\nQualify: "Are you the right person to discuss this? Who else is involved?"\n\nNext step: "Would it make sense to set up 15 minutes to dive deeper?"', cadences: 5, openRate: 28, replyRate: 14, meetings: 22, sent: 210, badge: 'Top Performer' },
  { id: 6, name: 'Breakup Email — Last Touch', type: 'Email', owner: 'Sales Team', subject: 'Closing the loop, {{first_name}}', body: '{{first_name}},\n\nI\'ve reached out a few times and haven\'t heard back — totally fine if timing isn\'t right.\n\nI\'ll close this out on my end, but if {{pain_point}} becomes a priority again, my door is always open.\n\nWishing you and the {{company}} team all the best.\n\n{{sender_name}}', cadences: 7, openRate: 45, replyRate: 6, meetings: 4, sent: 298, badge: 'Needs Review' },
]

const tabs = ['All', 'Email', 'LinkedIn', 'Call Script']
const badgeClass = { 'Top Performer': 'badge-green', 'High Volume': 'badge-blue', 'AI Enhanced': 'badge-purple', 'Standard': 'badge-gray', 'Needs Review': 'badge-yellow' }

export default function Templates() {
  const [templates, setTemplates] = useState(initialTemplates)
  const [activeTab, setActiveTab] = useState('All')
  const [search, setSearch] = useState('')
  const [editorMode, setEditorMode] = useState(null) // null | 'create' | 'edit'
  const [editingTemplate, setEditingTemplate] = useState(null)

  const filtered = templates.filter(t => {
    const matchTab = activeTab === 'All' || t.type === activeTab
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.owner.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  const openCreate = () => { setEditingTemplate(null); setEditorMode('create') }
  const openEdit = (t) => { setEditingTemplate(t); setEditorMode('edit') }

  const handleSave = (data) => {
    if (editorMode === 'edit' && editingTemplate) {
      setTemplates(templates.map(t => t.id === editingTemplate.id ? { ...t, ...data } : t))
    } else {
      setTemplates([...templates, { id: Date.now(), ...data, cadences: 0, openRate: 0, replyRate: 0, meetings: 0, sent: 0, badge: 'Standard' }])
    }
    setEditorMode(null)
    setEditingTemplate(null)
  }

  const handleCancel = () => { setEditorMode(null); setEditingTemplate(null) }
  const deleteTemplate = (id) => setTemplates(templates.filter(t => t.id !== id))

  // If in editor mode, show full-page editor
  if (editorMode) {
    return <TemplateEditor template={editingTemplate} onSave={handleSave} onCancel={handleCancel} />
  }

  return (
    <div>
      <div className="topbar">
        <h2>Templates</h2>
        <div className="actions"><button className="btn btn-primary" onClick={openCreate}>+ Create Template</button></div>
      </div>

      <div style={{ padding: 24 }}>
        <div className="tabs">
          {tabs.map(tab => (
            <button key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>{tab}</button>
          ))}
        </div>

        <input className="search-box" placeholder="Search templates by name or owner..." value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom: 20 }} />

        {filtered.map(t => (
          <div key={t.id} className="template-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div className="name">{t.name}</div>
                <div className="meta">{t.type} — {t.owner} — Used in {t.cadences} cadences</div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className={`badge ${badgeClass[t.badge] || 'badge-gray'}`}>{t.badge}</span>
                <button className="btn btn-sm" onClick={() => openEdit(t)}>Edit</button>
                <button className="btn btn-sm btn-danger" onClick={() => deleteTemplate(t.id)}>×</button>
              </div>
            </div>
            <div className="metrics">
              <div className="metric"><div className="val">{t.openRate}%</div><div className="lbl">Open Rate</div></div>
              <div className="metric"><div className="val">{t.replyRate}%</div><div className="lbl">Reply Rate</div></div>
              <div className="metric"><div className="val">{t.meetings}</div><div className="lbl">Meetings</div></div>
              <div className="metric"><div className="val">{t.sent}</div><div className="lbl">Times Sent</div></div>
            </div>
            {t.body && (
              <div className="variant" style={{ marginTop: 12, maxHeight: 60, overflow: 'hidden' }}>
                {t.body.substring(0, 120)}...
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
