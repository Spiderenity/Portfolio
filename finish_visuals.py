from pathlib import Path
from PIL import Image,ImageDraw,ImageOps
import subprocess
root=Path(__file__).parent;assets=root/'dist/assets'
for n in [4,6]:
 im=Image.open(assets/f'illustration-{n:02}.webp').convert('RGBA');im.thumbnail((1100,1000))
 stamp=ImageOps.expand(im,45,(255,252,235,255));d=ImageDraw.Draw(stamp);w,h=stamp.size
 for x in range(13,w,28):
  for y in [0,h]:d.ellipse((x-9,y-9,x+9,y+9),fill=(0,0,0,0))
 for y in range(13,h,28):
  for x in [0,w]:d.ellipse((x-9,y-9,x+9,y+9),fill=(0,0,0,0))
 stamp.save(assets/f'stamp-{n:02}.webp',quality=94)
ff=root.parent/'커미션 자료 공유/Blender작업/reference-analysis/tools/bin/ffmpeg.exe'
starts={'dgu':3.5,'until-i-know':4,'morgenshtern':16,'character-acting':6,'critical':2}
for slug,at in starts.items():
 subprocess.run([str(ff),'-y','-v','error','-ss',str(at),'-i',str(assets/f'{slug}.mp4'),'-t',str({'until-i-know':8,'character-acting':10,'morgenshtern':7}.get(slug,4)),'-an','-vf','scale=640:-2','-c:v','libx264','-preset','fast','-crf','27','-movflags','+faststart',str(assets/f'{slug}-preview.mp4')],check=True)
 # Candidate sheet for selecting thumbnails, without modifying source footage.
 for j,t in enumerate([at,max(0,at-1),at+1]):
  subprocess.run([str(ff),'-y','-v','error','-ss',str(t),'-i',str(assets/f'{slug}.mp4'),'-frames:v','1','-vf','scale=640:-1',str(root/f'qa/{slug}-{j}.jpg')],check=True)
sheet=Image.new('RGB',(960,900),'#f6ed61')
for row,slug in enumerate(starts):
 for col in range(3):
  im=Image.open(root/f'qa/{slug}-{col}.jpg');im.thumbnail((312,155));sheet.paste(im,(col*320,row*180));ImageDraw.Draw(sheet).text((col*320,row*180+160),f'{slug}-{col}',fill='black')
sheet.save(root/'qa/thumbnail-options.jpg')
html=root/'dist/index.html';s=html.read_text(encoding='utf-8-sig').replace('HWANG SEOYOUNG','Hwang Seoyeong').replace('화면 밖으로<br>이어지는 작업.','프로그램 · 게임').replace('프로그램과 게임, 그리고 작은 실험들.','직접 만든 프로그램과 게임입니다.').replace('안녕하세요.<br>황서영입니다.','황서영').replace('2D 애니메이션과 모션그래픽을 만듭니다.<br>일러스트레이션부터 프로그램과 게임까지,<br>다양한 방식으로 작업을 이어갑니다.','2D 애니메이션 · 모션그래픽<br>Hwang Seoyeong').replace('<script src="app.js" defer></script>','<script src="peel.js" defer></script><script src="app.js" defer></script>');html.write_text(s,encoding='utf8')
print('Postage stamps, preview clips and copy ready.')
