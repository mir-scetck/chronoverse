# CHRONOVERSE Academy — Baghdad c. 800 CE Media Checklist

## 1. Educational Plates (`src/assets/images/`)
All five core historical plates are bundled and verified locally:
- `baghdad_round_city_overview_1795208338186.jpg` — Aerial reconstruction of the Round City (`round-city-overview`)
- `baghdad_courtyard_fountain_1795208338331.jpg` — Colonnaded Palace Courtyard & Octagonal Fountain (`courtyard-fountain`)
- `abbasid_scholars_astrolabe_1795208339969.jpg` — Brass Planispheric Astrolabe, Rag Paper & Reed Pens (`scholars-astrolabe`)
- `karkh_spice_market_1795208339920.jpg` — Karkh Spice & Textile Bazaar (`karkh-spice-market`)
- `abbasid_water_clock_brass_1795208339767.jpg` — Brass Water Clock & Abbasid Gold Dinar (`water-clock-brass`)

## 2. Optional Drop-In HD Explainer Videos (`public/assets/videos/baghdad/`)
When MP4 files are omitted, `LessonVideoPlayer` automatically detects the absence via `HEAD` content-type check and runs **Animated Storyboard & Narration Mode** (Ken Burns motion, bilingual captions, chapter pills, and clickable transcript). To enable native HD MP4 playback, place H.264 `.mp4` files and `.vtt` subtitle tracks matching these IDs:
- `overview-baghdad-800.mp4` (+ `.en.vtt`, `.ar.vtt`)
- `tour-golden-gate.mp4`
- `tour-great-courtyard.mp4`
- `tour-audience-hall.mp4`
- `tour-palace-garden.mp4`
- `tour-scholars-library.mp4`
- `tour-market-street.mp4`
- `detail-astrolabe.mp4`, `detail-water-clock.mp4`, `detail-gold-dinar.mp4`, `detail-manuscript-table.mp4`, `detail-court-fountain.mp4`, `detail-shatranj-board.mp4`, `detail-oud.mp4`, `detail-spice-stall.mp4`

## 3. Optional Adaptive Background Music MP3s (`public/assets/audio/music/baghdad/`)
When MP3 files are omitted, `MusicManager` automatically synthesizes authentic Abbasid maqam motifs (Oud & Ney in Hijaz, Rast, Bayati, and Nahawand). To override with studio recordings:
- `golden-gate.mp3` (Maqam Rast)
- `great-courtyard.mp3` (Maqam Bayati)
- `audience-hall.mp3` (Maqam Hijaz)
- `palace-garden.mp3` (Maqam Nahawand)
- `scholars-library.mp3` (Maqam Bayati)
- `karkh-market.mp3` (Maqam Rast)
