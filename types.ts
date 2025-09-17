export enum AppMode {
    GENERATE = 'GENERATE',
    EDIT = 'EDIT',
    VIDEO = 'VIDEO',
    SEARCH = 'SEARCH',
}

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';

export interface GroundingSource {
    uri: string;
    title: string;
}

export interface HistoryItem {
    id: string;
    mode: AppMode;
    prompt: string;
    negativePrompt?: string;
    aspectRatio?: AspectRatio;
    inputImage?: string; // base64 encoded image data
    inputImageMimeType?: string;
    outputImage?: string; // base64 string
    outputVideo?: string; // url
    outputText?: string;
    timestamp: number;
    groundingSources?: GroundingSource[];
}