'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useUserRole } from '@/hooks/useUserRole';
import { isDemoMode, getDemoUserType } from '@/lib/demo-mode';
import { InventoryRecord, Tour } from '@/types/inventory';
import { calculateShrinkage, getTourStats, getTopSellingItems } from '@/lib/reports';
import { exportTourReportCSV, exportTourReportExcel } from '@/lib/exporters';

export default function ReportsPage() {
    const { user, isLoading: userLoading } = useUser();
    const { role, isLoading: roleLoading } = useUserRole();
    const [tours, setTours] = useState<Tour[]>([]);
    const [selectedTourId, setSelectedTourId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [inventoryRecords, setInventoryRecords] = useState<InventoryRecord[]>([]);
    const [showsLoading, setShowsLoading] = useState(false);
    const [isDemo, setIsDemo] = useState(false);
    const [demoType, setDemoType] = useState<'manager' | 'seller'>('manager');

    useEffect(() => {
        setIsDemo(isDemoMode());
        setDemoType(getDemoUserType());
        fetchTours();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (selectedTourId) {
            fetchShows(selectedTourId);
            fetchInventoryRecords(selectedTourId);
        }
    }, [selectedTourId]);

    // Check user role - Only managers can access reports (or demo mode managers)
    const isManager = (isDemo && demoType === 'manager') || role?.toLowerCase() === 'manager';

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
    const shrinkageData = calculateShrinkage(inventoryRecords, selectedTour);
    const stats = getTourStats(inventoryRecords, selectedTour, shrinkageData);
    const topItems = getTopSellingItems(inventoryRecords);

    const handleExportCSV = () => {
        if (selectedTour) {
            exportTourReportCSV(selectedTour, inventoryRecords, shrinkageData);
        }
    };

    const handleExportExcel = () => {
        if (selectedTour) {
            exportTourReportExcel(selectedTour, inventoryRecords, stats, shrinkageData);
        }
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
                            {topItems.length > 0 ? (
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
                            ) : (
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
