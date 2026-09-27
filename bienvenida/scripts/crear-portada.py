"""Genera la portada social con tipografía exacta y sin nombres personales."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps

root = Path(__file__).resolve().parents[1]
source = root / "design" / "portada-base.png"
output = root / "dist" / "assets" / "portada-whatsapp.jpg"
image = ImageOps.fit(Image.open(source).convert("RGB"), (1200, 630), method=Image.Resampling.LANCZOS)
draw = ImageDraw.Draw(image)
fonts = Path("C:/Windows/Fonts")
serif = fonts / "georgia.ttf"
serif_italic = fonts / "georgiai.ttf"
sans = fonts / "seguisb.ttf"

def tracked_text(x, y, value, font, color, spacing):
    for letter in value:
        draw.text((x, y), letter, font=font, fill=color)
        x += draw.textlength(letter, font=font) + spacing

draw.rounded_rectangle((76, 79, 295, 125), radius=8, fill="#f6e4e8", outline="#e1bcc8", width=1)
tracked_text(95, 91, "DÍA DEL NOVIO", ImageFont.truetype(sans, 19), "#8c3550", 1.5)
draw.text((76, 169), "Nuestra", font=ImageFont.truetype(serif, 80), fill="#40252d")
draw.text((76, 263), "aventura", font=ImageFont.truetype(serif, 80), fill="#40252d")
draw.text((76, 370), "comienza aquí", font=ImageFont.truetype(serif_italic, 59), fill="#a6284c")
draw.line((77, 490, 228, 490), fill="#c68194", width=3)
tracked_text(77, 518, "SIETE PARTES · UNA HISTORIA", ImageFont.truetype(sans, 18), "#795f68", 1)
image.save(output, "JPEG", quality=89, optimize=True, progressive=True, subsampling=0)
print(output)
