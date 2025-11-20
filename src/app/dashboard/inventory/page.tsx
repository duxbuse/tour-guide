'use client';

import { useState, useEffect } from 'react';

interface MerchVariant {
    id: string;
    size: string;
    type: string | null;
    price: number;
}

interface MerchItem {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    variants: MerchVariant[];
}

interface Tour {
    id: string;
    name: string;
}

export default function InventoryPage() {
    const [tours, setTours] = useState<Tour[]>([]);
    const [selectedTourId, setSelectedTourId] = useState<string | null>(null);
    const [merchItems, setMerchItems] = useState<MerchItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewItemModal, setShowNewItemModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [newItem, setNewItem] = useState({
        name: '',
        description: '',
        imageUrl: '',
        price: '',
    });

    const [variants, setVariants] = useState([
        { size: 'S', type: '' },
    ]);

    useEffect(() => {
        fetchTours();
    }, []);

    useEffect(() => {
        if (selectedTourId) {
            fetchMerchItems(selectedTourId);
        }
    }, [selectedTourId]);

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

    const handleCreateItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTourId) return;

        setSubmitting(true);

        try {
            const response = await fetch('/api/merch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tourId: selectedTourId,
                    name: newItem.name,
                    description: newItem.description,
                    imageUrl: newItem.imageUrl,
                    variants: variants.filter(v => v.size).map(v => ({ ...v, price: newItem.price })),
                }),
            });

            if (response.ok) {
                const item = await response.json();
                setMerchItems([item, ...merchItems]);
                setShowNewItemModal(false);
                setNewItem({ name: '', description: '', imageUrl: '', price: '' });
                setVariants([{ size: 'S', type: '' }]);
            }
        } catch (error) {
            console.error('Error creating merch item:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const addVariant = () => {
        setVariants([...variants, { size: '', type: '' }]);
    };

    const removeVariant = (index: number) => {
        setVariants(variants.filter((_, i) => i !== index));
    };

    const updateVariant = (index: number, field: string, value: string) => {
        const updated = [...variants];
        updated[index] = { ...updated[index], [field]: value };
        setVariants(updated);
    };

    if (loading) {
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
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>Inventory</h1>
                    <p>Manage your merchandise items and variants</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowNewItemModal(true)}
                    disabled={!selectedTourId}
                >
                    + New Item
                </button>
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
            <div className="inventory-stats">
                <div className="inventory-stat">
                    <div className="inventory-stat-value">{merchItems.length}</div>
                    <div className="inventory-stat-label">Total Items</div>
                </div>
                <div className="inventory-stat">
                    <div className="inventory-stat-value">
                        {merchItems.reduce((sum, item) => sum + item.variants.length, 0)}
                    </div>
                    <div className="inventory-stat-label">Total Variants</div>
                </div>
                <div className="inventory-stat">
                    <div className="inventory-stat-value">
                        ${merchItems.reduce((sum, item) =>
                            sum + item.variants.reduce((vSum, v) => vSum + v.price, 0), 0
                        ).toFixed(2)}
                    </div>
                    <div className="inventory-stat-label">Total Value</div>
                </div>
            </div>

            {/* Merch Items Grid */}
            {merchItems.length === 0 ? (
                <div className="empty-state">
                    <h3>No merchandise items yet</h3>
                    <p>Add your first item to start tracking inventory for this tour.</p>
                    <button className="btn btn-primary" onClick={() => setShowNewItemModal(true)} style={{ marginTop: '1rem' }}>
                        Add Item
                    </button>
                </div>
            ) : (
                <div className="merch-grid">
                    {merchItems.map((item) => (
                        <div key={item.id} className="merch-card">
                            <div className="merch-image">
                                {item.imageUrl ? (
                                    <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    '🎸'
                                )}
                            </div>
                            <div className="merch-content">
                                <div className="merch-title">{item.name}</div>
                                {item.description && (
                                    <div className="merch-description">{item.description}</div>
                                )}
                                <div className="variant-list">
                                    {item.variants.map((variant) => (
                                        <div key={variant.id} className="variant-item">
                                            <span className="variant-name">
                                                {variant.type ? `${variant.type} - ` : ''}{variant.size}
                                            </span>
                                            <span className="variant-price">${variant.price.toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* New Item Modal */}
            {showNewItemModal && (
                <div className="modal-overlay" onClick={() => setShowNewItemModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
                        <div className="modal-header">
                            <h2>Add Merchandise Item</h2>
                            <button className="close-btn" onClick={() => setShowNewItemModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleCreateItem}>
                            <div className="form-group">
                                <label className="form-label">Item Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g. Tour T-Shirt"
                                    value={newItem.name}
                                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description (Optional)</label>
                                <textarea
                                    className="form-textarea"
                                    placeholder="Describe the item..."
                                    value={newItem.description}
                                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                                    style={{ minHeight: '80px' }}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Image URL (Optional)</label>
                                <input
                                    type="url"
                                    className="form-input"
                                    placeholder="https://..."
                                    value={newItem.imageUrl}
                                    onChange={(e) => setNewItem({ ...newItem, imageUrl: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Price</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="form-input"
                                    placeholder="e.g. 25.00"
                                    value={newItem.price}
                                    onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                                    required
                                />
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                    This price will apply to all variants
                                </p>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Variants (Sizes/Types)</label>
                                {variants.map((variant, index) => (
                                    <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Size (e.g. M, L, XL)"
                                            value={variant.size}
                                            onChange={(e) => updateVariant(index, 'size', e.target.value)}
                                            required
                                            style={{ flex: 1 }}
                                        />
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Type (optional)"
                                            value={variant.type}
                                            onChange={(e) => updateVariant(index, 'type', e.target.value)}
                                            style={{ flex: 1 }}
                                        />

                                        {variants.length > 1 && (
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                onClick={() => removeVariant(index)}
                                                style={{ padding: '0.75rem' }}
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    className="btn btn-secondary btn-small"
                                    onClick={addVariant}
                                    style={{ marginTop: '0.5rem' }}
                                >
                                    + Add Variant
                                </button>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowNewItemModal(false)}
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? 'Creating...' : 'Create Item'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
