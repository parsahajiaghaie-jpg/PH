
export interface ChatMessage {
    sender: 'user' | 'bot';
    text: string;
    products?: Product[];
}

export interface Product {
    itemName: string;
    url: string;
    price: string;
}

export interface Style {
    name: string;
    imageUrl: string;
}

export enum AppState {
    INITIAL = 'INITIAL',
    IMAGE_UPLOADED = 'IMAGE_UPLOADED',
    GENERATING = 'GENERATING',
    IMAGE_GENERATED = 'IMAGE_GENERATED',
}
