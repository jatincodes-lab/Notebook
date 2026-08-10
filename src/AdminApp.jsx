import { useCallback, useEffect, useMemo, useState } from 'react'
import { IMAGE_SLOTS } from './bookConfig.js'
import { isSupabaseConfigured, STORAGE_BUCKET, supabase } from './lib/supabase.js'

const MAX_FILE_SIZE = 6 * 1024 * 1024

function publicUrl(storagePath) {
  if (!storagePath || !supabase) return ''
  return supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath).data.publicUrl
}

async function optimizeImage(file) {
  if (!file.type.startsWith('image/')) throw new Error('Please choose an image file.')
  if (file.size > MAX_FILE_SIZE) throw new Error('The image must be smaller than 6 MB.')
  if (file.type === 'image/gif') return file

  try {
    const bitmap = await createImageBitmap(file)
    const longestSide = Math.max(bitmap.width, bitmap.height)
    const scale = Math.min(1, 1800 / longestSide)
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    const context = canvas.getContext('2d')
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', 0.86))
    if (!blob) return file
    const basename = file.name.replace(/\.[^.]+$/, '') || 'memory'
    return new File([blob], `${basename}.webp`, { type: 'image/webp' })
  } catch {
    return file
  }
}

function SetupRequired() {
  return (
    <main className="admin-shell setup-shell">
      <section className="setup-card">
        <span className="admin-brand-mark">6</span>
        <p className="admin-kicker">Backend setup required</p>
        <h1>Connect your<br /><em>scrapbook.</em></h1>
        <p>Create <code>.env.local</code> from <code>.env.example</code>, add your Supabase project URL and publishable key, then run the included SQL migration.</p>
        <div className="setup-steps">
          <span><b>01</b> Create a Supabase project</span>
          <span><b>02</b> Run <code>supabase/migrations/001_scrapbook_admin.sql</code></span>
          <span><b>03</b> Add your credentials and restart Vite</span>
        </div>
        <a href="/">← Return to scrapbook</a>
      </section>
    </main>
  )
}

function Login({ onAuthenticated }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setMessage('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setMessage(error.message)
    else onAuthenticated(data.session)
    setSubmitting(false)
  }

  return (
    <main className="admin-shell login-shell">
      <section className="login-card">
        <a className="admin-back" href="/">← View scrapbook</a>
        <span className="admin-brand-mark">6</span>
        <p className="admin-kicker">Private scrapbook studio</p>
        <h1>Welcome<br /><em>back.</em></h1>
        <p>Sign in to update the memories inside your anniversary book.</p>
        <form onSubmit={submit}>
          <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label>
          <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required /></label>
          {message && <div className="admin-error" role="alert">{message}</div>}
          <button className="admin-primary" disabled={submitting}>{submitting ? 'Signing in…' : 'Enter the studio'}</button>
        </form>
      </section>
    </main>
  )
}

function SlotCard({ slot, record, caption, onCaptionChange, onUpload, onSaveCaption, onDelete, busy }) {
  const image = record ? publicUrl(record.storage_path) : slot.fallbackUrl
  const inputId = `upload-${slot.slotKey}`

  return (
    <article
      className={`slot-card ${busy ? 'busy' : ''}`}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault()
        const file = event.dataTransfer.files?.[0]
        if (file) onUpload(slot, file)
      }}
    >
      <div className="slot-preview">
        <img src={image} alt={`${slot.label} preview`} />
        <span>{record ? 'Live image' : 'Placeholder'}</span>
        {busy && <div className="uploading"><i />Optimizing & uploading…</div>}
      </div>
      <div className="slot-details">
        <div className="slot-title"><span>{slot.slotKey}</span><h3>{slot.label}</h3></div>
        <label className="caption-field">Caption
          <input value={caption} onChange={(event) => onCaptionChange(slot.slotKey, event.target.value)} maxLength="120" />
        </label>
        <div className="slot-actions">
          <label className="upload-button" htmlFor={inputId}>{record ? 'Replace image' : 'Upload image'}</label>
          <input id={inputId} className="file-input" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => { const file = event.target.files?.[0]; if (file) onUpload(slot, file); event.target.value = '' }} />
          {record && <button onClick={() => onSaveCaption(slot)} className="text-button">Save caption</button>}
          {record && <button onClick={() => onDelete(slot, record)} className="delete-button" aria-label={`Delete ${slot.label}`}>Delete</button>}
        </div>
      </div>
    </article>
  )
}

function Dashboard({ session }) {
  const [authorized, setAuthorized] = useState(null)
  const [records, setRecords] = useState([])
  const [captions, setCaptions] = useState({})
  const [pageFilter, setPageFilter] = useState('all')
  const [busySlot, setBusySlot] = useState('')
  const [notice, setNotice] = useState(null)

  const loadRecords = useCallback(async () => {
    const { data, error } = await supabase.from('page_images').select('*').order('page_number')
    if (error) throw error
    setRecords(data || [])
    setCaptions(Object.fromEntries(IMAGE_SLOTS.map((slot) => {
      const record = data?.find((item) => item.slot_key === slot.slotKey)
      return [slot.slotKey, record?.caption || slot.caption]
    })))
  }, [])

  useEffect(() => {
    let active = true
    const initialize = async () => {
      const { data, error } = await supabase.from('admins').select('user_id').eq('user_id', session.user.id).maybeSingle()
      if (!active) return
      if (error || !data) {
        setAuthorized(false)
        return
      }
      setAuthorized(true)
      try { await loadRecords() } catch (loadError) { setNotice({ type: 'error', text: loadError.message }) }
    }
    initialize()
    return () => { active = false }
  }, [session.user.id, loadRecords])

  const showNotice = (type, text) => {
    setNotice({ type, text })
    window.setTimeout(() => setNotice(null), 4200)
  }

  const upload = async (slot, sourceFile) => {
    if (busySlot) return
    setBusySlot(slot.slotKey)
    try {
      const file = await optimizeImage(sourceFile)
      const oldRecord = records.find((item) => item.slot_key === slot.slotKey)
      const extension = file.type === 'image/gif' ? 'gif' : 'webp'
      const storagePath = `${session.user.id}/${slot.slotKey}-${Date.now()}.${extension}`
      const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(storagePath, file, { cacheControl: '31536000', upsert: false })
      if (uploadError) throw uploadError

      const { error: databaseError } = await supabase.from('page_images').upsert({
        page_number: slot.pageNumber,
        slot_key: slot.slotKey,
        storage_path: storagePath,
        caption: captions[slot.slotKey] || slot.caption,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'page_number,slot_key' })

      if (databaseError) {
        await supabase.storage.from(STORAGE_BUCKET).remove([storagePath])
        throw databaseError
      }
      if (oldRecord?.storage_path) await supabase.storage.from(STORAGE_BUCKET).remove([oldRecord.storage_path])
      await loadRecords()
      showNotice('success', `${slot.label} is now live in the scrapbook.`)
    } catch (error) {
      showNotice('error', error.message || 'The image could not be uploaded.')
    } finally {
      setBusySlot('')
    }
  }

  const saveCaption = async (slot) => {
    setBusySlot(slot.slotKey)
    const { error } = await supabase.from('page_images').update({ caption: captions[slot.slotKey], updated_at: new Date().toISOString() }).eq('slot_key', slot.slotKey)
    setBusySlot('')
    if (error) showNotice('error', error.message)
    else {
      await loadRecords()
      showNotice('success', 'Caption updated.')
    }
  }

  const remove = async (slot, record) => {
    if (!window.confirm(`Remove the image from “${slot.label}”?`)) return
    setBusySlot(slot.slotKey)
    const { error } = await supabase.from('page_images').delete().eq('id', record.id)
    if (!error && record.storage_path) await supabase.storage.from(STORAGE_BUCKET).remove([record.storage_path])
    setBusySlot('')
    if (error) showNotice('error', error.message)
    else {
      await loadRecords()
      showNotice('success', 'Image removed. The placeholder is visible again.')
    }
  }

  if (authorized === null) return <main className="admin-shell admin-loading"><i /><span>Opening your scrapbook studio…</span></main>
  if (!authorized) return (
    <main className="admin-shell setup-shell">
      <section className="setup-card">
        <span className="admin-brand-mark">!</span>
        <p className="admin-kicker">Access not granted</p>
        <h1>This account is<br /><em>not an admin.</em></h1>
        <p>Add this user’s ID to the <code>public.admins</code> table using the command at the bottom of the included SQL migration.</p>
        <button className="admin-primary" onClick={() => supabase.auth.signOut()}>Sign out</button>
      </section>
    </main>
  )

  const pages = [...new Set(IMAGE_SLOTS.map((slot) => slot.pageNumber))]
  const visibleSlots = pageFilter === 'all' ? IMAGE_SLOTS : IMAGE_SLOTS.filter((slot) => slot.pageNumber === Number(pageFilter))

  return (
    <main className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-identity"><span className="admin-brand-mark">6</span><div><p>Private studio</p><strong>Scrapbook Admin</strong></div></div>
        <div className="admin-header-actions"><a href="/" target="_blank" rel="noreferrer">Preview book ↗</a><button onClick={() => supabase.auth.signOut()}>Sign out</button></div>
      </header>

      <section className="admin-hero">
        <div><p className="admin-kicker">Memory manager</p><h1>Fill the pages with<br /><em>your real moments.</em></h1><p>Drop a photograph into any slot. Images are optimized before uploading and appear in the book automatically.</p></div>
        <div className="admin-summary"><strong>{records.length}<span>of {IMAGE_SLOTS.length}</span></strong><p>personal photos added</p></div>
      </section>

      <nav className="page-filters" aria-label="Filter image slots by page">
        <button className={pageFilter === 'all' ? 'active' : ''} onClick={() => setPageFilter('all')}>All pages</button>
        {pages.map((pageNumber) => <button key={pageNumber} className={pageFilter === String(pageNumber) ? 'active' : ''} onClick={() => setPageFilter(String(pageNumber))}>Page {pageNumber}</button>)}
      </nav>

      <section className="slot-grid">
        {visibleSlots.map((slot) => <SlotCard key={slot.slotKey} slot={slot} record={records.find((record) => record.slot_key === slot.slotKey)} caption={captions[slot.slotKey] ?? slot.caption} onCaptionChange={(key, value) => setCaptions((current) => ({ ...current, [key]: value }))} onUpload={upload} onSaveCaption={saveCaption} onDelete={remove} busy={busySlot === slot.slotKey} />)}
      </section>

      <footer className="admin-footer"><span>Signed in as {session.user.email}</span><span>JPEG · PNG · WebP · GIF · maximum 6 MB</span></footer>
      {notice && <div className={`admin-toast ${notice.type}`} role="status">{notice.text}</div>}
    </main>
  )
}

export default function AdminApp() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!supabase) return undefined
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setLoading(false)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  if (!isSupabaseConfigured) return <SetupRequired />
  if (loading) return <main className="admin-shell admin-loading"><i /><span>Checking your session…</span></main>
  if (!session) return <Login onAuthenticated={setSession} />
  return <Dashboard session={session} />
}