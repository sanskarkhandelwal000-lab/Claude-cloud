"""Builds the motion-blur background for the 'After Dark' story poster.

Takes the garba crowd photo, extends it to 9:16 with the dancers as the hero,
then fakes an in-camera long exposure: spin blur in the sky, zoom streaks
toward the edges, a sharp pocket on the dancers, a ghosted shake, light leaks
and a rich rani-pink / saffron grade.
Usage: python3 motion_bg.py <source> <out.png>
"""
import sys
import numpy as np
from PIL import Image, ImageFilter, ImageOps, ImageDraw, ImageEnhance

W, H = 2160, 3840
src = Image.open(sys.argv[1]).convert('RGB')
sw = src.width

def fit(crop_box, width):
    c = src.crop(crop_box)
    return c.resize((width, round(c.height * width / c.width)), Image.LANCZOS)

# --- 1. Compose: dancers large in the middle third, old poster type cropped away ---
canvas = Image.new('RGB', (W, H))
bw = int(W * 1.32)
x0 = (W - bw) // 2
crowd = fit((0, 470, sw, 1105), bw)                       # stage + dancers, ~2595px tall
top = ImageOps.flip(fit((0, 450, sw, 760), bw)).resize((bw, 1500))
bottom = ImageOps.flip(fit((0, 900, sw, 1105), bw)).resize((bw, 1100))
canvas.paste(top, (x0, 0))
canvas.paste(bottom, (x0, H - 1100))
cy0 = 760
mask = Image.new('L', crowd.size, 255)
d = ImageDraw.Draw(mask)
for i in range(160):                                       # feathered seams
    v = int(255 * i / 160)
    d.line((0, i, bw, i), fill=v)
    d.line((0, crowd.height - 1 - i, bw, crowd.height - 1 - i), fill=v)
canvas.paste(crowd, (x0, cy0), mask)
canvas = ImageEnhance.Color(canvas).enhance(1.35)

# --- 2. Blurs ---
def zoom_blur(img, c, amount, n):
    acc = np.zeros((H, W, 3), np.float32)
    for k in range(n):
        s = 1 + amount * k / (n - 1)
        z = img.resize((round(W * s), round(H * s)), Image.BILINEAR)
        l, t = round(c[0] * s - c[0]), round(c[1] * s - c[1])
        acc += np.asarray(z.crop((l, t, l + W, t + H)), np.float32)
    return acc / n

def spin_blur(img, c, deg, n):
    acc = np.zeros((H, W, 3), np.float32)
    for k in range(n):
        a = -deg / 2 + deg * k / (n - 1)
        acc += np.asarray(img.rotate(a, Image.BILINEAR, center=c), np.float32)
    return acc / n

base = np.asarray(canvas, np.float32)
zoom = zoom_blur(canvas, (1080, 2050), .12, 30)
spin = spin_blur(canvas, (1080, 640), 26, 40)

yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
core = np.clip(1 - np.sqrt(((xx - 1080) / 1150) ** 2 + ((yy - 2080) / 760) ** 2), 0, 1) ** .45
core = np.asarray(Image.fromarray((core * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(80)), np.float32)[..., None] / 255
topm = np.clip((1500 - yy) / 600, 0, 1)[..., None]

blurred = topm * spin + (1 - topm) * zoom
img = core * base + (1 - core) * blurred
shift = np.roll(np.roll(blurred, 30, axis=1), -22, axis=0)   # camera-shake echo
img = np.maximum(img, img * .82 + shift * .24)

# --- 3. Grade: split-tone (purple shadows, saffron highlights), keep the lehenga colours ---
lum = (img[..., 0] * .3 + img[..., 1] * .55 + img[..., 2] * .15)[..., None] / 255
shadow, high = np.array([40, 6, 52], np.float32), np.array([255, 150, 60], np.float32)
img = img * .78 + (shadow * (1 - lum) + high * lum) * .22 * (0.6 + lum)
img = np.clip((img - 8) * 1.18, 0, 255)

# light leaks (screen blend): rani on the left, saffron on the right, gold glow behind the title
def blob(cx, cy, r, col, a):
    f = np.exp(-(((xx - cx) ** 2 + (yy - cy) ** 2) / (2 * r * r)))[..., None]
    return np.array(col, np.float32) * f * a
leak = blob(-100, 1500, 650, (255, 30, 120), .45) + blob(2300, 1150, 600, (255, 120, 20), .4) \
     + blob(1080, 820, 700, (255, 170, 60), .16) + blob(2250, 2700, 500, (255, 40, 140), .3)
img = 255 - (255 - img) * (255 - np.clip(leak, 0, 255)) / 255

# S-curve for punch: deep blacks, bright highlights
t = img / 255
img = 255 * np.clip(t * t * (3 - 2 * t) * .7 + t * .3, 0, 1) ** 1.12

# vignette + darker floor for the info block
vig = 1 - .45 * np.clip(np.sqrt(((xx - 1080) / 1400) ** 2 + ((yy - 1900) / 2200) ** 2), 0, 1) ** 2.4
shade = 1 - .72 * np.clip((yy - 2650) / 1190, 0, 1) ** 1.2
img *= (vig * shade)[..., None]

rng = np.random.default_rng(1710)
img += rng.normal(0, 6.5, (H, W, 1)).astype(np.float32)
Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).save(sys.argv[2])
print('saved', sys.argv[2])
