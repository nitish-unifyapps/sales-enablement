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
          <select value={config} onChange={e => setConfig(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }}><option>New ARR</option><option>Expansion</option><option>Renewal</option></select>
          <select value={period} onChange={e => setPeriod(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }}><option>Q3 2026</option><option>Q4 2026</option><option>Q1 2027</option></select>
        </div>
      </div>

      <div style={{ padding: 24 }}>
        {/* Line Chart Header — Quota vs Achieved */}
        <div className="card" style={{ marginBottom: 20, padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 12, fontWeight: 700 }}>Forecast Progress — Q3 2026</span>
            <div style={{ display: 'flex', gap: 14, fontSize: 10, color: '#7B9CAF' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 12, height: 3, background: '#FE7916', borderRadius: 2 }} /> Achieved</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 12, height: 3, background: '#7B9CAF', borderRadius: 2 }} /> Quota (linear)</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 12, height: 3, background: '#16a34a', borderRadius: 2, opacity: 0.5 }} /> Commit</span>
            </div>
          </div>
          {(() => {
            const weeks = ['Jul 1', 'Jul 8', 'Jul 15', 'Jul 22', 'Jul 29', 'Aug 5', 'Aug 12', 'Aug 19', 'Aug 26', 'Sep 2', 'Sep 9', 'Sep 16']
            const achieved = [120, 280, 410, 520, 650, 740, 850, 920, 980, 1050, 1100, 1140]
            const commit = [400, 520, 680, 780, 880, 1020, 1150, 1280, 1380, 1450, 1520, 1570]
            const quota = weeks.map((_, i) => Math.round((totalQuota / 1000) * ((i + 1) / weeks.length)))
            const maxVal = Math.max(...commit, ...quota)
            const W = 700, H = 120, padL = 40, padR = 10, padT = 10, padB = 24
            const chartW = W - padL - padR, chartH = H - padT - padB
            const x = (i) => padL + (i / (weeks.length - 1)) * chartW
            const y = (v) => padT + chartH - (v / maxVal) * chartH
            const line = (data) => data.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(v)}`).join(' ')
            const area = (data) => line(data) + ` L${x(data.length-1)},${H - padB} L${x(0)},${H - padB} Z`
            return (
              <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
                {/* Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => (
                  <g key={i}>
                    <line x1={padL} y1={padT + chartH * (1 - pct)} x2={W - padR} y2={padT + chartH * (1 - pct)} stroke="#f1f5f9" strokeWidth="1" />
                    <text x={padL - 4} y={padT + chartH * (1 - pct) + 3} fontSize="8" fill="#7B9CAF" textAnchor="end">{Math.round(maxVal * pct)}K</text>
                  </g>
                ))}
                {/* X axis labels */}
                {weeks.map((w, i) => (
                  <text key={i} x={x(i)} y={H - 4} fontSize="7" fill="#7B9CAF" textAnchor="middle">{w.split(' ')[1]}</text>
                ))}
                {/* Quota line */}
                <polyline points={quota.map((v, i) => `${x(i)},${y(v)}`).join(' ')} fill="none" stroke="#7B9CAF" strokeWidth="1.5" strokeDasharray="4" opacity="0.6" />
                {/* Commit area */}
                <path d={area(commit)} fill="#16a34a" opacity="0.06" />
                <polyline points={commit.map((v, i) => `${x(i)},${y(v)}`).join(' ')} fill="none" stroke="#16a34a" strokeWidth="1.5" opacity="0.5" />
                {/* Achieved area */}
                <path d={area(achieved)} fill="#FE7916" opacity="0.1" />
                <polyline points={achieved.map((v, i) => `${x(i)},${y(v)}`).join(' ')} fill="none" stroke="#FE7916" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {/* Data points on achieved */}
                {achieved.map((v, i) => (
                  <circle key={i} cx={x(i)} cy={y(v)} r="3" fill="#fff" stroke="#FE7916" strokeWidth="2" />
                ))}
              </svg>
            )
          })()}
        </div>

        {/* Two Column Layout — 70% left, 30% right */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>
          {/* LEFT: Tables */}
          <div>
            <div className="tabs" style={{ marginBottom: 12 }}>
              <button className={tableTab === 'rollup' ? 'active' : ''} onClick={() => setTableTab('rollup')}>Team Rollup</button>
              <button className={tableTab === 'deals' ? 'active' : ''} onClick={() => setTableTab('deals')}>Deal Inspection</button>
            </div>

            {tableTab === 'rollup' && (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table>
                  <thead><tr><th>Rep</th><th>Quota</th><th>Closed</th><th>Commit</th><th>Best Case</th><th>Pipeline</th><th>Attainment</th><th>Gap</th></tr></thead>
                  <tbody>
                    {team.map(r => {
                      const att = Math.round((r.closed / r.quota) * 100)
                      const gap = r.quota - r.closed - r.commit
                      return (
                        <tr key={r.id} onClick={() => setDrillRep(drillRep === r.name ? null : r.name)} style={{ cursor: 'pointer', background: drillRep === r.name ? '#fff8f3' : '' }}>
                          <td><strong>{r.name}</strong><div style={{ fontSize: 10, color: '#7B9CAF' }}>{r.team}</div></td>
                          <td>{fmt(r.quota)}</td>
                          <td style={{ color: '#16a34a', fontWeight: 600 }}>{fmt(r.closed)}</td>
                          <td style={{ fontWeight: 600 }}>{fmt(r.commit)}</td>
                          <td>{fmt(r.bestCase)}</td>
                          <td>{fmt(r.pipeline)}</td>
                          <td><div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 36, height: 5, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}><div style={{ height: '100%', width: `${att}%`, background: att >= 50 ? '#16a34a' : '#d97706', borderRadius: 3 }} /></div><span style={{ fontSize: 10, fontWeight: 600 }}>{att}%</span></div></td>
                          <td style={{ color: gap > 0 ? '#dc2626' : '#16a34a', fontSize: 11, fontWeight: 600 }}>{gap > 0 ? `-${fmt(gap)}` : `+${fmt(Math.abs(gap))}`}</td>
                        </tr>
                      )
                    })}
                    <tr style={{ background: '#f8f9fb', fontWeight: 700, fontSize: 12 }}>
                      <td>Total</td><td>{fmt(totalQuota)}</td><td style={{ color: '#16a34a' }}>{fmt(totalClosed)}</td><td>{fmt(totalCommit)}</td><td>{fmt(totalBestCase)}</td><td>{fmt(totalPipeline)}</td><td>{attainment}%</td><td style={{ color: gapToQuota > 0 ? '#dc2626' : '#16a34a' }}>{gapToQuota > 0 ? `-${fmt(gapToQuota)}` : `+${fmt(Math.abs(gapToQuota))}`}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {tableTab === 'deals' && (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '10px 16px', borderBottom: '1px solid #e5e7eb', fontSize: 11, color: '#7B9CAF' }}>{filteredDeals.length} deals — {fmt(filteredDeals.reduce((s, d) => s + d.amount, 0))} {selectedMetric && `• ${selectedMetric}`} {drillRep && `• ${drillRep}`}</div>
                <table>
                  <thead><tr><th>Deal</th><th>Amount</th><th>Category</th><th>Owner</th><th>Close</th><th>Change</th></tr></thead>
                  <tbody>
                    {filteredDeals.map(d => (
                      <tr key={d.id}>
                        <td><strong>{d.name}</strong><div style={{ fontSize: 10, color: '#7B9CAF' }}>{d.account}</div></td>
                        <td style={{ fontWeight: 600 }}>{fmt(d.amount)}</td>
                        <td><span className={`badge ${d.category === 'Commit' ? 'badge-purple' : d.category === 'Best Case' ? 'badge-blue' : 'badge-gray'}`} style={{ fontSize: 9 }}>{d.category}</span></td>
                        <td style={{ fontSize: 11 }}>{d.owner}</td>
                        <td style={{ fontSize: 11 }}>{d.closeDate}</td>
                        <td style={{ fontSize: 10, color: d.change.includes('+') ? '#16a34a' : d.change.includes('-') || d.change.includes('Pushed') ? '#dc2626' : '#FE7916', fontWeight: 500 }}>{d.change || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* RIGHT: Circular charts + Insights + Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Circular Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              {[
                { label: 'Attainment', value: attainment, color: '#FE7916' },
                { label: 'AI Confidence', value: 74, color: '#16a34a' },
                { label: 'Coverage', value: Math.min(100, Math.round((totalPipeline / totalQuota) * 100)), color: '#7B9CAF' },
              ].map((m, i) => (
                <div key={i} className="card" style={{ padding: 12, textAlign: 'center' }}>
                  <div style={{ position: 'relative', width: 60, height: 60, margin: '0 auto 6px' }}>
                    <svg width="60" height="60" viewBox="0 0 60 60">
                      <circle cx="30" cy="30" r="26" fill="none" stroke="#f1f5f9" strokeWidth="5" />
                      <circle cx="30" cy="30" r="26" fill="none" stroke={m.color} strokeWidth="5" strokeLinecap="round" strokeDasharray={`${m.value * 1.63} 163`} transform="rotate(-90 30 30)" />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: m.color }}>{m.value}%</div>
                  </div>
                  <div style={{ fontSize: 10, color: '#7B9CAF' }}>{m.label}</div>
                </div>
              ))}
            </div>

            {/* Gap to Quota */}
            <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div><div style={{ fontSize: 10, color: '#7B9CAF' }}>Gap to Quota</div><div style={{ fontSize: 18, fontWeight: 800, color: gapToQuota > 0 ? '#dc2626' : '#16a34a' }}>{gapToQuota > 0 ? `-${fmt(gapToQuota)}` : `+${fmt(Math.abs(gapToQuota))}`}</div></div>
              <div style={{ textAlign: 'right' }}><div style={{ fontSize: 10, color: '#7B9CAF' }}>Quota</div><div style={{ fontSize: 14, fontWeight: 700 }}>{fmt(totalQuota)}</div></div>
            </div>

            {/* Insights */}
            <div className="card" style={{ padding: '14px 16px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FE7916' }} /> AI Insights</div>
              {[
                { icon: '⚠', color: '#dc2626', text: 'Cloud Migration ($85K) — 14d no activity, likely slipping.' },
                { icon: '↑', color: '#16a34a', text: 'Sarah Kim at 92% — capacity for 2 more deals.' },
                { icon: '◎', color: '#FE7916', text: '4 commit deals single-threaded. Multi-thread to de-risk.' },
                { icon: '◈', color: '#FE7916', text: 'Factor 8% slippage — commit likely lands $520K.' },
              ].map((ins, i) => (
                <div key={i} style={{ padding: '8px 10px', background: '#fafbfc', borderRadius: 6, marginBottom: 6, fontSize: 10, lineHeight: 1.6, color: '#475569' }}><span style={{ color: ins.color, fontWeight: 700 }}>{ins.icon}</span> {ins.text}</div>
              ))}
            </div>

            {/* Recommended Actions */}
            <div className="card" style={{ padding: '14px 16px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10 }}>Recommended Actions</div>
              {[
                { action: 'Multi-thread Acme deal', impact: '+$30K' },
                { action: 'Breakup email to 3 stalled Best Case', impact: 'De-risk' },
                { action: 'Move Beta Inc to next Q', impact: 'Accuracy' },
                { action: 'Exec sponsor intro on ERP deal', impact: '+$420K' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: i < 3 ? '1px solid #f1f5f9' : 'none' }}>
                  <input type="checkbox" style={{ accentColor: '#FE7916' }} />
                  <span style={{ flex: 1, fontSize: 10 }}>{item.action}</span>
                  <span style={{ fontSize: 9, color: '#FE7916', fontWeight: 600 }}>{item.impact}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
