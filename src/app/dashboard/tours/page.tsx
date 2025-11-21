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
    const [editingTourId, setEditingTourId] = useState<string | null>(null);
    const [editingTourName, setEditingTourName] = useState('');
    const [openOptionsMenu, setOpenOptionsMenu] = useState<string | null>(null);

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

    const handleTourDoubleClick = (tour: Tour) => {
        setEditingTourId(tour.id);
        setEditingTourName(tour.name);
    };

    const handleTourNameSave = async (tourId: string) => {
        if (!editingTourName.trim()) return;

        try {
            const response = await fetch('/api/tours', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: tourId,
                    name: editingTourName.trim(),
                }),
            });

            if (response.ok) {
                const updatedTour = await response.json();
                setTours(tours.map(tour =>
                    tour.id === tourId ? updatedTour : tour
                ));
                setEditingTourId(null);
                setEditingTourName('');
            }
        } catch (error) {
            console.error('Error updating tour name:', error);
        }
    };

    const handleTourNameCancel = () => {
        setEditingTourId(null);
        setEditingTourName('');
    };

    const handleTourNameKeyPress = (e: React.KeyboardEvent, tourId: string) => {
        if (e.key === 'Enter') {
            handleTourNameSave(tourId);
        } else if (e.key === 'Escape') {
            handleTourNameCancel();
        }
    };

    const handleDeleteTour = async (tourId: string) => {
        if (!confirm('Are you sure you want to delete this tour? This will also delete all associated shows and merchandise. This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/api/tours?id=${tourId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setTours(tours.filter(tour => tour.id !== tourId));
                setOpenOptionsMenu(null);
            }
        } catch (error) {
            console.error('Error deleting tour:', error);
        }
    };

    const toggleOptionsMenu = (tourId: string) => {
        setOpenOptionsMenu(openOptionsMenu === tourId ? null : tourId);
    };

    // Close options menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            setOpenOptionsMenu(null);
        };
        
        if (openOptionsMenu) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [openOptionsMenu]);

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
                                    {editingTourId === tour.id ? (
                                        <div style={{ marginBottom: '0.5rem' }}>
                                            <input
                                                type="text"
                                                value={editingTourName}
                                                onChange={(e) => setEditingTourName(e.target.value)}
                                                onKeyPress={(e) => handleTourNameKeyPress(e, tour.id)}
                                                onBlur={() => handleTourNameSave(tour.id)}
                                                autoFocus
                                                style={{
                                                    fontSize: '1.5rem',
                                                    background: 'transparent',
                                                    border: '2px solid var(--accent-primary)',
                                                    borderRadius: '4px',
                                                    color: 'var(--text-primary)',
                                                    padding: '0.25rem 0.5rem',
                                                    width: '100%',
                                                    maxWidth: '400px'
                                                }}
                                            />
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                                Press Enter to save, Escape to cancel
                                            </div>
                                        </div>
                                    ) : (
                                        <h2
                                            style={{
                                                fontSize: '1.5rem',
                                                marginBottom: '0.5rem',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onDoubleClick={() => handleTourDoubleClick(tour)}
                                            title="Double-click to rename"
                                        >
                                            {tour.name}
                                        </h2>
                                    )}
                                    <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                        <span>
                                            {tour.startDate && format(new Date(tour.startDate), 'MMM d, yyyy')} - {tour.endDate && format(new Date(tour.endDate), 'MMM d, yyyy')}
                                        </span>
                                        <span>•</span>
                                        <span>{tour.shows.length} shows</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', position: 'relative' }}>
                                    <span className={`badge ${tour.isActive ? 'badge-success' : 'badge-warning'}`}>
                                        {tour.isActive ? 'Active' : 'Finished'}
                                    </span>
                                    <button
                                        className="btn btn-secondary"
                                        style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                                        onClick={() => openAddShowModal(tour.id)}
                                    >
                                        + Add Show
                                    </button>
                                    
                                    {/* Three-dots options menu */}
                                    <div style={{ position: 'relative' }}>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleOptionsMenu(tour.id);
                                            }}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                color: 'var(--text-secondary)',
                                                cursor: 'pointer',
                                                fontSize: '1.25rem',
                                                padding: '0.5rem',
                                                borderRadius: '4px',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                                e.currentTarget.style.color = 'var(--text-primary)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'transparent';
                                                e.currentTarget.style.color = 'var(--text-secondary)';
                                            }}
                                        >
                                            ⋯
                                        </button>
                                        
                                        {openOptionsMenu === tour.id && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '100%',
                                                right: 0,
                                                background: 'var(--bg-card)',
                                                border: '1px solid var(--border-subtle)',
                                                borderRadius: 'var(--radius-md)',
                                                padding: '0.5rem 0',
                                                minWidth: '150px',
                                                zIndex: 1000,
                                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                                            }}>
                                                <button
                                                    onClick={() => handleDeleteTour(tour.id)}
                                                    style={{
                                                        width: '100%',
                                                        padding: '0.75rem 1rem',
                                                        background: 'transparent',
                                                        border: 'none',
                                                        textAlign: 'left',
                                                        color: '#ef4444',
                                                        cursor: 'pointer',
                                                        fontSize: '0.875rem',
                                                        transition: 'background 0.2s ease'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = 'transparent';
                                                    }}
                                                >
                                                    🗑️ Delete Tour
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {tour.shows.length > 0 && (
                                <div className="table-container" style={{ marginTop: '1rem' }}>
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>City</th>
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
                                <label className="form-label">City</label>
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
