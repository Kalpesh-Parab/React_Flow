import React, { useState, useCallback } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import axios from 'axios';

const initialNodes = [
  {
    id: '1',
    type: 'default',
    position: { x: 250, y: 5 },
    data: { label: 'Lead Source' },
  },
];

const App = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Handle connections between nodes
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Add a new node dynamically
  const addNode = () => {
    const newNode = {
      id: `${nodes.length + 1}`,
      type: 'default',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { label: `New Node ${nodes.length + 1}` },
    };
    setNodes((prevNodes) => [...prevNodes, newNode]);
  };

  // Delete the last node (safe delete)
  const deleteNode = () => {
    if (nodes.length > 1) {
      setNodes((prevNodes) => prevNodes.slice(0, -1));
    } else {
      alert('You must keep at least one node in the flowchart.');
    }
  };

  // Save flowchart to backend
  const saveFlowchart = async () => {
    try {
      await axios.post('http://localhost:5000/api/saveFlowchart', {
        nodes,
        edges,
      });
      alert('✅ Flowchart Saved Successfully');
    } catch (error) {
      console.error('Error saving flowchart:', error);
      alert('❌ Error Saving Flowchart');
    }
  };

  // Schedule an email via backend
  const scheduleEmail = async () => {
    try {
      await axios.post('http://localhost:5000/api/scheduleEmail', {
        to: 'recipient@example.com',
        subject: 'Test Email from Flowchart App',
        text: 'Hello! This is a scheduled email test.',
        delay: 'in 1 minute',
      });
      alert('✅ Email Scheduled Successfully');
    } catch (error) {
      console.error('Error scheduling email:', error);
      alert('❌ Error Scheduling Email');
    }
  };

  return (
    <div style={{ height: '100vh' }}>
      <div style={{ marginBottom: '10px' }}>
        <button onClick={addNode}>➕ Add Node</button>
        <button onClick={deleteNode}>❌ Delete Node</button>
        <button onClick={saveFlowchart}>💾 Save Flowchart</button>
        <button onClick={scheduleEmail}>📧 Schedule Email</button>
      </div>

      {/* Interactive Flowchart Canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
};

export default App;
