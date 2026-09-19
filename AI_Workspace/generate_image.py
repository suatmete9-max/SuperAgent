from PIL import Image, ImageDraw, ImageFilter

def create_gradient(width, height, color1, color2):
    base = Image.new('RGBA', (width, height), color1)
    top = Image.new('RGBA', (width, height), color2)
    mask = Image.new('L', (width, height))
    mask_data = []
    for y in range(height):
        mask_data.extend([int(255 * (y / height))] * width)
    mask.putdata(mask_data)
    base.paste(top, (0, 0), mask)
    return base

def generate_background():
    width, height = 1920, 1080
    # Deep premium purple to warm sunset coral gradient
    color1 = (20, 15, 40, 255)   # Deep Midnight Blue
    color2 = (245, 105, 120, 255) # Soft Sunset Rose
    
    img = create_gradient(width, height, color1, color2)
    
    # Create a glowing bokeh/light overlay
    overlay = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    
    # Beautiful glowing background elements
    draw.ellipse([width - 500, height - 600, width + 500, height + 400], fill=(255, 190, 120, 90))
    draw.ellipse([-300, -300, 700, 700], fill=(120, 160, 255, 70))
    draw.ellipse([width//2 - 400, height//2 - 400, width//2 + 400, height//2 + 400], fill=(255, 120, 180, 50))
    
    # Smooth Gaussian Blur for a stunning studio backdrop effect
    blurred_overlay = overlay.filter(ImageFilter.GaussianBlur(150))
    
    # Merge layers
    final_img = Image.alpha_composite(img, blurred_overlay)
    
    # Save image
    final_img.convert('RGB').save('beautiful_background.jpg', 'JPEG', quality=95)
    print('\n[SUCCESS] Aapki beautiful background photo "beautiful_background.jpg" ke naam se save ho gayi hai!')

if __name__ == "__main__":
    generate_background()