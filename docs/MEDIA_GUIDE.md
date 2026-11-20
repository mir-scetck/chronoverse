# CHRONOVERSE Academy Media & Credits Guide

## Attribution & Historical Integrity
Every architectural plate, artifact diagram, video script, and dialogue turn carries one of four historical transparency badges:
1. **Documented** — Corroborated by primary medieval chronicles (al-Ya'qubi, al-Tabari, al-Khatib al-Baghdadi, Ibn al-Nadim, Annales Regni Francorum) or surviving material culture.
2. **Traditional** — Widely transmitted in historical tradition (e.g., early Samarkand papermaking transfer to Baghdad) where contemporary archival proof is indirect.
3. **Dramatized** — Composite reconstruction or literary framing (e.g., interior palace stucco layout where no complete archaeological plan survives).
4. **Uncertain** — Scholarly details open to historical debate for c. 800 CE.

## Audio & Video Behavior Rules
- **Study Audio on the website** is **muted by default** (`studyAudioEnabled: false`) and only starts upon explicit student interaction.
- **3D Baghdad Exhibit Music** crossfades cleanly (2.5s) across the 6 districts and automatically ducks by `-13 dB` whenever character dialogue, Web Speech TTS, or a Video Modal Player opens.
- **Website Study Audio yields automatically** whenever the embedded 3D WebGL renderer mounts so two music layers never overlap.
