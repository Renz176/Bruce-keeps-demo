from pathlib import Path
import random
import sys

try:
    from PIL import Image, ImageDraw, ImageFont
except Exception:
    import subprocess
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'Pillow'])
    from PIL import Image, ImageDraw, ImageFont

root = Path(r'c:\Users\DESKTOP\Coding\1st customer')
images_dir = root / 'images'
audio_dir = root / 'audio'
images_dir.mkdir(exist_ok=True)
audio_dir.mkdir(exist_ok=True)

for i in range(1, 13):
    img = Image.new('RGB', (1200, 1200), '#f8efe9')
    draw = ImageDraw.Draw(img)

    for x in range(0, 1200, 40):
        draw.rectangle([x, 0, x + 2, 1200], fill=(245, 231, 226))
    for y in range(0, 1200, 40):
        draw.rectangle([0, y, 1200, y + 2], fill=(245, 231, 226))

    for _ in range(1200):
        x = random.randint(0, 1199)
        y = random.randint(0, 1199)
        draw.point((x, y), fill=(233, 211, 204))

    draw.rounded_rectangle([40, 40, 1160, 1160], radius=26, outline='#d9b6ad', width=6)
    draw.rounded_rectangle([85, 85, 1115, 1115], radius=20, outline='#f2dace', width=2)

    try:
        font = ImageFont.truetype('arial.ttf', 80)
    except Exception:
        font = ImageFont.load_default()

    text = 'YOUR PHOTO'
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    x = (1200 - tw) / 2
    y = (1200 - th) / 2
    draw.text((x, y), text, fill='#6f4d4a', font=font)
    img.save(images_dir / f'photo{i}.jpg', 'JPEG', quality=92)

(audio_dir / 'music.mp3').write_bytes(b'')
print('Assets created successfully.')
