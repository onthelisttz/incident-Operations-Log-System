
import Card from '../../components/common/Card'
import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'

const UnauthorizedPage = () => {

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-surface-muted p-6">
            <Card>
                <div className="flex flex-col items-center text-center max-w-sm">
                    <div className="mb-4 rounded-full bg-red-100 p-4 text-red-600">
                        <ShieldAlert size={48} />
                    </div>
                    <h1 className="mb-2 text-2xl font-bold text-ink">Access Denied</h1>
                    <p className="mb-6 text-sm text-ink-muted">
                        You do not have permission to access this page. Please contact your administrator if you believe this is a mistake.
                    </p>
                    <div className="flex w-full flex-col gap-3">
                      
                        <Link to="/app/dashboard" className="text-sm font-medium text-primary-600 hover:text-primary-700">
                            Return to Dashboard
                        </Link>
                    </div>
                </div>
            </Card>

            <div className="mt-8 text-center text-xs text-ink-muted">
                <p>&copy; {new Date().getFullYear()} IOLS. All rights reserved.</p>
            </div>
        </div>
    )
}

export default UnauthorizedPage
