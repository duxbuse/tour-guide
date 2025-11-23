import { MerchItem, InventoryRecord, Tour } from '@/types/inventory';

interface EditItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingItem: MerchItem | null;
    setEditingItem: (item: MerchItem | null) => void;
    selectedTourId: string | null;
    selectedShowId: string | null;
    setSelectedShowId: (id: string | null) => void;
    tours: Tour[];
    inventoryRecords: InventoryRecord[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onUpdateQuantities: (itemId: string, variants: any[]) => void;
    onUpdateInventoryRecord: (variantId: string, counts: { startCount?: number, endCount?: number }) => void;
}

export default function EditItemModal({
    isOpen,
    onClose,
    editingItem,
    setEditingItem,
    selectedTourId,
    selectedShowId,
    setSelectedShowId,
    tours,
    inventoryRecords,
    onUpdateQuantities,
    onUpdateInventoryRecord
}: EditItemModalProps) {
    if (!isOpen || !editingItem) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
                <div className="modal-header">
                    <h2>
                        {selectedShowId ? 'Show Inventory Tracking' : 'Edit Quantities'} - {editingItem.name}
                    </h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                <div style={{ padding: '1.5rem' }}>
                    {selectedShowId && (
                        <div style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                            <strong>Show: </strong>
                            {tours.find(t => t.id === selectedTourId)?.shows?.find(s => s.id === selectedShowId)?.name}
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                {(() => {
                                    const show = tours.find(t => t.id === selectedTourId)?.shows?.find(s => s.id === selectedShowId);
                                    return show?.date ? new Date(show.date).toLocaleDateString() : '';
                                })()}
                            </div>
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">
                            {selectedShowId ? 'Inventory Counts' : 'Update Quantities'}
                        </label>
                        {editingItem.variants.map((variant, index) => {
                            const existingRecord = inventoryRecords.find(r =>
                                r.variantId === variant.id && r.showId === selectedShowId
                            );

                            // Calculate smart default start count
                            const getDefaultStartCount = (): number => {
                                if (existingRecord?.startCount !== undefined) {
                                    return existingRecord.startCount;
                                }

                                // Find previous shows for this tour, sorted by date
                                const currentTour = tours.find(t => t.id === selectedTourId);
                                const selectedShow = currentTour?.shows.find(s => s.id === selectedShowId);

                                if (!currentTour || !selectedShow) return variant.quantity;

                                const previousShows = (currentTour.shows || [])
                                    .filter(s => new Date(s.date) < new Date(selectedShow.date))
                                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                                // Look for the most recent previous show with an end count for this variant
                                for (const prevShow of previousShows) {
                                    const prevRecord = inventoryRecords.find(r =>
                                        r.variantId === variant.id && r.showId === prevShow.id && r.endCount !== null
                                    );
                                    if (prevRecord && prevRecord.endCount !== null) {
                                        return prevRecord.endCount;
                                    }
                                }

                                // No previous show or no end count found, use current tracked inventory
                                return variant.quantity;
                            };

                            const defaultStartCount = getDefaultStartCount();

                            return (
                                <div key={variant.id} style={{
                                    marginBottom: '1.5rem',
                                    padding: '1rem',
                                    backgroundColor: 'var(--bg-secondary)',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-subtle)'
                                }}>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <strong>{variant.type ? `${variant.type} - ` : ''}{variant.size}</strong>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                            ${variant.price.toFixed(2)} • Available: {variant.quantity}
                                        </div>
                                    </div>

                                    {selectedShowId ? (
                                        // Simplified show-specific inventory tracking for sellers
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'end' }}>
                                            <div>
                                                <label style={{
                                                    fontSize: '0.875rem',
                                                    color: 'var(--text-primary)',
                                                    marginBottom: '0.5rem',
                                                    display: 'block'
                                                }}>
                                                    Start Count
                                                </label>
                                                <p style={{
                                                    fontSize: '0.75rem',
                                                    color: 'var(--text-secondary)',
                                                    marginBottom: '0.5rem'
                                                }}>
                                                    Count before show
                                                </p>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    className="form-input"
                                                    value={existingRecord?.startCount !== undefined && existingRecord?.startCount !== null
                                                        ? existingRecord.startCount
                                                        : defaultStartCount}
                                                    onChange={(e) => {
                                                        onUpdateInventoryRecord(variant.id, {
                                                            startCount: parseInt(e.target.value) || 0
                                                        });
                                                    }}
                                                    style={{ fontSize: '0.875rem', padding: '0.75rem' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{
                                                    fontSize: '0.875rem',
                                                    color: 'var(--text-primary)',
                                                    marginBottom: '0.5rem',
                                                    display: 'block'
                                                }}>
                                                    End Count
                                                </label>
                                                <p style={{
                                                    fontSize: '0.75rem',
                                                    color: 'var(--text-secondary)',
                                                    marginBottom: '0.5rem'
                                                }}>
                                                    Count after show
                                                </p>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    className="form-input"
                                                    value={existingRecord?.endCount !== undefined && existingRecord?.endCount !== null
                                                        ? existingRecord.endCount
                                                        : ''}
                                                    onChange={(e) => {
                                                        onUpdateInventoryRecord(variant.id, {
                                                            endCount: parseInt(e.target.value) || 0
                                                        });
                                                    }}
                                                    style={{ fontSize: '0.875rem', padding: '0.75rem' }}
                                                />
                                            </div>

                                            {/* Calculate and display sold count */}
                                            {(() => {
                                                const startCount = existingRecord?.startCount;
                                                const endCount = existingRecord?.endCount;

                                                // Only show if we have both counts
                                                if (startCount !== null && startCount !== undefined &&
                                                    endCount !== null && endCount !== undefined) {
                                                    const calculatedSold = startCount - endCount;
                                                    return (
                                                        <div style={{
                                                            gridColumn: 'span 2',
                                                            marginTop: '1rem',
                                                            textAlign: 'center',
                                                            padding: '1rem',
                                                            backgroundColor: 'rgba(251, 191, 36, 0.1)',
                                                            borderRadius: '8px'
                                                        }}>
                                                            <span style={{
                                                                fontSize: '1rem',
                                                                color: 'var(--accent-gold)',
                                                                fontWeight: 'bold'
                                                            }}>
                                                                Items Sold: {calculatedSold}
                                                            </span>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            })()}
                                        </div>
                                    ) : (
                                        // General quantity editing for managers
                                        <input
                                            type="number"
                                            min="0"
                                            className="form-input"
                                            placeholder="Quantity"
                                            defaultValue={variant.quantity}
                                            onChange={(e) => {
                                                const updatedVariants = [...editingItem.variants];
                                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                updatedVariants[index] = { ...updatedVariants[index], quantity: parseInt(e.target.value) || 0 } as any;
                                                setEditingItem({ ...editingItem, variants: updatedVariants });
                                            }}
                                            style={{ width: '100px' }}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => {
                                onClose();
                                setSelectedShowId(null);
                            }}
                        >
                            Cancel
                        </button>
                        {!selectedShowId && (
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => onUpdateQuantities(editingItem.id, editingItem.variants)}
                            >
                                Update Quantities
                            </button>
                        )}
                        {selectedShowId && (
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => {
                                    onClose();
                                    setSelectedShowId(null);
                                }}
                            >
                                Done
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
