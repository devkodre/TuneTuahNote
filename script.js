console.log("Script2.js is loading");

document.addEventListener("DOMContentLoaded", () => {
    const startAudioButton = document.getElementById("start-audio");
    const recordButton = document.getElementById("record");
    const stopButton = document.getElementById("stop");
    const playbackButton = document.getElementById("playback");
    const generateButton = document.getElementById("generate");
    const downloadButton = document.getElementById("download");
    
    function updateButtonStyles() {
        [recordButton, stopButton, playbackButton, generateButton, downloadButton].forEach(button => {
            button.classList.toggle("disabled", button.disabled);
        });
    }

    recordButton.disabled = true;
    stopButton.disabled = true;
    playbackButton.disabled = true;
    generateButton.disabled = true;
    updateButtonStyles();

    startAudioButton.addEventListener("click", async () => {
        await Tone.start();
        console.log("Audio started!");
        recordButton.disabled = false;
        updateButtonStyles();
    });

    const synth = new Tone.Sampler({
        urls: {
            C1: "C1.mp3", "C#1": "C1s.mp3", D1: "D1.mp3", "D#1": "D1s.mp3",
            E1: "E1.mp3", F1: "F1.mp3", "F#1": "F1s.mp3", G1: "G1.mp3",
            "G#1": "G1s.mp3", A1: "A1.mp3", "A#1": "A1s.mp3", B1: "B1.mp3",
            C2: "C2.mp3", "C#2": "C2s.mp3", D2: "D2.mp3", "D#2": "D2s.mp3",
            E2: "E2.mp3", F2: "F2.mp3", "F#2": "F2s.mp3", G2: "G2.mp3",
            "G#2": "G2s.mp3", A2: "A2.mp3", "A#2": "A2s.mp3", B2: "B2.mp3",
            C3: "C3.mp3", "C#3": "C3s.mp3", D3: "D3.mp3", "D#3": "D3s.mp3",
            E3: "E3.mp3", F3: "F3.mp3", "F#3": "F3s.mp3", G3: "G3.mp3",
            "G#3": "G3s.mp3", A3: "A3.mp3", "A#3": "A3s.mp3", B3: "B3.mp3",
            C4: "C4.mp3", "C#4": "C4s.mp3", D4: "D4.mp3", "D#4": "D4s.mp3",
            E4: "E4.mp3", F4: "F4.mp3", "F#4": "F4s.mp3", G4: "G4.mp3",
            "G#4": "G4s.mp3", A4: "A4.mp3", "A#4": "A4s.mp3", B4: "B4.mp3",
            C5: "C5.mp3",
        },
        release: 1,
        baseUrl: "/sounds/",
    }).toDestination();

    const keys = [
        { note: "C", isBlack: false }, { note: "C#", isBlack: true }, { note: "D", isBlack: false }, { note: "D#", isBlack: true },
        { note: "E", isBlack: false }, { note: "F", isBlack: false }, { note: "F#", isBlack: true }, { note: "G", isBlack: false },
        { note: "G#", isBlack: true }, { note: "A", isBlack: false }, { note: "A#", isBlack: true }, { note: "B", isBlack: false }
    ];

    const piano = document.getElementById("piano");
    let recording = false;
    let recordedNotes = [];
    let startTime = 0;

    for (let octave = 1; octave <= 5; octave++) {
        keys.forEach(key => {
            const keyElement = document.createElement("div");
            keyElement.classList.add("key");
            if (key.isBlack) keyElement.classList.add("black");
            keyElement.dataset.note = `${key.note}${octave}`;
            keyElement.innerText = key.note;
            keyElement.addEventListener("click", () => playSound(keyElement.dataset.note));
            piano.appendChild(keyElement);
        });
    }

    function playSound(note) {
        synth.triggerAttackRelease(note, "8n");
        if (recording) {
            const time = Tone.now() - startTime;
            recordedNotes.push({ note, time });
        }
    }

    recordButton.addEventListener("click", () => {
        recordedNotes = [];
        recording = true;
        startTime = Tone.now();
        recordButton.disabled = true;
        stopButton.disabled = false;
        playbackButton.disabled = true;
        generateButton.disabled = true;
        downloadButton.disabled = true;
        updateButtonStyles();
        console.log("Recording started...");
    });

    stopButton.addEventListener("click", () => {
        recording = false;
        recordButton.disabled = false;
        stopButton.disabled = true;
        playbackButton.disabled = recordedNotes.length === 0;
        generateButton.disabled = false;
        downloadButton.disabled = false;
        updateButtonStyles();
        console.log("Recording stopped:", recordedNotes);

    });

    playbackButton.addEventListener("click", () => {
        generateButton.disabled = true;
        downloadButton.disabled = true;
        console.log("Playing back recorded notes...");
        console.log(recordedNotes);
        Tone.Transport.stop();
        Tone.Transport.cancel();
        recordedNotes.forEach(({ note, time }) => {
            Tone.Transport.schedule((playTime) => {
                synth.triggerAttackRelease(note, "8n", playTime);
            }, time);
        });
        Tone.Transport.start();
        generateButton.disabled = false;
        downloadButton.disabled = false;
    });

    generateButton.addEventListener("click", async () => {
        recordButton.disabled = true;
        stopButton.disabled = true;
        playbackButton.disabled = true;
        generateButton.disabled = true;
        downloadButton.disabled = true;

        console.log("Generate");

        console.log("Generating new melody...");
        const response = await fetch('http://localhost:5500/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ notes: recordedNotes.map(note => note.note) })
        });
        const data = await response.json();
        const generatedNotes = data.generated_notes;
        console.log("Generated notes:", generatedNotes);
    
        // Concatenate the original recorded notes with the generated notes
        const combinedNotes = recordedNotes.concat(generatedNotes.map((note, index) => ({
            note,
            time: recordedNotes.length > 0 ? recordedNotes[recordedNotes.length - 1].time + (index + 1) * 0.5 : (index + 1) * 0.5
        })));
    
        // Play the combined notes
        Tone.Transport.stop();
        Tone.Transport.cancel();
        combinedNotes.forEach(({ note, time }) => {
            Tone.Transport.schedule((playTime) => {
                synth.triggerAttackRelease(note, "8n", playTime);
            }, time);
        });
        Tone.Transport.start();

        // if (combinedNotes.length > 0) {
        //     downloadButton.disabled = false;
        // }
        recordButton.disabled = false;
        playbackButton.disabled = false;
        generateButton.disabled = false;
        downloadButton.disabled = false;
    });

    // async function downloadRecordedNotes() {
    //     console.log("Starting download...");
    //     const offlineContext = new Tone.OfflineContext(2, recordedNotes[recordedNotes.length - 1].time + 1, 44100); // Duration based on the last note's time
    //     const offlineSynth = new Tone.Sampler({
    //         urls: {
    //             C1: "C1.mp3", "C#1": "C1s.mp3", D1: "D1.mp3", "D#1": "D1s.mp3",
    //             E1: "E1.mp3", F1: "F1.mp3", "F#1": "F1s.mp3", G1: "G1.mp3",
    //             "G#1": "G1s.mp3", A1: "A1.mp3", "A#1": "A1s.mp3", B1: "B1.mp3",
    //             C2: "C2.mp3", "C#2": "C2s.mp3", D2: "D2.mp3", "D#2": "D2s.mp3",
    //             E2: "E2.mp3", F2: "F2.mp3", "F#2": "F2s.mp3", G2: "G2.mp3",
    //             "G#2": "G2s.mp3", A2: "A2.mp3", "A#2": "A2s.mp3", B2: "B2.mp3",
    //             C3: "C3.mp3", "C#3": "C3s.mp3", D3: "D3.mp3", "D#3": "D3s.mp3",
    //             E3: "E3.mp3", F3: "F3.mp3", "F#3": "F3s.mp3", G3: "G3.mp3",
    //             "G#3": "G3s.mp3", A3: "A3.mp3", "A#3": "A3s.mp3", B3: "B3.mp3",
    //             C4: "C4.mp3", "C#4": "C4s.mp3", D4: "D4.mp3", "D#4": "D4s.mp3",
    //             E4: "E4.mp3", F4: "F4.mp3", "F#4": "F4s.mp3", G4: "G4.mp3",
    //             "G#4": "G4s.mp3", A4: "A4.mp3", "A#4": "A4s.mp3", B4: "B4.mp3",
    //             C5: "C5.mp3",
    //         },
    //         release: 1,
    //         baseUrl: "/sounds/",
    //         onload: async () => {
    //             console.log("Offline sampler loaded");
    
    //             recordedNotes.forEach(({ note, time }) => {
    //                 offlineSynth.triggerAttackRelease(note, "8n", time);
    //             });
    
    //             const buffer = await offlineContext.render();
    
    //             try {
    //                 const recorder = new Recorder(buffer);
    //                 recorder.record();
    
    //                 // Stop recording after the duration of the recorded notes
    //                 setTimeout(() => {
    //                     recorder.stop();
    //                     recorder.exportWAV(blob => {
    //                         const url = URL.createObjectURL(blob);
    //                         const a = document.createElement("a");
    //                         a.style.display = "none";
    //                         a.href = url;
    //                         a.download = "recorded_notes.mp3";
    //                         document.body.appendChild(a);
    //                         a.click();
    //                         window.URL.revokeObjectURL(url);
    //                     });
    //                 }, (recordedNotes[recordedNotes.length - 1].time + 1) * 1000); // Adjust timing as needed
    //                 console.log("Download complete!");
    //             } catch (error) {
    //                 console.error("Error initializing recorder:", error);
    //             }
    //         }
    //     }).toDestination();
    // }

    async function downloadRecordedNotes() {
        console.log("Starting download...");
        const offlineContext = new Tone.OfflineContext(2, recordedNotes[recordedNotes.length - 1].time + 1, 44100); // Duration based on the last note's time
        const offlineSynth = new Tone.Sampler({
            urls: {
                C1: "C1.mp3", "C#1": "C1s.mp3", D1: "D1.mp3", "D#1": "D1s.mp3",
                E1: "E1.mp3", F1: "F1.mp3", "F#1": "F1s.mp3", G1: "G1.mp3",
                "G#1": "G1s.mp3", A1: "A1.mp3", "A#1": "A1s.mp3", B1: "B1.mp3",
                C2: "C2.mp3", "C#2": "C2s.mp3", D2: "D2.mp3", "D#2": "D2s.mp3",
                E2: "E2.mp3", F2: "F2.mp3", "F#2": "F2s.mp3", G2: "G2.mp3",
                "G#2": "G2s.mp3", A2: "A2.mp3", "A#2": "A2s.mp3", B2: "B2.mp3",
                C3: "C3.mp3", "C#3": "C3s.mp3", D3: "D3.mp3", "D#3": "D3s.mp3",
                E3: "E3.mp3", F3: "F3.mp3", "F#3": "F3s.mp3", G3: "G3.mp3",
                "G#3": "G3s.mp3", A3: "A3.mp3", "A#3": "A3s.mp3", B3: "B3.mp3",
                C4: "C4.mp3", "C#4": "C4s.mp3", D4: "D4.mp3", "D#4": "D4s.mp3",
                E4: "E4.mp3", F4: "F4.mp3", "F#4": "F4s.mp3", G4: "G4.mp3",
                "G#4": "G4s.mp3", A4: "A4.mp3", "A#4": "A4s.mp3", B4: "B4.mp3",
                C5: "C5.mp3",
            },
            release: 1,
            baseUrl: "/sounds/",
            onload: async () => {
                console.log("Offline sampler loaded");
    
                recordedNotes.forEach(({ note, time }) => {
                    offlineSynth.triggerAttackRelease(note, "8n", time);
                });
    
                const buffer = await offlineContext.render();
    
                try {
                    const audioContext = new AudioContext();
                    await audioContext.audioWorklet.addModule('audio-worklet-processor.js');
                    const recorderNode = new AudioWorkletNode(audioContext, 'recorder-processor');
                    const source = audioContext.createBufferSource();
                    source.buffer = buffer;
                    source.connect(recorderNode).connect(audioContext.destination);
                    source.start();
    
                    recorderNode.port.onmessage = (event) => {
                        if (event.data === 'complete') {
                            const recordedBuffer = recorderNode.recordedBuffers;
                            const blob = new Blob(recordedBuffer, { type: 'audio/wav' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.style.display = "none";
                            a.href = url;
                            a.download = "recorded_notes.mp3";
                            document.body.appendChild(a);
                            a.click();
                            window.URL.revokeObjectURL(url);
                            console.log("Download complete!");
                        }
                    };
                } catch (error) {
                    console.error("Error initializing recorder:", error);
                }
            }
        }).toDestination();
    }

    async function downloadCombinedNotes() {
        const offlineContext = new Tone.OfflineContext(2, 30, 44100); // 30 seconds duration, adjust as needed
        const offlineSynth = new Tone.Sampler({
            urls: {
                C1: "C1.mp3", "C#1": "C1s.mp3", D1: "D1.mp3", "D#1": "D1s.mp3",
                E1: "E1.mp3", F1: "F1.mp3", "F#1": "F1s.mp3", G1: "G1.mp3",
                "G#1": "G1s.mp3", A1: "A1.mp3", "A#1": "A1s.mp3", B1: "B1.mp3",
                C2: "C2.mp3", "C#2": "C2s.mp3", D2: "D2.mp3", "D#2": "D2s.mp3",
                E2: "E2.mp3", F2: "F2.mp3", "F#2": "F2s.mp3", G2: "G2.mp3",
                "G#2": "G2s.mp3", A2: "A2.mp3", "A#2": "A2s.mp3", B2: "B2.mp3",
                C3: "C3.mp3", "C#3": "C3s.mp3", D3: "D3.mp3", "D#3": "D3s.mp3",
                E3: "E3.mp3", F3: "F3.mp3", "F#3": "F3s.mp3", G3: "G3.mp3",
                "G#3": "G3s.mp3", A3: "A3.mp3", "A#3": "A3s.mp3", B3: "B3.mp3",
                C4: "C4.mp3", "C#4": "C4s.mp3", D4: "D4.mp3", "D#4": "D4s.mp3",
                E4: "E4.mp3", F4: "F4.mp3", "F#4": "F4s.mp3", G4: "G4.mp3",
                "G#4": "G4s.mp3", A4: "A4.mp3", "A#4": "A4s.mp3", B4: "B4.mp3",
                C5: "C5.mp3",
            },
            release: 1,
            baseUrl: "/sounds/",
        }).toDestination();

        const combinedNotes = recordedNotes.concat(generatedNotes.map((note, index) => ({
            note,
            time: recordedNotes.length > 0 ? recordedNotes[recordedNotes.length - 1].time + (index + 1) * 0.5 : (index + 1) * 0.5
        })));

        combinedNotes.forEach(({ note, time }) => {
            offlineSynth.triggerAttackRelease(note, "8n", time);
        });

        const buffer = await offlineContext.render();

        const recorder = new Recorder(buffer);
        recorder.record();

        // Stop recording after the duration of the combined notes
        setTimeout(() => {
            recorder.stop();
            recorder.exportWAV(blob => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.style.display = "none";
                a.href = url;
                a.download = "combined_notes.mp3";
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            });
        }, combinedNotes.length * 0.5 * 1000); // Adjust timing as needed
    }

    downloadButton.addEventListener("click", downloadRecordedNotes);


});