// ----------------------------------------------------------------
// Input state (mouse + tickRate)
// ----------------------------------------------------------------
const Input = {
  mouse: {
    clientX: -1, // Raw pixel-based mouse position from brower events (Origin: top-left)
    clientY: -1,
    gridX: -1, // Transformed coordinates mapped onto the simulation grid (Origin: bottom-left)
    gridY: -1, 
    isDown: false,
  },
  tickRate: 60,
};

//----------------------------------------------------------------
// Core simulation state
//----------------------------------------------------------------
const state = {
  config: {}, // Configuration values loaded at Init
  proxy: {},  // Read-only proxy to Input
  drawArray: [],  // 2D grid flattened into 1D array
  window: {
    gridWidth: 0,
    gridHeight: 0,
  },
  cellSize: 0,
  initialized: false,
  drawBuffer: [], // Buffer of draw positions to apply
  decayCounter: 0, // Counter for handling draw decay
};

// ----------------------------------------------------------------
// Utility: Make object read-only (deep proxy)
// ----------------------------------------------------------------
function deepProxy(target) {
  if (target === null || typeof target !== "object") {
    return target;
  }

  return new Proxy(target, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (typeof value === "object") {
        return deepProxy(value);
      }
      return value;
    },
    set(target, key, value) {
      throw new Error("Cannot modify read-only object.");
    },
    deleteProperty(target, key) {
      throw new Error("Cannot delete property of read-only object.");
    },
  });
}

// ----------------------------------------------------------------
// Utility: Clamp a value between min and max
// ----------------------------------------------------------------
function clamp(value, min, max) {
  const result = Math.min(Math.max(value, min), max);
  return result;
}

// ----------------------------------------------------------------
// Input handling (mouse)
// ----------------------------------------------------------------
function toggleMouseDown(event) {
  Input.mouse.isDown = !Input.mouse.isDown;
}

function updateMousePos(event) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const gridWidth = state.window.gridWidth;
  const gridHeight = state.window.gridHeight;

  // ----------------------------
  // Convert mouse position (pixels) → grid coordinates (cells)
  // ----------------------------
  // clientX / clientY: raw mouse position in pixels (viewport-based, top-left origin)
  // gridX / gridY: mapped mouse position into the simulation grid (cell-based)
  //   - gridX is scaled across gridWidth.
  //   - gridY is inverted so (0,0) is bottom-left instead of top-left.
  const x = Math.floor((event.clientX / width) * gridWidth);
  const y = Math.floor(gridHeight - (event.clientY / height) * gridHeight);

  // Store raw mouse position (pixels)
  Input.mouse.clientX = event.clientX;
  Input.mouse.clientY = event.clientY;

  // Store converted grid position (cells)
  Input.mouse.gridX = clamp(x, 0, gridWidth - 1);
  Input.mouse.gridY = clamp(y, 0, gridHeight - 1);
}

function draw(event) {
  if (Input.mouse.isDown) {
    const x = clamp(Input.mouse.gridX, 0, state.window.gridWidth - 1);
    const y = clamp(Input.mouse.gridY, 0, state.window.gridHeight - 1);
    
    const radius = state.config.input.brushSize;
    const positions = getPositionsWithinRadius({ x, y }, radius);
    
    for (const { x, y } of positions) {
      state.drawBuffer.push({ x, y });
    }
  }
}


// ----------------------------------------------------------------
// Grid utilities
// ----------------------------------------------------------------
function configureGrid() {
  state.window.gridWidth = Math.floor(window.innerWidth / state.cellSize);
  state.window.gridHeight = Math.floor(window.innerHeight / state.cellSize);
  state.drawArray = new Float32Array(
    state.window.gridWidth * state.window.gridHeight
  );
}

function getPositionsWithinRadius(center, radius) {
  const positions = [];
  const { gridWidth, gridHeight } = state.window;

  const startX = Math.max(center.x - radius, 0);
  const endX = Math.min(center.x + radius, gridWidth - 1);
  const startY = Math.max(center.y - radius, 0);
  const endY = Math.min(center.y + radius, gridHeight - 1);

  for (let y = startY; y <= endY; y++) {
    for (let x = startX; x <= endX; x++) {
      const dx = x - center.x;
      const dy = y - center.y;
      if (Math.sqrt(dx * dx + dy * dy) <= radius) {
        positions.push({ x, y });
      }
    }
  }

  return positions;
}

// ----------------------------------------------------------------
// Public API
// ----------------------------------------------------------------
export function GetDrawArray() {
  return state.drawArray;
}

export function PrintDrawArray(drawArray) {
  const gridWidth = state.window.gridWidth;
  let output = "";
  for (let i = 0; i < drawArray.length; i += gridWidth) {
    const row = Array.from(drawArray.slice(i, i + gridWidth));
    output += row.join(" ") + "\n";
  }
  console.log(output);
}

export function Init(config) {
  if (state.initialized) {
    throw new Error("Input already initialized.");
  }

  // Save config and create proxy
  state.config = config;
  state.proxy = deepProxy(Input);
  state.initialized = true;
  state.cellSize = config.core.grid.cellSize;
  Input.tickRate = config.input.tickRate;

  configureGrid();
  
  // Attach event listeners
  document.addEventListener("mousedown", toggleMouseDown);
  document.addEventListener("mousedown", draw);
  document.addEventListener("mousemove", updateMousePos);
  document.addEventListener("mousemove", draw);
  document.addEventListener("mouseup", toggleMouseDown);

  return state.proxy;
}

export function Tick(context, deltaTime) {
  // Compare decay rate
  const decayRate =
    (state.config.input.decay * Math.PI * state.config.input.brushSize) ^ 2;
  state.drawArray.fill(0);

  for (const { x, y } of state.drawBuffer) {
    const index = y * state.window.gridWidth + x;
    state.drawArray[index] = 1;
  }

  // Apply decay by shifting from buffer
  while (state.drawBuffer.length > 0 && state.decayCounter < decayRate) {
    state.drawBuffer.shift();
    state.decayCounter++;
  }
  state.decayCounter = 0;
}
