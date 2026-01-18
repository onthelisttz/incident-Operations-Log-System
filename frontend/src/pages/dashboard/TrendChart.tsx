import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import Card from '../../components/common/Card'

interface TrendChartProps {
    data: {
        date: string
        count: number
    }[]
    isLoading?: boolean
}

const TrendChart = ({ data, isLoading }: TrendChartProps) => {
    return (
        <Card title="Incident Trends" subtitle="New incidents over the last 30 days">
            <div className="h-64 w-full">
                {isLoading ? (
                    <div className="animate-pulse bg-surface-muted h-full w-full rounded-xl" />
                ) : data.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-ink-muted">
                        No data available
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis
                                dataKey="date"
                                tickMargin={10}
                                tickFormatter={(val) => {
                                    const date = new Date(val);
                                    return `${date.getMonth() + 1}/${date.getDate()}`;
                                }}
                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                axisLine={false}
                                tickLine={false}
                                allowDecimals={false}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="count"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorCount)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </Card>
    )
}

export default TrendChart
