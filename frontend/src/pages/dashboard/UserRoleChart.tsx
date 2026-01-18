import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'
import Card from '../../components/common/Card'

interface UserRoleChartProps {
    data: {
        name: string
        value: number
        color: string
    }[]
    isLoading?: boolean
}

const UserRoleChart = ({ data, isLoading }: UserRoleChartProps) => {
    if (!isLoading && data.length === 0) {
        return (
            <Card title="User Roles" subtitle="Distribution by role">
                <div className="flex h-64 items-center justify-center">
                    <p className="text-ink-muted">No data available</p>
                </div>
            </Card>
        )
    }

    return (
        <Card title="User Roles" subtitle="Distribution by role">
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

export default UserRoleChart
