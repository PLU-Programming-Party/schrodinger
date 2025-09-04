export function createSidebar(rend) {
  const sidebar = document.createElement('div');
  const title = document.createElement("h2");
  sidebar.appendChild(title);
  title.textContent = "Color Sliders";
  sidebar.style.position = 'absolute';
  sidebar.style.left = '0';
  sidebar.style.top = '0';
  sidebar.style.width = '220px';
  sidebar.style.padding = '10px';
  sidebar.style.background = '#222';
  sidebar.style.color = 'white';
  sidebar.style.fontFamily = 'sans-serif';
  sidebar.style.zIndex = 100;
  const color = [0, 0, 0.5, 1];
  rend.gpu.device.queue.writeBuffer(rend.colorBuffer, 0, new Float32Array(color));
    

  const sliders = ['Red', 'Green', 'Blue', 'Alpha'].map((labelText, index) => {
    const label = document.createElement('label');
    label.textContent = labelText + ': ';

    const input = document.createElement('input');
    input.type = 'range';
    input.min = 0;
    input.max = 1;
    input.step = 0.01;
    input.value = color[index];

    input.addEventListener('input', (e) => {
      color[index] = parseFloat(e.target.value);
      if (rend && rend.gpu && rend.colorBuffer) {
      rend.gpu.device.queue.writeBuffer(rend.colorBuffer, 0, new Float32Array(color));
    }
    });

    label.appendChild(input);
    sidebar.appendChild(label);
    sidebar.appendChild(document.createElement('br'));
    return input;
  });

  document.body.appendChild(sidebar);
}