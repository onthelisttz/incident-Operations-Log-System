import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'
import Card from '../../components/common/Card'
import EmptyState from '../../components/common/EmptyState'

interface StatusChartProps {
    data: {
        name: string
        value: number
        color: string
    }[]
    isLoading?: boolean
}

const StatusChart = ({ data, isLoading }: StatusChartProps) => {
    if (!isLoading && data.length === 0) {
        return (
            <Card title="Status Distribution" subtitle="Snapshot by current status">
                <div className="flex h-64 items-center justify-center">
                    <p className="text-ink-muted">No data available</p>
                </div>
            </Card>
        )
    }

    return (
        <Card title="Status Distribution" subtitle="Snapshot by current status">
            <div className="h-64 w-full">
                {isLoading ? (
                    <div className="animate-pulse bg-surface-muted h-full w-full rounded-xl" />
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </div>
        </Card>
    )
}

export default StatusChart
