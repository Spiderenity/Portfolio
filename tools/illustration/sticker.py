from PIL import Image, ImageOps, ImageDraw, ImageFilter
import random

def make_sticker(src, n):
    src=src.convert('RGBA')
    rgb=Image.new('RGB',src.size,'white');rgb.paste(src,mask=src.getchannel('A'))
    # Illustration 02 has enclosed transparent gaps with arbitrary hidden RGB.
    # Use the white-composited artwork before replacing alpha, so those RGB
    # values cannot become opaque black patches or blocky compression artifacts.
    if n == 2:
        src=rgb.convert('RGBA')
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
    return sticker

