export type User = { id: string; email: string; role: 'user' | 'admin' }

export type LoginResponse = {
  access_token: string
  refresh_token: string
  user: User
  exp: number
}

export type RefreshResponse = {
  access_token: string
  refresh_token?: string
  exp: number
}
