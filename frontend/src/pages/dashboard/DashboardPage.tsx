import { useEffect, useState } from 'react'
import Card from '../../components/common/Card'
import * as dashboardApi from '../../api/dashboard.api'
import type { DashboardStats, EscalationAlert } from '../../types/dashboard.types'
import LoadingState from '../../components/common/LoadingState'
import { usePageTitle } from '../../hooks/usePageTitle'
import { useAuth } from '../../hooks/useAuth'
import StatusChart from './StatusChart'
import SeverityChart from './SeverityChart'
import TrendChart from './TrendChart'
import UserStats from './UserStats'
import { AlertCircle, CheckCircle2, FileText, Clock } from 'lucide-react'

const DashboardPage = () => {
  usePageTitle('Dashboard')
  const { user } = useAuth()

  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [alerts, setAlerts] = useState<EscalationAlert[]>([])
  const [statusData, setStatusData] = useState<{ name: string; value: number; color: string }[]>([])
  const [severityData, setSeverityData] = useState<{ name: string; value: number; color: string }[]>([])
  const [trendData, setTrendData] = useState<{ date: string; count: number }[]>([])

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      try {
        const canViewAlerts = user?.role === 'admin' || user?.role === 'operator'

        const [
          statsRes,
          statusRes,
          severityRes,
          trendsRes
        ] = await Promise.all([
          dashboardApi.getStats(),
          dashboardApi.getStatusDistribution(),
          dashboardApi.getSeverityBreakdown(),
          dashboardApi.getIncidentTrends()
        ])

        let alertsData: EscalationAlert[] = []
        if (canViewAlerts) {
          try {
            const alertsRes = await dashboardApi.getEscalationAlerts()
            alertsData = alertsRes.data.data
          } catch (error) {
            console.warn('Failed to fetch alerts', error)
          }
        }

        setStats(statsRes.data.data)
        setAlerts(alertsData)
        setStatusData(statusRes.data.data)
        setSeverityData(severityRes.data.data)
        setTrendData(trendsRes.data.data)

      } catch (error) {
        console.error('Failed to load dashboard data', error)
      }
      setIsLoading(false)
    }
    void load()
  }, [])

  if (isLoading) {
    return <LoadingState label="Loading dashboard insights..." />
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Dashboard</h1>
        <p className="mt-2 text-sm text-ink-muted">Overview of incident operations.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-blue-100 p-3 text-blue-600">
              <AlertCircle size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-ink-muted">Open incidents</p>
              <p className="text-2xl font-bold text-ink">{stats?.open_incidents ?? '-'}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-green-100 p-3 text-green-600">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-ink-muted">Resolved incidents</p>
              <p className="text-2xl font-bold text-ink">{stats?.resolved_incidents ?? '-'}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-violet-100 p-3 text-violet-600">
              <FileText size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-ink-muted">Total incidents</p>
              <p className="text-2xl font-bold text-ink">{stats?.total_incidents ?? '-'}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-orange-100 p-3 text-orange-600">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-ink-muted">Average resolution</p>
              <p className="text-2xl font-bold text-ink">{stats?.avg_resolution_time ?? '-'}</p>
            </div>
          </div>
        </Card>
      </div>

      {user?.role === 'admin' && <UserStats stats={stats} isLoading={isLoading} />}

      <div className="grid gap-6 lg:grid-cols-2">
        <StatusChart data={statusData} isLoading={isLoading} />
        <SeverityChart data={severityData} isLoading={isLoading} />
      </div>

      <div className={`grid gap-6 ${user?.role === 'reporter' ? 'lg:grid-cols-1' : 'lg:grid-cols-[2fr_1fr]'}`}>
        <TrendChart data={trendData} isLoading={isLoading} />

        {(user?.role === 'admin' || user?.role === 'operator') && (
          <Card title="Escalation alerts" subtitle="Incidents at risk of SLA breach">
            <div className="space-y-3 text-sm text-ink-muted h-64 overflow-y-auto pr-2">


              {alerts.length ? (
                alerts.map((alert) => (
                  <div key={alert.id} className="rounded-xl border border-line bg-surface-muted p-3">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-ink">{alert.incident_number}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${alert.risk_level === 'critical' ? 'bg-red-100 text-red-700' :
                        alert.risk_level === 'high' ? 'bg-orange-100 text-orange-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                        {alert.risk_level.toUpperCase()}
                      </span>
                    </div>
                    <p>{alert.reason}</p>
                    <p className="text-xs mt-2 text-ink-muted">Assigned to: {alert.assigned_to}</p>
                  </div>
                ))
              ) : (
                <p className="text-center py-8">No escalation alerts right now.</p>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

export default DashboardPage
