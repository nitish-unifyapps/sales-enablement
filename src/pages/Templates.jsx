import { useState } from 'react'

const initialTemplates = [
  { id: 1, name: 'CXO Value Prop — Q3', type: 'Email', owner: 'Marketing Team', cadences: 4, openRate: 64, replyRate: 12, meetings: 8, sent: 142, badge: 'Top Performer', variants: ['Hi {{first_name}}, I noticed {{company}} recently expanded into {{industry}} — quick thought on how we\'ve helped similar teams...', 'Quick question, {{first_name}} — with the shift in {{industry}}, are you rethinking your approach to {{pain_point}}?'] },
  { id: 2, name: 'LinkedIn Connection — Warm', type: 'LinkedIn', owner: 'Sales Team', cadences: 6, openRate: 42, replyRate: 18, meetings: 12, sent: 386, badge: 'High Volume', variants: ['Hi {{first_name}}, I came across your work at {{company}} — impressed by {{recent_achievement}}. Would love to connect.'] },
  { id: 3, name: 'Follow-Up After Demo', type: 'Email', owner: 'Sales Team', cadences: 3, openRate: 72, replyRate: 24, meetings: 18, sent: 89, badge: 'AI Enhanced', variants: ['Thanks for the time today, {{first_name}}. Based on what you shared about {{challenge}}, here\'s how we\'d approach it...', '{{first_name}}, great conversation! I put together a quick recap + next steps.'] },
  { id: 4, name: 'Objection Handler — Budget', type: 'Email', owner: 'Enablement', cadences: 2, openRate: 58, replyRate: 9, meetings: 3, sent: 64, badge: 'Standard', variants: [] },
  { id: 5, name: 'Cold Call Script — Discovery', type: 'Call Script', owner: 'Sales Ops', cadences: 5, openRate: 28, replyRate: 14, meetings: 22, sent: 210, badge: 'Top Performer', variants: [] },
  { id: 6, name: 'Breakup Email — Last Touch', type: 'Email', owner: 'Sales Team', cadences: 7, openRate: 45, replyRate: 6, meetings: 4, sent: 298, badge: 'Needs Review', variants: ['{{first_name}}, I don\'t want to be a pest. If timing isn\'t right, no worries — but wanted to share one last thing...'] },
]

const tabs = ['All', 'Email', 'LinkedIn', 'Call Script', 'AI Generated']
const badgeClass = { 'Top Performer': 'badge-green', 'High Volume': 'badge-blue', 'AI Enhanced': 'badge-purple', 'Standard': 'badge-gray', 'Needs Review': 'badge-yellow' }

export default function Templates() {
  const [templates, setTemplates] = useState(initialTemplates)
  const [activeTab, setActiveTab] = useState('All')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', type: 'Email', owner: '', content: '' })

  const filtered = templates.filter(t => {
    const matchTab = activeTab === 'All' || t.type === activeTab || (activeTab === 'AI Generated' && t.variants.length > 0)
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.owner.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  const openAdd = () => { setEditing(null); setForm({ name: '', type: 'Email', owner: '', content: '' }); setShowModal(true) }
  const openEdit = (t) => { setEditing(t); setForm({ name: t.name, type: t.type, owner: t.owner, content: t.variants[0] || '' }); setShowModal(true) }

  const save = () => {
    if (!form.name) return
    if (editing) {
      setTemplates(templates.map(t => t.id === editing.id ? { ...t, name: form.name, type: form.type, owner: form.owner, variants: form.content ? [form.content] : t.variants } : t))
    } else {
      setTemplates([...templates, { id: Date.now(), name: form.name, type: form.type, owner: form.owner, cadences: 0, openRate: 0, replyRate: 0, meetings: 0, sent: 0, badge: 'Standard', variants: form.content ? [form.content] : [] }])
    }
    setShowModal(false)
  }

  const deleteTemplate = (id) => setTemplates(templates.filter(t => t.id !== id))

  return (
    <div>
      <div className="topbar">
        <h2>Templates</h2>
        <div className="actions">
          <button className="btn" onClick={openAdd}>+ Create Template</button>
        </div>
      </div>

      <div style={{ padding: '24px' }}>
        <div className="tabs">
          {tabs.map(tab => (
            <button key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>{tab}</button>
          ))}
        </div>

        <input className="search-box" placeholder="Search templates by name, owner, or content..." value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom: 20 }} />

        {filtered.map(t => (
          <div key={t.id} className="template-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div className="name">{t.name}</div>
                <div className="meta">{t.type} • {t.owner} • Used in {t.cadences} cadences</div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className={`badge ${badgeClass[t.badge] || 'badge-gray'}`}>{t.badge}</span>
                <button className="btn btn-sm" onClick={() => openEdit(t)}>Edit</button>
                <button className="btn btn-sm btn-danger" onClick={() => deleteTemplate(t.id)}>✕</button>
              </div>
            </div>
            <div className="metrics">
              <div className="metric"><div className="val">{t.openRate}%</div><div className="lbl">Open Rate</div></div>
              <div className="metric"><div className="val">{t.replyRate}%</div><div className="lbl">Reply Rate</div></div>
              <div className="metric"><div className="val">{t.meetings}</div><div className="lbl">Meetings</div></div>
              <div className="metric"><div className="val">{t.sent}</div><div className="lbl">Times Sent</div></div>
            </div>
            {t.variants.length > 0 && (
              <div style={{ marginTop: 12 }}>
                {t.variants.map((v, i) => (
                  <div key={i} className="variant"><span className="ai-tag">AI {String.fromCharCode(65 + i)}</span>{v}</div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{editing ? 'Edit Template' : 'Create Template'}</h3>
            <div className="form-group">
              <label>Template Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. CXO Intro Email" />
            </div>
            <div className="form-group">
              <label>Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option>Email</option><option>LinkedIn</option><option>Call Script</option>
              </select>
            </div>
            <div className="form-group">
              <label>Owner / Team</label>
              <input value={form.owner} onChange={e => setForm({ ...form, owner: e.target.value })} placeholder="e.g. Marketing Team" />
            </div>
            <div className="form-group">
              <label>Content / Message Body</label>
              <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Write your template content... Use {{first_name}}, {{company}} for personalization." />
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save}>{editing ? 'Save' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
