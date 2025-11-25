'use client';

import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useUserRole } from '@/hooks/useUserRole';
import { ToursSkeleton } from '@/components/LoadingSkeleton';
import DropdownMenu from '@/components/DropdownMenu';
import InviteSellerModal from '@/components/sellers/InviteSellerModal';
import ManageAssignmentsModal from '@/components/sellers/ManageAssignmentsModal';
import CreateTourModal from '@/components/tours/modals/CreateTourModal';
import CreateShowModal from '@/components/tours/modals/CreateShowModal';
import EditShowModal from '@/components/tours/modals/EditShowModal';

interface Show {
    id: string;
    name: string;
    date: string;
    venue: string | null;
    sellerAssignments?: Array<{
        seller: {
            id: string;
            email: string;
            name: string | null;
        };
    }>;
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
    useUser(); // Auth check
    const { role, isLoading: roleLoading } = useUserRole();
    const [tours, setTours] = useState<Tour[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewTourModal, setShowNewTourModal] = useState(false);
    const [showNewShowModal, setShowNewShowModal] = useState(false);
    const [showEditShowModal, setShowEditShowModal] = useState(false);
    const [selectedTourId, setSelectedTourId] = useState<string | null>(null);
    const [editingShow, setEditingShow] = useState<Show | null>(null);
    const [editingTourId, setEditingTourId] = useState<string | null>(null);
    const [editingTourName, setEditingTourName] = useState('');
    const [openOptionsMenu, setOpenOptionsMenu] = useState<string | null>(null);
    const [openShowMenu, setOpenShowMenu] = useState<string | null>(null);
    const [showInviteSellerModal, setShowInviteSellerModal] = useState(false);
    const [showManageAssignmentsModal, setShowManageAssignmentsModal] = useState(false);
    const [selectedTourForAssignments, setSelectedTourForAssignments] = useState<{ id: string, name: string } | null>(null);

    // Refs for dropdown triggers
    const tourMenuRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
    const showMenuRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

    // Check user role - Only managers can edit/delete shows
    const isManager = role?.toLowerCase() === 'manager';

    useEffect(() => {
        fetchTours();
    }, []);

    const fetchTours = async () => {
        try {
            // First load tours with shows for display
            const response = await fetch('/api/tours?includeShows=true');
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

    const handleTourCreated = (tour: Tour) => {
        setTours([tour, ...tours]);
    };

    const handleShowCreated = (show: Show, tourId: string) => {
        setTours(tours.map(tour =>
            tour.id === tourId
                ? { ...tour, shows: [...(tour.shows || []), show] }
                : tour
        ));
        setSelectedTourId(null);
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

    const openAddShowModal = (tourId: string) => {
        setSelectedTourId(tourId);
        setShowNewShowModal(true);
    };

    const openEditShowModal = (show: Show, tourId: string) => {
        setEditingShow(show);
        setSelectedTourId(tourId);
        setShowEditShowModal(true);
    };

    const handleShowUpdated = (updatedShow: Show, tourId: string) => {
        setTours(tours.map(tour =>
            tour.id === tourId
                ? {
                    ...tour,
                    shows: (tour.shows || []).map(show =>
                        show.id === updatedShow.id ? updatedShow : show
                    )
                }
                : tour
        ));
        setEditingShow(null);
        setSelectedTourId(null);
    };

    const handleDeleteShow = async (show: Show, tourId: string) => {
        if (!confirm(`Are you sure you want to delete the show "${show.name}" on ${format(new Date(show.date), 'MMM d, yyyy')}? This will also delete all associated inventory records. This action cannot be undone.`)) {
            return;
        }

        try {
            const response = await fetch(`/api/tours/${tourId}/shows/${show.id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setTours(tours.map(tour =>
                    tour.id === tourId
                        ? { ...tour, shows: (tour.shows || []).filter(s => s.id !== show.id) }
                        : tour
                ));
            } else {
                const errorData = await response.json();
                alert(errorData.error || 'Failed to delete show');
            }
        } catch (error) {
            console.error('Error deleting show:', error);
            alert('Failed to delete show. Please try again.');
        }
    };

    if (loading || roleLoading) {
        return <ToursSkeleton />;
    }

    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>Tours</h1>
                    <p>Manage your tours and show dates</p>
                </div>
                {isManager && (
                    <button className="btn btn-primary" onClick={() => setShowNewTourModal(true)}>
                        + New Tour
                    </button>
                )}
            </header>

            {tours.length === 0 ? (
                <div className="empty-state">
                    <h3>No tours yet</h3>
                    <p>Create your first tour to get started tracking shows and inventory.</p>
                    {isManager && (
                        <button className="btn btn-primary" onClick={() => setShowNewTourModal(true)} style={{ marginTop: '1rem' }}>
                            Create Tour
                        </button>
                    )}
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
                                        <span>{tour.shows?.length || 0} shows</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', position: 'relative' }}>
                                    <span className={`badge ${tour.isActive ? 'badge-success' : 'badge-warning'}`}>
                                        {tour.isActive ? 'Active' : 'Finished'}
                                    </span>

                                    {/* Three-dots options menu - only for managers */}
                                    {isManager && (
                                        <div style={{ position: 'relative' }}>
                                            <button
                                                ref={el => { tourMenuRefs.current[tour.id] = el; }}
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

                                            <DropdownMenu
                                                isOpen={openOptionsMenu === tour.id}
                                                onClose={() => setOpenOptionsMenu(null)}
                                                triggerRef={{ current: tourMenuRefs.current[tour.id] }}
                                            >
                                                <button
                                                    onClick={() => {
                                                        openAddShowModal(tour.id);
                                                        setOpenOptionsMenu(null);
                                                    }}
                                                    style={{
                                                        width: '100%',
                                                        padding: '0.75rem 1rem',
                                                        background: 'transparent',
                                                        border: 'none',
                                                        textAlign: 'left',
                                                        color: 'var(--text-primary)',
                                                        cursor: 'pointer',
                                                        fontSize: '0.875rem',
                                                        transition: 'background 0.2s ease'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = 'transparent';
                                                    }}
                                                >
                                                    + Add Show
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setShowInviteSellerModal(true);
                                                        setOpenOptionsMenu(null);
                                                    }}
                                                    style={{
                                                        width: '100%',
                                                        padding: '0.75rem 1rem',
                                                        background: 'transparent',
                                                        border: 'none',
                                                        color: 'var(--text-primary)',
                                                        cursor: 'pointer',
                                                        textAlign: 'left',
                                                        fontSize: '0.875rem',
                                                        transition: 'background 0.2s ease'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = 'transparent';
                                                    }}
                                                >
                                                    👥 Invite Seller
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedTourForAssignments({ id: tour.id, name: tour.name });
                                                        setShowManageAssignmentsModal(true);
                                                        setOpenOptionsMenu(null);
                                                    }}
                                                    style={{
                                                        width: '100%',
                                                        padding: '0.75rem 1rem',
                                                        background: 'transparent',
                                                        border: 'none',
                                                        color: 'var(--text-primary)',
                                                        cursor: 'pointer',
                                                        textAlign: 'left',
                                                        fontSize: '0.875rem',
                                                        transition: 'background 0.2s ease'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = 'transparent';
                                                    }}
                                                >
                                                    📋 Manage Assignments
                                                </button>
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
                                            </DropdownMenu>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {(tour.shows?.length || 0) > 0 && (
                                <div className="table-container" style={{ marginTop: '1rem' }}>
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>City</th>
                                                <th>Date</th>
                                                <th>Venue</th>
                                                {isManager && <th>Sellers</th>}
                                                {isManager && <th>Actions</th>}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(tour.shows || []).map((show) => (
                                                <tr key={show.id}>
                                                    <td style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{show.name}</td>
                                                    <td>{format(new Date(show.date), 'MMM d, yyyy')}</td>
                                                    <td>{show.venue || '-'}</td>
                                                    {isManager && (
                                                        <td>
                                                            {show.sellerAssignments && show.sellerAssignments.length > 0 ? (
                                                                <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                                                                    {show.sellerAssignments.map((assignment) => (
                                                                        <span
                                                                            key={assignment.seller.id}
                                                                            className="badge badge-info"
                                                                            title={assignment.seller.email}
                                                                            style={{
                                                                                fontSize: '0.75rem',
                                                                                padding: '0.25rem 0.5rem',
                                                                            }}
                                                                        >
                                                                            {assignment.seller.name || assignment.seller.email.split('@')[0]}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                                                    No sellers
                                                                </span>
                                                            )}
                                                        </td>
                                                    )}
                                                    {isManager && (
                                                        <td>
                                                            <div style={{ position: 'relative' }}>
                                                                <button
                                                                    ref={el => { showMenuRefs.current[show.id] = el; }}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setOpenShowMenu(openShowMenu === show.id ? null : show.id);
                                                                        setOpenOptionsMenu(null); // Close other menus
                                                                    }}
                                                                    style={{
                                                                        background: 'transparent',
                                                                        border: 'none',
                                                                        color: 'var(--text-secondary)',
                                                                        cursor: 'pointer',
                                                                        fontSize: '1.25rem',
                                                                        padding: '0.25rem 0.5rem',
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

                                                                <DropdownMenu
                                                                    isOpen={openShowMenu === show.id}
                                                                    onClose={() => setOpenShowMenu(null)}
                                                                    triggerRef={{ current: showMenuRefs.current[show.id] }}
                                                                >
                                                                    <button
                                                                        onClick={() => openEditShowModal(show, tour.id)}
                                                                        style={{
                                                                            width: '100%',
                                                                            padding: '0.5rem 1rem',
                                                                            background: 'transparent',
                                                                            border: 'none',
                                                                            textAlign: 'left',
                                                                            color: 'var(--text-primary)',
                                                                            cursor: 'pointer',
                                                                            fontSize: '0.875rem',
                                                                            transition: 'background 0.2s ease'
                                                                        }}
                                                                        onMouseEnter={(e) => {
                                                                            e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                                                                        }}
                                                                        onMouseLeave={(e) => {
                                                                            e.currentTarget.style.background = 'transparent';
                                                                        }}
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteShow(show, tour.id)}
                                                                        style={{
                                                                            width: '100%',
                                                                            padding: '0.5rem 1rem',
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
                                                                        Delete
                                                                    </button>
                                                                </DropdownMenu>
                                                            </div>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {(!tour.shows || tour.shows.length === 0) && (
                                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                    <p>No shows scheduled yet. Add your first show to this tour.</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <CreateTourModal
                isOpen={showNewTourModal}
                onClose={() => setShowNewTourModal(false)}
                onTourCreated={handleTourCreated}
            />

            <CreateShowModal
                isOpen={showNewShowModal}
                onClose={() => setShowNewShowModal(false)}
                selectedTourId={selectedTourId}
                tours={tours}
                onShowCreated={handleShowCreated}
            />

            <EditShowModal
                isOpen={showEditShowModal}
                onClose={() => setShowEditShowModal(false)}
                show={editingShow}
                selectedTourId={selectedTourId}
                tours={tours}
                onShowUpdated={handleShowUpdated}
            />

            <InviteSellerModal
                isOpen={showInviteSellerModal}
                onClose={() => setShowInviteSellerModal(false)}
                onInvitationCreated={() => {
                    // Optionally refresh data or show success message
                }}
            />

            <ManageAssignmentsModal
                isOpen={showManageAssignmentsModal}
                onClose={() => {
                    setShowManageAssignmentsModal(false);
                    setSelectedTourForAssignments(null);
                }}
                tourId={selectedTourForAssignments?.id || null}
                tourName={selectedTourForAssignments?.name || null}
            />
        </div>
    );
}
