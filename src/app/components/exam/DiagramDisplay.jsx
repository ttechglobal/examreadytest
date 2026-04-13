'use client'

function RectangleDiagram({ data }) {
  const { measurements = {}, labels = [] } = data
  return (
    <svg viewBox="0 0 300 200" className="diagram-svg">
      <rect x="40" y="30" width="220" height="130" fill="none" stroke="#2D3CE6" strokeWidth="2" rx="2"/>
      {measurements.length && (
        <text x="150" y="180" textAnchor="middle" className="diagram-label">{measurements.length}</text>
      )}
      {measurements.width && (
        <text x="16" y="95" textAnchor="middle" transform="rotate(-90,16,95)" className="diagram-label">{measurements.width}</text>
      )}
      {labels[0] && <text x="35" y="26" className="diagram-label">{labels[0]}</text>}
      {labels[1] && <text x="260" y="26" className="diagram-label">{labels[1]}</text>}
      {labels[2] && <text x="260" y="175" className="diagram-label">{labels[2]}</text>}
      {labels[3] && <text x="35" y="175" className="diagram-label">{labels[3]}</text>}
    </svg>
  )
}

function TriangleDiagram({ data }) {
  const { measurements = {}, labels = ['A','B','C'] } = data
  return (
    <svg viewBox="0 0 300 220" className="diagram-svg">
      <polygon points="150,20 20,200 280,200" fill="none" stroke="#2D3CE6" strokeWidth="2"/>
      <text x="150" y="14" textAnchor="middle" className="diagram-label">{labels[0] || 'A'}</text>
      <text x="8"  y="210" textAnchor="middle" className="diagram-label">{labels[1] || 'B'}</text>
      <text x="288" y="210" textAnchor="middle" className="diagram-label">{labels[2] || 'C'}</text>
      {measurements.base && (
        <text x="150" y="218" textAnchor="middle" className="diagram-label">{measurements.base}</text>
      )}
      {measurements.height && (
        <>
          <line x1="150" y1="20" x2="150" y2="200" stroke="#94A3B8" strokeWidth="1" strokeDasharray="4"/>
          <text x="158" y="115" className="diagram-label">{measurements.height}</text>
        </>
      )}
    </svg>
  )
}

function CircleDiagram({ data }) {
  const { measurements = {}, labels = [] } = data
  return (
    <svg viewBox="0 0 240 240" className="diagram-svg">
      <circle cx="120" cy="120" r="90" fill="none" stroke="#2D3CE6" strokeWidth="2"/>
      {measurements.radius && (
        <>
          <line x1="120" y1="120" x2="210" y2="120" stroke="#2D3CE6" strokeWidth="1.5" strokeDasharray="4"/>
          <text x="165" y="112" textAnchor="middle" className="diagram-label">{measurements.radius}</text>
        </>
      )}
      {measurements.diameter && (
        <>
          <line x1="30" y1="120" x2="210" y2="120" stroke="#2D3CE6" strokeWidth="1.5" strokeDasharray="4"/>
          <text x="120" y="112" textAnchor="middle" className="diagram-label">{measurements.diameter}</text>
        </>
      )}
      {labels[0] && <text x="118" y="118" textAnchor="middle" className="diagram-label">{labels[0]}</text>}
    </svg>
  )
}

export function DiagramDisplay({ diagramData }) {
  if (!diagramData) return null

  if (diagramData.type === 'rectangle') return <RectangleDiagram data={diagramData} />
  if (diagramData.type === 'triangle')  return <TriangleDiagram  data={diagramData} />
  if (diagramData.type === 'circle')    return <CircleDiagram    data={diagramData} />

  // Fallback — show description
  return (
    <div className="diagram-placeholder">
      <span style={{ fontSize: 20, flexShrink: 0 }}>📐</span>
      <p className="diagram-note">
        {diagramData.description || 'This question references a diagram from the original paper.'}
      </p>
    </div>
  )
}
