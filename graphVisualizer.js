class GraphVisualizer{
    constructor(container){
        this.Container = container;
        this.IsDirected = false;
        this.IsWeighted = false;
        this.HasLoops = false;
        this.Nodes = new vis.DataSet();
        this.Edges = new vis.DataSet();
        this.Network;
    }

    #cloneGraph(){
        const cloneNodes = new vis.DataSet(this.Nodes.get());
        const cloneEdges = new vis.DataSet(this.Edges.get());

        const newGraph = new GraphVisualizer();
        newGraph.Nodes = cloneNodes;
        newGraph.Edges = cloneEdges;
        
        // const data = {
        //     nodes: cloneNodes,
        //     edges: cloneEdges
        // }
        // // TODO: in the isBridge function more specific in the isConnected function we are trying to get the neighbors from the Network attribute 
        // // ! the problem the line below affects the original Network(this attribute is responsible for displaying the graph)
        // newGraph.Network = new vis.Network(null, data, {});

        return newGraph;
    }

    // From here are the function for graph manipulation
    addNode(nodeId, nodeLabel){this.Nodes.add({id: nodeId, label: nodeLabel});}
    // startNode and endNode are the nodeId, the vis.js library identifies the nodes by the id
    // weight take an integer but to display with weight the vis.js library needs string values and not int 
    addEdge(startNode, endNode){this.Edges.add({from: startNode, to: endNode});}
    addEdgeWithWeight(startNode, endNode, weight){this.Edges.add({from: startNode, to: endNode, label: weight.toString()});}
    clearEdges(){this.Edges.clear();}
    clearNodes(){this.Nodes.clear();}

    getRandomNode(){return this.Nodes.getIds()[Math.floor(Math.random() * this.Nodes.length)];}
    doesNodeExists(label){return this.findNodeIdByLabel(label) != null ? true: false;}

    findEdgeId(startNode, endNode){
        const edges = this.Edges.get({ filter: edge => edge.from === startNode && edge.to === endNode });
        return edges.length > 0 ? edges[0].id : undefined;
    }

    findNodeIdByLabel(label){
        const nodes = this.Nodes.get();
        for (const node of nodes){
            if(node.label == label){return node.id}
        }
        return null;
    }

    findNodeLabelById(id){
        const node = this.Nodes.get();
        for(const node of nodes){
            if(node.id == id){return node.label}
        }
    }

    getNodeDegree(nodeId){
        let degree = 0;
        this.Edges.forEach(edge => {
            if(edge.from == nodeId || edge.to == nodeId) degree+=1;
        })
        return degree;
    }

    getNeighbors(nodeId) {
        const neighbors = [];
        this.Edges.forEach(edge => {
            if (edge.from === nodeId) {
                neighbors.push(edge.to);
            } else if (edge.to === nodeId) {
                neighbors.push(edge.from);
            }
        });
        return neighbors;
    }

    removeWeightFromEdges(){
        if(!this.IsWeighted){
            this.Edges.forEach(edge => {
                delete edge.label;
            })
        }
    }

    removeLoops(){
        if(!this.HasLoops){
            const edgesWithNoLoops = this.Edges.get().filter(edge => edge.from !== edge.to);
            this.clearEdges();
            this.Edges.add(edgesWithNoLoops);
        }
    }

    removeEdge(startNode, endNode){
        const edgeId = this.findEdgeId(startNode, endNode);
        if (edgeId !== undefined){
            this.Edges.remove(edgeId);
            // this.Network.redraw();
            return;
        } 
        
        try{
            this.Edges.remove(this.findEdgeId(endNode, startNode));
            // this.Network.redraw();
            return;
        } catch (error){
            console.log(error); 
        }
    }

    removeNode(nodeId){
        if (typeof nodeId === 'string'){
            nodeId = parseInt(nodeId);
        }

        this.Nodes.remove(nodeId);

        this.updateGraph();
    }

    createNetwork(){
        var container = document.getElementById(this.Container);
        var data = {
            nodes: this.Nodes,
            edges: this.Edges,
        };
        // If the graph has directed edges we display them
        if(this.IsDirected){
            var options = {
                edges:{
                    arrows: "to"
                }
            };
        }
        else{ var options = {}; }
        this.Network = new vis.Network(container, data, options);
    }

    updateGraph(){
        this.removeWeightFromEdges();
        this.removeLoops();
        this.createNetwork();
    }

    dijkstrasAlgorithm(startNodeLabel, endNodeLabel){
        const startNodeId = this.findNodeIdByLabel(startNodeLabel);
        const endNodeId = this.findNodeIdByLabel(endNodeLabel);

        // Initialize distances with infinity for all nodes except the start node
        const distances = {};
        this.Nodes.forEach(node => {
            distances[node.id] = node.id === startNodeId ? 0 : Infinity;
        });

        const visited = new Set();
        const queue = new PriorityQueue();

        queue.enqueue(startNodeId, 0);

        const previous = {};

        while (!queue.isEmpty()){
            const currentNodeId = queue.dequeue().element;

            if (currentNodeId === endNodeId) {
                let path = [];
                let current = endNodeId;
                while (current !== startNodeId) {
                    path.unshift(current);
                    current = previous[current];
                }
                path.unshift(startNodeId);
                return [this.convertPathToLabels(path), distances[endNodeId]];
            }

            visited.add(currentNodeId);

            const neighbors = this.Network.getConnectedNodes(currentNodeId);
            neighbors.forEach(neighborId =>{
                if (!visited.has(neighborId)) {
                    const edge = this.Edges.get({
                        filter: item => (item.from === currentNodeId && item.to === neighborId) ||
                            (item.to === currentNodeId && item.from === neighborId)
                    })[0];
                    const weight = edge ? parseInt(edge.label || 1) : 1;
                    const distanceToNeighbor = distances[currentNodeId] + weight;
                    if (distanceToNeighbor < distances[neighborId]) {
                        distances[neighborId] = distanceToNeighbor;
                        previous[neighborId] = currentNodeId;
                        queue.enqueue(neighborId, distanceToNeighbor);
                    }
                }
            });
        }

        return console.log("Path not found.");
    }

    convertPathToLabels(path){
        const labels = [];
        path.forEach(nodeId => {
            const node = this.Nodes.get(nodeId);
            if (node) {
                labels.push(node.label);
            }
        });
        return labels.join("->");
    }
}