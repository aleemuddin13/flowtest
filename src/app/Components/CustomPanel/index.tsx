'use client'
import { Panel, useEdges, useNodes } from "@xyflow/react";
import { useCallback } from "react";

interface AddNodePropsType {
    onAddNode: (event: any) => void,
    isExecuting: boolean,
    onExecute: () => void
}

export default function AddNode(input: AddNodePropsType) {
    const nodes = useNodes()
    const edges = useEdges()
    const exportCallBack = useCallback(async () => {
        const result = await fetch('/api/flow', {
            method: 'POST', headers: {
                'Content-Type': 'application/json'
            }, body: JSON.stringify({ nodes, edges })
        })
        alert("Flow Exported/Saved")
    }, [nodes, edges])



    return (
        <Panel position="top-left">
            <button className="btn btn-primary" onClick={input.onAddNode} style={{ margin: '5px' }}>Add Node</button>

            <button className="btn btn-success" onClick={exportCallBack} style={{ margin: '5px' }}>Export/Save</button>

            <button className="btn btn-accent" onClick={input.onExecute} style={{ margin: '5px' }}>{input.isExecuting ? 'executing...' : 'execute'}</button>
        </Panel>
    )
}