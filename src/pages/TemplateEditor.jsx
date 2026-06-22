import { useState, useRef } from 'react'

const variableCategories = [
  { id: 'prospect', name: 'Prospect', vars: [
    { key: 'first_name', label: 'First Name' },
    { key: 'last_name', label: 'Last Name' },
    { key: 'full_name', label: 'Full Name' },
    { key: 'email', label: 'Email' },
    { key: 'title', label: 'Job Title' },
    { key: 'phone', label: 'Phone' },
    { key: 'linkedin_url', label: 'LinkedIn URL' },
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State' },
    { key: 'country', label: 'Country' },
  ]},
  { id: 'account', name: 'Account / Company', vars: [
    { key: 'company', label: 'Company Name' },
    { key: 'company_industry', label: 'Industry' },
    { key: 'company_size', label: 'Company Size' },
    { key: 'company_revenue', label: 'Revenue' },
    { key: 'company_website', label: 'Website' },
    { key: 'company_city', label: 'HQ City' },
    { key: 'company_founded', label: 'Founded Year' },
  ]},
  { id: 'sender', name: 'Sender (You)', vars: [
    { key: 'sender_name', label: 'Your Name' },
    { key: 'sender_email', label: 'Your Email' },
    { key: 'sender_title', label: 'Your Title' },
    { key: 'sender_phone', label: 'Your Phone' },
    { key: 'sender_company', label: 'Your Company' },
    { key: 'sender_calendar_link', label: 'Calendar Link' },
  ]},
  { id: 'custom', name: 'Custom Fields', vars: [
    { key: 'pain_point', label: 'Pain Point' },
    { key: 'use_case', label: 'Use Case' },
    { key: 'competitor', label: 'Current Solution' },
    { key: 'recent_achievement', label: 'Recent Achievement' },
    { key: 'mutual_connection', label: 'Mutual Connection' },
    { key: 'event_name', label: 'Event Name' },
    { key: 'trigger_event', label: 'Trigger Event' },
  ]},
  { id: 'dynamic', name: 'Dynamic / AI', vars: [
    { key: 'personalized_opener', label: 'AI Personalized Opener' },
    { key: 'relevant_case_study', label: 'Relevant Case Study' },
    { key: 'value_prop', label: 'Personalized Value Prop' },
    { key: 'meeting_times', label: 'Available Meeting Times' },
  ]},
]

export default function TemplateEditor({ template, onSave, onCancel }) {
  const [name, setName] = useState(template?.name || '')
  const [type, setType] = useState(template?.type || 'Email')
  const [subject, setSubject] = useState(template?.subject || '')
  const [body, setBody] = useState(template?.body || '')
  const [owner, setOwner] = useState(template?.owner || '')
  const [varSearch, setVarSearch] = useState('')
  const [expandedCat, setExpandedCat] = useState('prospect')
  const bodyRef = useRef(null)
  const subjectRef = useRef(null)
  const [activeField, setActiveField] = useState('body')

  const insertVariable = (varKey) => {
    const insertion = `{{${varKey}}}`
    if (activeField === 'subject') {
      const el = subjectRef.current
      const start = el.selectionStart || subject.length
      setSubject(subject.slice(0, start) + insertion + subject.slice(start))
    } else {
      const el = bodyRef.current
      const start = el.selectionStart || body.length
      setBody(body.slice(0, start) + insertion + body.slice(start))
    }
  }

  const filteredVars = variableCategories.map(cat => ({
    ...cat,
    vars: cat.vars.filter(v => v.label.toLowerCase().includes(varSearch.toLowerCase()) || v.key.includes(varSearch.toLowerCase()))
  })).filter(cat => cat.vars.length > 0)

  const handleSave = () => {
    if (!name) return
    onSave({ name, type, subject, body, owner })
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 0, height: 'calc(100vh - 60px)' }}>
      {/* Main editor */}
      <div style={{ padding: 24, overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700 }}>{template ? 'Edit Template' : 'Create Template'}</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" onClick={onCancel}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>Save Template</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
          <div className="form-group">
            <label>Template Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. CXO Intro Email" />
          </div>
          <div className="form-group">
            <label>Type</label>
            <select value={type} onChange={e => setType(e.target.value)}>
              <option>Email</option><option>LinkedIn</option><option>Call Script</option>
            </select>
          </div>
          <div className="form-group">
            <label>Owner / Team</label>
            <input value={owner} onChange={e => setOwner(e.target.value)} placeholder="e.g. Marketing Team" />
          </div>
        </div>

        {type === 'Email' && (
          <div className="form-group">
            <label>Subject Line</label>
            <input ref={subjectRef} value={subject} onChange={e => setSubject(e.target.value)} onFocus={() => setActiveField('subject')} placeholder="e.g. Quick question regarding {{company_industry}}" style={{ fontFamily: 'monospace' }} />
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Click a variable from the right panel to insert at cursor position</div>
          </div>
        )}

        <div className="form-group">
          <label>Message Body</label>
          <textarea ref={bodyRef} value={body} onChange={e => setBody(e.target.value)} onFocus={() => setActiveField('body')} placeholder="Write your template content here... Click variables from the panel on the right to insert them." style={{ minHeight: 300, fontFamily: 'monospace', fontSize: 13, lineHeight: 1.7 }} />
        </div>

        {/* Preview */}
        <div className="card" style={{ background: '#f8f9fb' }}>
          <div className="card-header"><h3>Preview</h3><span className="badge badge-gray">Variables shown as placeholders</span></div>
          {type === 'Email' && subject && (
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>
              Subject: {subject.replace(/\{\{(\w+)\}\}/g, (_, k) => {
                const v = variableCategories.flatMap(c => c.vars).find(v => v.key === k)
                return `[${v?.label || k}]`
              })}
            </div>
          )}
          <div style={{ fontSize: 13, lineHeight: 1.8, whiteSpace: 'pre-wrap', color: '#374151' }}>
            {body ? body.replace(/\{\{(\w+)\}\}/g, (_, k) => {
              const v = variableCategories.flatMap(c => c.vars).find(v => v.key === k)
              return `[${v?.label || k}]`
            }) : <span style={{ color: '#94a3b8' }}>Your preview will appear here...</span>}
          </div>
        </div>
      </div>

      {/* Variable Sidebar */}
      <div style={{ borderLeft: '1px solid #e5e7eb', background: '#fff', padding: '16px', overflowY: 'auto' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Insert Variable</div>
        <input className="search-box" style={{ marginBottom: 12, padding: '8px 12px 8px 32px', fontSize: 12 }} placeholder="Search variables..." value={varSearch} onChange={e => setVarSearch(e.target.value)} />
        <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 12 }}>Click to insert at cursor in {activeField === 'subject' ? 'subject' : 'body'}</div>

        {filteredVars.map(cat => (
          <div key={cat.id} style={{ marginBottom: 8 }}>
            <div onClick={() => setExpandedCat(expandedCat === cat.id ? '' : cat.id)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: '#f8f9fb', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#374151' }}>
              <span>{cat.name}</span>
              <span style={{ color: '#94a3b8', fontSize: 10 }}>{cat.vars.length} fields</span>
            </div>
            {expandedCat === cat.id && (
              <div style={{ padding: '4px 0' }}>
                {cat.vars.map(v => (
                  <div key={v.key} onClick={() => insertVariable(v.key)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 10px', cursor: 'pointer', borderRadius: 4, fontSize: 12, transition: 'background .1s' }} onMouseOver={e => e.currentTarget.style.background = '#eef2ff'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                    <span>{v.label}</span>
                    <code style={{ fontSize: 10, color: '#6366f1', background: '#f1f5f9', padding: '2px 6px', borderRadius: 3 }}>{`{{${v.key}}}`}</code>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        <div style={{ marginTop: 16, padding: 12, background: '#f8f9fb', borderRadius: 8, fontSize: 11, color: '#64748b', lineHeight: 1.6 }}>
          <strong>How variables work:</strong><br/>
          Variables are populated from your CRM/prospect data when the message is sent. If a field is empty, you can set fallback values using:<br/>
          <code style={{ background: '#fff', padding: '2px 4px', borderRadius: 3, fontSize: 10 }}>{`{{#if field}}{{field}}{{else}}fallback{{/if}}`}</code>
        </div>
      </div>
    </div>
  )
}
