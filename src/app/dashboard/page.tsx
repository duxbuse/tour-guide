export default function DashboardPage() {
    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>Dashboard</h1>
                    <p>Welcome back, Tour Manager.</p>
                </div>
                <button className="btn btn-primary">New Sale</button>
            </header>

            <div className="stat-grid">
                <div className="stat-card">
                    <div className="stat-label">Total Sales (Tour)</div>
                    <div className="stat-value">$12,450</div>
                    <div style={{ color: '#10B981', fontSize: '0.875rem' }}>+15% vs last week</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Items Sold</div>
                    <div className="stat-value">450</div>
                    <div style={{ color: '#10B981', fontSize: '0.875rem' }}>+8% vs last week</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Low Stock Items</div>
                    <div className="stat-value" style={{ color: '#EF4444' }}>3</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Requires attention</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Upcoming Shows</div>
                    <div className="stat-value">5</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Next: Chicago, IL</div>
                </div>
            </div>

            <div className="card">
                <h3 style={{ marginBottom: '1rem' }}>Recent Activity</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {[1, 2, 3].map((i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                            <div>
                                <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>T-Shirt (Black, L)</div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Sold at Chicago Venue</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>$30.00</div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>2 mins ago</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
