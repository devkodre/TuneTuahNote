import numpy as np
from scipy.io import wavfile
import mido
from mido import MidiFile, MidiTrack, Message, MetaMessage
import random
import math

# ===================== TEXT TO MUSIC PARAMETERS =====================
def interpret_mood(text):
    """Convert text description to musical parameters"""
    text = text.lower()
    params = {
        'scale': 'major',
        'tempo': 120,
        'articulation': 'legato',
        'rhythm': 'medium',
        'register': 'middle',
        'complexity': 0.5
    }

    if 'sad' in text or 'dark' in text or 'foreboding' in text:
        params['scale'] = 'minor'
        params['tempo'] = 80
        params['articulation'] = 'legato'
    if 'happy' in text or 'lighthearted' in text:
        params['tempo'] = 140
        params['rhythm'] = 'bouncy'
    if 'angry' in text or 'intense' in text:
        params['tempo'] = 160
        params['articulation'] = 'staccato'
        params['complexity'] = 0.8
    if 'calm' in text or 'relaxing' in text:
        params['tempo'] = 90
        params['rhythm'] = 'slow'
    
    if 'blues' in text:
        params['scale'] = 'blues'
    if 'jazz' in text:
        params['scale'] = 'jazz'
    
    return params

def get_scale(root=60, scale_type='major'):
    """Return MIDI notes for different scales"""
    scales = {
        'major': [0, 2, 4, 5, 7, 9, 11],
        'minor': [0, 2, 3, 5, 7, 8, 10],
        'blues': [0, 3, 5, 6, 7, 10],
        'jazz': [0, 2, 4, 6, 7, 9, 10, 11]
    }
    return [root + interval for interval in scales.get(scale_type, scales['major'])]

# ===================== MELODY GENERATION =====================
def generate_melody_from_text(text, length=16):
    """Generate melody based on text description"""
    params = interpret_mood(text)
    root_note = 60  # Middle C
    scale = get_scale(root_note, params['scale'])
    
    melody = []
    current_note = root_note
    
    for _ in range(length):
        if params['rhythm'] == 'bouncy':
            durations = [240, 480, 720]
        elif params['rhythm'] == 'slow':
            durations = [480, 960]
        else:
            durations = [480]
        
        step = random.choice([-2, -1, 1, 2])
        current_note = scale[(scale.index(current_note) + step) % len(scale)]
        
        melody.append({
            'note': current_note,
            'duration': random.choice(durations),
            'velocity': random.randint(60, 100)
        })
    
    return melody, params

# ===================== AUDIO SYNTHESIS =====================
def midi_to_freq(note):
    """Convert MIDI note number to frequency"""
    return 440.0 * (2 ** ((note - 69) / 12))

def synthesize_wav(midi_data, output_file, sample_rate=44100):
    """Convert MIDI data to WAV using basic synthesis"""
    # Calculate total duration in seconds
    total_ticks = sum(n['duration'] for n in midi_data)
    ticks_per_beat = 480  # Standard MIDI ticks per quarter note
    tempo = 500000  # Default tempo (120 BPM)
    total_time = mido.tick2second(total_ticks, ticks_per_beat, tempo)
    
    # Create empty audio buffer
    audio = np.zeros(int(total_time * sample_rate))
    
    current_sample = 0
    for note in midi_data:
        freq = midi_to_freq(note['note'])
        duration = mido.tick2second(note['duration'], ticks_per_beat, tempo)
        t = np.linspace(0, duration, int(duration * sample_rate))
        wave = 0.3 * np.sin(2 * np.pi * freq * t)
        
        # Apply ADSR envelope
        attack = 0.05
        decay = 0.1
        sustain_level = 0.7
        release = 0.2
        
        envelope = np.ones_like(wave)
        n_attack = int(attack * sample_rate)
        n_decay = int(decay * sample_rate)
        n_release = int(release * sample_rate)
        
        # Attack
        envelope[:n_attack] = np.linspace(0, 1, n_attack)
        # Decay
        envelope[n_attack:n_attack+n_decay] = np.linspace(1, sustain_level, n_decay)
        # Sustain
        envelope[n_attack+n_decay:-n_release] = sustain_level
        # Release
        envelope[-n_release:] = np.linspace(sustain_level, 0, n_release)
        
        wave *= envelope
        wave *= note['velocity'] / 127  # Velocity scaling
        
        end_sample = current_sample + len(wave)
        if end_sample > len(audio):
            audio = np.pad(audio, (0, end_sample - len(audio)))
        
        audio[current_sample:end_sample] += wave
        current_sample += len(wave)
    
    # Normalize and save
    audio /= np.max(np.abs(audio))
    wavfile.write(output_file, sample_rate, (audio * 32767).astype(np.int16))

# ===================== MAIN INTERFACE =====================
def main():
    print("🎵 AI Melody Generator 🎵")
    print("Describe the melody you want (e.g., 'dark and foreboding')")
    user_input = input("> ")
    
    melody, params = generate_melody_from_text(user_input)
    output_base = "generated_melody"
    
    # Save MIDI
    mid = MidiFile()
    track = MidiTrack()
    mid.tracks.append(track)
    track.append(MetaMessage('set_tempo', tempo=mido.bpm2tempo(params['tempo'])))
    
    for note in melody:
        track.append(Message('note_on', note=note['note'], 
                         velocity=note['velocity'], time=0))
        track.append(Message('note_off', note=note['note'], 
                         velocity=0, time=note['duration']))
    
    mid.save(f"{output_base}.mid")
    
    # Generate WAV
    synthesize_wav(melody, f"{output_base}.wav")
    
    print(f"\n🎶 Created '{output_base}.mid' and '{output_base}.wav' with:")
    print(f"- Scale: {params['scale'].title()}")
    print(f"- Tempo: {params['tempo']} BPM")
    print(f"- Mood: {user_input}")

if __name__ == "__main__":
    main()