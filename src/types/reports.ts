export interface VariantSales {
    type: string | null;
    size: string;
    sold: number;
    revenue: number;
}

export interface ShrinkageItem {
    item: string;
    variant: string;
    prevShow: string;
    currentShow: string;
    endCount: number;
    startCount: number;
    shrinkage: number;
    value: number;
}

export interface TourStats {
    totalSold: number;
    totalRevenue: number;
    totalShrinkage: number;
    totalShrinkageValue: number;
    avgPerShow: number;
}

export interface TopSellingItem {
    name: string;
    totalSold: number;
    totalRevenue: number;
    variants: VariantSales[];
}
