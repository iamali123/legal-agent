import { useState } from 'react'
import { Plus, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/layout/PageHeader'
import { CreateUserDialog } from '@/components/CreateUserDialog'
import { cn, formatDate } from '@/lib/utils'
import { useUsers, useCreateUser, useIsAdmin } from '@/hooks/api'
import type { CreateUserRequest } from '@/types/api.types'
import { useTranslation } from 'react-i18next'

export function Admin() {
  const { t } = useTranslation()
  const isAdmin = useIsAdmin()
  const [addUserOpen, setAddUserOpen] = useState(false)

  const { data: usersData, isLoading, error } = useUsers()
  const createMutation = useCreateUser()

  const users = usersData?.data ?? []

  const handleAddUser = (data: CreateUserRequest) => {
    createMutation.mutate(data, {
      onSuccess: () => setAddUserOpen(false),
    })
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen">
        <PageHeader title={t('admin.title')} subtitle={t('admin.userManagement')} />
        <div className="px-8 py-12 max-w-2xl mx-auto text-center">
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8">
            <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">{t('admin.accessDenied')}</h2>
            <p className="text-brand-muted-text-dark">
              {t('admin.accessDeniedMessage')}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <PageHeader
        title={t('admin.title')}
        subtitle={t('admin.subtitle')}
      />
      <div className="px-8 pt-4 pb-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-brand-accent-dark">
              {t('admin.users')}
            </h2>
            <Button
              className="bg-brand-accent-dark hover:bg-brand-accent-dark/90"
              onClick={() => setAddUserOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('admin.addUser')}
            </Button>
          </div>

          <CreateUserDialog
            open={addUserOpen}
            onClose={() => setAddUserOpen(false)}
            onSubmit={handleAddUser}
            isPending={createMutation.isPending}
          />

          {error && (
            <p className="text-red-400 text-sm py-4">{t('admin.failedToLoad')}</p>
          )}

          <div className="border border-brand-accent-dark/30 rounded-xl overflow-hidden bg-white/5">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-brand-accent-dark/30 bg-white/5">
                    <th className="px-6 py-4 text-left text-xs font-medium text-brand-accent-dark uppercase tracking-wider">
                      {t('admin.tableName')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-brand-accent-dark uppercase tracking-wider">
                      {t('admin.tableEmail')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-brand-accent-dark uppercase tracking-wider">
                      {t('admin.tableRole')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-brand-accent-dark uppercase tracking-wider">
                      {t('admin.tableDepartment')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-brand-accent-dark uppercase tracking-wider">
                      {t('admin.tableLastLogin')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-brand-accent-dark uppercase tracking-wider">
                      {t('admin.tableCreated')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-brand-muted-text-dark">
                        {t('admin.loading')}
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-brand-muted-text-dark">
                        {t('admin.noUsersFound')}
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors last:border-0"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">{user.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-brand-muted-text-dark">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={cn(
                              'text-sm font-medium',
                              user.role === 'Admin'
                                ? 'text-brand-accent-dark'
                                : 'text-brand-muted-text-dark'
                            )}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-brand-muted-text-dark">
                            {user.department ?? '—'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-brand-muted-text-dark">
                            {user.lastLogin ? formatDate(user.lastLogin) : '—'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-brand-muted-text-dark">
                            {formatDate(user.createdAt)}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
