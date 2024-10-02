// State Management
let tree = null;
let targetOpportunity = null;
let selectedSolutions = [];

// Helper Functions
function createTreeNode(type, content) {
    return {
        id: Date.now().toString(),
        type,
        content,
        children: [],
    };
}

function renderTreeNode(node) {
    const nodeElement = document.createElement('div');
    nodeElement.className = 'tree-node';
    nodeElement.innerHTML = `
        <h3>${node.type.charAt(0).toUpperCase() + node.type.slice(1)}</h3>
        <p>${node.content}</p>
        ${node.type === 'opportunity' ? `<button onclick="setTargetOpportunity('${node.id}')">Select as Target</button>` : ''}
        ${node.type === 'solution' ? `<button onclick="selectSolution('${node.id}')">${selectedSolutions.includes(node.id) ? 'Deselect' : 'Select to Explore'}</button>` : ''}
        <button onclick="deleteNode('${node.id}')">Delete</button>
    `;

    if (node.children.length > 0) {
        const childrenContainer = document.createElement('div');
        childrenContainer.style.marginLeft = '20px';
        node.children.forEach(child => {
            childrenContainer.appendChild(renderTreeNode(child));
        });
        nodeElement.appendChild(childrenContainer);
    }

    return nodeElement;
}

function renderTree() {
    const treeContainer = document.getElementById('treeContainer');
    treeContainer.innerHTML = ''; // Clear existing tree
    if (tree) {
        treeContainer.appendChild(renderTreeNode(tree));
    }
}

function addNode(type) {
    const newItemContent = document.getElementById('newItemContent').value;
    if (!newItemContent) return; // Ignore empty input

    const newNode = createTreeNode(type, newItemContent);

    if (!tree) {
        // Add root outcome
        if (type === 'outcome') {
            tree = newNode;
        }
    } else {
        // Add children nodes to the tree
        if (type === 'opportunity' && tree) {
            tree.children.push(newNode);
        } else if (type === 'solution' && targetOpportunity) {
            const targetNode = findNode(tree, targetOpportunity);
            targetNode.children.push(newNode);
        } else if (type === 'test' && selectedSolutions.length > 0) {
            selectedSolutions.forEach(solutionId => {
                const solutionNode = findNode(tree, solutionId);
                solutionNode.children.push(createTreeNode('test', newItemContent));
            });
        }
    }

    document.getElementById('newItemContent').value = ''; // Clear input
    renderTree();
}

function findNode(node, id) {
    if (node.id === id) return node;
    for (const child of node.children) {
        const found = findNode(child, id);
        if (found) return found;
    }
    return null;
}

function deleteNode(id) {
    if (tree.id === id) {
        tree = null;
    } else {
        deleteNodeRecursive(tree, id);
    }
    renderTree();
}

function deleteNodeRecursive(node, id) {
    node.children = node.children.filter(child => child.id !== id);
    node.children.forEach(child => deleteNodeRecursive(child, id));
}

function setTargetOpportunity(id) {
    targetOpportunity = id;
    renderTree();
}

function selectSolution(id) {
    if (selectedSolutions.includes(id)) {
        selectedSolutions = selectedSolutions.filter(solutionId => solutionId !== id);
    } else if (selectedSolutions.length < 3) {
        selectedSolutions.push(id);
    }
    renderTree();
}

// Event Listeners
document.getElementById('addOutcomeButton').addEventListener('click', () => addNode('outcome'));

// Initial Render
renderTree();
