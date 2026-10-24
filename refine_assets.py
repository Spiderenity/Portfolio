from pathlib import Path
from PIL import Image, ImageOps, ImageDraw, ImageFilter
import random, struct, subprocess
ROOT=Path(__file__).parent
assets=ROOT/'dist/assets'
for n in [1,2,3,5]:
    src=Image.open(assets/f'illustration-{n:02}.webp').convert('RGBA')
    rgb=Image.new('RGB',src.size,'white');rgb.paste(src,mask=src.getchannel('A'))
    # Remove only near-white pixels connected to the outer canvas.
    pixels=rgb.load(); mask=Image.new('L',rgb.size); mp=mask.load()
    for y in range(rgb.height):
        for x in range(rgb.width):
            r,g,b=pixels[x,y];mp[x,y]=255 if min(r,g,b)>232 and max(r,g,b)-min(r,g,b)<22 else 0
    padded=ImageOps.expand(mask,1,255);ImageDraw.floodfill(padded,(0,0),128,thresh=0)
    bg=padded.crop((1,1,src.width+1,src.height+1)).point(lambda v:255 if v==128 else 0)
    alpha=ImageOps.invert(bg);src.putalpha(alpha)
    box=alpha.getbbox();src=src.crop(box)
    pad=28;src=ImageOps.expand(src,pad,(0,0,0,0));alpha=src.getchannel('A')
    border=alpha.filter(ImageFilter.MaxFilter(31))
    # A lightly uneven die-cut outline; the artwork itself is not warped.
    rng=random.Random(170+n);step=65;w,h=src.size
    xs=list(range(0,w,step))+[w];ys=list(range(0,h,step))+[h]
    pts={(x,y):(x+rng.uniform(-4,4),y+rng.uniform(-4,4)) for y in ys for x in xs}
    mesh=[]
    for y0,y1 in zip(ys,ys[1:]):
        for x0,x1 in zip(xs,xs[1:]):
            quad=sum((pts[p] for p in [(x0,y0),(x0,y1),(x1,y1),(x1,y0)]),())
            mesh.append(((x0,y0,x1,y1),quad))
    border=border.transform((w,h),Image.Transform.MESH,mesh,Image.Resampling.BICUBIC)
    sticker=Image.new('RGBA',src.size,(255,254,247,0));sticker.putalpha(border);sticker.alpha_composite(src)
    sticker.thumbnail((1500,1500))
    empty=sticker.getchannel('A').point(lambda v:255 if v<128 else 0)
    padded=ImageOps.expand(empty,1,255);ImageDraw.floodfill(padded,(0,0),128,thresh=0)
    holes=padded.crop((1,1,sticker.width+1,sticker.height+1)).point(lambda v:255 if v==255 else 0)
    sticker.paste(Image.new('RGBA',sticker.size,(255,252,235,255)),mask=holes)
    sticker.save(assets/f'sticker-{n:02}.webp',quality=94)

sheet=Image.new('RGB',(1200,600),'#f6ed61')
for i,n in enumerate([1,2,3,5]):
    im=Image.open(assets/f'sticker-{n:02}.webp');im.thumbnail((225,530));sheet.paste(im,(i*240+(240-im.width)//2,25),im)
    ImageDraw.Draw(sheet).text((i*240+10,575),f'sticker-{n:02}',fill='black')
sheet.save(ROOT/'qa/sticker-review.jpg')

for p in (ROOT/'dist/fonts').glob('*.ttf'):
    b=p.read_bytes();count=struct.unpack_from('>H',b,4)[0]
    for i in range(count):
        tag,_,off,size=struct.unpack_from('>4sIII',b,12+i*16)
        if tag!=b'name':continue
        _,cnt,strings=struct.unpack_from('>HHH',b,off);rows={}
        for j in range(cnt):
            platform,enc,lang,name,length,offset=struct.unpack_from('>HHHHHH',b,off+6+j*12)
            if name in (0,13,14) and platform==3:rows[name]=b[off+strings+offset:off+strings+offset+length].decode('utf-16-be')
        p.with_suffix('.license.txt').write_text('\n\n'.join(str(k)+': '+v for k,v in sorted(rows.items())),encoding='utf8')
print('Sticker copies and embedded font notices prepared.')
