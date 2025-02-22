// Define the correct sequence of piano keys per octave
const keys = [
    { note: "C", isBlack: false }, { note: "C#", isBlack: true }, { note: "D", isBlack: false }, { note: "D#", isBlack: true },
    { note: "E", isBlack: false }, { note: "F", isBlack: false }, { note: "F#", isBlack: true }, { note: "G", isBlack: false },
    { note: "G#", isBlack: true }, { note: "A", isBlack: false }, { note: "A#", isBlack: true }, { note: "B", isBlack: false }
];

// Object to store Howler.js sound instances
const sounds = {};

// Ensure the range starts at **C1** and ends at **C5**
for (let octave = 1; octave <= 5; octave++) {
    keys.forEach(key => {
        if (octave === 5 && key.note !== "C") return; // Limit C5 as the last note
        const note = `${key.note}${octave}`;
        sounds[note] = new Howl({ src: [`sounds/${note}.mp3`] }); // Load from repository
    });
}

// Get piano container
const piano = document.getElementById("piano");

// Generate keys dynamically
for (let octave = 1; octave <= 5; octave++) {
    keys.forEach(key => {
        if (octave === 5 && key.note !== "C") return; // Ensure C5 is the only note in octave 5

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
