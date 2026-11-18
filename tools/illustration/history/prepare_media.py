from pathlib import Path
from PIL import Image, ImageOps, ImageDraw
import subprocess, json, re

ROOT=Path(__file__).parent
SRC=ROOT.parent/'포트폴리오'
OUT=ROOT/'dist/assets'
FF=ROOT.parent/'커미션 자료 공유/Blender작업/reference-analysis/tools/bin/ffmpeg.exe'
items=[('DGU.mp4','dgu',5),('Until I Know.mp4','until-i-know',18),('MORGENSHTERN.mp4','morgenshtern',2),('05 ACTION - unwrap burger two bites aerial catch - 18s.mp4','character-acting',1),('CRITICAL - Critical Success.mp4','critical',3)]
meta=[]
for filename,slug,at in items:
    src=SRC/filename
    probe=subprocess.run([str(FF),'-hide_banner','-i',str(src)],capture_output=True,text=True,encoding='utf8',errors='replace').stderr
    (ROOT/'qa'/f'{slug}-metadata.txt').write_text(probe,encoding='utf8')
    dest=OUT/f'{slug}.mp4'
    if not dest.exists():
        scale='scale=960:-2' if slug=='until-i-know' else "scale='min(1280,iw)':-2"
        crf='27' if slug=='until-i-know' else '24'
        cmd=[str(FF),'-y','-v','error','-i',str(src),'-vf',scale,'-c:v','libx264','-preset','medium','-crf',crf,'-pix_fmt','yuv420p','-movflags','+faststart','-c:a','aac','-b:a','128k',str(dest)]
        subprocess.run(cmd,check=True)
    subprocess.run([str(FF),'-y','-v','error','-ss',str(at),'-i',str(src),'-frames:v','1','-vf','scale=960:-1',str(OUT/f'{slug}.jpg')],check=True)
    meta.append({'file':filename,'slug':slug,'bytes':dest.stat().st_size})
for n,src in enumerate(sorted([p for p in SRC.iterdir() if p.suffix.lower() in ('.png','.jpg')]),1):
    im=Image.open(src).convert('RGBA')
    im.thumbnail((1800,1800))
    im.save(OUT/f'illustration-{n:02}.webp',quality=88)
    meta.append({'file':src.name,'slug':f'illustration-{n:02}','size':im.size})
tiles=[]
for p in sorted(OUT.glob('*.jpg'))+sorted(OUT.glob('*.webp')):
    im=Image.open(p).convert('RGBA')
    tile=Image.new('RGB',(320,260),'#eeeeee')
    im.thumbnail((304,226))
    tile.paste(im,((320-im.width)//2,8),im)
    ImageDraw.Draw(tile).text((10,240),p.stem,fill='black')
    tiles.append(tile)
sheet=Image.new('RGB',(1280,260*((len(tiles)+3)//4)),'white')
for i,t in enumerate(tiles): sheet.paste(t,((i%4)*320,(i//4)*260))
sheet.save(ROOT/'qa/contact-sheet.jpg')
(ROOT/'qa/media.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps(meta,ensure_ascii=False,indent=2))
