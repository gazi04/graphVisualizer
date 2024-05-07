var input = document.getElementById("commandInput");

input.addEventListener("keydown", function(event){
    if (event.key === "Enter"){
        executeCommand();
    }
});

function addToOutput(text){
    const outputDiv = document.getElementById("output");
    if (Array.isArray(text)){
        const matrixString = text.map(row => row.join('\t')).join('\n');
        outputDiv.innerHTML += `<pre>${matrixString}</pre>`;
    } else{
        outputDiv.innerHTML += `<div>${text}</div>`;
    }
    outputDiv.scrollTop = output.scrollHeight;
}


function executeCommand(){
    var userInput = input.value.trim().toLowerCase();

    var parts = userInput.split(' ');
    var command = parts[0];
    var args = parts.slice(1);

    switch (command){
        case 'shto':
            if(args != null){ addNode(args, getCurrentGraph()); }
            else{ addToOutput("Ju duhet te jepni nyjen."); }
            break;
        case "shkalla":
            if(args[0] == null){ addToOutput("Ju duhet te jepni nyjen"); }
            else{ nodeDegree(args[0], getCurrentGraph()); }
            break;
        case "fqinjet":
            printNodeNeighbours(args[0], getCurrentGraph());
            break;
        case "lidh":
            connectNodes(args[0], args[1], args[2], getCurrentGraph());
            break;
        case "qlidh":
            disconnectNodes(args[0], args[1], getCurrentGraph());
            break;
        case "dijkstra":
            if(currentGraphType != "weighted"){
                addToOutput("Duhet te selektohet grafi me peshe.");break; 
            }

            if(args[0] == "" || args[1] == ""){
                addToOutput("Duhen te jepen dy nyje, per te gjetur rrugen me te shkurter.");break;
            }

            if(!visualizer.doesNodeExists(args[0]) && !visualizer.doesNodeExists(args[1])){
                addToOutput("Njera nga nyjet e dhena nuk ekzistion ne graf.");break;
            }

            const pathAndCost = visualizer.dijkstrasAlgorithm(args[0], args[1]);
            addToOutput("Rruga me e shkurter eshte: " + pathAndCost[0]);
            addToOutput("Me koston " + pathAndCost[1]); 
            break;
        case "shtegu-eulerit":
            if(currentGraphType == "directed" || currentGraphType == "weighted"){
                addToOutput("Qarku eulerit nuk mund te gjindet tek grafi i orientuar dhe tek grafi me peshe.");
                break;
            }
            const path = findEulerianPath(graph)
             
            addToOutput(("Qarku Eulerit: " + path.join(" -> ")));
            break;
        case "qarku-eulerit":
            if(currentGraphType == "directed" || currentGraphType == "weighted"){
                addToOutput("Qarku eulerit nuk mund te gjindet tek grafi i orientuar dhe tek grafi me peshe.");
                addToOutput(currentGraphType);
                break;
            }
            const circuit = findEulerianCircuit(graph)
            let text = "Qarku Eulerit: " + circuit.join(" -> ");
            addToOutput(text);
            break;
        case "matrica-fqinjesis":
            addToOutput(adjacencyMatrix(getCurrentGraph()));
            break;
        case "matrica-incidences":
            addToOutput(incidenceMatrix(getCurrentGraph()));
            break;
        default:
            addToOutput('Unknown command:' + command);
    }

    input.value = '';
}

function getCurrentGraph(){
    if(currentGraphType == "simple"){return graph;}
    if(currentGraphType == "pseudo"){return pseudoGraph;}
    if(currentGraphType == "directed"){return diagraph;}
    if(currentGraphType == "weighted"){return weightedGraph;}
}

function displayEdges(graph){
    graph.forEachEdge(
    (edge, attributes, source, target, sourceAttributes, targetAttributes) => {
        console.log(`Edge from ${source} to ${target}`);
    });
}

function disconnectNodes(fromNode, toNode, graph){
    const nodeData = graph._attributes;

    if(fromNode == null || toNode == null){
        addToOutput("Duhen te jepni dy nyje qe jane ne graf, per te lidhur ato.");
        return;
    }

    const fromNodeId = Object.keys(nodeData).find(key => nodeData[key] === fromNode);
    const toNodeId = Object.keys(nodeData).find(key => nodeData[key] === toNode);

    if(fromNodeId == null){ addToOutput(`Nyja '${fromNode}' nuk gjendet ne graf.`); return;}
    if(toNodeId == null){ addToOutput(`Nyja '${toNode}' nuk gjendet ne graf.`); return;}

    if(currentGraphType == "directed"){
        if(!graph.hasDirectedEdge(fromNodeId, toNodeId)){ addToOutput(`Nyja ${fromNode} nuk eshte e lidhur me nyjen ${toNode}.`); return;}

        graph.dropEdge(fromNodeId, toNodeId);
        visualizer.removeEdge(fromNodeId, toNodeId);
        return;
    }

    try{
        if(graph.hasEdge(fromNodeId, toNodeId)){
            graph.dropEdge(fromNodeId, toNodeId);
            visualizer.removeEdge(fromNodeId, toNodeId);
        }
        else{
            graph.dropEdge(toNodeId, fromNodeId);
            visualizer.removeEdge(toNodeId, fromNodeId);
        }
    } catch (error){
        addToOutput(`Nyja ${fromNode} dhe ${toNode} nuk jane te lidhura.`);
    }
}

function connectNodes(fromNodeLabel, toNodeLabel, weight, graph){
    const nodeData = graph._attributes;
    
    if(fromNodeLabel == null || toNodeLabel == null){
        addToOutput("Duhen te jepni dy nyje qe jane ne graf, per te lidhur ato.");
        return;
    }

    if((fromNodeLabel == toNodeLabel) && currentGraphType == "simple"){
        addToOutput("Ne nje graf te thjesht nuk lejohen laqet.");
        return;
    }

    if(currentGraphType == "weighted" && weight != null){
        weight = parseInt(weight);
        if(!Number.isInteger(weight)){
            addToOutput("Per peshen duhet te jepet nje numer i plote.");
            return;
        } 
    }
    else if(currentGraphType == "weighted" && weight == null){
        addToOutput("Duhet te jepet edhe pesha per degen.");
        return;
    } 

    const fromNodeId = Object.keys(nodeData).find(key => nodeData[key] === fromNodeLabel);
    const toNodeId = Object.keys(nodeData).find(key => nodeData[key] === toNodeLabel);

    if(fromNodeId == null){ addToOutput(`Nyja '${fromNodeLabel}' nuk gjendet ne graf.`); return;}
    if(toNodeId == null){ addToOutput(`Nyja '${toNodeLabel}' nuk gjendet ne graf.`); return;}

    try{
        if(currentGraphType == "weighted"){
            graph.addEdge(fromNodeId, toNodeId, {value: weight});
            visualizer.addEdgeWithWeight(fromNodeId, toNodeId, weight)
            addToOutput("Lidhja eshte kryer me sukses.");
            return;
        }

        graph.addEdge(fromNodeId, toNodeId);
        visualizer.addEdge(fromNodeId, toNodeId);
        addToOutput("Lidhja eshte kryer me sukses.");
    } catch (error){
        addToOutput("Gabim gjate lidhjes se nyjeve.");
    } 
}

function addNode(args, graph){
    const nodeData = graph._attributes;
    
    if(args[0] == undefined){
        addToOutput("Nevojitet emri per nyjen, per ta shtuar nyjen ne graf.");
        return;
    } 
    
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
}

function nodeDegree(node, graph){
    const nodeData = graph._attributes;
    const nodeId = Object.keys(nodeData).find(key => nodeData[key] === node);
    
    if(nodeId == undefined){
        addToOutput(`Nyja '${node}' nuk gjendet ne graf.`)
        return;
    }

    addToOutput(`Nyje '${node}' ka shkallen: `+ graph.degree(nodeId));
}

function printNodeNeighbours(node, graph){
    const nodeData = graph._attributes;
    const nodeId = Object.keys(nodeData).find(key => nodeData[key] === node);

    if(!graph.hasNode(nodeId)){
        addToOutput(`Nyja '${node}' nuk gjendet ne graf.`);
        return;
    }

    const neighbors = graph.neighbors(nodeId);
    let text = `Fqinjet e nyjes ${nodeData[nodeId]} jane: `;

    for(let i = 0; i < neighbors.length; i++){
        text += nodeData[neighbors[i]];
        if (i < neighbors.length - 1){
            text += ', '; 
        }
    }
    addToOutput(text);
}

function adjacencyMatrix(graph){
    const nodeData = graph._attributes;
    const nodes = Object.keys(nodeData);
    const matrix = [];

    for(let i = -1; i < nodes.length; i++){
        matrix[i + 1] = [];
        for (let j = -1; j < nodes.length; j++){
            if (i === -1 && j === -1){
                matrix[i + 1][j + 1] = '';
            } else if (i === -1){
                matrix[i + 1][j + 1] = nodeData[nodes[j]];
            } else if (j === -1){
                matrix[i + 1][j + 1] = nodeData[nodes[i]];
            } else{
                matrix[i + 1][j + 1] = 0;
            }
        }
    }

    for(let i = 0; i < nodes.length; i++){
        const nodeId = nodes[i];
        const neighbors = graph.neighbors(nodeId);

        for(let j = 0; j < neighbors.length; j++){
            const neighborId = neighbors[j];
            const neighborIndex = nodes.indexOf(neighborId);
            matrix[i + 1][neighborIndex + 1] = 1;
        }
    }

    return matrix;
}

function incidenceMatrix(graph){
    const nodeData = graph._attributes;
    const nodes = Object.keys(nodeData);
    const edges = graph.edges();
    const matrix = [];

    for(let i = 0; i < nodes.length; i++){
        matrix[i] = [nodeData[nodes[i]]];
        for (let j = 1; j < edges.length+1; j++){ matrix[i][j] = 0; }
    }

    if(currentGraphType == "directed"){
        for(let row = 0; row < nodes.length; row++){
            let col = 1;
            graph.forEachEdge((edge, attributes, source, target) => {
                if(nodes[row] == source) matrix[row][col] = 1;
                else if(nodes[row] == target) matrix[row][col] = -1;

                col++;
            });
        }

        return matrix;
    }

    for(let row = 0; row < nodes.length; row++){
        let col = 1;
        graph.forEachEdge((edge, attributes, source, target) => {
            if(nodes[row] == source && nodes[row] == target) matrix[row][col] = 2;
            else if(nodes[row] == source) matrix[row][col] = 1;
            else if(nodes[row] == target) matrix[row][col] = 1;
            
            col++;
        })
    }

    return matrix;
}

function convertNodeIdIntoNodeLabel(nodeId, graph){
    const nodeData = graph._attributes;
    return nodeData[nodeId];
}

function cloneGraph(originalGraph){
    const clonedGraph = new graphology.Graph();

    originalGraph.forEachNode(node => {
        clonedGraph.addNode(node);
    });

    originalGraph.forEachEdge(
    (edge, attributes, source, target, sourceAttributes, targetAttributes) => {
        clonedGraph.addEdge(source, target, { ...attributes });
    });

    return clonedGraph;
}

function isGraphEulerian(graph){
    let oddDegreeCount = 0;
    graph.forEachNode(node => {
        if (graph.degree(node) % 2 !== 0){
            oddDegreeCount++;
        }
    });
    return oddDegreeCount === 0;
}

function findEulerianCircuit(graph){
    if (!isGraphEulerian(graph)){
        addToOutput("Grafi nuk eshte graf eulerian, sepse nyjet e atij grafi duhen te jene me shkalle qift.");
    }

    const edges = [];
    const circle = [];
    const startNode = graph.nodes()[0];
    let currentNode = startNode;

    graph.forEachEdge((edge, attr, source, target) => {
        edges.push({ startNode: source, endNode: target });
    });

    while (edges.length > 0){
        circle.push(currentNode);
        const nextEdgeIndex = edges.findIndex(edge => edge.startNode === currentNode);
        if (nextEdgeIndex !== -1){
            const nextEdge = edges.splice(nextEdgeIndex, 1)[0];
            currentNode = nextEdge.endNode;
        } else{
            const i = edges.findIndex(edge => edge.endNode === currentNode);

            if(i !== -1){
                currentNode = edges.splice(i, 1)[0].startNode;
            }
            else{
                // If no next edge is found, backtrack to find a node with remaining edges
                for (let i = circle.length - 1; i >= 0; i--){
                    const node = circle[i];
                    const remainingEdges = edges.filter(edge => edge.startNode === node || edge.endNode === node);
                    if (remainingEdges.length > 0){
                        currentNode = node;
                        break;
                    }
                }
            }
        }
    }

    circle.push(currentNode);

    for(let index = 0; index < circle.length; index++){
        circle[index] = convertNodeIdIntoNodeLabel(circle[index], graph)
    }

    return circle;
}

function hasEulerianPath(graph){
    let oddDegreeCount = 0;
    graph.forEachNode(node =>{
        if (graph.degree(node) % 2 !== 0){
            oddDegreeCount++;
        }
    });
    return oddDegreeCount === 2;
}

function findEulerianPathRecursive(graph, startNode, eulerianPath){
    const neighbors = graph.neighbors(startNode);

    while (neighbors.length > 0){
        const nextNode = neighbors.shift();
        const edge = graph.hasEdge(startNode, nextNode) ? [startNode, nextNode] : [nextNode, startNode];

        if (graph.hasEdge(edge[0], edge[1])){
            graph.dropEdge(edge[0], edge[1]);

            findEulerianPathRecursive(graph, nextNode, eulerianPath);
        }
    }

    eulerianPath.push(startNode);
}

function findEulerianPath(graph){
    if (!hasEulerianPath(graph)){
        addToOutput('Grafi nuk ka shteg te eulerit.');
    }

    const oddDegreeNodes = [];
    const eulerianPath = [];

    graph.forEachNode(node => {
        if (graph.degree(node) % 2 === 1){
            oddDegreeNodes.push(node);
        }
    });

    const startNode = oddDegreeNodes[0];

    findEulerianPathRecursive(graph, startNode, eulerianPath);
    eulerianPath.reverse();

    for(let nodeIndex = 0; nodeIndex < eulerianPath.length; nodeIndex++){
        eulerianPath[nodeIndex] = convertNodeIdIntoNodeLabel(eulerianPath[nodeIndex], graph);
    }

    return eulerianPath;
}