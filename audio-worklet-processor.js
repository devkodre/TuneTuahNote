class RecorderProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.recordedBuffers = [];
    }

    process(inputs, outputs, parameters) {
        const input = inputs[0];
        if (input.length > 0) {
            this.recordedBuffers.push(input[0]);
        }
        return true;
    }
}

registerProcessor('recorder-processor', RecorderProcessor);