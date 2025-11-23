'use client';

import { useState } from 'react';

interface InviteSellerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onInvitationCreated: () => void;
}

export default function InviteSellerModal({
    isOpen,
    onClose,
    onInvitationCreated,
}: InviteSellerModalProps) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [invitationLink, setInvitationLink] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/invitations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, role: 'SELLER' }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to create invitation');
            }

            const data = await response.json();
            setInvitationLink(data.invitationLink);
            setEmail('');
            onInvitationCreated();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setEmail('');
        setInvitationLink(null);
        setError(null);
        onClose();
    };

    const copyToClipboard = () => {
        if (invitationLink) {
            navigator.clipboard.writeText(invitationLink);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Invite Seller</h2>

                </div>

                <div className="modal-body">
                    {!invitationLink ? (
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="email">Seller Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    className="form-input"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="seller@example.com"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            {error && (
                                <div
                                    className="alert alert-error"
                                    style={{ marginBottom: '1rem' }}
                                >
                                    {error}
                                </div>
                            )}

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handleClose}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={loading}
                                >
                                    {loading ? 'Sending...' : 'Send Invitation'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div>
                            <div
                                className="alert alert-success"
                                style={{ marginBottom: '1rem' }}
                            >
                                ✅ Invitation created successfully!
                            </div>

                            <div className="form-group">
                                <label>Invitation Link (Demo)</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={invitationLink}
                                        readOnly
                                        style={{ flex: 1 }}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={copyToClipboard}
                                    >
                                        Copy
                                    </button>
                                </div>
                                <small style={{ color: 'var(--text-secondary)' }}>
                                    In production, this would be sent via email. For demo purposes,
                                    copy and share this link.
                                </small>
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleClose}
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
