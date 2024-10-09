// file: components/webgl/utils/webglBufferUtils.ts
export function createAndBindBuffer(gl: WebGLRenderingContext, data: Float32Array, usage: number): WebGLBuffer | null {
    const buffer = gl.createBuffer();
    if (!buffer) {
        console.error("Failed to create buffer");
        return null;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, usage);
    return buffer;
}

export function setAttribute(
    gl: WebGLRenderingContext,
    program: WebGLProgram,
    attributeName: string,
    size: number,
    type: number,
    buffer: WebGLBuffer
) {
    const attributeLocation = gl.getAttribLocation(program, attributeName);
    if (attributeLocation === -1) {
        console.error(`Attribute ${attributeName} not found in program`);
        return;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(attributeLocation, size, type, false, 0, 0);
    gl.enableVertexAttribArray(attributeLocation);
}