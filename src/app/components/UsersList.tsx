'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@/lib/supabase/types'

export default function UsersList() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUsers() {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')

        if (error) {
          throw error
        }

        setUsers(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching users')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  if (loading) return <div className="text-[var(--foreground)]">Loading users...</div>
  if (error) return <div className="text-[var(--error)]">Error: {error}</div>

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4 text-[var(--foreground)]">Users</h2>
      <div className="space-y-4">
        {users.length === 0 ? (
          <p className="text-[var(--muted)]">No users found</p>
        ) : (
          users.map((user) => (
            <div key={user.id} className="p-4 border border-[var(--border)] rounded-lg shadow-sm bg-[var(--background)]">
              <p className="font-medium text-[var(--foreground)]">Email: {user.email}</p>
              <p className="text-sm text-[var(--muted)]">
                Joined: {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
