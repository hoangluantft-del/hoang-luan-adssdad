import re

# 1. Fix study-atelier.js streak logic
for path in ['assets/phuck9-study-atelier.js', 'public/assets/phuck9-study-atelier.js']:
    try:
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace streak calculation to depend on completed lessons
        old_pattern = 'const streak=Number(user?.streak||$(\'user-streak-value\')?.textContent||0);'
        new_pattern = 'const completedCount=completed; const streak=completedCount > 0 ? (Number(user?.streak) || 1) : 0;'
        
        if old_pattern in content:
            content = content.replace(old_pattern, new_pattern)
            print(f'Updated streak in {path}')
        else:
            # Try regex
            content = re.sub(
                r'const streak=Number\(user\?\.streak[^;]+\);',
                'const completedCount=completed; const streak=completedCount > 0 ? (Number(user?.streak) || 1) : 0;',
                content
            )
            print(f'Updated streak via regex in {path}')

        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
    except Exception as e:
        print(f'Error on {path}: {e}')

# 2. Fix studio-v6.js streak logic
for path in ['assets/phuck9-studio-v6.js', 'public/assets/phuck9-studio-v6.js']:
    try:
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        old_pattern = 'const streak=Number(user?.streak||0);'
        new_pattern = 'const streak=completed > 0 ? (Number(user?.streak) || 1) : 0;'
        content = content.replace(old_pattern, new_pattern)
        
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Updated streak in {path}')
    except Exception as e:
        print(f'Error on {path}: {e}')

# 3. Fix index.html streak logic and inject crisp high-contrast styles
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Fix line 4338 paint(u) streak logic
old_paint_streak = "if(streak)streak.textContent=String(u.streak||1);"
new_paint_streak = "const doneCount = Object.values(lsGet(KEYS.done, {})).filter(Boolean).length; const stVal = doneCount > 0 ? (u.streak || 1) : 0; if(streak) streak.textContent = String(stVal);"
html = html.replace(old_paint_streak, new_paint_streak)

# Add crisp high-contrast style before </head>
crisp_style = '''<!-- HOANG LUAN CRISP HIGH CONTRAST & ACCESSIBILITY STYLES 2026 -->
<style id="hoang-luan-crisp-contrast-2026">
  /* High contrast, bold, crystal-clear buttons and labels */
  .sa-top-actions {
    display: flex !important;
    align-items: center !important;
    gap: 9px !important;
  }
  
  /* 1. Theme toggle: crisp icon and clear button */
  #phuc-theme-toggle {
    width: 39px !important;
    height: 39px !important;
    min-height: 39px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    border-radius: 12px !important;
    border: 1.5px solid #cbd5e1 !important;
    background: #ffffff !important;
    color: #0f172a !important;
    box-shadow: 0 2px 6px rgba(0,0,0,0.06) !important;
    cursor: pointer !important;
  }
  #phuc-theme-toggle i {
    font-size: 16px !important;
    color: #0f172a !important;
  }
  html.dark-mode #phuc-theme-toggle {
    background: #1e293b !important;
    border-color: #475569 !important;
    color: #fbbf24 !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3) !important;
  }
  html.dark-mode #phuc-theme-toggle i {
    color: #fbbf24 !important;
  }

  /* 2. Premium+ Button: bold, vivid contrast in both light and dark */
  #phuc-premium-trigger {
    display: inline-flex !important;
    align-items: center !important;
    gap: 6px !important;
    min-height: 39px !important;
    height: 39px !important;
    padding: 0 13px !important;
    border-radius: 12px !important;
    border: 1.5px solid #d97706 !important;
    background: linear-gradient(135deg, #fffbeb, #fef3c7) !important;
    color: #78350f !important;
    font-size: 11px !important;
    font-weight: 800 !important;
    box-shadow: 0 2px 8px rgba(217,119,6,0.15) !important;
    cursor: pointer !important;
  }
  #phuc-premium-trigger i {
    color: #b45309 !important;
    font-size: 12px !important;
  }
  html.dark-mode #phuc-premium-trigger {
    background: linear-gradient(135deg, #854d0e, #a16207) !important;
    border-color: #facc15 !important;
    color: #ffffff !important;
    box-shadow: 0 3px 12px rgba(0,0,0,0.4) !important;
  }
  html.dark-mode #phuc-premium-trigger i {
    color: #fef08a !important;
  }

  /* 3. Ủng hộ web Button: high contrast rose/ruby, distinct text */
  #phuc-donate-trigger {
    display: inline-flex !important;
    align-items: center !important;
    gap: 6px !important;
    min-height: 39px !important;
    height: 39px !important;
    padding: 0 13px !important;
    border-radius: 12px !important;
    border: 1.5px solid #e11d48 !important;
    background: linear-gradient(135deg, #fff1f2, #ffe4e6) !important;
    color: #9f1239 !important;
    font-size: 11px !important;
    font-weight: 800 !important;
    box-shadow: 0 2px 8px rgba(225,29,72,0.15) !important;
    cursor: pointer !important;
  }
  #phuc-donate-trigger i {
    color: #e11d48 !important;
    font-size: 12px !important;
  }
  html.dark-mode #phuc-donate-trigger {
    background: linear-gradient(135deg, #881337, #9f1239) !important;
    border-color: #fb7185 !important;
    color: #ffffff !important;
    box-shadow: 0 3px 12px rgba(0,0,0,0.4) !important;
  }
  html.dark-mode #phuc-donate-trigger i {
    color: #fecdd3 !important;
  }

  /* 4. Streak badge: sharp, highly visible flame badge */
  #user-streak-badge {
    display: inline-flex !important;
    align-items: center !important;
    gap: 5px !important;
    min-height: 37px !important;
    padding: 0 11px !important;
    border-radius: 12px !important;
    border: 1.5px solid #ea580c !important;
    background: #fff7ed !important;
    color: #9a3412 !important;
    font-size: 11px !important;
    font-weight: 800 !important;
  }
  html.dark-mode #user-streak-badge {
    background: #431407 !important;
    border-color: #fb923c !important;
    color: #fed7aa !important;
  }

  /* 5. User name & settings */
  #user-display-name {
    color: #0f172a !important;
    font-size: 12px !important;
    font-weight: 800 !important;
  }
  html.dark-mode #user-display-name {
    color: #f8fafc !important;
  }

  /* 6. Settings button: crisp and legible */
  .phuck9-direct-settings, #btn-account-settings, #user-info button {
    display: inline-flex !important;
    align-items: center !important;
    gap: 5px !important;
    min-height: 37px !important;
    padding: 0 11px !important;
    border-radius: 12px !important;
    border: 1.5px solid #cbd5e1 !important;
    background: #f8fafc !important;
    color: #0f172a !important;
    font-size: 11px !important;
    font-weight: 700 !important;
  }
  html.dark-mode .phuck9-direct-settings, html.dark-mode #btn-account-settings, html.dark-mode #user-info button {
    background: #1e293b !important;
    border-color: #475569 !important;
    color: #f8fafc !important;
  }

  /* 7. Login button: clean, professional, inviting */
  #btn-login-modal {
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    min-height: 39px !important;
    padding: 0 15px !important;
    border-radius: 12px !important;
    border: none !important;
    background: #2563eb !important;
    color: #ffffff !important;
    font-size: 11.5px !important;
    font-weight: 800 !important;
    box-shadow: 0 3px 10px rgba(37,99,235,0.25) !important;
    cursor: pointer !important;
  }
  #btn-login-modal:hover {
    background: #1d4ed8 !important;
  }

  /* 8. Crisp body text & card titles */
  .sa-card-title, .sa-section-head h2, .sa-hero h1 {
    font-weight: 800 !important;
  }
  html.dark-mode .sa-card-title, html.dark-mode .sa-section-head h2, html.dark-mode .sa-hero h1 {
    color: #f8fafc !important;
  }
  html.dark-mode .sa-hero p, html.dark-mode .sa-hero-copy p {
    color: #e2e8f0 !important;
  }
  html.dark-mode .sa-stat small, html.dark-mode .sa-section-head p {
    color: #94a3b8 !important;
    font-weight: 600 !important;
  }
</style>
'''

if 'id="hoang-luan-crisp-contrast-2026"' not in html:
    html = html.replace('</head>', crisp_style + '\n</head>')
    print('Injected hoang-luan-crisp-contrast-2026 into index.html')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('Updated index.html successfully')
