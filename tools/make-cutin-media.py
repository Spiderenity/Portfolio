"""컷인 컬렉션의 교차검증수사대·민트 웹용 영상과 썸네일을 만든다(2026-11-23). 둘 다 대성공.
쓰는 법(사이트 루트에서): python tools/make-cutin-media.py   (ffmpeg, Pillow 필요)
  crosscheck  ← ../교차검증수사대/04_출력/대성공-목업.mp4  → 1280x720 30fps
  mint        ← ../민트 컷인/04_출력/WebP-6종-6초/민트-페어-대성공.webp(투명) → 흰 바탕 724x542 18fps
썸네일은 판정 글자가 다 나온 시점의 한 장.
"""
import subprocess, tempfile
from pathlib import Path
from PIL import Image

SITE = Path(__file__).resolve().parents[1]
WORK = SITE.parent
A = SITE / 'dist/assets'
X264 = ['-c:v', 'libx264', '-preset', 'slow', '-crf', '23', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an']


def run(*a):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', *map(str, a)], check=True)


def crosscheck(thumb_at=5.5):
    src = WORK / '교차검증수사대/04_출력/대성공-목업.mp4'
    run('-i', src, '-vf', 'fps=30,scale=1280:720:flags=lanczos', *X264, A / 'crosscheck.mp4')
    run('-ss', thumb_at, '-i', src, '-frames:v', 1, '-vf', 'scale=1280:720:flags=lanczos', '-q:v', 3, A / 'crosscheck.jpg')


def mint(thumb_at=5.0):
    im = Image.open(WORK / '민트 컷인/04_출력/WebP-6종-6초/민트-페어-대성공.webp')
    n = im.n_frames; fps = 18
    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)
        for j in range(n):
            im.seek(j)
            bg = Image.new('RGBA', im.size, (255, 255, 255, 255)); bg.alpha_composite(im.convert('RGBA'))
            bg = bg.convert('RGB').crop((0, 0, 724, 542))
            bg.save(tmp / f'f{j:03d}.png', compress_level=1)
            if j == round(thumb_at * fps):
                bg.save(A / 'mint.jpg', quality=90)
        run('-framerate', fps, '-i', tmp / 'f%03d.png', *X264, A / 'mint.mp4')


if __name__ == '__main__':
    crosscheck(); mint()
    for f in ('crosscheck.mp4', 'crosscheck.jpg', 'mint.mp4', 'mint.jpg'):
        print(f, (A / f).stat().st_size)
