import { InventoryRecord, Tour } from '@/types/inventory';
import { ShrinkageItem, TourStats, TopSellingItem, VariantSales } from '@/types/reports';

export const calculateShrinkage = (
    inventoryRecords: InventoryRecord[],
    selectedTour: Tour | undefined
): ShrinkageItem[] => {
    if (!selectedTour) return [];

    const shrinkageData: ShrinkageItem[] = [];

    // Group records by variant
    const recordsByVariant = inventoryRecords.reduce((acc, record) => {
        const key = record.variantId;
        if (!acc[key]) acc[key] = [];
        acc[key].push(record);
        return acc;
    }, {} as Record<string, InventoryRecord[]>);

    Object.entries(recordsByVariant).forEach(([, variantRecords]) => {
        // Sort by show date
        const sortedRecords = variantRecords.sort((a, b) =>
            new Date(a.show.date).getTime() - new Date(b.show.date).getTime()
        );

        for (let i = 1; i < sortedRecords.length; i++) {
            const prevRecord = sortedRecords[i - 1];
            const currentRecord = sortedRecords[i];

            if (prevRecord.endCount !== null && currentRecord.startCount !== null) {
                const shrinkage = prevRecord.endCount - currentRecord.startCount;
                if (shrinkage > 0) {
                    shrinkageData.push({
                        item: currentRecord.variant.merchItem.name,
                        variant: `${currentRecord.variant.type ? currentRecord.variant.type + ' - ' : ''}${currentRecord.variant.size}`,
                        prevShow: prevRecord.show.name,
                        currentShow: currentRecord.show.name,
                        endCount: prevRecord.endCount,
                        startCount: currentRecord.startCount,
                        shrinkage: shrinkage,
                        value: shrinkage * currentRecord.variant.price
                    });
                }
            }
        }
    });

    return shrinkageData;
};

export const getTourStats = (
    inventoryRecords: InventoryRecord[],
    selectedTour: Tour | undefined,
    shrinkageData: ShrinkageItem[]
): TourStats => {
    const totalSold = inventoryRecords.reduce((sum, record) =>
        sum + (record.soldCount || 0), 0
    );
    const totalRevenue = inventoryRecords.reduce((sum, record) =>
        sum + ((record.soldCount || 0) * record.variant.price), 0
    );

    const totalShrinkage = shrinkageData.reduce((sum, item) => sum + item.shrinkage, 0);
    const totalShrinkageValue = shrinkageData.reduce((sum, item) => sum + item.value, 0);

    const showCount = selectedTour?.shows?.length || 0;
    return {
        totalSold,
        totalRevenue,
        totalShrinkage,
        totalShrinkageValue,
        avgPerShow: showCount > 0 ? totalRevenue / showCount : 0
    };
};

export const getTopSellingItems = (inventoryRecords: InventoryRecord[]): TopSellingItem[] => {
    // Group records by item and aggregate variants across all shows
    const itemGroups = inventoryRecords
        .filter(r => (r.soldCount || 0) > 0)
        .reduce((acc, record) => {
            const itemKey = record.variant.merchItem.id;
            const itemName = record.variant.merchItem.name;
            const variantKey = `${record.variant.type || 'null'}-${record.variant.size}`;

            if (!acc[itemKey]) {
                acc[itemKey] = {
                    name: itemName,
                    totalSold: 0,
                    totalRevenue: 0,
                    variants: {}
                };
            }

            // Initialize variant if not exists
            if (!acc[itemKey].variants[variantKey]) {
                acc[itemKey].variants[variantKey] = {
                    type: record.variant.type,
                    size: record.variant.size,
                    sold: 0,
                    revenue: 0
                };
            }

            // Aggregate variant sales across all shows
            const soldCount = record.soldCount || 0;
            acc[itemKey].totalSold += soldCount;
            acc[itemKey].totalRevenue += soldCount * record.variant.price;
            acc[itemKey].variants[variantKey].sold += soldCount;
            acc[itemKey].variants[variantKey].revenue += soldCount * record.variant.price;

            return acc;
        }, {} as Record<string, { name: string; totalSold: number; totalRevenue: number; variants: Record<string, VariantSales> }>);

    // Convert variants object to array and sort
    const itemGroupsWithArrays = Object.values(itemGroups).map(item => ({
        ...item,
        variants: Object.values(item.variants).sort((a, b) => b.sold - a.sold)
    }));

    // Sort by total sales and take top items
    return itemGroupsWithArrays
        .sort((a, b) => b.totalSold - a.totalSold)
        .slice(0, 8);
};
