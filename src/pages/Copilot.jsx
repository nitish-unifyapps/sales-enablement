import { useRef, useEffect } from 'react'

export default function Copilot({ title, subtitle, messages, starters, input, setInput, onSend, onClose }) {
  const endRef = useRef(null)
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  return (
    <div className="copilot-panel" style={{ width: '100%', height: '100%' }}>
      <div className="copilot-header">
        <div>
          <div className="title">{title || 'Copilot'}</div>
          {subtitle && <div className="subtitle">{subtitle}</div>}
        </div>
        {onClose && <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#7B9CAF', lineHeight: 1 }}>×</button>}
      </div>
      <div className="copilot-messages">
        {messages.map((m, i) => (
          <div key={i} className={`copilot-msg ${m.role === 'user' ? 'user' : 'ai'}`}>{m.text}</div>
        ))}
        <div ref={endRef} />
      </div>
      {messages.length <= 1 && starters && (
        <div className="copilot-starters">
          <div className="label">Suggestions</div>
          {starters.map((s, i) => (
            <button key={i} className="copilot-starter-btn" onClick={() => setInput(s)}>{s}</button>
          ))}
        </div>
      )}
      <div className="copilot-input-area">
        <input className="copilot-input" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && onSend()} placeholder="Ask copilot..." />
        <button className="copilot-send" onClick={onSend}>→</button>
      </div>
    </div>
  )
}
