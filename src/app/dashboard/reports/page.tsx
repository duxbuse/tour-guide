'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface Tour {
    id: string;
    name: string;
    shows: any[];
}

export default function ReportsPage() {
    const [tours, setTours] = useState<Tour[]>([]);
    const [selectedTourId, setSelectedTourId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTours();
    }, []);

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

    const handleExportCSV = () => {
        if (!selectedTourId) return;
        const selectedTour = tours.find(t => t.id === selectedTourId);
        if (!selectedTour || !selectedTour.shows.length) {
            alert('No data to export');
            return;
        }

        import('xlsx').then(xlsx => {
            const data = selectedTour.shows.map(show => ({
                Show: show.name,
                Date: format(new Date(show.date), 'yyyy-MM-dd'),
                Venue: show.venue || '',
                Revenue: 0, // Placeholder
                ItemsSold: 0 // Placeholder
            }));

            const worksheet = xlsx.utils.json_to_sheet(data);
            const workbook = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(workbook, worksheet, "Shows");
            xlsx.writeFile(workbook, `${selectedTour.name.replace(/\s+/g, '_')}_Report.csv`);
        });
    };

    const handleExportExcel = () => {
        if (!selectedTourId) return;
        const selectedTour = tours.find(t => t.id === selectedTourId);
        if (!selectedTour || !selectedTour.shows.length) {
            alert('No data to export');
            return;
        }

        import('xlsx').then(xlsx => {
            const showData = selectedTour.shows.map(show => ({
                Show: show.name,
                Date: format(new Date(show.date), 'yyyy-MM-dd'),
                Venue: show.venue || '',
                Revenue: 0, // Placeholder
                ItemsSold: 0 // Placeholder
            }));

            const worksheet = xlsx.utils.json_to_sheet(showData);
            const workbook = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(workbook, worksheet, "Shows");

            // Add an overview sheet
            const overviewData = [
                { Metric: 'Tour Name', Value: selectedTour.name },
                { Metric: 'Total Shows', Value: selectedTour.shows.length },
                { Metric: 'Total Revenue', Value: 0 },
                { Metric: 'Total Items Sold', Value: 0 }
            ];
            const overviewSheet = xlsx.utils.json_to_sheet(overviewData);
            xlsx.utils.book_append_sheet(workbook, overviewSheet, "Overview");

            xlsx.writeFile(workbook, `${selectedTour.name.replace(/\s+/g, '_')}_Report.xlsx`);
        });
    };

    if (loading) {
        return (
            <div className="animate-fade-in" style={{ textAlign: 'center', padding: '4rem' }}>
                <p>Loading reports...</p>
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

    const selectedTour = tours.find(t => t.id === selectedTourId);

    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>Reports & Analytics</h1>
                    <p>Export and analyze your tour data</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
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
                            <div className="stat-value">{selectedTour.shows.length}</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                Across the tour
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Total Revenue</div>
                            <div className="stat-value">$0.00</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                Coming soon
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Items Sold</div>
                            <div className="stat-value">0</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                Coming soon
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Avg per Show</div>
                            <div className="stat-value">$0.00</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                Coming soon
                            </div>
                        </div>
                    </div>

                    {/* Report Sections */}
                    <div style={{ display: 'grid', gap: '2rem', marginTop: '2rem' }}>
                        {/* Sales by Show */}
                        <div className="card">
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Sales by Show</h2>
                            {selectedTour.shows.length > 0 ? (
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
                                            {selectedTour.shows.map((show: any) => (
                                                <tr key={show.id}>
                                                    <td style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{show.name}</td>
                                                    <td>{format(new Date(show.date), 'MMM d, yyyy')}</td>
                                                    <td>{show.venue || '-'}</td>
                                                    <td style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>$0.00</td>
                                                    <td>0</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                    <p>No shows scheduled for this tour yet.</p>
                                </div>
                            )}
                        </div>

                        {/* Top Selling Items */}
                        <div className="card">
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Top Selling Items</h2>
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                <p>Sales tracking coming soon! Add inventory records to see top performers.</p>
                            </div>
                        </div>

                        {/* Revenue Trends */}
                        <div className="card">
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Revenue Trends</h2>
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                <p>Chart visualization coming soon!</p>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
