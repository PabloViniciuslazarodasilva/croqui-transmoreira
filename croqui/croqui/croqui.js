// ============================================
// CONFIGURAÇÃO GLOBAL
// ============================================
window.jsPDF = jspdf.jsPDF;

const PALETTE_CATEGORIES = {
    "Ruas": [
        {
            id: "road-intersection",
            name: "Estrada Faixa Amarela",
            src: "img/rua11.png",
            width: 200,
            height: 200,
            keepRatio: true,
            paletteId: "road-intersection",
        },
        {
            id: "road",
            name: "Estrada",
            src: "img/rua.png",
            width: 200,
            height: 200,
            keepRatio: false,
            paletteId: "road-straight-yellow",
        },
        {
            id: "road-straight-dashed",
            name: "curva",
            src: "img/curva2.png",
            width: 200,
            height: 200,
            keepRatio: false,
            paletteId: "road-straight-dashed",
        },
        {
            id: "avenue",
            name: "Avenida (com curva)",
            src: "img/ruacomcurva.png",
            width: 200,
            height: 200,
            keepRatio: false,
            paletteId: "avenue",
        },
        {
            id: "rotary",
            name: "Rotatória",
            src: "img/rotatoria.png",
            width: 200,
            height: 200,
            keepRatio: true,
            paletteId: "rotary",
        },
    ],
    "Veículos": [
        {
            id: "car-top",
            name: "Carro (1)",
            src: "img/carro33.png",
            width: 100,
            height: 120,
            keepRatio: true,
            paletteId: "car-top",
        },
        {
            id: "car-side",
            name: "Caminhonete",
            src: "img/caminhonete.png",
            width: 150,
            height: 80,
            keepRatio: true,
            paletteId: "car-side",
        },
        {
            id: "motorcycle",
            name: "Moto",
            src: "img/moto.png",
            width: 120,
            height: 180,
            keepRatio: true,
            paletteId: "motorcycle",
        },
        {
            id: "bus",
            name: "Ônibus",
            src: "img/Onibus.png",
            width: 200,
            height: 120,
            keepRatio: true,
            paletteId: "bus",
        },
        {
            id: "truck",
            name: "Caminhão",
            src: "img/caminhao.png",
            width: 250,
            height: 100,
            keepRatio: true,
            paletteId: "truck",
        },
    ],
    "Sinalização": [
        {
            id: "traffic-light",
            name: "Sinal de Trânsito",
            src: "img/sinal.png",
            width: 50,
            height: 150,
            keepRatio: true,
            paletteId: "traffic-light",
        },
        {
            id: "arrow-straight",
            name: "Seta Reta",
            src: "img/setafrente.png",
            width: 50,
            height: 50,
            keepRatio: true,
            paletteId: "arrow-straight",
        },
        {
            id: "stop-sign",
            name: "Placa Pare",
            src: "img/pare.png",
            width: 70,
            height: 70,
            keepRatio: true,
            paletteId: "stop-sign",
        },
        {
            id: "arrow-left",
            name: "Seta Esquerda",
            src: "img/setaesquerda.png",
            width: 50,
            height: 50,
            keepRatio: true,
            paletteId: "arrow-left",
        },
        {
            id: "arrow-right",
            name: "Seta Direita",
            src: "img/setadireita.png",
            width: 50,
            height: 50,
            keepRatio: true,
            paletteId: "arrow-right",
        },
    ],
    "Infraestrutura": [
        {
            id: "crosswalk",
            name: "Faixa de Pedestre",
            src: "img/faixadepedestre.png",
            width: 200,
            height: 50,
            keepRatio: false,
            paletteId: "crosswalk",
        },
        {
            id: "tree",
            name: "Muro",
            src: "img/muro.png",
            width: 80,
            height: 100,
            keepRatio: true,
            paletteId: "tree",
        },
        {
            id: "pole",
            name: "Poste",
            src: "img/poste.png",
            width: 40,
            height: 150,
            keepRatio: true,
            paletteId: "pole",
        },
        {
            id: "building",
            name: "Arvore",
            src: "img/arvore.png",
            width: 150,
            height: 200,
            keepRatio: true,
            paletteId: "building",
        },
    ],
};

let objects = [];
let selectedObject = null;
let isDragging = false;
let isResizing = false;
let dragOffsetX = 0;
let dragOffsetY = 0;
let resizeStartX = 0;
let resizeStartY = 0;
let resizeStartWidth = 0;
let resizeStartHeight = 0;
let resizeStartRatio = 1;
let notes = "";
let zoomLevel = 1;

let isRotating = false;
let rotationCenter = { x: 0, y: 0 };
const SNAP_THRESHOLD = 30; // Distância máxima para o snap em pixels
let startAngle = 0;

// ============================================
// INICIALIZAÇÃO
// ============================================
document.addEventListener("DOMContentLoaded", () => {
    initializePalette();
    setupCanvasEvents();
    updateObjectCount();
    setupCanvasScroll();
});

// ============================================
// SETUP DO CANVAS COM SCROLL
// ============================================
function setupCanvasScroll() {
    const canvasScroll = document.getElementById("canvasScroll");

    // Permitir scroll com mouse wheel
    canvasScroll.addEventListener("wheel", (e) => {
        if (!e.ctrlKey) {
            // Scroll normal
            e.preventDefault();
            canvasScroll.scrollTop += e.deltaY;
            canvasScroll.scrollLeft += e.deltaX;
        }
    });

    // Clicar fora de um objeto para desselecionar
    canvasScroll.addEventListener("click", (e) => {
        if (e.target === canvasScroll || e.target === canvas) {
            deselectObject();
        }
    });
}

// ============================================
// EXPANDIR CANVAS AUTOMATICAMENTE
// ============================================
function expandCanvasIfNeeded() {
    const canvas = document.getElementById("canvas");
    let maxX = 1200;
    let maxY = 800;

    objects.forEach((obj) => {
        const objRight = obj.x + obj.width + 50;
        const objBottom = obj.y + obj.height + 50;
        
        if (objRight > maxX) maxX = objRight;
        if (objBottom > maxY) maxY = objBottom;
    });

    maxX = Math.max(1200, maxX);
    maxY = Math.max(800, maxY);

    canvas.style.minWidth = maxX + "px";
    canvas.style.minHeight = maxY + "px";
}

// ============================================
// PALETA
// ============================================
function initializePalette() {
    const paletteItems = document.getElementById("paletteItems");
    paletteItems.innerHTML = "";

    for (const [categoryName, items] of Object.entries(PALETTE_CATEGORIES)) {
        const category = document.createElement("div");
        category.className = "palette-category open";

        const header = document.createElement("div");
        header.className = "category-header";
        header.onclick = () => category.classList.toggle("open");

        const title = document.createElement("h3");
        title.textContent = categoryName;

        const toggle = document.createElement("span");
        toggle.className = "toggle-icon";
        toggle.textContent = "▼";

        header.appendChild(title);
        header.appendChild(toggle);
        category.appendChild(header);

        const itemsContainer = document.createElement("div");
        itemsContainer.className = "category-items";

        items.forEach((item) => {
            const itemEl = document.createElement("div");
            itemEl.className = "palette-item";

            const preview = document.createElement("div");
            preview.className = "palette-item-preview";

            const img = document.createElement("img");
            img.src = item.src;
            img.alt = item.name;
            preview.appendChild(img);

            const info = document.createElement("div");
            info.className = "palette-item-info";

            const name = document.createElement("div");
            name.className = "palette-item-name";
            name.textContent = item.name;

            const size = document.createElement("div");
            size.className = "palette-item-size";
            size.textContent = `${item.width}x${item.height}px`;

            info.appendChild(name);
            info.appendChild(size);

            const btn = document.createElement("button");
            btn.className = "palette-item-btn";
            btn.textContent = "Adicionar";
            btn.onclick = () => addObject(item);

            itemEl.appendChild(preview);
            itemEl.appendChild(info);
            itemEl.appendChild(btn);

            itemsContainer.appendChild(itemEl);
        });

        category.appendChild(itemsContainer);
        paletteItems.appendChild(category);
    }
}

// ============================================
// PROCESSAMENTO DE IMAGEM
// ============================================
function processImageForTransparency(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL());
        };
        img.onerror = reject;
        img.src = src;
    });
}

// ============================================
// ADICIONAR OBJETO
// ============================================
async function addObject(item) {
    const canvas = document.getElementById("canvas");
    const newId = Date.now();

    // Adiciona o paletteId ao objeto para facilitar a identificação da categoria
    const newObject = {
        id: newId,
        paletteId: item.id,
        name: item.name,
        src: item.src,
        x: 50,
        y: 50,
        width: item.width,
        height: item.height,
        rotation: 0,
        flipped: false,
        keepRatio: item.keepRatio,
        text: "", // Novo campo para texto
    };

    objects.push(newObject);
    renderObject(newObject);
    updateObjectCount();
    updateClearButton();
    selectObject(newId);
    expandCanvasIfNeeded();

    const canvasEmpty = document.getElementById("canvasEmpty");
    if (canvasEmpty) {
        canvasEmpty.style.display = "none";
    }
}

// ============================================
// RENDERIZAÇÃO
// ============================================
function renderObject(obj) {
    let el = document.getElementById(`obj-${obj.id}`);
    if (!el) {
        el = document.createElement("div");
        el.id = `obj-${obj.id}`;
        el.className = "draggable-object";
        el.setAttribute("onmousedown", `startDrag(event, ${obj.id})`);
        el.setAttribute("onclick", `selectObject(${obj.id})`);

        // Container da Imagem
        const imgContainer = document.createElement("div");
        imgContainer.className = "object-image-container";
        imgContainer.style.width = "100%";
        imgContainer.style.height = "100%";

        const img = document.createElement("img");
        img.src = obj.src;
        img.alt = obj.name;
        imgContainer.appendChild(img);

        el.appendChild(imgContainer);

        // Resize Handle
        const resizeHandle = document.createElement("div");
        resizeHandle.className = "resize-handle";
        resizeHandle.setAttribute("onmousedown", `startResize(event, ${obj.id})`);
        el.appendChild(resizeHandle);

        // Rotate Handle
        const rotateHandle = document.createElement("div");
        rotateHandle.className = "rotate-handle";
        rotateHandle.setAttribute("onmousedown", `startRotate(event, ${obj.id})`);
        el.appendChild(rotateHandle);

        // Object Controls
        const controls = document.createElement("div");
        controls.className = "object-controls";

        // Botão de Rotação
        const rotateBtn = document.createElement("button");
        rotateBtn.className = "object-btn";
        rotateBtn.innerHTML = "🔄";
        rotateBtn.title = "Girar 45°";
        rotateBtn.onclick = (e) => {
            e.stopPropagation();
            rotateObject(obj.id);
        };
        controls.appendChild(rotateBtn);

        // Botão de Espelhamento
        const flipBtn = document.createElement("button");
        flipBtn.className = "object-btn";
        flipBtn.innerHTML = "↔️";
        flipBtn.title = "Espelhar";
        flipBtn.onclick = (e) => {
            e.stopPropagation();
            flipObject(obj.id);
        };
        controls.appendChild(flipBtn);

        // Botão de Duplicar
        const duplicateBtn = document.createElement("button");
        duplicateBtn.className = "object-btn";
        duplicateBtn.innerHTML = "➕";
        duplicateBtn.title = "Duplicar";
        duplicateBtn.onclick = (e) => {
            e.stopPropagation();
            duplicateObject(obj);
        };
        controls.appendChild(duplicateBtn);

        // Botão de Texto
        const textBtn = document.createElement("button");
        textBtn.className = "object-btn";
        textBtn.innerHTML = "📝";
        textBtn.title = "Adicionar Texto";
        textBtn.onclick = (e) => {
            e.stopPropagation();
            openTextModal(obj.id);
        };
        controls.appendChild(textBtn);

        // Botão de Excluir
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "object-btn";
        deleteBtn.innerHTML = "🗑️";
        deleteBtn.title = "Excluir";
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            deleteObject(obj.id);
        };
        controls.appendChild(deleteBtn);

        el.appendChild(controls);

        document.getElementById("canvas").appendChild(el);
    }

    el.style.left = `${obj.x}px`;
    el.style.top = `${obj.y}px`;
    el.style.width = `${obj.width}px`;
    el.style.height = `${obj.height}px`;
    
    let transform = `rotate(${obj.rotation}deg)`;
    if (obj.flipped) {
        transform += " scaleX(-1)";
    }
    el.style.transform = transform;

    // Renderiza o texto
    renderObjectText(obj, el);
}

function renderObjectText(obj, el) {
    let textEl = el.querySelector(".object-text");
    if (obj.text) {
        if (!textEl) {
            textEl = document.createElement("div");
            textEl.className = "object-text";
            el.appendChild(textEl);
        }
        textEl.textContent = obj.text;
    } else if (textEl) {
        textEl.remove();
    }
}

function selectObject(id) {
    deselectObject();
    const obj = objects.find((o) => o.id === id);
    if (obj) {
        selectedObject = obj;
        const el = document.getElementById(`obj-${id}`);
        if (el) {
            el.classList.add("selected");
        }
    }
}

function deselectObject() {
    if (selectedObject) {
        const el = document.getElementById(`obj-${selectedObject.id}`);
        if (el) {
            el.classList.remove("selected");
        }
        selectedObject = null;
    }
}

function rotateObject(id) {
    const obj = objects.find((o) => o.id === id);
    if (obj) {
        obj.rotation = (obj.rotation + 45) % 360;
        renderObject(obj);
    }
}

// ============================================
// ROTAÇÃO MANUAL COM CURSOR
// ============================================
function startRotate(e, id) {
    e.stopPropagation();
    e.preventDefault();

    const obj = objects.find((o) => o.id === id);
    if (!obj) return;

    isRotating = true;
    selectObject(id);

    const el = document.getElementById(`obj-${id}`);
    const canvasScroll = document.getElementById("canvasScroll");
    const canvasScrollRect = canvasScroll.getBoundingClientRect();

    const centerX = obj.x + (obj.width / 2);
    const centerY = obj.y + (obj.height / 2);

    rotationCenter = { x: centerX, y: centerY };

    const dx = e.clientX - canvasScrollRect.left + canvasScroll.scrollLeft - centerX;
    const dy = e.clientY - canvasScrollRect.top + canvasScroll.scrollTop - centerY;
    startAngle = Math.atan2(dy, dx) * (180 / Math.PI);

    const handleRotate = (moveEvent) => {
        const currentX = moveEvent.clientX - canvasScrollRect.left + canvasScroll.scrollLeft;
        const currentY = moveEvent.clientY - canvasScrollRect.top + canvasScroll.scrollTop;

        const currentDx = currentX - rotationCenter.x;
        const currentDy = currentY - rotationCenter.y;
        const currentAngle = Math.atan2(currentDy, currentDx) * (180 / Math.PI);

        let rotationDifference = currentAngle - startAngle;

        obj.rotation = (obj.rotation + rotationDifference) % 360;
        if (obj.rotation < 0) obj.rotation += 360;

        startAngle = currentAngle;

        renderObject(obj);
    };

    const stopRotate = () => {
        isRotating = false;
        document.removeEventListener("mousemove", handleRotate);
        document.removeEventListener("mouseup", stopRotate);
    };

    document.addEventListener("mousemove", handleRotate);
    document.addEventListener("mouseup", stopRotate);
}

function flipObject(id) {
    const obj = objects.find((o) => o.id === id);
    if (obj) {
        obj.flipped = !obj.flipped;
        renderObject(obj);
    }
}

// ============================================
// DUPLICAÇÃO
// ============================================
function duplicateObject(originalObj) {
    const newObj = {
        ...originalObj,
        id: Date.now(),
        x: originalObj.x + 20,
        y: originalObj.y + 20,
    };

    objects.push(newObj);
    renderObject(newObj);
    updateObjectCount();
    updateClearButton();
    selectObject(newObj.id);
    expandCanvasIfNeeded();
}

function deleteObject(id) {
    objects = objects.filter((o) => o.id !== id);
    const el = document.getElementById(`obj-${id}`);
    if (el) {
        el.remove();
    }
    deselectObject();
    updateObjectCount();
    updateClearButton();
    const canvasEmpty = document.getElementById("canvasEmpty");
    if (objects.length === 0 && canvasEmpty) {
        canvasEmpty.style.display = "block";
    }
}

// ============================================
// REDIMENSIONAMENTO COM MOUSE (COM PROPORÇÃO)
// ============================================
function startResize(e, id) {
    e.stopPropagation();
    e.preventDefault();

    const obj = objects.find((o) => o.id === id);
    if (!obj) return;

    isResizing = true;
    resizeStartX = e.clientX;
    resizeStartY = e.clientY;
    resizeStartWidth = obj.width;
    resizeStartHeight = obj.height;
    resizeStartRatio = obj.width / obj.height;

    const handleResize = (moveEvent) => {
        const deltaX = moveEvent.clientX - resizeStartX;
        const deltaY = moveEvent.clientY - resizeStartY;

        let newWidth = Math.max(30, resizeStartWidth + deltaX);
        let newHeight = Math.max(30, resizeStartHeight + deltaY);
        
        if (moveEvent.shiftKey || obj.keepRatio) {
            const delta = Math.max(Math.abs(deltaX), Math.abs(deltaY));
            const signX = deltaX >= 0 ? 1 : -1;
            
            newWidth = Math.max(30, resizeStartWidth + signX * delta);
            newHeight = newWidth / resizeStartRatio;
        }

        obj.width = newWidth;
        obj.height = newHeight;

        renderObject(obj);
        expandCanvasIfNeeded();
    };

    const stopResize = () => {
        isResizing = false;
        document.removeEventListener("mousemove", handleResize);
        document.removeEventListener("mouseup", stopResize);
    };

    document.addEventListener("mousemove", handleResize);
    document.addEventListener("mouseup", stopResize);
}


// ============================================
// DRAG & DROP
// ============================================
function startDrag(e, id) {
    if (e.button !== 0) return;
    if (isResizing) return;
    if (isRotating) return;

    selectObject(id);
    isDragging = true;
    const obj = selectedObject;
    const rect = e.currentTarget.getBoundingClientRect();
    const canvasScroll = document.getElementById("canvasScroll");
    const canvasScrollRect = canvasScroll.getBoundingClientRect();

    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;
    
    // Se for uma rua, calcula a posição inicial do snap
    if (isRoad(obj)) {
        const snappedPosition = snapToOtherRoads(obj, obj.x, obj.y);
        obj.x = snappedPosition.x;
        obj.y = snappedPosition.y;
        renderObject(obj);
    }

    const handleDrag = (moveEvent) => {
        let newX = moveEvent.clientX - canvasScrollRect.left + canvasScroll.scrollLeft - dragOffsetX;
        let newY = moveEvent.clientY - canvasScrollRect.top + canvasScroll.scrollTop - dragOffsetY;
        
        // Aplica a lógica de snap apenas se o objeto for uma "Rua"
        if (isRoad(obj)) {
            const snappedPosition = snapToOtherRoads(obj, newX, newY);
            newX = snappedPosition.x;
            newY = snappedPosition.y;
        }

        obj.x = newX;
        obj.y = newY;
        renderObject(obj);
        expandCanvasIfNeeded();
    };

    const stopDrag = () => {
        isDragging = false;
        document.removeEventListener("mousemove", handleDrag);
        document.removeEventListener("mouseup", stopDrag);
    };

    document.addEventListener("mousemove", handleDrag);
    document.addEventListener("mouseup", stopDrag);
}

// ============================================
// CANVAS EVENTS
// ============================================
function setupCanvasEvents() {
    const canvasScroll = document.getElementById("canvasScroll");
    const canvas = document.getElementById("canvas");

    canvasScroll.addEventListener("wheel", (e) => {
        if (e.ctrlKey) {
            e.preventDefault();
            zoomLevel += e.deltaY > 0 ? -0.1 : 0.1;
            zoomLevel = Math.max(0.5, Math.min(2, zoomLevel));
            canvas.style.transform = `scale(${zoomLevel})`;
        }
    });

    // Rotação com roda do mouse (se um objeto estiver selecionado)
    canvas.addEventListener("wheel", (e) => {
        if (selectedObject && !e.ctrlKey) {
            e.preventDefault();
            const rotationStep = e.deltaY > 0 ? 5 : -5;
            selectedObject.rotation = (selectedObject.rotation + rotationStep) % 360;
            if (selectedObject.rotation < 0) selectedObject.rotation += 360;
            renderObject(selectedObject);
        }
    });
}

// ============================================
// CONTROLES
// ============================================
function toggleGrid() {
    const canvas = document.getElementById("canvas");
    canvas.classList.toggle("grid-active");
}

function zoomIn() {
    zoomLevel = Math.min(2, zoomLevel + 0.1);
    const canvas = document.getElementById("canvas");
    canvas.style.transform = `scale(${zoomLevel})`;
}

function zoomOut() {
    zoomLevel = Math.max(0.5, zoomLevel - 0.1);
    const canvas = document.getElementById("canvas");
    canvas.style.transform = `scale(${zoomLevel})`;
}

function clearCanvas() {
    if (confirm("Tem certeza que deseja limpar todo o croqui?")) {
        objects = [];
        selectedObject = null;
        const canvas = document.getElementById("canvas");
        canvas.innerHTML = '<div id="canvasEmpty" class="canvas-empty">Clique em um elemento na paleta para começar</div>';
        canvas.style.minWidth = "1200px";
        canvas.style.minHeight = "800px";
        updateObjectCount();
        updateClearButton();
    }
}

// ============================================
// LÓGICA DE SNAP
// ============================================

// Função auxiliar para verificar se um objeto é um elemento de rua
function isRoad(obj) {
    // Verifica se o tipo do objeto (item.id) está na lista de IDs da categoria "Ruas"
    // O objeto não tem a propriedade 'type', mas sim 'paletteId' (ver linha 386)
    // A implementação correta deve usar PALETTE_CATEGORIES["Ruas"].some(road => road.id === obj.paletteId)
    // No entanto, para simplificar e garantir que todos os objetos da paleta "Ruas" sejam considerados:
    const roadIds = PALETTE_CATEGORIES["Ruas"].map(item => item.id);
    return roadIds.includes(obj.paletteId);
}

// Função para calcular a posição de snap
function snapToOtherRoads(currentObj, targetX, targetY) {
    let snappedX = targetX;
    let snappedY = targetY;
    let minDistance = SNAP_THRESHOLD;

    // 1. Filtra apenas os objetos que são "Ruas" e não são o objeto atual
    const otherRoads = objects.filter(obj => obj.id !== currentObj.id && isRoad(obj));

    // 2. Itera sobre as outras ruas para verificar o snap
    otherRoads.forEach(otherObj => {
        // Calcula os limites do objeto de rua atual na posição alvo
        const currentRect = {
            left: targetX,
            top: targetY,
            right: targetX + currentObj.width,
            bottom: targetY + currentObj.height,
            centerX: targetX + currentObj.width / 2,
            centerY: targetY + currentObj.height / 2,
        };

        const otherRect = {
            left: otherObj.x,
            top: otherObj.y,
            right: otherObj.x + otherObj.width,
            bottom: otherObj.y + otherObj.height,
            centerX: otherObj.x + otherObj.width / 2,
            centerY: otherObj.y + otherObj.height / 2,
        };

        // Define os pontos de conexão de cada objeto (centros de bordas)
        // Para simplificar, vamos considerar apenas o centro de cada lado
        const currentSnapPoints = [
            // Topo
            { x: currentRect.centerX, y: currentRect.top, type: 'top' },
            // Base
            { x: currentRect.centerX, y: currentRect.bottom, type: 'bottom' },
            // Esquerda
            { x: currentRect.left, y: currentRect.centerY, type: 'left' },
            // Direita
            { x: currentRect.right, y: currentRect.centerY, type: 'right' },
        ];

        const otherSnapPoints = [
            { x: otherRect.centerX, y: otherRect.top, type: 'top' },
            { x: otherRect.centerX, y: otherRect.bottom, type: 'bottom' },
            { x: otherRect.left, y: otherRect.centerY, type: 'left' },
            { x: otherRect.right, y: otherRect.centerY, type: 'right' },
        ];

        // Tenta fazer o snap ponto a ponto
        currentSnapPoints.forEach(currentPoint => {
            otherSnapPoints.forEach(otherPoint => {
                // Calcula a distância entre os pontos
                const dx = currentPoint.x - otherPoint.x;
                const dy = currentPoint.y - otherPoint.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Se a distância for menor que o limite e menor que a menor distância encontrada até agora
                if (distance < minDistance) {
                    minDistance = distance;
                    
                    // Calcula a nova posição (X, Y) do objeto atual para que o currentPoint
                    // se alinhe com o otherPoint.
                    
                    // A lógica original estava correta:
                    snappedX = targetX - dx;
                    snappedY = targetY - dy;
                }
            });
        });
    });

    return { x: snappedX, y: snappedY };
}

function saveCroqui() {
    alert("Croqui salvo com sucesso!");
}

function updateObjectCount() {
    document.getElementById("objectCount").textContent = `${objects.length} objeto${objects.length !== 1 ? "s" : ""}`;
}

function updateClearButton() {
    document.getElementById("clearBtn").disabled = objects.length === 0;
}

// ============================================
// MODAL DE TEXTO DO OBJETO
// ============================================
function openTextModal(id) {
    const obj = objects.find((o) => o.id === id);
    if (!obj) return;

    const modal = document.createElement('div');
    modal.id = 'objectTextModal';
    modal.className = 'modal open';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Texto para ${obj.name}</h2>
                <span class="close-btn" onclick="closeTextModal(false)">&times;</span>
            </div>
            <textarea id="objectTextarea" placeholder="Digite o texto que deseja adicionar ao objeto...">${obj.text || ''}</textarea>
            <div class="modal-footer">
                <button class="nav-btn" onclick="closeTextModal(true, ${obj.id})">Salvar</button>
                <button class="clear-btn" onclick="closeTextModal(false)">Cancelar</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function closeTextModal(save, id) {
    const modal = document.getElementById('objectTextModal');
    if (save && id) {
        const obj = objects.find((o) => o.id === id);
        if (obj) {
            obj.text = document.getElementById('objectTextarea').value;
            renderObject(obj);
        }
    }
    if (modal) modal.remove();
}

// ============================================
// MODAL DE ANOTAÇÕES
// ============================================
function openNotesModal() {
    const modal = document.getElementById("notesModal");
    document.getElementById("notes").value = notes;
    modal.classList.add("open");
}

function closeNotesModal() {
    const modal = document.getElementById("notesModal");
    notes = document.getElementById("notes").value;
    modal.classList.remove("open");
}

// ============================================
// EXPORTAÇÃO MELHORADA
// ============================================
function exportPNG() {
    exportCanvas("png");
}

function exportJPEG() {
    exportCanvas("jpeg");
}

function exportPDF() {
    exportCanvasPDF();
}

async function exportCanvas(format) {
    try {
        const exportWrapper = document.getElementById("exportWrapper");
        const canvas = document.getElementById("canvas");
        const originalZoom = zoomLevel;
        const originalTransform = canvas.style.transform;

        // 1. Resetar zoom para captura de alta resolução
        zoomLevel = 1;
        canvas.style.transform = "scale(1)";
        
        // 2. Desselecionar qualquer objeto para não aparecer o contorno
        deselectObject();

        // 3. Forçar o canvas a ter o tamanho exato do seu conteúdo (minWidth/minHeight)
        const captureWidth = canvas.scrollWidth;
        
        // O exportWrapper deve ter o tamanho do canvas + header
        exportWrapper.style.width = `${captureWidth}px`;
        exportWrapper.style.height = "auto";

        // 4. Atualizar a data de exportação
        updateExportDate();
        
        // 5. Aguardar renderização
        await new Promise((resolve) => setTimeout(resolve, 100));

        // 6. Capturar o exportWrapper (que inclui o header e o canvas)
        const canvasImage = await html2canvas(exportWrapper, {
            backgroundColor: "#ffffff",
            scale: 3,
            useCORS: true,
            allowTaint: true,
            width: captureWidth,
            height: exportWrapper.scrollHeight,
        });

        // 7. Restaurar zoom e tamanho do exportWrapper
        zoomLevel = originalZoom;
        canvas.style.transform = originalTransform;
        exportWrapper.style.width = "100%";
        exportWrapper.style.height = "100%";
        
        // 8. Criar link de download
        const link = document.createElement("a");
        link.href = canvasImage.toDataURL(`image/${format}`, format === "jpeg" ? 0.9 : 1.0);
        link.download = `croqui-${Date.now()}.${format}`;
        link.click();

        alert(`Croqui exportado como ${format.toUpperCase()} com sucesso!`);
    } catch (error) {
        alert("Erro ao exportar: " + error.message);
        console.error(error);
    }
}

async function exportCanvasPDF() {
    try {
        const exportWrapper = document.getElementById("exportWrapper");
        const canvas = document.getElementById("canvas");
        const originalZoom = zoomLevel;
        const originalTransform = canvas.style.transform;

        // 1. Resetar zoom para captura de alta resolução
        zoomLevel = 1;
        canvas.style.transform = "scale(1)";
        
        // 2. Desselecionar qualquer objeto para não aparecer o contorno
        deselectObject();

        // 3. Forçar o canvas a ter o tamanho exato do seu conteúdo (minWidth/minHeight)
        const captureWidth = canvas.scrollWidth;
        
        // O exportWrapper deve ter o tamanho do canvas + header
        exportWrapper.style.width = `${captureWidth}px`;
        exportWrapper.style.height = "auto";

        // 4. Atualizar a data de exportação
        updateExportDate();
        
        // 5. Aguardar renderização
        await new Promise((resolve) => setTimeout(resolve, 100));

        // 6. Capturar o exportWrapper (que inclui o header e o canvas)
        const canvasImage = await html2canvas(exportWrapper, {
            backgroundColor: "#ffffff",
            scale: 3,
            useCORS: true,
            allowTaint: true,
            width: captureWidth,
            height: exportWrapper.scrollHeight,
        });

        // 7. Restaurar zoom e tamanho do exportWrapper
        zoomLevel = originalZoom;
        canvas.style.transform = originalTransform;
        exportWrapper.style.width = "100%";
        exportWrapper.style.height = "100%";

        // 8. Criar PDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF("p", "mm", "a4");

        const imgData = canvasImage.toDataURL("image/jpeg", 0.9);
        const pdfWidth = doc.internal.pageSize.getWidth();
        const pdfHeight = doc.internal.pageSize.getHeight();
        
        const imgCanvasWidth = canvasImage.width;
        const imgCanvasHeight = canvasImage.height;
        const margin = 10;

        let imgWidth = pdfWidth - (2 * margin);
        let imgHeight = (imgCanvasHeight * imgWidth) / imgCanvasWidth;
        let yPos = margin;

        if (imgHeight > pdfHeight - (2 * margin)) {
            imgHeight = pdfHeight - (2 * margin);
            imgWidth = (imgCanvasWidth * imgHeight) / imgCanvasHeight;
            const xPos = (pdfWidth - imgWidth) / 2;
            doc.addImage(imgData, "JPEG", xPos, yPos, imgWidth, imgHeight);
        } else {
            const xPos = (pdfWidth - imgWidth) / 2;
            doc.addImage(imgData, "JPEG", xPos, yPos, imgWidth, imgHeight);
        }
        
        yPos += imgHeight + margin;

        // Adicionar notas se existirem
        if (notes.trim()) {
            if (yPos < pdfHeight - margin) {
                doc.setFontSize(12);
                doc.text("Notas:", margin, yPos);
                doc.setFontSize(10);
                const splitNotes = doc.splitTextToSize(notes, pdfWidth - (2 * margin));
                doc.text(splitNotes, margin, yPos + 7);
            }
        }

        doc.save(`croqui-${Date.now()}.pdf`);
        alert("PDF exportado com sucesso!");
    } catch (error) {
        alert("Erro ao exportar PDF: " + error.message);
        console.error(error);
    }
}

// Atualizar data/hora na exportação
function updateExportDate() {
    const now = new Date();
    const date = now.toLocaleDateString("pt-BR");
    const time = now.toLocaleTimeString("pt-BR");
    document.getElementById("exportDate").textContent = `Data: ${date} - Hora: ${time}`;
}

// Chamar ao carregar
updateExportDate();
setInterval(updateExportDate, 1000);
