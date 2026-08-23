export interface Track {
  slug: string
  title: string
  artist: string
  album: string
}

/**
 * Catalogo del reproductor de bienvenida.
 *
 * Los archivos viven en `public/music/<slug>.mp3` y su caratula en
 * `public/music/<slug>.jpg`. Todas las pistas estan normalizadas a
 * -18 LUFS (EBU R128, ganancia lineal) para que ninguna suene mas
 * fuerte que otra al entrar.
 *
 * Para anadir una: normalizala al mismo nivel, deja el mp3 y el jpg en
 * `public/music/` con el mismo slug, y anade la entrada aqui.
 */
export const TRACKS: Track[] = [
  {
    slug:   "welcome-to-the-jungle",
    title:  "Welcome to the Jungle",
    artist: "Guns N' Roses",
    album:  "Appetite For Destruction",
  },
  {
    slug:   "seven-nation-army",
    title:  "Seven Nation Army",
    artist: "The White Stripes",
    album:  "Elephant",
  },
  {
    slug:   "paint-it-black",
    title:  "Paint It, Black",
    artist: "The Rolling Stones",
    album:  "Aftermath",
  },
  {
    slug:   "sympathy-for-the-devil",
    title:  "Sympathy for the Devil",
    artist: "The Rolling Stones",
    album:  "Beggars Banquet",
  },
  {
    slug:   "war-pigs",
    title:  "War Pigs",
    artist: "Black Sabbath",
    album:  "Paranoid",
  },
  {
    slug:   "go-with-the-flow",
    title:  "Go With the Flow",
    artist: "Queens of the Stone Age",
    album:  "Songs for the Deaf",
  },
  {
    slug:   "underdog",
    title:  "Underdog",
    artist: "Kasabian",
    album:  "West Ryder Pauper Lunatic Asylum",
  },
  {
    slug:   "california-queen",
    title:  "California Queen",
    artist: "Wolfmother",
    album:  "Cosmic Egg",
  },
]

export const trackAudio = (t: Track) => `/music/${t.slug}.mp3`
export const trackCover = (t: Track) => `/music/${t.slug}.jpg`

/** Una pista al azar; se elige una sola vez por visita. */
export function randomTrack(): Track {
  return TRACKS[Math.floor(Math.random() * TRACKS.length)]
}
