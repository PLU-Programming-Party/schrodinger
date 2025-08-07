@group(0) @binding(0) var<uniform> grid: vec2f;

@group(0) @binding(1) var<storage>             userInput: array<f32>;
@group(0) @binding(2) var<storage>             pressureIn: array<f32>; //ignore
@group(0) @binding(3) var<storage, read_write> pressureOut: array<f32>; //ignore
@group(0) @binding(4) var<storage>             xVeloIn: array<f32>;
@group(0) @binding(5) var<storage, read_write> xVeloOut: array<f32>;
@group(0) @binding(6) var<storage>             yVeloIn: array<f32>;
@group(0) @binding(7) var<storage, read_write> yVeloOut: array<f32>;

const TIMESTEP: f32 = 0.05;

// Actually use user input, create a constant velo vector on click

fn reflectBoundary(coord: i32, maxSize: i32) -> u32 { // use this for now
    return u32(clamp(coord, 0, maxSize - 1)); 
}

fn cellIndex(cell: vec2i) -> u32 {
    let x = reflectBoundary(cell.x, i32(grid.x));
    let y = reflectBoundary(cell.y, i32(grid.y));
    return y * u32(grid.x) + x;
}

fn bilerp(x: f32, y: f32) -> vec2f {

    // let leftX: u32 = floor(x);
    // let rightX: u32 = ceil(x);
    // let upY: u32 = ceil(y);
    // let downY: u32 = floor(y);

    let topLeft:     u32 = cellIndex(vec2<i32>(i32(floor(x)), i32(floor(y)))); //linear indexing
    let topRight:    u32 = cellIndex(vec2<i32>(i32(ceil(x)), i32(floor(y))));
    let bottomLeft:  u32 = cellIndex(vec2<i32>(i32(floor(x)), i32(ceil(y))));
    let bottomRight: u32 = cellIndex(vec2<i32>(i32(ceil(x)), i32(ceil(y))));


    let t_X: f32 = x - floor(x);
    let t_Y: f32 = y - floor(y);


    


    //X-Component

    //first lerp in the x direction, above
    var topVelo: f32 = (xVeloIn[topLeft] * t_X) + (xVeloIn[topRight] * (1 - t_X)); //f(t) = a * t + b * (1 - t)

    //second lerp in the x direction, below
    var bottomVelo: f32 = (xVeloIn[bottomLeft] * t_X) + (xVeloIn[bottomRight] * (1 - t_X)); //f(t) = c * t + d * (1 - t)

    //final lerp in the y direction
    let veloX = ((topVelo * t_Y) + (bottomVelo * (1 - t_Y)));


    //Y-Component

    //first lerp in the x direction, above
    topVelo = (yVeloIn[topLeft] * t_X) + (yVeloIn[topRight] * (1 - t_X)); //f(t) = a * t + b * (1 - t)

    //second lerp in the x direction, below
    bottomVelo = (yVeloIn[bottomLeft] * t_X) + (yVeloIn[bottomRight] * (1 - t_X)); //f(t) = c * t + d * (1 - t)

    //final lerp in the y direction
    let veloY = ((topVelo * t_Y) + (bottomVelo * (1-t_X)));


    return vec2f(veloX, veloY);

}


// fn cellValue(x: i32, y: i32) -> f32 {
//     return max(pressureIn[cellIndex(vec2i(x, y))], userInput[cellIndex(vec2i(x, y))]);
// }

// check user input at whatever index, if one, I have a user input, set velo to some value, do something 
// kinda like the cell value in the pressure shader. Instead of pressure in, just do x velo and y velo in.

@compute
@workgroup_size(${WORKGROUP_SIZE}, ${WORKGROUP_SIZE})
fn computeMain(@builtin(global_invocation_id) cell: vec3u) {
    let cellPos = vec2i(i32(cell.x), i32(cell.y));

    let i = cellIndex(cellPos);
    // let currentXVelo = xVeloIn[i];
    // let previousXVelo = xVeloOut[i];
    // let currentYVelo = yVeloIn[i];
    // let previousYVelo = yVeloOut[i];



    var prevPosX: f32 = f32(cell.x) - (xVeloIn[i] * TIMESTEP);
    var prevPosY: f32 = f32(cell.y) - (yVeloIn[i] * TIMESTEP);

    var prevVelo: vec2f = bilerp(prevPosX, prevPosY);
    
    xVeloOut[i] = prevVelo.x;
    yVeloOut[i] = prevVelo.y;

    



    pressureOut[i] = pressureIn[i]; // ignore for now

    // xVeloOut[i] = xVeloIn[i];
    // yVeloOut[i] = yVeloIn[i];
}