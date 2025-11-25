import { useState } from 'react';
import Image from 'next/image';
import { MerchItem, Category } from '@/types/inventory';

interface NewItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedTourId: string | null;
    onItemCreated: (item: MerchItem) => void;
}

export default function NewItemModal({ isOpen, onClose, selectedTourId, onItemCreated }: NewItemModalProps) {
    const [newItem, setNewItem] = useState({
        name: '',
        description: '',
        imageUrl: '',
        price: '',
        category: Category.APPAREL
    });
    const [variants, setVariants] = useState([{ size: 'S', type: '', quantity: '0' }]);
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

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
                    category: newItem.category,
                    variants: variants.filter(v => v.size).map(v => ({ ...v, price: newItem.price, quantity: v.quantity })),
                }),
            });

            if (response.ok) {
                const item = await response.json();
                onItemCreated(item);
                onClose();
                setNewItem({ name: '', description: '', imageUrl: '', price: '', category: Category.APPAREL });
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

    const addVariant = () => {
        setVariants([...variants, { size: '', type: '', quantity: '0' }]);
    };

    const removeVariant = (index: number) => {
        setVariants(variants.filter((_, i) => i !== index));
    };

    const updateVariant = (index: number, field: string, value: string) => {
        const updated = [...variants];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        updated[index] = { ...updated[index], [field]: value } as any;
        setVariants(updated);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
                <div className="modal-header">
                    <h2>Add Merchandise Item</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
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
                        <label className="form-label">Category</label>
                        <select
                            className="form-input"
                            value={newItem.category}
                            onChange={(e) => setNewItem({ ...newItem, category: e.target.value as Category })}
                            required
                        >
                            {Object.values(Category).map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description (Optional)</label>
                        <textarea
                            className="form-input"
                            placeholder="Item description..."
                            value={newItem.description}
                            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                            rows={3}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Image (Optional)</label>
                        <input
                            type="file"
                            accept="image/*"
                            className="form-input"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    const url = URL.createObjectURL(file);
                                    setNewItem({ ...newItem, imageUrl: url });
                                }
                            }}
                        />
                        {newItem.imageUrl && (
                            <div style={{ marginTop: '0.5rem', width: '100px', height: '100px', position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                                <Image
                                    src={newItem.imageUrl}
                                    alt="Preview"
                                    fill
                                    style={{ objectFit: 'cover' }}
                                />
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Price ($)</label>
                        <input
                            type="number"
                            className="form-input"
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            value={newItem.price}
                            onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Variants (Size & Quantity)</label>
                        {variants.map((variant, index) => (
                            <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Type (e.g. Mens)"
                                    value={variant.type || ''}
                                    onChange={(e) => updateVariant(index, 'type', e.target.value)}
                                    style={{ flex: 1 }}
                                />
                                <select
                                    className="form-input"
                                    value={variant.size}
                                    onChange={(e) => updateVariant(index, 'size', e.target.value)}
                                    style={{ width: '80px' }}
                                >
                                    {['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', 'OS'].map(size => (
                                        <option key={size} value={size}>{size}</option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="Qty"
                                    min="0"
                                    value={variant.quantity}
                                    onChange={(e) => updateVariant(index, 'quantity', e.target.value)}
                                    style={{ width: '80px' }}
                                    required
                                />
                                {variants.length > 1 && (
                                    <button
                                        type="button"
                                        className="btn btn-danger"
                                        onClick={() => removeVariant(index)}
                                        style={{ padding: '0.5rem' }}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={addVariant}
                            style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}
                        >
                            + Add Variant
                        </button>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={uploading || submitting}
                        >
                            {uploading ? 'Uploading...' : submitting ? 'Creating...' : 'Create Item'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
