'use client';

import { useState } from 'react';

interface CreateTourModalProps {
    isOpen: boolean;
    onClose: () => void;
    onTourCreated: (tour: any) => void;
}

export default function CreateTourModal({ isOpen, onClose, onTourCreated }: CreateTourModalProps) {
    const [submitting, setSubmitting] = useState(false);
    const [newTour, setNewTour] = useState({
        name: '',
        startDate: '',
        endDate: '',
    });

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
                onTourCreated(tour);
                onClose();
                setNewTour({ name: '', startDate: '', endDate: '' });
            }
        } catch (error) {
            console.error('Error creating tour:', error);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Create New Tour</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
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
                            onClick={onClose}
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
    );
}
