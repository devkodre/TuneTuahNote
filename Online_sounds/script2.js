console.log("Script2.js is loading");

document.getElementById("start-audio").addEventListener("click", async () => {
    await Tone.start();
    console.log("Audio started!");
});


document.addEventListener("DOMContentLoaded", () => {
    const synth = new Tone.Sampler({
        urls: {
            "A2": "A2.mp3",
            "C3": "C3.mp3",
            "D#3": "Ds3.mp3",
            "F3": "F3.mp3",
            "A3": "A3.mp3",
            "C4": "C4.mp3",
            "D#4": "Ds4.mp3",
            "F4": "F4.mp3",
            "A4": "A4.mp3",
            "C5": "C5.mp3",
            "D#5": "Ds5.mp3",
            "F5": "F5.mp3",
            "A5": "A5.mp3",
            "C6": "C6.mp3",
            "D#6": "Ds6.mp3",
            "F6": "F6.mp3",
            "G#6": "Gs6.mp3"
        },
        release: 1,
        baseUrl: "https://tonejs.github.io/audio/salamander/",
    }).toDestination();

    const keys = [
        { note: "A", isBlack: false }, { note: "A#", isBlack: true }, { note: "B", isBlack: false },
        { note: "C", isBlack: false }, { note: "C#", isBlack: true }, { note: "D", isBlack: false }, { note: "D#", isBlack: true },
        { note: "E", isBlack: false }, { note: "F", isBlack: false }, { note: "F#", isBlack: true }, { note: "G", isBlack: false },
        { note: "G#", isBlack: true }
    ];

    const piano = document.getElementById("piano");
    
    for (let octave = 2; octave <= 6; octave++) {
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