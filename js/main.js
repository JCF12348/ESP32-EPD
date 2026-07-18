(function() {
    'use strict';

    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    const scanBluetoothBtn = $('#scan-bluetooth');
    const sendBluetoothBtn = $('#send-bluetooth');
    const previewSendImageBtn = $('#preview-send-image');
    const disconnectBluetoothBtn = $('#disconnect-bluetooth');
    const uploadArea = $('#upload-area');
    const imageUploadInput = $('#image-upload');
    const canvasWidthInput = $('#canvasWidth');
    const canvasHeightInput = $('#canvasHeight');
    const updateCanvasBtn = $('#update-canvas');
    const quickResolutionsSelect = $('#quickResolutions');
    const ditherModeSelect = $('#ditherMode');
    const ditherAlgorithmSelect = $('#ditherAlgorithm');
    const exportCArrayBtn = $('#export-c-array');
    const exportBinaryBtn = $('#export-binary');
    const canvas = $('#image-canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const loadingEl = $('#loading');
    const loadingText = $('#loading-text');
    const errorMsgEl = $('#error-message');
    const canvasSizeIndicator = $('#canvas-size-indicator');
    const currentCanvasSizeEl = $('#current-canvas-size');
    const currentModeEl = $('#current-mode');
    const currentAlgorithmEl = $('#current-algorithm');
    const imageStatusEl = $('#image-status');
    const bluetoothStatusEl = $('#bluetooth-status');
    const deviceModelEl = $('#device-model');
    const modeDescEl = $('#mode-description-text');
    const algoDescEl = $('#algorithm-description-text');
    const rotateLeftBtn = $('#rotate-left');
    const rotateRightBtn = $('#rotate-right');
    const resetTransformBtn = $('#reset-transform');
    const clearCanvasBtn = $('#clear-canvas');
    const transferDialog = $('#transfer-dialog');
    const transferTitleText = $('#transfer-title');
    const dialogProgressBar = $('#dialog-progress-bar');
    const dialogProgressText = $('#dialog-progress');
    const dialogBytesText = $('#dialog-bytes');
    const dialogSpeedText = $('#dialog-speed');
    const dialogElapsedText = $('#dialog-elapsed');
    const dialogRemainingText = $('#dialog-remaining');
    const cancelTransferBtn = $('#cancel-transfer-btn');
    const saturationSlider = $('#saturation-slider');
    const brightnessSlider = $('#brightness-slider');
    const contrastSlider = $('#contrast-slider');
    const diffusionSlider = $('#diffusion-slider');
    const saturationValueEl = $('#saturation-value');
    const brightnessValueEl = $('#brightness-value');
    const contrastValueEl = $('#contrast-value');
    const diffusionValueEl = $('#diffusion-value');
    const driverSelect = $('#driver-select');
    const commandInput = $('#command-input');
    const sendCommandBtn = $('#send-command-btn');
    const commandOutputLog = $('#command-output-log');
    const clearCommandLogBtn = $('#clear-command-log');
    const albumIntervalInput = $('#album-interval');
    const albumPlayBtn = $('#album-play-btn');
    const albumStopBtn = $('#album-stop-btn');
    const albumModeArea = albumPlayBtn.closest('.album-mode-area');
    const albumStatusText = $('#album-playback-status .album-status-text');
    const playModeRadios = $$('input[name="play-mode"]');
    const imageListSelect = $('#image-list-select');
    const imagePicker = $('#device-image-picker');
    const imagePickerPanel = imagePicker.closest('.bluetooth-panel');
    const imagePickerButton = $('#image-picker-button');
    const imagePickerMenu = $('#image-picker-menu');
    const hoverPreviewCanvas = $('#hover-preview-canvas');
    const hoverPreviewCtx = hoverPreviewCanvas.getContext('2d');
    const previewHoverMessage = $('#preview-hover-message');
    const deviceStorageEl = $('#device-storage');
    const storageFreeEl = $('#storage-free');
    const storageFillEl = $('#storage-fill');
    const storageImageCountEl = $('#storage-image-count');
    const storageImageSizeEl = $('#storage-image-size');
    
    // 日历/时钟相关元素
    const modeSelector = $('#mode-selector');
    const imageModeInterface = $('#image-mode-interface');
    const calendarModeInterface = $('#calendar-mode-interface');
    const weekStartSelect = $('#week-start');
    const showCalendarBtn = $('#show-calendar');
    const showClockBtn = $('#show-clock');
    const clearDisplayBtn = $('#clear-display');
    const calendarPreviewFrame = $('.calendar-preview-frame');
    const calendarPreviewImage = $('#calendar-preview-image');
    const calendarPreviewCanvas = $('#calendar-preview-canvas');
    const calendarPreviewCtx = calendarPreviewCanvas.getContext('2d');
    const calendarPreviewBadge = $('#calendar-preview-badge');
    const calendarPreviewTimeEl = $('#calendar-preview-time');
    const calendarPreviewTabs = $$('.calendar-preview-tab');
    const calendarStyleToggle = $('#calendar-style-toggle');
    const calendarStylePanel = $('#calendar-style-panel');
    const calendarStyleHost = calendarStylePanel?.parentElement;
    const controlsPanel = $('.controls-panel');
    const calendarStyleLayout = $('#calendar-style-layout');
    const calendarStyleFontPreset = $('#calendar-style-font-preset');
    const calendarStyleFont = $('#calendar-style-font');
    const calendarStyleTextRender = $('#calendar-style-text-render');
    const calendarStyleFontFile = $('#calendar-style-font-file');
    const calendarStyleTitle = $('#calendar-style-title');
    const calendarStyleAccent = $('#calendar-style-accent');
    const calendarStyleLunar = $('#calendar-style-lunar');
    const calendarStyleRenderBtn = $('#calendar-style-render');
    const calendarStyleSendBtn = $('#calendar-style-send');
    const calendarFontReset = $('#calendar-font-reset');
    const calendarFontTitle = $('#calendar-font-title');
    const calendarFontMonth = $('#calendar-font-month');
    const calendarFontMainDay = $('#calendar-font-main-day');
    const calendarFontWeekday = $('#calendar-font-weekday');
    const calendarFontLunar = $('#calendar-font-lunar');
    const calendarFontCellDay = $('#calendar-font-cell-day');
    const calendarFontCellLunar = $('#calendar-font-cell-lunar');
    const calendarFontSmall = $('#calendar-font-small');

    let currentDisplayMode = 'image';
    let calendarPreviewMode = 'calendar';
    let calendarPreviewTimer = null;
    let calendarPreviewRenderKey = '';
    let calendarStylePanelOpen = false;
    let customCalendarFontFamily = '';

    const APP_CONFIG = window.EPD_APP_CONFIG;
    if (!APP_CONFIG) throw new Error('EPD application configuration is missing');
    const {
        SERVICE_UUID,
        DATA_CHAR_UUID,
        COMMAND_CHAR_UUID,
        MODEL_CHAR_UUID,
        WIDTH_CHAR_UUID,
        HEIGHT_CHAR_UUID,
        COLOR_CHAR_UUID,
        COLOR_MODE_MAP,
        MODE_DESCRIPTIONS,
        ALGO_DESCRIPTIONS,
        MODE_NAMES,
        ALGO_NAMES,
        DRIVER_CONFIG
    } = APP_CONFIG;
    const runtimeDriverConfig = new Map(Object.entries(DRIVER_CONFIG));
    const getDriverConfig = model => runtimeDriverConfig.get(model) || null;
    const TRANSFER_PREP_PROGRESS = 2;
    const TRANSFER_PACK_PROGRESS = 8;
    const TRANSFER_DATA_PROGRESS_START = 10;
    const TRANSFER_DISPLAY_PROGRESS = 96;
    const POST_TRANSFER_SETTLE_MS = 12000;
    const POST_TRANSFER_REFRESH_DELAY_MS = 300;
    const TRANSFER_ACK_GRACE_MS = 1200;
    const LIST_RESPONSE_IDLE_TIMEOUT_MS = 3500;

    let originalImage = null;
    let originalImageData = null;
    let processedImageData = null;
    let connectedDevice = null;
    let connectedCharacteristic = null;
    let connectedCommandChar = null;
    let connectedService = null;
    let bleOperationChain = Promise.resolve();
    let isTransferring = false;
    let transferStartTime = 0;
    let transferSettleUntil = 0;
    let transferSettleResolver = null;
    let postTransferRefreshTimer = null;
    let transferDisplayResolver = null;
    let transferDisplayStarted = false;
    let transferDisplayAnimationFrame = 0;
    let currentDeviceName = '';
    let currentModel = '';
    let isDragging = false;
    let lastX = 0,
        lastY = 0;
    let imageScale = 1;
    let imageOffsetX = 0,
        imageOffsetY = 0;
    const MIN_SCALE = 0.1,
        MAX_SCALE = 5;
    let currentRotation = 0;
    let touchDistance = 0;
    let debounceTimer = null;
    let listResponseBuffer = '';
    let listResponseTimeout = null;
    let isCollectingImageList = false;
    let showCommandPending = false;
    let driverSwitchInProgress = false;
    let driverSwitchResolver = null;
    let transferAckResolver = null;
    let pendingFormatCommand = false;
    let formatFeedbackTimer = null;
    let isPreviewing = false;
    let devicePreviewReady = false;
    let previewPackedData = null;
    let previewImageData = null;
    let previewExpectedBytes = 0;
    let previewReceivedBytes = 0;
    let previewWidth = 0;
    let previewHeight = 0;
    let previewColorMode = 0;
    let previewFileName = '';
    let previewFileId = '';
    let previewLastPaint = 0;
    let previewEndReceived = false;
    let previewEndTimer = null;
    let previewFlowControlPending = false;
    const devicePreviewCache = new Map();

    function formatTime(seconds) { const m = Math.floor(seconds / 60); const s = Math.floor(seconds % 60); return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`; }
    function formatStorageBytes(bytes) {
        if (!Number.isFinite(bytes) || bytes < 0) return '--';
        if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
        if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${bytes} B`;
    }
    function resetStorageDisplay() {
        storageFreeEl.textContent = '--';
        storageFillEl.style.width = '0%';
        storageImageCountEl.textContent = '--';
        storageImageSizeEl.textContent = '单张 --';
        deviceStorageEl.classList.remove('storage-low');
    }
    function updateStorageDisplay(total, used, free, imageBytes, remainingImages) {
        const usedPercent = total > 0 ? Math.min(100, Math.max(0, used / total * 100)) : 0;
        storageFreeEl.textContent = `${formatStorageBytes(free)} / ${formatStorageBytes(total)}`;
        storageFillEl.style.width = `${usedPercent.toFixed(1)}%`;
        storageImageCountEl.textContent = String(remainingImages);
        storageImageSizeEl.textContent = `单张 ${formatStorageBytes(imageBytes)}`;
        deviceStorageEl.classList.toggle('storage-low', remainingImages < 2);
    }
    function showLoading(text) { loadingText.textContent = text;
        loadingEl.style.display = 'flex'; }
    function hideLoading() { loadingEl.style.display = 'none'; }
    function showToast(msg) { errorMsgEl.textContent = msg;
        errorMsgEl.style.display = 'block';
        errorMsgEl.className = (msg.includes('成功') || msg.includes('完成')) ? 'success' : '';
        clearTimeout(errorMsgEl._timeout);
        errorMsgEl._timeout = setTimeout(() => { errorMsgEl.style.display = 'none';
            errorMsgEl.className = ''; }, 3000); }
    function appendCommandLog(msg, type = 'send') { const timeStr = new Date().toLocaleTimeString(); const div = document.createElement('div');
        div.className = type === 'send' ? 'log-send' : (type === 'recv' ? 'log-recv' : 'log-error');
        div.textContent = `[${timeStr}] ${msg}`;
        commandOutputLog.appendChild(div);
        commandOutputLog.scrollTop = commandOutputLog.scrollHeight; }
    function clearFormatFeedbackTimer() {
        if (!formatFeedbackTimer) return;
        clearTimeout(formatFeedbackTimer);
        formatFeedbackTimer = null;
    }
    function markFormatCompleted(message = '格式化完成，设备正在重启，请稍后重新连接') {
        if (!pendingFormatCommand) return;
        pendingFormatCommand = false;
        clearFormatFeedbackTimer();
        appendCommandLog(message, 'recv');
        showToast(message);
        resetStorageDisplay();
        renderImagePickerOptions();
    }
    function handleFormatCommandResponse(decoded) {
        if (!pendingFormatCommand) return;
        const text = decoded.trim();
        if (text.includes('格式化中')) {
            clearFormatFeedbackTimer();
            appendCommandLog('设备正在格式化存储，请等待重启', 'recv');
            showToast('设备正在格式化存储，请等待重启');
            formatFeedbackTimer = setTimeout(() => {
                if (!pendingFormatCommand) return;
                appendCommandLog('格式化仍在进行，等待设备重启或断开连接...', 'recv');
                showToast('格式化仍在进行，等待设备重启');
            }, 8000);
        } else if (text.includes('完成') || text.includes('重启')) {
            markFormatCompleted('格式化完成，设备正在重启，请稍后重新连接');
        } else if (text.includes('ERROR')) {
            pendingFormatCommand = false;
            clearFormatFeedbackTimer();
            appendCommandLog(`格式化失败: ${text}`, 'error');
            showToast(`格式化失败: ${text}`);
        }
    }
    function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
    function nextPaint() { return new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); }
    function isGattBusyError(error) { const message = error && error.message ? error.message : ''; return message.includes('GATT operation already in progress') || message.includes('operation already in progress') || message.includes('GATT busy'); }
    function queueBleOperation(task) { const run = bleOperationChain.catch(() => {}).then(task); bleOperationChain = run.catch(() => {}); return run; }
    async function writeGattValue(characteristic, data, preferResponse = true) {
        const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
        return queueBleOperation(async () => {
            for (let retry = 0; retry < 8; retry++) {
                try {
                    if (preferResponse && characteristic.properties.write) {
                        if (characteristic.writeValueWithResponse) await characteristic.writeValueWithResponse(bytes);
                        else await characteristic.writeValue(bytes);
                    } else if (characteristic.properties.writeWithoutResponse) {
                        if (characteristic.writeValueWithoutResponse) await characteristic.writeValueWithoutResponse(bytes);
                        else await characteristic.writeValue(bytes);
                        await sleep(4);
                    } else if (characteristic.properties.write) {
                        if (characteristic.writeValueWithResponse) await characteristic.writeValueWithResponse(bytes);
                        else await characteristic.writeValue(bytes);
                    } else {
                        throw new Error('特征不支持写入');
                    }
                    return true;
                } catch (e) {
                    if (!isGattBusyError(e) || retry === 7) throw e;
                    await sleep(10 + retry * 10);
                }
            }
            return false;
        });
    }
    async function refreshDeviceInfoFromBle() {
        if (!connectedService) return false;
        try {
            return await queueBleOperation(async () => {
                const decoder = new TextDecoder();
                const model = decoder.decode(await (await connectedService.getCharacteristic(MODEL_CHAR_UUID)).readValue());
                const w = parseInt(decoder.decode(await (await connectedService.getCharacteristic(WIDTH_CHAR_UUID)).readValue()));
                const h = parseInt(decoder.decode(await (await connectedService.getCharacteristic(HEIGHT_CHAR_UUID)).readValue()));
                const cm = parseInt(decoder.decode(await (await connectedService.getCharacteristic(COLOR_CHAR_UUID)).readValue()));
                applyDeviceInfo(model, w, h, cm);
                appendCommandLog(`已刷新设备信息: ${model} ${w}x${h} colorMode=${cm}`, 'recv');
                return true;
            });
        } catch (e) {
            appendCommandLog(`刷新设备信息失败: ${e.message}`, 'error');
            return false;
        }
    }
    function updateSliderLabels() { saturationValueEl.textContent = saturationSlider.value;
        brightnessValueEl.textContent = brightnessSlider.value;
        contrastValueEl.textContent = contrastSlider.value;
        diffusionValueEl.textContent = diffusionSlider.value; }
    function updateStatusInfo() { currentCanvasSizeEl.textContent = `${canvas.width}×${canvas.height}`;
        canvasSizeIndicator.textContent = `${canvas.width}×${canvas.height}`;
        currentModeEl.textContent = MODE_NAMES[ditherModeSelect.value];
        currentAlgorithmEl.textContent = ALGO_NAMES[ditherAlgorithmSelect.value];
        modeDescEl.textContent = MODE_DESCRIPTIONS[ditherModeSelect.value];
        algoDescEl.textContent = ALGO_DESCRIPTIONS[ditherAlgorithmSelect.value];
        ditherModeSelect.title = MODE_DESCRIPTIONS[ditherModeSelect.value];
        ditherAlgorithmSelect.title = ALGO_DESCRIPTIONS[ditherAlgorithmSelect.value];
        imageStatusEl.textContent = originalImage ? '已上传' : (originalImageData ? '已生成' : (devicePreviewReady ? '设备预览' : '未上传'));
        const isConnected = Boolean(connectedDevice && connectedDevice.gatt.connected);
        const calendarSupported = [2, 3, 4, 6].includes(Number(getDriverConfig(currentModel)?.numericColorMode));
        const sendImageDisabled = driverSwitchInProgress || isTransferring || !isConnected || !processedImageData;
        sendBluetoothBtn.disabled = sendImageDisabled;
        if (previewSendImageBtn) previewSendImageBtn.disabled = sendImageDisabled;
        if (driverSelect) driverSelect.disabled = driverSwitchInProgress || isTransferring;
        if (showCalendarBtn) showCalendarBtn.disabled = driverSwitchInProgress || !isConnected || !connectedCommandChar || !calendarSupported;
        if (showClockBtn) showClockBtn.disabled = driverSwitchInProgress || !isConnected || !connectedCommandChar || !calendarSupported;
        if (clearDisplayBtn) clearDisplayBtn.disabled = driverSwitchInProgress || isTransferring || isTransferSettling() || !isConnected || !connectedCommandChar;
        if (sendCommandBtn) sendCommandBtn.disabled = driverSwitchInProgress || isTransferSettling() || !(connectedDevice && connectedDevice.gatt.connected);
        if (connectedDevice && connectedDevice.gatt.connected) {
            bluetoothStatusEl.textContent = `已连接: ${currentDeviceName || connectedDevice.name || '未知设备'}`;
            deviceModelEl.textContent = currentModel || '未知型号';
            scanBluetoothBtn.style.display = 'none';
            disconnectBluetoothBtn.style.display = 'block'; } else { bluetoothStatusEl.textContent = '未连接';
            deviceModelEl.textContent = '未连接';
            scanBluetoothBtn.style.display = 'block';
            disconnectBluetoothBtn.style.display = 'none';
            sendCommandBtn.disabled = true; } }
    function debounce(fn, delay = 50) { return function(...args) { clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => fn.apply(this, args), delay); }; }
    function showTransferDialog() { transferDialog.style.display = 'flex';
        transferTitleText.textContent = '正在准备发送...';
        dialogProgressBar.classList.add('is-preparing');
        dialogProgressBar.style.width = '0%';
        dialogProgressText.textContent = '0%';
        dialogBytesText.textContent = '0 / 0 字节';
        dialogSpeedText.textContent = '-- KB/s';
        dialogElapsedText.textContent = '00:00';
        dialogRemainingText.textContent = '--:--'; }
    function hideTransferDialog() { transferDialog.style.display = 'none'; }
    function isTransferSettling() { return Date.now() < transferSettleUntil; }
    function getTransferSettleDelay() { return Math.max(0, transferSettleUntil - Date.now()); }
    function markPostTransferSettle(ms = POST_TRANSFER_SETTLE_MS) {
        transferSettleUntil = Math.max(transferSettleUntil, Date.now() + ms);
        updateStatusInfo();
    }
    function finishPostTransferSettle() {
        transferSettleUntil = 0;
        if (transferSettleResolver) {
            transferSettleResolver();
            transferSettleResolver = null;
        }
        updateStatusInfo();
        if (postTransferRefreshTimer) schedulePostTransferRefresh();
    }
    function stopTransferDisplayWaitAnimation() {
        if (!transferDisplayAnimationFrame) return;
        cancelAnimationFrame(transferDisplayAnimationFrame);
        transferDisplayAnimationFrame = 0;
    }
    function startTransferDisplayWaitAnimation() {
        stopTransferDisplayWaitAnimation();
        updateTransferStage(100, '数据已送达，等待屏幕刷新确认...');
        return;
        const startedAt = performance.now();
        const tick = now => {
            if (transferDisplayStarted) {
                transferDisplayAnimationFrame = 0;
                return;
            }
            const progress = Math.min(1, Math.max(0, (now - startedAt) / TRANSFER_DISPLAY_WAIT_EASE_MS));
            const eased = 1 - Math.pow(1 - progress, 2);
            const percent = Math.min(
                TRANSFER_DISPLAY_WAIT_MAX_PROGRESS,
                Math.round((TRANSFER_DISPLAY_PROGRESS + eased * (TRANSFER_DISPLAY_WAIT_MAX_PROGRESS - TRANSFER_DISPLAY_PROGRESS)) * 10) / 10
            );
            dialogProgressBar.classList.remove('is-preparing');
            dialogProgressBar.style.width = `${percent}%`;
            dialogProgressText.textContent = `${Math.floor(percent)}%`;
            transferTitleText.textContent = '设备写入完成，即将唤醒屏幕...';
            dialogBytesText.textContent = '等待设备开始刷新屏幕...';
            const elapsed = transferStartTime ? (Date.now() - transferStartTime) / 1000 : 0;
            dialogElapsedText.textContent = formatTime(elapsed);
            dialogRemainingText.textContent = '--:--';
            transferDisplayAnimationFrame = requestAnimationFrame(tick);
        };
        transferDisplayAnimationFrame = requestAnimationFrame(tick);
    }
    function finishTransferDisplayWait(ok = true) {
        transferDisplayStarted = ok;
        stopTransferDisplayWaitAnimation();
        if (transferDisplayResolver) {
            transferDisplayResolver(ok);
            transferDisplayResolver = null;
        }
    }
    async function waitForTransferDisplayStart() {
        if (transferDisplayStarted) return true;
        return new Promise(resolve => {
            const timer = setTimeout(() => {
                if (transferDisplayResolver) transferDisplayResolver = null;
                resolve(false);
            }, POST_TRANSFER_SETTLE_MS);
            transferDisplayResolver = ok => {
                clearTimeout(timer);
                resolve(Boolean(ok));
            };
        });
    }
    function clearPostTransferRefresh() {
        if (!postTransferRefreshTimer) return;
        clearTimeout(postTransferRefreshTimer);
        postTransferRefreshTimer = null;
    }
    async function waitForPostTransferSettle() {
        const waitMs = getTransferSettleDelay();
        if (waitMs <= 0) return;
        showTransferDialog();
        transferStartTime = Date.now();
        updateTransferStage(1, '等待设备整理上一张图片...');
        await new Promise(resolve => {
            const timer = setTimeout(resolve, waitMs);
            transferSettleResolver = () => {
                clearTimeout(timer);
                resolve();
            };
        });
        transferSettleResolver = null;
    }
    function schedulePostTransferRefresh() {
        clearPostTransferRefresh();
        postTransferRefreshTimer = null;
    }
    function updateTransferStage(percent, message) {
        dialogProgressBar.classList.remove('is-preparing');
        dialogProgressBar.style.width = `${percent}%`;
        dialogProgressText.textContent = `${percent}%`;
        transferTitleText.textContent = message;
        dialogBytesText.textContent = message;
        const elapsed = transferStartTime ? (Date.now() - transferStartTime) / 1000 : 0;
        dialogElapsedText.textContent = formatTime(elapsed);
        dialogRemainingText.textContent = '--:--';
    }
    function mapTransferDataPercent(sent, total) {
        if (!total) return TRANSFER_DATA_PROGRESS_START;
        const dataPercent = Math.max(0, Math.min(1, sent / total));
        return Math.min(TRANSFER_DISPLAY_PROGRESS, Math.round(TRANSFER_DATA_PROGRESS_START + dataPercent * (TRANSFER_DISPLAY_PROGRESS - TRANSFER_DATA_PROGRESS_START)));
    }
    function updateTransferProgress(percent, sent, total, speed) { dialogProgressBar.classList.remove('is-preparing');
        dialogProgressBar.style.width = `${percent}%`;
        dialogProgressText.textContent = `${percent}%`;
        transferTitleText.textContent = '正在处理并发送图片...';
        dialogBytesText.textContent = `${sent} / ${total} 字节`;
        dialogSpeedText.textContent = sent > 0 ? `${speed} KB/s` : '-- KB/s'; const elapsed = (Date.now() - transferStartTime) / 1000;
        dialogElapsedText.textContent = formatTime(elapsed);
        dialogRemainingText.textContent = (sent > 0 && percent > 0 && percent < 100) ? formatTime(elapsed * (100 / percent) - elapsed) : '--:--'; }
    function adjustDragByRotation(dx, dy, rot) { const rad = (rot * Math.PI) / 180; return { x: dx * Math.cos(rad) + dy * Math.sin(rad), y: -dx * Math.sin(rad) + dy * Math.cos(rad) }; }
    function redrawImage() { if (!originalImage) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((currentRotation * Math.PI) / 180); const iw = originalImage.width * imageScale; const ih = originalImage.height * imageScale;
        ctx.drawImage(originalImage, -iw / 2 + imageOffsetX, -ih / 2 + imageOffsetY, iw, ih);
        ctx.restore();
        originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        refreshProcessedImage(); }
    function refreshProcessedImage() { if (!originalImageData) return; const imgData = new ImageData(new Uint8ClampedArray(originalImageData.data), originalImageData.width, originalImageData.height);
        ditherImage(imgData, parseFloat(saturationSlider.value), parseFloat(brightnessSlider.value), parseFloat(contrastSlider.value), parseFloat(diffusionSlider.value), ditherAlgorithmSelect.value);
        processedImageData = imgData;
        ctx.putImageData(processedImageData, 0, 0);
        if (window.EPD_PAINT_MANAGER?.hasEditorContent?.()) {
            window.EPD_PAINT_MANAGER.redrawAll(false);
        }
        updateStatusInfo(); }
    window.EPD_EDITOR_COMMIT = function commitEditorCanvas(sourceCanvas, options = {}) {
        if (!sourceCanvas) return false;
        if (isPreviewing) cancelDevicePreview(true);
        const sourceWidth = sourceCanvas.width;
        const sourceHeight = sourceCanvas.height;
        let editorImageData = null;
        if (sourceCanvas === canvas) {
            editorImageData = ctx.getImageData(0, 0, sourceWidth, sourceHeight);
        }
        originalImage = null;
        devicePreviewReady = false;
        canvas.width = sourceWidth;
        canvas.height = sourceHeight;
        canvasWidthInput.value = sourceWidth;
        canvasHeightInput.value = sourceHeight;
        if (editorImageData) {
            ctx.putImageData(editorImageData, 0, 0);
        } else {
            ctx.drawImage(sourceCanvas, 0, 0);
        }
        originalImageData = ctx.getImageData(0, 0, sourceWidth, sourceHeight);
        refreshProcessedImage();
        if (options.preserveVisible && editorImageData) {
            ctx.putImageData(editorImageData, 0, 0);
        }
        return true;
    };
    const debouncedRefresh = debounce(refreshProcessedImage, 45);
    function resetImageTransform() { imageScale = originalImage
            ? Math.min(MAX_SCALE, Math.max(MIN_SCALE, Math.max(canvas.width / originalImage.width, canvas.height / originalImage.height)))
            : 1;
        imageOffsetX = 0;
        imageOffsetY = 0;
        currentRotation = 0;
        redrawImage();
        showToast('已重置图片位置、缩放与旋转'); }
    function rotateImage(deg) { if (!originalImage) { showToast('请先上传图片'); return; }
        currentRotation += deg;
        redrawImage(); }
    async function clearLocalCanvas() {
        if (isPreviewing) await cancelDevicePreview(true);
        originalImage = null;
        originalImageData = null;
        processedImageData = null;
        devicePreviewReady = false;
        imageUploadInput.value = '';
        imageScale = 1;
        imageOffsetX = 0;
        imageOffsetY = 0;
        currentRotation = 0;
        // Keep the device-image picker selection and preview cache intact.
        ctx.fillStyle = '#f7fafd';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#6b8499';
        ctx.font = '15px "Segoe UI", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('上传图片后预览将显示在这里', canvas.width / 2, canvas.height / 2);
        window.EPD_PAINT_MANAGER?.resetToBlankBase?.(false);
        updateStatusInfo();
        showToast('主预览画布已清除，设备图片预览缓存已保留');
    }
    function updateCanvas() { const w = parseInt(canvasWidthInput.value) || 768; const h = parseInt(canvasHeightInput.value) || 552; const res = `${w}x${h}`;
        quickResolutionsSelect.value = [...quickResolutionsSelect.options].some(o => o.value === res) ? res : 'custom';
        canvas.width = w;
        canvas.height = h;
        if (originalImage) {
            redrawImage();
            window.EPD_PAINT_MANAGER?.captureCurrentCanvasAsBase?.(true);
        } else {
            ctx.fillStyle = '#f7fafd';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            processedImageData = null;
            originalImageData = null;
            window.EPD_PAINT_MANAGER?.resetToBlankBase?.(false);
            updateStatusInfo();
        } }

    function applyDriverConfig(model, options = {}) {
        const cfg = getDriverConfig(model);
        if (!cfg) return false;
        if (driverSelect) driverSelect.value = model;
        canvasWidthInput.value = cfg.width;
        canvasHeightInput.value = cfg.height;
        ditherModeSelect.value = cfg.colorMode;
        if (options.setCurrentModel) currentModel = model;
        updateCanvas();
        updateStatusInfo();
        return true;
    }
    function applyDeviceInfo(model, width, height, colorMode) {
        currentModel = model || '';
        const cfg = getDriverConfig(currentModel);
        if (driverSelect && cfg) driverSelect.value = currentModel;
        canvasWidthInput.value = Number.isFinite(width) && width > 0 ? width : (cfg ? cfg.width : 768);
        canvasHeightInput.value = Number.isFinite(height) && height > 0 ? height : (cfg ? cfg.height : 552);
        ditherModeSelect.value = cfg ? cfg.colorMode : (COLOR_MODE_MAP[colorMode] || ditherModeSelect.value);
        updateCanvas();
        updateStatusInfo();
        renderCalendarPreview(true);
    }
    function expectedImageBytes(width, height, mode) {
        if (mode === 'sixColor') return Math.ceil(width * height / 2);
        if (mode === 'fourColor') return Math.ceil(width * height / 4);
        if (mode === 'threeColor') return Math.ceil(width / 8) * height * 2;
        return Math.ceil(width / 8) * height;
    }
    function validateTransferConfig(dataLength) {
        const cfg = getDriverConfig(currentModel);
        if (cfg && (canvas.width !== cfg.width || canvas.height !== cfg.height || ditherModeSelect.value !== cfg.colorMode)) {
            showToast(`当前画布与设备驱动 ${currentModel} 不匹配`);
            return false;
        }
        const expected = expectedImageBytes(canvas.width, canvas.height, ditherModeSelect.value);
        if (dataLength !== expected) {
            showToast(`图像数据长度异常: ${dataLength}，预期 ${expected}`);
            return false;
        }
        return true;
    }
    function ditherImage(imageData, saturation, brightness, contrast, diffusion, algorithm) { const data = imageData.data,
            width = imageData.width,
            height = imageData.height,
            mode = ditherModeSelect.value; let palette; if (mode === 'sixColor') palette = [{ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 }, { r: 255, g: 255, b: 0 }, { r: 255, g: 0, b: 0 }, { r: 0, g: 0, b: 0 }, { r: 0, g: 0, b: 255 }, { r: 0, g: 255, b: 0 }]; else if (mode === 'fourColor') palette = [{ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 }, { r: 255, g: 255, b: 0 }, { r: 255, g: 0, b: 0 }]; else if (mode === 'threeColor') palette = [{ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 }, { r: 255, g: 0, b: 0 }]; else palette = [{ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 }]; const findClosest = (r, g, b) => { let bestIdx = 0,
                minD = Infinity; for (let i = 0; i < palette.length; i++) { if (mode === 'sixColor' && i === 4) continue; const dr = r - palette[i].r,
                    dg = g - palette[i].g,
                    db = b - palette[i].b; const d = dr * dr + dg * dg + db * db; if (d < minD) { minD = d;
                    bestIdx = i; } } return { idx: bestIdx, color: palette[bestIdx] }; }; const adjustColor = (r, g, b) => { let rr = r * brightness,
                gg = g * brightness,
                bb = b * brightness;
            rr = (rr - 128) * contrast + 128;
            gg = (gg - 128) * contrast + 128;
            bb = (bb - 128) * contrast + 128; const avg = (rr + gg + bb) / 3;
            rr = avg + (rr - avg) * saturation;
            gg = avg + (gg - avg) * saturation;
            bb = avg + (bb - avg) * saturation; return { r: Math.min(255, Math.max(0, rr)), g: Math.min(255, Math.max(0, gg)), b: Math.min(255, Math.max(0, bb)) }; }; if (algorithm === 'none') { for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) { const idx = (y * width + x) * 4; const adj = adjustColor(data[idx], data[idx + 1], data[idx + 2]); const cl = findClosest(adj.r, adj.g, adj.b);
            data[idx] = cl.color.r;
            data[idx + 1] = cl.color.g;
            data[idx + 2] = cl.color.b; } return; } if (algorithm === 'bayer') { const bm = [
                [0, 32, 8, 40, 2, 34, 10, 42],
                [48, 16, 56, 24, 50, 18, 58, 26],
                [12, 44, 4, 36, 14, 46, 6, 38],
                [60, 28, 52, 20, 62, 30, 54, 22],
                [3, 35, 11, 43, 1, 33, 9, 41],
                [51, 19, 59, 27, 49, 17, 57, 25],
                [15, 47, 7, 39, 13, 45, 5, 37],
                [63, 31, 55, 23, 61, 29, 53, 21]
            ]; for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) { const idx = (y * width + x) * 4; const adj = adjustColor(data[idx], data[idx + 1], data[idx + 2]); const th = (bm[y % 8][x % 8] / 64) * 255; const gray = 0.299 * adj.r + 0.587 * adj.g + 0.114 * adj.b; if (mode === 'blackWhiteColor') { const c = gray >= th ? palette[1] : palette[0];
                data[idx] = c.r;
                data[idx + 1] = c.g;
                data[idx + 2] = c.b; } else { const shift = (gray - th) * diffusion; const cl = findClosest(adj.r + shift, adj.g + shift, adj.b + shift);
                data[idx] = cl.color.r;
                data[idx + 1] = cl.color.g;
                data[idx + 2] = cl.color.b; } } return; } const matrices = { 'floyd-steinberg': [{ x: 1, y: 0, w: 7 / 16 }, { x: -1, y: 1, w: 3 / 16 }, { x: 0, y: 1, w: 5 / 16 }, { x: 1, y: 1, w: 1 / 16 }], 'atkinson': [{ x: 1, y: 0, w: 1 / 8 }, { x: 2, y: 0, w: 1 / 8 }, { x: -1, y: 1, w: 1 / 8 }, { x: 0, y: 1, w: 1 / 8 }, { x: 1, y: 1, w: 1 / 8 }, { x: 0, y: 2, w: 1 / 8 }], 'stucki': [{ x: 1, y: 0, w: 8 / 42 }, { x: 2, y: 0, w: 4 / 42 }, { x: -2, y: 1, w: 2 / 42 }, { x: -1, y: 1, w: 4 / 42 }, { x: 0, y: 1, w: 8 / 42 }, { x: 1, y: 1, w: 4 / 42 }, { x: 2, y: 1, w: 2 / 42 }, { x: -2, y: 2, w: 1 / 42 }, { x: -1, y: 2, w: 2 / 42 }, { x: 0, y: 2, w: 4 / 42 }, { x: 1, y: 2, w: 2 / 42 }, { x: 2, y: 2, w: 1 / 42 }], 'jarvis-judice-ninke': [{ x: 1, y: 0, w: 7 / 48 }, { x: 2, y: 0, w: 5 / 48 }, { x: -2, y: 1, w: 3 / 48 }, { x: -1, y: 1, w: 5 / 48 }, { x: 0, y: 1, w: 7 / 48 }, { x: 1, y: 1, w: 5 / 48 }, { x: 2, y: 1, w: 3 / 48 }, { x: -2, y: 2, w: 1 / 48 }, { x: -1, y: 2, w: 3 / 48 }, { x: 0, y: 2, w: 5 / 48 }, { x: 1, y: 2, w: 3 / 48 }, { x: 2, y: 2, w: 1 / 48 }] }; const matrix = matrices[algorithm] || matrices['floyd-steinberg']; for (let y = 0; y < height; y++)
            for (let x = 0; x < width; x++) { const idx = (y * width + x) * 4; const adj = adjustColor(data[idx], data[idx + 1], data[idx + 2]); const cl = findClosest(adj.r, adj.g, adj.b); const errR = adj.r - cl.color.r,
                    errG = adj.g - cl.color.g,
                    errB = adj.b - cl.color.b;
            data[idx] = cl.color.r;
            data[idx + 1] = cl.color.g;
            data[idx + 2] = cl.color.b; for (const { x: dx, y: dy, w } of matrix) { const nx = x + dx,
                    ny = y + dy; if (nx >= 0 && nx < width && ny >= 0 && ny < height) { const nIdx = (ny * width + nx) * 4; const f = w * diffusion;
                data[nIdx] = Math.min(255, Math.max(0, data[nIdx] + errR * f));
                data[nIdx + 1] = Math.min(255, Math.max(0, data[nIdx + 1] + errG * f));
                data[nIdx + 2] = Math.min(255, Math.max(0, data[nIdx + 2] + errB * f)); } } } }

    function processImageData(imageData) { const w = imageData.width,
            h = imageData.height,
            data = imageData.data,
            mode = ditherModeSelect.value; if (mode === 'sixColor') { const out = new Uint8Array(Math.ceil((w * h) / 2)); const pal = [
                [0, 0, 0],
                [255, 255, 255],
                [255, 255, 0],
                [255, 0, 0],
                [0, 0, 0],
                [0, 0, 255],
                [0, 255, 0]
            ]; const fi = (r, g, b) => { let bI = 0,
                    mD = Infinity; for (let i = 0; i < pal.length; i++) { if (i === 4) continue; const dr = r - pal[i][0],
                    dg = g - pal[i][1],
                    db = b - pal[i][2]; const d = dr * dr + dg * dg + db * db; if (d < mD) { mD = d;
                    bI = i; } } return bI; }; for (let y = 0; y < h; y++) for (let x = 0; x < w; x += 2) { const i1 = (y * w + x) * 4; const c1 = fi(data[i1], data[i1 + 1], data[i1 + 2]); const c2 = (x + 1 < w) ? fi(data[i1 + 4], data[i1 + 5], data[i1 + 6]) : 1;
            out[Math.floor((y * w + x) / 2)] = (c1 << 4) | c2; } return out; } if (mode === 'fourColor') { const out = new Uint8Array(Math.ceil((w * h) / 4)); const pal = [
                [0, 0, 0],
                [255, 255, 255],
                [255, 255, 0],
                [255, 0, 0]
            ]; const fi = (r, g, b) => { let bI = 0,
                    mD = Infinity; for (let i = 0; i < pal.length; i++) { const dr = r - pal[i][0],
                    dg = g - pal[i][1],
                    db = b - pal[i][2]; const d = dr * dr + dg * dg + db * db; if (d < mD) { mD = d;
                    bI = i; } } return bI; }; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const idx = (y * w + x) * 4; const ci = fi(data[idx], data[idx + 1], data[idx + 2]); const byteIdx = Math.floor((y * w + x) / 4); const shift = 6 - (x % 4) * 2;
            out[byteIdx] |= ci << shift; } return out; } if (mode === 'threeColor') { const bwLen = Math.ceil(w / 8); const bwData = new Uint8Array(h * bwLen); const redData = new Uint8Array(h * bwLen); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const idx = (y * w + x) * 4; const r = data[idx],
                    g = data[idx + 1],
                    b = data[idx + 2]; const gray = 0.299 * r + 0.587 * g + 0.114 * b; const bwBit = gray >= 140 ? 1 : 0; const byteIdx = y * bwLen + Math.floor(x / 8); const bitIdx = 7 - (x % 8); if (bwBit) bwData[byteIdx] |= 1 << bitIdx;
            else bwData[byteIdx] &= ~(1 << bitIdx); const redBit = (r > 160 && r > g && r > b) ? 0 : 1; if (redBit) redData[byteIdx] |= 1 << bitIdx;
            else redData[byteIdx] &= ~(1 << bitIdx); } const out = new Uint8Array(bwData.length + redData.length);
            out.set(bwData, 0);
            out.set(redData, bwData.length); return out; } const bwLen = Math.ceil(w / 8); const out = new Uint8Array(bwLen * h); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const idx = (y * w + x) * 4; const gray = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]; const bit = gray < 128 ? 1 : 0; const byteIdx = y * bwLen + Math.floor(x / 8); const bitIdx = 7 - (x % 8); if (bit) out[byteIdx] |= 1 << bitIdx;
        else out[byteIdx] &= ~(1 << bitIdx); } return out; }

    function handleImageUpload(file) { if (isPreviewing) cancelDevicePreview(true); const reader = new FileReader();
        reader.onload = function(e) { const img = new Image();
            img.onload = function() { devicePreviewReady = false;
                originalImage = img;
                resetImageTransform();
                updateCanvas(); };
            img.src = e.target.result; };
        reader.readAsDataURL(file); }

    function previewCacheKey(filename, fileId) {
        const deviceKey = connectedDevice?.id || currentDeviceName || 'device';
        return fileId ? `${deviceKey}|id:${fileId.toUpperCase()}` : `${deviceKey}|name:${String(filename).toUpperCase()}`;
    }
    function updatePreviewFingerprintValue(fingerprint, bytes) {
        let value = fingerprint >>> 0;
        for (let i = 0; i < bytes.length; i++) value = Math.imul((value ^ bytes[i]) >>> 0, 16777619) >>> 0;
        return value >>> 0;
    }
    function formatPreviewFingerprint(fingerprint) {
        return (fingerprint >>> 0).toString(16).toUpperCase().padStart(8, '0');
    }
    function calculatePreviewFingerprint(bytes) {
        return formatPreviewFingerprint(updatePreviewFingerprintValue(2166136261, bytes));
    }

    function nearestPaletteIndex(r, g, b, palette, skipIndex = -1) {
        let bestIndex = 0;
        let bestDistance = Infinity;
        for (let i = 0; i < palette.length; i++) {
            if (i === skipIndex) continue;
            const dr = r - palette[i][0];
            const dg = g - palette[i][1];
            const db = b - palette[i][2];
            const distance = dr * dr + dg * dg + db * db;
            if (distance < bestDistance) {
                bestDistance = distance;
                bestIndex = i;
            }
        }
        return bestIndex;
    }
    function getPackedImageByteAt(imageData, byteIndex, mode) {
        const w = imageData.width;
        const h = imageData.height;
        const data = imageData.data;
        if (mode === 'sixColor') {
            const palette = [[0, 0, 0], [255, 255, 255], [255, 255, 0], [255, 0, 0], [0, 0, 0], [0, 0, 255], [0, 255, 0]];
            const pixelIndex = byteIndex * 2;
            const first = pixelIndex < w * h ? pixelIndex : -1;
            const second = pixelIndex + 1 < w * h ? pixelIndex + 1 : -1;
            const firstOffset = first * 4;
            const secondOffset = second * 4;
            const c1 = first >= 0 ? nearestPaletteIndex(data[firstOffset], data[firstOffset + 1], data[firstOffset + 2], palette, 4) : 1;
            const c2 = second >= 0 ? nearestPaletteIndex(data[secondOffset], data[secondOffset + 1], data[secondOffset + 2], palette, 4) : 1;
            return (c1 << 4) | c2;
        }
        if (mode === 'fourColor') {
            const palette = [[0, 0, 0], [255, 255, 255], [255, 255, 0], [255, 0, 0]];
            let value = 0;
            for (let part = 0; part < 4; part++) {
                const pixelIndex = byteIndex * 4 + part;
                if (pixelIndex >= w * h) continue;
                const offset = pixelIndex * 4;
                const colorIndex = nearestPaletteIndex(data[offset], data[offset + 1], data[offset + 2], palette);
                value |= colorIndex << (6 - part * 2);
            }
            return value;
        }
        const lineBytes = Math.ceil(w / 8);
        const planeBytes = h * lineBytes;
        const redPlane = mode === 'threeColor' && byteIndex >= planeBytes;
        const planeByteIndex = redPlane ? byteIndex - planeBytes : byteIndex;
        const y = Math.floor(planeByteIndex / lineBytes);
        const byteX = planeByteIndex % lineBytes;
        let value = 0;
        for (let bit = 0; bit < 8; bit++) {
            const x = byteX * 8 + bit;
            if (x >= w || y >= h) continue;
            const offset = (y * w + x) * 4;
            const r = data[offset];
            const g = data[offset + 1];
            const b = data[offset + 2];
            if (redPlane) {
                if (!(r > 160 && r > g && r > b)) value |= 1 << (7 - bit);
            } else {
                const gray = 0.299 * r + 0.587 * g + 0.114 * b;
                const blackWhiteBit = mode === 'threeColor' ? (gray >= 140 ? 1 : 0) : (gray < 128 ? 1 : 0);
                if (blackWhiteBit) value |= 1 << (7 - bit);
            }
        }
        return value;
    }
    function createPackedImageStreamer(imageData, chunkSize) {
        const mode = ditherModeSelect.value;
        const totalBytes = expectedImageBytes(imageData.width, imageData.height, mode);
        let offset = 0;
        return {
            totalBytes,
            nextChunk() {
                if (offset >= totalBytes) return null;
                const length = Math.min(chunkSize, totalBytes - offset);
                const chunk = new Uint8Array(length);
                for (let i = 0; i < length; i++) chunk[i] = getPackedImageByteAt(imageData, offset + i, mode);
                offset += length;
                return chunk;
            }
        };
    }
    function cacheUploadedPreview(filename, fileId, imageData, colorMode) {
        if (!fileId || !imageData) return false;
        const key = previewCacheKey(filename, fileId);
        devicePreviewCache.set(key, {
            width: imageData.width,
            height: imageData.height,
            colorMode,
            imageData: new ImageData(new Uint8ClampedArray(imageData.data), imageData.width, imageData.height)
        });
        appendCommandLog(`预览缓存已建立: ${filename || '(待刷新)'} id=${fileId}`, 'recv');
        return true;
    }
    function showCachedDevicePreview(entry) {
        clearTimeout(previewEndTimer);
        previewEndTimer = null;
        isPreviewing = false;
        devicePreviewReady = true;
        originalImage = null;
        canvasWidthInput.value = entry.width;
        canvasHeightInput.value = entry.height;
        canvas.width = entry.width;
        canvas.height = entry.height;
        originalImageData = new ImageData(new Uint8ClampedArray(entry.imageData.data), entry.width, entry.height);
        processedImageData = new ImageData(new Uint8ClampedArray(entry.imageData.data), entry.width, entry.height);
        ctx.putImageData(processedImageData, 0, 0);
        canvasSizeIndicator.textContent = `${entry.width}×${entry.height}`;
        updateStatusInfo();
        showToast('已从网页缓存加载预览');
    }
    function hidePickerHoverPreview() {
        hoverPreviewCanvas.hidden = true;
        previewHoverMessage.hidden = true;
    }
    function showCachedHoverPreview(entry) {
        previewHoverMessage.hidden = true;
        hoverPreviewCanvas.width = entry.width;
        hoverPreviewCanvas.height = entry.height;
        hoverPreviewCtx.putImageData(entry.imageData, 0, 0);
        hoverPreviewCanvas.hidden = false;
    }
    function showUncachedHoverMessage() {
        hoverPreviewCanvas.hidden = true;
        previewHoverMessage.hidden = false;
    }
    function positionImagePicker() {
        if (imagePickerMenu.hidden) return;
        imagePickerMenu.classList.remove('drop-up');
        const buttonRect = imagePickerButton.getBoundingClientRect();
        const desiredHeight = Math.min(imagePickerMenu.scrollHeight, 240);
        const spaceBelow = window.innerHeight - buttonRect.bottom - 12;
        const spaceAbove = buttonRect.top - 12;
        if (spaceBelow < Math.min(desiredHeight, 180) && spaceAbove > spaceBelow) {
            imagePickerMenu.classList.add('drop-up');
        }
    }
    function closeImagePicker() {
        imagePickerMenu.hidden = true;
        imagePickerMenu.classList.remove('drop-up');
        imagePickerPanel?.classList.remove('image-picker-open');
        imagePickerButton.setAttribute('aria-expanded', 'false');
        hidePickerHoverPreview();
    }
    function openImagePicker() {
        if (!imagePickerMenu.hidden) { closeImagePicker(); return; }
        imagePickerMenu.hidden = false;
        imagePickerPanel?.classList.add('image-picker-open');
        imagePickerButton.setAttribute('aria-expanded', 'true');
        requestAnimationFrame(positionImagePicker);
    }
    function renderImagePickerOptions() {
        imagePickerMenu.replaceChildren();
        const selectableOptions = [...imageListSelect.options].filter(option => option.value);
        const selectedOption = imageListSelect.options[imageListSelect.selectedIndex];
        imagePickerButton.textContent = selectedOption?.textContent || selectableOptions[0]?.textContent || '无图片文件';
        imagePickerButton.disabled = selectableOptions.length === 0;
        for (const option of selectableOptions) {
            const item = document.createElement('button');
            item.type = 'button';
            item.className = 'image-picker-option';
            item.setAttribute('role', 'option');
            item.setAttribute('aria-selected', String(option.value === imageListSelect.value));
            item.textContent = option.textContent;
            item.addEventListener('mouseenter', () => {
                const cached = devicePreviewCache.get(previewCacheKey(option.value, option.dataset.fileId || ''));
                if (cached) showCachedHoverPreview(cached);
                else showUncachedHoverMessage();
            });
            item.addEventListener('click', () => {
                imageListSelect.value = option.value;
                imagePickerButton.textContent = option.textContent;
                closeImagePicker();
                imageListSelect.dispatchEvent(new Event('change'));
            });
            imagePickerMenu.appendChild(item);
        }
    }
    function setDeviceImageListPlaceholder(message, stale = false) {
        closeImagePicker();
        imageListSelect.innerHTML = '';
        const opt = document.createElement('option');
        opt.value = '';
        opt.textContent = message;
        imageListSelect.appendChild(opt);
        imageListSelect.selectedIndex = 0;
        imageListSelect.dataset.stale = stale ? 'true' : 'false';
        imagePickerPanel?.classList.toggle('is-stale', stale);
        imagePickerButton.title = message;
        renderImagePickerOptions();
    }
    function markDeviceImageListStale(message = '驱动已切换，旧图片列表可能不适配，请刷新列表') {
        devicePreviewCache.clear();
        devicePreviewReady = false;
        setDeviceImageListPlaceholder(message, true);
    }
    function beginDevicePreview(filename, totalBytes, width, height, colorMode, fileId) {
        isPreviewing = true;
        devicePreviewReady = false;
        previewExpectedBytes = totalBytes;
        previewReceivedBytes = 0;
        previewWidth = width;
        previewHeight = height;
        previewColorMode = colorMode;
        previewFileName = filename;
        previewFileId = fileId || '';
        previewEndReceived = false;
        previewFlowControlPending = false;
        clearTimeout(previewEndTimer);
        previewEndTimer = null;
        previewPackedData = new Uint8Array(totalBytes);
        if (colorMode === 3) previewPackedData.fill(0xff);
        previewImageData = new ImageData(width, height);
        for (let i = 0; i < previewImageData.data.length; i += 4) {
            previewImageData.data[i] = 255;
            previewImageData.data[i + 1] = 255;
            previewImageData.data[i + 2] = 255;
            previewImageData.data[i + 3] = 255;
        }
        originalImage = null;
        originalImageData = null;
        processedImageData = null;
        canvasWidthInput.value = width;
        canvasHeightInput.value = height;
        canvas.width = width;
        canvas.height = height;
        previewLastPaint = 0;
        ctx.putImageData(previewImageData, 0, 0);
        canvasSizeIndicator.textContent = `${width}×${height} · 0%`;
        updateStatusInfo();
        showToast(`正在读取设备图片: ${filename}`);
        sendCustomCommand('PREVIEW_READY').then(ok => {
            if (!ok) {
                isPreviewing = false;
                showToast('设备图片预览握手失败');
            }
        });
    }

    function setPreviewPixel(pixelIndex, color) {
        if (!previewImageData || pixelIndex < 0 || pixelIndex >= previewWidth * previewHeight) return;
        const offset = pixelIndex * 4;
        previewImageData.data[offset] = color[0];
        previewImageData.data[offset + 1] = color[1];
        previewImageData.data[offset + 2] = color[2];
        previewImageData.data[offset + 3] = 255;
    }

    function decodePreviewRange(startByte, byteLength) {
        if (!previewPackedData || !previewImageData) return;
        const fourPalette = [[0, 0, 0], [255, 255, 255], [255, 220, 0], [220, 35, 35]];
        const sixPalette = [[0, 0, 0], [255, 255, 255], [255, 220, 0], [220, 35, 35], [0, 0, 0], [30, 90, 210], [30, 165, 80]];
        const endByte = Math.min(startByte + byteLength, previewPackedData.length);

        if (previewColorMode === 4) {
            for (let byteIndex = startByte; byteIndex < endByte; byteIndex++) {
                const value = previewPackedData[byteIndex];
                for (let p = 0; p < 4; p++) setPreviewPixel(byteIndex * 4 + p, fourPalette[(value >> (6 - p * 2)) & 0x03]);
            }
        } else if (previewColorMode === 6) {
            for (let byteIndex = startByte; byteIndex < endByte; byteIndex++) {
                const value = previewPackedData[byteIndex];
                setPreviewPixel(byteIndex * 2, sixPalette[(value >> 4) & 0x0f] || sixPalette[1]);
                setPreviewPixel(byteIndex * 2 + 1, sixPalette[value & 0x0f] || sixPalette[1]);
            }
        } else if (previewColorMode === 2) {
            const bytesPerLine = Math.ceil(previewWidth / 8);
            for (let byteIndex = startByte; byteIndex < endByte; byteIndex++) {
                const y = Math.floor(byteIndex / bytesPerLine);
                const x0 = (byteIndex % bytesPerLine) * 8;
                const value = previewPackedData[byteIndex];
                for (let bit = 0; bit < 8 && x0 + bit < previewWidth; bit++) {
                    const isBlack = ((value >> (7 - bit)) & 1) === 1;
                    setPreviewPixel(y * previewWidth + x0 + bit, isBlack ? [0, 0, 0] : [255, 255, 255]);
                }
            }
        } else if (previewColorMode === 3) {
            const bytesPerLine = Math.ceil(previewWidth / 8);
            const planeBytes = bytesPerLine * previewHeight;
            for (let byteIndex = startByte; byteIndex < endByte; byteIndex++) {
                const planeIndex = byteIndex >= planeBytes ? byteIndex - planeBytes : byteIndex;
                if (planeIndex >= planeBytes) continue;
                const y = Math.floor(planeIndex / bytesPerLine);
                const x0 = (planeIndex % bytesPerLine) * 8;
                const blackValue = previewPackedData[planeIndex];
                const redValue = previewPackedData[planeBytes + planeIndex];
                for (let bit = 0; bit < 8 && x0 + bit < previewWidth; bit++) {
                    const mask = 1 << (7 - bit);
                    const color = (redValue & mask) === 0 ? [220, 35, 35] : ((blackValue & mask) === 0 ? [0, 0, 0] : [255, 255, 255]);
                    setPreviewPixel(y * previewWidth + x0 + bit, color);
                }
            }
        }
    }

    function paintDevicePreview(force = false) {
        const now = performance.now();
        if (!force && now - previewLastPaint < 80) return;
        previewLastPaint = now;
        ctx.putImageData(previewImageData, 0, 0);
        const percent = previewExpectedBytes > 0 ? Math.min(100, Math.round(previewReceivedBytes / previewExpectedBytes * 100)) : 0;
        canvasSizeIndicator.textContent = `${previewWidth}×${previewHeight} · ${percent}%`;
    }

    function sendPreviewFlowControl(command, offset) {
        if (previewFlowControlPending || !connectedCommandChar || !connectedDevice?.gatt.connected) return;
        previewFlowControlPending = true;
        writeGattValue(connectedCommandChar, new TextEncoder().encode(`${command} ${offset}`), true)
            .catch(error => appendCommandLog(`预览流控失败: ${error.message}`, 'error'))
            .finally(() => { previewFlowControlPending = false; });
    }

    function handlePreviewNotification(event) {
        if (!isPreviewing || !previewPackedData) return;
        const value = event.target.value;
        if (value.byteLength < 4) return;
        const packetOffset = value.getUint32(0, true);
        const chunk = new Uint8Array(value.buffer, value.byteOffset + 4, value.byteLength - 4);

        if (chunk.length === 0) {
            const command = packetOffset === previewReceivedBytes ? 'PREVIEW_ACK' : 'PREVIEW_RETRY';
            sendPreviewFlowControl(command, previewReceivedBytes);
            return;
        }
        if (packetOffset < previewReceivedBytes) return;
        if (packetOffset > previewReceivedBytes) {
            sendPreviewFlowControl('PREVIEW_RETRY', previewReceivedBytes);
            return;
        }

        const writable = Math.min(chunk.length, previewExpectedBytes - previewReceivedBytes);
        if (writable <= 0) return;
        const start = previewReceivedBytes;
        previewPackedData.set(chunk.subarray(0, writable), start);
        previewReceivedBytes += writable;
        decodePreviewRange(start, writable);
        paintDevicePreview(previewReceivedBytes >= previewExpectedBytes);
        if (previewEndReceived && previewReceivedBytes >= previewExpectedBytes) finishDevicePreview();
    }

    function finishDevicePreview() {
        if (!previewImageData || previewReceivedBytes !== previewExpectedBytes) return;
        clearTimeout(previewEndTimer);
        previewEndTimer = null;
        paintDevicePreview(true);
        originalImageData = new ImageData(new Uint8ClampedArray(previewImageData.data), previewWidth, previewHeight);
        processedImageData = new ImageData(new Uint8ClampedArray(previewImageData.data), previewWidth, previewHeight);
        devicePreviewReady = true;
        isPreviewing = false;
        cacheUploadedPreview(previewFileName, previewFileId, previewImageData, previewColorMode);
        canvasSizeIndicator.textContent = `${previewWidth}×${previewHeight}`;
        updateStatusInfo();
        showToast('设备图片预览完成');
    }

    async function cancelDevicePreview(notifyDevice = true, clearCanvas = false) {
        const wasPreviewing = isPreviewing;
        isPreviewing = false;
        previewEndReceived = false;
        previewFlowControlPending = false;
        clearTimeout(previewEndTimer);
        previewEndTimer = null;
        previewPackedData = null;
        previewImageData = null;
        previewExpectedBytes = 0;
        previewReceivedBytes = 0;
        if (wasPreviewing) canvasSizeIndicator.textContent = `${canvas.width}×${canvas.height}`;
        if (clearCanvas) {
            devicePreviewReady = false;
            originalImage = null;
            originalImageData = null;
            processedImageData = null;
            ctx.fillStyle = '#f7fafd';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            updateStatusInfo();
        }
        if (notifyDevice && wasPreviewing && connectedDevice?.gatt.connected && connectedCommandChar) {
            try {
                await writeGattValue(connectedCommandChar, new TextEncoder().encode('PREVIEW_CANCEL'), true);
                appendCommandLog('>> 取消设备图片回读', 'send');
            } catch (e) {
                appendCommandLog(`取消设备图片回读失败: ${e.message}`, 'error');
            }
        }
    }

    async function requestDevicePreview(filename, fileId) {
        if (!filename) return;
        if (isTransferring || driverSwitchInProgress) { showToast('当前操作完成后再预览设备图片'); return; }
        if (!connectedDevice?.gatt.connected || !connectedCommandChar) { showToast('请先连接蓝牙设备'); return; }
        if (isPreviewing) await cancelDevicePreview(true);
        const cached = devicePreviewCache.get(previewCacheKey(filename, fileId));
        if (cached) {
            appendCommandLog(`预览缓存命中: ${filename} id=${fileId}`, 'recv');
            showCachedDevicePreview(cached);
            return;
        }
        appendCommandLog(`预览缓存未命中，开始设备回读: ${filename} id=${fileId || 'none'}`, 'send');
        await sendCustomCommand(`PREVIEW ${filename} ${fileId || ''}`.trim());
    }

    async function cleanupCommandChar() { if (connectedCommandChar?.properties.notify) { try { await connectedCommandChar.stopNotifications(); } catch (e) {} connectedCommandChar.removeEventListener('characteristicvaluechanged', handleCmdNotification); } connectedCommandChar = null; }
    async function cleanupDataNotifications() { if (connectedCharacteristic?.properties.notify || connectedCharacteristic?.properties.indicate) { try { await connectedCharacteristic.stopNotifications(); } catch (e) {} connectedCharacteristic.removeEventListener('characteristicvaluechanged', handlePreviewNotification); } }
    async function disconnectBluetooth(fromGattEvent = false, showNotice = true) {
        if (driverSwitchResolver) {
            driverSwitchResolver({ ok: false, error: '蓝牙连接已断开' });
            driverSwitchResolver = null;
        }
        if (transferAckResolver) {
            transferAckResolver(null);
            transferAckResolver = null;
        }
        if (!fromGattEvent && connectedDevice && connectedDevice.gatt.connected) {
            connectedDevice.removeEventListener('gattserverdisconnected', handleGattDisconnected);
            connectedDevice.gatt.disconnect();
        }
        await cleanupDataNotifications();
        await cleanupCommandChar();
        connectedDevice = null;
        connectedCharacteristic = null;
        connectedService = null;
        bleOperationChain = Promise.resolve();
        currentDeviceName = '';
        currentModel = '';
        isPreviewing = false;
        devicePreviewReady = false;
        clearTimeout(previewEndTimer);
        previewEndTimer = null;
        previewPackedData = null;
        previewImageData = null;
        resetStorageDisplay();
        setAlbumPlaybackState(false);
        updateStatusInfo();
        if (pendingFormatCommand) {
            markFormatCompleted('格式化完成，设备已重启或断开，请稍后重新连接');
        } else if (showNotice) showToast('蓝牙连接已断开');
        appendCommandLog('蓝牙断开，命令功能不可用', 'error'); }
    function handleGattDisconnected() { disconnectBluetooth(true); }
    function handleCmdNotification(event) { const value = event.target.value; let decoded; try { decoded = new TextDecoder('utf-8').decode(value); } catch (e) { decoded = [...new Uint8Array(value)].map(b => b.toString(16).padStart(2, '0')).join(' '); } const driverSyncPacket = decoded.includes('DRIVER_COUNT') || decoded.includes('DRIVER_INFO'); if (!driverSyncPacket) appendCommandLog(`<< 接收响应: ${decoded}`, 'recv');
        handleFormatCommandResponse(decoded);
        if (decoded.includes('PREVIEW_BEGIN ')) {
            const previewMatch = decoded.match(/PREVIEW_BEGIN\s+(\S+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+id=([0-9A-Fa-f]{8})/);
            if (previewMatch) beginDevicePreview(previewMatch[1], Number(previewMatch[2]), Number(previewMatch[3]), Number(previewMatch[4]), Number(previewMatch[5]), previewMatch[6].toUpperCase());
        } else if (decoded.includes('PREVIEW_END ')) {
            previewEndReceived = true;
            if (previewReceivedBytes >= previewExpectedBytes) finishDevicePreview();
            else {
                clearTimeout(previewEndTimer);
                previewEndTimer = setTimeout(() => {
                    if (isPreviewing && previewReceivedBytes < previewExpectedBytes) {
                        isPreviewing = false;
                        showToast(`设备图片接收超时: ${previewReceivedBytes}/${previewExpectedBytes}`);
                    }
                }, 5000);
            }
        } else if (decoded.includes('ERROR: PREVIEW_')) {
            isPreviewing = false;
            clearTimeout(previewEndTimer);
            previewEndTimer = null;
            if (decoded.includes('ERROR: PREVIEW_SIZE_MISMATCH')) {
                markDeviceImageListStale('当前图片尺寸不适配当前驱动，请刷新列表');
                showToast('当前图片尺寸不适配当前驱动，请刷新列表');
            } else {
                showToast(decoded.trim());
            }
        } else if (decoded.includes('PREVIEW_CANCELLED')) {
            cancelDevicePreview(false);
        }
        if (decoded.includes('DISPLAY_START')) {
            finishTransferDisplayWait(true);
        }
        if (decoded.includes('DISPLAY_DONE') || decoded.includes('DISPLAY_ERROR')) {
            if (decoded.includes('DISPLAY_ERROR')) finishTransferDisplayWait(false);
            finishPostTransferSettle();
        }
        if (decoded.includes('ERROR: 显示失败')) {
            markDeviceImageListStale('显示失败，当前图片可能不适配当前驱动，请刷新列表');
            showToast('显示失败，当前图片可能不适配当前驱动，请刷新列表');
        }
        if (decoded.includes('BUSY: DISPLAYING')) {
            if (isCollectingImageList) {
                listResponseBuffer = '';
                isCollectingImageList = false;
                clearTimeout(listResponseTimeout);
                listResponseTimeout = null;
                showToast('屏幕刷新中，请稍后手动刷新列表');
            }
            if (isTransferring) {
                isTransferring = false;
                if (transferAckResolver) {
                    transferAckResolver({ ok: false, error: 'busy' });
                    transferAckResolver = null;
                }
                markPostTransferSettle(3000);
                showToast('设备还在刷新上一张图片，请稍后再发送');
            }
        }
        if (decoded.includes('OK: saved') && transferAckResolver) {
            const savedMatch = decoded.match(/OK: saved\s+(\S+)\s+id=([0-9A-Fa-f]{8})/);
            transferAckResolver(savedMatch ? { ok: true, filename: savedMatch[1], fileId: savedMatch[2].toUpperCase() } : { ok: true });
            transferAckResolver = null;
        } else if (decoded.includes('ERROR: no space') && transferAckResolver) {
            transferAckResolver({ ok: false, error: 'no-space' });
            transferAckResolver = null;
        }
        if (decoded.includes('OK: DRIVER ')) {
            const match = decoded.match(/OK: DRIVER\s+([^\s]+)\s+(\d+)x(\d+)\s+colorMode=(\d+)/);
            const warming = decoded.includes('warming=1');
            if (match) { applyDeviceInfo(match[1], parseInt(match[2]), parseInt(match[3]), parseInt(match[4])); setTimeout(() => refreshDeviceInfoFromBle(), 250); }
            if (warming) {
                appendCommandLog('设备正在初始化屏幕驱动，请稍候...', 'recv');
                showToast('设备正在初始化屏幕驱动，请稍候...');
                updateStatusInfo();
                return;
            }
            driverSwitchInProgress = false;
            setAlbumPlaybackState(false);
            markDeviceImageListStale('驱动已切换，旧图片列表可能不适配，请刷新列表');
            updateStatusInfo();
            showToast(`驱动切换完成: ${currentModel || 'OK'}`);
            if (driverSwitchResolver) { driverSwitchResolver({ ok: true }); driverSwitchResolver = null; }
            appendCommandLog('驱动已切换；如需查看设备图片，请手动刷新列表', 'recv');
        } else if (decoded.includes('DRIVER_READY ')) {
            driverSwitchInProgress = false;
            setAlbumPlaybackState(false);
            markDeviceImageListStale('驱动已切换，旧图片列表可能不适配，请刷新列表');
            updateStatusInfo();
            showToast(`驱动切换完成: ${currentModel || decoded.replace('DRIVER_READY ', '')}`);
            if (driverSwitchResolver) { driverSwitchResolver({ ok: true }); driverSwitchResolver = null; }
            appendCommandLog('驱动初始化完成；如需查看设备图片，请手动刷新列表', 'recv');
        } else if (decoded.includes('ERROR: DRIVER_INIT_FAILED')) {
            driverSwitchInProgress = false;
            updateStatusInfo();
            if (driverSwitchResolver) { driverSwitchResolver({ ok: false, error: decoded.trim() }); driverSwitchResolver = null; }
        } else if (driverSwitchInProgress && decoded.includes('ERROR:')) {
            driverSwitchInProgress = false;
            updateStatusInfo();
            if (driverSwitchResolver) { driverSwitchResolver({ ok: false, error: decoded.trim() }); driverSwitchResolver = null; }
        }
        if (decoded.includes('DELETED')) setTimeout(() => refreshImageList(), 300);
        if (decoded.includes('AUTO_STARTED')) {
            const match = decoded.match(/AUTO_STARTED\s+interval=(\d+)\s+mode=(\d+)\s+count=(\d+)/);
            if (match) {
                albumIntervalInput.value = match[1];
                playModeRadios.forEach(radio => { radio.checked = radio.value === match[2]; });
            }
            setAlbumPlaybackState(true, match ? `播放中 · ${match[3]} 张` : '播放中');
            showToast(match ? `相册自动播放已启动，共 ${match[3]} 张，间隔 ${match[1]} 秒` : '相册自动播放已启动');
        } else if (decoded.includes('AUTO_STOPPED')) {
            setAlbumPlaybackState(false);
            showToast('相册自动播放已停止');
        } else if (decoded.includes('ERROR: AUTO_')) {
            setAlbumPlaybackState(false);
            showToast(decoded.includes('AUTO_NO_IMAGES') || decoded.includes('AUTO_NO_VALID_IMAGES') ? '设备中没有可用于相册播放的图片' : decoded.trim());
        }
        if (decoded.includes('清屏中') || decoded.includes('清屏完成')) setAlbumPlaybackState(false);
        if (isCollectingImageList) {
            listResponseBuffer += decoded;
            clearTimeout(listResponseTimeout);
            const finishImageList = () => {
                parseAndPopulateImageList(listResponseBuffer, false);
                listResponseBuffer = '';
                isCollectingImageList = false;
            };
            const hasListEnd = listResponseBuffer.includes('LIST_END');
            parseAndPopulateImageList(listResponseBuffer, !hasListEnd);
            if (hasListEnd) finishImageList();
            else listResponseTimeout = setTimeout(finishImageList, LIST_RESPONSE_IDLE_TIMEOUT_MS);
        } }
    async function sendCustomCommand(cmdText, logCommand = true) { const upperCmd = cmdText.trim().toUpperCase(); const allowDuringSettle = upperCmd === 'LIST' || upperCmd === 'LIST ALL'; if (isTransferring) { showToast('图片传输期间不能发送设备命令'); return false; } if (isTransferSettling() && !allowDuringSettle) { showToast('设备正在整理上一张图片，请稍后再发送命令'); return false; } if (!connectedDevice || !connectedDevice.gatt.connected || !connectedCommandChar) { showToast('未连接蓝牙或命令特征不可用');
            appendCommandLog('错误: 蓝牙未连接或命令特征无效', 'error'); return false; } try { const data = new TextEncoder().encode(cmdText);
            if (isPreviewing && !cmdText.startsWith('PREVIEW')) await cancelDevicePreview(true);
            await writeGattValue(connectedCommandChar, data, true);
            if (logCommand) appendCommandLog(`>> 发送命令: ${cmdText}`, 'send'); return true; } catch (err) { appendCommandLog(`发送失败: ${err.message}`, 'error');
            showToast(`命令发送失败: ${err.message}`); return false; } }
    function setAlbumPlaybackState(active, statusText = '') {
        albumModeArea.dataset.playbackState = active ? 'playing' : 'idle';
        albumPlayBtn.classList.toggle('is-playing', active);
        albumModeArea.classList.toggle('is-playing', active);
        albumStatusText.textContent = statusText || (active ? '播放中' : '未启动');
        albumPlayBtn.textContent = active ? '播放中' : '▶ 启动播放';
        albumPlayBtn.disabled = active;
        albumStopBtn.disabled = !active;
        albumIntervalInput.disabled = active;
        playModeRadios.forEach(radio => { radio.disabled = active; });
    }
    function setAlbumPlaybackPending(action) {
        albumModeArea.dataset.playbackState = 'pending';
        albumStatusText.textContent = action === 'stop' ? '正在停止' : '正在启动';
        albumPlayBtn.disabled = true;
        albumStopBtn.disabled = true;
        albumIntervalInput.disabled = true;
        playModeRadios.forEach(radio => { radio.disabled = true; });
    }
    const commandConfirmations = Object.freeze({
        FORMAT: '此操作将清空设备内全部图片并重启，无法撤销。确认继续？',
        RESET: '设备将立即重启并断开蓝牙连接，确认继续？',
        SLEEP: '设备将进入深度睡眠并断开蓝牙连接，确认继续？'
    });
    async function sendCommand() {
        if (driverSwitchInProgress) { showToast('驱动正在切换，完成后再发送命令'); return; }
        const cmd = commandInput.value.trim();
        if (!cmd) { showToast('请输入命令'); return; }
        const upperCmd = cmd.toUpperCase();
        const confirmation = commandConfirmations[upperCmd];
        if (upperCmd === 'FORMAT') appendCommandLog('准备格式化设备存储，请在确认框中确认', 'error');
        if (confirmation && !window.confirm(confirmation)) return;
        if (await sendCustomCommand(cmd)) {
            commandInput.value = '';
            if (upperCmd === 'FORMAT') {
                pendingFormatCommand = true;
                clearFormatFeedbackTimer();
                appendCommandLog('格式化命令已发送，等待设备擦除并重启...', 'send');
                showToast('格式化命令已发送，设备正在清空存储并准备重启');
                formatFeedbackTimer = setTimeout(() => {
                    if (!pendingFormatCommand) return;
                    appendCommandLog('仍在等待设备格式化完成或重启断开...', 'recv');
                    showToast('仍在等待设备格式化完成');
                }, 10000);
            }
        }
    }

    // 事件绑定
    uploadArea.addEventListener('dragover', (e) => { e.preventDefault();
        uploadArea.classList.add('drag-over'); });
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('drag-over'));
    uploadArea.addEventListener('drop', (e) => { e.preventDefault();
        uploadArea.classList.remove('drag-over'); const file = e.dataTransfer.files[0]; if (file && file.type.match('image.*')) handleImageUpload(file);
        else showToast('请上传有效的图片文件！'); });
    uploadArea.addEventListener('click', () => imageUploadInput.click());
    imageUploadInput.addEventListener('change', (e) => { if (e.target.files[0]) handleImageUpload(e.target.files[0]); });
    canvas.addEventListener('mousedown', (e) => { if (!originalImage) return;
        isDragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
        canvas.classList.add('grabbing'); });
    window.addEventListener('mousemove', (e) => { if (!isDragging || !originalImage) return; const adj = adjustDragByRotation(e.clientX - lastX, e.clientY - lastY, currentRotation);
        imageOffsetX += adj.x;
        imageOffsetY += adj.y;
        lastX = e.clientX;
        lastY = e.clientY;
        redrawImage(); });
    window.addEventListener('mouseup', () => { isDragging = false;
        canvas.classList.remove('grabbing'); });
    canvas.addEventListener('wheel', (e) => { if (!originalImage) return;
        e.preventDefault(); const ns = imageScale * (e.deltaY > 0 ? 0.9 : 1.1); if (ns >= MIN_SCALE && ns <= MAX_SCALE) { imageScale = ns;
            redrawImage(); } }, { passive: false });
    canvas.addEventListener('touchstart', (e) => { if (!originalImage) return;
        e.preventDefault(); if (e.touches.length === 1) { isDragging = true;
            lastX = e.touches[0].clientX;
            lastY = e.touches[0].clientY; } else if (e.touches.length === 2) { const dx = e.touches[0].clientX - e.touches[1].clientX; const dy = e.touches[0].clientY - e.touches[1].clientY;
            touchDistance = Math.sqrt(dx * dx + dy * dy); } }, { passive: false });
    canvas.addEventListener('touchmove', (e) => { if (!originalImage) return;
        e.preventDefault(); if (e.touches.length === 1 && isDragging) { const adj = adjustDragByRotation(e.touches[0].clientX - lastX, e.touches[0].clientY - lastY, currentRotation);
            imageOffsetX += adj.x;
            imageOffsetY += adj.y;
            lastX = e.touches[0].clientX;
            lastY = e.touches[0].clientY;
            redrawImage(); } else if (e.touches.length === 2) { const dx = e.touches[0].clientX - e.touches[1].clientX; const dy = e.touches[0].clientY - e.touches[1].clientY; const nd = Math.sqrt(dx * dx + dy * dy); const ns = imageScale * (nd / touchDistance); if (ns >= MIN_SCALE && ns <= MAX_SCALE) { imageScale = ns;
                touchDistance = nd;
                redrawImage(); } } }, { passive: false });
    canvas.addEventListener('touchend', () => { isDragging = false; });
    rotateLeftBtn.addEventListener('click', () => rotateImage(-90));
    rotateRightBtn.addEventListener('click', () => rotateImage(90));
    resetTransformBtn.addEventListener('click', resetImageTransform);
    clearCanvasBtn.addEventListener('click', clearLocalCanvas);
    if (previewSendImageBtn) previewSendImageBtn.addEventListener('click', () => sendBluetoothBtn.click());
    ditherModeSelect.addEventListener('change', () => { updateStatusInfo();
        refreshProcessedImage(); });
    ditherAlgorithmSelect.addEventListener('change', () => { updateStatusInfo();
        refreshProcessedImage(); });
    saturationSlider.addEventListener('input', () => { updateSliderLabels();
        debouncedRefresh(); });
    brightnessSlider.addEventListener('input', () => { updateSliderLabels();
        debouncedRefresh(); });
    contrastSlider.addEventListener('input', () => { updateSliderLabels();
        debouncedRefresh(); });
    diffusionSlider.addEventListener('input', () => { updateSliderLabels();
        debouncedRefresh(); });
    quickResolutionsSelect.addEventListener('change', function() { if (this.value !== 'custom') { const [w, h] = this.value.split('x').map(Number);
            canvasWidthInput.value = w;
            canvasHeightInput.value = h;
            updateCanvas(); } });
    updateCanvasBtn.addEventListener('click', updateCanvas);
    if (driverSelect) driverSelect.addEventListener('change', async () => {
        const model = driverSelect.value;
        const previousModel = currentModel;
        const previousState = {
            model: previousModel,
            width: parseInt(canvasWidthInput.value) || canvas.width,
            height: parseInt(canvasHeightInput.value) || canvas.height,
            colorMode: ditherModeSelect.value
        };
        const restorePreviousState = () => {
            currentModel = previousState.model;
            if (driverSelect && previousState.model && getDriverConfig(previousState.model)) driverSelect.value = previousState.model;
            canvasWidthInput.value = previousState.width;
            canvasHeightInput.value = previousState.height;
            ditherModeSelect.value = previousState.colorMode;
            updateCanvas();
            updateStatusInfo();
        };
        if (isTransferring) {
            restorePreviousState();
            showToast('图片传输期间不能切换驱动');
            return;
        }
        if (!connectedDevice || !connectedDevice.gatt.connected || !connectedCommandChar) {
            applyDriverConfig(model, { setCurrentModel: false });
            renderCalendarPreview(true);
            showToast(`已切换 ${model} 固件画面预览；连接设备后才会应用驱动`);
            return;
        }
        if (!applyDriverConfig(model, { setCurrentModel: false })) return;
        driverSwitchInProgress = true;
        updateStatusInfo();
        showToast(`正在切换驱动: ${model}`);
        let switchTimer;
        const waitForSwitch = new Promise(resolve => {
            const finish = result => {
                clearTimeout(switchTimer);
                if (driverSwitchResolver === finish) driverSwitchResolver = null;
                resolve(result);
            };
            driverSwitchResolver = finish;
            switchTimer = setTimeout(() => finish({ ok: false, error: '设备未在 40 秒内完成驱动切换/初始化' }), 40000);
        });
        const ok = await sendCustomCommand(`DRIVER ${model}`);
        if (!ok && driverSwitchResolver) {
            driverSwitchResolver({ ok: false, error: '驱动切换命令发送失败' });
        }
        const result = await waitForSwitch;
        if (!result.ok) {
            driverSwitchInProgress = false;
            restorePreviousState();
            showToast(`驱动切换失败: ${result.error}`);
        }
    });
    exportCArrayBtn.addEventListener('click', () => { if (!processedImageData) { showToast('请先上传并处理图片！'); return; } const bin = processImageData(processedImageData); let c = `// 图像数据 - ${canvas.width}x${canvas.height} - ${ditherModeSelect.value}\n// 抖动算法: ${ALGO_NAMES[ditherAlgorithmSelect.value]}\nconst unsigned char image_data[${bin.length}] = {\n`; for (let i = 0; i < bin.length; i += 16) { const line = []; for (let j = 0; j < 16 && i + j < bin.length; j++) line.push(`0x${bin[i+j].toString(16).padStart(2,'0')}`);
            c += '  ' + line.join(', ') + ',\n'; }
        c += `};\nconst int image_width = ${canvas.width};\nconst int image_height = ${canvas.height};\nconst int image_color_mode = ${ditherModeSelect.value==='blackWhiteColor'?2:ditherModeSelect.value==='threeColor'?3:ditherModeSelect.value==='fourColor'?4:6};\n`; const blob = new Blob([c], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const a = document.createElement('a');
        a.href = url;
        a.download = 'image_data.c';
        a.click();
        URL.revokeObjectURL(url); });
    exportBinaryBtn.addEventListener('click', () => { if (!processedImageData) { showToast('请先上传并处理图片！'); return; } const bin = processImageData(processedImageData); const fn = `image_${canvas.width}_${canvas.height}_${ditherModeSelect.value}_${ditherAlgorithmSelect.value}.bin`; const blob = new Blob([bin], { type: 'application/octet-stream' }); const url = URL.createObjectURL(blob); const a = document.createElement('a');
        a.href = url;
        a.download = fn;
        a.click();
        URL.revokeObjectURL(url);
        showToast(`二进制文件已导出: ${fn}`); });
    scanBluetoothBtn.addEventListener('click', async () => { if (isTransferring) { showToast('请等待当前传输完成'); return; } let device = null; try { showLoading('正在搜索蓝牙设备...'); if (!navigator.bluetooth) throw new Error('当前浏览器不支持 Web Bluetooth，请使用 Chrome 或 Edge');
            device = await navigator.bluetooth.requestDevice({ filters: [{ namePrefix: 'EPD' }], optionalServices: [SERVICE_UUID] });
            loadingText.textContent = '连接中...'; let server = null; let connectError = null;
            for (let attempt = 0; attempt < 3 && !server; attempt++) { try { const conn = device.gatt.connect(); const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('连接超时')), 15000));
                    server = await Promise.race([conn, timeout]); } catch (e) { connectError = e; if (device.gatt.connected) device.gatt.disconnect(); if (attempt < 2) await sleep(1000); } }
            if (!server) throw connectError || new Error('连接失败');
            device.addEventListener('gattserverdisconnected', handleGattDisconnected); const service = await server.getPrimaryService(SERVICE_UUID); const dataChar = await service.getCharacteristic(DATA_CHAR_UUID); if (!dataChar.properties.write && !dataChar.properties.writeWithoutResponse) throw new Error('特征不支持写入');
            if (dataChar.properties.notify || dataChar.properties.indicate) {
                await dataChar.startNotifications();
                dataChar.addEventListener('characteristicvaluechanged', handlePreviewNotification);
            } else throw new Error('设备固件不支持图片预览通知');
            currentModel = new TextDecoder().decode(await(await service.getCharacteristic(MODEL_CHAR_UUID)).readValue()); const w = parseInt(new TextDecoder().decode(await(await service.getCharacteristic(WIDTH_CHAR_UUID)).readValue())); const h = parseInt(new TextDecoder().decode(await(await service.getCharacteristic(HEIGHT_CHAR_UUID)).readValue())); const cm = parseInt(new TextDecoder().decode(await(await service.getCharacteristic(COLOR_CHAR_UUID)).readValue()));
            applyDeviceInfo(currentModel, w, h, cm); let dn = device.name; try { const ga = await server.getPrimaryService(0x1800); const nc = await ga.getCharacteristic(0x2A00);
                dn = new TextDecoder().decode(await nc.readValue()); } catch (e) {} currentDeviceName = dn || '未知设备'; let cmdChar = null; try { cmdChar = await service.getCharacteristic(COMMAND_CHAR_UUID); if (cmdChar.properties.notify) { await cmdChar.startNotifications();
                    cmdChar.addEventListener('characteristicvaluechanged', handleCmdNotification);
                    appendCommandLog('命令特征已启用，支持收发命令', 'recv'); } else { appendCommandLog('设备命令特征不支持通知，仅可发送命令', 'error'); } } catch (e) { appendCommandLog('未找到命令特征(0000ffe2)，命令功能不可用', 'error'); }
            connectedDevice = device;
            connectedCharacteristic = dataChar;
            connectedService = service;
            connectedCommandChar = cmdChar || null;
            updateStatusInfo();
            showToast('设备连接成功');
            sendCommandBtn.disabled = !connectedCommandChar;
            // 首次连接不自动发 LIST；设备列表只在用户手动点击“刷新列表”时读取，避免后台列表查询拖住 BLE。
            appendCommandLog('已连接；如需读取设备图片，请手动刷新列表', 'recv'); } catch (e) { console.error(e); if (device?.gatt.connected) device.gatt.disconnect();
            showToast(`连接失败: ${e.message}`); } finally { hideLoading(); } });
    disconnectBluetoothBtn.addEventListener('click', () => disconnectBluetooth(false, true));
    sendBluetoothBtn.addEventListener('click', async () => { if (driverSwitchInProgress) { showToast('驱动正在切换，完成后再发送图片'); return; } if (isTransferring) { showToast('传输正在进行中'); return; } if (!connectedDevice || !connectedCharacteristic) { showToast('请先连接蓝牙设备！'); return; } if (!processedImageData) { showToast('请先处理图片！'); return; } clearPostTransferRefresh(); transferDisplayStarted = false; transferDisplayResolver = null; isTransferring = true; let transferCompletedEnough = false; updateStatusInfo(); showTransferDialog(); try { await waitForPostTransferSettle(); transferStartTime = Date.now(); updateTransferStage(TRANSFER_PREP_PROGRESS, '正在准备图片数据...'); await nextPaint(); const chunkSize = 240; const stream = createPackedImageStreamer(processedImageData, chunkSize); const totalBytes = stream.totalBytes; if (!validateTransferConfig(totalBytes)) return; const uploadPreviewSnapshot = new ImageData(new Uint8ClampedArray(processedImageData.data), processedImageData.width, processedImageData.height); const uploadColorMode = ditherModeSelect.value; let uploadFingerprint = 2166136261;
            let sentBytes = 0; let ackPromise = null; updateTransferStage(TRANSFER_PACK_PROGRESS, '正在处理并发送图片...'); updateTransferProgress(TRANSFER_DATA_PROGRESS_START, 0, totalBytes, 0);
        if (connectedCommandChar?.properties.notify) ackPromise = new Promise(resolve => { transferAckResolver = resolve; });
        transferStartTime = Date.now(); const supportsFastWrites = connectedCharacteristic.properties.writeWithoutResponse; const supportsCheckpoints = connectedCharacteristic.properties.write; let packetIndex = 0; while (isTransferring) { const chunk = stream.nextChunk(); if (!chunk) break; uploadFingerprint = updatePreviewFingerprintValue(uploadFingerprint, chunk); const useCheckpoint = supportsCheckpoints && !supportsFastWrites;
            await writeGattValue(connectedCharacteristic, chunk, useCheckpoint); sentBytes += chunk.length; const percent = mapTransferDataPercent(sentBytes, totalBytes); const elapsed = (Date.now() - transferStartTime) / 1000; const speed = elapsed > 0 ? (sentBytes / 1024 / elapsed).toFixed(2) : 0;
            updateTransferProgress(percent, sentBytes, totalBytes, speed);
            packetIndex++; if (supportsFastWrites && !useCheckpoint) await sleep(2); } const uploadFileId = formatPreviewFingerprint(uploadFingerprint); if (isTransferring && sentBytes >= totalBytes) { transferCompletedEnough = true; updateTransferStage(100, '传输完成'); hideTransferDialog(); showToast('传输完成，屏幕即将刷新'); markPostTransferSettle(); } if (isTransferring) { const ack = ackPromise ? await Promise.race([ackPromise, sleep(TRANSFER_ACK_GRACE_MS).then(() => null)]) : null; if (ack?.ok) { const cached = cacheUploadedPreview(ack.filename, ack.fileId || uploadFileId, uploadPreviewSnapshot, uploadColorMode); showToast(cached ? '数据已保存，预览已缓存' : '数据已保存'); } else if (ack?.error === 'no-space') showToast('设备存储空间不足，发送失败'); if (transferCompletedEnough) { const displayStarted = await waitForTransferDisplayStart(); if (displayStarted) { showToast('屏幕正在刷新'); await sleep(150); } else showToast('未收到屏幕开始刷新确认，请确认固件已重新烧录'); } } } catch (e) { console.error(e);
            showToast(transferCompletedEnough ? '数据已发完，设备刷新时蓝牙断开；稍后可重连确认' : `发送失败：${e.message}`); } finally { isTransferring = false;
            transferAckResolver = null;
            stopTransferDisplayWaitAnimation();
            if (transferCompletedEnough && connectedDevice?.gatt.connected) markPostTransferSettle();
            updateStatusInfo();
            hideTransferDialog();
            if (transferCompletedEnough && connectedDevice?.gatt.connected && connectedCommandChar && transferDisplayStarted) appendCommandLog('屏幕刷新已开始；如需更新设备图片列表，请手动刷新', 'recv'); } });
    cancelTransferBtn.addEventListener('click', async () => { if (isTransferring) { isTransferring = false;
            if (transferAckResolver) { transferAckResolver(null); transferAckResolver = null; }
            hideTransferDialog();
            await disconnectBluetooth(false, false);
            showToast('已取消传输并断开设备，请重新连接'); } });
    sendCommandBtn.addEventListener('click', sendCommand);
    commandInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendCommand(); });
    $$('.cmd-btn').forEach(btn => { btn.addEventListener('click', function() { const command = this.getAttribute('data-cmd');
            commandInput.value = command;
            sendCommand(); }); });
    // ---- 图片列表功能 ----
    function parseAndPopulateImageList(response, partial = false) {
        imageListSelect.innerHTML = '';
        imageListSelect.dataset.stale = 'false';
        imagePickerPanel?.classList.remove('is-stale');
        imagePickerButton.title = '';
        const storageMatch = response.match(/STORAGE total=(\d+) used=(\d+) free=(\d+) imageBytes=(\d+) remainingImages=(\d+)/);
        if (storageMatch) {
            updateStorageDisplay(
                Number(storageMatch[1]), Number(storageMatch[2]), Number(storageMatch[3]),
                Number(storageMatch[4]), Number(storageMatch[5])
            );
        }
        const lines = response.split('\n');
        let count = 0;
        for (const line of lines) {
            const match = line.match(/^\s*\/?(IMG_\d+\.bin)\s+\((\d+)\s+bytes\)\s+id=([0-9A-Fa-f]{8})\s*$/i);
            if (match) {
                const opt = document.createElement('option');
                opt.value = '/' + match[1];
                opt.textContent = match[1];
                opt.dataset.fileId = match[3].toUpperCase();
                imageListSelect.appendChild(opt);
                count++;
            }
        }
        if (count === 0) {
            const opt = document.createElement('option');
            opt.value = '';
            opt.textContent = partial ? '正在读取图片列表...' : '无图片文件';
            imageListSelect.appendChild(opt);
        } else {
            const hdr = document.createElement('option');
            hdr.value = '';
            hdr.textContent = partial ? `-- 已找到 ${count} 张，继续读取... --` : `-- 共 ${count} 张图片 --`;
            hdr.disabled = true;
            imageListSelect.insertBefore(hdr, imageListSelect.firstChild);
            imageListSelect.selectedIndex = 1;
        }
        renderImagePickerOptions();
    }
    async function refreshImageList() {
        if (!connectedDevice || !connectedCommandChar) return;
        listResponseBuffer = '';
        isCollectingImageList = true;
        setDeviceImageListPlaceholder('正在刷新图片列表...', false);
        try {
            if (!await sendCustomCommand('LIST')) isCollectingImageList = false;
        } catch (e) {
            isCollectingImageList = false;
            appendCommandLog('LIST 命令发送失败', 'error');
        }
    }

    // 模式切换逻辑
    function switchMode(mode) {
        currentDisplayMode = mode;
        const imageModeActive = mode === 'image';
        // 更新按钮状态
        $$('.mode-btn').forEach(btn => {
            if (btn.dataset.mode === mode) btn.classList.add('active');
            else btn.classList.remove('active');
        });
        [rotateLeftBtn, rotateRightBtn, resetTransformBtn, clearCanvasBtn].forEach(btn => { btn.disabled = !imageModeActive; });

        // 切换界面显示
        if (imageModeActive) {
            setCalendarStylePanelOpen(false);
            imageModeInterface.classList.remove('hidden');
            calendarModeInterface.classList.add('hidden');
            stopCalendarPreviewTimer();
        } else {
            imageModeInterface.classList.add('hidden');
            calendarModeInterface.classList.remove('hidden');
            startCalendarPreviewTimer();
        }
    }

    function getCalendarPreviewSsid() {
        const match = String(currentDeviceName || '').toUpperCase().match(/([0-9A-F]{4})$/);
        return `ESP32-${match ? match[1] : 'XXXX'}`;
    }

    const EPD_PREVIEW_COLORS = Object.freeze({
        white: '#ffffff',
        black: '#000000',
        red: '#d71920',
        yellow: '#f5d328'
    });
    function getPreviewColors(profile) {
        if (profile.numericColorMode === 4) return EPD_PREVIEW_COLORS;
        if (profile.numericColorMode === 3) return { ...EPD_PREVIEW_COLORS, yellow: EPD_PREVIEW_COLORS.white };
        return {
            ...EPD_PREVIEW_COLORS,
            red: EPD_PREVIEW_COLORS.black,
            yellow: EPD_PREVIEW_COLORS.white
        };
    }
    if (!window.EPDFirmwareFontRenderer || !window.EPD_FIRMWARE_FONTS) {
        throw new Error('Firmware font renderer is missing');
    }
    const firmwareFontRenderer = window.EPDFirmwareFontRenderer.create(window.EPD_FIRMWARE_FONTS);
    const FIRMWARE_FONT = Object.freeze({
        wqy9: 'u8g2_font_wqy9_t_lunar',
        wqy12: 'u8g2_font_wqy12_t_lunar',
        helv14: 'u8g2_font_helvB14_tn',
        helv18: 'u8g2_font_helvB18_tn'
    });
    const ASCII_5X7_DIGITS = [
        [0x3e, 0x51, 0x49, 0x45, 0x3e], [0x00, 0x42, 0x7f, 0x40, 0x00],
        [0x42, 0x61, 0x51, 0x49, 0x46], [0x21, 0x41, 0x45, 0x4b, 0x31],
        [0x18, 0x14, 0x12, 0x7f, 0x10], [0x27, 0x45, 0x45, 0x45, 0x39],
        [0x3c, 0x4a, 0x49, 0x49, 0x30], [0x01, 0x71, 0x09, 0x05, 0x03],
        [0x36, 0x49, 0x49, 0x49, 0x36], [0x06, 0x49, 0x49, 0x29, 0x1e]
    ];
    const ASCII_5X7_LETTERS = [
        [0x7e, 0x11, 0x11, 0x11, 0x7e], [0x7f, 0x49, 0x49, 0x49, 0x36],
        [0x3e, 0x41, 0x41, 0x41, 0x22], [0x7f, 0x41, 0x41, 0x22, 0x1c],
        [0x7f, 0x49, 0x49, 0x49, 0x41], [0x7f, 0x09, 0x09, 0x09, 0x01],
        [0x3e, 0x41, 0x49, 0x49, 0x7a], [0x7f, 0x08, 0x08, 0x08, 0x7f],
        [0x00, 0x41, 0x7f, 0x41, 0x00], [0x20, 0x40, 0x41, 0x3f, 0x01],
        [0x7f, 0x08, 0x14, 0x22, 0x41], [0x7f, 0x40, 0x40, 0x40, 0x40],
        [0x7f, 0x02, 0x0c, 0x02, 0x7f], [0x7f, 0x02, 0x0c, 0x10, 0x7f],
        [0x3e, 0x41, 0x41, 0x41, 0x3e], [0x7f, 0x09, 0x09, 0x09, 0x06],
        [0x3e, 0x41, 0x51, 0x21, 0x5e], [0x7f, 0x09, 0x19, 0x29, 0x46],
        [0x46, 0x49, 0x49, 0x49, 0x31], [0x01, 0x01, 0x7f, 0x01, 0x01],
        [0x3f, 0x40, 0x40, 0x40, 0x3f], [0x1f, 0x20, 0x40, 0x20, 0x1f],
        [0x7f, 0x20, 0x18, 0x20, 0x7f], [0x63, 0x14, 0x08, 0x14, 0x63],
        [0x07, 0x08, 0x70, 0x08, 0x07], [0x61, 0x51, 0x49, 0x45, 0x43]
    ];
    const firmwareText = (context, font, text, x, y, color) =>
        firmwareFontRenderer.drawText(context, font, String(text), x, y, color);
    const firmwareTextWidth = (font, text) => firmwareFontRenderer.measureText(font, String(text));

    function getAscii5x7(character) {
        if (character >= '0' && character <= '9') return ASCII_5X7_DIGITS[character.charCodeAt(0) - 48];
        if (character >= 'A' && character <= 'Z') return ASCII_5X7_LETTERS[character.charCodeAt(0) - 65];
        if (character === '_') return [0x40, 0x40, 0x40, 0x40, 0x40];
        return [0, 0, 0, 0, 0];
    }

    function firmwareAscii5x7Width(text, scale) { return text.length ? text.length * 6 * scale - scale : 0; }

    function drawFirmwareAscii5x7(context, x, y, text, scale, color) {
        context.save();
        context.fillStyle = color;
        for (const character of text) {
            const glyph = getAscii5x7(character);
            for (let column = 0; column < 5; column++) {
                for (let row = 0; row < 7; row++) {
                    if (glyph[column] & (1 << row)) {
                        context.fillRect(x + column * scale, y + row * scale, scale, scale);
                    }
                }
            }
            x += 6 * scale;
        }
        context.restore();
    }
    const LUNAR_DAY_NAMES = [
        '', '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
        '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
        '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
    ];
    const ZODIAC_NAMES = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
    const SEVEN_SEGMENT_MASKS = [0x3f, 0x06, 0x5b, 0x4f, 0x66, 0x6d, 0x7d, 0x07, 0x7f, 0x6f];

    function getLunarInfo(date) {
        try {
            const parts = new Intl.DateTimeFormat('zh-CN-u-ca-chinese', {
                year: 'numeric', month: 'long', day: 'numeric'
            }).formatToParts(date);
            const valueOf = type => parts.find(part => part.type === type)?.value || '';
            const lunarDayNumber = parseInt(valueOf('day'), 10) || 1;
            const relatedYear = parseInt(valueOf('relatedYear'), 10) || date.getFullYear();
            const month = valueOf('month');
            const day = LUNAR_DAY_NAMES[lunarDayNumber] || String(lunarDayNumber);
            const yearName = valueOf('yearName');
            const zodiac = ZODIAC_NAMES[((relatedYear - 4) % 12 + 12) % 12];
            return {
                month,
                day,
                dayNumber: lunarDayNumber,
                dateText: `${month}${day}`,
                yearText: `${yearName}${zodiac}年`
            };
        } catch (e) {
            return { month: '', day: '', dayNumber: 0, dateText: '', yearText: '' };
        }
    }

    function formatLunarDate(date) { return getLunarInfo(date).dateText; }

    function getIsoWeek(date) {
        const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const day = target.getUTCDay() || 7;
        target.setUTCDate(target.getUTCDate() + 4 - day);
        const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
        return Math.ceil((((target - yearStart) / 86400000) + 1) / 7);
    }

    function getNextSolarTerm(date) {
        const terms = [
            [0, 5, '小寒'], [0, 20, '大寒'], [1, 4, '立春'], [1, 19, '雨水'], [2, 5, '惊蛰'], [2, 20, '春分'],
            [3, 4, '清明'], [3, 20, '谷雨'], [4, 5, '立夏'], [4, 21, '小满'], [5, 5, '芒种'], [5, 21, '夏至'],
            [6, 7, '小暑'], [6, 23, '大暑'], [7, 7, '立秋'], [7, 23, '处暑'], [8, 7, '白露'], [8, 23, '秋分'],
            [9, 8, '寒露'], [9, 23, '霜降'], [10, 7, '立冬'], [10, 22, '小雪'], [11, 7, '大雪'], [11, 21, '冬至']
        ];
        const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        for (const [month, day, name] of terms) {
            const target = new Date(date.getFullYear(), month, day);
            if (target >= today) return { name, days: Math.round((target - today) / 86400000) };
        }
        const [month, day, name] = terms[0];
        const target = new Date(date.getFullYear() + 1, month, day);
        return { name, days: Math.round((target - today) / 86400000) };
    }

    function roundRectPath(c, x, y, width, height, radius) {
        const r = Math.min(radius, width / 2, height / 2);
        c.beginPath();
        c.moveTo(x + r, y);
        c.lineTo(x + width - r, y);
        c.quadraticCurveTo(x + width, y, x + width, y + r);
        c.lineTo(x + width, y + height - r);
        c.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
        c.lineTo(x + r, y + height);
        c.quadraticCurveTo(x, y + height, x, y + height - r);
        c.lineTo(x, y + r);
        c.quadraticCurveTo(x, y, x + r, y);
        c.closePath();
    }

    function sevenNumberWidth(scale, digits) { return digits * (11 * scale + 2) - 2 * scale; }

    function drawSevenNumber(c, value, x, y, scale, digits, foreground, background) {
        let number = Math.abs(value);
        const digitCount = Math.max(1, Math.min(10, Math.abs(digits)));
        const segment2 = 5 * scale;
        const segment3 = 2 * scale;
        const segment4 = 7 * scale;
        const x1 = scale + 1;
        const x2 = segment3 + segment2 + 1;
        const y1 = y + x1;
        const y3 = y + segment3 + segment4 + 1;
        const segments = [
            [x1, y, true], [x2, y1, false], [x2, y3 + x1, false], [x1, 2 * y3 - y, true],
            [0, y3 + x1, false], [0, y1, false], [x1, y3, true]
        ];
        const pitch = segment2 + 3 * segment3 + 2;
        let digitX = x + digitCount * pitch;

        c.save();
        for (let count = digitCount; count > 0; count--) {
            const digit = number > 9 ? number % 10 : number;
            digitX -= pitch;
            number = Math.floor(number / 10);
            const mask = SEVEN_SEGMENT_MASKS[digit] || 0;
            for (let segmentIndex = 0; segmentIndex < 7; segmentIndex++) {
                const [segmentX, segmentY, horizontal] = segments[segmentIndex];
                c.fillStyle = mask & (1 << segmentIndex) ? foreground : background;
                let width;
                let target;
                let limit;
                let a;
                let b;
                if (horizontal) {
                    width = segment2;
                    target = segmentY + segment3;
                    limit = segmentY + scale;
                    a = digitX + segmentX + scale;
                    b = segmentY;
                    for (; b < limit; b++, a--, width += 2) c.fillRect(a, b, width, 1);
                    for (; b < target; b++, a++, width -= 2) c.fillRect(a, b, width, 1);
                } else {
                    width = segment4;
                    target = digitX + segmentX + segment3;
                    limit = digitX + segmentX + scale;
                    b = digitX + segmentX;
                    a = segmentY + scale;
                    for (; b < limit; b++, a--, width += 2) c.fillRect(b, a, 1, width);
                    for (; b < target; b++, a++, width -= 2) c.fillRect(b, a, 1, width);
                }
            }
        }
        c.restore();
    }

    function drawSevenDash(c, x, y, scale, color) {
        c.fillStyle = color;
        c.fillRect(x + scale, y + 10 * scale + 1, 7 * scale, 2 * scale);
    }

    function drawDottedLine(c, x1, y1, x2, y2) {
        c.save();
        c.strokeStyle = EPD_PREVIEW_COLORS.black;
        c.lineWidth = 2;
        c.setLineDash([4, 4]);
        c.beginPath();
        c.moveTo(x1, y1);
        c.lineTo(x2, y2);
        c.stroke();
        c.restore();
    }

    function getCalendarCellLabel(date) {
        const solarFestivals = {
            '1-1': '元旦', '2-14': '情人节', '3-8': '妇女节', '5-1': '劳动节', '6-1': '儿童节',
            '10-1': '国庆节', '12-25': '圣诞节'
        };
        const festival = solarFestivals[`${date.getMonth() + 1}-${date.getDate()}`];
        if (festival) return { text: festival, festival: true };
        const lunar = getLunarInfo(date);
        return { text: lunar.dayNumber === 1 ? lunar.month : lunar.day, festival: false };
    }

    function drawSE0398CalendarSimulation(date) {
        const c = calendarPreviewCtx;
        const width = calendarPreviewCanvas.width;
        const height = calendarPreviewCanvas.height;
        const weekStart = Number(weekStartSelect.value) || 0;
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstWeekday = new Date(year, month, 1).getDay();
        const firstOffset = (firstWeekday - weekStart + 7) % 7;
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const rowCount = Math.ceil((firstOffset + daysInMonth) / 7);
        const inset = 10;
        const weekY = 66;
        const weekHeight = 44;
        const gridTop = weekY + 52;
        const cellWidth = Math.floor((width - 2 * inset) / 7);
        const lastCellWidth = width - 2 * inset - cellWidth * 6;
        const cellHeight = Math.floor((height - gridTop - inset) / rowCount);
        const lunar = getLunarInfo(date);
        const colors = EPD_PREVIEW_COLORS;

        c.fillStyle = colors.white;
        c.fillRect(0, 0, width, height);
        c.textBaseline = 'alphabetic';

        let dateX = 48;
        drawSevenNumber(c, year, dateX, 9, 2, 4, colors.red, colors.white);
        dateX += sevenNumberWidth(2, 4) + 6;
        drawSevenDash(c, dateX, 9, 2, colors.red);
        dateX += 18 + 6;
        const monthDigits = month + 1 > 9 ? 2 : 1;
        drawSevenNumber(c, month + 1, dateX, 9, 2, monthDigits, colors.red, colors.white);
        dateX += sevenNumberWidth(2, monthDigits) + 6;
        drawSevenDash(c, dateX, 9, 2, colors.red);
        dateX += 18 + 6;
        drawSevenNumber(c, date.getDate(), dateX, 9, 2, date.getDate() > 9 ? 2 : 1, colors.red, colors.white);

        const weekWidth = sevenNumberWidth(1, 2) + 4 + firmwareTextWidth(FIRMWARE_FONT.wqy12, '周');
        const lunarDateWidth = firmwareTextWidth(FIRMWARE_FONT.wqy12, lunar.dateText);
        const infoWidth = weekWidth + 16 + lunarDateWidth + 20 + firmwareTextWidth(FIRMWARE_FONT.wqy12, lunar.yearText);
        const infoX = Math.max(48, Math.floor((width - infoWidth) / 2));
        drawSevenNumber(c, getIsoWeek(date), infoX, 35, 1, 2, colors.red, colors.white);
        firmwareText(c, FIRMWARE_FONT.wqy12, '周', infoX + sevenNumberWidth(1, 2) + 4, 58, colors.black);
        firmwareText(c, FIRMWARE_FONT.wqy12, lunar.dateText, infoX + weekWidth + 16, 58, colors.black);
        firmwareText(c, FIRMWARE_FONT.wqy12, lunar.yearText, infoX + weekWidth + 16 + lunarDateWidth + 20, 58, colors.black);

        const previewSsid = getCalendarPreviewSsid();
        drawFirmwareAscii5x7(c, width - 42 - firmwareAscii5x7Width(previewSsid, 2), 25, previewSsid, 2, colors.black);

        const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
        for (let index = 0; index < 7; index++) {
            const day = (weekStart + index) % 7;
            const weekend = day === 0 || day === 6;
            const cellX = inset + index * cellWidth;
            const currentWidth = index === 6 ? lastCellWidth : cellWidth;
            c.fillStyle = weekend ? colors.red : colors.yellow;
            if (index === 0 || index === 6) {
                roundRectPath(c, cellX, weekY, currentWidth, weekHeight, 7);
                c.fill();
                c.fillRect(index === 0 ? cellX + 7 : cellX, weekY, currentWidth - 7, weekHeight);
            } else c.fillRect(cellX, weekY, currentWidth, weekHeight);
            const weekdayText = weekdays[day];
            const fontMetrics = firmwareFontRenderer.metrics(FIRMWARE_FONT.wqy12);
            const fontHeight = fontMetrics.ascent - fontMetrics.descent;
            const baseline = weekY + Math.floor((weekHeight - fontHeight) / 2) + fontMetrics.ascent + 1;
            firmwareText(c, FIRMWARE_FONT.wqy12, weekdayText,
                cellX + Math.floor((currentWidth - firmwareTextWidth(FIRMWARE_FONT.wqy12, weekdayText)) / 2),
                baseline, weekend ? colors.white : colors.red);
        }

        for (let row = 1; row < rowCount; row++) {
            drawDottedLine(c, inset, gridTop + row * cellHeight, inset + 7 * cellWidth - 1, gridTop + row * cellHeight);
        }
        for (let col = 1; col < 7; col++) {
            drawDottedLine(c, inset + col * cellWidth, gridTop, inset + col * cellWidth, gridTop + rowCount * cellHeight - 1);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const position = firstOffset + day - 1;
            const col = position % 7;
            const row = Math.floor(position / 7);
            const cellX = inset + col * cellWidth;
            const rowY = gridTop + row * cellHeight;
            const actualWeekday = new Date(year, month, day).getDay();
            const weekend = actualWeekday === 0 || actualWeekday === 6;
            const isToday = day === date.getDate();
            const dayDigits = day > 9 ? 2 : 1;
            const digitWidth = sevenNumberWidth(2, dayDigits);
            const digitX = cellX + (cellWidth - digitWidth) / 2;
            const digitY = rowY + (cellHeight > 80 ? 12 : 8);
            const label = getCalendarCellLabel(new Date(year, month, day));
            const background = isToday ? colors.yellow : colors.white;

            if (isToday) {
                roundRectPath(c, cellX + 8, rowY + 5, cellWidth - 16, cellHeight - 10, 6);
                c.fillStyle = colors.yellow;
                c.fill();
                c.strokeStyle = colors.red;
                c.lineWidth = 2;
                c.stroke();
            }
            drawSevenNumber(c, day, digitX, digitY, 2, dayDigits, isToday || weekend ? colors.red : colors.black, background);
            firmwareText(c, FIRMWARE_FONT.wqy12, label.text,
                cellX + Math.floor((cellWidth - firmwareTextWidth(FIRMWARE_FONT.wqy12, label.text)) / 2),
                rowY + cellHeight - 10, isToday || label.festival ? colors.red : colors.black);
        }
    }

    function drawSE0398ClockSimulation(date) {
        const c = calendarPreviewCtx;
        const width = calendarPreviewCanvas.width;
        const height = calendarPreviewCanvas.height;
        const colors = EPD_PREVIEW_COLORS;
        const padding = 120;
        const lunar = getLunarInfo(date);
        const weekday = ['日', '一', '二', '三', '四', '五', '六'][date.getDay()];
        const ssidSuffix = getCalendarPreviewSsid().slice(-4);

        c.fillStyle = colors.white;
        c.fillRect(0, 0, width, height);

        let dateX = padding;
        const drawDatePart = (text, color, font) => {
            firmwareText(c, font, text, dateX, 42, color);
            dateX += firmwareTextWidth(font, text);
        };
        drawDatePart(String(date.getFullYear()), colors.red, FIRMWARE_FONT.helv18);
        drawDatePart('年', colors.black, FIRMWARE_FONT.wqy12);
        drawDatePart(String(date.getMonth() + 1).padStart(2, '0'), colors.red, FIRMWARE_FONT.helv18);
        drawDatePart('月', colors.black, FIRMWARE_FONT.wqy12);
        drawDatePart(String(date.getDate()).padStart(2, '0'), colors.red, FIRMWARE_FONT.helv18);
        drawDatePart('日 ', colors.black, FIRMWARE_FONT.wqy12);

        firmwareText(c, FIRMWARE_FONT.wqy9, `星期${weekday}`, padding, 64, colors.black);
        firmwareText(c, FIRMWARE_FONT.wqy9, lunar.dateText, 160, 64, colors.black);

        const statusText = `[${ssidSuffix}]`;
        const statusX = width - padding - firmwareTextWidth(FIRMWARE_FONT.wqy9, statusText) - 2;
        const statusPrefix = '[';
        firmwareText(c, FIRMWARE_FONT.wqy9, statusPrefix, statusX, 64, colors.black);
        const suffixX = statusX + firmwareTextWidth(FIRMWARE_FONT.wqy9, statusPrefix);
        firmwareText(c, FIRMWARE_FONT.wqy9, ssidSuffix, suffixX, 64, colors.red);
        firmwareText(c, FIRMWARE_FONT.wqy9, ']', suffixX + firmwareTextWidth(FIRMWARE_FONT.wqy9, ssidSuffix), 64, colors.black);

        c.strokeStyle = colors.black;
        c.lineWidth = 1;
        c.beginPath();
        c.moveTo(padding - 10, 76);
        c.lineTo(width - padding + 10, 76);
        c.stroke();

        const scale = Math.floor(height / 40);
        const digits = 2;
        const timeWidth = 2 * sevenNumberWidth(scale, digits) + 4 * scale;
        let timeX = (width - timeWidth) / 2;
        const timeHeight = 20 * scale + 4;
        const timeY = 76 + (height - 76) / 2 - timeHeight / 2;
        drawSevenNumber(c, date.getHours(), timeX, timeY, scale, digits, colors.black, colors.white);
        timeX += sevenNumberWidth(scale, digits) + 2 * scale;
        c.fillStyle = colors.black;
        c.fillRect(timeX, timeY + 4.5 * scale + 1, 2 * scale, 2 * scale);
        c.fillRect(timeX, timeY + 13.5 * scale + 3, 2 * scale, 2 * scale);
        timeX += 4 * scale;
        drawSevenNumber(c, date.getMinutes(), timeX, timeY, scale, digits, colors.black, colors.white);

        const footerTop = height - 76;
        c.beginPath();
        c.moveTo(padding - 10, footerTop);
        c.lineTo(width - padding + 10, footerTop);
        c.stroke();

        const stemBranch = lunar.yearText.slice(0, 2);
        const zodiac = lunar.yearText.slice(2, 3);
        firmwareText(c, FIRMWARE_FONT.wqy12, stemBranch, padding, footerTop + 36, colors.black);
        const stemBranchWidth = firmwareTextWidth(FIRMWARE_FONT.wqy12, stemBranch);
        firmwareText(c, FIRMWARE_FONT.wqy12, zodiac, padding + stemBranchWidth, footerTop + 36, colors.red);
        firmwareText(c, FIRMWARE_FONT.wqy12, '年', padding + stemBranchWidth + firmwareTextWidth(FIRMWARE_FONT.wqy12, zodiac), footerTop + 36, colors.black);
        firmwareText(c, FIRMWARE_FONT.wqy12, ` ${getIsoWeek(date)}周`, padding, footerTop + 58, colors.black);

        const solarTerm = getNextSolarTerm(date);
        if (solarTerm.days === 0) {
            firmwareText(c, FIRMWARE_FONT.wqy12, solarTerm.name,
                width - padding - firmwareTextWidth(FIRMWARE_FONT.wqy12, solarTerm.name), footerTop + 36, colors.red);
        } else {
            const termLine = `离${solarTerm.name}`;
            const termX = width - padding - firmwareTextWidth(FIRMWARE_FONT.wqy12, termLine);
            firmwareText(c, FIRMWARE_FONT.wqy12, '离', termX, footerTop + 36, colors.black);
            firmwareText(c, FIRMWARE_FONT.wqy12, solarTerm.name,
                termX + firmwareTextWidth(FIRMWARE_FONT.wqy12, '离'), footerTop + 36, colors.red);
            const dayLine = `还有${solarTerm.days}天`;
            firmwareText(c, FIRMWARE_FONT.wqy12, dayLine,
                width - padding - firmwareTextWidth(FIRMWARE_FONT.wqy12, dayLine), footerTop + 58, colors.black);
        }
    }

    function getCalendarPreviewProfile(preferConnectedDevice = false) {
        const selectedModel = (preferConnectedDevice && currentModel) ? currentModel : (driverSelect?.value || currentModel || 'SE0398NZ07-new-A1');
        const config = getDriverConfig(selectedModel) || { width: 768, height: 552, numericColorMode: 4, guiModel: 19 };
        return {
            name: selectedModel,
            width: Number(config.width) || 768,
            height: Number(config.height) || 552,
            numericColorMode: Number(config.numericColorMode) || (config.colorMode === 'fourColor' ? 4 : 1),
            guiModel: Number(config.guiModel) || 0
        };
    }

    function isSE0398Preview(profile) { return [16, 17, 19, 20].includes(profile.guiModel); }

    const CALENDAR_STYLE_FONT_SIZE_DEFAULTS = Object.freeze({
        title: 28,
        month: 24,
        mainDay: 170,
        weekday: 28,
        lunar: 22,
        cellDay: 24,
        cellLunar: 13,
        small: 18
    });
    const CALENDAR_STYLE_LAYOUTS = new Set(['grid', 'split', 'dashboard', 'classic', 'duo']);
    const CALENDAR_COMMAND_COMPAT_VALUE = 25;

    const calendarStyleFontSizeInputs = Object.freeze({
        title: calendarFontTitle,
        month: calendarFontMonth,
        mainDay: calendarFontMainDay,
        weekday: calendarFontWeekday,
        lunar: calendarFontLunar,
        cellDay: calendarFontCellDay,
        cellLunar: calendarFontCellLunar,
        small: calendarFontSmall
    });

    function readCalendarStyleFontSize(role) {
        const fallback = CALENDAR_STYLE_FONT_SIZE_DEFAULTS[role] || 18;
        const input = calendarStyleFontSizeInputs[role];
        const value = Number(input?.value);
        if (!Number.isFinite(value) || value <= 0) return fallback;
        const min = Number(input?.min) || 8;
        const max = Number(input?.max) || 260;
        return Math.max(min, Math.min(max, Math.round(value)));
    }

    function getCalendarCommandCompatValue() {
        return CALENDAR_COMMAND_COMPAT_VALUE;
    }

    function updateCalendarFontSizeOutput(input) {
        if (!input?.id) return;
        const output = document.querySelector(`[data-size-value-for="${input.id}"]`);
        if (output) output.textContent = `${input.value}px`;
        if (input.type === 'range') {
            const min = Number(input.min) || 0;
            const max = Number(input.max) || 100;
            const value = Number(input.value);
            const progress = max > min ? ((value - min) / (max - min)) * 100 : 0;
            input.style.setProperty('--range-progress', `${Math.max(0, Math.min(100, progress))}%`);
        }
    }

    function resetCalendarFontSizes() {
        Object.entries(calendarStyleFontSizeInputs).forEach(([role, input]) => {
            if (!input) return;
            input.value = CALENDAR_STYLE_FONT_SIZE_DEFAULTS[role];
            updateCalendarFontSizeOutput(input);
        });
        renderCalendarPreview(true);
    }

    function getCalendarStyleFontSizes() {
        return Object.keys(CALENDAR_STYLE_FONT_SIZE_DEFAULTS).reduce((sizes, role) => {
            sizes[role] = readCalendarStyleFontSize(role);
            return sizes;
        }, {});
    }

    function getCalendarStyleSettings() {
        const selectedLayout = calendarStyleLayout?.value || 'grid';
        return {
            layout: CALENDAR_STYLE_LAYOUTS.has(selectedLayout) ? selectedLayout : 'grid',
            fontFamily: customCalendarFontFamily || calendarStyleFont?.value || 'Microsoft YaHei, SimHei, sans-serif',
            textRender: calendarStyleTextRender?.value || 'smooth',
            title: (calendarStyleTitle?.value || '').trim(),
            accent: calendarStyleAccent?.value || 'red',
            showLunar: calendarStyleLunar ? calendarStyleLunar.checked : true,
            fontSizes: getCalendarStyleFontSizes()
        };
    }

    function calendarStyleKey() {
        const settings = getCalendarStyleSettings();
        return [settings.layout, settings.fontFamily, settings.textRender, settings.title, settings.accent, settings.showLunar ? 1 : 0, Object.values(settings.fontSizes).join(',')].join('~');
    }

    function calendarStyleSize(settings, role, fallback, scale = 1) {
        const base = settings?.fontSizes?.[role] || fallback || CALENDAR_STYLE_FONT_SIZE_DEFAULTS[role] || 18;
        return Math.max(1, Math.round(base * scale));
    }

    function calendarStyleFontCss(size, weight = 600) {
        const family = getCalendarStyleSettings().fontFamily;
        return `${weight} ${size}px ${family}`;
    }

    function drawCalendarStyleText(c, text, x, y, options = {}) {
        const renderMode = getCalendarStyleSettings().textRender;
        const value = String(text);
        if (!value) return;
        const size = options.size || 24;
        const weight = options.weight || 600;
        c.save();
        c.fillStyle = options.color || EPD_PREVIEW_COLORS.black;
        c.strokeStyle = options.strokeColor || c.fillStyle;
        c.lineWidth = options.lineWidth || Math.max(1, Math.round(size / 22));
        c.font = calendarStyleFontCss(size, weight);
        c.textAlign = options.align || 'left';
        c.textBaseline = options.baseline || 'alphabetic';

        if (renderMode === 'crisp') {
            c.imageSmoothingEnabled = false;
            if ('fontKerning' in c) c.fontKerning = 'none';
            c.fillText(value, Math.round(x), Math.round(y));
        } else if (renderMode === 'outline') {
            c.strokeText(value, Math.round(x), Math.round(y));
            c.fillText(value, Math.round(x), Math.round(y));
        } else if (renderMode === 'pixelated' || renderMode === 'bold-pixel') {
            const metrics = c.measureText(value);
            const pad = Math.max(4, Math.ceil(size * 0.18));
            const sourceWidth = Math.max(1, Math.ceil(metrics.width + pad * 2));
            const sourceHeight = Math.max(1, Math.ceil(size * 1.45 + pad * 2));
            const source = document.createElement('canvas');
            source.width = sourceWidth;
            source.height = sourceHeight;
            const sourceCtx = source.getContext('2d');
            sourceCtx.fillStyle = c.fillStyle;
            sourceCtx.strokeStyle = c.strokeStyle;
            sourceCtx.lineWidth = renderMode === 'bold-pixel' ? Math.max(1, Math.round(size / 18)) : 1;
            sourceCtx.font = c.font;
            sourceCtx.textAlign = 'left';
            sourceCtx.textBaseline = 'alphabetic';
            if ('fontKerning' in sourceCtx) sourceCtx.fontKerning = 'none';
            const baseline = pad + size;
            if (renderMode === 'bold-pixel') sourceCtx.strokeText(value, pad, baseline);
            sourceCtx.fillText(value, pad, baseline);

            const pixelScale = renderMode === 'bold-pixel' ? 0.42 : 0.5;
            const low = document.createElement('canvas');
            low.width = Math.max(1, Math.round(sourceWidth * pixelScale));
            low.height = Math.max(1, Math.round(sourceHeight * pixelScale));
            const lowCtx = low.getContext('2d');
            lowCtx.imageSmoothingEnabled = true;
            lowCtx.drawImage(source, 0, 0, low.width, low.height);

            let destX = Math.round(x - pad);
            if (c.textAlign === 'center') destX = Math.round(x - sourceWidth / 2);
            else if (c.textAlign === 'right') destX = Math.round(x - sourceWidth + pad);

            let destY = Math.round(y - baseline);
            if (c.textBaseline === 'middle') destY = Math.round(y - sourceHeight / 2);
            else if (c.textBaseline === 'top') destY = Math.round(y);

            c.imageSmoothingEnabled = false;
            c.drawImage(low, destX, destY, sourceWidth, sourceHeight);
        } else {
            c.fillText(value, x, y);
        }
        c.restore();
    }

    function drawCalendarStyleStackedDay(c, day, label, x, y, width, height, options = {}) {
        const numberSize = options.numberSize || 24;
        const labelSize = options.labelSize || 13;
        const centered = Boolean(options.centered);
        const textX = centered ? x + width / 2 : x + Math.max(8, Math.min(14, Math.floor(width * 0.18)));
        const align = centered ? 'center' : 'left';
        const numberBaseline = y + Math.min(
            height - Math.max(6, labelSize + 8),
            Math.max(numberSize + 2, Math.floor(height * 0.42))
        );
        drawCalendarStyleText(c, day, textX, numberBaseline, {
            size: numberSize,
            weight: options.numberWeight || 900,
            color: options.numberColor || EPD_PREVIEW_COLORS.black,
            align
        });
        if (!label?.text) return;
        const gap = Math.max(0, Math.round(labelSize * 0.08));
        const labelBaseline = Math.min(y + height - 5, numberBaseline + labelSize + gap);
        drawCalendarStyleText(c, label.text, textX, labelBaseline, {
            size: labelSize,
            weight: options.labelWeight || 700,
            color: options.labelColor || EPD_PREVIEW_COLORS.black,
            align
        });
    }

    function measureCalendarStyleText(c, text, size, weight = 600) {
        c.save();
        c.font = calendarStyleFontCss(size, weight);
        const width = c.measureText(String(text)).width;
        c.restore();
        return width;
    }
    function getCalendarStyleWeekdays(weekStart) {
        const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
        return Array.from({ length: 7 }, (_, index) => {
            const day = (weekStart + index) % 7;
            return { day, text: weekdays[day], weekend: day === 0 || day === 6 };
        });
    }

    function getCalendarStyleAccentColor(profile, colors, accent) {
        if (accent === 'yellow') return profile.numericColorMode === 4 ? colors.yellow : colors.black;
        if (accent === 'black') return colors.black;
        return colors.red;
    }

    function getCalendarMonthModel(date) {
        const weekStart = Number(weekStartSelect.value) || 0;
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstWeekday = new Date(year, month, 1).getDay();
        const firstOffset = (firstWeekday - weekStart + 7) % 7;
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        return {
            weekStart,
            year,
            month,
            today: date.getDate(),
            firstOffset,
            daysInMonth,
            rowCount: Math.ceil((firstOffset + daysInMonth) / 7),
            weekdays: getCalendarStyleWeekdays(weekStart)
        };
    }

    function drawCalendarStyleMonthGrid(c, date, profile, settings, bounds, options = {}) {
        const colors = getPreviewColors(profile);
        const accent = getCalendarStyleAccentColor(profile, colors, settings.accent);
        const softAccent = profile.numericColorMode === 4 ? colors.yellow : colors.white;
        const model = getCalendarMonthModel(date);
        const weekHeight = options.weekHeight ?? Math.max(26, Math.floor(bounds.height * 0.12));
        const gridTop = bounds.y + (options.showWeekHeader === false ? 0 : weekHeight + 6);
        const gridHeight = bounds.height - (gridTop - bounds.y);
        const cellWidth = Math.floor(bounds.width / 7);
        const lastCellWidth = bounds.width - cellWidth * 6;
        const cellHeight = Math.max(18, Math.floor(gridHeight / model.rowCount));
        const numberSize = options.numberSize ?? calendarStyleSize(settings, 'cellDay', Math.max(18, Math.min(36, Math.floor(cellHeight * 0.36))));
        const labelSize = options.labelSize ?? calendarStyleSize(settings, 'cellLunar', Math.max(11, Math.min(18, Math.floor(cellHeight * 0.17))));

        if (options.showWeekHeader !== false) {
            model.weekdays.forEach((weekday, index) => {
                const x = bounds.x + index * cellWidth;
                const w = index === 6 ? lastCellWidth : cellWidth;
                c.fillStyle = weekday.weekend ? accent : softAccent;
                if (options.squareWeekHeader) c.fillRect(x, bounds.y, w, weekHeight);
                else {
                    roundRectPath(c, x + 2, bounds.y, w - 4, weekHeight, options.radius ?? 8);
                    c.fill();
                }
                drawCalendarStyleText(c, weekday.text, x + w / 2, bounds.y + Math.floor(weekHeight * 0.68), {
                    size: calendarStyleSize(settings, 'weekday', Math.max(15, Math.floor(weekHeight * 0.48)), 0.72),
                    weight: 800,
                    color: weekday.weekend ? colors.white : accent,
                    align: 'center'
                });
            });
        }

        if (options.lines !== false) {
            c.strokeStyle = colors.black;
            c.lineWidth = options.lineWidth ?? 1;
            for (let row = 0; row <= model.rowCount; row++) {
                const y = gridTop + row * cellHeight;
                c.beginPath();
                c.moveTo(bounds.x, y);
                c.lineTo(bounds.x + bounds.width, y);
                c.stroke();
            }
            for (let col = 0; col <= 7; col++) {
                const x = col === 7 ? bounds.x + bounds.width : bounds.x + col * cellWidth;
                c.beginPath();
                c.moveTo(x, gridTop);
                c.lineTo(x, gridTop + model.rowCount * cellHeight);
                c.stroke();
            }
        }

        for (let day = 1; day <= model.daysInMonth; day++) {
            const position = model.firstOffset + day - 1;
            const col = position % 7;
            const row = Math.floor(position / 7);
            const x = bounds.x + col * cellWidth;
            const y = gridTop + row * cellHeight;
            const w = col === 6 ? lastCellWidth : cellWidth;
            const actualWeekday = new Date(model.year, model.month, day).getDay();
            const weekend = actualWeekday === 0 || actualWeekday === 6;
            const isToday = day === model.today;
            if (isToday) {
                c.fillStyle = softAccent;
                roundRectPath(c, x + 5, y + 5, Math.max(8, w - 10), Math.max(8, cellHeight - 10), options.radius ?? 10);
                c.fill();
                c.strokeStyle = accent;
                c.lineWidth = options.todayLineWidth ?? 2;
                c.stroke();
            }
            const centered = options.centerNumbers;
            const label = settings.showLunar && options.showLunar !== false ? getCalendarCellLabel(new Date(model.year, model.month, day)) : null;
            drawCalendarStyleStackedDay(c, day, label, x, y, w, cellHeight, {
                numberSize,
                labelSize,
                numberWeight: isToday ? 900 : 800,
                numberColor: isToday || weekend ? accent : colors.black,
                labelColor: label?.festival ? accent : colors.black,
                centered
            });
        }
    }

    function drawCalendarVerticalText(c, text, x, y, options = {}) {
        const size = options.size || 26;
        [...String(text)].forEach((char, index) => {
            drawCalendarStyleText(c, char, x, y + index * (size + 4), {
                size,
                weight: options.weight || 800,
                color: options.color || EPD_PREVIEW_COLORS.black,
                align: 'center'
            });
        });
    }

    function drawCalendarStyleMetaLine(c, text, x, y, width, colors, accent, size = 18) {
        c.strokeStyle = accent;
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(x, y + 8);
        c.lineTo(x + width, y + 8);
        c.stroke();
        drawCalendarStyleText(c, text, x, y, {
            size,
            weight: 700,
            color: colors.black
        });
    }

    function drawCalendarStyleRule(c, x, y, width, color, lineWidth = 2) {
        c.strokeStyle = color;
        c.lineWidth = lineWidth;
        c.beginPath();
        c.moveTo(x, y);
        c.lineTo(x + width, y);
        c.stroke();
    }

    function safeCalendarStyleGridBounds(profile, bounds) {
        const edge = Math.max(8, Math.floor(profile.width * 0.02));
        const availableWidth = Math.max(24, profile.width - edge * 2);
        const availableHeight = Math.max(24, profile.height - edge * 2);
        const minHeight = Math.min(Math.max(128, Math.floor(profile.height * 0.38)), availableHeight);
        const minWidth = Math.min(Math.max(180, Math.floor(profile.width * 0.46)), availableWidth);
        const x = Math.max(edge, Math.min(bounds.x, profile.width - edge - minWidth));
        const width = Math.max(minWidth, Math.min(bounds.width, profile.width - x - edge));
        const y = Math.max(edge, Math.min(bounds.y, profile.height - edge - minHeight));
        const height = Math.max(minHeight, Math.min(bounds.height, profile.height - y - edge));
        return { x, y, width, height };
    }

    function calendarStyleTitleText(settings, fallback = '') {
        return (settings.title || '').trim() || fallback;
    }

    function drawCalendarStyleFramedMonthGrid(c, date, profile, settings, bounds, options = {}) {
        const colors = getPreviewColors(profile);
        const accent = getCalendarStyleAccentColor(profile, colors, settings.accent);
        const padded = {
            x: bounds.x + (options.padding ?? 12),
            y: bounds.y + (options.padding ?? 12),
            width: bounds.width - (options.padding ?? 12) * 2,
            height: bounds.height - (options.padding ?? 12) * 2
        };
        c.fillStyle = options.fill || colors.white;
        roundRectPath(c, bounds.x, bounds.y, bounds.width, bounds.height, options.radius ?? 18);
        c.fill();
        c.strokeStyle = options.stroke || accent;
        c.lineWidth = options.strokeWidth ?? 2;
        c.stroke();
        drawCalendarStyleMonthGrid(c, date, profile, settings, padded, {
            centerNumbers: true,
            lineWidth: options.lineWidth ?? 1,
            radius: options.cellRadius ?? 9,
            todayLineWidth: options.todayLineWidth ?? 3,
            showLunar: options.showLunar,
            weekHeight: options.weekHeight,
            squareWeekHeader: options.squareWeekHeader
        });
    }

    function drawCalendarStylePosterLayout(c, date, profile, settings, ctx) {
        const { width, height, colors, accent, softAccent, monthText, dateText, weekdayText, titleSize, monthSize, dateSize, mainDaySize, weekdaySize, lunarSize, smallSize, lunar, solarTerm } = ctx;
        const pad = Math.max(30, Math.floor(width * 0.055));
        const railW = Math.max(72, Math.floor(width * 0.12));
        c.fillStyle = colors.white;
        c.fillRect(0, 0, width, height);
        c.fillStyle = accent;
        c.fillRect(0, 0, railW, height);
        c.fillStyle = softAccent;
        c.fillRect(railW, 0, Math.max(10, Math.floor(width * 0.016)), height);
        c.strokeStyle = colors.black;
        c.lineWidth = 2;
        c.strokeRect(railW + pad, pad, width - railW - pad * 2, height - pad * 2);
        drawCalendarVerticalText(c, monthText.replace('.', '/'), Math.floor(railW / 2), pad, {
            size: Math.max(18, Math.round(monthSize * 0.9)),
            weight: 900,
            color: colors.white
        });
        drawCalendarStyleText(c, calendarStyleTitleText(settings), railW + pad, pad + 22, {
            size: titleSize,
            weight: 850,
            color: colors.black
        });
        drawCalendarStyleText(c, dateText, width - pad, pad + 22, {
            size: dateSize,
            weight: 850,
            color: accent,
            align: 'right'
        });
        drawCalendarStyleRule(c, railW + pad + 18, pad + 56, width - railW - pad * 2 - 36, colors.black, 2);
        drawCalendarStyleText(c, 'CALENDAR POSTER', width - pad - 20, height - pad - 20, {
            size: Math.max(12, Math.round(smallSize * 0.78)),
            weight: 850,
            color: colors.black,
            align: 'right'
        });
        drawCalendarStyleText(c, String(date.getDate()), Math.floor(width * 0.56), Math.floor(height * 0.58), {
            size: Math.round(mainDaySize * 0.98),
            weight: 950,
            color: accent,
            align: 'center'
        });
        drawCalendarStyleText(c, weekdayText, Math.floor(width * 0.56), Math.floor(height * 0.7), {
            size: weekdaySize,
            weight: 850,
            color: colors.black,
            align: 'center'
        });
        if (settings.showLunar) {
            const termText = solarTerm.days === 0 ? solarTerm.name : `距${solarTerm.name}${solarTerm.days}天`;
            drawCalendarStyleText(c, `${lunar.dateText || ''}  ${termText}`.trim(), Math.floor(width * 0.56), Math.floor(height * 0.79), {
                size: lunarSize,
                weight: 750,
                color: accent,
                align: 'center'
            });
        }
    }

    function drawCalendarStyleGalleryGrid(c, date, profile, settings, ctx) {
        const { width, height, colors, accent, softAccent, monthText, titleSize, mainDaySize } = ctx;
        const pad = Math.max(22, Math.floor(width * 0.04));
        const headerH = Math.max(104, Math.floor(height * 0.2));
        c.fillStyle = colors.white;
        c.fillRect(0, 0, width, height);
        c.fillStyle = softAccent;
        roundRectPath(c, pad, pad, width - pad * 2, headerH, 22);
        c.fill();
        c.fillStyle = accent;
        roundRectPath(c, pad + 14, pad + 14, Math.max(98, Math.floor(width * 0.18)), headerH - 28, 16);
        c.fill();
        drawCalendarStyleText(c, String(date.getDate()), pad + Math.max(46, Math.floor(width * 0.085)), pad + Math.floor(headerH * 0.68), {
            size: Math.round(mainDaySize * 0.38),
            weight: 950,
            color: colors.white,
            align: 'center'
        });
        drawCalendarStyleText(c, calendarStyleTitleText(settings, monthText), pad + Math.floor(width * 0.21), pad + Math.floor(headerH * 0.58), {
            size: titleSize,
            weight: 850,
            color: colors.black
        });
        drawCalendarStyleFramedMonthGrid(c, date, profile, settings, safeCalendarStyleGridBounds(profile, {
            x: pad,
            y: pad + headerH + 18,
            width: width - pad * 2,
            height: height - pad * 2 - headerH - 18
        }), {
            fill: colors.white,
            stroke: colors.black,
            radius: 18,
            padding: 12,
            cellRadius: 10,
            todayLineWidth: 3
        });
    }

    function drawCalendarStyleMinimalLayout(c, date, profile, settings, ctx) {
        const { width, height, colors, accent, monthText, dateText, weekdayText, titleSize, monthSize, dateSize, mainDaySize, weekdaySize, lunarSize, lunar } = ctx;
        const pad = Math.max(34, Math.floor(width * 0.065));
        c.fillStyle = colors.white;
        c.fillRect(0, 0, width, height);
        c.fillStyle = accent;
        c.fillRect(pad, height - pad - 10, width - pad * 2, 10);
        drawCalendarStyleText(c, monthText, pad, pad + 14, {
            size: monthSize,
            weight: 800,
            color: accent
        });
        drawCalendarStyleText(c, calendarStyleTitleText(settings), width - pad, pad + 14, {
            size: titleSize,
            weight: 700,
            color: colors.black,
            align: 'right'
        });
        drawCalendarStyleRule(c, pad, pad + 40, width - pad * 2, colors.black, 2);
        drawCalendarStyleText(c, String(date.getDate()).padStart(2, '0'), pad, Math.floor(height * 0.64), {
            size: Math.round(mainDaySize * 0.96),
            weight: 900,
            color: colors.black
        });
        const metaX = Math.floor(width * 0.62);
        drawCalendarStyleMetaLine(c, dateText, metaX, Math.floor(height * 0.37), width - pad - metaX, colors, accent, dateSize);
        drawCalendarStyleMetaLine(c, weekdayText, metaX, Math.floor(height * 0.5), width - pad - metaX, colors, accent, weekdaySize);
        if (settings.showLunar) {
            drawCalendarStyleMetaLine(c, lunar.dateText, metaX, Math.floor(height * 0.63), width - pad - metaX, colors, accent, lunarSize);
        }
    }

    function drawCalendarStyleWeekStripLayout(c, date, profile, settings, ctx) {
        const { width, height, colors, accent, softAccent, monthText, titleSize, monthSize, mainDaySize, weekdaySize, lunarSize, lunar } = ctx;
        const pad = Math.max(22, Math.floor(width * 0.04));
        const weekStartDate = new Date(date);
        weekStartDate.setDate(date.getDate() - ((date.getDay() - (Number(weekStartSelect.value) || 0) + 7) % 7));
        c.fillStyle = colors.white;
        c.fillRect(0, 0, width, height);
        drawCalendarStyleText(c, calendarStyleTitleText(settings), pad, 44, {
            size: titleSize,
            weight: 850,
            color: colors.black
        });
        drawCalendarStyleText(c, monthText, width - pad, 44, {
            size: monthSize,
            weight: 850,
            color: accent,
            align: 'right'
        });
        const stripY = 72;
        const stripH = Math.max(104, Math.floor(height * 0.24));
        const dayW = Math.floor((width - pad * 2) / 7);
        for (let i = 0; i < 7; i++) {
            const d = new Date(weekStartDate);
            d.setDate(weekStartDate.getDate() + i);
            const isToday = d.toDateString() === date.toDateString();
            const weekend = d.getDay() === 0 || d.getDay() === 6;
            const x = pad + i * dayW;
            c.fillStyle = isToday ? accent : (weekend ? softAccent : colors.white);
            roundRectPath(c, x + 4, stripY, dayW - 8, stripH, 14);
            c.fill();
            c.strokeStyle = isToday ? accent : colors.black;
            c.lineWidth = isToday ? 3 : 1;
            c.stroke();
            drawCalendarStyleText(c, getCalendarStyleWeekdays(0)[d.getDay()].text, x + dayW / 2, stripY + 32, {
                size: Math.round(weekdaySize * 0.72),
                weight: 850,
                color: isToday ? colors.white : accent,
                align: 'center'
            });
            drawCalendarStyleText(c, d.getDate(), x + dayW / 2, stripY + Math.floor(stripH * 0.68), {
                size: Math.round(mainDaySize * 0.35),
                weight: 950,
                color: isToday ? colors.white : colors.black,
                align: 'center'
            });
        }
        if (settings.showLunar) {
            drawCalendarStyleText(c, lunar.dateText, pad, stripY + stripH + 32, {
                size: lunarSize,
                weight: 750,
                color: accent
            });
        }
        drawCalendarStyleFramedMonthGrid(c, date, profile, settings, safeCalendarStyleGridBounds(profile, {
            x: pad,
            y: stripY + stripH + 52,
            width: width - pad * 2,
            height: height - stripY - stripH - 76
        }), {
            showLunar: false,
            fill: colors.white,
            stroke: accent,
            radius: 16,
            padding: 10,
            weekHeight: 28,
            cellRadius: 8
        });
    }

    function drawCalendarStyleVerticalLayout(c, date, profile, settings, ctx) {
        const { width, height, colors, accent, softAccent, monthText, dateText, weekdayText, titleSize, monthSize, mainDaySize, weekdaySize, lunarSize, lunar } = ctx;
        const pad = Math.max(24, Math.floor(width * 0.04));
        c.fillStyle = softAccent;
        c.fillRect(0, 0, width, height);
        c.fillStyle = colors.white;
        roundRectPath(c, pad, pad, width - pad * 2, height - pad * 2, 20);
        c.fill();
        c.strokeStyle = accent;
        c.lineWidth = 3;
        c.stroke();
        c.fillStyle = accent;
        roundRectPath(c, pad + 22, pad + 22, 78, 78, 14);
        c.fill();
        c.strokeStyle = colors.black;
        c.lineWidth = 2;
        c.strokeRect(pad + 34, height - pad - 92, 58, 58);
        drawCalendarStyleText(c, monthText, pad + 61, pad + 72, {
            size: Math.max(14, Math.round(monthSize * 0.75)),
            weight: 900,
            color: colors.white,
            align: 'center'
        });
        drawCalendarVerticalText(c, calendarStyleTitleText(settings), width - pad - 42, pad + 28, {
            size: Math.max(18, Math.round(titleSize * 0.85)),
            weight: 900,
            color: accent
        });
        drawCalendarStyleText(c, String(date.getDate()), Math.floor(width * 0.34), Math.floor(height * 0.62), {
            size: Math.round(mainDaySize * 0.96),
            weight: 950,
            color: colors.black,
            align: 'center'
        });
        drawCalendarVerticalText(c, dateText, Math.floor(width * 0.6), Math.floor(height * 0.23), {
            size: dateSize,
            weight: 900,
            color: accent
        });
        drawCalendarVerticalText(c, weekdayText, Math.floor(width * 0.72), Math.floor(height * 0.25), {
            size: weekdaySize,
            weight: 850,
            color: colors.black
        });
        if (settings.showLunar) {
            drawCalendarVerticalText(c, lunar.dateText, Math.floor(width * 0.82), Math.floor(height * 0.27), {
                size: lunarSize,
                weight: 800,
                color: colors.black
            });
        }
    }

    function drawCalendarStyleSolarCardLayout(c, date, profile, settings, ctx) {
        const { width, height, colors, accent, softAccent, dateText, weekdayText, titleSize, dateSize, mainDaySize, weekdaySize, lunarSize, lunar, solarTerm } = ctx;
        const pad = Math.max(28, Math.floor(width * 0.05));
        c.fillStyle = accent;
        c.fillRect(0, 0, width, height);
        c.fillStyle = colors.white;
        roundRectPath(c, pad, pad, width - pad * 2, height - pad * 2, 22);
        c.fill();
        c.strokeStyle = colors.black;
        c.lineWidth = 2;
        c.stroke();
        c.fillStyle = softAccent;
        roundRectPath(c, pad + 18, pad + 18, width - pad * 2 - 36, Math.floor(height * 0.28), 18);
        c.fill();
        const termTitle = solarTerm.days === 0 ? solarTerm.name : `距 ${solarTerm.name}`;
        const termSub = solarTerm.days === 0 ? '今日节气' : `还有 ${solarTerm.days} 天`;
        drawCalendarStyleText(c, termTitle, width / 2, Math.floor(height * 0.22), {
            size: Math.round(lunarSize * 2),
            weight: 950,
            color: accent,
            align: 'center'
        });
        drawCalendarStyleText(c, termSub, width / 2, Math.floor(height * 0.32), {
            size: dateSize,
            weight: 850,
            color: colors.black,
            align: 'center'
        });
        c.strokeStyle = accent;
        c.lineWidth = 3;
        c.beginPath();
        c.arc(width / 2, Math.floor(height * 0.58), Math.max(78, Math.floor(width * 0.13)), 0, Math.PI * 2);
        c.stroke();
        drawCalendarStyleText(c, String(date.getDate()), width / 2, Math.floor(height * 0.64), {
            size: Math.round(mainDaySize * 0.82),
            weight: 950,
            color: colors.black,
            align: 'center'
        });
        drawCalendarStyleText(c, `${dateText} · ${weekdayText}`, width / 2, Math.floor(height * 0.77), {
            size: weekdaySize,
            weight: 850,
            color: accent,
            align: 'center'
        });
        if (settings.showLunar) {
            drawCalendarStyleText(c, lunar.dateText, width / 2, Math.floor(height * 0.86), {
                size: lunarSize,
                weight: 750,
                color: colors.black,
                align: 'center'
            });
        }
        drawCalendarStyleText(c, calendarStyleTitleText(settings), width / 2, height - pad - 18, {
            size: titleSize,
            weight: 750,
            color: colors.black,
            align: 'center'
        });
    }

    function drawCalendarStyleClassicLayout(c, date, profile, settings, ctx) {
        const { width, height, colors, accent, softAccent, year, month, titleSize, monthSize, smallSize, lunar } = ctx;
        const pad = Math.max(18, Math.floor(width * 0.032));
        const binderH = 72;
        c.fillStyle = colors.white;
        c.fillRect(0, 0, width, height);
        c.fillStyle = accent;
        c.fillRect(0, 0, width, binderH);
        c.fillStyle = colors.black;
        for (let i = 0; i < 6; i++) {
            const x = pad + 38 + i * Math.floor((width - pad * 2 - 76) / 5);
            c.beginPath();
            c.arc(x, 18, 6, 0, Math.PI * 2);
            c.fill();
        }
        drawCalendarStyleText(c, calendarStyleTitleText(settings), pad, 46, {
            size: titleSize,
            weight: 850,
            color: colors.white
        });
        drawCalendarStyleText(c, `${year} 年 ${month + 1} 月`, width - pad, 46, {
            size: monthSize,
            weight: 850,
            color: colors.white,
            align: 'right'
        });
        c.fillStyle = softAccent;
        c.fillRect(0, binderH, width, 12);
        drawCalendarStyleFramedMonthGrid(c, date, profile, settings, safeCalendarStyleGridBounds(profile, {
            x: pad,
            y: binderH + 24,
            width: width - pad * 2,
            height: height - binderH - 54
        }), {
            squareWeekHeader: true,
            lineWidth: 2,
            radius: 10,
            padding: 10,
            cellRadius: 4,
            stroke: colors.black
        });
        if (settings.showLunar) {
            drawCalendarStyleText(c, lunar.yearText, width / 2, height - 16, {
                size: smallSize,
                weight: 700,
                color: colors.black,
                align: 'center'
            });
        }
    }

    function drawCalendarStyleBonusLayout(c, date, profile, settings, ctx, variant) {
        const { width, height, colors, accent, softAccent, year, month, monthText, dateText, weekdayText, titleSize, monthSize, dateSize, mainDaySize, weekdaySize, lunarSize, smallSize, lunar, solarTerm } = ctx;
        const pad = Math.max(22, Math.floor(width * 0.04));
        const title = calendarStyleTitleText(settings);
        c.fillStyle = colors.white;
        c.fillRect(0, 0, width, height);

        if (variant === 'cover') {
            c.fillStyle = accent;
            c.fillRect(0, 0, width, Math.max(26, Math.floor(height * 0.07)));
            c.fillStyle = softAccent;
            roundRectPath(c, pad, pad + 46, width - pad * 2, height - pad * 2 - 46, 22);
            c.fill();
            drawCalendarStyleText(c, title || `${year}`, pad + 24, pad + 92, { size: titleSize, weight: 900, color: colors.black });
            drawCalendarStyleText(c, monthText, width - pad - 24, pad + 92, { size: monthSize, weight: 850, color: accent, align: 'right' });
            drawCalendarStyleText(c, String(date.getDate()), width / 2, Math.floor(height * 0.56), {
                size: Math.round(mainDaySize * 0.92), weight: 950, color: accent, align: 'center'
            });
            drawCalendarStyleRule(c, pad + 36, Math.floor(height * 0.68), width - pad * 2 - 72, colors.black, 2);
            drawCalendarStyleText(c, `${dateText} · ${weekdayText}`, width / 2, Math.floor(height * 0.75), { size: dateSize, weight: 850, color: colors.black, align: 'center' });
            if (settings.showLunar) drawCalendarStyleText(c, lunar.dateText, width / 2, Math.floor(height * 0.83), { size: lunarSize, weight: 750, color: accent, align: 'center' });
            return;
        }

        if (variant === 'magazine') {
            const leftW = Math.floor(width * 0.42);
            c.fillStyle = colors.black;
            c.fillRect(0, 0, leftW, height);
            c.fillStyle = accent;
            c.fillRect(leftW - 10, 0, 10, height);
            drawCalendarStyleText(c, title || 'MONTH', pad, pad + 28, { size: titleSize, weight: 850, color: colors.white });
            drawCalendarStyleText(c, String(date.getDate()).padStart(2, '0'), leftW / 2, Math.floor(height * 0.52), {
                size: Math.round(mainDaySize * 0.78), weight: 950, color: colors.white, align: 'center'
            });
            drawCalendarStyleText(c, `${month + 1}/${year}`, leftW / 2, Math.floor(height * 0.68), { size: monthSize, weight: 850, color: accent, align: 'center' });
            drawCalendarStyleFramedMonthGrid(c, date, profile, settings, safeCalendarStyleGridBounds(profile, {
                x: leftW + pad,
                y: pad,
                width: width - leftW - pad * 2,
                height: height - pad * 2
            }), { stroke: colors.black, radius: 18, padding: 12, cellRadius: 8 });
            return;
        }

        if (variant === 'orbital') {
            const cx = Math.floor(width * 0.5);
            const cy = Math.floor(height * 0.46);
            const r = Math.min(width, height) * 0.28;
            c.strokeStyle = accent;
            c.lineWidth = 5;
            c.beginPath();
            c.arc(cx, cy, r, 0, Math.PI * 2);
            c.stroke();
            c.strokeStyle = colors.black;
            c.lineWidth = 2;
            c.beginPath();
            c.arc(cx, cy, r + 18, 0, Math.PI * 2);
            c.stroke();
            for (let i = 0; i < 12; i++) {
                const a = (Math.PI * 2 * i) / 12 - Math.PI / 2;
                const x = cx + Math.cos(a) * (r + 18);
                const y = cy + Math.sin(a) * (r + 18);
                c.fillStyle = i + 1 === month + 1 ? accent : colors.black;
                c.beginPath();
                c.arc(x, y, i + 1 === month + 1 ? 6 : 3, 0, Math.PI * 2);
                c.fill();
            }
            drawCalendarStyleText(c, String(date.getDate()), cx, cy + Math.round(mainDaySize * 0.25), {
                size: Math.round(mainDaySize * 0.78), weight: 950, color: colors.black, align: 'center'
            });
            drawCalendarStyleText(c, monthText, cx, Math.floor(height * 0.18), { size: monthSize, weight: 850, color: accent, align: 'center' });
            drawCalendarStyleText(c, `${weekdayText}  ${settings.showLunar ? lunar.dateText : dateText}`, cx, Math.floor(height * 0.82), { size: weekdaySize, weight: 800, color: colors.black, align: 'center' });
            return;
        }

        if (variant === 'memo') {
            const noteW = Math.floor(width * 0.38);
            c.fillStyle = softAccent;
            roundRectPath(c, pad, pad, noteW, height - pad * 2, 18);
            c.fill();
            drawCalendarStyleText(c, title || 'NOTE', pad + 18, pad + 42, { size: titleSize, weight: 850, color: accent });
            ['上午', '下午', '晚上', '备注'].forEach((label, index) => {
                const y = pad + 92 + index * Math.floor((height - pad * 2 - 120) / 4);
                drawCalendarStyleText(c, label, pad + 18, y, { size: smallSize, weight: 800, color: colors.black });
                drawCalendarStyleRule(c, pad + 18, y + 18, noteW - 36, colors.black, 1);
            });
            drawCalendarStyleFramedMonthGrid(c, date, profile, settings, safeCalendarStyleGridBounds(profile, {
                x: pad + noteW + 18,
                y: pad,
                width: width - pad * 2 - noteW - 18,
                height: height - pad * 2
            }), { stroke: accent, radius: 16, padding: 12, cellRadius: 8 });
            return;
        }

        if (variant === 'album') {
            c.fillStyle = colors.white;
            c.fillRect(0, 0, width, height);
            drawCalendarStyleText(c, monthText, pad, pad + 28, { size: monthSize, weight: 850, color: accent });
            drawCalendarStyleText(c, title, width - pad, pad + 28, { size: titleSize, weight: 700, color: colors.black, align: 'right' });
            c.fillStyle = softAccent;
            roundRectPath(c, pad, Math.floor(height * 0.18), width - pad * 2, Math.floor(height * 0.46), 26);
            c.fill();
            drawCalendarStyleText(c, String(date.getDate()).padStart(2, '0'), width / 2, Math.floor(height * 0.5), {
                size: Math.round(mainDaySize * 0.74), weight: 950, color: accent, align: 'center'
            });
            drawCalendarStyleText(c, `${dateText} · ${weekdayText}`, width / 2, Math.floor(height * 0.62), { size: dateSize, weight: 850, color: colors.black, align: 'center' });
            if (settings.showLunar) drawCalendarStyleText(c, lunar.dateText, width / 2, Math.floor(height * 0.74), { size: lunarSize, weight: 750, color: accent, align: 'center' });
            return;
        }

        if (variant === 'timeline') {
            const lineX = Math.floor(width * 0.28);
            c.strokeStyle = accent;
            c.lineWidth = 4;
            c.beginPath();
            c.moveTo(lineX, pad + 44);
            c.lineTo(lineX, height - pad);
            c.stroke();
            drawCalendarStyleText(c, title || monthText, pad, pad + 28, { size: titleSize, weight: 850, color: colors.black });
            for (let i = 0; i < 7; i++) {
                const y = pad + 76 + i * Math.floor((height - pad * 2 - 92) / 6);
                c.fillStyle = i === date.getDay() ? accent : colors.black;
                c.beginPath();
                c.arc(lineX, y, i === date.getDay() ? 8 : 5, 0, Math.PI * 2);
                c.fill();
                drawCalendarStyleText(c, getCalendarStyleWeekdays(0)[i].text, lineX + 22, y + 6, { size: smallSize, weight: 800, color: colors.black });
            }
            drawCalendarStyleText(c, String(date.getDate()), Math.floor(width * 0.68), Math.floor(height * 0.48), {
                size: Math.round(mainDaySize * 0.74), weight: 950, color: accent, align: 'center'
            });
            drawCalendarStyleText(c, dateText, Math.floor(width * 0.68), Math.floor(height * 0.62), { size: dateSize, weight: 850, color: colors.black, align: 'center' });
            if (settings.showLunar) drawCalendarStyleText(c, lunar.dateText, Math.floor(width * 0.68), Math.floor(height * 0.72), { size: lunarSize, weight: 750, color: accent, align: 'center' });
            return;
        }

        if (variant === 'journal') {
            c.fillStyle = softAccent;
            c.fillRect(0, 0, width, height);
            c.fillStyle = colors.white;
            roundRectPath(c, pad, pad, width - pad * 2, height - pad * 2, 18);
            c.fill();
            [['MONTH', monthText], ['DAY', String(date.getDate())], ['WEEK', weekdayText]].forEach((item, index) => {
                const x = pad + 22 + index * Math.floor((width - pad * 2 - 44) / 3);
                c.fillStyle = index === 1 ? accent : colors.white;
                roundRectPath(c, x, pad + 28, Math.floor((width - pad * 2 - 72) / 3), 76, 14);
                c.fill();
                c.strokeStyle = colors.black;
                c.lineWidth = 2;
                c.stroke();
                drawCalendarStyleText(c, item[0], x + 12, pad + 54, { size: Math.max(11, Math.round(smallSize * 0.75)), weight: 850, color: index === 1 ? colors.white : accent });
                drawCalendarStyleText(c, item[1], x + 12, pad + 88, { size: Math.max(16, Math.round(index === 1 ? dateSize * 1.1 : smallSize)), weight: 900, color: index === 1 ? colors.white : colors.black });
            });
            drawCalendarStyleFramedMonthGrid(c, date, profile, settings, safeCalendarStyleGridBounds(profile, {
                x: pad + 22,
                y: pad + 132,
                width: width - pad * 2 - 44,
                height: height - pad * 2 - 156
            }), { stroke: colors.black, radius: 14, padding: 10, cellRadius: 7 });
            return;
        }

        if (variant === 'pixel') {
            const block = Math.max(12, Math.floor(Math.min(width, height) / 18));
            c.fillStyle = colors.white;
            c.fillRect(0, 0, width, height);
            for (let y = 0; y < height; y += block * 2) {
                for (let x = 0; x < width; x += block * 2) {
                    if (((x / block + y / block) % 4) === 0) {
                        c.fillStyle = softAccent;
                        c.fillRect(x, y, block, block);
                    }
                }
            }
            c.fillStyle = accent;
            c.fillRect(pad, pad, width - pad * 2, Math.max(54, Math.floor(height * 0.12)));
            drawCalendarStyleText(c, monthText, pad + 18, pad + 38, { size: monthSize, weight: 900, color: colors.white });
            drawCalendarStyleText(c, String(date.getDate()), width / 2, Math.floor(height * 0.6), {
                size: Math.round(mainDaySize * 0.9), weight: 950, color: colors.black, align: 'center'
            });
            drawCalendarStyleText(c, `${weekdayText} / ${settings.showLunar ? lunar.dateText : dateText}`, width / 2, Math.floor(height * 0.76), { size: weekdaySize, weight: 850, color: accent, align: 'center' });
            return;
        }

        if (variant === 'seal') {
            c.fillStyle = colors.white;
            c.fillRect(0, 0, width, height);
            c.strokeStyle = accent;
            c.lineWidth = 5;
            c.strokeRect(pad, pad, width - pad * 2, height - pad * 2);
            drawCalendarVerticalText(c, title || monthText, width - pad - 38, pad + 34, { size: Math.max(18, Math.round(titleSize * 0.85)), weight: 900, color: colors.black });
            const sealSize = Math.min(Math.floor(width * 0.34), Math.floor(height * 0.44));
            const sx = Math.floor((width - sealSize) / 2);
            const sy = Math.floor(height * 0.25);
            c.strokeStyle = accent;
            c.lineWidth = 6;
            c.strokeRect(sx, sy, sealSize, sealSize);
            drawCalendarStyleText(c, String(date.getDate()), sx + sealSize / 2, sy + sealSize * 0.68, {
                size: Math.round(mainDaySize * 0.62), weight: 950, color: accent, align: 'center'
            });
            drawCalendarStyleText(c, `${dateText}  ${weekdayText}`, width / 2, Math.floor(height * 0.78), { size: dateSize, weight: 850, color: colors.black, align: 'center' });
            if (settings.showLunar) drawCalendarStyleText(c, lunar.dateText, width / 2, Math.floor(height * 0.87), { size: lunarSize, weight: 750, color: accent, align: 'center' });
            return;
        }

        if (variant === 'duo') {
            const leftW = Math.floor(width * 0.34);
            c.fillStyle = softAccent;
            c.fillRect(0, 0, leftW, height);
            c.fillStyle = accent;
            c.fillRect(leftW - 8, 0, 8, height);
            drawCalendarStyleText(c, monthText, leftW / 2, pad + 36, { size: monthSize, weight: 850, color: accent, align: 'center' });
            drawCalendarStyleText(c, String(date.getDate()), leftW / 2, Math.floor(height * 0.52), {
                size: Math.round(mainDaySize * 0.72), weight: 950, color: colors.black, align: 'center'
            });
            drawCalendarStyleText(c, weekdayText, leftW / 2, Math.floor(height * 0.66), { size: weekdaySize, weight: 850, color: accent, align: 'center' });
            if (settings.showLunar) drawCalendarStyleText(c, lunar.dateText, leftW / 2, Math.floor(height * 0.76), { size: lunarSize, weight: 750, color: colors.black, align: 'center' });
            drawCalendarStyleFramedMonthGrid(c, date, profile, settings, safeCalendarStyleGridBounds(profile, {
                x: leftW + pad,
                y: pad,
                width: width - leftW - pad * 2,
                height: height - pad * 2
            }), { stroke: colors.black, radius: 18, padding: 12, cellRadius: 8 });
        }
    }

    function drawCustomCalendarStyle(date, profile) {
        const c = calendarPreviewCtx;
        const colors = getPreviewColors(profile);
        const settings = getCalendarStyleSettings();
        const accent = getCalendarStyleAccentColor(profile, colors, settings.accent);
        const softAccent = profile.numericColorMode === 4 ? colors.yellow : colors.white;
        c.fillStyle = colors.white;
        c.fillRect(0, 0, profile.width, profile.height);
        const { width, height } = profile;
        const weekStart = Number(weekStartSelect.value) || 0;
        const year = date.getFullYear();
        const month = date.getMonth();
        const today = date.getDate();
        const firstWeekday = new Date(year, month, 1).getDay();
        const firstOffset = (firstWeekday - weekStart + 7) % 7;
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const rowCount = Math.ceil((firstOffset + daysInMonth) / 7);
        const weekdays = getCalendarStyleWeekdays(weekStart);
        const lunar = getLunarInfo(date);
        const solarTerm = getNextSolarTerm(date);
        const monthText = `${year}.${String(month + 1).padStart(2, '0')}`;
        const dateText = `${month + 1}月${today}日`;
        const weekdayText = `星期${getCalendarStyleWeekdays(0)[date.getDay()].text}`;
        const titleSize = calendarStyleSize(settings, 'title', 28);
        const monthSize = calendarStyleSize(settings, 'month', 24);
        const dateSize = Math.max(18, Math.round(monthSize * 1.25));
        const mainDaySize = calendarStyleSize(settings, 'mainDay', Math.floor(height * 0.32));
        const weekdaySize = calendarStyleSize(settings, 'weekday', 28);
        const lunarSize = calendarStyleSize(settings, 'lunar', 22);
        const smallSize = calendarStyleSize(settings, 'small', 18);
        c.fillStyle = colors.white;
        c.fillRect(0, 0, width, height);
        c.textBaseline = 'alphabetic';
        const styleCtx = {
            width, height, colors, accent, softAccent, weekStart, year, month, today,
            firstWeekday, firstOffset, daysInMonth, rowCount, weekdays, lunar, solarTerm,
            monthText, dateText, weekdayText, titleSize, monthSize, dateSize,
            mainDaySize, weekdaySize, lunarSize, smallSize
        };
        const redesignedStyleDrawers = {
            grid: drawCalendarStyleGalleryGrid,
            classic: drawCalendarStyleClassicLayout,
            duo: (canvas, currentDate, currentProfile, currentSettings, currentCtx) => drawCalendarStyleBonusLayout(canvas, currentDate, currentProfile, currentSettings, currentCtx, 'duo')
        };
        const redesignedStyleDrawer = redesignedStyleDrawers[settings.layout];
        if (redesignedStyleDrawer) {
            redesignedStyleDrawer(c, date, profile, settings, styleCtx);
            return;
        }

        if (settings.layout === 'poster') {
            const pad = Math.max(26, Math.floor(width * 0.055));
            c.fillStyle = accent;
            c.fillRect(0, 0, Math.max(10, Math.floor(width * 0.018)), height);
            c.fillStyle = softAccent;
            roundRectPath(c, pad, pad, width - pad * 2, Math.floor(height * 0.28), 18);
            c.fill();
            drawCalendarStyleText(c, settings.title, pad + 24, pad + 48, { size: titleSize, weight: 800, color: accent });
            drawCalendarStyleText(c, monthText, width - pad - 24, pad + 48, { size: monthSize, weight: 800, color: colors.black, align: 'right' });
            drawCalendarStyleText(c, String(today), width / 2, Math.floor(height * 0.54), {
                size: mainDaySize, weight: 900, color: accent, align: 'center'
            });
            drawCalendarStyleText(c, dateText, width / 2, Math.floor(height * 0.66), { size: dateSize, weight: 800, color: colors.black, align: 'center' });
            drawCalendarStyleText(c, weekdayText, width / 2, Math.floor(height * 0.73), { size: weekdaySize, weight: 700, color: colors.black, align: 'center' });
            if (settings.showLunar) {
                const sub = `${lunar.dateText || ''}  ${solarTerm.days === 0 ? solarTerm.name : `距${solarTerm.name}${solarTerm.days}天`}`;
                drawCalendarStyleText(c, sub.trim(), width / 2, Math.floor(height * 0.81), { size: lunarSize, weight: 700, color: accent, align: 'center' });
            }
            return;
        }

        if (settings.layout === 'minimal') {
            const pad = Math.max(26, Math.floor(width * 0.06));
            drawCalendarStyleText(c, monthText, pad, pad + 24, { size: monthSize, weight: 800, color: accent });
            drawCalendarStyleText(c, settings.title, width - pad, pad + 24, { size: titleSize, weight: 700, color: colors.black, align: 'right' });
            c.strokeStyle = colors.black;
            c.lineWidth = 2;
            c.beginPath();
            c.moveTo(pad, pad + 48);
            c.lineTo(width - pad, pad + 48);
            c.stroke();
            drawCalendarStyleText(c, String(today), pad, Math.floor(height * 0.62), {
                size: mainDaySize, weight: 900, color: colors.black
            });
            drawCalendarStyleText(c, dateText, width - pad, Math.floor(height * 0.48), { size: dateSize, weight: 800, color: accent, align: 'right' });
            drawCalendarStyleText(c, weekdayText, width - pad, Math.floor(height * 0.58), { size: weekdaySize, weight: 700, color: colors.black, align: 'right' });
            if (settings.showLunar) {
                drawCalendarStyleText(c, lunar.dateText, width - pad, Math.floor(height * 0.68), { size: lunarSize, weight: 700, color: accent, align: 'right' });
            }
            return;
        }

        if (settings.layout === 'split') {
            const pad = Math.max(22, Math.floor(width * 0.04));
            const leftWidth = Math.floor(width * 0.36);
            c.fillStyle = softAccent;
            c.fillRect(0, 0, leftWidth, height);
            c.fillStyle = accent;
            c.fillRect(leftWidth - 6, 0, 6, height);
            drawCalendarStyleText(c, settings.title, pad, 48, { size: titleSize, weight: 850, color: colors.black });
            drawCalendarStyleText(c, String(today), leftWidth / 2, Math.floor(height * 0.48), {
                size: Math.round(mainDaySize * 0.82), weight: 950, color: accent, align: 'center'
            });
            drawCalendarStyleText(c, weekdayText, leftWidth / 2, Math.floor(height * 0.62), { size: weekdaySize, weight: 800, color: colors.black, align: 'center' });
            if (settings.showLunar) drawCalendarStyleText(c, lunar.dateText, leftWidth / 2, Math.floor(height * 0.7), { size: lunarSize, weight: 700, color: accent, align: 'center' });
            drawCalendarStyleText(c, monthText, width - pad, 50, { size: monthSize, weight: 850, color: accent, align: 'right' });
            drawCalendarStyleMonthGrid(c, date, profile, settings, {
                x: leftWidth + pad,
                y: 78,
                width: width - leftWidth - pad * 2,
                height: height - 100
            }, { centerNumbers: true });
            return;
        }

        if (settings.layout === 'weekstrip') {
            const pad = Math.max(22, Math.floor(width * 0.04));
            const weekStartDate = new Date(date);
            weekStartDate.setDate(date.getDate() - ((date.getDay() - (Number(weekStartSelect.value) || 0) + 7) % 7));
            drawCalendarStyleText(c, settings.title, pad, 48, { size: titleSize, weight: 850, color: colors.black });
            drawCalendarStyleText(c, monthText, width - pad, 48, { size: monthSize, weight: 850, color: accent, align: 'right' });
            const stripY = 86;
            const stripH = Math.floor(height * 0.24);
            const dayW = Math.floor((width - pad * 2) / 7);
            for (let i = 0; i < 7; i++) {
                const d = new Date(weekStartDate);
                d.setDate(weekStartDate.getDate() + i);
                const isToday = d.toDateString() === date.toDateString();
                const x = pad + i * dayW;
                c.fillStyle = isToday ? accent : (i === 0 || i === 6 ? softAccent : colors.white);
                roundRectPath(c, x + 4, stripY, dayW - 8, stripH, 16);
                c.fill();
                c.strokeStyle = colors.black;
                c.lineWidth = 1;
                c.stroke();
                drawCalendarStyleText(c, getCalendarStyleWeekdays(0)[d.getDay()].text, x + dayW / 2, stripY + 32, {
                    size: Math.round(weekdaySize * 0.72), weight: 800, color: isToday ? colors.white : accent, align: 'center'
                });
                drawCalendarStyleText(c, d.getDate(), x + dayW / 2, stripY + Math.floor(stripH * 0.72), {
                    size: Math.round(mainDaySize * 0.34), weight: 900, color: isToday ? colors.white : colors.black, align: 'center'
                });
            }
            drawCalendarStyleMonthGrid(c, date, profile, settings, {
                x: pad,
                y: stripY + stripH + 28,
                width: width - pad * 2,
                height: height - stripY - stripH - 56
            }, { centerNumbers: true });
            return;
        }

        if (settings.layout === 'dashboard') {
            const pad = Math.max(20, Math.floor(width * 0.035));
            const sideWidth = Math.floor(width * 0.3);
            drawCalendarStyleText(c, settings.title, pad, 42, { size: titleSize, weight: 850, color: colors.black });
            drawCalendarStyleText(c, monthText, width - pad, 42, { size: monthSize, weight: 850, color: accent, align: 'right' });
            c.fillStyle = accent;
            roundRectPath(c, pad, 68, sideWidth, 150, 16);
            c.fill();
            drawCalendarStyleText(c, String(today), pad + sideWidth / 2, 172, { size: Math.round(mainDaySize * 0.5), weight: 950, color: colors.white, align: 'center' });
            drawCalendarStyleText(c, weekdayText, pad + sideWidth / 2, 204, { size: Math.round(weekdaySize * 0.8), weight: 800, color: colors.white, align: 'center' });
            const infoY = 250;
            const info = [
                ['农历', lunar.dateText || '--'],
                ['周数', `${getIsoWeek(date)}周`],
                ['节气', solarTerm.days === 0 ? solarTerm.name : `${solarTerm.name}-${solarTerm.days}`]
            ];
            info.forEach((item, index) => {
                const y = infoY + index * 58;
                c.fillStyle = index % 2 === 0 ? softAccent : colors.white;
                roundRectPath(c, pad, y, sideWidth, 42, 10);
                c.fill();
                drawCalendarStyleText(c, item[0], pad + 14, y + 27, { size: Math.round(smallSize * 0.9), weight: 700, color: colors.black });
                drawCalendarStyleText(c, item[1], pad + sideWidth - 12, y + 27, { size: smallSize, weight: 850, color: accent, align: 'right' });
            });
            drawCalendarStyleMonthGrid(c, date, profile, settings, {
                x: pad + sideWidth + 22,
                y: 68,
                width: width - pad * 2 - sideWidth - 22,
                height: height - 92
            }, { centerNumbers: true });
            return;
        }

        if (settings.layout === 'agenda') {
            const pad = Math.max(20, Math.floor(width * 0.035));
            const headerH = 74;
            c.fillStyle = accent;
            c.fillRect(0, 0, width, headerH);
            drawCalendarStyleText(c, calendarStyleTitleText(settings, monthText), pad, 48, { size: titleSize, weight: 850, color: colors.white });
            drawCalendarStyleText(c, dateText, width - pad, 48, { size: dateSize, weight: 900, color: colors.white, align: 'right' });
            const listX = Math.floor(width * 0.58);
            drawCalendarStyleMonthGrid(c, date, profile, settings, {
                x: pad,
                y: headerH + 22,
                width: listX - pad * 2,
                height: height - headerH - 44
            }, { centerNumbers: true });
            drawCalendarStyleText(c, '今日安排', listX, headerH + 44, { size: titleSize, weight: 850, color: accent });
            ['上午', '下午', '晚上', '备注'].forEach((label, index) => {
                const y = headerH + 76 + index * 82;
                c.strokeStyle = colors.black;
                c.lineWidth = 2;
                c.beginPath();
                c.moveTo(listX, y + 36);
                c.lineTo(width - pad, y + 36);
                c.stroke();
                drawCalendarStyleText(c, label, listX, y + 24, { size: smallSize, weight: 800, color: colors.black });
            });
            if (settings.showLunar) drawCalendarStyleText(c, lunar.dateText, width - pad, height - pad, { size: lunarSize, weight: 700, color: accent, align: 'right' });
            return;
        }

        if (settings.layout === 'vertical') {
            const pad = Math.max(24, Math.floor(width * 0.04));
            c.fillStyle = softAccent;
            c.fillRect(0, 0, width, height);
            c.fillStyle = colors.white;
            roundRectPath(c, pad, pad, width - pad * 2, height - pad * 2, 18);
            c.fill();
            c.strokeStyle = accent;
            c.lineWidth = 4;
            c.stroke();
            drawCalendarVerticalText(c, settings.title, width - pad - 38, pad + 30, { size: titleSize, weight: 900, color: accent });
            drawCalendarStyleText(c, String(today), Math.floor(width * 0.34), Math.floor(height * 0.56), {
                size: mainDaySize, weight: 950, color: colors.black, align: 'center'
            });
            drawCalendarVerticalText(c, dateText, Math.floor(width * 0.62), Math.floor(height * 0.24), { size: dateSize, weight: 900, color: accent });
            drawCalendarVerticalText(c, weekdayText, Math.floor(width * 0.72), Math.floor(height * 0.25), { size: weekdaySize, weight: 800, color: colors.black });
            if (settings.showLunar) drawCalendarVerticalText(c, lunar.dateText, Math.floor(width * 0.82), Math.floor(height * 0.25), { size: lunarSize, weight: 800, color: colors.black });
            drawCalendarStyleText(c, monthText, pad + 28, pad + 38, { size: monthSize, weight: 850, color: accent });
            return;
        }

        if (settings.layout === 'card') {
            const pad = Math.max(24, Math.floor(width * 0.045));
            c.fillStyle = accent;
            roundRectPath(c, pad, pad, width - pad * 2, height - pad * 2, 20);
            c.fill();
            c.fillStyle = colors.white;
            roundRectPath(c, pad + 14, pad + 14, width - pad * 2 - 28, height - pad * 2 - 28, 14);
            c.fill();
            drawCalendarStyleText(c, solarTerm.days === 0 ? solarTerm.name : `距 ${solarTerm.name}`, width / 2, Math.floor(height * 0.22), {
                size: Math.round(lunarSize * 1.9), weight: 950, color: accent, align: 'center'
            });
            drawCalendarStyleText(c, solarTerm.days === 0 ? '今日节气' : `还有 ${solarTerm.days} 天`, width / 2, Math.floor(height * 0.31), {
                size: dateSize, weight: 850, color: colors.black, align: 'center'
            });
            drawCalendarStyleText(c, String(today), width / 2, Math.floor(height * 0.62), {
                size: Math.round(mainDaySize * 0.8), weight: 950, color: colors.black, align: 'center'
            });
            drawCalendarStyleText(c, `${dateText} · ${weekdayText}`, width / 2, Math.floor(height * 0.75), { size: weekdaySize, weight: 850, color: accent, align: 'center' });
            if (settings.showLunar) drawCalendarStyleText(c, lunar.dateText, width / 2, Math.floor(height * 0.83), { size: lunarSize, weight: 750, color: colors.black, align: 'center' });
            return;
        }

        if (settings.layout === 'classic') {
            const pad = Math.max(18, Math.floor(width * 0.032));
            c.fillStyle = accent;
            c.fillRect(0, 0, width, 58);
            drawCalendarStyleText(c, settings.title, pad, 38, { size: titleSize, weight: 850, color: colors.white });
            drawCalendarStyleText(c, `${year} 年 ${month + 1} 月`, width - pad, 38, { size: monthSize, weight: 850, color: colors.white, align: 'right' });
            drawCalendarStyleMonthGrid(c, date, profile, settings, {
                x: pad,
                y: 76,
                width: width - pad * 2,
                height: height - 104
            }, { squareWeekHeader: true, centerNumbers: true, lineWidth: 2, radius: 2 });
            if (settings.showLunar) {
                drawCalendarStyleText(c, lunar.yearText, width / 2, height - 18, {
                    size: smallSize, weight: 700, color: colors.black, align: 'center'
                });
            }
            return;
        }

        const pad = Math.max(16, Math.floor(width * 0.035));
        const headerHeight = Math.max(86, Math.floor(height * 0.18));
        const weekHeight = Math.max(30, Math.floor(height * 0.07));
        const gridTop = headerHeight + weekHeight + 8;
        const gridHeight = height - gridTop - pad;
        const cellWidth = Math.floor((width - pad * 2) / 7);
        const lastCellWidth = width - pad * 2 - cellWidth * 6;
        const cellHeight = Math.floor(gridHeight / rowCount);

        c.fillStyle = accent;
        c.fillRect(0, 0, width, 12);
        drawCalendarStyleText(c, settings.title, pad, 50, { size: titleSize, weight: 850, color: colors.black });
        drawCalendarStyleText(c, monthText, pad, 82, { size: monthSize, weight: 800, color: accent });
        drawCalendarStyleText(c, dateText, width - pad, 50, { size: dateSize, weight: 900, color: accent, align: 'right' });
        drawCalendarStyleText(c, settings.showLunar ? lunar.dateText : weekdayText, width - pad, 82, {
            size: settings.showLunar ? lunarSize : weekdaySize, weight: 700, color: colors.black, align: 'right'
        });

        weekdays.forEach((weekday, index) => {
            const x = pad + index * cellWidth;
            const w = index === 6 ? lastCellWidth : cellWidth;
            c.fillStyle = weekday.weekend ? accent : softAccent;
            roundRectPath(c, x + 2, headerHeight, w - 4, weekHeight, 8);
            c.fill();
            drawCalendarStyleText(c, weekday.text, x + w / 2, headerHeight + Math.floor(weekHeight * 0.68), {
                size: Math.round(weekdaySize * 0.72),
                weight: 800,
                color: weekday.weekend ? colors.white : accent,
                align: 'center'
            });
        });

        c.strokeStyle = colors.black;
        c.lineWidth = 1;
        for (let row = 0; row <= rowCount; row++) {
            const y = gridTop + row * cellHeight;
            c.beginPath();
            c.moveTo(pad, y);
            c.lineTo(width - pad, y);
            c.stroke();
        }
        for (let col = 0; col <= 7; col++) {
            const x = col === 7 ? width - pad : pad + col * cellWidth;
            c.beginPath();
            c.moveTo(x, gridTop);
            c.lineTo(x, gridTop + rowCount * cellHeight);
            c.stroke();
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const position = firstOffset + day - 1;
            const col = position % 7;
            const row = Math.floor(position / 7);
            const x = pad + col * cellWidth;
            const y = gridTop + row * cellHeight;
            const w = col === 6 ? lastCellWidth : cellWidth;
            const actualWeekday = new Date(year, month, day).getDay();
            const weekend = actualWeekday === 0 || actualWeekday === 6;
            const isToday = day === today;
            if (isToday) {
                c.fillStyle = softAccent;
                roundRectPath(c, x + 7, y + 6, w - 14, cellHeight - 12, 10);
                c.fill();
                c.strokeStyle = accent;
                c.lineWidth = 3;
                c.stroke();
            }
            const numberSize = calendarStyleSize(settings, 'cellDay', Math.max(24, Math.floor(cellHeight * 0.36)));
            const labelSize = calendarStyleSize(settings, 'cellLunar', Math.max(13, Math.floor(cellHeight * 0.18)));
            const label = settings.showLunar ? getCalendarCellLabel(new Date(year, month, day)) : null;
            drawCalendarStyleStackedDay(c, day, label, x, y, w, cellHeight, {
                numberSize,
                labelSize,
                numberWeight: 900,
                numberColor: isToday || weekend ? accent : colors.black,
                labelColor: label?.festival ? accent : colors.black
            });
        }
    }

    async function applyCalendarStyleToImageCanvas(options = {}) {
        if (!calendarStylePanelOpen) {
            setCalendarStylePanelOpen(true);
        }
        setCalendarPreviewMode('calendar');
        renderCalendarPreview(true);
        const profile = getCalendarPreviewProfile(Boolean(options.forSend));
        const cfg = getDriverConfig(profile.name);
        if (options.forSend && (!currentModel || !cfg)) {
            showToast('当前连接设备驱动信息异常，请重新连接设备');
            return false;
        }
        const imageData = calendarPreviewCtx.getImageData(0, 0, profile.width, profile.height);
        canvasWidthInput.value = profile.width;
        canvasHeightInput.value = profile.height;
        canvas.width = profile.width;
        canvas.height = profile.height;
        quickResolutionsSelect.value = [...quickResolutionsSelect.options].some(o => o.value === `${profile.width}x${profile.height}`) ? `${profile.width}x${profile.height}` : 'custom';
        ditherModeSelect.value = cfg?.colorMode || COLOR_MODE_MAP[profile.numericColorMode] || ditherModeSelect.value;
        originalImage = null;
        devicePreviewReady = false;
        imageScale = 1;
        imageOffsetX = 0;
        imageOffsetY = 0;
        currentRotation = 0;
        originalImageData = new ImageData(new Uint8ClampedArray(imageData.data), profile.width, profile.height);
        processedImageData = new ImageData(new Uint8ClampedArray(imageData.data), profile.width, profile.height);
        ctx.putImageData(processedImageData, 0, 0);
        updateStatusInfo();
        showToast(options.forSend ? '日历图片已生成，开始发送' : '日历图片已生成到图片预览');
        return true;
    }

    function drawCompact370CalendarSimulation(date, profile) {
        const c = calendarPreviewCtx;
        const colors = getPreviewColors(profile);
        const fourColor = profile.numericColorMode === 4;
        const weekStart = Number(weekStartSelect.value) || 0;
        const leftWidth = 288;
        const sideX = 296;
        const sideWidth = profile.width - sideX - 8;
        const weekHeight = 26;
        const gridTop = 31;
        const gridHeight = profile.height - weekHeight - 8;
        const year = date.getFullYear();
        const month = date.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstWeekday = new Date(year, month, 1).getDay();
        const firstOffset = (firstWeekday - weekStart + 7) % 7;
        const rowCount = Math.ceil((firstOffset + daysInMonth) / 7);
        const cellWidth = Math.floor(leftWidth / 7);
        const cellHeight = Math.floor(gridHeight / rowCount);
        const weekdays = ['日', '一', '二', '三', '四', '五', '六'];

        c.fillStyle = colors.white;
        c.fillRect(0, 0, profile.width, profile.height);
        for (let index = 0; index < 7; index++) {
            const weekday = (weekStart + index) % 7;
            const weekend = weekday === 0 || weekday === 6;
            const cellX = index * cellWidth;
            const currentWidth = index === 6 ? leftWidth - cellX : cellWidth;
            c.fillStyle = fourColor ? (weekend ? colors.red : colors.yellow) : (weekend ? colors.red : colors.black);
            if (index === 0 || index === 6) {
                roundRectPath(c, cellX, 0, currentWidth, weekHeight, 4);
                c.fill();
                c.fillRect(index === 0 ? cellX + 4 : cellX, 0, currentWidth - 4, weekHeight);
            } else c.fillRect(cellX, 0, currentWidth, weekHeight);
            const text = weekdays[weekday];
            const metrics = firmwareFontRenderer.metrics(FIRMWARE_FONT.wqy12);
            const baseline = Math.floor((weekHeight - (metrics.ascent - metrics.descent)) / 2) + metrics.ascent + 1;
            firmwareText(c, FIRMWARE_FONT.wqy12, text,
                cellX + Math.floor((currentWidth - firmwareTextWidth(FIRMWARE_FONT.wqy12, text)) / 2), baseline,
                fourColor ? (weekend ? colors.white : colors.red) : colors.white);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const position = firstOffset + day - 1;
            const col = position % 7;
            const row = Math.floor(position / 7);
            const cellX = col * cellWidth;
            const rowY = gridTop + row * cellHeight;
            const actualWeekday = new Date(year, month, day).getDay();
            const weekend = actualWeekday === 0 || actualWeekday === 6;
            const isToday = day === date.getDate();
            const tight = rowCount > 5;
            const font = tight ? FIRMWARE_FONT.helv14 : FIRMWARE_FONT.helv18;
            const numberY = rowY + (tight ? 18 : 20);
            const label = getCalendarCellLabel(new Date(year, month, day));
            if (isToday) {
                roundRectPath(c, cellX + 2, rowY + 2, cellWidth - 4, Math.max(18, cellHeight - 4), 4);
                c.fillStyle = fourColor ? colors.yellow : colors.red;
                c.fill();
                c.strokeStyle = fourColor ? colors.red : colors.black;
                c.lineWidth = 1;
                c.stroke();
            }
            const dayText = String(day);
            firmwareText(c, font, dayText,
                cellX + Math.floor((cellWidth - firmwareTextWidth(font, dayText)) / 2), numberY,
                isToday ? (fourColor ? colors.red : colors.white) : (weekend ? colors.red : colors.black));
            firmwareText(c, FIRMWARE_FONT.wqy9, label.text,
                cellX + Math.floor((cellWidth - firmwareTextWidth(FIRMWARE_FONT.wqy9, label.text)) / 2),
                rowY + (tight ? 31 : 33), isToday ? (fourColor ? colors.red : colors.white) : (label.festival ? colors.red : colors.black));
        }

        const lunar = getLunarInfo(date);
        const weekday = weekdays[date.getDay()];
        c.fillStyle = colors.red;
        c.fillRect(sideX, 0, 1, profile.height - 8);
        firmwareText(c, FIRMWARE_FONT.helv18, `${year}-${month + 1}`, sideX + 18, 39, colors.red);
        const dateDigits = date.getDate() > 9 ? 2 : 1;
        drawSevenNumber(c, date.getDate(), sideX + Math.floor((sideWidth - sevenNumberWidth(4, dateDigits)) / 2), 51,
            4, dateDigits, colors.red, colors.white);
        firmwareText(c, FIRMWARE_FONT.wqy12, `星期${weekday}`, sideX + 22, 163, colors.black);
        firmwareText(c, FIRMWARE_FONT.wqy12, lunar.dateText, sideX + 22, 185, colors.black);
        firmwareText(c, FIRMWARE_FONT.wqy12, lunar.yearText, sideX + 22, 207, colors.black);
        const ssid = getCalendarPreviewSsid();
        firmwareText(c, FIRMWARE_FONT.wqy9, ssid,
            sideX + sideWidth - firmwareTextWidth(FIRMWARE_FONT.wqy9, ssid) - 6, profile.height - 13, colors.black);
    }

    function drawGenericCalendarSimulation(date, profile) {
        const c = calendarPreviewCtx;
        const { width, height } = profile;
        const colors = getPreviewColors(profile);
        const fourColor = profile.numericColorMode === 4;
        const weekStart = Number(weekStartSelect.value) || 0;
        const large = height > 300;
        const x = 10;
        const headerY = large ? 38 : 28;
        const weekY = large ? 44 : 32;
        const gridTop = large ? 84 : 64;
        const weekHeight = large ? 32 : 24;
        const year = date.getFullYear();
        const month = date.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstWeekday = new Date(year, month, 1).getDay();
        const firstOffset = (firstWeekday - weekStart + 7) % 7;
        const rowCount = Math.ceil((firstOffset + daysInMonth) / 7);
        const cellWidth = Math.floor((width - 2 * x) / 7);
        const cellHeight = Math.floor((height - gridTop - x) / rowCount);
        const lunar = getLunarInfo(date);

        c.fillStyle = colors.white;
        c.fillRect(0, 0, width, height);
        let cursorX = x;
        const headerPart = (text, color, font) => {
            firmwareText(c, font, text, cursorX, headerY - 2, color);
            cursorX += firmwareTextWidth(font, text);
        };
        headerPart(String(year), colors.red, FIRMWARE_FONT.helv18);
        headerPart('年', colors.black, FIRMWARE_FONT.wqy12);
        headerPart(String(month + 1), colors.red, FIRMWARE_FONT.helv18);
        headerPart('月', colors.black, FIRMWARE_FONT.wqy12);

        const lunarX = cursorX;
        firmwareText(c, FIRMWARE_FONT.wqy9, lunar.dateText, lunarX, headerY, colors.black);
        const lunarDateWidth = firmwareTextWidth(FIRMWARE_FONT.wqy9, lunar.dateText);
        firmwareText(c, FIRMWARE_FONT.wqy9, ` [${getIsoWeek(date)}周]`, lunarX + lunarDateWidth, headerY, colors.red);
        const stemBranch = lunar.yearText.slice(0, 2);
        const zodiac = lunar.yearText.slice(2, 3);
        firmwareText(c, FIRMWARE_FONT.wqy9, ` ${stemBranch}年`, lunarX, headerY - 14, colors.black);
        firmwareText(c, FIRMWARE_FONT.wqy9, ` [${zodiac}]`,
            lunarX + firmwareTextWidth(FIRMWARE_FONT.wqy9, ` ${stemBranch}年`), headerY - 14, colors.red);
        const previewSsid = getCalendarPreviewSsid();
        firmwareText(c, FIRMWARE_FONT.wqy9, previewSsid,
            width - firmwareTextWidth(FIRMWARE_FONT.wqy9, previewSsid) - x, headerY, colors.black);

        const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
        for (let index = 0; index < 7; index++) {
            const day = (weekStart + index) % 7;
            const weekend = day === 0 || day === 6;
            const cellX = x + index * cellWidth;
            const currentWidth = index === 6 ? width - x - cellX : cellWidth;
            c.fillStyle = fourColor ? (weekend ? colors.red : colors.yellow) : (weekend ? colors.red : colors.black);
            c.fillRect(cellX, weekY, currentWidth, weekHeight);
            const weekdayFont = large ? FIRMWARE_FONT.wqy12 : FIRMWARE_FONT.wqy9;
            const weekdayText = weekdays[day];
            const weekdayMetrics = firmwareFontRenderer.metrics(weekdayFont);
            const baseline = weekY + Math.floor((weekHeight - (weekdayMetrics.ascent - weekdayMetrics.descent)) / 2)
                + weekdayMetrics.ascent + 1;
            firmwareText(c, weekdayFont, weekdayText,
                cellX + Math.floor((currentWidth - firmwareTextWidth(weekdayFont, weekdayText)) / 2), baseline,
                fourColor ? (weekend ? colors.white : colors.red) : colors.white);
        }

        if (large) {
            for (let row = 1; row < rowCount; row++) {
                drawDottedLine(c, x, gridTop + row * cellHeight, x + 7 * cellWidth - 1, gridTop + row * cellHeight);
            }
            for (let col = 1; col < 7; col++) {
                drawDottedLine(c, x + col * cellWidth, gridTop, x + col * cellWidth, gridTop + rowCount * cellHeight - 1);
            }
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const position = firstOffset + day - 1;
            const col = position % 7;
            const row = Math.floor(position / 7);
            const cellX = x + col * cellWidth;
            const rowY = gridTop + row * cellHeight;
            const actualWeekday = new Date(year, month, day).getDay();
            const weekend = actualWeekday === 0 || actualWeekday === 6;
            const isToday = day === date.getDate();
            const radius = large ? 13 : 10;
            const dayFont = large ? FIRMWARE_FONT.helv18 : FIRMWARE_FONT.helv14;
            const labelFont = large ? FIRMWARE_FONT.wqy12 : FIRMWARE_FONT.wqy9;
            const dayFontHeight = firmwareFontRenderer.metrics(dayFont).ascent - firmwareFontRenderer.metrics(dayFont).descent;
            const labelFontHeight = firmwareFontRenderer.metrics(labelFont).ascent - firmwareFontRenderer.metrics(labelFont).descent;
            const boxX = cellX + Math.floor((cellWidth - 2 * radius) / 2);
            const boxY = rowY + Math.floor((cellHeight - 2 * radius) / 2) + 3;
            const numberY = boxY - (radius - dayFontHeight);
            const label = getCalendarCellLabel(new Date(year, month, day));
            if (isToday) {
                c.beginPath();
                c.arc(boxX + radius, boxY + radius - 3, radius * 2, 0, Math.PI * 2);
                c.fillStyle = fourColor ? colors.yellow : colors.red;
                c.fill();
                if (fourColor) {
                    c.strokeStyle = colors.red;
                    c.lineWidth = 2;
                    c.stroke();
                }
            }
            const dayText = String(day);
            firmwareText(c, dayFont, dayText,
                boxX + Math.floor((2 * radius - firmwareTextWidth(dayFont, dayText)) / 2), numberY,
                isToday ? (fourColor ? colors.red : colors.white) : (weekend ? colors.red : colors.black));
            firmwareText(c, labelFont, label.text,
                boxX + Math.floor((2 * radius - firmwareTextWidth(labelFont, label.text)) / 2),
                numberY + labelFontHeight + 3, isToday || label.festival ? colors.red : colors.black);
        }
    }

    function drawGenericClockSimulation(date, profile) {
        const c = calendarPreviewCtx;
        const { width, height } = profile;
        const colors = getPreviewColors(profile);
        const compact = width === 416 && height === 240;
        const padding = height > 300 ? 100 : (compact ? 10 : 40);
        const dateY = compact ? 28 : 36;
        const infoY = compact ? 48 : 58;
        const lunarX = compact ? padding + 92 : 138;
        const lunar = getLunarInfo(date);
        const weekday = ['日', '一', '二', '三', '四', '五', '六'][date.getDay()];
        const ssidSuffix = getCalendarPreviewSsid().slice(-4);

        c.fillStyle = colors.white;
        c.fillRect(0, 0, width, height);
        let cursorX = padding;
        const datePart = (text, color, font) => {
            firmwareText(c, font, text, cursorX, dateY, color);
            cursorX += firmwareTextWidth(font, text);
        };
        datePart(String(date.getFullYear()), colors.red, FIRMWARE_FONT.helv18);
        datePart('年', colors.black, FIRMWARE_FONT.wqy12);
        datePart(String(date.getMonth() + 1).padStart(2, '0'), colors.red, FIRMWARE_FONT.helv18);
        datePart('月', colors.black, FIRMWARE_FONT.wqy12);
        datePart(String(date.getDate()).padStart(2, '0'), colors.red, FIRMWARE_FONT.helv18);
        datePart('日 ', colors.black, FIRMWARE_FONT.wqy12);

        if (!compact) {
            firmwareText(c, FIRMWARE_FONT.wqy9, `星期${weekday}`, padding, infoY, colors.black);
            firmwareText(c, FIRMWARE_FONT.wqy9, lunar.dateText, lunarX, infoY, colors.black);
        }
        const statusY = compact ? 22 : infoY;
        const statusFont = compact ? FIRMWARE_FONT.wqy12 : FIRMWARE_FONT.wqy9;
        const statusText = `[${ssidSuffix}]`;
        const statusX = width - padding - firmwareTextWidth(statusFont, statusText) - 2;
        const statusPrefix = '[';
        firmwareText(c, statusFont, statusPrefix, statusX, statusY, colors.black);
        const suffixX = statusX + firmwareTextWidth(statusFont, statusPrefix);
        firmwareText(c, statusFont, ssidSuffix, suffixX, statusY, colors.red);
        firmwareText(c, statusFont, ']', suffixX + firmwareTextWidth(statusFont, ssidSuffix), statusY, colors.black);

        const scale = Math.max(1, Math.floor(height / 45));
        const digits = 2;
        const timeWidth = 2 * sevenNumberWidth(scale, digits) + 4 * scale;
        let timeX = (width - timeWidth) / 2;
        const timeHeight = 20 * scale + 4;
        const timeY = (68 + (height - 68)) / 2 - timeHeight / 2;
        drawSevenNumber(c, date.getHours(), timeX, timeY, scale, digits, colors.black, colors.white);
        timeX += sevenNumberWidth(scale, digits) + 2 * scale;
        c.fillStyle = colors.black;
        c.fillRect(timeX, timeY + 4.5 * scale + 1, 2 * scale, 2 * scale);
        c.fillRect(timeX, timeY + 13.5 * scale + 3, 2 * scale, 2 * scale);
        timeX += 4 * scale;
        drawSevenNumber(c, date.getMinutes(), timeX, timeY, scale, digits, colors.black, colors.white);

        const footerTop = height - 68;
        const footerY1 = footerTop + 30;
        const footerY2 = footerY1 + 20;
        const stemBranch = lunar.yearText.slice(0, 2);
        const zodiac = lunar.yearText.slice(2, 3);
        firmwareText(c, FIRMWARE_FONT.wqy12, stemBranch, padding, footerY1, colors.black);
        const stemBranchWidth = firmwareTextWidth(FIRMWARE_FONT.wqy12, stemBranch);
        firmwareText(c, FIRMWARE_FONT.wqy12, zodiac, padding + stemBranchWidth, footerY1, colors.red);
        firmwareText(c, FIRMWARE_FONT.wqy12, '年',
            padding + stemBranchWidth + firmwareTextWidth(FIRMWARE_FONT.wqy12, zodiac), footerY1, colors.black);
        firmwareText(c, FIRMWARE_FONT.wqy12, ` ${getIsoWeek(date)}周`, padding, footerY2, colors.black);
        const solarTerm = getNextSolarTerm(date);
        const termLine = solarTerm.days === 0 ? solarTerm.name : `离${solarTerm.name}`;
        firmwareText(c, FIRMWARE_FONT.wqy12, termLine,
            width - padding - firmwareTextWidth(FIRMWARE_FONT.wqy12, termLine), footerY1,
            solarTerm.days === 0 ? colors.red : colors.black);
        if (solarTerm.days > 0) {
            const dayLine = `还有${solarTerm.days}天`;
            firmwareText(c, FIRMWARE_FONT.wqy12, dayLine,
                width - padding - firmwareTextWidth(FIRMWARE_FONT.wqy12, dayLine), footerY2, colors.black);
        }
    }

    function renderCalendarPreview(force = false) {
        if (!calendarPreviewCanvas || !calendarPreviewImage) return;
        const now = new Date();
        const profile = getCalendarPreviewProfile();
        const timeKey = calendarPreviewMode === 'clock'
            ? `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}-${now.getMinutes()}`
            : `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
        const renderKey = [calendarPreviewMode, profile.name, profile.width, profile.height, profile.guiModel,
            weekStartSelect.value, getCalendarPreviewSsid(), timeKey,
            calendarStylePanelOpen ? calendarStyleKey() : 'firmware'].join('|');

        calendarPreviewTimeEl.textContent = now.toLocaleString('zh-CN', {
            hour12: false, year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
        if (!force && renderKey === calendarPreviewRenderKey) return;
        calendarPreviewRenderKey = renderKey;

        calendarPreviewCanvas.width = profile.width;
        calendarPreviewCanvas.height = profile.height;
        calendarPreviewFrame.style.aspectRatio = `${profile.width} / ${profile.height}`;
        calendarPreviewFrame.classList.toggle('portrait-preview', profile.height > profile.width);
        if (calendarStylePanelOpen && calendarPreviewMode === 'calendar') {
            drawCustomCalendarStyle(now, profile);
        } else if (calendarPreviewMode === 'clock') {
            if (isSE0398Preview(profile)) drawSE0398ClockSimulation(now);
            else drawGenericClockSimulation(now, profile);
        } else if (profile.width === 416 && profile.height === 240) drawCompact370CalendarSimulation(now, profile);
        else if (isSE0398Preview(profile)) drawSE0398CalendarSimulation(now);
        else drawGenericCalendarSimulation(now, profile);

        calendarPreviewImage.src = calendarPreviewCanvas.toDataURL('image/png');
        calendarPreviewImage.alt = `${profile.name} ${calendarPreviewMode === 'clock' ? '时钟' : '日历'}${calendarStylePanelOpen && calendarPreviewMode === 'calendar' ? '网页图片' : '固件画面'}`;
        calendarPreviewBadge.textContent = `${profile.width}×${profile.height} · ${profile.name} · ${calendarStylePanelOpen && calendarPreviewMode === 'calendar' ? '网页图片' : '固件画面'}`;
    }

    function startCalendarPreviewTimer() {
        renderCalendarPreview();
        if (calendarPreviewTimer) return;
        calendarPreviewTimer = setInterval(renderCalendarPreview, 1000);
    }

    function stopCalendarPreviewTimer() {
        if (!calendarPreviewTimer) return;
        clearInterval(calendarPreviewTimer);
        calendarPreviewTimer = null;
    }

    function setCalendarPreviewMode(mode) {
        calendarPreviewMode = mode;
        calendarPreviewTabs.forEach(tab => {
            const active = tab.dataset.previewMode === mode;
            tab.classList.toggle('active', active);
            tab.setAttribute('aria-selected', active ? 'true' : 'false');
        });
        renderCalendarPreview();
    }

    function setCalendarStylePanelOpen(open) {
        calendarStylePanelOpen = Boolean(open);
        document.body.dataset.calendarStylePanelVisible = calendarStylePanelOpen ? 'true' : 'false';
        controlsPanel.classList.toggle('calendar-style-active', calendarStylePanelOpen);
        if (calendarStylePanelOpen) {
            controlsPanel.appendChild(calendarStylePanel);
            calendarStylePanel.classList.remove('hidden');
            setCalendarPreviewMode('calendar');
        } else {
            calendarStyleHost.appendChild(calendarStylePanel);
            calendarStylePanel.classList.add('hidden');
        }
        calendarStyleToggle?.setAttribute('aria-expanded', calendarStylePanelOpen ? 'true' : 'false');
    }

    // 发送日历/时钟命令
    async function sendCalendarClockCommand(type) {
        if (driverSwitchInProgress) {
            showToast('驱动正在切换，完成后再发送显示命令');
            return;
        }
        if (!connectedCommandChar) {
            showToast('请先连接蓝牙设备');
            return;
        }
        if (![2, 3, 4, 6].includes(Number(getDriverConfig(currentModel)?.numericColorMode))) {
            showToast('当前驱动暂不支持日历/时钟显示');
            return;
        }
        
        const date = new Date();
        // Firmware renders timestamp fields directly, so preserve the wall-clock
        // values selected by the user instead of applying the browser timezone.
        const timestamp = Math.floor(Date.UTC(
            date.getFullYear(), date.getMonth(), date.getDate(),
            date.getHours(), date.getMinutes(), date.getSeconds()
        ) / 1000);
        const weekStart = weekStartSelect.value;
        const commandCompatibilityValue = getCalendarCommandCompatValue();

        // Current firmware command format still requires a third numeric field.
        const cmd = `${type} ${timestamp} ${weekStart} ${commandCompatibilityValue}`;
        
        if (await sendCustomCommand(cmd)) {
            showToast(`${type} 命令已发送`);
        }
    }

    // 绑定模式切换事件
    if (modeSelector) {
        modeSelector.addEventListener('click', (e) => {
            if (e.target.classList.contains('mode-btn') && e.target.dataset.mode) {
                switchMode(e.target.dataset.mode);
            }
        });
    }

    calendarPreviewTabs.forEach(tab => {
        tab.addEventListener('click', () => setCalendarPreviewMode(tab.dataset.previewMode));
    });
    weekStartSelect.addEventListener('change', renderCalendarPreview);
    if (calendarStyleToggle) {
        calendarStyleToggle.addEventListener('click', () => {
            setCalendarStylePanelOpen(!calendarStylePanelOpen);
            renderCalendarPreview(true);
        });
    }
    if (calendarStyleFontPreset) {
        calendarStyleFontPreset.addEventListener('change', () => {
            if (calendarStyleFontPreset.value !== 'custom') {
                customCalendarFontFamily = '';
                calendarStyleFont.value = calendarStyleFontPreset.value;
            }
            renderCalendarPreview(true);
        });
    }
    if (calendarStyleFont) {
        calendarStyleFont.addEventListener('input', () => {
            customCalendarFontFamily = '';
            if (calendarStyleFontPreset) calendarStyleFontPreset.value = 'custom';
            renderCalendarPreview(true);
        });
    }
    [calendarStyleLayout, calendarStyleFontPreset, calendarStyleTextRender, calendarStyleTitle, calendarStyleAccent, calendarStyleLunar,
        ...Object.values(calendarStyleFontSizeInputs)
    ].forEach(control => {
        if (!control) return;
        const eventName = control.type === 'checkbox' ? 'change' : 'input';
        control.addEventListener(eventName, () => {
            updateCalendarFontSizeOutput(control);
            renderCalendarPreview(true);
        });
        if (eventName !== 'change') control.addEventListener('change', () => {
            updateCalendarFontSizeOutput(control);
            renderCalendarPreview(true);
        });
    });
    Object.values(calendarStyleFontSizeInputs).forEach(updateCalendarFontSizeOutput);
    if (calendarFontReset) calendarFontReset.addEventListener('click', resetCalendarFontSizes);
    if (calendarStyleFontFile) {
        calendarStyleFontFile.addEventListener('change', async () => {
            const file = calendarStyleFontFile.files?.[0];
            if (!file) return;
            if (!('FontFace' in window)) {
                showToast('当前浏览器不支持网页字体加载，请直接填写系统字体名');
                return;
            }
            try {
                const url = URL.createObjectURL(file);
                const family = `EPDCalendarCustom${Date.now()}`;
                const fontFace = new FontFace(family, `url(${url})`);
                await fontFace.load();
                document.fonts.add(fontFace);
                customCalendarFontFamily = `"${family}", ${calendarStyleFont.value || 'sans-serif'}`;
                calendarStyleFont.value = file.name.replace(/\.(ttf|otf|woff2?|TTF|OTF|WOFF2?)$/, '');
                if (calendarStyleFontPreset) calendarStyleFontPreset.value = 'custom';
                renderCalendarPreview(true);
                showToast('字体已加载，日历预览已更新');
            } catch (error) {
                showToast(`字体加载失败：${error.message}`);
            }
        });
    }
    if (calendarStyleRenderBtn) {
        calendarStyleRenderBtn.addEventListener('click', () => applyCalendarStyleToImageCanvas());
    }
    if (calendarStyleSendBtn) {
        calendarStyleSendBtn.addEventListener('click', async () => {
            if (driverSwitchInProgress) {
                showToast('驱动正在切换，完成后再发送日历图片');
                return;
            }
            if (!connectedDevice || !connectedDevice.gatt.connected || !connectedCharacteristic) {
                showToast('请先连接蓝牙设备');
                return;
            }
            if (!await applyCalendarStyleToImageCanvas({ forSend: true })) return;
            await nextPaint();
            sendBluetoothBtn.click();
        });
    }

    // 绑定日历/时钟按钮事件
    if (showCalendarBtn) showCalendarBtn.addEventListener('click', () => sendCalendarClockCommand('CALENDAR'));
    if (showClockBtn) showClockBtn.addEventListener('click', () => sendCalendarClockCommand('CLOCK'));
    if (clearDisplayBtn) clearDisplayBtn.addEventListener('click', async () => {
        if (driverSwitchInProgress || isTransferring) {
            showToast('请等待当前操作完成后再清屏');
            return;
        }
        if (!connectedCommandChar) {
            showToast('请先连接蓝牙设备');
            return;
        }
        if (await sendCustomCommand('CLEAR')) {
            setAlbumPlaybackState(false);
            showToast('清屏命令已发送');
        }
    });
    imagePickerButton.addEventListener('click', openImagePicker);
    imagePickerMenu.addEventListener('mouseleave', hidePickerHoverPreview);
    window.addEventListener('resize', positionImagePicker);
    window.addEventListener('scroll', positionImagePicker, { passive: true });
    document.addEventListener('click', event => {
        if (!imagePicker.contains(event.target) && !imagePickerMenu.hidden) closeImagePicker();
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && !imagePickerMenu.hidden) {
            closeImagePicker();
            imagePickerButton.focus();
        }
    });
    imageListSelect.addEventListener('change', () => {
        const selected = imageListSelect.options[imageListSelect.selectedIndex];
        requestDevicePreview(imageListSelect.value, selected?.dataset.fileId || '');
    });
    $('#refresh-image-list').addEventListener('click', () => {
        if (!connectedDevice || !connectedCommandChar) { showToast('请先连接蓝牙'); return; }
        refreshImageList();
        showToast('正在刷新图片列表...');
    });
    $('#show-selected-image').addEventListener('click', async () => {
        const fn = imageListSelect.value;
        if (imageListSelect.dataset.stale === 'true') { showToast('驱动已变化，请先刷新图片列表'); return; }
        if (!fn) { showToast('请先选择图片'); return; }
        if (!connectedDevice || !connectedCommandChar) { showToast('请先连接蓝牙'); return; }
        if (showCommandPending) return;
        showCommandPending = true;
        try {
            if (isPreviewing) await cancelDevicePreview(true, true);
            await sendCustomCommand('SHOW ' + fn);
            } finally {
                showCommandPending = false;
                 }
    });
    // ---- 图片列表功能结束 ----

    clearCommandLogBtn.addEventListener('click', () => { commandOutputLog.innerHTML = '';
        appendCommandLog('日志已清空', 'error'); });
    albumPlayBtn.addEventListener('click', async () => {
        if (!connectedDevice || !connectedCommandChar) {
            showToast('请先连接蓝牙设备以启用相册模式');
            appendCommandLog('相册模式失败: 蓝牙未连接', 'error');
            return;
        }
        const interval = Number(albumIntervalInput.value);
        if (!Number.isSafeInteger(interval) || interval < 1 || interval > 4294967) {
            showToast('播放间隔请输入 1 到 4294967 秒的整数');
            albumIntervalInput.focus();
            return;
        }
        let mode = '0';
        for (const radio of playModeRadios) {
            if (radio.checked) { mode = radio.value; break; }
        }
        setAlbumPlaybackPending('start');
        const sent = await sendCustomCommand(`AUTO ${interval} ${mode}`);
        if (!sent) {
            setAlbumPlaybackState(false);
            return;
        }
        setTimeout(() => {
            if (albumModeArea.dataset.playbackState === 'pending') {
                setAlbumPlaybackState(false);
                appendCommandLog('相册模式启动命令未收到设备确认', 'error');
                showToast('设备未确认自动播放状态，请重试');
            }
        }, 3000);
    });
    albumStopBtn.addEventListener('click', async () => {
        if (!connectedDevice || !connectedCommandChar) { showToast('请先连接蓝牙设备'); return; }
        setAlbumPlaybackPending('stop');
        const sent = await sendCustomCommand('STOP');
        if (!sent) setAlbumPlaybackState(true, '播放中');
        else setTimeout(() => {
            if (albumModeArea.dataset.playbackState === 'pending') setAlbumPlaybackState(false);
        }, 3000);
    });

    function detectDevice() { const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent); const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0; if (isMobile || isTouch) { document.body.classList.add('touch-device');
            $$('button').forEach(b => { b.addEventListener('touchstart', () => b.style.transform = 'scale(0.97)');
                b.addEventListener('touchend', () => b.style.transform = ''); }); } }

    function init() { detectDevice();
        if (driverSelect?.value && getDriverConfig(driverSelect.value)) {
            applyDriverConfig(driverSelect.value, { setCurrentModel: true });
        } else {
            canvas.width = 768;
            canvas.height = 552;
            ctx.fillStyle = '#f7fafd';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#6b8499';
            ctx.font = '15px "Segoe UI", system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('上传图片后预览将显示在这里', canvas.width / 2, canvas.height / 2);
        }
        updateSliderLabels();
        resetStorageDisplay();
        setAlbumPlaybackState(false);
        renderImagePickerOptions();
        renderCalendarPreview();
        updateStatusInfo();
        sendCommandBtn.disabled = true;
        deviceModelEl.textContent = '未连接'; }
    document.addEventListener('DOMContentLoaded', init);
})();

