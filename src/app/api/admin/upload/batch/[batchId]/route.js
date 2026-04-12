import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function DELETE(request, { params }) {
  const supabase = createServerClient()
  const { error, count } = await supabase
    .from('questions')
    .delete({ count: 'exact' })
    .eq('upload_batch', params.batchId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ deleted: count })
}
