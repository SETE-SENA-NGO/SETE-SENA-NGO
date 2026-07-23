import { supabase } from '@/lib/supabase'

export function subscribeToTableChanges(table: string, callback: () => void) {
  if (typeof window === 'undefined') return () => {}

  const channel = supabase
    .channel(`public-${table}-changes`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table },
      () => callback(),
    )
    .subscribe()

  return () => {
    void channel.unsubscribe()
  }
}
