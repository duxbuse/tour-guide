export function DashboardSkeleton() {
    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <div className="loading-skeleton skeleton-title"></div>
                    <div className="loading-skeleton skeleton-text" style={{ width: '200px' }}></div>
                </div>
            </header>

            <div className="stat-grid">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="stat-card">
                        <div className="loading-skeleton skeleton-text" style={{ width: '120px', height: '1rem' }}></div>
                        <div className="loading-skeleton skeleton-text" style={{ width: '80px', height: '2.5rem', margin: '0.5rem 0' }}></div>
                        <div className="loading-skeleton skeleton-text" style={{ width: '100px', height: '0.875rem' }}></div>
                    </div>
                ))}
            </div>

            <div className="card">
                <div className="loading-skeleton skeleton-title" style={{ marginBottom: '1rem' }}></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} style={{
                            padding: '1rem',
                            background: 'var(--bg-secondary)',
                            borderRadius: '8px',
                            border: '1px solid var(--border-subtle)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ flex: 1 }}>
                                    <div className="loading-skeleton skeleton-text" style={{ width: '200px', marginBottom: '0.5rem' }}></div>
                                    <div className="loading-skeleton skeleton-text" style={{ width: '150px' }}></div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div className="loading-skeleton skeleton-text" style={{ width: '60px', marginBottom: '0.25rem' }}></div>
                                    <div className="loading-skeleton skeleton-text" style={{ width: '80px' }}></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function ToursSkeleton() {
    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <div className="loading-skeleton skeleton-title"></div>
                    <div className="loading-skeleton skeleton-text" style={{ width: '250px' }}></div>
                </div>
                <div className="loading-skeleton" style={{ width: '120px', height: '40px', borderRadius: '20px' }}></div>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                            <div>
                                <div className="loading-skeleton skeleton-title" style={{ width: '200px', marginBottom: '0.5rem' }}></div>
                                <div className="loading-skeleton skeleton-text" style={{ width: '300px' }}></div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <div className="loading-skeleton" style={{ width: '60px', height: '24px', borderRadius: '12px' }}></div>
                                <div className="loading-skeleton" style={{ width: '100px', height: '32px', borderRadius: '16px' }}></div>
                            </div>
                        </div>

                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>City</th>
                                        <th>Date</th>
                                        <th>Venue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.from({ length: 4 }).map((_, j) => (
                                        <tr key={j}>
                                            <td><div className="loading-skeleton skeleton-text" style={{ width: '120px' }}></div></td>
                                            <td><div className="loading-skeleton skeleton-text" style={{ width: '100px' }}></div></td>
                                            <td><div className="loading-skeleton skeleton-text" style={{ width: '150px' }}></div></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}