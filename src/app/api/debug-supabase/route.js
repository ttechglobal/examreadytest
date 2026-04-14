import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const svc  = process.env.SUPABASE_SERVICE_ROLE_KEY

  const report = {
    url_set:    !!url,
    url_starts: url?.slice(0, 30),
    anon_set:   !!anon,
    anon_start: anon?.slice(0, 10),
    anon_end:   anon?.slice(-6),
    svc_set:    !!svc,
    svc_start:  svc?.slice(0, 10),
    svc_end:    svc?.slice(-6),
    svc_len:    svc?.length,
    svc_has_quotes: svc?.startsWith('"') || svc?.startsWith("'"),
    svc_has_spaces: svc?.includes(' '),
  }

  // Try an actual query with service role key
  if (url && svc) {
    try {
      const client = createClient(url, svc, {
        auth: { autoRefreshToken: false, persistSession: false }
      })
      const { data, error } = await client.from('subjects').select('id').limit(1)
      report.svc_query_ok    = !error
      report.svc_query_error = error?.message || null
    } catch (err) {
      report.svc_query_ok    = false
      report.svc_query_error = err.message
    }
  }

  // Try with anon key too
  if (url && anon) {
    try {
      const client = createClient(url, anon)
      const { data, error } = await client.from('subjects').select('id').limit(1)
      report.anon_query_ok    = !error
      report.anon_query_error = error?.message || null
    } catch (err) {
      report.anon_query_ok    = false
      report.anon_query_error = err.message
    }
  }

  return NextResponse.json(report)
}
