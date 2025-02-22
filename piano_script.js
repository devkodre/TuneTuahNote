// Define the piano keys with note names and their type (white/black)
const keys = [
    { note: "C", isBlack: false }, { note: "C#", isBlack: true }, { note: "D", isBlack: false }, { note: "D#", isBlack: true },
    { note: "E", isBlack: false }, { note: "F", isBlack: false }, { note: "F#", isBlack: true }, { note: "G", isBlack: false },
    { note: "G#", isBlack: true }, { note: "A", isBlack: false }, { note: "A#", isBlack: true }, { note: "B", isBlack: false }
];

// Object to store Howler.js sound instances
const sounds = {};

// Load sounds dynamically from your repository
for (let octave = 1; octave <= 5; octave++) {
    keys.forEach(key => {
        const note = `${key.note}${octave}`;
        sounds[note] = new Howl({ src: [`sounds/${note}.mp3`] }); // Load from repo
    });
}

// Get piano container
const piano = document.getElementById("piano");

// Generate keys dynamically
for (let octave = 1; octave <= 5; octave++) {
    keys.forEach(key => {
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
    if (sounds[note]) {
        sounds[note].play();
    } else {
        console.error("Missing sound:", note);
    }
}
