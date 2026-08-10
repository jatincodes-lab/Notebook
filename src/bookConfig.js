export const IMAGE_SLOTS = [
  {
    slotKey: 'intro-main',
    pageNumber: 1,
    pageName: 'Hello, love',
    label: 'Main beginning photo',
    caption: 'where it all began ♡',
    fallbackUrl: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1000&q=85',
  },
  {
    slotKey: 'little-left',
    pageNumber: 3,
    pageName: 'Little things',
    label: 'Left Polaroid',
    caption: 'laughing until it hurts',
    fallbackUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1000&q=85',
  },
  {
    slotKey: 'little-right',
    pageNumber: 3,
    pageName: 'Little things',
    label: 'Right Polaroid',
    caption: 'our quiet kind of happy',
    fallbackUrl: 'https://images.unsplash.com/photo-1520857014576-2c4f4c972b57?auto=format&fit=crop&w=1000&q=85',
  },
  {
    slotKey: 'gallery-left',
    pageNumber: 5,
    pageName: 'Our photos',
    label: 'Left gallery photo',
    caption: 'you + me',
    fallbackUrl: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=1000&q=85',
  },
  {
    slotKey: 'gallery-center',
    pageNumber: 5,
    pageName: 'Our photos',
    label: 'Center gallery photo',
    caption: 'always laughing',
    fallbackUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1000&q=85',
  },
  {
    slotKey: 'gallery-right',
    pageNumber: 5,
    pageName: 'Our photos',
    label: 'Right gallery photo',
    caption: 'home is you',
    fallbackUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=85',
  },
]

export const IMAGE_SLOT_MAP = Object.fromEntries(IMAGE_SLOTS.map((slot) => [slot.slotKey, slot]))