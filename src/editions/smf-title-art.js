// Imported only by the festival edition. Never pull branded titles into the
// shared pixel actor/items modules or the generic game's bundle.
const titles={
 'forest-freakout':new URL('../pixel-art/assets/title-forest-freakout-v1.webp',import.meta.url).href,
 'moonlit-mycelium':new URL('../pixel-art/assets/title-moonlit-mycelium-v1.webp',import.meta.url).href,
 'neon-field-trip':new URL('../pixel-art/assets/title-neon-field-trip-v1.webp',import.meta.url).href,
};
export const smfTitleArt=id=>titles[id]??titles['forest-freakout'];
