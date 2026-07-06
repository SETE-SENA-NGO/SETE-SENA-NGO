export interface UserProfile {
  id: string
  email: string
  role: 'admin' | 'editor' | 'viewer'
}
