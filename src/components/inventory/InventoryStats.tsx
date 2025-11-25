import { useMemo } from 'react';
import { MerchItem, InventoryRecord } from '@/types/inventory';

interface InventoryStatsProps {
    merchItems: MerchItem[];
    inventoryRecords: InventoryRecord[];
}

export default function InventoryStats({ merchItems, inventoryRecords }: InventoryStatsProps) {
    const totalItems = merchItems.length;

    const totalVariants = useMemo(() => {
        return merchItems.reduce((sum, item) => sum + item.variants.length, 0);
    }, [merchItems]);

    const totalValue = useMemo(() => {
        return merchItems.reduce((sum, item) =>
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
        ).toFixed(2);
    }, [merchItems, inventoryRecords]);

    return (
        <div className="inventory-stats">
            <div className="inventory-stat">
                <div className="inventory-stat-value">{totalItems}</div>
                <div className="inventory-stat-label">Total Items</div>
            </div>
            <div className="inventory-stat">
                <div className="inventory-stat-value">
                    {totalVariants}
                </div>
                <div className="inventory-stat-label">Total Variants</div>
            </div>
            <div className="inventory-stat">
                <div className="inventory-stat-value">
                    ${totalValue}
                </div>
                <div className="inventory-stat-label">Total Value</div>
            </div>
        </div>
    );
}
