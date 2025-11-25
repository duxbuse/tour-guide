export enum Category {
    APPAREL = 'APPAREL',
    ACCESSORIES = 'ACCESSORIES',
    MEDIA = 'MEDIA'
}

export interface MerchVariant {
    id: string;
    size: string;
    type: string | null;
    price: number;
    quantity: number;
}

export interface MerchItem {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    category?: string;
    variants: MerchVariant[];
}

export interface Show {
    id: string;
    name: string;
    date: string;
    venue: string | null;
}

export interface Tour {
    id: string;
    name: string;
    shows: Show[];
}

export interface InventoryRecord {
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
