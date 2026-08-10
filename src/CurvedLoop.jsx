import { useEffect, useMemo, useRef, useState } from 'react'

const MAX_SPEED = 800

export default function CurvedLoop({
  text = 'Originkit',
  font = {
    fontFamily: 'Inter',
    fontWeight: 400,
    fontSize: 64,
    lineHeight: '1.5em',
    letterSpacing: '1px',
    textAlign: 'left',
  },
  color = '#ffffff',
  direction = 'right',
  baseVelocity = 35,
  curveAmount = -400,
  gap = 12,
  draggable = true,
  dragIntensity = 10,
  fade = true,
  fadePercent = 12,
  style,
}) {
  const measureRef = useRef(null)
  const tspansRef = useRef([])
  const pathRef = useRef(null)
  const [pathLength, setPathLength] = useState(0)
  const [textWidth, setTextWidth] = useState(0)

  const staticId = useMemo(() => {
    const propsString = `${text}-${curveAmount}-${direction}-${baseVelocity}`
    let hash = 0
    for (let index = 0; index < propsString.length; index += 1) {
      hash = ((hash << 5) - hash + propsString.charCodeAt(index)) | 0
    }
    return Math.abs(hash).toString(36)
  }, [text, curveAmount, direction, baseVelocity])

  const pathId = `curve-${staticId}`
  const fadeGradientId = `fade-gradient-${staticId}`
  const fadeMaskId = `fade-mask-${staticId}`
  const pathD = `M-100,400 Q720,${400 + curveAmount} 1540,400`
  const isDragging = useRef(false)
  const dragVelocity = useRef(0)
  const lastPointerPosition = useRef({ x: 0, y: 0 })
  const effectiveVelocity = (baseVelocity / 100) * MAX_SPEED
  const actualBaseVelocity = direction === 'left' ? -effectiveVelocity : effectiveVelocity
  const dragFactor = dragIntensity * 0.1
  const gapPx = (gap + 1) * 10
  const processedText = useMemo(() => text.trim(), [text])
  const spacing = textWidth + gapPx

  useEffect(() => {
    if (measureRef.current) setTextWidth(measureRef.current.getComputedTextLength())
  }, [text, font, color, direction, baseVelocity, curveAmount, gap, draggable, dragIntensity, fade, fadePercent])

  useEffect(() => {
    if (pathRef.current) setPathLength(pathRef.current.getTotalLength())
  }, [curveAmount])

  const calculatedRepeats = spacing > 0 ? Math.ceil(pathLength / spacing) + 2 : 0
  const ready = pathLength > 0 && spacing > 0

  useEffect(() => {
    if (!ready) return undefined
    let frame = 0
    let last = performance.now()

    const tick = (now) => {
      const delta = now - last
      last = now
      const spans = tspansRef.current
      if (spans.length > 0) {
        const maxX = (spans.length - 1) * spacing
        let moveBy = isDragging.current ? dragVelocity.current : actualBaseVelocity * (delta / 1000) + dragVelocity.current

        spans.forEach((tspan) => {
          if (!tspan) return
          let x = Number.parseFloat(tspan.getAttribute('x') || '0') + moveBy
          if (x < -spacing) x = maxX
          if (x > maxX) x = -spacing
          tspan.setAttribute('x', x.toString())
        })

        dragVelocity.current *= isDragging.current ? 0.9 : 0.96
        if (Math.abs(dragVelocity.current) < 0.01) dragVelocity.current = 0
      }
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [ready, spacing, actualBaseVelocity])

  const handlePointerDown = (event) => {
    if (!draggable) return
    event.currentTarget.setPointerCapture(event.pointerId)
    isDragging.current = true
    lastPointerPosition.current = { x: event.clientX, y: event.clientY }
    dragVelocity.current = 0
  }

  const handlePointerMove = (event) => {
    if (!draggable || !isDragging.current) return
    const deltaX = event.clientX - lastPointerPosition.current.x
    dragVelocity.current = deltaX * dragFactor
    lastPointerPosition.current = { x: event.clientX, y: event.clientY }
  }

  const handlePointerUp = (event) => {
    if (!draggable) return
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    isDragging.current = false
  }

  const fadeStart = `${fadePercent}%`
  const fadeEnd = `${100 - fadePercent}%`

  return (
    <div style={{ visibility: ready ? 'visible' : 'hidden', minHeight: '100vh', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', ...style }}>
      <svg viewBox="0 0 1440 800" className="curved-loop-svg" style={{ fill: color, fontFamily: font.fontFamily, fontSize: font.fontSize, letterSpacing: font.letterSpacing, lineHeight: font.lineHeight }}>
        <text ref={measureRef} xmlSpace="preserve" style={{ visibility: 'hidden', opacity: 0, pointerEvents: 'none' }}>{processedText}</text>
        <defs>
          <path ref={pathRef} id={pathId} d={pathD} fill="none" stroke="transparent" />
          {fade && (
            <>
              <linearGradient id={fadeGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="white" stopOpacity="0" />
                <stop offset={fadeStart} stopColor="white" stopOpacity="1" />
                <stop offset={fadeEnd} stopColor="white" stopOpacity="1" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </linearGradient>
              <mask id={fadeMaskId}><rect width="100%" height="100%" fill={`url(#${fadeGradientId})`} /></mask>
            </>
          )}
        </defs>
        {ready && (
          <text fontWeight={font.fontWeight} xmlSpace="preserve" mask={fade ? `url(#${fadeMaskId})` : undefined} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp} style={{ cursor: draggable ? 'grab' : 'default' }}>
            <textPath href={`#${pathId}`} xmlSpace="preserve">
              {Array.from({ length: calculatedRepeats }).map((_, index) => (
                <tspan key={index} x={index * spacing} ref={(element) => { if (element) tspansRef.current[index] = element }}>{processedText}</tspan>
              ))}
            </textPath>
          </text>
        )}
      </svg>
    </div>
  )
}