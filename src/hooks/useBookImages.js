import { useCallback, useEffect, useState } from 'react'
import { IMAGE_SLOT_MAP } from '../bookConfig.js'
import { isSupabaseConfigured, STORAGE_BUCKET, supabase } from '../lib/supabase.js'

function recordToImage(record, fallback) {
  if (!record?.storage_path || !supabase) return fallback
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(record.storage_path)
  return {
    url: data.publicUrl,
    caption: record.caption?.trim() || fallback.caption,
    isDynamic: true,
  }
}

export function useBookImages() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(isSupabaseConfigured)

  const loadImages = useCallback(async () => {
    if (!supabase) {
      setLoading(false)
      return
    }
    const { data, error } = await supabase
      .from('page_images')
      .select('id,page_number,slot_key,storage_path,caption,updated_at')
      .order('page_number')

    if (!error) setRecords(data || [])
    else console.warn('Unable to load dynamic scrapbook images:', error.message)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadImages()
    if (!supabase) return undefined

    const channel = supabase
      .channel('public-page-images')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'page_images' }, loadImages)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [loadImages])

  const imageFor = useCallback((slotKey) => {
    const slot = IMAGE_SLOT_MAP[slotKey]
    const fallback = { url: slot?.fallbackUrl || '', caption: slot?.caption || '', isDynamic: false }
    return recordToImage(records.find((record) => record.slot_key === slotKey), fallback)
  }, [records])

  return { imageFor, loading, refresh: loadImages }
}