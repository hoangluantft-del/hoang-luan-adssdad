import os
import glob

replacements = [
    ('HỌC CÙNG PHÚC K9', 'HỌC CÙNG LUÂN K9'),
    ('Học Cùng Phúc K9', 'Học Cùng Luân K9'),
    ('Học cùng Phúc K9', 'Học cùng Luân K9'),
    ('học cùng phúc k9', 'học cùng luân k9'),
    ('PHÚC K9', 'LUÂN K9'),
    ('Phúc K9', 'Luân K9'),
    ('phúc k9', 'luân k9'),
    ('PHUC K9', 'LUAN K9'),
    ('Phuc K9', 'Luan K9'),
    ('phuc k9', 'luan k9'),
    ('PHUCK9', 'LUANK9'),
    ('PhucK9', 'LuanK9'),
    ('phuck9', 'luank9'),
    ('PK9', 'LK9'),
    ('Pk9', 'Lk9'),
    ('pk9', 'lk9'),
]

target_files = [
    'index.html',
    'metadata.json',
    'server.ts',
    'public/manifest.webmanifest'
]

# Add all css and js files in assets and public/assets
for ext in ['*.css', '*.js']:
    target_files.extend(glob.glob(f'assets/{ext}'))
    target_files.extend(glob.glob(f'public/assets/{ext}'))

# Remove duplicates while preserving order
target_files = list(dict.fromkeys(target_files))

for filepath in target_files:
    if not os.path.exists(filepath):
        continue
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content
        for old, new in replacements:
            content = content.replace(old, new)

        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f'Transformed: {filepath}')
        else:
            print(f'No changes needed in: {filepath}')
    except Exception as e:
        print(f'Error processing {filepath}: {e}')

print('All targeted files processed successfully!')
