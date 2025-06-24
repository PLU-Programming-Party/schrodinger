import * as Renderer from "./renderer/renderer.js";
import * as Input from "./input/input.js";

function ResizeBoth(renderContext, state) {
    // Update canvas and renderer dimensions
  const canvas = renderContext.canvas;
  const rect = canvas.canvas.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
  canvas.top = rect.top;
  canvas.left = rect.left;
  canvas.gridWidth = Math.floor(canvas.width / state.cellSize);
  canvas.gridHeight = Math.floor(canvas.height / state.cellSize);

  // Update input state dimensions
  state.window.gridWidth = canvas.gridWidth;
  state.window.gridHeight = canvas.gridHeight;

  // Recreate the input draw array, now synced with renderer
  state.drawArray = new Float32Array(
    canvas.gridWidth * canvas.gridHeight
  );

  return renderContext;
}

window.addEventListener("resize", () => {
    handleResize(renderContext, state);
    if (!state.alertIssued) {
       alert(
         "Error with window resizing. Please refresh the page."
       );
       state.alertIssued = true;
     }
    
     return renderContext;
});