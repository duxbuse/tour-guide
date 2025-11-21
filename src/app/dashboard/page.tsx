'use client';

import { useState, useEffect } from 'react';
import { auth0 } from "@/lib/auth0";

interface Show {
    id: string;
    name: string;
    date: string;
    venue: string | null;
    ticketsSold: number | null;
    totalTickets: number | null;
}

interface Tour {
    id: string;
    name: string;
    shows: Show[];
    isActive: boolean;
}

interface InventoryRecord {
    id: string;
    startCount: number;
    addedCount: number;
    endCount: number | null;
    soldCount: number | null;
    showId: string;
    variantId: string;
    show: Show;
    variant: {
        id: string;
        size: string;
        type: string | null;
        price: number;
        quantity: number;
        merchItem: {
            id: string;
            name: string;
        };
    };
}

export default function DashboardPage() {
    const [tours, setTours] = useState<Tour[]>([]);
    const [allInventoryRecords, setAllInventoryRecords] = useState<InventoryRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Get current user
                const session = await auth0.getSession();
                if (session?.user) {
                    setUser(session.user);
                }

                // Fetch all tours
                const toursResponse = await fetch('/api/tours');
                if (toursResponse.ok) {
                    const toursData = await toursResponse.json();
                    setTours(toursData);

                    // Fetch inventory records for all tours
                    const allInventoryPromises = toursData.map((tour: Tour) =>
                        fetch(`/api/inventory?tourId=${tour.id}`).then(res => res.json())
                    );

                    const allInventoryResults = await Promise.all(allInventoryPromises);
                    const combinedInventory = allInventoryResults.flat();
                    setAllInventoryRecords(combinedInventory);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Calculate shrinkage across all tours
    const calculateTotalShrinkage = () => {
        interface ShrinkageItem {
            shrinkage: number;
            value: number;
        }

        const shrinkageData: ShrinkageItem[] = [];

        // Group records by variant across all tours
        const recordsByVariant = allInventoryRecords.reduce((acc, record) => {
            const key = record.variantId;
            if (!acc[key]) acc[key] = [];
            acc[key].push(record);
            return acc;
        }, {} as Record<string, InventoryRecord[]>);

        Object.values(recordsByVariant).forEach((variantRecords) => {
            // Sort by show date
            const sortedRecords = variantRecords.sort((a, b) =>
                new Date(a.show.date).getTime() - new Date(b.show.date).getTime()
            );

            for (let i = 1; i < sortedRecords.length; i++) {
                const prevRecord = sortedRecords[i - 1];
                const currentRecord = sortedRecords[i];

                if (prevRecord.endCount !== null && currentRecord.startCount !== null) {
                    const shrinkage = prevRecord.endCount - currentRecord.startCount;
                    if (shrinkage > 0) {
                        shrinkageData.push({
                            shrinkage: shrinkage,
                            value: shrinkage * currentRecord.variant.price
                        });
                    }
                }
            }
        });

        return {
            totalItems: shrinkageData.reduce((sum, item) => sum + item.shrinkage, 0),
            totalValue: shrinkageData.reduce((sum, item) => sum + item.value, 0)
        };
    };

    // Calculate totals across all tours
    const calculateTotals = () => {
        const totalSold = allInventoryRecords.reduce((sum, record) =>
            sum + (record.soldCount || 0), 0
        );
        
        const totalRevenue = allInventoryRecords.reduce((sum, record) =>
            sum + ((record.soldCount || 0) * record.variant.price), 0
        );

        const lowStockItems = allInventoryRecords.filter(record => 
            record.variant.quantity < 5
        ).length;

        const upcomingShows = tours.reduce((total, tour) => {
            return total + tour.shows.filter(show => 
                new Date(show.date) > new Date()
            ).length;
        }, 0);

        const shrinkage = calculateTotalShrinkage();

        return {
            totalSold,
            totalRevenue,
            lowStockItems,
            upcomingShows,
            totalShrinkage: shrinkage.totalItems,
            totalShrinkageValue: shrinkage.totalValue
        };
    };

    // Check user role - Managers and Sellers can access dashboard
    const getUserRoles = (): string[] => {
        if (!user) return [];
        const customRoles = (user['https://tour-guide.app/roles'] as string[]) || [];
        const standardRoles = (user.roles as string[]) || [];
        return [...customRoles, ...standardRoles].map(r => r.toLowerCase());
    };

    const userRoles = getUserRoles();
    const hasAccess = userRoles.includes('manager') || userRoles.includes('seller');

    if (loading) {
        return (
            <div className="animate-fade-in" style={{ textAlign: 'center', padding: '4rem' }}>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    // Check if user has access to dashboard
    if (!hasAccess) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '50vh',
                padding: '2rem',
                textAlign: 'center'
            }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626', marginBottom: '1rem' }}>Access Denied</h2>
                <p style={{ color: '#4b5563', marginBottom: '1.5rem' }}>
                    You do not have permission to view this page.
                </p>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    Required role: Manager or Seller
                </p>
            </div>
        );
    }

    const stats = calculateTotals();

    return (
            <div className="animate-fade-in">
                <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1>Dashboard</h1>
                        <p>Welcome back, {user?.name || 'Tour Manager'}. Overview across all tours.</p>
                    </div>
                </header>

                <div className="stat-grid">
                    <div className="stat-card">
                        <div className="stat-label">Total Revenue (All Tours)</div>
                        <div className="stat-value">${stats.totalRevenue.toFixed(2)}</div>
                        <div style={{ color: stats.totalRevenue > 0 ? '#10B981' : 'var(--text-secondary)', fontSize: '0.875rem' }}>
                            {stats.totalRevenue > 0 ? 'From inventory sales' : 'Ready to start'}
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Items Sold (All Tours)</div>
                        <div className="stat-value">{stats.totalSold}</div>
                        <div style={{ color: stats.totalSold > 0 ? '#10B981' : 'var(--text-secondary)', fontSize: '0.875rem' }}>
                            {stats.totalSold > 0 ? 'Total across all shows' : 'Ready to start'}
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Low Stock Items</div>
                        <div className="stat-value" style={{ color: stats.lowStockItems > 0 ? '#EF4444' : 'var(--text-secondary)' }}>
                            {stats.lowStockItems}
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                            {stats.lowStockItems === 0 ? 'All good' : 'Need restocking'}
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Upcoming Shows</div>
                        <div className="stat-value">{stats.upcomingShows}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                            {stats.upcomingShows === 0 ? 'Plan your tour' : 'Across all tours'}
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Shrinkage Loss (All Tours)</div>
                        <div className="stat-value" style={{ color: stats.totalShrinkage > 0 ? '#ef4444' : 'var(--text-secondary)' }}>
                            {stats.totalShrinkage}
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                            {stats.totalShrinkage > 0 ? `Lost/damaged items ($${stats.totalShrinkageValue.toFixed(2)})` : 'No losses recorded'}
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Active Tours</div>
                        <div className="stat-value">{tours.filter(t => t.isActive).length}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                            Total tours: {tours.length}
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h3 style={{ marginBottom: '1rem' }}>Recent Activity</h3>
                    {allInventoryRecords.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {allInventoryRecords
                                .slice(0, 5)
                                .map((record, index) => (
                                    <div key={index} style={{
                                        padding: '1rem',
                                        background: 'var(--bg-secondary)',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border-subtle)'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                                                    {record.variant.merchItem.name} - {record.variant.type ? `${record.variant.type} ` : ''}{record.variant.size}
                                                </div>
                                                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                                    {record.show.name}
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>
                                                    {record.soldCount || 0} sold
                                                </div>
                                                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                                    ${((record.soldCount || 0) * record.variant.price).toFixed(2)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <h3>No activity yet</h3>
                            <p>Sales and updates will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
    );
}
