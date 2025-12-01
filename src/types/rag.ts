export interface DocumentChunk {
    id: string;
    text: string;
    embedding: number[];
    metadata: {
        title: string;
        category: string;
    };
}

export interface AgentStep {
    type: 'log' | 'answer';
    message: string;
    source?: string;
}

export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
    timestamp: number;
    relatedChunks?: string[];
}

export enum ProcessingStatus {
    IDLE = 'IDLE',
    PROCESSING = 'PROCESSING',
    COMPLETED = 'COMPLETED',
    ERROR = 'ERROR'
}
