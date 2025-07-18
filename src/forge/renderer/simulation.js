import gameOfLife from "./shaders/gameOfLife.wgsl?raw";
import fluidPressure from "./shaders/fluidPressure.wgsl?raw";
import fluidSim from "./shaders/fluidSim.wgsl?raw";
import fluidPressureSkip from "./shaders/fluidPressureSkip.wgsl?raw";
import fluidPressureSmoke from "./shaders/fluidPressureSmoke.wgsl?raw";

export function AddSimulationPipeline(renderContext, config) {
  const processedShaderCode = fluidSim.replace(
    /\$\{WORKGROUP_SIZE\}/g,
    config.simulation.workgroupSize
  );

  const simulationShaderModule = renderContext.gpu.device.createShaderModule({
    label: "Simulation Shader Module",
    code: processedShaderCode,
  });

  const simulationPipeline = renderContext.gpu.device.createComputePipeline({
    label: "Simulation Pipeline",
    layout: renderContext.layouts.pipelineLayout,
    compute: {
      module: simulationShaderModule,
      entryPoint: "computeMain",
    },
  });
  renderContext.simulationPipeline = simulationPipeline;

  return renderContext;
}
