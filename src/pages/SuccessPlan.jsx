import { useState } from 'react'

const initialMilestones = [
  { id: 1, title: 'Define ICP & Target Account List', assignee: 'Sales Ops', stakeholder: 'VP Sales', target: 'Jun 1', status: 'done' },
  { id: 2, title: 'Build Multi-Channel Cadence (Email + LinkedIn + Call)', assignee: 'Sales Enablement', stakeholder: 'SDR Team', target: 'Jun 8', status: 'done' },
  { id: 3, title: 'A/B Test Templates & Optimize Messaging', assignee: 'Marketing', stakeholder: 'SDR Lead', target: 'Jun 30', status: 'partial' },
  { id: 4, title: 'Launch AI Agent Rules & Intent-Based Triggers', assignee: 'Revenue Ops', stakeholder: 'CRO', target: 'Jul 15', status: 'pending' },
  { id: 5, title: 'Hit 40% Reply Rate & 80 Meetings/Month', assignee: 'SDR Team', stakeholder: 'VP Sales', target: 'Aug 01', status: 'pending' },
  { id: 6, title: 'Quarterly Review & Cadence Refresh', assignee: 'Sales Enablement', stakeholder: 'All', target: 'Sep 15', status: 'pending' },
]

export default function SuccessPlan() {
  const [milestones, setMilestones] = useState(initialMilestones)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title: '', assignee: '', stakeholder: '', target: '' })

  const cycleStatus = (id) => {
    setMilestones(milestones.map(m => {
      if (m.id !== id) return m
      const next = { pending: 'partial', partial: 'done', done: 'pending' }
      return { ...m, status: next[m.status] }
    }))
  }

  const addMilestone = () => {
    if (!form.title) return
    setMilestones([...milestones, { id: Date.now(), ...form, status: 'pending' }])
    setShowModal(false)
    setForm({ title: '', assignee: '', stakeholder: '', target: '' })
  }

  const deleteMilestone = (id) => setMilestones(milestones.filter(m => m.id !== id))

  const doneCount = milestones.filter(m => m.status === 'done').length
  const progress = Math.round((doneCount / milestones.length) * 100)

  return (
    <div>
      <div className="topbar">
        <h2>Success Plan</h2>
        <div className="actions">
          <button className="btn" onClick={() => setShowModal(true)}>+ Add Milestone</button>
          <button className="btn btn-primary">Share Plan</button>
        </div>
      </div>

      <div style={{ padding: '24px' }}>
        <div className="stats-grid">
          <div className="stat-box"><div className="value">{progress}%</div><div className="label">Overall Progress</div></div>
          <div className="stat-box"><div className="value">34%</div><div className="label">Avg Reply Rate</div></div>
          <div className="stat-box"><div className="value">68</div><div className="label">Meetings This Month</div></div>
          <div className="stat-box"><div className="value">$1.2M</div><div className="label">Pipeline Generated</div></div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Performance Goals</h3>
            <span className="badge badge-green">On Track</span>
          </div>
          {[
            { label: 'Reply Rate Target: 40%', current: 34, target: 40 },
            { label: 'Meetings Booked: 80/month', current: 68, target: 80 },
            { label: 'Pipeline Generated: $1.5M', current: 1.2, target: 1.5 },
          ].map((g, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                <span>{g.label}</span>
                <span style={{ fontWeight: 600 }}>{Math.round((g.current / g.target) * 100)}%</span>
              </div>
              <div className="progress-bar"><div className="fill" style={{ width: `${(g.current / g.target) * 100}%`, background: '#6366f1' }} /></div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Milestones ({doneCount}/{milestones.length} complete)</h3>
            <div className="progress-bar" style={{ width: 120 }}><div className="fill" style={{ width: `${progress}%`, background: '#16a34a' }} /></div>
          </div>

          {milestones.map(m => (
            <div key={m.id} className="milestone-item">
              <div className={`checkbox ${m.status}`} onClick={() => cycleStatus(m.id)}>
                {m.status === 'done' ? '✓' : m.status === 'partial' ? '⏳' : ''}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{m.title}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Owner: {m.assignee} • Stakeholder: {m.stakeholder}</div>
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginRight: 8 }}>{m.target}</div>
              <button className="btn btn-sm btn-danger" onClick={() => deleteMilestone(m.id)}>✕</button>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-header"><h3>Channel Performance</h3></div>
          <table>
            <thead><tr><th>Channel</th><th>Sent</th><th>Opened</th><th>Replied</th><th>Meetings</th><th>Conversion</th></tr></thead>
            <tbody>
              <tr><td><span className="badge badge-blue">Email</span></td><td>3,420</td><td>2,189 (64%)</td><td>342 (10%)</td><td>48</td><td>1.4%</td></tr>
              <tr><td><span className="badge badge-blue">LinkedIn</span></td><td>890</td><td>374 (42%)</td><td>160 (18%)</td><td>14</td><td>1.6%</td></tr>
              <tr><td><span className="badge badge-green">Call</span></td><td>210</td><td>59 (28%)</td><td>—</td><td>6</td><td>2.9%</td></tr>
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-header"><h3>AI Recommendations</h3><span className="badge badge-purple">3 Suggestions</span></div>
          {[
            'LinkedIn messages sent on Tuesdays 9-11am have 2.3x higher accept rate. Consider shifting schedule.',
            'Template "CXO Value Prop" Variant B outperforms A by 18%. Consider making B the default.',
            'Prospects who receive a call within 1 hour of email open have 4x meeting rate. Enable real-time alert.',
          ].map((rec, i) => (
            <div key={i} style={{ padding: '12px 16px', background: '#faf5ff', borderRadius: 8, marginBottom: 8, fontSize: 13, border: '1px solid #ede9fe' }}>
              <strong style={{ color: '#6366f1' }}>💡</strong> {rec}
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Add Milestone</h3>
            <div className="form-group">
              <label>Milestone Title</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Complete technical evaluation" />
            </div>
            <div className="form-group">
              <label>Owner / Assignee</label>
              <input value={form.assignee} onChange={e => setForm({ ...form, assignee: e.target.value })} placeholder="e.g. Sales Ops" />
            </div>
            <div className="form-group">
              <label>Stakeholder</label>
              <input value={form.stakeholder} onChange={e => setForm({ ...form, stakeholder: e.target.value })} placeholder="e.g. VP Sales" />
            </div>
            <div className="form-group">
              <label>Target Date</label>
              <input value={form.target} onChange={e => setForm({ ...form, target: e.target.value })} placeholder="e.g. Jul 15" />
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={addMilestone}>Add Milestone</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
