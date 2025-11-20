'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface Show {
    id: string;
    name: string;
    date: string;
    venue: string | null;
}

interface Tour {
    id: string;
    name: string;
    startDate: string | null;
    endDate: string | null;
    isActive: boolean;
    shows: Show[];
    _count?: {
        shows: number;
        merchItems: number;
    };
}

export default function ToursPage() {
    const [tours, setTours] = useState<Tour[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewTourModal, setShowNewTourModal] = useState(false);
    const [showNewShowModal, setShowNewShowModal] = useState(false);
    const [selectedTourId, setSelectedTourId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const [newTour, setNewTour] = useState({
        name: '',
        startDate: '',
        endDate: '',
    });

    const [newShow, setNewShow] = useState({
        name: '',
        date: '',
        venue: '',
    });

    useEffect(() => {
        fetchTours();
    }, []);

    const fetchTours = async () => {
        try {
            const response = await fetch('/api/tours');
            if (response.ok) {
                const data = await response.json();
                setTours(data);
            }
        } catch (error) {
            console.error('Error fetching tours:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTour = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const response = await fetch('/api/tours', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTour),
            });

            if (response.ok) {
                const tour = await response.json();
                setTours([tour, ...tours]);
                setShowNewTourModal(false);
                setNewTour({ name: '', startDate: '', endDate: '' });
            }
        } catch (error) {
            console.error('Error creating tour:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCreateShow = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTourId) return;

        setSubmitting(true);

        try {
            const response = await fetch(`/api/tours/${selectedTourId}/shows`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newShow),
            });

            if (response.ok) {
                const show = await response.json();
                setTours(tours.map(tour =>
                    tour.id === selectedTourId
                        ? { ...tour, shows: [...tour.shows, show] }
                        : tour
                ));
                setShowNewShowModal(false);
                setNewShow({ name: '', date: '', venue: '' });
                setSelectedTourId(null);
            }
        } catch (error) {
            console.error('Error creating show:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const openAddShowModal = (tourId: string) => {
        setSelectedTourId(tourId);
        setShowNewShowModal(true);
    };

    if (loading) {
        return (
            <div className="animate-fade-in" style={{ textAlign: 'center', padding: '4rem' }}>
                <p>Loading tours...</p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>Tours</h1>
                    <p>Manage your tours and show dates</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowNewTourModal(true)}>
                    + New Tour
                </button>
            </header>

            {tours.length === 0 ? (
                <div className="empty-state">
                    <h3>No tours yet</h3>
                    <p>Create your first tour to get started tracking shows and inventory.</p>
                    <button className="btn btn-primary" onClick={() => setShowNewTourModal(true)} style={{ marginTop: '1rem' }}>
                        Create Tour
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {tours.map((tour) => (
                        <div key={tour.id} className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                <div>
                                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{tour.name}</h2>
                                    <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                        <span>
                                            {tour.startDate && format(new Date(tour.startDate), 'MMM d, yyyy')} - {tour.endDate && format(new Date(tour.endDate), 'MMM d, yyyy')}
                                        </span>
                                        <span>•</span>
                                        <span>{tour.shows.length} shows</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <span className={`badge ${tour.isActive ? 'badge-success' : 'badge-warning'}`}>
                                        {tour.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                    <button
                                        className="btn btn-secondary"
                                        style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                                        onClick={() => openAddShowModal(tour.id)}
                                    >
                                        + Add Show
                                    </button>
                                </div>
                            </div>

                            {tour.shows.length > 0 && (
                                <div className="table-container" style={{ marginTop: '1rem' }}>
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Show Name</th>
                                                <th>Date</th>
                                                <th>Venue</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tour.shows.map((show) => (
                                                <tr key={show.id}>
                                                    <td style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{show.name}</td>
                                                    <td>{format(new Date(show.date), 'MMM d, yyyy')}</td>
                                                    <td>{show.venue || '-'}</td>
                                                    <td>
                                                        <button
                                                            className="btn btn-secondary"
                                                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}
                                                        >
                                                            View Details
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {tour.shows.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                    <p>No shows scheduled yet. Add your first show to this tour.</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* New Tour Modal */}
            {showNewTourModal && (
                <div className="modal-overlay" onClick={() => setShowNewTourModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Create New Tour</h2>
                            <button className="close-btn" onClick={() => setShowNewTourModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleCreateTour}>
                            <div className="form-group">
                                <label className="form-label">Tour Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g. Summer Tour 2024"
                                    value={newTour.name}
                                    onChange={(e) => setNewTour({ ...newTour, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Start Date</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={newTour.startDate}
                                        onChange={(e) => setNewTour({ ...newTour, startDate: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">End Date</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={newTour.endDate}
                                        onChange={(e) => setNewTour({ ...newTour, endDate: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowNewTourModal(false)}
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? 'Creating...' : 'Create Tour'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* New Show Modal */}
            {showNewShowModal && (
                <div className="modal-overlay" onClick={() => setShowNewShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Add Show</h2>
                            <button className="close-btn" onClick={() => setShowNewShowModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleCreateShow}>
                            <div className="form-group">
                                <label className="form-label">Show Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g. Chicago - Metro"
                                    value={newShow.name}
                                    onChange={(e) => setNewShow({ ...newShow, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Date</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={newShow.date}
                                    onChange={(e) => setNewShow({ ...newShow, date: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Venue</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g. Metro Chicago"
                                    value={newShow.venue}
                                    onChange={(e) => setNewShow({ ...newShow, venue: e.target.value })}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowNewShowModal(false)}
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? 'Adding...' : 'Add Show'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
