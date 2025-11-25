'use client';

import { useState, useEffect } from 'react';

interface Seller {
    id: string;
    email: string;
    name: string | null;
}

interface Show {
    id: string;
    name: string;
    date: string;
    tour: {
        id: string;
        name: string;
    };
}

interface Assignment {
    id: string;
    seller: Seller;
    show: Show;
}

interface ManageAssignmentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    tourId: string | null;
    tourName: string | null;
}

export default function ManageAssignmentsModal({
    isOpen,
    onClose,
    tourId,
    tourName,
}: ManageAssignmentsModalProps) {
    const [sellers, setSellers] = useState<Seller[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [shows, setShows] = useState<Show[]>([]);
    const [selectedSellerId, setSelectedSellerId] = useState('');
    const [selectedShowId, setSelectedShowId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && tourId) {
            fetchSellers();
            fetchAssignments();
            fetchShows();
        }
    }, [isOpen, tourId]);

    const fetchSellers = async () => {
        try {
            // For now, we'll need to get sellers from the assignments endpoint
            // In a real app, you'd have a /api/users?role=SELLER endpoint
            const response = await fetch('/api/seller-assignments');
            if (response.ok) {
                const data = await response.json();
                const uniqueSellers = Array.from(
                    new Map(data.map((a: Assignment) => [a.seller.id, a.seller])).values()
                ) as Seller[];
                setSellers(uniqueSellers);
            }
        } catch (err) {
            console.error('Error fetching sellers:', err);
        }
    };

    const fetchShows = async () => {
        if (!tourId) return;

        try {
            const response = await fetch(`/api/tours/${tourId}/shows`);
            if (response.ok) {
                const data = await response.json();
                setShows(data);
            }
        } catch (err) {
            console.error('Error fetching shows:', err);
        }
    };

    const fetchAssignments = async () => {
        if (!tourId) return;

        try {
            const response = await fetch('/api/seller-assignments');
            if (response.ok) {
                const data = await response.json();
                // Filter to only show assignments for this tour
                const tourAssignments = data.filter((a: Assignment) =>
                    a.show.tour.id === tourId
                );
                setAssignments(tourAssignments);
            }
        } catch (err) {
            console.error('Error fetching assignments:', err);
        }
    };

    const handleAssign = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSellerId || !selectedShowId) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/seller-assignments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sellerId: selectedSellerId,
                    showId: selectedShowId,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to create assignment');
            }

            await fetchAssignments();
            setSelectedSellerId('');
            setSelectedShowId('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveAssignment = async (assignmentId: string) => {
        if (!confirm('Remove this seller assignment?')) return;

        try {
            const response = await fetch(
                `/api/seller-assignments?id=${assignmentId}`,
                {
                    method: 'DELETE',
                }
            );

            if (response.ok) {
                await fetchAssignments();
            }
        } catch (err) {
            console.error('Error removing assignment:', err);
        }
    };

    if (!isOpen || !tourId) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: '800px' }}
            >
                <div className="modal-header">
                    <h2>Manage Assignments - {tourName}</h2>

                </div>

                <div className="modal-body">
                    {/* Assignment Form */}
                    <form onSubmit={handleAssign} style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label htmlFor="seller">Seller</label>
                                <select
                                    id="seller"
                                    className="form-select"
                                    value={selectedSellerId}
                                    onChange={(e) => setSelectedSellerId(e.target.value)}
                                    required
                                    disabled={loading || sellers.length === 0}
                                >
                                    <option value="">Select seller...</option>
                                    {sellers.map((seller) => (
                                        <option key={seller.id} value={seller.id}>
                                            {seller.name || seller.email}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label htmlFor="show">Show</label>
                                <select
                                    id="show"
                                    className="form-select"
                                    value={selectedShowId}
                                    onChange={(e) => setSelectedShowId(e.target.value)}
                                    required
                                    disabled={loading || shows.length === 0}
                                >
                                    <option value="">Select show...</option>
                                    {shows.map((show) => (
                                        <option key={show.id} value={show.id}>
                                            {show.name} - {new Date(show.date).toLocaleDateString()}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading || !selectedSellerId || !selectedShowId}
                            >
                                Assign
                            </button>
                        </div>

                        {error && (
                            <div className="alert alert-error" style={{ marginTop: '1rem' }}>
                                {error}
                            </div>
                        )}
                    </form>

                    {sellers.length === 0 && (
                        <div className="alert alert-info" style={{ marginBottom: '1rem' }}>
                            No sellers found. Invite sellers first to assign them to shows.
                        </div>
                    )}

                    {/* Assignments List */}
                    <div>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
                            Current Assignments ({assignments.length})
                        </h3>

                        {assignments.length === 0 ? (
                            <div className="empty-state">
                                <p>No seller assignments yet.</p>
                            </div>
                        ) : (
                            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Seller</th>
                                            <th>Tour</th>
                                            <th>Show</th>
                                            <th>Date</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {assignments.map((assignment) => (
                                            <tr key={assignment.id}>
                                                <td>{assignment.seller.name || assignment.seller.email}</td>
                                                <td>{assignment.show.tour.name}</td>
                                                <td>{assignment.show.name}</td>
                                                <td>
                                                    {new Date(assignment.show.date).toLocaleDateString()}
                                                </td>
                                                <td>
                                                    <button
                                                        className="btn btn-danger btn-small"
                                                        onClick={() => handleRemoveAssignment(assignment.id)}
                                                    >
                                                        Remove
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
