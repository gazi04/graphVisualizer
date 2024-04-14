// Get the input field
var input = document.getElementById("commandInput");

// Execute the command when the user presses Enter
input.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        executeCommand();
    }
});

function addToOutput(text){
    const outputDiv = document.getElementById("output");
    outputDiv.innerHTML += `<div>${text}</div>`;
    outputDiv.scrollTop = output.scrollHeight;
}

function executeCommand() {
    var userInput = input.value.trim().toLowerCase();

    // Split the user input into command and arguments
    var parts = userInput.split(' ');
    var command = parts[0];
    var args = parts.slice(1);

    switch (command) {
        case 'shto':
            if(args != null){ addNode(args, getCurrentGraph()); }
            else{ addToOutput("Ju duhet te jepni nyjen."); }
            break;
        case "shkalla":
            if(args[0] == null){ addToOutput("Ju duhet te jepni nyjen"); }
            else{ nodeDegree(args[0], getCurrentGraph()); }
            break;
        case "fqinjet":
            nodeNeighbours(args[0], getCurrentGraph());
            break;
        case "lidh":
            connectNodes(args[0], args[1], args[2], getCurrentGraph());
            break;
        case "qlidh":
            disconnectNodes(args[0], args[1], getCurrentGraph());
            break;
        case "t":
            visualizer.redrawGraph()
            break;
        default:
            // Handle unknown command
            addToOutput('Unknown command:' + command);
    }

    // Clear the input field after executing the command
    input.value = '';
}

function getCurrentGraph(){
    if(currentGraphType == "simple"){return graph;}
    if(currentGraphType == "pseudo"){return pseudoGraph;}
    if(currentGraphType == "directed"){return diagraph;}
    if(currentGraphType == "weighted"){return weightedGraph;}
}

function displayEdges(graph) {
    graph.forEachEdge(
    (edge, attributes, source, target, sourceAttributes, targetAttributes) => {
        console.log(`Edge from ${source} to ${target}`);
    });
}

function disconnectNodes(fromNodeLabel, toNodeLabel, graph){
    const nodeData = graph._attributes;

    // It validates the node parameters that are given
    if(fromNodeLabel == null || toNodeLabel == null){
        addToOutput("Duhen te jepni dy nyje qe jane ne graf, per te lidhur ato.");
        return;
    }

    // It finds the id of the starting and ending node, because for manipulation we need the id of the node
    const fromNodeId = Object.keys(nodeData).find(key => nodeData[key] === fromNodeLabel);
    const toNodeId = Object.keys(nodeData).find(key => nodeData[key] === toNodeLabel);

    if(fromNodeId == null){ addToOutput(`Nyja '${fromNodeLabel}' nuk gjendet ne graf.`); return;}
    if(toNodeId == null){ addToOutput(`Nyja '${toNodeLabel}' nuk gjendet ne graf.`); return;}

    if(graph.hasEdge(fromNodeId, toNodeId)){
        graph.dropEdge(fromNodeId, toNodeId);
        visualizer.removeEdge(parseInt(fromNodeId), parseInt(toNodeId));
        console.log(`${fromNodeId} dhe ${toNodeId} jane qlidhur.`);
    }
    else if(graph.hasEdge(toNodeId, fromNodeId)){
        graph.dropEdge(toNodeId, fromNodeId);
        visualizer.removeEdge(parseInt(toNodeId), parseInt(fromNodeId));
        console.log(`${toNodeId} dhe ${fromNodeId} jane qlidhur.`);
    }
    else{ console.log(`Keto dy nyje nuk jane te lidhura.`); }
}

function connectNodes(fromNodeLabel, toNodeLabel, weight, graph){
    const nodeData = graph._attributes;
    
    // Validates the nodes given
    if(fromNodeLabel == null || toNodeLabel == null){
        addToOutput("Duhen te jepni dy nyje qe jane ne graf, per te lidhur ato.");
        return;
    }

    //  It checks if the nodes are the same if so they are not allowed in a simple graph
    if((fromNodeLabel == toNodeLabel) && currentGraphType == "simple"){
        addToOutput("Ne nje graf te thjesht nuk lejohen laqet.");
        return;
    }

    // It validates the weight parameter if it is an integer for the weighted graph
    if(currentGraphType == "weighted" && weight != null){
        weight = parseInt(weight);
        if(!Number.isInteger(weight)) {
            addToOutput("Per peshen duhet te jepet nje numer i plote.");
            return;
        } 
    }
    else if(currentGraphType == "weighted" && weight == null){
        addToOutput("Duhet te jepet edhe pesha per degen.");
        return;
    } 

    // It finds the id of the starting and ending node, because for manipulation we need the id of the node
    const fromNodeId = Object.keys(nodeData).find(key => nodeData[key] === fromNodeLabel);
    const toNodeId = Object.keys(nodeData).find(key => nodeData[key] === toNodeLabel);

    // Check if an edge already exists from fromNode to toNode for the simple graph
    // if ((graph.hasDirectedEdge(fromNodeId, toNodeId) || graph.hasDirectedEdge(toNodeId, fromNodeId)) && currentGraphType == "simple") {
    //     addToOutput(`Ekziston brinja qe lidh nyjen '${fromNodeLabel}' me '${toNodeLabel}'.`);
    //     return;
    // }

    if(fromNodeId == null){ addToOutput(`Nyja '${fromNodeLabel}' nuk gjendet ne graf.`); return;}
    if(toNodeId == null){ addToOutput(`Nyja '${toNodeLabel}' nuk gjendet ne graf.`); return;}

    try {
        if(currentGraphType == "weighted"){
            graph.addEdge(fromNodeId, toNodeId, {value: weight});
            visualizer.addEdgeWithWeight(fromNodeId,  toNodeId, weight)
        }
        else{
            graph.addEdge(fromNodeId, toNodeId);
            visualizer.addEdge(fromNodeId, toNodeId);
        } 
        addToOutput("Lidhja eshte kryer me sukses.");
    } catch (error) {
        console.error("Error adding edge:", error);
        addToOutput("Gabim gjate lidhjes se nyjeve.");
    } 
}

function addNode(args, graph){
    const nodeData = graph._attributes;
    
    if(args[0] == undefined){
        addToOutput("Nevojitet emri per nyjen, per ta shtuar nyjen ne graf.");
        return;
    } 
    
    // Checking if the given label is used, if there is an existing node with that label don't add it in the graph
    const nodeIdExists = Object.keys(nodeData).find(key => nodeData[key] === args[0])
    if(nodeIdExists !== undefined){
        addToOutput(`Nyja '${args[0]}' ekziston tashme ne graf.`);
        return;
    }
   
    const nodeId = graph.nodes().length + 1;
    addToOutput(`Ti ke shtuar ne graf nyjen '${args[0]}'`);
    graph.addNode(nodeId);
    graph.setAttribute(nodeId, args[0]);
    visualizer.addNode(nodeId, args[0]);
    visualizer.Network.redraw();
}

// The label is for the node, typeGraph is one the types of graphs where the node is in 
function nodeDegree(label, graph){
    const nodeData = graph._attributes;

    const nodeId = Object.keys(nodeData).find(key => nodeData[key] === label);
    
    if(nodeId == undefined){
        addToOutput(`Nyja '${label}' nuk gjendet ne graf.`)
        return;
    }
    addToOutput(`Nyje '${label}' ka shkallen: `+ graph.degree(nodeId));
}

function nodeNeighbours(label, graph){
    const nodeData = graph._attributes;
    const nodeId = Object.keys(nodeData).find(key => nodeData[key] === label);

    if(!graph.hasNode(nodeId)){
        addToOutput(`Nyja '${label}' nuk gjendet ne graf.`);
        return;
    }

    if(graph.hasNode(nodeId)){
        const neighbors = graph.neighbors(nodeId);
        let text = `Fqinjet e nyjes ${nodeData[nodeId]} jane: `;

        for (let i = 0; i < neighbors.length; i++) {
            text += nodeData[neighbors[i]];
            if (i < neighbors.length - 1) {
                text += ', '; 
            }
        }
        addToOutput(text);
    }
}