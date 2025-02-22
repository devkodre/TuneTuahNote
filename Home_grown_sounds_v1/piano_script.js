// // Define the correct sequence of piano keys per octave
// const keys = [
//     { note: "C", isBlack: false }, { note: "Cs", isBlack: true }, { note: "D", isBlack: false }, { note: "Ds", isBlack: true },
//     { note: "E", isBlack: false }, { note: "F", isBlack: false }, { note: "Fs", isBlack: true }, { note: "G", isBlack: false },
//     { note: "Gs", isBlack: true }, { note: "A", isBlack: false }, { note: "As", isBlack: true }, { note: "B", isBlack: false }
// ];

// // Object to store Howler.js sound instances
// const sounds = {};

// // Ensure the range starts at **C1** and ends at **C5**
// for (let octave = 1; octave <= 5; octave++) {
//     keys.forEach(key => {
//         if (octave === 5 && key.note !== "C") return; // Limit C5 as the last note
//         const note = `${key.note}${octave}`;
//         sounds[note] = new Howl({ src: [`sounds/${note}.mp3`] }); // Load from repository
//     });
// }

// // Get piano container
// const piano = document.getElementById("piano");

// // Generate keys dynamically
// for (let octave = 1; octave <= 5; octave++) {
//     keys.forEach(key => {
//         if (octave === 5 && key.note !== "C") return; // Ensure C5 is the only note in octave 5

//         const keyElement = document.createElement("div");
//         keyElement.classList.add("key");
//         if (key.isBlack) keyElement.classList.add("black");
//         keyElement.dataset.note = `${key.note}${octave}`;
//         keyElement.innerText = key.note;

//         // Play sound on click
//         keyElement.addEventListener("click", () => playSound(keyElement.dataset.note));

//         piano.appendChild(keyElement);
//     });
// }

// // Function to play sound
// function playSound(note) {
//     if (sounds[note]) {
//         sounds[note].play();
//     } else {
//         console.error("Missing sound:", note);
//     }
// }


// Wait for Tone.js to be ready
document.addEventListener("DOMContentLoaded", async () => {
    await Tone.start(); // Ensure Tone.js is started properly
    console.log("Tone.js is ready");
});

// Define the correct sequence of piano keys per octave
const keys = [
    { note: "C", isBlack: false }, { note: "C#", isBlack: true }, { note: "D", isBlack: false }, { note: "D#", isBlack: true },
    { note: "E", isBlack: false }, { note: "F", isBlack: false }, { note: "F#", isBlack: true }, { note: "G", isBlack: false },
    { note: "G#", isBlack: true }, { note: "A", isBlack: false }, { note: "A#", isBlack: true }, { note: "B", isBlack: false }
];

// Create a Tone.js Synth
const synth = new Tone.Sampler({
    urls: {
        "C1": "C1.mp3", "C#1": "C#1.mp3", "D1": "D1.mp3", "D#1": "D#1.mp3",
        "E1": "E1.mp3", "F1": "F1.mp3", "F#1": "F#1.mp3", "G1": "G1.mp3",
        "G#1": "G#1.mp3", "A1": "A1.mp3", "A#1": "A#1.mp3", "B1": "B1.mp3",
        "C2": "C2.mp3", "C#2": "C#2.mp3", "D2": "D2.mp3", "D#2": "D#2.mp3",
        "E2": "E2.mp3", "F2": "F2.mp3", "F#2": "F#2.mp3", "G2": "G2.mp3",
        "G#2": "G#2.mp3", "A2": "A2.mp3", "A#2": "A#2.mp3", "B2": "B2.mp3",
        "C3": "C3.mp3", "C#3": "C#3.mp3", "D3": "D3.mp3", "D#3": "D#3.mp3",
        "E3": "E3.mp3", "F3": "F3.mp3", "F#3": "F#3.mp3", "G3": "G3.mp3",
        "G#3": "G#3.mp3", "A3": "A3.mp3", "A#3": "A#3.mp3", "B3": "B3.mp3",
        "C4": "C4.mp3", "C#4": "C#4.mp3", "D4": "D4.mp3", "D#4": "D#4.mp3",
        "E4": "E4.mp3", "F4": "F4.mp3", "F#4": "F#4.mp3", "G4": "G4.mp3",
        "G#4": "G#4.mp3", "A4": "A4.mp3", "A#4": "A#4.mp3", "B4": "B4.mp3",
        "C5": "C5.mp3"
    },
    release: 1,
    baseUrl: "sounds/" // Make sure this matches the path in your repository
}).toDestination();

// Get piano container
const piano = document.getElementById("piano");

// Generate keys dynamically
for (let octave = 1; octave <= 5; octave++) {
    keys.forEach(key => {
        if (octave === 5 && key.note !== "C") return; // Ensure only C5 is included

        const keyElement = document.createElement("div");
        keyElement.classList.add("key");
        if (key.isBlack) keyElement.classList.add("black");
        keyElement.dataset.note = `${key.note}${octave}`;
        keyElement.innerText = key.note;

        // Play sound on click
        keyElement.addEventListener("click", () => playSound(keyElement.dataset.note));

        piano.appendChild(keyElement);
    });
}

// Function to play sound
function playSound(note) {
    if (synth.loaded) {
        synth.triggerAttackRelease(note, "8n");
    } else {
        console.error("Sound not loaded:", note);
    }
}