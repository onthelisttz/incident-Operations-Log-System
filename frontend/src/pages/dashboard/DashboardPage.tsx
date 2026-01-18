import { useEffect, useState } from 'react'
import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import * as dashboardApi from '../../api/dashboard.api'
import type { DashboardStats, EscalationAlert } from '../../types/dashboard.types'
import LoadingState from '../../components/common/LoadingState'
import { usePageTitle } from '../../hooks/usePageTitle'

const DashboardPage = () => {
  usePageTitle('Dashboard')

  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [alerts, setAlerts] = useState<EscalationAlert[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      try {
        const statsResponse = await dashboardApi.getStats()
        setStats(statsResponse.data.data)
        const alertsResponse = await dashboardApi.getEscalationAlerts()
        setAlerts(alertsResponse.data.data)
      } catch {
        setAlerts([])
      }
      setIsLoading(false)
    }
    void load()
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Dashboard</h1>
        <p className="mt-2 text-sm text-ink-muted">Overview of incident operations.</p>
      </div>

      {isLoading ? (
        <LoadingState label="Loading dashboard insights..." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card title="Open incidents">
            <p className="text-2xl font-semibold text-ink">{stats?.open_incidents ?? '-'}</p>
          </Card>
          <Card title="Resolved incidents">
            <p className="text-2xl font-semibold text-ink">{stats?.resolved_incidents ?? '-'}</p>
          </Card>
          <Card title="Total incidents">
            <p className="text-2xl font-semibold text-ink">{stats?.total_incidents ?? '-'}</p>
          </Card>
          <Card title="Average resolution">
            <p className="text-2xl font-semibold text-ink">{stats?.avg_resolution_time ?? '-'}</p>
          </Card>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card title="Status distribution" subtitle="Snapshot by current status">
          <div className="grid gap-3 text-sm text-ink-muted">
            <div className="flex items-center justify-between">
              <span>Open</span>
              <Badge>24</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Investigating</span>
              <Badge>18</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Resolved</span>
              <Badge tone="primary">82</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Closed</span>
              <Badge tone="success">42</Badge>
            </div>
          </div>
        </Card>
        <Card title="Escalation alerts" subtitle="Incidents at risk of SLA breach">
          <div className="space-y-3 text-sm text-ink-muted">
            {alerts.length ? (
              alerts.map((alert) => (
                <div key={alert.id} className="rounded-xl border border-line bg-surface-muted p-3">
                  <p className="font-semibold text-ink">{alert.incident_number}</p>
                  <p>{alert.reason}</p>
                </div>
              ))
            ) : (
              <p>No escalation alerts right now.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default DashboardPage
