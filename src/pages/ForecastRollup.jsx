import { useState } from 'react'

const reps = [
  { id: 1, name: 'Sarah Kim', team: 'North America', quota: 500000, closed: 210000, commit: 180000, bestCase: 95000, pipeline: 120000, submitted: true, lastSubmit: 'Jun 22', note: 'Strong close pending on Acme deal' },
  { id: 2, name: 'Mike Torres', team: 'North America', quota: 450000, closed: 165000, commit: 140000, bestCase: 110000, pipeline: 85000, submitted: true, lastSubmit: 'Jun 21', note: 'Beta deal at risk, may slip' },
  { id: 3, name: 'James Park', team: 'EMEA', quota: 500000, closed: 195000, commit: 160000, bestCase: 130000, pipeline: 145000, submitted: false, lastSubmit: 'Jun 18', note: '' },
  { id: 4, name: 'Lisa Chen', team: 'EMEA', quota: 400000, closed: 280000, commit: 90000, bestCase: 40000, pipeline: 60000, submitted: true, lastSubmit: 'Jun 22', note: 'On track to exceed quota' },
]

const deals = [
  { id: 1, name: 'Enterprise CRM', account: 'Acme Corp', amount: 150000, category: 'Commit', owner: 'Sarah Kim', closeDate: 'Aug 15', change: '+$20K' },
  { id: 2, name: 'Cloud Migration', account: 'Beta Inc', amount: 85000, category: 'Best Case', owner: 'Mike Torres', closeDate: 'Sep 01', change: 'Pushed 2w' },
  { id: 3, name: 'Security Platform', account: 'Delta LLC', amount: 310000, category: 'Pipeline', owner: 'James Park', closeDate: 'Nov 10', change: 'New' },
  { id: 4, name: 'ERP Modernization', account: 'Kappa Mfg', amount: 420000, category: 'Commit', owner: 'James Park', closeDate: 'Aug 25', change: '' },
  { id: 5, name: 'Data Analytics', account: 'Omega Co', amount: 220000, category: 'Best Case', owner: 'Sarah Kim', closeDate: 'Sep 20', change: '-$30K' },
  { id: 6, name: 'API Integration', account: 'Zeta Tech', amount: 95000, category: 'Pipeline', owner: 'Mike Torres', closeDate: 'Aug 30', change: '' },
  { id: 7, name: 'HR Automation', account: 'Sigma HR', amount: 175000, category: 'Best Case', owner: 'James Park', closeDate: 'Oct 15', change: '' },
  { id: 8, name: 'Marketing Suite', account: 'Alpha Media', amount: 130000, category: 'Commit', owner: 'Lisa Chen', closeDate: 'Jul 30', change: '' },
]

const history = [
  { date: 'Jun 22', by: 'You (Manager)', closed: 850000, commit: 570000, bestCase: 375000, override: null, note: 'Weekly commit — tracking well, 2 deals moving forward' },
  { date: 'Jun 15', by: 'You (Manager)', closed: 720000, commit: 520000, bestCase: 340000, override: 1350000, note: 'Adjusted for Beta deal slipping to next Q' },
  { date: 'Jun 08', by: 'You (Manager)', closed: 680000, commit: 480000, bestCase: 310000, override: null, note: 'On track, new pipeline added from marketing campaign' },
  { date: 'Jun 01', by: 'You (Manager)', closed: 580000, commit: 420000, bestCase: 280000, override: null, note: 'Quarter start — conservative commit' },
]

const waterfall = [
  { label: 'Starting Pipeline', value: 2800000, type: 'neutral' },
  { label: 'Net New Added', value: 420000, type: 'positive' },
  { label: 'Pulled In', value: 150000, type: 'positive' },
  { label: 'Pushed Out', value: -280000, type: 'negative' },
  { label: 'Decreased', value: -95000, type: 'negative' },
  { label: 'Won (Closed)', value: -850000, type: 'won' },
  { label: 'Lost', value: -210000, type: 'negative' },
  { label: 'Current Pipeline', value: 1935000, type: 'neutral' },
]

const fmt = (n) => {
  const abs = Math.abs(n)
  const s = abs >= 1000000 ? `$${(abs / 1000000).toFixed(1)}M` : abs >= 1000 ? `$${Math.round(abs / 1000)}K` : `$${abs}`
  return n < 0 ? `-${s}` : s
}

export default function ForecastRollup() {
  const [team, setTeam] = useState(reps)
  const [period, setPeriod] = useState('Q3 2026')
  const [config, setConfig] = useState('New ARR')
  const [selectedMetric, setSelectedMetric] = useState(null)
  const [managerOverride, setManagerOverride] = useState('')
  const [submissionNote, setSubmissionNote] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [drillRep, setDrillRep] = useState(null)

  const totalQuota = team.reduce((s, r) => s + r.quota, 0)
  const totalClosed = team.reduce((s, r) => s + r.closed, 0)
  const totalCommit = team.reduce((s, r) => s + r.commit, 0)
  const totalBestCase = team.reduce((s, r) => s + r.bestCase, 0)
  const totalPipeline = team.reduce((s, r) => s + r.pipeline, 0)
  const gapToQuota = totalQuota - totalClosed - totalCommit
  const attainment = Math.round((totalClosed / totalQuota) * 100)

  const filteredDeals = deals.filter(d => {
    if (selectedMetric && d.category !== selectedMetric) return false
    if (drillRep && d.owner !== drillRep) return false
    return true
  })

  const handleSubmit = () => { setSubmitted(true); setTimeout(() => setSubmitted(false), 3000) }

  const metricCards = [
    { label: 'Closed', value: totalClosed, color: '#16a34a', key: 'Closed' },
    { label: 'Commit', value: totalCommit, color: '#FE7916', key: 'Commit' },
    { label: 'Best Case', value: totalBestCase, color: '#0891b2', key: 'Best Case' },
    { label: 'Pipeline', value: totalPipeline, color: '#64748b', key: 'Pipeline' },
  ]

  const [tableTab, setTableTab] = useState('rollup')

  return (
    <div>
      <div className="topbar">
        <h2>Forecast Rollup</h2>
        <div className="actions">
          <select value={config} onChange={e => setConfig(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }}>
            <option>New ARR</option><option>Expansion</option><option>Renewal</option>
          </select>
          <select value={period} onChange={e => setPeriod(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }}>
            <option>Q3 2026</option><option>Q4 2026</option><option>Q1 2027</option>
          </select>
          <button className="btn btn-primary" onClick={handleSubmit}>Submit Forecast</button>
        </div>
      </div>

      <div style={{ padding: 24 }}>
        {/* Metric Cards */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)', marginBottom: 20 }}>
          {metricCards.map(m => (
            <div key={m.key} className="stat-box" onClick={() => setSelectedMetric(selectedMetric === m.key ? null : m.key)} style={{ cursor: 'pointer', borderColor: selectedMetric === m.key ? m.color : '#e5e7eb', borderWidth: selectedMetric === m.key ? 2 : 1 }}>
              <div className="value" style={{ color: m.color }}>{fmt(m.value)}</div>
              <div className="label">{m.label}</div>
            </div>
          ))}
          <div className="stat-box"><div className="value">{fmt(totalQuota)}</div><div className="label">Quota</div></div>
          <div className="stat-box"><div className="value" style={{ color: gapToQuota > 0 ? '#dc2626' : '#16a34a' }}>{gapToQuota > 0 ? `-${fmt(gapToQuota)}` : `+${fmt(Math.abs(gapToQuota))}`}</div><div className="label">Gap</div></div>
        </div>

        {/* 2-Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20 }}>
          {/* LEFT: Vertical Funnel */}
          <div className="card">
            <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 20 }}>Forecast Funnel</h3>
            {[
              { label: 'Pipeline', value: totalPipeline, color: '#94a3b8' },
              { label: 'Best Case', value: totalBestCase, color: '#0891b2' },
              { label: 'Commit', value: totalCommit, color: '#FE7916' },
              { label: 'Closed Won', value: totalClosed, color: '#16a34a' },
            ].map((item, i, arr) => {
              const maxVal = arr[0].value || 1
              const pct = (item.value / maxVal) * 100
              return (
                <div key={i} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, color: '#475569' }}>{item.label}</span>
                    <span style={{ fontWeight: 700, color: item.color }}>{fmt(item.value)}</span>
                  </div>
                  <div style={{ height: 10, background: '#f1f5f9', borderRadius: 5, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: item.color, borderRadius: 5 }} />
                  </div>
                </div>
              )
            })}
            {/* Attainment */}
            <div style={{ marginTop: 16, padding: 12, background: '#f8f9fb', borderRadius: 8, textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 800 }}>{attainment}%</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>Quota Attainment</div>
            </div>

            {/* Submit section */}
            <div style={{ marginTop: 16 }}>
              <div className="form-group"><label>Override ($)</label><input type="number" placeholder={`Auto: ${fmt(totalClosed + totalCommit)}`} value={managerOverride} onChange={e => setManagerOverride(e.target.value)} style={{ fontSize: 12 }} /></div>
              <div className="form-group"><label>Notes</label><input placeholder="Commentary..." value={submissionNote} onChange={e => setSubmissionNote(e.target.value)} style={{ fontSize: 12 }} /></div>
              {submitted && <div style={{ padding: 8, background: '#dcfce7', borderRadius: 6, fontSize: 11, color: '#16a34a', textAlign: 'center' }}>✓ Submitted</div>}
            </div>
          </div>

          {/* RIGHT: Tabbed Tables */}
          <div>
            <div className="tabs" style={{ marginBottom: 16 }}>
              <button className={tableTab === 'rollup' ? 'active' : ''} onClick={() => setTableTab('rollup')}>Team Rollup</button>
              <button className={tableTab === 'deals' ? 'active' : ''} onClick={() => setTableTab('deals')}>Deal Inspection</button>
            </div>

            {tableTab === 'rollup' && (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table>
                  <thead><tr><th>Rep</th><th>Quota</th><th>Closed</th><th>Commit</th><th>Best Case</th><th>Pipeline</th><th>Attainment</th><th>Gap</th><th>Status</th></tr></thead>
                  <tbody>
                    {team.map(r => {
                      const att = Math.round((r.closed / r.quota) * 100)
                      const gap = r.quota - r.closed - r.commit
                      return (
                        <tr key={r.id} onClick={() => setDrillRep(drillRep === r.name ? null : r.name)} style={{ cursor: 'pointer', background: drillRep === r.name ? '#fff5ed' : '' }}>
                          <td><strong>{r.name}</strong><div style={{ fontSize: 10, color: '#94a3b8' }}>{r.team}</div></td>
                          <td>{fmt(r.quota)}</td>
                          <td style={{ color: '#16a34a', fontWeight: 600 }}>{fmt(r.closed)}</td>
                          <td style={{ fontWeight: 600 }}>{fmt(r.commit)}</td>
                          <td>{fmt(r.bestCase)}</td>
                          <td>{fmt(r.pipeline)}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <div style={{ width: 40, height: 5, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${att}%`, background: att >= 50 ? '#16a34a' : '#d97706', borderRadius: 3 }} />
                              </div>
                              <span style={{ fontSize: 11, fontWeight: 600 }}>{att}%</span>
                            </div>
                          </td>
                          <td style={{ color: gap > 0 ? '#dc2626' : '#16a34a', fontSize: 12, fontWeight: 500 }}>{gap > 0 ? `-${fmt(gap)}` : `+${fmt(Math.abs(gap))}`}</td>
                          <td>{r.submitted ? <span className="badge badge-green">Done</span> : <span className="badge badge-yellow">Pending</span>}</td>
                        </tr>
                      )
                    })}
                    <tr style={{ background: '#f8f9fb', fontWeight: 700 }}>
                      <td>Total</td><td>{fmt(totalQuota)}</td><td style={{ color: '#16a34a' }}>{fmt(totalClosed)}</td><td>{fmt(totalCommit)}</td><td>{fmt(totalBestCase)}</td><td>{fmt(totalPipeline)}</td><td>{attainment}%</td><td style={{ color: gapToQuota > 0 ? '#dc2626' : '#16a34a' }}>{gapToQuota > 0 ? `-${fmt(gapToQuota)}` : `+${fmt(Math.abs(gapToQuota))}`}</td><td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {tableTab === 'deals' && (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '12px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{selectedMetric ? `Filtered: ${selectedMetric}` : 'All Deals'} {drillRep ? `• ${drillRep}` : ''}</span>
                  <span style={{ fontSize: 12, color: '#64748b' }}>{filteredDeals.length} deals • {fmt(filteredDeals.reduce((s, d) => s + d.amount, 0))}</span>
                </div>
                <table>
                  <thead><tr><th>Deal</th><th>Account</th><th>Amount</th><th>Category</th><th>Owner</th><th>Close</th><th>Change</th></tr></thead>
                  <tbody>
                    {filteredDeals.map(d => (
                      <tr key={d.id}>
                        <td><strong>{d.name}</strong></td>
                        <td>{d.account}</td>
                        <td style={{ fontWeight: 600 }}>{fmt(d.amount)}</td>
                        <td><span className={`badge ${d.category === 'Commit' ? 'badge-purple' : d.category === 'Best Case' ? 'badge-blue' : 'badge-gray'}`}>{d.category}</span></td>
                        <td style={{ fontSize: 12 }}>{d.owner}</td>
                        <td style={{ fontSize: 12 }}>{d.closeDate}</td>
                        <td style={{ fontSize: 11, color: d.change.includes('+') ? '#16a34a' : d.change.includes('-') || d.change.includes('Pushed') ? '#dc2626' : d.change === 'New' ? '#FE7916' : '#94a3b8', fontWeight: 500 }}>{d.change || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
