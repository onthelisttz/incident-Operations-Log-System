import { Link } from 'react-router-dom'
import Card from '../../components/common/Card'
import type { Incident } from '../../types/incident.types'

interface RecentIncidentsProps {
    incidents: Incident[]
    isLoading?: boolean
}

const RecentIncidents = ({ incidents, isLoading }: RecentIncidentsProps) => {
    if (isLoading) {
        return (
            <Card title="Recent Incidents" subtitle="Latest reported issues">
                <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex gap-4">
                            <div className="h-10 w-10 animate-pulse rounded-full bg-surface-muted" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-3/4 animate-pulse rounded bg-surface-muted" />
                                <div className="h-3 w-1/2 animate-pulse rounded bg-surface-muted" />
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        )
    }

    if (!incidents.length) {
        return (
            <Card title="Recent Incidents" subtitle="Latest reported issues">
                <div className="flex h-64 items-center justify-center text-ink-muted">
                    No incidents found.
                </div>
            </Card>
        )
    }

    return (
        <Card title="Recent Incidents" subtitle="Latest reported issues">
            <div className="space-y-4">
                {incidents.map((incident) => (
                    <Link
                        key={incident.id}
                        to={`/incidents/${incident.id}`}
                        className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-surface-muted"
                    >
                        <div className={`mt-1 h-2.5 w-2.5 flex-none rounded-full ${(typeof incident.severity === 'string' ? incident.severity : incident.severity?.value) === 'critical' ? 'bg-red-500' :
                            (typeof incident.severity === 'string' ? incident.severity : incident.severity?.value) === 'high' ? 'bg-orange-500' :
                                (typeof incident.severity === 'string' ? incident.severity : incident.severity?.value) === 'medium' ? 'bg-yellow-500' :
                                    'bg-green-500'
                            }`} />
                        <div className="min-w-0 flex-1">
                            <p className="font-medium text-ink truncate">{incident.title}</p>
                            <div className="flex items-center gap-2 text-xs text-ink-muted">
                                <span>{incident.incident_number}</span>
                                <span>•</span>
                                <span>{new Date(incident.created_at || '').toLocaleDateString()}</span>
                                <span className={`px-1.5 py-0.5 rounded ml-auto text-[10px] font-medium uppercase ${(typeof incident.status === 'string' ? incident.status : incident.status?.value) === 'open' ? 'bg-red-100 text-red-700' :
                                    (typeof incident.status === 'string' ? incident.status : incident.status?.value) === 'investigating' ? 'bg-yellow-100 text-yellow-700' :
                                        (typeof incident.status === 'string' ? incident.status : incident.status?.value) === 'resolved' ? 'bg-blue-100 text-blue-700' :
                                            'bg-green-100 text-green-700'
                                    }`}>
                                    {typeof incident.status === 'string' ? incident.status : incident.status?.label || incident.status?.value}
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
            <div className="mt-4 border-t border-line pt-4 text-center">
                <Link to="/app/incidents" className="text-sm font-medium text-primary-600 hover:text-primary-700">
                    View all incidents &rarr;
                </Link>
            </div>
        </Card>
    )
}

export default RecentIncidents
