'use client'
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { ReactFlow, useNodesState, useEdgesState, addEdge, Controls, MiniMap, Background, useEdges } from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import InputNode from './Components/InputNode';
import { eventNames } from 'process';
import CustomPanel from './Components/CustomPanel'


const generateRandomId = () => {
  return `id-${Math.random().toString(36).substr(2, 9)}}`;
};

// const nodeTypes = {
//   inputnode: InputNode
// }

const initialNodes: Node[] = [
  { id: '1', position: { x: 0, y: 0 }, data: { label: 'Start' }, type: 'input' }
];
const initialEdges = [];

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isExecuting, setIsExecuting] = useState(false);

  const fetchFlowData = useCallback(async () => {
    const res = await fetch('/api/flow')
    const data = await res.json()
    setNodes(data.nodes)
    setEdges(data.edges)
  }, [])

  useEffect(() => {
    fetchFlowData()
  }, [fetchFlowData])

  const onConnect = useCallback(
    (params) => {
      const edgeExists = edges.some(edge => edge.source === params.source || edge.target === params.target)
      if (!edgeExists) {
        setEdges((eds) => addEdge(params, eds))
      } else {
        console.log(edges, params)
        alert("Only Single Edge Allowed.")
      }
    },
    [setEdges, edges],
  );

  const processNode = async (node) => {
    try {
      const response = await fetch('https://pybox-service-845305996241.us-central1.run.app/execute', {
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'post',
        body: JSON.stringify({ script: node.data.code })
      })
      const data = await response.json()
      if (data.success) {
        return { error: false, output: JSON.stringify(data.result, null, 2) }
      }
      return { error: true, output: data.error || data.stderr }
    } catch (error) {
      console.log(error)
    }


    // Simulate API call for processing a single node
    // await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
    return { error: true, output: `Unexpected Error` };
  }

  const getProcessingOrder = useCallback(() => {
    const visited = new Set();
    const order = [];
    const nodeIdMap = {}
    for (const node of nodes) {
      nodeIdMap[node.id] = node
    }
    const dfs = (nodeId) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      order.push(nodeIdMap[nodeId]);

      const outgoingEdges = edges.filter(edge => edge.source === nodeId);
      for (const edge of outgoingEdges) {
        dfs(edge.target);
      }
    };

    dfs('1'); // Start from the source node
    order.shift()
    return order;
  }, [edges, nodes]);

  const onAddNode = useCallback(() => {
    const id = generateRandomId()
    const newNode = {
      id,
      position: { x: 100, y: 100 },
      data: { label: id, code: '', output: '' },
      type: 'inputnode'
    }
    setNodes((nds) => [...nodes, newNode])
  }, [setNodes, nodes])

  const handleExecute = async () => {
    if (isExecuting) {
      return
    }
    setIsExecuting(true);

    const processingNodes = getProcessingOrder()
    const processingNodesIdMap = {}
    for (const node of processingNodes) {
      processingNodesIdMap[node.id] = true
    }

    // Disable all nodes
    setNodes((nds) =>
      nds.map((n) => {
        if (processingNodesIdMap[n.id]) {
          return {
            ...n,
            data: { ...n.data, isDisabled: true, isProcessing: false, output: '' },
          };
        }
        return n;
      })
    );



    // Process nodes in order
    for (const node of processingNodes) {

      // Highlight current node
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          data: { ...n.data, isProcessing: n.id === node.id },
        }))
      );

      // Process node
      const { error, output } = await processNode(node);

      // Update node with output
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === node.id) {
            return {
              ...n,
              data: { ...n.data, output, error, isProcessing: false },
            };
          }
          return n;
        })
      );
    }

    // Re-enable all nodes
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: { ...node.data, isDisabled: false },
      }))
    );

    setIsExecuting(false);
  };

  const updateNodeCode = useCallback((nodeId, newCode) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              code: newCode,
            },
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  const nodeTypes = useMemo(
    () => ({
      inputnode: (props) => (
        <InputNode
          {...props}
          data={{ ...props.data, onCodeChange: updateNodeCode }} // Pass the change handler
        />
      ),
    }),
    [updateNodeCode]
  );

  const onNodesDelete = useCallback(
    (nodesToDelete) => {
      for (const node of nodesToDelete) {
        if (node.id == '1') {
          alert("Please Don't delete start node, add edge again");
          new Promise((resolve) => {
            setTimeout(() => {
              resolve(setNodes((nds) => [...nds, { ...node }]))
            }, 1000)
          })
          break
        }
      }


      // setNodes((nds) => nds.filter((node) => !updatedNodesToDelete.find((n) => n.id === node.id)));
    },
    [setNodes]
  );


  return (
    <div className="flex h-screen" style={{ width: '100%' }}>
      <div style={{ width: '100vw', height: '100vh' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onConnect={onConnect}
          onNodesDelete={onNodesDelete}
          elementsSelectable={!isExecuting}
          nodesConnectable={!isExecuting}
        >
          <CustomPanel onAddNode={onAddNode} isExecuting={isExecuting} onExecute={handleExecute}></CustomPanel>
          <Controls />
          <MiniMap />
          <Background variant="dots" gap={12} size={1} />

        </ReactFlow>

      </div>
    </div>
  );
}