import { useState } from 'react'
import './App.css'
import Sequences from './pages/Sequences'
import Templates from './pages/Templates'
import SuccessPlan from './pages/SuccessPlan'
import Pipeline from './pages/Pipeline'
import ForecastRollup from './pages/ForecastRollup'
import ScenarioPlanner from './pages/ScenarioPlanner'

const nav = [
  {
    id: 'cadence',
    label: 'Agentic Cadence',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    children: [
      { id: 'sequences', label: 'Sequences' },
      { id: 'templates', label: 'Templates' },
      { id: 'success', label: 'Success Plan' },
    ],
  },
  {
    id: 'pipeline',
    label: 'Pipeline Analytics & Reporting',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    children: [],
  },
  {
    id: 'forecast',
    label: 'Forecasting',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
    children: [
      { id: 'rollup', label: 'Forecast Rollup' },
      { id: 'scenario', label: 'Scenario Planner' },
    ],
  },
]

export default function App() {
  const [activePage, setActivePage] = useState('sequences')
  const [expanded, setExpanded] = useState({ cadence: true, pipeline: false, forecast: false })

  const toggleExpand = (id) => setExpanded({ ...expanded, [id]: !expanded[id] })

  const renderPage = () => {
    switch (activePage) {
      case 'sequences': return <Sequences />
      case 'templates': return <Templates />
      case 'success': return <SuccessPlan />
      case 'pipeline': return <Pipeline />
      case 'rollup': return <ForecastRollup />
      case 'scenario': return <ScenarioPlanner />
    }
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">UnifyApps</div>
        <nav>
          {nav.map(section => (
            <div key={section.id} className="nav-group">
              <div
                className={`nav-parent ${section.children.length === 0 && activePage === section.id ? 'active' : ''}`}
                onClick={() => {
                  if (section.children.length === 0) { setActivePage(section.id) }
                  else { toggleExpand(section.id) }
                }}
              >
                <span className="nav-icon">{section.icon}</span>
                <span className="nav-label">{section.label}</span>
                {section.children.length > 0 && (
                  <span className={`nav-arrow ${expanded[section.id] ? 'open' : ''}`}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                  </span>
                )}
              </div>
              {section.children.length > 0 && expanded[section.id] && (
                <div className="nav-children">
                  {section.children.map(child => (
                    <a key={child.id} className={activePage === child.id ? 'active' : ''} onClick={() => setActivePage(child.id)}>
                      {child.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>
      <div className="main">
        <div className="content">{renderPage()}</div>
      </div>
    </div>
  )
}
