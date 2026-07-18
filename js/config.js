(function(global) {
    'use strict';

    global.EPD_APP_CONFIG = Object.freeze({
        SERVICE_UUID: '0000ffe0-0000-1000-8000-00805f9b34fb',
        DATA_CHAR_UUID: '0000ffe1-0000-1000-8000-00805f9b34fb',
        COMMAND_CHAR_UUID: '0000ffe2-0000-1000-8000-00805f9b34fb',
        MODEL_CHAR_UUID: '0000ffe4-0000-1000-8000-00805f9b34fb',
        WIDTH_CHAR_UUID: '0000ffe5-0000-1000-8000-00805f9b34fb',
        HEIGHT_CHAR_UUID: '0000ffe6-0000-1000-8000-00805f9b34fb',
        COLOR_CHAR_UUID: '0000ffe7-0000-1000-8000-00805f9b34fb',
        COLOR_MODE_MAP: Object.freeze({
            2: 'blackWhiteColor',
            3: 'threeColor',
            4: 'fourColor',
            6: 'sixColor'
        }),
        MODE_DESCRIPTIONS: Object.freeze({
            blackWhiteColor: '黑白模式：将图像转换为黑白两色，适合单色墨水屏显示',
            threeColor: '黑白红三色模式：支持黑色、白色和红色，适合三色墨水屏',
            fourColor: '黑白红黄四色模式：支持黑色、白色、红色和黄色，适合四色墨水屏',
            sixColor: '六色模式：支持黑色、白色、黄色、红色、蓝色和绿色，适合E6全彩墨水屏'
        }),
        ALGO_DESCRIPTIONS: Object.freeze({
            none: '无抖动: 直接将像素映射到最接近的颜色，不进行误差扩散处理',
            'floyd-steinberg': 'Floyd-Steinberg: 经典误差扩散算法，效果平滑',
            atkinson: 'Atkinson: 扩散较少，保留更多细节但可能显示更多图案',
            stucki: 'Stucki: 改进的误差扩散算法，比Floyd-Steinberg更平滑',
            'jarvis-judice-ninke': 'Jarvis-Judice-Ninke: 更复杂的误差扩散算法，效果更细腻',
            bayer: 'Bayer: 有序抖动算法，使用8x8矩阵，计算开销小但有可见图案'
        }),
        MODE_NAMES: Object.freeze({
            blackWhiteColor: '黑白模式',
            threeColor: '黑白红三色',
            fourColor: '黑白红黄四色',
            sixColor: '六色模式'
        }),
        ALGO_NAMES: Object.freeze({
            none: '无抖动',
            'floyd-steinberg': 'Floyd-Steinberg',
            atkinson: 'Atkinson',
            stucki: 'Stucki',
            'jarvis-judice-ninke': 'Jarvis-Judice-Ninke',
            bayer: 'Bayer'
        }),
        DRIVER_CONFIG: Object.freeze({
            EL044TS2: { width: 512, height: 368, colorMode: 'fourColor', numericColorMode: 4, guiModel: 0 },
            EL073TF1: { width: 800, height: 480, colorMode: 'sixColor', numericColorMode: 6, guiModel: 0 },
            EL081TS2: { width: 1024, height: 576, colorMode: 'fourColor', numericColorMode: 4, guiModel: 0 },
            HE583A04A1: { width: 648, height: 480, colorMode: 'threeColor', numericColorMode: 3, guiModel: 0 },
            HSE097SE: { width: 960, height: 672, colorMode: 'fourColor', numericColorMode: 4, guiModel: 0 },
            SE0398NZ07A0: { width: 768, height: 552, colorMode: 'fourColor', numericColorMode: 4, guiModel: 16 },
            SE0398NZ07A1: { width: 768, height: 552, colorMode: 'fourColor', numericColorMode: 4, guiModel: 17 },
            'SE0398NZ07-new-A1': { width: 768, height: 552, colorMode: 'fourColor', numericColorMode: 4, guiModel: 19 },
            EPD_420_BWRY: { width: 400, height: 300, colorMode: 'fourColor', numericColorMode: 4, guiModel: 0 },
            EPD_970_BWRY: { width: 960, height: 680, colorMode: 'fourColor', numericColorMode: 4, guiModel: 21 },
            EPD_029_BWRY: { width: 168, height: 384, colorMode: 'fourColor', numericColorMode: 4, guiModel: 0 },
            EPD_HS350_BWR: { width: 184, height: 384, colorMode: 'threeColor', numericColorMode: 3, guiModel: 0 },
            EPD_UC8176_420_BW: { width: 400, height: 300, colorMode: 'blackWhiteColor', numericColorMode: 2, guiModel: 1 },
            EPD_UC8176_420_BWR: { width: 400, height: 300, colorMode: 'threeColor', numericColorMode: 3, guiModel: 3 },
            EPD_SSD1619_420_BWR: { width: 400, height: 300, colorMode: 'threeColor', numericColorMode: 3, guiModel: 2 },
            EPD_SSD1619_420_BW: { width: 400, height: 300, colorMode: 'blackWhiteColor', numericColorMode: 2, guiModel: 4 },
            EPD_JD79668_420_BWRY: { width: 400, height: 300, colorMode: 'fourColor', numericColorMode: 4, guiModel: 5 },
            EPD_UC8179_750_BW: { width: 800, height: 480, colorMode: 'blackWhiteColor', numericColorMode: 2, guiModel: 6 },
            EPD_UC8179_750_BWR: { width: 800, height: 480, colorMode: 'threeColor', numericColorMode: 3, guiModel: 7 },
            EPD_UC8159_750_LOW_BW: { width: 640, height: 384, colorMode: 'blackWhiteColor', numericColorMode: 2, guiModel: 8 },
            EPD_UC8159_750_LOW_BWR: { width: 640, height: 384, colorMode: 'threeColor', numericColorMode: 3, guiModel: 9 },
            EPD_SSD1677_750_HD_BW: { width: 880, height: 528, colorMode: 'blackWhiteColor', numericColorMode: 2, guiModel: 10 },
            EPD_SSD1677_750_HD_BWR: { width: 880, height: 528, colorMode: 'threeColor', numericColorMode: 3, guiModel: 11 },
            EPD_JD79668_750_BWRY: { width: 800, height: 480, colorMode: 'fourColor', numericColorMode: 4, guiModel: 12 },
            EPD_GDEM037F51_370_BWRY: { width: 416, height: 240, colorMode: 'fourColor', numericColorMode: 4, guiModel: 13 },
            EPD_GDEY037Z03_370_BWR: { width: 416, height: 240, colorMode: 'threeColor', numericColorMode: 3, guiModel: 14 },
            EPD_YS4370JS0C3_370_BWR: { width: 416, height: 240, colorMode: 'threeColor', numericColorMode: 3, guiModel: 15 },
            EPD_LG370_370_BWR: { width: 416, height: 240, colorMode: 'threeColor', numericColorMode: 3, guiModel: 18 },
            EPD_KEGM038701E01_J665_387_BWRY: { width: 800, height: 552, colorMode: 'fourColor', numericColorMode: 4, guiModel: 20 },
            EPD_CSOT970_970_BWRY: { width: 960, height: 680, colorMode: 'fourColor', numericColorMode: 4, guiModel: 21 }
        })
    });
})(window);
