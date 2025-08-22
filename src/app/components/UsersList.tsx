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

  if (loading) return <div>Loading users...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Users</h2>
      <div className="space-y-4">
        {users.length === 0 ? (
          <p>No users found</p>
        ) : (
          users.map((user) => (
            <div key={user.id} className="p-4 border rounded-lg shadow">
              <p className="font-medium">Email: {user.email}</p>
              <p className="text-sm text-gray-500">
                Joined: {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
