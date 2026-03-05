import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # 1. Remove hardcoded dark backgrounds
    content = re.sub(r'\bbg-(black|\[#000\]|\[#0A0A0A\]|gray-900|neutral-900|slate-900)\b', '', content)
    # Remove inline background colors (e.g. background: '#0A0A0A', background: '#000', backgroundColor: 'black', etc.
    content = re.sub(r'''background(Color)?:\s*['"](#000|#0A0A0A|black)['"]''', r"background\1: 'var(--bg-primary)'", content)
    content = re.sub(r'''background(Color)?:\s*['"]rgba\(\d+,\s*\d+,\s*\d+,\s*[\d.]+\)['"]''', '', content) # Removes inline dark rgba

    # 2. Remove neon borders, glow
    content = re.sub(r'\b(drop-shadow|ring-blue-[\d]+|shadow-\[[^\]]+\])\b', '', content)
    content = re.sub(r'\bglow(-sm|-md|-lg|-xl)?\b', '', content)
    content = re.sub(r'\bborder-glow\b', '', content)

    # 6. Remove dark glassmorphism and blur overlays
    content = re.sub(r'\b(glass|glass-heavy|blur-[\w]+|backdrop-blur-[\w]+)\b', '', content)
    content = re.sub(r'''backdropFilter:\s*['"]blur\([^)]+\)['"]''', '', content)

    # 4. Replace accent colors manually if they are hardcoded (hex) -> though mostly in css, just in case
    content = re.sub(r'#0050FF', '#8CA9FF', content, flags=re.IGNORECASE)
    content = re.sub(r'#00D6FF', '#AAC4F5', content, flags=re.IGNORECASE)

    # Clean up empty classNames
    content = re.sub(r'className=["\']\s+["\']', '', content)
    content = re.sub(r'className=["\']\s+', 'className="', content)
    content = re.sub(r'\s+["\'](\s*)>', r'"\1>', content)
    content = re.sub(r'className=\{(?:|\'|")\s+', 'className={', content)
    
    # 7. Text colors
    content = re.sub(r'\btext-(gray|neutral|slate)-[1234]00\b', 'text-[var(--text-secondary)]', content)
    content = re.sub(r'\btext-white\b', 'text-[var(--text-primary)]', content)

    # 8. Soft rounded corners. Let's make sure things like rounded-full or rounded-lg might become rounded-2xl if they were cards. Actually better to leave standard tailwind if it's already using design system.

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.jsx'):
            process_file(os.path.join(root, file))

print('Done')
