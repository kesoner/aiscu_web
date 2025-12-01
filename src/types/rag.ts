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
