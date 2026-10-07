"""Builds the motion-blur background for the 'After Dark' story poster.

Takes the garba crowd photo, extends it to 9:16, then fakes an in-camera
long exposure: spin blur on the ceiling/sky, zoom blur toward the edges,
a sharp pocket on the dancers, a ghosted shake, and a warm Navratri grade.
Usage: python3 motion_bg.py <source> <out.png>
"""
import sys
import numpy as np
from PIL import Image, ImageFilter, ImageOps, ImageDraw

W, H = 2160, 3840
src = Image.open(sys.argv[1]).convert('RGB')
sw = src.width

def fit(crop_box, width):
    c = src.crop(crop_box)
    return c.resize((width, round(c.height * width / c.width)), Image.LANCZOS)

# --- 1. Extend the crowd shot to 9:16 (old poster type is cropped away) ---
canvas = Image.new('RGB', (W, H))
bw = int(W * 1.15)
crowd = fit((0, 435, sw, 1100), bw)                      # dancers + DJ stage
top = ImageOps.flip(fit((0, 435, sw, 760), bw)).resize((bw, 1300))
bottom = ImageOps.flip(fit((0, 880, sw, 1100), bw)).resize((bw, 900))
x0 = (W - bw) // 2
canvas.paste(top, (x0, 0))
canvas.paste(bottom, (x0, H - 900))
cy0 = 1080
mask = Image.new('L', crowd.size, 255)
d = ImageDraw.Draw(mask)
for i in range(120):                                      # feathered seam into the extensions
    d.rectangle((0, i, bw, i), fill=int(255 * i / 120))
    d.rectangle((0, crowd.height - 1 - i, bw, crowd.height - 1 - i), fill=int(255 * i / 120))
canvas.paste(crowd, (x0, cy0), mask)

# --- 2. Blurs ---
def zoom_blur(img, c, amount, n):
    acc = np.zeros((H, W, 3), np.float32)
    for k in range(n):
        s = 1 + amount * k / (n - 1)
        nw, nh = round(W * s), round(H * s)
        z = img.resize((nw, nh), Image.BILINEAR)
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
zoom = zoom_blur(canvas, (1080, 2150), .09, 28)
spin = spin_blur(canvas, (1080, 520), 22, 36)
soft = np.asarray(canvas.filter(ImageFilter.GaussianBlur(3)), np.float32)

yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
core = np.clip(1 - np.sqrt(((xx - 1080) / 1050) ** 2 + ((yy - 2200) / 820) ** 2), 0, 1) ** .55
core = np.asarray(Image.fromarray((core * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(90)), np.float32)[..., None] / 255
topm = np.clip((1450 - yy) / 650, 0, 1)[..., None]

blurred = topm * spin + (1 - topm) * zoom
img = core * (0.6 * base + 0.4 * soft) + (1 - core) * blurred

# ghosted camera shake: an offset echo of the blurred frame
shift = np.roll(np.roll(blurred, 26, axis=1), -18, axis=0)
img = np.maximum(img, img * .8 + shift * .26)

# --- 3. Grade: warm gradient-map duotone blended over the photo ---
lum = (img[..., 0] * .3 + img[..., 1] * .55 + img[..., 2] * .15) / 255
stops = np.array([[0, 6, 4, 10], [.25, 70, 6, 30], [.5, 205, 40, 50], [.75, 255, 128, 40], [1, 255, 236, 200]], np.float32)
gm = np.stack([np.interp(lum, stops[:, 0], stops[:, i]) for i in (1, 2, 3)], -1)
img = img * .55 + gm * .45
img = np.clip((img - 6) * 1.2, 0, 255)                 # crush blacks, lift contrast

# vignette + bottom shade for the type block
vig = 1 - .5 * np.clip(np.sqrt(((xx - 1080) / 1350) ** 2 + ((yy - 1800) / 2100) ** 2), 0, 1) ** 2.2
shade = 1 - .5 * np.clip((yy - 2700) / 1140, 0, 1) ** 1.3
img *= (vig * shade)[..., None]

# film grain
rng = np.random.default_rng(1710)
img += rng.normal(0, 7, (H, W, 1)).astype(np.float32)
Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).save(sys.argv[2])
print('saved', sys.argv[2])
