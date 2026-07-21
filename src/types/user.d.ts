export interface UserProfile {
  id: string
  email: string
  role: 'super_admin' | 'admin' | 'editor' | 'viewer'
  full_name?: string | null
  avatar_url?: string | null
}
