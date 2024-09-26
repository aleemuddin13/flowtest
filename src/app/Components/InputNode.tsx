'use client'
import { memo } from "react";
import { Position, Handle } from "@xyflow/react";
import { NodeType } from "@/types";

export default memo(function InputNode(node: NodeType) {
    const data = node.data
    const handleCodeChange = (event: any) => {
        data.onCodeChange(node.id, event.target.value);
    };
    let border = '1px solid #ddd'
    if (node.data.isProcessing) {
        border = '5px solid green'
    }
    let outputBorder = ''
    if (node.data.error) {
        outputBorder = '2px solid red'
    }
    return (
        <div style={{ background: '#fff', border: border, padding: '10px', borderRadius: '5px', width: '300px' }}>
            <Handle type="target" position={Position.Top} />
            <div style={{ background: '#f0f0f0', padding: '5px', whiteSpace: 'pre-wrap', textAlign: 'center' }}>
                {node.id}
            </div>
            <textarea
                disabled={node.data.isDisabled}
                value={data.code}
                onChange={handleCodeChange}
                placeholder="Enter Python code here..."
                style={{
                    width: '100%',
                    minHeight: '150px',
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    resize: 'vertical'
                }}
            />
            <div style={{ marginTop: '10px', background: '#f0f0f0', border: outputBorder, padding: '5px', minHeight: '50px', whiteSpace: 'pre-wrap' }}>
                {data.output ? data.output : 'Output:'}
            </div>
            <Handle type="source" position={Position.Bottom} />
        </div>
    );
})