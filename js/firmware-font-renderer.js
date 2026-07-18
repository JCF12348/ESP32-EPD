(function(global) {
    'use strict';

    function decodeBase64(value) {
        const binary = atob(value);
        const bytes = new Uint8Array(binary.length);
        for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index);
        return bytes;
    }

    function signedByte(value) { return value > 127 ? value - 256 : value; }

    class FirmwareFont {
        constructor(base64) {
            this.data = decodeBase64(base64);
            this.info = this.readInfo();
            this.glyphCache = new Map();
        }

        byte(offset) { return this.data[offset] || 0; }

        word(offset) { return (this.byte(offset) << 8) | this.byte(offset + 1); }

        readInfo() {
            return {
                glyphCount: this.byte(0),
                bbxMode: this.byte(1),
                bitsPer0: this.byte(2),
                bitsPer1: this.byte(3),
                bitsPerWidth: this.byte(4),
                bitsPerHeight: this.byte(5),
                bitsPerX: this.byte(6),
                bitsPerY: this.byte(7),
                bitsPerDeltaX: this.byte(8),
                maxWidth: signedByte(this.byte(9)),
                maxHeight: signedByte(this.byte(10)),
                xOffset: signedByte(this.byte(11)),
                yOffset: signedByte(this.byte(12)),
                ascent: signedByte(this.byte(13)),
                descent: signedByte(this.byte(14)),
                startUpperA: this.word(17),
                startLowerA: this.word(19),
                startUnicode: this.word(21)
            };
        }

        findGlyphData(codePoint) {
            let offset = 23;
            if (codePoint <= 255) {
                if (codePoint >= 97) offset += this.info.startLowerA;
                else if (codePoint >= 65) offset += this.info.startUpperA;
                while (this.byte(offset + 1) !== 0) {
                    if (this.byte(offset) === codePoint) return offset + 2;
                    offset += this.byte(offset + 1);
                }
                return -1;
            }

            offset += this.info.startUnicode;
            let lookup = offset;
            let encoding;
            do {
                offset += this.word(lookup);
                encoding = this.word(lookup + 2);
                lookup += 4;
            } while (encoding < codePoint && lookup + 3 < this.data.length);

            while (offset + 2 < this.data.length) {
                encoding = this.word(offset);
                if (encoding === 0) break;
                if (encoding === codePoint) return offset + 3;
                const size = this.byte(offset + 2);
                if (!size) break;
                offset += size;
            }
            return -1;
        }

        decodeGlyph(codePoint) {
            if (this.glyphCache.has(codePoint)) return this.glyphCache.get(codePoint);
            const glyphOffset = this.findGlyphData(codePoint);
            if (glyphOffset < 0) {
                this.glyphCache.set(codePoint, null);
                return null;
            }

            const state = { pointer: glyphOffset, bitPosition: 0 };
            const readBits = count => {
                if (!count) return 0;
                let value = this.byte(state.pointer) >> state.bitPosition;
                let nextPosition = state.bitPosition + count;
                if (nextPosition >= 8) {
                    const shift = 8 - state.bitPosition;
                    state.pointer++;
                    value |= this.byte(state.pointer) << shift;
                    nextPosition -= 8;
                }
                state.bitPosition = nextPosition;
                return value & ((1 << count) - 1);
            };
            const readSigned = count => readBits(count) - (1 << (count - 1));

            const width = readBits(this.info.bitsPerWidth);
            const height = readBits(this.info.bitsPerHeight);
            const xOffset = readSigned(this.info.bitsPerX);
            const yOffset = readSigned(this.info.bitsPerY);
            const deltaX = readSigned(this.info.bitsPerDeltaX);
            const runs = [];
            let localX = 0;
            let localY = 0;

            const consumeRun = (length, foreground) => {
                let remaining = length;
                for (;;) {
                    const rowRemaining = width - localX;
                    const current = Math.min(remaining, rowRemaining);
                    if (foreground && current > 0) {
                        runs.push({
                            x: xOffset + localX,
                            y: -(height + yOffset) + localY,
                            length: current
                        });
                    }
                    if (remaining < rowRemaining) {
                        localX += remaining;
                        break;
                    }
                    remaining -= rowRemaining;
                    localX = 0;
                    localY++;
                }
            };

            if (width > 0) {
                while (localY < height) {
                    const backgroundLength = readBits(this.info.bitsPer0);
                    const foregroundLength = readBits(this.info.bitsPer1);
                    do {
                        consumeRun(backgroundLength, false);
                        consumeRun(foregroundLength, true);
                    } while (readBits(1) !== 0);
                }
            }

            const glyph = { width, height, xOffset, yOffset, deltaX, runs };
            this.glyphCache.set(codePoint, glyph);
            return glyph;
        }
    }

    class FirmwareFontRenderer {
        constructor(fontData) {
            this.fonts = new Map(Object.entries(fontData).map(([name, base64]) => [name, new FirmwareFont(base64)]));
        }

        getFont(name) {
            const font = this.fonts.get(name);
            if (!font) throw new Error(`Firmware font not found: ${name}`);
            return font;
        }

        metrics(name) { return this.getFont(name).info; }

        measureText(name, text) {
            const font = this.getFont(name);
            const glyphs = Array.from(text, character => font.decodeGlyph(character.codePointAt(0))).filter(Boolean);
            if (!glyphs.length) return 0;
            const advance = glyphs.reduce((sum, glyph) => sum + glyph.deltaX, 0);
            const last = glyphs[glyphs.length - 1];
            return advance - last.deltaX + last.width + last.xOffset;
        }

        drawText(context, name, text, x, y, color) {
            const font = this.getFont(name);
            let cursor = Math.round(x);
            context.save();
            context.fillStyle = color;
            for (const character of text) {
                const glyph = font.decodeGlyph(character.codePointAt(0));
                if (!glyph) continue;
                for (const run of glyph.runs) {
                    context.fillRect(cursor + run.x, Math.round(y) + run.y, run.length, 1);
                }
                cursor += glyph.deltaX;
            }
            context.restore();
            return cursor - Math.round(x);
        }
    }

    global.EPDFirmwareFontRenderer = Object.freeze({
        create(fontData) { return new FirmwareFontRenderer(fontData); }
    });
})(window);
