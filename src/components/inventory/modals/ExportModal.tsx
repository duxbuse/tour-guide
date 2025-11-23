import { MerchItem, InventoryRecord, Tour, Category } from '@/types/inventory';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    tours: Tour[];
    selectedTourId: string | null;
    merchItems: MerchItem[];
    inventoryRecords: InventoryRecord[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user: any;
}

export default function ExportModal({
    isOpen,
    onClose,
    tours,
    selectedTourId,
    merchItems,
    inventoryRecords,
    user
}: ExportModalProps) {
    if (!isOpen || !selectedTourId) return null;

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

            onClose();
        });
    };

    return (
        <div className="modal-overlay" onClick={onClose} style={{ alignItems: 'flex-start', paddingTop: '2rem' }}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                <div className="modal-header">
                    <h2>Select Show to Export</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
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
