import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { CreateUserRequest, UserRole } from '@/types/api.types'

/** Backend enum Users.role */
const USER_ROLE_OPTIONS: UserRole[] = ['Admin', 'Legal Officer', 'Reviewer']

interface CreateUserDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateUserRequest) => void
  isPending?: boolean
}

export function CreateUserDialog({
  open,
  onClose,
  onSubmit,
  isPending = false,
}: CreateUserDialogProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<CreateUserRequest['role']>('Reviewer')
  const [department, setDepartment] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!name.trim() || !email.trim() || !password.trim() || !department.trim()) {
      setError('Please fill in all fields.')
      return
    }
    onSubmit({
      name: name.trim(),
      email: email.trim(),
      password,
      role,
      department: department.trim(),
    })
    setName('')
    setEmail('')
    setPassword('')
    setRole('Reviewer')
    setDepartment('')
  }

  const handleClose = () => {
    setError(null)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md max-h-[90vh] rounded-2xl overflow-hidden border border-brand-accent-dark/30 bg-[#0A1628] shadow-[0_0_24px_rgba(0,217,255,0.08)] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 shrink-0">
          <h2 className="text-xl font-bold text-white mb-4">Add User</h2>
        </div>
        <form id="create-user-form" onSubmit={handleSubmit} className="px-6 pb-4 flex-1 min-h-0 overflow-y-auto sidebar-nav-scroll space-y-4">
            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}
            <div>
              <Label htmlFor="create-user-name" className="text-white">Name</Label>
              <Input
                id="create-user-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="mt-1 bg-white/5 border-brand-accent-dark/30"
                disabled={isPending}
              />
            </div>
            <div>
              <Label htmlFor="create-user-email" className="text-white">Email</Label>
              <Input
                id="create-user-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@legal.com"
                className="mt-1 bg-white/5 border-brand-accent-dark/30"
                disabled={isPending}
              />
            </div>
            <div>
              <Label htmlFor="create-user-password" className="text-white">Password</Label>
              <Input
                id="create-user-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 bg-white/5 border-brand-accent-dark/30"
                disabled={isPending}
              />
            </div>
            <div>
              <Label htmlFor="create-user-role" className="text-white">Role</Label>
              <select
                id="create-user-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-1 w-full h-10 rounded-md border border-brand-accent-dark/30 bg-white/5 text-white px-3 focus:outline-none focus:ring-2 focus:ring-brand-accent-dark"
                disabled={isPending}
              >
                {USER_ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r} className="bg-[#0A1628] text-white">
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="create-user-department" className="text-white">Department</Label>
              <Input
                id="create-user-department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Compliance, Corporate Law"
                className="mt-1 bg-white/5 border-brand-accent-dark/30"
                disabled={isPending}
              />
            </div>
          </form>
        <div className="p-6 pt-2 shrink-0 border-t border-brand-accent-dark/20">
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isPending}
              className="flex-1 border-brand-accent-dark/30 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="create-user-form"
              disabled={isPending}
              className="flex-1 bg-brand-accent-dark text-[#0A1628] hover:bg-brand-accent-dark/90"
            >
              {isPending ? 'Adding...' : 'Add User'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
