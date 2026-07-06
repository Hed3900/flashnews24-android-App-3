import os
import glob
from PIL import Image, ImageDraw

densities = {
    'mipmap-mdpi': (48, 108),
    'mipmap-hdpi': (72, 162),
    'mipmap-xhdpi': (96, 216),
    'mipmap-xxhdpi': (144, 324),
    'mipmap-xxxhdpi': (192, 432),
}

base_dir = "android/app/src/main/res"

def draw_emblem(draw, cx, cy, S_w, S, outer_color, inner_color):    
    # Outer bolt
    poly_outer = [
        (cx + 0.18 * S_w, cy - 0.50 * S),
        (cx - 0.45 * S_w, cy + 0.08 * S),
        (cx - 0.08 * S_w, cy + 0.08 * S),
        (cx - 0.18 * S_w, cy + 0.50 * S),
        (cx + 0.45 * S_w, cy - 0.08 * S),
        (cx + 0.08 * S_w, cy - 0.08 * S),
    ]
    draw.polygon(poly_outer, fill=outer_color)
    
    # Inner gold bolt slightly smaller
    scale = 0.75
    poly_inner = [
        (cx + 0.18 * S_w * scale, cy - 0.50 * S * scale),
        (cx - 0.45 * S_w * scale, cy + 0.08 * S * scale),
        (cx - 0.08 * S_w * scale, cy + 0.08 * S * scale),
        (cx - 0.18 * S_w * scale, cy + 0.50 * S * scale),
        (cx + 0.45 * S_w * scale, cy - 0.08 * S * scale),
        (cx + 0.08 * S_w * scale, cy - 0.08 * S * scale),
    ]
    draw.polygon(poly_inner, fill=inner_color)

def generate_icon(width, height, icon_type):
    # Draw at 4x resolution for super-sampling anti-aliasing
    scale = 4
    w_big, h_big = width * scale, height * scale
    img = Image.new("RGBA", (w_big, h_big), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    bg_color = (37, 99, 235, 255)       # #2563EB Vibrant Royal Blue
    outer_color = (255, 255, 255, 255)  # Pure White
    inner_color = (251, 191, 36, 255)   # #FBBF24 Amber Gold News Accent
    
    if icon_type == "square":
        radius = int(w_big * 0.2)
        draw.rounded_rectangle([(0, 0), (w_big - 1, h_big - 1)], radius=radius, fill=bg_color)
    elif icon_type == "round":
        draw.ellipse([(0, 0), (w_big - 1, h_big - 1)], fill=bg_color)
    elif icon_type == "foreground":
        pass  # Transparent background for adaptive icon foreground layer
        
    cx, cy = w_big / 2.0, h_big / 2.0
    if icon_type == "foreground":
        S_w = w_big * 0.40
        S = h_big * 0.52
    else:
        S_w = w_big * 0.48
        S = h_big * 0.60
        
    draw_emblem(draw, cx, cy, S_w, S, outer_color, inner_color)
    
    # Downsample cleanly to target resolution
    img_small = img.resize((width, height), Image.Resampling.LANCZOS)
    return img_small

print("Generating Android Asset Studio compatible launcher icons...")
count = 0

for folder, (sq_size, fg_size) in densities.items():
    folder_path = os.path.join(base_dir, folder)
    os.makedirs(folder_path, exist_ok=True)
    
    # Remove any stray .xml files in density folders to prevent AAPT resource conflicts
    for xml_file in glob.glob(os.path.join(folder_path, "*.xml")):
        os.remove(xml_file)
        
    p1 = os.path.join(folder_path, "ic_launcher.png")
    generate_icon(sq_size, sq_size, "square").save(p1, "PNG")
    count += 1
    
    p2 = os.path.join(folder_path, "ic_launcher_round.png")
    generate_icon(sq_size, sq_size, "round").save(p2, "PNG")
    count += 1
    
    p3 = os.path.join(folder_path, "ic_launcher_foreground.png")
    generate_icon(fg_size, fg_size, "foreground").save(p3, "PNG")
    count += 1

# Ensure mipmap-anydpi-v26 contains valid adaptive icon XML definitions
anydpi_path = os.path.join(base_dir, "mipmap-anydpi-v26")
os.makedirs(anydpi_path, exist_ok=True)

xml_content = """<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
"""

with open(os.path.join(anydpi_path, "ic_launcher.xml"), "w") as f:
    f.write(xml_content.strip())
with open(os.path.join(anydpi_path, "ic_launcher_round.xml"), "w") as f:
    f.write(xml_content.strip())

# Ensure values directory contains the background color resource
values_path = os.path.join(base_dir, "values")
os.makedirs(values_path, exist_ok=True)
color_xml = """<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#2563EB</color>
</resources>
"""
with open(os.path.join(values_path, "ic_launcher_background.xml"), "w") as f:
    f.write(color_xml.strip())

print(f"Successfully generated {count} PNG icon assets and adaptive XML resources!")
