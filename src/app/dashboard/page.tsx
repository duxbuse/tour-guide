import { RoleGuard } from "@/components/RoleGuard";
import { auth0 } from "@/lib/auth0";

export default async function DashboardPage() {
    const session = await auth0.getSession();
    const user = session?.user;

    return (
        <RoleGuard allowedRoles={['Manager', 'Seller']}>
            <div className="animate-fade-in">
                <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1>Dashboard</h1>
                        <p>Welcome back, {user?.name || 'Tour Manager'}.</p>
                    </div>
                    {/* <button className="btn btn-primary">New Sale</button> */}
                </header>

                <div className="stat-grid">
                    <div className="stat-card">
                        <div className="stat-label">Total Sales (Tour)</div>
                        <div className="stat-value">$0</div>
                        <div style={{ color: '#10B981', fontSize: '0.875rem' }}>Ready to start</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Items Sold</div>
                        <div className="stat-value">0</div>
                        <div style={{ color: '#10B981', fontSize: '0.875rem' }}>Ready to start</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Low Stock Items</div>
                        <div className="stat-value" style={{ color: '#EF4444' }}>0</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>All good</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Upcoming Shows</div>
                        <div className="stat-value">0</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Plan your tour</div>
                    </div>
                </div>

                <div className="card">
                    <h3 style={{ marginBottom: '1rem' }}>Recent Activity</h3>
                    <div className="empty-state">
                        <h3>No activity yet</h3>
                        <p>Sales and updates will appear here.</p>
                    </div>
                </div>
            </div>
        </RoleGuard>
    );
}
