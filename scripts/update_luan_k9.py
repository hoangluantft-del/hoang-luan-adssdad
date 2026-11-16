with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('HỌC CÙNG HOÀNG LUÂN', 'HỌC CÙNG LUÂN K9')
text = text.replace('Học Cùng Hoàng Luân', 'Học Cùng Luân K9')
text = text.replace('Học cùng Hoàng Luân', 'Học cùng Luân K9')
text = text.replace('Phụ trách nội dung: THẦY HOÀNG LUÂN', 'Phụ trách nội dung: LUÂN K9')
text = text.replace('Phụ trách nội dung: HOÀNG LUÂN', 'Phụ trách nội dung: LUÂN K9')
text = text.replace('Mẹo Hoàng Luân:', 'Mẹo Luân K9:')
text = text.replace('của Hoàng Luân', 'của Luân K9')
text = text.replace('máy chủ Hoàng Luân', 'máy chủ Luân K9')
text = text.replace('HOÀNG LUÂN AI TUTOR', 'LUÂN K9 AI TUTOR')
text = text.replace('HỌC CÙNG HOÀNG LUÂN AI TUTOR', 'HỌC CÙNG LUÂN K9 AI TUTOR')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(text)

# Also update metadata.json
with open('metadata.json', 'r', encoding='utf-8') as f:
    m = f.read()
m = m.replace('Học Cùng Hoàng Luân', 'Học Cùng Luân K9')
m = m.replace('thầy Hoàng Luân', 'thầy Luân K9')
with open('metadata.json', 'w', encoding='utf-8') as f:
    f.write(m)

# Also update public/manifest.webmanifest
try:
    with open('public/manifest.webmanifest', 'r', encoding='utf-8') as f:
        mw = f.read()
    mw = mw.replace('Học Cùng Hoàng Luân', 'Học Cùng Luân K9')
    mw = mw.replace('Hoàng Luân', 'Luân K9')
    with open('public/manifest.webmanifest', 'w', encoding='utf-8') as f:
        f.write(mw)
except Exception as e:
    print('Manifest error:', e)

print('Updated Luân K9 branding successfully!')
