'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useUserRole } from '@/hooks/useUserRole';

interface Show {
    id: string;
    name: string;
    date: string;
    venue: string | null;
}

interface Tour {
    id: string;
    name: string;
    shows: Show[];
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

interface VariantSales {
    type: string | null;
    size: string;
    sold: number;
    revenue: number;
}


export default function ReportsPage() {
    const { user, isLoading: userLoading } = useUser();
    const { role, isLoading: roleLoading } = useUserRole();
    const [tours, setTours] = useState<Tour[]>([]);
    const [selectedTourId, setSelectedTourId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [inventoryRecords, setInventoryRecords] = useState<InventoryRecord[]>([]);
    // const [user, setUser] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

    const [showsLoading, setShowsLoading] = useState(false);

    useEffect(() => {
        fetchTours();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (selectedTourId) {
            fetchShows(selectedTourId);
            fetchInventoryRecords(selectedTourId);
        }
    }, [selectedTourId]);

    // Check user role - Only managers can access reports
    const isManager = role?.toLowerCase() === 'manager';

    const fetchTours = async () => {
        try {
            const response = await fetch('/api/tours');
            if (response.ok) {
                const data = await response.json();
                setTours(data);
                if (data.length > 0 && !selectedTourId) {
                    setSelectedTourId(data[0].id);
                }
            }
        } catch (error) {
            console.error('Error fetching tours:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchShows = async (tourId: string) => {
        setShowsLoading(true);
        try {
            const response = await fetch(`/api/tours/${tourId}/shows`);
            if (response.ok) {
                const shows = await response.json();
                setTours(prevTours =>
                    prevTours.map(t =>
                        t.id === tourId ? { ...t, shows } : t
                    )
                );
            }
        } catch (error) {
            console.error('Error fetching shows:', error);
        } finally {
            setShowsLoading(false);
        }
    };

    const fetchInventoryRecords = async (tourId: string) => {
        try {
            const response = await fetch(`/api/inventory?tourId=${tourId}`);
            if (response.ok) {
                const data = await response.json();
                setInventoryRecords(data);
            }
        } catch (error) {
            console.error('Error fetching inventory records:', error);
        }
    };

    const selectedTour = tours.find(t => t.id === selectedTourId);

    // Calculate shrinkage (lost/damaged items) between shows
    const calculateShrinkage = () => {
        if (!selectedTour) return [];

        interface ShrinkageItem {
            item: string;
            variant: string;
            prevShow: string;
            currentShow: string;
            endCount: number;
            startCount: number;
            shrinkage: number;
            value: number;
        }

        const shrinkageData: ShrinkageItem[] = [];

        // Group records by variant
        const recordsByVariant = inventoryRecords.reduce((acc, record) => {
            const key = record.variantId;
            if (!acc[key]) acc[key] = [];
            acc[key].push(record);
            return acc;
        }, {} as Record<string, InventoryRecord[]>);

        Object.entries(recordsByVariant).forEach(([, variantRecords]) => {
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
                            item: currentRecord.variant.merchItem.name,
                            variant: `${currentRecord.variant.type ? currentRecord.variant.type + ' - ' : ''}${currentRecord.variant.size}`,
                            prevShow: prevRecord.show.name,
                            currentShow: currentRecord.show.name,
                            endCount: prevRecord.endCount,
                            startCount: currentRecord.startCount,
                            shrinkage: shrinkage,
                            value: shrinkage * currentRecord.variant.price
                        });
                    }
                }
            }
        });

        return shrinkageData;
    };

    // Calculate totals for reporting
    const getTourStats = () => {
        const totalSold = inventoryRecords.reduce((sum, record) =>
            sum + (record.soldCount || 0), 0
        );
        const totalRevenue = inventoryRecords.reduce((sum, record) =>
            sum + ((record.soldCount || 0) * record.variant.price), 0
        );
        const shrinkageData = calculateShrinkage();
        const totalShrinkage = shrinkageData.reduce((sum, item) => sum + item.shrinkage, 0);
        const totalShrinkageValue = shrinkageData.reduce((sum, item) => sum + item.value, 0);

        const showCount = selectedTour?.shows?.length || 0;
        return {
            totalSold,
            totalRevenue,
            totalShrinkage,
            totalShrinkageValue,
            avgPerShow: showCount > 0 ? totalRevenue / showCount : 0
        };
    };

    const stats = getTourStats();
    const shrinkageData = calculateShrinkage();

    const handleExportCSV = () => {
        if (!selectedTourId || !selectedTour) return;
        if (!(selectedTour.shows?.length || 0)) {
            alert('No data to export');
            return;
        }

        import('xlsx').then(xlsx => {
            const data = (selectedTour.shows || []).map(show => {
                const showSales = inventoryRecords
                    .filter(r => r.showId === show.id)
                    .reduce((sum, r) => sum + (r.soldCount || 0), 0);
                const showRevenue = inventoryRecords
                    .filter(r => r.showId === show.id)
                    .reduce((sum, r) => sum + ((r.soldCount || 0) * r.variant.price), 0);

                return {
                    Show: show.name,
                    Date: format(new Date(show.date), 'yyyy-MM-dd'),
                    Venue: show.venue || '',
                    Revenue: showRevenue,
                    ItemsSold: showSales
                };
            });

            const worksheet = xlsx.utils.json_to_sheet(data);
            const workbook = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(workbook, worksheet, "Shows");

            // Add shrinkage data if any exists
            if (shrinkageData.length > 0) {
                const shrinkageSheet = xlsx.utils.json_to_sheet(shrinkageData.map(item => ({
                    Item: item.item,
                    Variant: item.variant,
                    'Previous Show': item.prevShow,
                    'Current Show': item.currentShow,
                    'Expected Count': item.endCount,
                    'Actual Count': item.startCount,
                    'Lost/Damaged': item.shrinkage,
                    'Value Lost': item.value
                })));
                xlsx.utils.book_append_sheet(workbook, shrinkageSheet, "Lost_Damaged");
            }

            xlsx.writeFile(workbook, `${selectedTour.name.replace(/\s+/g, '_')}_Report.csv`);
        });
    };

    const handleExportExcel = () => {
        if (!selectedTourId || !selectedTour) return;
        if (!(selectedTour.shows?.length || 0)) {
            alert('No data to export');
            return;
        }

        import('xlsx').then(xlsx => {
            const showData = (selectedTour.shows || []).map(show => {
                const showSales = inventoryRecords
                    .filter(r => r.showId === show.id)
                    .reduce((sum, r) => sum + (r.soldCount || 0), 0);
                const showRevenue = inventoryRecords
                    .filter(r => r.showId === show.id)
                    .reduce((sum, r) => sum + ((r.soldCount || 0) * r.variant.price), 0);

                return {
                    Show: show.name,
                    Date: format(new Date(show.date), 'yyyy-MM-dd'),
                    Venue: show.venue || '',
                    Revenue: showRevenue,
                    ItemsSold: showSales
                };
            });

            const worksheet = xlsx.utils.json_to_sheet(showData);
            const workbook = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(workbook, worksheet, "Shows");

            // Add an overview sheet
            const overviewData = [
                { Metric: 'Tour Name', Value: selectedTour.name },
                { Metric: 'Total Shows', Value: selectedTour.shows?.length || 0 },
                { Metric: 'Total Revenue', Value: stats.totalRevenue },
                { Metric: 'Total Items Sold', Value: stats.totalSold },
                { Metric: 'Lost/Damaged Items', Value: stats.totalShrinkage },
                { Metric: 'Shrinkage Value', Value: stats.totalShrinkageValue }
            ];
            const overviewSheet = xlsx.utils.json_to_sheet(overviewData);
            xlsx.utils.book_append_sheet(workbook, overviewSheet, "Overview");

            // Add detailed inventory records
            if (inventoryRecords.length > 0) {
                const inventoryData = inventoryRecords.map(record => ({
                    Show: record.show.name,
                    Date: format(new Date(record.show.date), 'yyyy-MM-dd'),
                    Item: record.variant.merchItem.name,
                    Variant: `${record.variant.type ? record.variant.type + ' - ' : ''}${record.variant.size}`,
                    'Start Count': record.startCount,
                    'End Count': record.endCount || 'Not counted',
                    'Sold Count': record.soldCount || 'Pending',
                    'Unit Price': record.variant.price,
                    'Revenue': record.soldCount ? (record.soldCount * record.variant.price).toFixed(2) : 'Pending'
                }));
                const inventorySheet = xlsx.utils.json_to_sheet(inventoryData);
                xlsx.utils.book_append_sheet(workbook, inventorySheet, "Inventory_Details");
            }

            // Add shrinkage data if any exists
            if (shrinkageData.length > 0) {
                const shrinkageSheet = xlsx.utils.json_to_sheet(shrinkageData.map(item => ({
                    Item: item.item,
                    Variant: item.variant,
                    'Previous Show': item.prevShow,
                    'Current Show': item.currentShow,
                    'Expected Count': item.endCount,
                    'Actual Count': item.startCount,
                    'Lost/Damaged': item.shrinkage,
                    'Value Lost': item.value
                })));
                xlsx.utils.book_append_sheet(workbook, shrinkageSheet, "Lost_Damaged");
            }

            xlsx.writeFile(workbook, `${selectedTour.name.replace(/\s+/g, '_')}_Report.xlsx`);
        });
    };

    if (loading || roleLoading) {
        return (
            <div className="animate-fade-in" style={{ textAlign: 'center', padding: '4rem' }}>
                <p>Loading reports...</p>
            </div>
        );
    }

    // Check if user has access to reports
    if (!isManager) {
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
                    Required role: Manager
                </p>
            </div>
        );
    }

    if (tours.length === 0) {
        return (
            <div className="animate-fade-in">
                <h1>Reports</h1>
                <div className="empty-state">
                    <h3>No tours found</h3>
                    <p>Create a tour first to generate reports and analytics.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <header className="page-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>Reports & Analytics</h1>
                    <p>Export and analyze your tour data</p>
                </div>
                <div className="header-actions" style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-secondary" onClick={handleExportCSV}>
                        📊 Export CSV
                    </button>
                    <button className="btn btn-primary" onClick={handleExportExcel}>
                        📈 Export Excel
                    </button>
                </div>
            </header>

            {/* Tour Selector */}
            <div className="tabs">
                {tours.map((tour) => (
                    <button
                        key={tour.id}
                        className={`tab ${selectedTourId === tour.id ? 'active' : ''}`}
                        onClick={() => setSelectedTourId(tour.id)}
                    >
                        {tour.name}
                    </button>
                ))}
            </div>

            {selectedTour && (
                <>
                    {/* Overview Stats */}
                    <div className="stat-grid">
                        <div className="stat-card">
                            <div className="stat-label">Total Shows</div>
                            <div className="stat-value">{selectedTour.shows?.length || 0}</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                Across the tour
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Total Revenue</div>
                            <div className="stat-value">${stats.totalRevenue.toFixed(2)}</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                From inventory sales
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Items Sold</div>
                            <div className="stat-value">{stats.totalSold}</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                Total across all shows
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Shrinkage Loss</div>
                            <div className="stat-value" style={{ color: stats.totalShrinkage > 0 ? '#ef4444' : undefined }}>
                                {stats.totalShrinkage}
                            </div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                Lost/damaged items (${stats.totalShrinkageValue.toFixed(2)})
                            </div>
                        </div>
                    </div>

                    {/* Report Sections */}
                    <div style={{ display: 'grid', gap: '2rem', marginTop: '2rem' }}>
                        {/* Sales by Show */}
                        <div className="card">
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Sales by Show</h2>
                            {(selectedTour.shows?.length || 0) > 0 ? (
                                <div className="table-container">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Show</th>
                                                <th>Date</th>
                                                <th>Venue</th>
                                                <th>Revenue</th>
                                                <th>Items Sold</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(selectedTour.shows || []).map((show) => {
                                                const showSales = inventoryRecords
                                                    .filter(r => r.showId === show.id)
                                                    .reduce((sum, r) => sum + (r.soldCount || 0), 0);
                                                const showRevenue = inventoryRecords
                                                    .filter(r => r.showId === show.id)
                                                    .reduce((sum, r) => sum + ((r.soldCount || 0) * r.variant.price), 0);

                                                return (
                                                    <tr key={show.id}>
                                                        <td style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{show.name}</td>
                                                        <td>{format(new Date(show.date), 'MMM d, yyyy')}</td>
                                                        <td>{show.venue || '-'}</td>
                                                        <td style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>
                                                            ${showRevenue.toFixed(2)}
                                                        </td>
                                                        <td>{showSales}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                    <p>No shows scheduled for this tour yet.</p>
                                </div>
                            )}
                        </div>

                        {/* Lost/Damaged Inventory (Shrinkage) */}
                        {shrinkageData.length > 0 && (
                            <div className="card">
                                <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Lost/Damaged Inventory</h2>
                                <div className="table-container">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Item</th>
                                                <th>Variant</th>
                                                <th>Between Shows</th>
                                                <th>Expected</th>
                                                <th>Actual</th>
                                                <th>Lost</th>
                                                <th>Value Lost</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {shrinkageData.map((item, index) => (
                                                <tr key={index}>
                                                    <td style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                                                        {item.item}
                                                    </td>
                                                    <td>{item.variant}</td>
                                                    <td>
                                                        <div style={{ fontSize: '0.875rem' }}>
                                                            <div>{item.prevShow}</div>
                                                            <div style={{ color: 'var(--text-secondary)' }}>↓</div>
                                                            <div>{item.currentShow}</div>
                                                        </div>
                                                    </td>
                                                    <td>{item.endCount}</td>
                                                    <td>{item.startCount}</td>
                                                    <td style={{ color: '#ef4444', fontWeight: 'bold' }}>
                                                        -{item.shrinkage}
                                                    </td>
                                                    <td style={{ color: '#ef4444', fontWeight: 'bold' }}>
                                                        -${item.value.toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Top Selling Items - Grouped by Item with Variant Breakdown */}
                        <div className="card">
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Top Selling Items</h2>
                            {inventoryRecords.length > 0 ? (() => {
                                // Group records by item and aggregate variants across all shows
                                const itemGroups = inventoryRecords
                                    .filter(r => (r.soldCount || 0) > 0)
                                    .reduce((acc, record) => {
                                        const itemKey = record.variant.merchItem.id;
                                        const itemName = record.variant.merchItem.name;
                                        const variantKey = `${record.variant.type || 'null'}-${record.variant.size}`;

                                        if (!acc[itemKey]) {
                                            acc[itemKey] = {
                                                name: itemName,
                                                totalSold: 0,
                                                totalRevenue: 0,
                                                variants: {}
                                            };
                                        }

                                        // Initialize variant if not exists
                                        if (!acc[itemKey].variants[variantKey]) {
                                            acc[itemKey].variants[variantKey] = {
                                                type: record.variant.type,
                                                size: record.variant.size,
                                                sold: 0,
                                                revenue: 0
                                            };
                                        }

                                        // Aggregate variant sales across all shows
                                        const soldCount = record.soldCount || 0;
                                        acc[itemKey].totalSold += soldCount;
                                        acc[itemKey].totalRevenue += soldCount * record.variant.price;
                                        acc[itemKey].variants[variantKey].sold += soldCount;
                                        acc[itemKey].variants[variantKey].revenue += soldCount * record.variant.price;

                                        return acc;
                                    }, {} as Record<string, { name: string; totalSold: number; totalRevenue: number; variants: Record<string, VariantSales> }>);

                                // Convert variants object to array and sort
                                const itemGroupsWithArrays = Object.values(itemGroups).map(item => ({
                                    ...item,
                                    variants: Object.values(item.variants).sort((a, b) => b.sold - a.sold)
                                }));

                                // Sort by total sales and take top items
                                const topItems = itemGroupsWithArrays
                                    .sort((a, b) => b.totalSold - a.totalSold)
                                    .slice(0, 8);

                                return (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                        {topItems.map((item, index) => (
                                            <div key={index} style={{
                                                padding: '1.5rem',
                                                background: 'var(--bg-secondary)',
                                                borderRadius: '12px',
                                                border: '1px solid var(--border-subtle)'
                                            }}>
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'flex-start',
                                                    marginBottom: '1rem',
                                                    paddingBottom: '0.5rem',
                                                    borderBottom: `1px solid var(--border-subtle)`,
                                                    gap: '1rem'
                                                }}>
                                                    <div style={{ flex: '1', minWidth: 0 }}>
                                                        <h3 style={{
                                                            fontSize: '1.125rem',
                                                            fontWeight: '700',
                                                            color: 'var(--text-primary)',
                                                            margin: '0 0 0.25rem 0',
                                                            wordWrap: 'break-word',
                                                            overflowWrap: 'break-word',
                                                            hyphens: 'auto'
                                                        }}>
                                                            #{index + 1} {item.name}
                                                        </h3>
                                                        <div style={{
                                                            fontSize: '0.875rem',
                                                            color: 'var(--text-secondary)'
                                                        }}>
                                                            {item.variants.length} variant{item.variants.length !== 1 ? 's' : ''}
                                                        </div>
                                                    </div>
                                                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                                        <div style={{
                                                            fontSize: '1.25rem',
                                                            fontWeight: '700',
                                                            color: 'var(--accent-gold)'
                                                        }}>
                                                            {item.totalSold} sold
                                                        </div>
                                                        <div style={{
                                                            fontSize: '1rem',
                                                            fontWeight: '600',
                                                            color: 'var(--accent-primary)'
                                                        }}>
                                                            ${item.totalRevenue.toFixed(2)}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Variant breakdown */}
                                                <div style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                                    gap: '0.75rem'
                                                }}>
                                                    {item.variants
                                                        .map((variant, vIndex) => (
                                                            <div key={vIndex} style={{
                                                                padding: '0.75rem',
                                                                background: 'var(--bg-primary)',
                                                                borderRadius: '8px',
                                                                border: '1px solid var(--border-subtle)',
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center'
                                                            }}>
                                                                <div>
                                                                    <div style={{
                                                                        fontSize: '0.875rem',
                                                                        fontWeight: '600',
                                                                        color: 'var(--text-primary)'
                                                                    }}>
                                                                        {variant.type ? `${variant.type} - ` : ''}{variant.size}
                                                                    </div>
                                                                    <div style={{
                                                                        fontSize: '0.75rem',
                                                                        color: 'var(--text-secondary)'
                                                                    }}>
                                                                        ${variant.revenue.toFixed(2)}
                                                                    </div>
                                                                </div>
                                                                <div style={{
                                                                    fontSize: '0.875rem',
                                                                    fontWeight: 'bold',
                                                                    color: 'var(--accent-secondary)',
                                                                    background: 'rgba(139, 92, 246, 0.1)',
                                                                    padding: '0.25rem 0.5rem',
                                                                    borderRadius: '4px'
                                                                }}>
                                                                    {variant.sold}
                                                                </div>
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })() : (
                                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                    <p>No sales data available. Complete show inventory tracking to see top performers.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
