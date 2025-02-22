// document.addEventListener("DOMContentLoaded", () => {
//     const synth = new Tone.Sampler({
//         urls: {
//             A2: "A2.mp3",
//             C3: "C3.mp3",
//             "D#3": "Ds3.mp3",
//             F3: "F3.mp3",
//             A3: "A3.mp3",
//             C4: "C4.mp3",
//             "D#4": "Ds4.mp3",
//             F4: "F4.mp3",
//             A4: "A4.mp3",
//             C5: "C5.mp3",
//             "D#5": "Ds5.mp3",
//             F5: "F5.mp3",
//             A5: "A5.mp3",
//             C6: "C6.mp3",
//             "D#6": "Ds6.mp3",
//             F6: "F6.mp3",
//             "G#6": "Gs6.mp3"
//         },
//         release: 1,
//         baseUrl: "https://tonejs.github.io/audio/salamander/",
//     }).toDestination();

//     const keys = [
//         { note: "A", isBlack: false }, { note: "A#", isBlack: true }, { note: "B", isBlack: false },
//         { note: "C", isBlack: false }, { note: "C#", isBlack: true }, { note: "D", isBlack: false }, { note: "D#", isBlack: true },
//         { note: "E", isBlack: false }, { note: "F", isBlack: false }, { note: "F#", isBlack: true }, { note: "G", isBlack: false },
//         { note: "G#", isBlack: true }
//     ];

//     const piano = document.getElementById("piano");
    
//     for (let octave = 2; octave <= 6; octave++) {
//         keys.forEach(key => {
//             const keyElement = document.createElement("div");
//             keyElement.classList.add("key");
//             if (key.isBlack) keyElement.classList.add("black");
//             keyElement.dataset.note = `${key.note}${octave}`;
//             keyElement.innerText = key.note;
//             keyElement.addEventListener("click", () => playSound(keyElement.dataset.note));
//             piano.appendChild(keyElement);
//         });
//     }

//     function playSound(note) {
//         synth.triggerAttackRelease(note, "8n");
//     }
// });

console.log("Script2.js is loading");

document.getElementById("start-audio").addEventListener("click", async () => {
    await Tone.start();
    console.log("Audio started!");
});

document.addEventListener("DOMContentLoaded", () => {
    const synth = new Tone.Sampler({
        urls: {
            C1: "C1.mp3",
            "C#1": "C1s.mp3",
            D1: "D1.mp3",
            "D#1": "D1s.mp3",
            E1: "E1.mp3",
            F1: "F1.mp3",
            "F#1": "F1s.mp3",
            G1: "G1.mp3",
            "G#1": "G1s.mp3",
            A1: "A1.mp3",
            "A#1": "A1s.mp3",
            B1: "B1.mp3",
            C2: "C2.mp3",
            "C#2": "C2s.mp3",
            D2: "D2.mp3",
            "D#2": "D2s.mp3",
            E2: "E2.mp3",
            F2: "F2.mp3",
            "F#2": "F2s.mp3",
            G2: "G2.mp3",
            "G#2": "G2s.mp3",
            A2: "A2.mp3",
            "A#2": "A2s.mp3",
            B2: "B2.mp3",
            C3: "C3.mp3",
            "C#3": "C3s.mp3",
            D3: "D3.mp3",
            "D#3": "D3s.mp3",
            E3: "E3.mp3",
            F3: "F3.mp3",
            "F#3": "F3s.mp3",
            G3: "G3.mp3",
            "G#3": "G3s.mp3",
            A3: "A3.mp3",
            "A#3": "A3s.mp3",
            B3: "B3.mp3",
            C4: "C4.mp3",
            "C#4": "C4s.mp3",
            D4: "D4.mp3",
            "D#4": "D4s.mp3",
            E4: "E4.mp3",
            F4: "F4.mp3",
            "F#4": "F4s.mp3",
            G4: "G4.mp3",
            "G#4": "G4s.mp3",
            A4: "A4.mp3",
            "A#4": "A4s.mp3",
            B4: "B4.mp3",
            C5: "C5.mp3",
        },
        release: 1,
        baseUrl: "/sounds2/",
    }).toDestination();

    const keys = [
        { note: "C", isBlack: false }, { note: "C#", isBlack: true }, { note: "D", isBlack: false }, { note: "D#", isBlack: true },
        { note: "E", isBlack: false }, { note: "F", isBlack: false }, { note: "F#", isBlack: true }, { note: "G", isBlack: false },
        { note: "G#", isBlack: true }, { note: "A", isBlack: false }, { note: "A#", isBlack: true }, { note: "B", isBlack: false }
    ];

    const piano = document.getElementById("piano");

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
    }
});
