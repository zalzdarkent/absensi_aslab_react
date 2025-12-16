import sys, zlib

# PlantUML deflate+custom-base64 encoder
# Usage: python plantuml_encode.py path/to/file.puml

ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_"

def encode_plantuml(data: bytes) -> str:
    compressor = zlib.compressobj(level=9, wbits=-15)
    compressed = compressor.compress(data) + compressor.flush()
    # convert to 6-bit groups
    res = []
    i = 0
    while i < len(compressed):
        b1 = compressed[i]
        b2 = compressed[i+1] if i+1 < len(compressed) else 0
        b3 = compressed[i+2] if i+2 < len(compressed) else 0
        c1 = (b1 >> 2) & 0x3F
        c2 = ((b1 & 0x3) << 4) | ((b2 >> 4) & 0xF)
        c3 = ((b2 & 0xF) << 2) | ((b3 >> 6) & 0x3)
        c4 = b3 & 0x3F
        res.extend([c1, c2, c3, c4])
        i += 3
    return ''.join(ALPHABET[c] for c in res)


def main():
    if len(sys.argv) < 2:
        print('Usage: python plantuml_encode.py path/to/file.puml')
        sys.exit(1)
    path = sys.argv[1]
    with open(path, 'rb') as f:
        data = f.read()
    encoded = encode_plantuml(data)
    print('PNG URL: https://www.plantuml.com/plantuml/png/' + encoded)
    print('SVG URL: https://www.plantuml.com/plantuml/svg/' + encoded)
    print('TXT URL: https://www.plantuml.com/plantuml/txt/' + encoded)

if __name__ == '__main__':
    main()
