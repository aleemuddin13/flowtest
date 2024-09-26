export interface FlowType {
    nodes: object[]
    edges: object[]
}


export interface NodeType {
    id: string
    data: {
        label: string,
        onCodeChange?: () => void,
        color?: string
    }
}