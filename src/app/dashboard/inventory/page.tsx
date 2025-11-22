'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { auth0 } from '@/lib/auth0';

enum Category {
    APPAREL = 'APPAREL',
    ACCESSORIES = 'ACCESSORIES',
    MEDIA = 'MEDIA'
}

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
    category?: string;
    variants: MerchVariant[];
}

interface Show {
    id: string;
    name: string;
    date: string;
    venue: string | null;
}

interface Tour {
    id: string;
    name: string;
    shows: Show[];
}

interface InventoryRecord {
    id: string;
    startCount: number;
    addedCount: number;
    endCount: number | null;
    soldCount: number | null;
    shrinkage?: number;
    showId: string;
    variantId: string;
    show: Show;
    variant: {
        id: string;
        size: string;
        type: string | null;
        price: number;
        quantity: number;
        merchItem: {
            id: string;
            name: string;
        };
    };
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
    const [user, setUser] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
    const [selectedShowId, setSelectedShowId] = useState<string | null>(null);
    const [inventoryRecords, setInventoryRecords] = useState<InventoryRecord[]>([]);
    const [showInventoryModal, setShowInventoryModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportShowId, setExportShowId] = useState<string | null>(null);

    useEffect(() => {
        // Get current user from auth service
        const fetchUser = async () => {
            const session = await auth0.getSession();
            if (session?.user) {
                setUser(session.user);
            }
        };
        fetchUser();
    }, []); // Remove dependency so it only runs once or add currentUserType to dependencies

    // Check user role - Manager can delete/create, both Manager and Seller can edit quantities
    const getUserRoles = (): string[] => {
        if (!user) return [];
        const customRoles = (user['https://tour-guide.app/roles'] as string[]) || [];
        const standardRoles = (user.roles as string[]) || [];
        return [...customRoles, ...standardRoles].map(r => r.toLowerCase());
    };

    const userRoles = getUserRoles();
    const isManager = userRoles.includes('manager');
    const canManageItems = isManager; // Only managers can create/delete
    const canEditQuantities = isManager || userRoles.includes('seller'); // Both can edit quantities

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (selectedTourId) {
            fetchMerchItems(selectedTourId);
            fetchInventoryRecords(selectedTourId);
        }
    }, [selectedTourId]);

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
            setLoading(false);
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

    const handleExportInventory = async (showId: string) => {
        if (!selectedTourId || merchItems.length === 0 || !showId) return;

        const selectedTour = tours.find(t => t.id === selectedTourId);
        const selectedShow = selectedTour?.shows?.find(s => s.id === showId);
        if (!selectedTour || !selectedShow) return;

        import('xlsx-js-style').then(xlsx => {
            // Group items by category
            const groupedItems: Record<string, MerchItem[]> = {
                [Category.APPAREL]: [],
                [Category.ACCESSORIES]: [],
                [Category.MEDIA]: []
            };

            merchItems.forEach(item => {
                const cat = item.category || Category.APPAREL;
                if (!groupedItems[cat]) groupedItems[cat] = [];
                groupedItems[cat].push(item);
            });

            // Create rows for the sheet
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const rows: any[][] = [];

            // Headers with show-specific information
            rows.push(['', '', 'Artist / Event:', selectedTour.name, '', '', '', '', 'Merch Rep:', user?.name || '']);
            rows.push(['', '', 'City:', 'Melbourne', '', '', '', '', 'Attendance:', '']);
            rows.push(['', '', 'Venue:', selectedShow.venue || '', '', '', '', '', 'Per Head:', '']);
            rows.push(['', '', 'Date:', new Date(selectedShow.date).toLocaleDateString(), '', '', '', '', 'Leftover Tour Stock:', '']);
            rows.push([]); // Empty row
            rows.push([]); // Empty row

            // Column Headers
            const headers = [
                'ITEM', 'SZ', 'OPEN STOCK', 'ADD STOCK TRUCK', 'SHORT STOCK', 'OVER STOCK',
                'TOTAL STOCK', 'CLOSE STOCK', 'PULL STOCK', 'PULL STOCK', 'DAMAGE THEFT',
                'ARTIST COMPS', 'SONY COMPS', 'SOLD', 'UNIT PRICE', 'GROSS SALES', '% Splits', '%'
            ];
            rows.push(headers);

            let grandTotalGross = 0;

            // Iterate categories
            Object.values(Category).forEach(category => {
                const items = groupedItems[category];
                if (items.length === 0) return;

                // Category Header
                rows.push([category, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']);

                let categoryGross = 0;

                items.forEach(item => {
                    item.variants.forEach(variant => {
                        // Filter inventory records for this specific show
                        const showRecord = inventoryRecords.find(r =>
                            r.variantId === variant.id && r.showId === showId
                        );

                        const sold = showRecord?.soldCount || 0;
                        const damage = showRecord?.shrinkage || 0;
                        const added = showRecord?.addedCount || 0;
                        const startCount = showRecord?.startCount || variant.quantity;
                        const endCount = showRecord?.endCount ?? variant.quantity;
                        const total = startCount + added;

                        const gross = sold * variant.price;
                        categoryGross += gross;

                        rows.push([
                            item.name,
                            variant.size,
                            startCount,
                            added,
                            '', // Short
                            '', // Over
                            total,
                            endCount,
                            '', // Pull 1
                            '', // Pull 2
                            damage,
                            '', // Artist Comps
                            '', // Sony Comps
                            sold,
                            variant.price,
                            gross,
                            '', // % Splits
                            ''  // %
                        ]);
                    });
                });

                // Category Subtotal - use formula
                rows.push(['Sub Total', '', '', '', '', '', '', '', '', '', '', '', '', '', '', { f: `SUM(P${rows.length - items.reduce((sum, item) => sum + item.variants.length, 0) + 1}:P${rows.length})` }, '', '']);
                grandTotalGross += categoryGross;
            });

            // Grand Total - use formula
            const totalRowIndex = rows.length + 1;
            rows.push(['', '', '', '', '', '', '', '', '', '', '', '', '', '', 'TOTAL', { f: `SUM(P7:P${totalRowIndex - 1})` }, '', '']);

            const worksheet = xlsx.utils.aoa_to_sheet(rows);

            // Define Styles
            const thickBorder = {
                top: { style: "medium", color: { rgb: "000000" } },
                bottom: { style: "medium", color: { rgb: "000000" } },
                left: { style: "medium", color: { rgb: "000000" } },
                right: { style: "medium", color: { rgb: "000000" } }
            };

            const thinBorder = {
                top: { style: "thin", color: { rgb: "000000" } },
                bottom: { style: "thin", color: { rgb: "000000" } },
                left: { style: "thin", color: { rgb: "000000" } },
                right: { style: "thin", color: { rgb: "000000" } }
            };

            const headerStyle = {
                font: { bold: true, color: { rgb: "000000" }, size: 11 },
                fill: { fgColor: { rgb: "FFFF00" } },
                border: thickBorder,
                alignment: { horizontal: "center", vertical: "center" }
            };

            const categoryStyle = {
                font: { bold: true, color: { rgb: "FFFFFF" }, size: 12 },
                fill: { fgColor: { rgb: "808080" } },
                border: thickBorder,
                alignment: { horizontal: "left", vertical: "center" }
            };

            const subTotalStyle = {
                font: { bold: true, size: 11 },
                fill: { fgColor: { rgb: "E0E0E0" } },
                border: thickBorder,
                alignment: { horizontal: "right", vertical: "center" }
            };

            const dataStyle = {
                border: thinBorder,
                alignment: { vertical: "center" }
            };

            const numberStyle = {
                border: thinBorder,
                alignment: { horizontal: "right", vertical: "center" },
                numFmt: "#,##0"
            };

            const currencyStyle = {
                border: thinBorder,
                alignment: { horizontal: "right", vertical: "center" },
                numFmt: "$#,##0.00"
            };

            const subTotalCurrencyStyle = {
                font: { bold: true, size: 11 },
                fill: { fgColor: { rgb: "E0E0E0" } },
                border: thickBorder,
                alignment: { horizontal: "right", vertical: "center" },
                numFmt: "$#,##0.00"
            };

            // Apply Styles
            const range = xlsx.utils.decode_range(worksheet['!ref'] || 'A1:A1');

            for (let R = range.s.r; R <= range.e.r; ++R) {
                const rowValues = rows[R];
                if (!rowValues) continue;

                // Style top header info rows (0-3)
                if (R >= 0 && R <= 3) {
                    for (let C = range.s.c; C <= range.e.c; ++C) {
                        const cellAddress = xlsx.utils.encode_cell({ r: R, c: C });
                        if (!worksheet[cellAddress]) {
                            worksheet[cellAddress] = { t: 's', v: '' };
                        }

                        // Keys in columns C (2) and I (8) - bold only
                        if (C === 2 || C === 8) {
                            worksheet[cellAddress].s = {
                                font: { bold: true, size: 11 },
                                alignment: { vertical: "center" }
                            };
                        } else if (C === 3 || C === 9) {
                            // Values in columns D (3) and J (9) - thick border only
                            worksheet[cellAddress].s = {
                                font: { size: 11 },
                                border: thickBorder,
                                alignment: { vertical: "center" }
                            };
                        }
                    }
                    continue;
                }

                // Skip empty rows (4-5)
                if (R < 6) continue;

                // Header Row (Row index 6)
                if (R === 6) {
                    for (let C = range.s.c; C <= range.e.c; ++C) {
                        const cellAddress = xlsx.utils.encode_cell({ r: R, c: C });
                        if (!worksheet[cellAddress]) worksheet[cellAddress] = { t: 's', v: '' };
                        worksheet[cellAddress].s = headerStyle;
                    }
                    continue;
                }

                // Category Header
                const firstCell = rowValues[0];
                if (Object.values(Category).includes(firstCell as any)) {
                    for (let C = range.s.c; C <= range.e.c; ++C) {
                        const cellAddress = xlsx.utils.encode_cell({ r: R, c: C });
                        if (!worksheet[cellAddress]) worksheet[cellAddress] = { t: 's', v: '' };
                        worksheet[cellAddress].s = categoryStyle;
                    }
                    continue;
                }

                // Sub Total or Grand Total
                if (firstCell === 'Sub Total' || rowValues[14] === 'TOTAL') {
                    for (let C = range.s.c; C <= range.e.c; ++C) {
                        const cellAddress = xlsx.utils.encode_cell({ r: R, c: C });
                        if (!worksheet[cellAddress]) worksheet[cellAddress] = { t: 's', v: '' };
                        if (C === 15) {
                            worksheet[cellAddress].s = subTotalCurrencyStyle;
                        } else {
                            worksheet[cellAddress].s = subTotalStyle;
                        }
                    }
                    continue;
                }

                // Default Data Row
                for (let C = range.s.c; C <= range.e.c; ++C) {
                    const cellAddress = xlsx.utils.encode_cell({ r: R, c: C });
                    if (!worksheet[cellAddress]) worksheet[cellAddress] = { t: 's', v: '' };

                    if (C === 14 || C === 15) {
                        worksheet[cellAddress].s = currencyStyle;
                    } else if (C >= 2 && C <= 13) {
                        worksheet[cellAddress].s = numberStyle;
                    } else {
                        worksheet[cellAddress].s = dataStyle;
                    }
                }
            }

            // Set column widths
            worksheet['!cols'] = [
                { wch: 25 }, { wch: 6 }, { wch: 18 }, { wch: 20 },
                { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
                { wch: 15 }, { wch: 18 }, { wch: 13 }, { wch: 13 },
                { wch: 11 }, { wch: 8 }, { wch: 12 }, { wch: 14 },
                { wch: 10 }, { wch: 8 }
            ];

            const workbook = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(workbook, worksheet, "Sales_Sheet");

            const showName = selectedShow.name.replace(/[^a-zA-Z0-9]/g, '_');
            xlsx.writeFile(workbook, `${selectedTour.name.replace(/\s+/g, '_')}_${showName}_${new Date(selectedShow.date).toISOString().split('T')[0]}.xlsx`);

            setShowExportModal(false);
            setExportShowId(null);
        });
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
                            sum + item.variants.reduce((vSum, v) => {
                                // Get the most recent inventory count for this variant
                                const variantRecords = inventoryRecords.filter(r => r.variantId === v.id);
                                let latestCount = v.quantity;

                                if (variantRecords.length > 0) {
                                    const sortedRecords = variantRecords.sort((a, b) =>
                                        new Date(b.show.date).getTime() - new Date(a.show.date).getTime()
                                    );
                                    const mostRecentRecord = sortedRecords[0];
                                    latestCount = mostRecentRecord.endCount ?? mostRecentRecord.startCount ?? v.quantity;
                                }

                                return vSum + (v.price * latestCount);
                            }, 0), 0
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
                                        // Get the most recent inventory count for this variant
                                        const getLatestCount = (): number => {
                                            const variantRecords = inventoryRecords.filter(r => r.variantId === variant.id);
                                            if (variantRecords.length === 0) return variant.quantity;

                                            // Sort by show date (most recent first)
                                            const sortedRecords = variantRecords.sort((a, b) =>
                                                new Date(b.show.date).getTime() - new Date(a.show.date).getTime()
                                            );

                                            const mostRecentRecord = sortedRecords[0];

                                            // Use end count if available, otherwise start count, otherwise base quantity
                                            return mostRecentRecord.endCount ?? mostRecentRecord.startCount ?? variant.quantity;
                                        };

                                        return (
                                            <div key={variant.id} className="variant-item">
                                                <span className="variant-name">
                                                    {variant.type ? `${variant.type} - ` : ''}{variant.size}
                                                </span>
                                                <span className="variant-quantity">Qty: {getLatestCount()}</span>
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
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
                        <div className="modal-header">
                            <h2>
                                {selectedShowId ? 'Show Inventory Tracking' : 'Edit Quantities'} - {editingItem.name}
                            </h2>
                            <button className="close-btn" onClick={() => setShowEditModal(false)}>×</button>
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
                                                                handleUpdateInventoryRecord(variant.id, {
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
                                                                handleUpdateInventoryRecord(variant.id, {
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
                                                        updatedVariants[index] = { ...updatedVariants[index], quantity: parseInt(e.target.value) || 0 };
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
                                        setShowEditModal(false);
                                        setSelectedShowId(null);
                                    }}
                                >
                                    Cancel
                                </button>
                                {!selectedShowId && (
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={() => handleUpdateQuantities(editingItem.id, editingItem.variants)}
                                    >
                                        Update Quantities
                                    </button>
                                )}
                                {selectedShowId && (
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={() => {
                                            setShowEditModal(false);
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
            )}

            {/* Show Selection Modal for Sellers */}
            {showInventoryModal && editingItem && (
                <div className="modal-overlay" onClick={() => setShowInventoryModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h2>Select Show - {editingItem.name}</h2>
                            <button className="close-btn" onClick={() => setShowInventoryModal(false)}>×</button>
                        </div>
                        <div style={{ padding: '1.5rem' }}>
                            <div className="form-group">
                                <label className="form-label">Choose the show to track inventory for:</label>
                                {(tours.find(t => t.id === selectedTourId)?.shows || []).map((show) => (
                                    <button
                                        key={show.id}
                                        onClick={() => handleInventoryForShow(show.id)}
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
                                    onClick={() => setShowInventoryModal(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Show Selection Modal for Excel Export */}
            {showExportModal && selectedTourId && (
                <div className="modal-overlay" onClick={() => setShowExportModal(false)} style={{ alignItems: 'flex-start', paddingTop: '2rem' }}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h2>Select Show to Export</h2>
                            <button className="close-btn" onClick={() => setShowExportModal(false)}>×</button>
                        </div>
                        <div style={{ padding: '1.5rem' }}>
                            <div className="form-group">
                                <label className="form-label">Choose the show to export inventory for:</label>
                                {(tours.find(t => t.id === selectedTourId)?.shows || []).map((show) => (
                                    <button
                                        key={show.id}
                                        onClick={() => handleExportInventory(show.id)}
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
                                    onClick={() => setShowExportModal(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
