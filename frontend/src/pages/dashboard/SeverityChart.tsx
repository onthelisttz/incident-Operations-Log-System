import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid } from 'recharts'
import Card from '../../components/common/Card'

interface SeverityChartProps {
    data: {
        name: string
        value: number
        color: string
    }[]
    isLoading?: boolean
}

const SeverityChart = ({ data, isLoading }: SeverityChartProps) => {
    return (
        <Card title="Severity Breakdown" subtitle="Incidents by severity level">
            <div className="h-64 w-full">
                {isLoading ? (
                    <div className="animate-pulse bg-surface-muted h-full w-full rounded-xl" />
                ) : data.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-ink-muted">
                        No data available
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={60} tick={{ fontSize: 12 }} />
                            <Tooltip cursor={{ fill: 'transparent' }} />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </Card>
    )
}

export default SeverityChart
