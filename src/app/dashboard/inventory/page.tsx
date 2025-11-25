'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useUserRole } from '@/hooks/useUserRole';
import { MerchItem, MerchVariant, InventoryRecord, Tour } from '@/types/inventory';
import InventoryStats from '@/components/inventory/InventoryStats';
import ExportModal from '@/components/inventory/modals/ExportModal';
import NewItemModal from '@/components/inventory/modals/NewItemModal';
import EditItemModal from '@/components/inventory/modals/EditItemModal';
import InventoryShowSelectModal from '@/components/inventory/modals/InventoryShowSelectModal';

export default function InventoryPage() {
    const { user, isLoading: userLoading } = useUser();
    const { role, isLoading: roleLoading } = useUserRole();
    const [tours, setTours] = useState<Tour[]>([]);
    const [selectedTourId, setSelectedTourId] = useState<string | null>(null);
    const [merchItems, setMerchItems] = useState<MerchItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewItemModal, setShowNewItemModal] = useState(false);
    const [editingItem, setEditingItem] = useState<MerchItem | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // const [user, setUser] = useState<any>(null);
    const [selectedShowId, setSelectedShowId] = useState<string | null>(null);
    const [inventoryRecords, setInventoryRecords] = useState<InventoryRecord[]>([]);
    const [showInventoryModal, setShowInventoryModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);

    // useEffect(() => {
    //     // Get current user from auth service
    //     const fetchUser = async () => {
    //         const session = await auth0.getSession();
    //         if (session?.user) {
    //             setUser(session.user);
    //         }
    //     };
    //     fetchUser();
    // }, []);

    // Check user role - Manager can delete/create, both Manager and Seller can edit quantities
    const isManager = role?.toLowerCase() === 'manager';
    const canManageItems = isManager; // Only managers can create/delete
    const canEditQuantities = isManager || role?.toLowerCase() === 'seller'; // Both can edit quantities

    useEffect(() => {
        fetchTours();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (selectedTourId) {
            const loadData = async () => {
                setLoading(true);
                await Promise.all([
                    fetchMerchItems(selectedTourId),
                    fetchInventoryRecords(selectedTourId)
                ]);
                setLoading(false);
            };
            loadData();
        }
    }, [selectedTourId]);

    // Memoize the latest count for each variant to avoid O(N*M*R) complexity during render
    const latestVariantCounts = useMemo(() => {
        const counts = new Map<string, number>();

        merchItems.forEach(item => {
            item.variants.forEach(variant => {
                const variantRecords = inventoryRecords.filter(r => r.variantId === variant.id);

                if (variantRecords.length === 0) {
                    counts.set(variant.id, variant.quantity);
                    return;
                }

                // Sort by show date (most recent first)
                const sortedRecords = variantRecords.sort((a, b) =>
                    new Date(b.show.date).getTime() - new Date(a.show.date).getTime()
                );

                const mostRecentRecord = sortedRecords[0];
                // Use end count if available, otherwise start count, otherwise base quantity
                const count = mostRecentRecord.endCount ?? mostRecentRecord.startCount ?? variant.quantity;
                counts.set(variant.id, count);
            });
        });

        return counts;
    }, [merchItems, inventoryRecords]);

    const fetchTours = async () => {
        try {
            const response = await fetch('/api/tours?includeShows=true');
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
            // Initial loading state handled by the Promise.all in the other useEffect
            if (!selectedTourId) setLoading(false);
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

    const fetchMerchItems = async (tourId: string) => {
        try {
            const response = await fetch(`/api/merch?tourId=${tourId}`);
            if (response.ok) {
                const data = await response.json();
                setMerchItems(data);
            }
        } catch (error) {
            console.error('Error fetching merch items:', error);
        }
    };

    const handleDeleteItem = async (itemId: string) => {
        if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/api/merch?id=${itemId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setMerchItems(merchItems.filter(item => item.id !== itemId));
            }
        } catch (error) {
            console.error('Error deleting merch item:', error);
        }
    };

    const handleEditItem = (item: MerchItem) => {
        setEditingItem(item);
        if (!canManageItems && (tours.find(t => t.id === selectedTourId)?.shows?.length || 0) > 0) {
            // Sellers need to select a show for inventory tracking
            setShowInventoryModal(true);
        } else {
            // Managers can edit quantities directly
            setShowEditModal(true);
        }
    };

    const handleInventoryForShow = (showId: string) => {
        setSelectedShowId(showId);
        setShowInventoryModal(false);
        setShowEditModal(true);
    };

    const handleUpdateInventoryRecord = async (variantId: string, counts: { startCount?: number, endCount?: number }) => {
        if (!selectedShowId) return;

        try {
            const response = await fetch('/api/inventory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    showId: selectedShowId,
                    variantId,
                    addedCount: 0, // Not used anymore, set to 0
                    ...counts,
                }),
            });

            if (response.ok) {
                // Refresh inventory records
                if (selectedTourId) {
                    fetchInventoryRecords(selectedTourId);
                }
            }
        } catch (error) {
            console.error('Error updating inventory record:', error);
        }
    };

    const handleUpdateQuantities = async (itemId: string, updatedVariants: MerchVariant[]) => {
        try {
            const response = await fetch('/api/merch', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: itemId,
                    variants: updatedVariants,
                }),
            });

            if (response.ok) {
                const updatedItem = await response.json();
                setMerchItems(items => items.map(item =>
                    item.id === itemId ? updatedItem : item
                ));
                setShowEditModal(false);
                setEditingItem(null);
            }
        } catch (error) {
            console.error('Error updating quantities:', error);
        }
    };

    if (loading || roleLoading) {
        return (
            <div className="animate-fade-in" style={{ textAlign: 'center', padding: '4rem' }}>
                <p>Loading inventory...</p>
            </div>
        );
    }

    if (tours.length === 0) {
        return (
            <div className="animate-fade-in">
                <h1>Inventory</h1>
                <div className="empty-state">
                    <h3>No tours found</h3>
                    <p>Create a tour first to start managing your merchandise inventory.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <header className="page-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>Inventory</h1>
                    <p>Manage your merchandise items and variants</p>
                </div>
                <div className="header-actions" style={{ display: 'flex', gap: '0.5rem' }}>
                    {merchItems.length > 0 && (
                        <button
                            className="btn btn-secondary"
                            onClick={() => setShowExportModal(true)}
                            disabled={!selectedTourId}
                        >
                            📊 Export Excel
                        </button>
                    )}
                    {canManageItems && (
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowNewItemModal(true)}
                            disabled={!selectedTourId}
                        >
                            + New Item
                        </button>
                    )}
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

            {/* Inventory Stats */}
            <InventoryStats merchItems={merchItems} inventoryRecords={inventoryRecords} />

            {/* Merch Items Grid */}
            {merchItems.length === 0 ? (
                <div className="empty-state">
                    <h3>No merchandise items yet</h3>
                    <p>Add your first item to start tracking inventory for this tour.</p>
                    {canManageItems && (
                        <button className="btn btn-primary" onClick={() => setShowNewItemModal(true)} style={{ marginTop: '1rem' }}>
                            Add Item
                        </button>
                    )}
                </div>
            ) : (
                <div className="merch-grid">
                    {merchItems.map((item) => (
                        <div key={item.id} className="merch-card">
                            <div className="merch-image">
                                {item.imageUrl ? (
                                    <Image
                                        src={item.imageUrl}
                                        alt={item.name}
                                        width={200}
                                        height={200}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    '🎸'
                                )}
                            </div>
                            <div className="merch-content">
                                <div className="merch-title">{item.name}</div>
                                {item.description && (
                                    <div className="merch-description">{item.description}</div>
                                )}
                                <div className="merch-price" style={{
                                    fontSize: '1.25rem',
                                    fontWeight: '700',
                                    color: 'var(--accent-secondary)',
                                    textShadow: '0 0 10px var(--glow-pink)',
                                    marginBottom: '1rem'
                                }}>
                                    ${item.variants[0]?.price.toFixed(2)}
                                </div>
                                <div className="variant-list">
                                    {item.variants.map((variant) => {
                                        const count = latestVariantCounts.get(variant.id) ?? variant.quantity;

                                        return (
                                            <div key={variant.id} className="variant-item">
                                                <span className="variant-name">
                                                    {variant.type ? `${variant.type} - ` : ''}{variant.size}
                                                </span>
                                                <span className="variant-quantity">Qty: {count}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="merch-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    {canEditQuantities && (
                                        <button
                                            className="btn btn-secondary btn-small"
                                            onClick={() => handleEditItem(item)}
                                        >
                                            Edit Quantities
                                        </button>
                                    )}
                                    {canManageItems && (
                                        <button
                                            className="btn btn-danger btn-small"
                                            onClick={() => handleDeleteItem(item.id)}
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Manager View - Show Inventory Records */}
            {isManager && inventoryRecords.length > 0 && (
                <div style={{ marginTop: '3rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
                        Show Inventory Records
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {(tours.find(t => t.id === selectedTourId)?.shows || []).map((show) => {
                            const showRecords = inventoryRecords.filter(r => r.showId === show.id);
                            if (showRecords.length === 0) return null;

                            return (
                                <div key={show.id} className="card">
                                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--accent-primary)' }}>
                                        {show.name} - {new Date(show.date).toLocaleDateString()}
                                    </h3>
                                    {show.venue && (
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                            {show.venue}
                                        </div>
                                    )}
                                    <div className="table-container">
                                        <table className="table">
                                            <thead>
                                                <tr>
                                                    <th>Item</th>
                                                    <th>Variant</th>
                                                    <th>Start Count</th>
                                                    <th>End Count</th>
                                                    <th>Sold</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {showRecords.map((record) => (
                                                    <tr key={record.id}>
                                                        <td style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                                                            {record.variant.merchItem.name}
                                                        </td>
                                                        <td>
                                                            {record.variant.type ? `${record.variant.type} - ` : ''}{record.variant.size}
                                                        </td>
                                                        <td>{record.startCount}</td>
                                                        <td>
                                                            {record.endCount !== null ? record.endCount : (
                                                                <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                                                    Not counted
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            {record.soldCount !== null ? (
                                                                <span style={{
                                                                    color: 'var(--accent-gold)',
                                                                    fontWeight: 'bold'
                                                                }}>
                                                                    {record.soldCount}
                                                                </span>
                                                            ) : (
                                                                <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                                                    Pending
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <NewItemModal
                isOpen={showNewItemModal}
                onClose={() => setShowNewItemModal(false)}
                selectedTourId={selectedTourId}
                onItemCreated={(item) => setMerchItems([item, ...merchItems])}
            />

            <EditItemModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                editingItem={editingItem}
                setEditingItem={setEditingItem}
                selectedTourId={selectedTourId}
                selectedShowId={selectedShowId}
                setSelectedShowId={setSelectedShowId}
                tours={tours}
                inventoryRecords={inventoryRecords}
                onUpdateQuantities={handleUpdateQuantities}
                onUpdateInventoryRecord={handleUpdateInventoryRecord}
            />

            <InventoryShowSelectModal
                isOpen={showInventoryModal}
                onClose={() => setShowInventoryModal(false)}
                tours={tours}
                selectedTourId={selectedTourId}
                onSelectShow={handleInventoryForShow}
            />

            <ExportModal
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
                tours={tours}
                selectedTourId={selectedTourId}
                merchItems={merchItems}
                inventoryRecords={inventoryRecords}
                user={user ?? { name: undefined }}
            />
        </div>
    );
}
