'use client';

import { useState } from 'react';

interface Tour {
    id: string;
    name: string;
    startDate: string | null;
    endDate: string | null;
    isActive: boolean;
    shows: any[];
}

interface CreateShowModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedTourId: string | null;
    tours: Tour[];
    onShowCreated: (show: any, tourId: string) => void;
}

export default function CreateShowModal({ isOpen, onClose, selectedTourId, tours, onShowCreated }: CreateShowModalProps) {
    const [submitting, setSubmitting] = useState(false);
    const [newShow, setNewShow] = useState({
        name: '',
        date: '',
        venue: '',
    });

    const handleCreateShow = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTourId) return;

        // Client-side validation
        const selectedTour = tours.find(tour => tour.id === selectedTourId);
        if (selectedTour && newShow.date) {
            const showDate = new Date(newShow.date);

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
            const response = await fetch(`/api/tours/${selectedTourId}/shows`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newShow),
            });

            if (response.ok) {
                const show = await response.json();
                onShowCreated(show, selectedTourId);
                onClose();
                setNewShow({ name: '', date: '', venue: '' });
            } else {
                const errorData = await response.json();
                alert(errorData.error || 'Failed to create show');
            }
        } catch (error) {
            console.error('Error creating show:', error);
            alert('Failed to create show. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen || !selectedTourId) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Add Show</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
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
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Date</label>
                            <input
                                type="datetime-local"
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
                                placeholder="e.g. Metro"
                                value={newShow.venue}
                                onChange={(e) => setNewShow({ ...newShow, venue: e.target.value })}
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
                            {submitting ? 'Adding...' : 'Add Show'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
