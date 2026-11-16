import os

def main():
    with open('scripts/template.html', 'r', encoding='utf-8') as f:
        content = f.read()
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Done writing index.html")

if __name__ == '__main__':
    main()
