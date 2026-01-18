import { useEffect, useState } from 'react'
import Card from '../../components/common/Card'
import UserRoleChart from './UserRoleChart'
import RecentIncidents from './RecentIncidents'
import { Trophy, Users, Activity, UserX } from 'lucide-react'
import type { DashboardStats } from '../../types/dashboard.types'
import type { Incident } from '../../types/incident.types'
import * as dashboardApi from '../../api/dashboard.api'

interface UserStatsProps {
    stats: DashboardStats | null
    isLoading?: boolean
}

const UserStats = ({ stats, isLoading }: UserStatsProps) => {
    const [recentIncidents, setRecentIncidents] = useState<Incident[]>([])
    const [isRecentLoading, setIsRecentLoading] = useState(true)

    useEffect(() => {
        const fetchRecent = async () => {
            try {
                const response = await dashboardApi.getRecentIncidents()
                setRecentIncidents(response.data.data)
            } catch (error) {
                console.error('Failed to fetch recent incidents', error)
            }
            setIsRecentLoading(false)
        }
        void fetchRecent()
    }, [])

    if (isLoading) {
        return (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="h-24 animate-pulse rounded-xl bg-surface-muted"></div>
                <div className="h-24 animate-pulse rounded-xl bg-surface-muted"></div>
                <div className="h-24 animate-pulse rounded-xl bg-surface-muted"></div>
                <div className="h-24 animate-pulse rounded-xl bg-surface-muted"></div>
            </div>
        )
    }

    const roleData = [
        { name: 'Admin', value: stats?.user_roles?.admin ?? 0, color: '#6366f1' },
        { name: 'Operator', value: stats?.user_roles?.operator ?? 0, color: '#eab308' },
        { name: 'Reporter', value: stats?.user_roles?.reporter ?? 0, color: '#3b82f6' },
    ]

    return (
        <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <div className="flex items-center gap-4">
                        <div className="rounded-full bg-primary-100 p-3 text-primary-600">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-ink-muted">Total Users</p>
                            <p className="text-2xl font-bold text-ink">{stats?.total_users ?? 0}</p>
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="flex items-center gap-4">
                        <div className="rounded-full bg-emerald-100 p-3 text-emerald-600">
                            <Activity size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-ink-muted">Active Users</p>
                            <p className="text-2xl font-bold text-ink">{stats?.active_users ?? 0}</p>
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="flex items-center gap-4">
                        <div className="rounded-full bg-gray-100 p-3 text-gray-600">
                            <UserX size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-ink-muted">Inactive Users</p>
                            <p className="text-2xl font-bold text-ink">{stats?.inactive_users ?? 0}</p>
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="flex items-center gap-4">
                        <div className="rounded-full bg-rose-100 p-3 text-rose-600">
                            <Trophy size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-ink-muted">At Risk Incidents</p>
                            <p className="text-2xl font-bold text-ink">{stats?.at_risk_count ?? 0}</p>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <UserRoleChart data={roleData} isLoading={isLoading} />
                <RecentIncidents incidents={recentIncidents} isLoading={isRecentLoading} />
            </div>
        </div>
    )
}

export default UserStats
