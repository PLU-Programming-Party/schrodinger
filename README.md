# Welcome!
*Project Shrödinger* is intended to be a fun little toy simulator, where users can configure a simple set of rules to implement their own cellular automata. 

The codebase currently implements an interactive pressure/wave simulation. This summer (2025), we will build on top of the existing code base to turn this into a more sophisticated simulation, capable of running a more diverse set of models.

## Requirements
Your browser needs to support WebGPU. I haven't set up any kind of WebGL fallback.

This has only been tested in Blink/Chromium-based browsers. No idea how well it plays with other browser engines -- likely not very well.

## Getting Started
Begin by cloning the repository into a directory of your choice.

```
git clone https://github.com/PLU-Programming-Party/schrodinger.git
```
Next, navigate into the repository and install the required dependencies using `npm`.
```
cd schrodinger && npm install
```
To preview the code, start the `vite` development server and open the returned URL in a browser window.
```
npx vite
```

