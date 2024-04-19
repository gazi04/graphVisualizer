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

    // From here are the function for graph manipulation
    addNode(nodeId, nodeLabel){this.Nodes.add({id: nodeId, label: nodeLabel});}

    // startNode and endNode are the nodeId, the vis.js library identifies the nodes by the id
    // weight take an integer but to display with weight the vis.js library needs string values and not int 
    addEdge(startNode, endNode){this.Edges.add({from: startNode, to: endNode});}
    addEdgeWithWeight(startNode, endNode, weight){this.Edges.add({from: startNode, to: endNode, label: weight.toString()});}
    clearEdges(){this.Edges.clear();}
    clearNodes(){this.Nodes.clear();}

    findEdgeId(startNode, endNode) {
        const edges = this.Edges.get({ filter: edge => edge.from === startNode && edge.to === endNode });
        return edges.length > 0 ? edges[0].id : undefined;
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
        if (edgeId !== undefined) {
            this.Edges.remove(edgeId);
            // this.Network.redraw();
            return;
        } 
        
        try {
            this.Edges.remove(this.findEdgeId(endNode, startNode));
            // this.Network.redraw();
            return;
        } catch (error) {
            console.log(error); 
        }
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
}

class PriorityQueue {
    constructor() {
        this.elements = [];
    }

    enqueue(element, priority) {
        this.elements.push({ element: element, priority: priority });
        this.elements.sort((a, b) => a.priority - b.priority);
    }

    dequeue() {
        return this.elements.shift();
    }

    isEmpty() {
        return this.elements.length === 0;
    }
}