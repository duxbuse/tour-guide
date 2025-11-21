'use client';

import { useState, useEffect } from 'react';

interface Show {
    id: string;
    name: string;
    date: Date;
    venue: string | null;
}

interface MerchItem {
    id: string;
    name: string;
}

interface Variant {
    id: string;
    size: string;
    type: string | null;
    price: number;
    quantity: number;
    merchItem: MerchItem;
}

interface InventoryRecord {
    id: string;
    startCount: number;
    addedCount: number;
    endCount: number | null;
    soldCount: number | null;
    showId: string;
    variantId: string;
    variant: Variant;
    show: Show;
}

interface Tour {
    id: string;
    name: string;
    isActive: boolean;
    startDate: Date | null;
    endDate: Date | null;
    shows: Show[];
    _count: {
        shows: number;
        merchItems: number;
    };
}

interface DashboardData {
    tours: Tour[];
    allInventoryRecords: InventoryRecord[];
}

interface DashboardStatsProps {
    initialData?: DashboardData;
}

export default function DashboardStats({ initialData }: DashboardStatsProps) {
    const [data, setData] = useState<DashboardData | null>(initialData || null);
    const [loading, setLoading] = useState(!initialData);

    useEffect(() => {
        if (!initialData) {
            fetch('/api/dashboard')
                .then(res => res.json())
                .then(setData)
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [initialData]);

    if (loading || !data) {
        return (
            <div className="stat-grid">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="stat-card">
                        <div className="loading-skeleton skeleton-text" style={{ width: '120px', height: '1rem' }}></div>
                        <div className="loading-skeleton skeleton-text" style={{ width: '80px', height: '2.5rem', margin: '0.5rem 0' }}></div>
                        <div className="loading-skeleton skeleton-text" style={{ width: '100px', height: '0.875rem' }}></div>
                    </div>
                ))}
            </div>
        );
    }

    const stats = calculateTotals(data.tours, data.allInventoryRecords);

    return (
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
                <div className="stat-label">Shrinkage Loss</div>
                <div className="stat-value" style={{ color: stats.totalShrinkage > 0 ? '#ef4444' : 'var(--text-secondary)' }}>
                    {stats.totalShrinkage}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    {stats.totalShrinkage > 0 ? `Lost/damaged items ($${stats.totalShrinkageValue.toFixed(2)})` : 'No losses recorded'}
                </div>
            </div>
            <div className="stat-card">
                <div className="stat-label">Active Tours</div>
                <div className="stat-value">{data.tours.filter(t => t.isActive).length}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    Total tours: {data.tours.length}
                </div>
            </div>
        </div>
    );
}

function calculateTotals(tours: Tour[], allInventoryRecords: InventoryRecord[]) {
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
        return total + tour.shows.filter((show: Show) =>
            new Date(show.date) > new Date()
        ).length;
    }, 0);

    const shrinkage = calculateTotalShrinkage(allInventoryRecords);

    return {
        totalSold,
        totalRevenue,
        lowStockItems,
        upcomingShows,
        totalShrinkage: shrinkage.totalItems,
        totalShrinkageValue: shrinkage.totalValue
    };
}

function calculateTotalShrinkage(allInventoryRecords: InventoryRecord[]) {
    interface ShrinkageItem {
        shrinkage: number;
        value: number;
    }

    const shrinkageData: ShrinkageItem[] = [];

    // Group records by variant
    const recordsByVariant = allInventoryRecords.reduce((acc, record) => {
        const key = record.variantId;
        if (!acc[key]) acc[key] = [];
        acc[key].push(record);
        return acc;
    }, {} as Record<string, InventoryRecord[]>);

    Object.values(recordsByVariant).forEach((variantRecords) => {
        // Sort by show date
        const sortedRecords = variantRecords.sort((a: InventoryRecord, b: InventoryRecord) =>
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
}