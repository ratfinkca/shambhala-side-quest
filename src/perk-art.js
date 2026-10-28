// Small procedural illustrations inherit each festival theme's palette.
const drawings={
 surfer:'<path d="M14 82q15-20 30 0t30 0t30 0M18 97q15-15 30 0t30 0t24 0"/><ellipse cx="61" cy="74" rx="28" ry="5"/><circle cx="62" cy="27" r="8"/><path d="m60 36-8 20 17 1 8 16M53 53 40 71m18-30-20 5m21-6 20 10"/>',
 battery:'<rect x="29" y="25" width="62" height="76" rx="10"/><path d="M48 25v-8h24v8"/><path class="perk-solid" d="m68 35-25 31h18l-7 26 26-34H62z"/>',
 encore:'<circle cx="60" cy="58" r="24"/><path d="M60 20V10m0 86v12M22 58H10m86 0h12M33 31l-9-9m63 9 9-9M33 85l-9 9m63-9 9 9M49 52q11-15 23 0M47 69q13 12 26 0"/><path d="M36 108q24-12 48 0"/>',
 sweet:'<path class="perk-solid" d="m28 47-19-9 4 23-4 22 19-10m64-26 19-9-4 23 4 22-19-10"/><rect x="28" y="39" width="64" height="45" rx="14"/><path d="m40 40 17 43m7-43 16 40M16 52l9 8-9 10m88-18-9 8 9 10"/><path d="M42 21v9m-5-5h10m36 65v12m-6-6h12"/>',
};
export function renderPerkArt(id){
 if(!drawings[id])return '';
 return `<svg class="perk-art" viewBox="0 0 120 120" aria-hidden="true" focusable="false"><circle class="perk-back" cx="60" cy="60" r="53"/><g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${drawings[id]}</g></svg>`;
}
