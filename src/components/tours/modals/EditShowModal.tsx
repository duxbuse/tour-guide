'use client';

import { useState, useEffect } from 'react';

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
}

interface EditShowModalProps {
    isOpen: boolean;
    onClose: () => void;
    show: Show | null;
    selectedTourId: string | null;
    tours: Tour[];
    onShowUpdated: (show: any, tourId: string) => void;
}

export default function EditShowModal({ isOpen, onClose, show, selectedTourId, tours, onShowUpdated }: EditShowModalProps) {
    const [submitting, setSubmitting] = useState(false);
    const [editShow, setEditShow] = useState({
        name: '',
        date: '',
        venue: '',
    });

    useEffect(() => {
        if (show) {
            setEditShow({
                name: show.name,
                date: show.date.split('T')[0], // Convert to YYYY-MM-DD format
                venue: show.venue || '',
            });
        }
    }, [show]);

    const handleUpdateShow = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTourId || !show) return;

        // Client-side validation
        const selectedTour = tours.find(tour => tour.id === selectedTourId);
        if (selectedTour && editShow.date) {
            const showDate = new Date(editShow.date);

            if (selectedTour.startDate && showDate < new Date(selectedTour.startDate)) {
                alert(`Show date must be after the tour start date (${selectedTour.startDate})`);
                return;
            }

            if (selectedTour.endDate && showDate > new Date(selectedTour.endDate)) {
                alert(`Show date must be before the tour end date (${selectedTour.endDate})`);
                return;
            }
        }

        setSubmitting(true);

        try {
            const response = await fetch(`/api/tours/${selectedTourId}/shows/${show.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editShow),
            });

            if (response.ok) {
                const updatedShow = await response.json();
                onShowUpdated(updatedShow, selectedTourId);
                onClose();
                setEditShow({ name: '', date: '', venue: '' });
            } else {
                const errorData = await response.json();
                alert(errorData.error || 'Failed to update show');
            }
        } catch (error) {
            console.error('Error updating show:', error);
            alert('Failed to update show. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen || !show) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Edit Show</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleUpdateShow}>
                    <div className="form-group">
                        <label className="form-label">City</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. Chicago - Metro"
                            value={editShow.name}
                            onChange={(e) => setEditShow({ ...editShow, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Date</label>
                            <input
                                type="date"
                                className="form-input"
                                value={editShow.date}
                                onChange={(e) => setEditShow({ ...editShow, date: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Venue</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="e.g. Metro"
                                value={editShow.venue}
                                onChange={(e) => setEditShow({ ...editShow, venue: e.target.value })}
                            />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
