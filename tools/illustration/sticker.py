"""Die-cut sticker maker for the illustration cards.

2026-11-18 rewrite. The first version (a060876:refine_assets.py, kept in
history/) filled enclosed gaps with a second, yellower cream through a hard
1-bit mask, so gaps looked pixelated and whites/creams were mixed.

Now there is a single paper colour. The artwork is "printed" on it (multiply),
so white areas of the drawing, gaps between figures and the border are all the
same colour, and every edge stays anti-aliased.
"""
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageOps
import random

PAPER = (255, 254, 247)
PAD = 28          # transparent margin around the artwork before the border
BORDER = 31       # MaxFilter size: 15px paper border
SEAL = 3          # outer-background flood cannot pass gaps narrower than 2*SEAL px


def _outer_flood(mask):
    """255 where `mask` (255 = passable) is connected to the canvas edge."""
    padded = ImageOps.expand(mask, 1, 255)
    ImageDraw.floodfill(padded, (0, 0), 128, thresh=0)
    return padded.crop((1, 1, mask.width + 1, mask.height + 1)).point(lambda v: 255 if v == 128 else 0)


def _art_alpha(src):
    """Soft alpha of the drawing. Uses the file's own alpha when it has one."""
    alpha = src.getchannel('A')
    if alpha.getextrema()[0] < 250:
        return alpha
    # Opaque source: remove the near-white canvas connected to the outside.
    rgb = src.convert('RGB')
    lo = ImageChops.darker(ImageChops.darker(rgb.getchannel('R'), rgb.getchannel('G')), rgb.getchannel('B'))
    hi = ImageChops.lighter(ImageChops.lighter(rgb.getchannel('R'), rgb.getchannel('G')), rgb.getchannel('B'))
    white = ImageChops.multiply(lo.point(lambda v: 255 if v > 232 else 0),
                                ImageChops.subtract(hi, lo).point(lambda v: 255 if v < 22 else 0))
    # Erode first so the flood cannot leak into white clothes through line gaps.
    eroded = white.filter(ImageFilter.MinFilter(2 * SEAL + 1))
    background = ImageChops.multiply(_outer_flood(eroded).filter(ImageFilter.MaxFilter(2 * SEAL + 1)), white)
    return ImageOps.invert(background)


def make_sticker(src, n):
    src = src.convert('RGBA')
    alpha = _art_alpha(src)
    # Print on paper: multiply the white-composited drawing by the paper colour.
    flat = Image.new('RGB', src.size, 'white')
    flat.paste(src.convert('RGB'), mask=src.getchannel('A'))
    art = ImageChops.multiply(flat, Image.new('RGB', src.size, PAPER)).convert('RGBA')
    art.putalpha(alpha)

    box = alpha.point(lambda v: 255 if v > 16 else 0).getbbox()
    art = ImageOps.expand(art.crop(box), PAD, (0, 0, 0, 0))
    solid = art.getchannel('A').point(lambda v: 255 if v > 16 else 0)
    border = solid.filter(ImageFilter.MaxFilter(BORDER))

    # A lightly uneven die-cut outline; the artwork itself is not warped.
    rng = random.Random(170 + n); step = 65; w, h = art.size
    xs = list(range(0, w, step)) + [w]; ys = list(range(0, h, step)) + [h]
    pts = {(x, y): (x + rng.uniform(-4, 4), y + rng.uniform(-4, 4)) for y in ys for x in xs}
    mesh = []
    for y0, y1 in zip(ys, ys[1:]):
        for x0, x1 in zip(xs, xs[1:]):
            quad = sum((pts[p] for p in [(x0, y0), (x0, y1), (x1, y1), (x1, y0)]), ())
            mesh.append(((x0, y0, x1, y1), quad))
    border = border.transform((w, h), Image.Transform.MESH, mesh, Image.Resampling.BICUBIC)

    # Paper = border plus every gap it encloses, at full resolution (smooth after downscale).
    outside = _outer_flood(border.point(lambda v: 255 if v < 128 else 0))
    paper = ImageChops.lighter(border, ImageOps.invert(outside))
    paper = ImageChops.lighter(paper, solid)

    sticker = Image.new('RGBA', art.size, PAPER + (0,))
    sticker.putalpha(paper)
    sticker.alpha_composite(art)
    sticker.thumbnail((1500, 1500))
    return sticker
