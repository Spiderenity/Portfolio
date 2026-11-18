// Preserve the original artwork byte-for-byte inside a vector postage frame.
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.resolve(root,'../포트폴리오/1 (8).png'));
const width=source.readUInt32BE(16),height=source.readUInt32BE(20);
const pad=45,w=width+pad*2,h=height+pad*2;
const holes=[];
for(let x=0;x<w;x+=24)holes.push(`<path d="M${x} 0h8v8h-8z M${x} ${h-8}h8v8h-8z"/>`);
for(let y=0;y<h;y+=24)holes.push(`<path d="M0 ${y}h8v8h-8z M${w-8} ${y}h8v8h-8z"/>`);
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs><mask id="stamp"><rect width="${w}" height="${h}" fill="white"/><g fill="black">${holes.join('')}</g></mask></defs><g mask="url(#stamp)"><rect width="${w}" height="${h}" fill="white"/><image x="${pad}" y="${pad}" width="${width}" height="${height}" href="data:image/png;base64,${source.toString('base64')}"/></g></svg>`;
fs.writeFileSync(path.join(root,'dist/assets/stamp-darkest-dungeon-04.svg'),svg);
console.log(`Illustration 04: ${width}x${height}, ${w}x${h} postage frame; original PNG preserved`);
