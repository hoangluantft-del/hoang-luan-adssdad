import re

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Make sure BANK_CODE is BIDV
text = text.replace("BANK_CODE='HDB'", "BANK_CODE='BIDV'")

# Update paintPayment to prioritize Hoàng Luân's BIDV QR image
pattern = r'function paintPayment\(\)\{[^}]*\}'
replacement = (
    'function paintPayment(){\n'
    '    const text=paymentContent(), code=$("phuc-premium-payment-content"), qr=$("phuc-premium-qr");\n'
    '    if(code) code.textContent=text;\n'
    '    if(qr) {\n'
    '      qr.src = "/assets/hoang-luan-bidv-qr.jpg";\n'
    '      qr.alt = "Mã QR BIDV Nguyễn Hoàng Luân - 8803890053";\n'
    '    }\n'
    '  }'
)

new_text = re.sub(pattern, replacement, text, count=1)
if new_text != text:
    print('Replaced paintPayment successfully!')
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(new_text)
else:
    print('Pattern not matched, searching...')
