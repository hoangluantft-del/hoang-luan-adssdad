with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Locate from 'function paintPayment()' to the end of that statement
start_marker = 'function paintPayment(){'
end_marker = 'function openChooser(){'

start_idx = text.find(start_marker)
end_idx = text.find(end_marker)

if start_idx != -1 and end_idx != -1:
    clean_fn = '''function paintPayment(){
    const text = paymentContent(), code = $('phuc-premium-payment-content'), qr = $('phuc-premium-qr');
    if(code) code.textContent = text;
    if(qr) {
      qr.src = '/assets/hoang-luan-bidv-qr.jpg';
      qr.alt = 'Mã QR BIDV Nguyễn Hoàng Luân - STK 8803890053';
    }
  }
  '''
    text = text[:start_idx] + clean_fn + text[end_idx:]
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(text)
    print('Cleaned paintPayment successfully!')
else:
    print('Markers not found', start_idx, end_idx)
