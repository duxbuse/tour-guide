import { Tour } from '@/types/inventory';

interface InventoryShowSelectModalProps {
    isOpen: boolean;
    onClose: () => void;
    tours: Tour[];
    selectedTourId: string | null;
    onSelectShow: (showId: string) => void;
}

export default function InventoryShowSelectModal({
    isOpen,
    onClose,
    tours,
    selectedTourId,
    onSelectShow
}: InventoryShowSelectModalProps) {
    if (!isOpen || !selectedTourId) return null;

    return (
        <div className="modal-overlay" onClick={onClose} style={{ alignItems: 'flex-start', paddingTop: '2rem' }}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                <div className="modal-header">
                    <h2>Select Show</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                <div style={{ padding: '1.5rem' }}>
                    <div className="form-group">
                        <label className="form-label">Choose the show you are counting inventory for:</label>
                        {(tours.find(t => t.id === selectedTourId)?.shows || []).map((show) => (
                            <button
                                key={show.id}
                                onClick={() => onSelectShow(show.id)}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    marginBottom: '0.5rem',
                                    background: 'var(--bg-secondary)',
                                    border: '1px solid var(--border-subtle)',
                                    borderRadius: 'var(--radius-md)',
                                    color: 'var(--text-primary)',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--accent-primary)';
                                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                                    e.currentTarget.style.background = 'var(--bg-secondary)';
                                }}
                            >
                                <div style={{ fontWeight: 'bold' }}>{show.name}</div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                    {new Date(show.date).toLocaleDateString()}
                                </div>
                                {show.venue && (
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                        {show.venue}
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
