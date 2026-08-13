import { useEffect, useRef, useState } from 'react'
import CurvedLoop from './CurvedLoop.jsx'
import { useBookImages } from './hooks/useBookImages.js'

const reasons = [
  ['01', 'Your laugh', 'my favourite sound'],
  ['02', 'Your heart', 'so gentle and kind'],
  ['03', 'Your strength', 'you amaze me'],
  ['04', 'Your mind', 'my favourite place'],
  ['05', 'Your hugs', 'they feel like home'],
  ['06', 'Just you', 'every lovely bit'],
]

const pageNames = ['Cover', 'Hello, love', 'Six chapters', 'Little things', 'Why you', 'Our photos', 'A question', 'My letter', 'Forever']

function Doodles() {
  return (
    <div className="doodles" aria-hidden="true">
      <span className="doodle-heart">♡</span>
      <span className="doodle-star">✦</span>
      <span className="doodle-loop">love · love · love</span>
    </div>
  )
}

function Polaroid({ src, caption, className = '' }) {
  return (
    <figure className={`polaroid ${className}`}>
      <span className="tape" aria-hidden="true" />
      <img src={src} alt="Placeholder for one of our memories" />
      <figcaption>{caption}</figcaption>
    </figure>
  )
}

function Cover({ onOpen }) {
  return (
    <div className="page cover-page">
      <div className="cover-spine" />
      <span className="cover-stamp">6</span>
      <div className="cover-title">
        <small>an anniversary scrapbook</small>
        <h1>Our<br /><em>Story</em></h1>
        <p>six years of choosing you</p>
      </div>
      <button className="open-book" onClick={(event) => { event.stopPropagation(); onOpen() }}>
        open our story <span>→</span>
      </button>
      <span className="cover-scribble">made with all my love</span>
    </div>
  )
}

function IntroPage({ photo }) {
  return (
    <div className="page paper-page intro-page">
      <Doodles />
      <span className="page-kicker">page one · the beginning</span>
      <h2>Hello,<br /><em>my love.</em></h2>
      <p className="lead-note">I made this little book because six years could never fit inside one message.</p>
      <Polaroid src={photo.url} caption={photo.caption} className="intro-photo" />
      <span className="pink-note">You are still my favourite hello.</span>
      <span className="page-number">01</span>
    </div>
  )
}

function TimelinePage() {
  return (
    <div className="page paper-page timeline-page">
      <span className="page-kicker">our story so far</span>
      <h2>Six little<br /><em>chapters</em></h2>
      <div className="mini-timeline">
        {['The hello', 'The laughter', 'The growing', 'The home', 'The adventures', 'The forever'].map((label, index) => (
          <div key={label}>
            <b>0{index + 1}</b><span>{label}</span><i>♥</i>
          </div>
        ))}
      </div>
      <span className="torn-quote">Every year with you became my new favourite.</span>
      <span className="page-number">02</span>
    </div>
  )
}

function LittleThingsPage({ leftPhoto, rightPhoto }) {
  return (
    <div className="page paper-page little-page">
      <span className="page-kicker">the little things</span>
      <h2>Things I never<br /><em>want to forget</em></h2>
      <Polaroid src={leftPhoto.url} caption={leftPhoto.caption} className="little-one" />
      <Polaroid src={rightPhoto.url} caption={rightPhoto.caption} className="little-two" />
      <ul className="scrap-list">
        <li>your sleepy voice</li>
        <li>our ridiculous jokes</li>
        <li>the way you say my name</li>
      </ul>
      <span className="page-number">03</span>
    </div>
  )
}

function ReasonsPage({ opened, onToggle }) {
  return (
    <div className="page paper-page reasons-page">
      <span className="page-kicker">a tiny list</span>
      <h2>Why I <em>love you</em></h2>
      <p className="tap-note">tap the hearts to peek</p>
      <div className="reason-notes">
        {reasons.map(([number, title, note], index) => (
          <button key={number} className={opened.includes(index) ? 'reason-note open' : 'reason-note'} onClick={(event) => { event.stopPropagation(); onToggle(index) }}>
            <b>{opened.includes(index) ? title : '♡'}</b>
            <span>{opened.includes(index) ? note : number}</span>
          </button>
        ))}
      </div>
      <span className="bottom-script">and about a million more...</span>
      <span className="page-number">04</span>
    </div>
  )
}

function GalleryPage({ leftPhoto, centerPhoto, rightPhoto }) {
  return (
    <div className="page paper-page gallery-page">
      <span className="page-kicker">snapshots of us</span>
      <h2>My favourite<br /><em>kind of magic</em></h2>
      <div className="photo-pile">
        <Polaroid src={leftPhoto.url} caption={leftPhoto.caption} className="pile-one" />
        <Polaroid src={centerPhoto.url} caption={centerPhoto.caption} className="pile-two" />
        <Polaroid src={rightPhoto.url} caption={rightPhoto.caption} className="pile-three" />
      </div>
      <span className="postcard">Wish you were here—<br />but you always are.</span>
      <span className="page-number">05</span>
    </div>
  )
}

function PlayfulPage({ accepted, onAccept }) {
  const [position, setPosition] = useState({ x: 0, y: 0, tries: 0 })
  const labels = ['Let me think', 'Nope!', 'Too slow ♡', 'Try again', 'Not that one']

  const dodge = (event) => {
    event.stopPropagation()
    event.preventDefault()
    setPosition((current) => ({
      x: Math.round((Math.random() * 2 - 1) * 105),
      y: Math.round((Math.random() * 2 - 1) * 62),
      tries: current.tries + 1,
    }))
  }

  return (
    <div className={`page paper-page playful-page ${accepted ? 'accepted' : ''}`}>
      <span className="page-kicker">one important question</span>
      <span className="big-sticker">be<br />mine!</span>
      <h2>{accepted ? <>I knew it! <em>♡</em></> : <>Will you keep<br /><em>choosing me?</em></>}</h2>
      <p>{accepted ? 'Good, because every tomorrow I imagine still has you in it.' : 'Careful—one answer is feeling a little shy.'}</p>
      <div className="choice-zone">
        {!accepted ? (
          <>
            <button className="yes-choice" onClick={(event) => { event.stopPropagation(); onAccept() }}>Always ♥</button>
            <button className="no-choice" style={{ transform: `translate(${position.x}px, ${position.y}px)` }} onPointerEnter={dodge} onPointerDown={dodge} onFocus={dodge}>
              {labels[position.tries % labels.length]}
            </button>
          </>
        ) : <span className="happy-heart">♥</span>}
      </div>
      {position.tries > 1 && !accepted && <small className="tease">Hmm... that button knows the right answer too.</small>}
      <span className="page-number">06</span>
    </div>
  )
}

function LetterPage() {
  // calendar
  const leadingDays = (new Date(new Date().getFullYear(), 8, 1).getDay() + 6) % 7

  return (
    <div className="page paper-page letter-page">
      <span className="page-kicker">from my heart</span>
      <div className="letter-sheet">
        <span>My love,</span>
        <h2>Six years later,<br /><em>I still choose you.</em></h2>
        <p>Thank you for every laugh, every lesson, every quiet moment, and every adventure. Loving you has made my world warmer, braver, and infinitely more beautiful.</p>
        <p>Here is to everything we have been—and everything we are still becoming.</p>
        <strong>Always yours ♡</strong>
      </div>
      <div className='letter-calendar' aria-label='September calendar'><h3>September</h3><div className='letter-calendar-weekdays'><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span></div><div className='letter-calendar-grid'>{Array.from({ length: leadingDays }, (_, index) => <span key={index} />)}{Array.from({ length: 30 }, (_, index) => { const day = index + 1; return <span className={day === 13 ? 'letter-calendar-day marked' : 'letter-calendar-day'} key={day}>{day === 13 && <b>♡</b>}<i>{day}</i></span> })}</div></div>
      <span className="pressed-flower">❀</span>
      <span className="page-number">07</span>
    </div>
  )
}

function CelebrationPopups({ burst, origin }) {
  const popupWords = ['Happy Anniversary', 'Pittu', 'Tuturasur', 'Vaishali', 'Mirchi']
  if (!burst) return null

  return (
    <div className="celebration-popups" key={burst} aria-hidden="true">
      {Array.from({ length: 42 }, (_, index) => {
        const angle = (index / 42) * Math.PI * 2
        const distance = 110 + (index % 7) * 34
        const dx = Math.round(Math.cos(angle) * distance)
        const dy = Math.round(Math.sin(angle) * distance - 145)
        const word = index % 5 === 0
        return <span className={word ? 'celebration-word' : 'celebration-piece'} key={index} style={{ '--i': index, '--x': `${origin?.x ?? '50vw'}${origin ? 'px' : ''}`, '--y': `${origin?.y ?? '68vh'}${origin ? 'px' : ''}`, '--dx': `${dx}px`, '--dy': `${dy}px`, '--spin': `${(index % 2 ? 1 : -1) * (180 + index * 17)}deg` }}>{word ? popupWords[(index / 5) % popupWords.length] : ''}</span>
      })}
    </div>
  )
}

const confessionItems = [
  { text: 'I still get butterflies when you smile.', slot: 'confession-1', caption: 'your beautiful smile' },
  { text: 'You make ordinary days feel special.', slot: 'confession-2', caption: 'the little moments' },
  { text: 'I am endlessly proud of the woman you are.', slot: 'confession-3', caption: 'you, always' },
  { text: 'Every future I imagine has you in it.', slot: 'confession-4', caption: 'our favourite kind of magic' },
  { text: 'I would choose you in every universe.', slot: 'confession-5', caption: 'my forever person' },
]

function ConfessionsOverlay({ open, onClose, imageFor }) {
  const [active, setActive] = useState(0)
  const [position, setPosition] = useState({ x: '72vw', y: '50vh' })
  const item = confessionItems[active]
  const image = imageFor(item.slot)

  if (!open) return null
  return (
    <div className="confessions-overlay" role="dialog" aria-modal="true" aria-label="My confessions" onPointerMove={(event) => { if (event.pointerType !== 'touch') setPosition({ x: `${Math.min(event.clientX + 22, window.innerWidth - 230)}px`, y: `${Math.min(event.clientY + 22, window.innerHeight - 250)}px` }) }}>
      <button className="confessions-close" onClick={onClose} aria-label="Close confessions">×</button>
      <section className="confessions-panel">
        <span className="page-kicker">things I never say enough</span>
        <h2>My little<br /><em>confessions.</em></h2>
        <p className="confessions-note">Hover on desktop. Tap on mobile.</p>
        <div className="confession-list">
          {confessionItems.map((confession, index) => <button className={active === index ? 'confession-line active' : 'confession-line'} key={confession.text} onMouseEnter={() => setActive(index)} onFocus={() => setActive(index)} onClick={() => setActive(index)}>{confession.text}</button>)}
        </div>
        <figure className="confession-preview" style={{ left: position.x, top: position.y }}>
          <img src={image.url} alt={item.text} />
          <figcaption>{item.caption}</figcaption>
        </figure>
      </section>
    </div>
  )
}

function FinalePage({ celebrated, onCelebrate, onOpenConfessions }) {

  return (
    <div className={`page paper-page finale-page ${celebrated ? 'celebrated' : ''}`}>
      <span className="page-kicker">to be continued...</span>
      <div className="final-heart">6<span>years</span></div>
      <h2>In every universe,<br /><em>I choose you.</em></h2>
      <p>Six years down. Forever to go.</p>
      <button className="kiss-button" onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); event.preventDefault(); onCelebrate(event.currentTarget) }}>
        {celebrated ? 'Happy Anniversary! ♥' : 'seal it with a kiss'}
      </button>
      {celebrated && <button className="confession-button" onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); onOpenConfessions() }}>open my confessions ♥</button>}
      <div className="confetti" aria-hidden="true">
        {Array.from({ length: 22 }, (_, index) => <i key={index} style={{ '--i': index }} />)}
      </div>

      <span className="page-number">08</span>
    </div>
  )
}

function PageContent({ page, openedReasons, setOpenedReasons, accepted, setAccepted, celebrated, setCelebrated, setCelebrationBurst, setCelebrationOrigin, setConfessionsOpen, onOpen, imageFor }) {
  switch (page) {
    case 0: return <Cover onOpen={onOpen} />
    case 1: return <IntroPage photo={imageFor('intro-main')} />
    case 2: return <TimelinePage />
    case 3: return <LittleThingsPage leftPhoto={imageFor('little-left')} rightPhoto={imageFor('little-right')} />
    case 4: return <ReasonsPage opened={openedReasons} onToggle={(index) => setOpenedReasons((items) => items.includes(index) ? items.filter((item) => item !== index) : [...items, index])} />
    case 5: return <GalleryPage leftPhoto={imageFor('gallery-left')} centerPhoto={imageFor('gallery-center')} rightPhoto={imageFor('gallery-right')} />
    case 6: return <PlayfulPage accepted={accepted} onAccept={() => setAccepted(true)} />
    case 7: return <LetterPage />
    case 8: return <FinalePage celebrated={celebrated} onCelebrate={(button) => { const rect = button.getBoundingClientRect(); setCelebrationOrigin({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }); setCelebrated(true); setCelebrationBurst((count) => count + 1) }} onOpenConfessions={() => setConfessionsOpen(true)} />
    default: return null
  }
}

function App() {
  const { imageFor } = useBookImages()
  const [page, setPage] = useState(0)
  const [bookView, setBookView] = useState('full')
  const [openedReasons, setOpenedReasons] = useState([])
  const [accepted, setAccepted] = useState(false)
  const [celebrated, setCelebrated] = useState(false)
  const [celebrationBurst, setCelebrationBurst] = useState(0)
  const [celebrationOrigin, setCelebrationOrigin] = useState(null)
  const [confessionsOpen, setConfessionsOpen] = useState(false)
  const [flipState, setFlipState] = useState(null)
  const flipTimer = useRef(null)
  const wheelAmount = useRef(0)
  const wheelReset = useRef(null)
  const viewportRef = useRef(null)
  const wheelLock = useRef(false)
  const swipeStart = useRef(null)
  const sheet = page === 0 ? 0 : Math.ceil(page / 2)
  const sheets = [0, 1, 2, 3, 4]

  const move = (direction) => {
    if (flipState) return
    const step = bookView === 'single' || page === 0 || (direction < 0 && page <= 1) ? 1 : 2
    const target = Math.max(0, Math.min(8, page + direction * step))
    if (target === page) return

    const currentSheet = page === 0 ? 0 : Math.ceil(page / 2)
    const targetSheet = target === 0 ? 0 : Math.ceil(target / 2)
    if (bookView === 'full' && currentSheet !== targetSheet) {
      const turningLeaf = direction > 0 ? currentSheet : targetSheet
      setFlipState({ leaf: turningLeaf, direction: direction > 0 ? 'forward' : 'backward' })
      window.clearTimeout(flipTimer.current)
      flipTimer.current = window.setTimeout(() => setFlipState(null), 1320)
    }
    setPage(target)
  }

  const next = () => move(1)
  const previous = () => move(-1)

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next()
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') previous()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const resetViewportMotion = () => {
    wheelAmount.current = 0
    if (viewportRef.current) {
      viewportRef.current.style.setProperty('--scroll-nudge', '0px')
      viewportRef.current.style.setProperty('--swipe-nudge', '0px')
    }
  }

  const onWheel = (event) => {
    if (flipState || wheelLock.current) return
    const normalized = event.deltaMode === 1
      ? event.deltaY * 18
      : event.deltaMode === 2
        ? event.deltaY * window.innerHeight
        : event.deltaY

    wheelAmount.current += Math.max(-48, Math.min(48, normalized))
    const nudge = Math.max(-7, Math.min(7, wheelAmount.current / 10))
    viewportRef.current?.style.setProperty('--scroll-nudge', `${nudge}px`)

    window.clearTimeout(wheelReset.current)
    wheelReset.current = window.setTimeout(resetViewportMotion, 150)
    if (Math.abs(wheelAmount.current) < 78) return

    const direction = wheelAmount.current > 0 ? 1 : -1
    wheelLock.current = true
    resetViewportMotion()
    move(direction)
    window.setTimeout(() => { wheelLock.current = false }, 1320)
  }

  const moveSwipe = (event) => {
    if (swipeStart.current === null || flipState) return
    const position = event.clientX ?? event.touches?.[0]?.clientX
    const distance = position - swipeStart.current
    const nudge = Math.max(-12, Math.min(12, distance * 0.08))
    viewportRef.current?.style.setProperty('--swipe-nudge', `${nudge}px`)
  }

  const finishSwipe = (event) => {
    if (swipeStart.current === null) return
    const end = event.clientX ?? event.changedTouches?.[0]?.clientX
    const difference = end - swipeStart.current
    viewportRef.current?.style.setProperty('--swipe-nudge', '0px')
    if (Math.abs(difference) > 45 && !flipState) difference < 0 ? next() : previous()
    swipeStart.current = null
  }

  return (
    <main className={`scrapbook-app view-${bookView}`} onWheel={onWheel}>
      <CelebrationPopups burst={celebrationBurst} origin={celebrationOrigin} />
      <ConfessionsOverlay open={confessionsOpen} onClose={() => setConfessionsOpen(false)} imageFor={imageFor} />
      <div className="desk-shape shape-one" /><div className="desk-shape shape-two" />
      <div className="curved-ribbon" aria-label="A moving ribbon that says six years of us, forever to go">
        <CurvedLoop
          text="six years of us  ✦  forever to go  ♡  "
          font={{ fontFamily: 'Caveat', fontWeight: 600, fontSize: 46, letterSpacing: '2px' }}
          color="#9a4169"
          direction="right"
          baseVelocity={7}
          curveAmount={-235}
          gap={7}
          dragIntensity={7}
          fadePercent={15}
          style={{ minHeight: 0 }}
        />
      </div>
      <header className="scrapbook-header">
        <div className="tiny-logo">6</div>
        <div><strong>Anniversary Scrapbook</strong><span>♡ &nbsp;8 pages</span></div>
        <button
          className={`view-toggle ${bookView}`}
          onClick={() => setBookView((current) => current === 'full' ? 'single' : 'full')}
          aria-label={bookView === 'full' ? 'Switch to single page view' : 'Switch to full book view'}
          title={bookView === 'full' ? 'Single page view' : 'Full book view'}
        >
          <span className="view-icon" aria-hidden="true"><i /><i /></span>
        </button>        <div className="page-dots" aria-label={`Page ${page} of 8`}>
          {Array.from({ length: 9 }, (_, index) => <i key={index} className={index === page ? 'active' : index < page ? 'done' : ''} />)}
        </div>
      </header>

      <div className="book-viewport" ref={viewportRef} onPointerDown={(event) => { swipeStart.current = event.clientX }} onPointerMove={moveSwipe} onPointerUp={finishSwipe} onPointerCancel={() => { swipeStart.current = null; resetViewportMotion() }}>
        <div className={`book ${page === 0 ? 'closed' : 'open'} ${flipState ? 'is-flipping' : ''}`} aria-busy={Boolean(flipState)}>
          <div className="book-shadow" />
          <div className="book-base" />
          {sheets.map((leafIndex) => (
            <div className={`leaf ${leafIndex < sheet ? 'turned' : ''} ${flipState?.leaf === leafIndex ? `flipping flip-${flipState.direction}` : ''}`} key={leafIndex} style={{ '--leaf': leafIndex, zIndex: flipState?.leaf === leafIndex ? 30 : leafIndex < sheet ? leafIndex + 1 : sheets.length - leafIndex + 5 }}>
              <div className="leaf-face leaf-front">
                <PageContent page={leafIndex * 2} {...{ openedReasons, setOpenedReasons, accepted, setAccepted, celebrated, setCelebrated, setCelebrationBurst, setCelebrationOrigin, setConfessionsOpen }} imageFor={imageFor} onOpen={next} />
              </div>
              <div className="leaf-face leaf-back">
                <PageContent page={leafIndex * 2 + 1} {...{ openedReasons, setOpenedReasons, accepted, setAccepted, celebrated, setCelebrated, setCelebrationBurst, setCelebrationOrigin, setConfessionsOpen }} imageFor={imageFor} onOpen={next} />
              </div>
            </div>
          ))}
        </div>

        <div className="mobile-page" key={page}>
          <PageContent page={page} {...{ openedReasons, setOpenedReasons, accepted, setAccepted, celebrated, setCelebrated, setCelebrationBurst, setCelebrationOrigin, setConfessionsOpen }} imageFor={imageFor} onOpen={next} />
        </div>
      </div>

      <footer className="book-controls">
        <button onClick={previous} disabled={page === 0 || Boolean(flipState)} aria-label="Previous page">←</button>
        <span>{page === 0 ? 'open the cover' : `${pageNames[page]} · ${page}/8`}</span>
        <button onClick={next} disabled={page === 8 || Boolean(flipState)} aria-label="Next page">→</button>
      </footer>
      <p className="scroll-hint">scroll, swipe, or use the arrows to turn pages</p>
    </main>
  )
}

export default App
