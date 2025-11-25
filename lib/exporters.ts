import { format } from 'date-fns';
import { InventoryRecord, Tour } from '@/types/inventory';
import { ShrinkageItem, TourStats } from '@/types/reports';

export const exportTourReportCSV = async (
    selectedTour: Tour,
    inventoryRecords: InventoryRecord[],
    shrinkageData: ShrinkageItem[]
) => {
    if (!(selectedTour.shows?.length || 0)) {
        alert('No data to export');
        return;
    }

    const xlsx = await import('xlsx');

    const data = (selectedTour.shows || []).map(show => {
        const showSales = inventoryRecords
            .filter(r => r.showId === show.id)
            .reduce((sum, r) => sum + (r.soldCount || 0), 0);
        const showRevenue = inventoryRecords
            .filter(r => r.showId === show.id)
            .reduce((sum, r) => sum + ((r.soldCount || 0) * r.variant.price), 0);

        return {
            Show: show.name,
            Date: format(new Date(show.date), 'yyyy-MM-dd'),
            Venue: show.venue || '',
            Revenue: showRevenue,
            ItemsSold: showSales
        };
    });

    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Shows");

    // Add shrinkage data if any exists
    if (shrinkageData.length > 0) {
        const shrinkageSheet = xlsx.utils.json_to_sheet(shrinkageData.map(item => ({
            Item: item.item,
            Variant: item.variant,
            'Previous Show': item.prevShow,
            'Current Show': item.currentShow,
            'Expected Count': item.endCount,
            'Actual Count': item.startCount,
            'Lost/Damaged': item.shrinkage,
            'Value Lost': item.value
        })));
        xlsx.utils.book_append_sheet(workbook, shrinkageSheet, "Lost_Damaged");
    }

    xlsx.writeFile(workbook, `${selectedTour.name.replace(/\s+/g, '_')}_Report.csv`);
};

export const exportTourReportExcel = async (
    selectedTour: Tour,
    inventoryRecords: InventoryRecord[],
    stats: TourStats,
    shrinkageData: ShrinkageItem[]
) => {
    if (!(selectedTour.shows?.length || 0)) {
        alert('No data to export');
        return;
    }

    const xlsx = await import('xlsx');

    const showData = (selectedTour.shows || []).map(show => {
        const showSales = inventoryRecords
            .filter(r => r.showId === show.id)
            .reduce((sum, r) => sum + (r.soldCount || 0), 0);
        const showRevenue = inventoryRecords
            .filter(r => r.showId === show.id)
            .reduce((sum, r) => sum + ((r.soldCount || 0) * r.variant.price), 0);

        return {
            Show: show.name,
            Date: format(new Date(show.date), 'yyyy-MM-dd'),
            Venue: show.venue || '',
            Revenue: showRevenue,
            ItemsSold: showSales
        };
    });

    const worksheet = xlsx.utils.json_to_sheet(showData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Shows");

    // Add an overview sheet
    const overviewData = [
        { Metric: 'Tour Name', Value: selectedTour.name },
        { Metric: 'Total Shows', Value: selectedTour.shows?.length || 0 },
        { Metric: 'Total Revenue', Value: stats.totalRevenue },
        { Metric: 'Total Items Sold', Value: stats.totalSold },
        { Metric: 'Lost/Damaged Items', Value: stats.totalShrinkage },
        { Metric: 'Shrinkage Value', Value: stats.totalShrinkageValue }
    ];
    const overviewSheet = xlsx.utils.json_to_sheet(overviewData);
    xlsx.utils.book_append_sheet(workbook, overviewSheet, "Overview");

    // Add detailed inventory records
    if (inventoryRecords.length > 0) {
        const inventoryData = inventoryRecords.map(record => ({
            Show: record.show.name,
            Date: format(new Date(record.show.date), 'yyyy-MM-dd'),
            Item: record.variant.merchItem.name,
            Variant: `${record.variant.type ? record.variant.type + ' - ' : ''}${record.variant.size}`,
            'Start Count': record.startCount,
            'End Count': record.endCount || 'Not counted',
            'Sold Count': record.soldCount || 'Pending',
            'Unit Price': record.variant.price,
            'Revenue': record.soldCount ? (record.soldCount * record.variant.price).toFixed(2) : 'Pending'
        }));
        const inventorySheet = xlsx.utils.json_to_sheet(inventoryData);
        xlsx.utils.book_append_sheet(workbook, inventorySheet, "Inventory_Details");
    }

    // Add shrinkage data if any exists
    if (shrinkageData.length > 0) {
        const shrinkageSheet = xlsx.utils.json_to_sheet(shrinkageData.map(item => ({
            Item: item.item,
            Variant: item.variant,
            'Previous Show': item.prevShow,
            'Current Show': item.currentShow,
            'Expected Count': item.endCount,
            'Actual Count': item.startCount,
            'Lost/Damaged': item.shrinkage,
            'Value Lost': item.value
        })));
        xlsx.utils.book_append_sheet(workbook, shrinkageSheet, "Lost_Damaged");
    }

    xlsx.writeFile(workbook, `${selectedTour.name.replace(/\s+/g, '_')}_Report.xlsx`);
};
