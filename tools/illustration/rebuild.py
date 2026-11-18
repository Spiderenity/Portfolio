"""Rebuild only the requested illustration. Defaults to a separate review folder."""
from pathlib import Path
import argparse
from PIL import Image, ImageOps
from sticker import make_sticker

ROOT = Path(__file__).resolve().parents[2]
SOURCES = {1: '1 (1).jpg', 2: '1 (1).png', 3: '1 (2).png',
           4: '1 (8).png', 5: '1 (9).png', 6: '1 (5).png'}

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('number', type=int, choices=SOURCES)
    parser.add_argument('--source', type=Path, help='Override artwork source')
    parser.add_argument('--output-dir', type=Path, default=ROOT/'tools/illustration/output')
    parser.add_argument('--publish-assets', action='store_true', help='Write directly to dist/assets')
    args = parser.parse_args()
    source = args.source or ROOT.parent/'포트폴리오'/SOURCES[args.number]
    image = Image.open(source).convert('RGBA')
    if args.number == 6:
        import io
        image.thumbnail((1800, 1800))
        encoded = io.BytesIO()
        image.save(encoded, format='WEBP', quality=88)
        encoded.seek(0)
        image = Image.open(encoded).convert('RGBA')
        image.thumbnail((1100, 1000))
        image = ImageOps.expand(image, 45, (255, 255, 255, 255))
        # Preserve the exact currently published white-postage contour.
        template = Image.open(Path(__file__).parent/'stamp-white-06-alpha.png')
        if image.size != template.size:
            raise ValueError('Stamp source ratio/size changed; adjust the frame explicitly instead of stretching it.')
        image.putalpha(template)
        name = 'stamp-white-06.webp'
    else:
        # No lossy pre-encode: it damaged the hidden RGB under transparent pixels.
        image.thumbnail((1800, 1800))
        image = make_sticker(image, args.number)
        name = f'sticker-{args.number:02}.webp'
    destination = ROOT/'dist/assets' if args.publish_assets else args.output_dir
    destination.mkdir(parents=True, exist_ok=True)
    image.save(destination/name, quality=94)
    print(f'{source} -> {destination/name} ({image.width}x{image.height})')

if __name__ == '__main__':
    main()
