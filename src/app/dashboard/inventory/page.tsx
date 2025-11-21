'use client';

import { useState, useEffect } from 'react';

interface MerchVariant {
    id: string;
    size: string;
    type: string | null;
    price: number;
    quantity: number;
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
    const [editingItem, setEditingItem] = useState<MerchItem | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [newItem, setNewItem] = useState({
        name: '',
        description: '',
        imageUrl: '',
        price: '',
    });

    const [variants, setVariants] = useState([
        { size: 'S', type: '', quantity: '0' },
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

    const handleImageUpload = async (file: File) => {
        if (!file) return null;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const { url } = await response.json();
                return url;
            } else {
                console.error('Failed to upload image');
                return null;
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            return null;
        } finally {
            setUploading(false);
        }
    };

    const handleCreateItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTourId) return;

        setSubmitting(true);

        try {
            // Handle image upload if a file was selected
            let imageUrl = newItem.imageUrl;
            const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
            if (fileInput?.files?.[0]) {
                const uploadedUrl = await handleImageUpload(fileInput.files[0]);
                if (uploadedUrl) {
                    imageUrl = uploadedUrl;
                }
            }

            const response = await fetch('/api/merch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tourId: selectedTourId,
                    name: newItem.name,
                    description: newItem.description,
                    imageUrl: imageUrl,
                    variants: variants.filter(v => v.size).map(v => ({ ...v, price: newItem.price, quantity: v.quantity })),
                }),
            });

            if (response.ok) {
                const item = await response.json();
                setMerchItems([item, ...merchItems]);
                setShowNewItemModal(false);
                setNewItem({ name: '', description: '', imageUrl: '', price: '' });
                setVariants([{ size: 'S', type: '', quantity: '0' }]);
                // Reset file input
                if (fileInput) {
                    fileInput.value = '';
                }
            }
        } catch (error) {
            console.error('Error creating merch item:', error);
        } finally {
            setSubmitting(false);
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
        setShowEditModal(true);
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

    const addVariant = () => {
        setVariants([...variants, { size: '', type: '', quantity: '0' }]);
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
                            sum + item.variants.reduce((vSum, v) => vSum + (v.price * v.quantity), 0), 0
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
                                    {item.variants.map((variant) => (
                                        <div key={variant.id} className="variant-item">
                                            <span className="variant-name">
                                                {variant.type ? `${variant.type} - ` : ''}{variant.size}
                                            </span>
                                            <span className="variant-quantity">Qty: {variant.quantity}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="merch-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <button
                                        className="btn btn-secondary btn-small"
                                        onClick={() => handleEditItem(item)}
                                    >
                                        Edit Quantities
                                    </button>
                                    <button
                                        className="btn btn-danger btn-small"
                                        onClick={() => handleDeleteItem(item.id)}
                                    >
                                        Delete
                                    </button>
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
                                <label className="form-label">Image (Optional)</label>
                                <input
                                    type="file"
                                    className="form-input"
                                    accept="image/*"
                                    disabled={uploading}
                                />
                                {uploading && (
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                        Uploading image...
                                    </p>
                                )}
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
                                         <input
                                             type="number"
                                             min="0"
                                             className="form-input"
                                             placeholder="Quantity"
                                             value={variant.quantity}
                                             onChange={(e) => updateVariant(index, 'quantity', e.target.value)}
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
                                <button type="submit" className="btn btn-primary" disabled={submitting || uploading}>
                                    {submitting ? 'Creating...' : uploading ? 'Uploading...' : 'Create Item'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Item Modal */}
            {showEditModal && editingItem && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h2>Edit Quantities - {editingItem.name}</h2>
                            <button className="close-btn" onClick={() => setShowEditModal(false)}>×</button>
                        </div>
                        <div style={{ padding: '1.5rem' }}>
                            <div className="form-group">
                                <label className="form-label">Update Quantities</label>
                                {editingItem.variants.map((variant, index) => (
                                    <div key={variant.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', padding: '1rem', backgroundColor: 'var(--background-secondary)', borderRadius: '8px' }}>
                                        <div style={{ flex: 1 }}>
                                            <strong>{variant.type ? `${variant.type} - ` : ''}{variant.size}</strong>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                                ${variant.price.toFixed(2)}
                                            </div>
                                        </div>
                                        <input
                                            type="number"
                                            min="0"
                                            className="form-input"
                                            placeholder="Quantity"
                                            defaultValue={variant.quantity}
                                            onChange={(e) => {
                                                const updatedVariants = [...editingItem.variants];
                                                updatedVariants[index] = { ...updatedVariants[index], quantity: parseInt(e.target.value) || 0 };
                                                setEditingItem({ ...editingItem, variants: updatedVariants });
                                            }}
                                            style={{ width: '100px' }}
                                        />
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowEditModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => handleUpdateQuantities(editingItem.id, editingItem.variants)}
                                >
                                    Update Quantities
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
