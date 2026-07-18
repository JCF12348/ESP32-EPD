(function () {
    'use strict';

    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => Array.from(document.querySelectorAll(selector));
    const DEFAULT_FONT = '"Microsoft YaHei", SimHei, Arial, sans-serif';
    const WEEKDAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

    class PaintManager {
        constructor(canvasElement, canvasContext) {
            this.canvas = canvasElement;
            this.ctx = canvasContext;
            this.tool = 'brush';
            this.painting = false;
            this.lastX = 0;
            this.lastY = 0;
            this.history = [];
            this.historyIndex = -1;
            this.maxHistory = 60;
            this.eraserMode = false;
            this.textItems = [];
            this.todoItems = [];
            this.lineItems = [];
            this.dragTarget = null;
            this.selectedTextItem = null;
            this.selectedTodoItem = null;
            this.dragOffsetX = 0;
            this.dragOffsetY = 0;
            this.baseImageData = null;
            this.schedule = null;
            this.selectedScheduleCell = null;
            this.showTodoDeleteButtons = true;
            this.showScheduleCellIndicator = true;
            this.matterLimits = [];
            this.matterTodos = [];
            this.matterSchedules = [];
            this.toolStates = new Map();
            this.switchingTool = false;
            this.settingsVisible = false;
        }

        init() {
            this.moveSettingsPanelToControls();
            this.bindToolbar();
            this.bindBrushTools();
            this.bindTextTools();
            this.bindTodoTools();
            this.bindScheduleTools();
            this.bindMatterTools();
            this.bindCanvas();
            this.loadSchedule();
            this.loadMatter();
            this.renderMatterTables();
            this.resetToBlankBase(false);
            this.saveHistory();
            this.tool = '';
            this.hideEditorSettings();
            this.bindNonEditorModeHiding();
            this.markRuntimeState();
        }

        moveSettingsPanelToControls() {
            const anchor = $('#epd-editor-settings-anchor');
            const settings = $('#epd-editor-settings');
            if (!anchor || !settings || anchor.contains(settings)) return;
            anchor.appendChild(settings);
        }

        bindNonEditorModeHiding() {
            $$('#mode-selector button, #calendar-style-toggle, #show-calendar, #show-clock, #clear-canvas').forEach((button) => {
                button.addEventListener('click', () => this.hideEditorSettings());
            });
        }

        bindToolbar() {
            $$('.epd-tool-button[data-editor-tool]').forEach((button) => {
                button.addEventListener('click', () => this.setTool(button.dataset.editorTool));
            });
            $('#undo-btn')?.addEventListener('click', () => this.undo());
            $('#redo-btn')?.addEventListener('click', () => this.redo());
            $('#epd-editor-clear')?.addEventListener('click', () => this.clearCanvas());
            document.addEventListener('keydown', (event) => {
                if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
                    event.preventDefault();
                    this.undo();
                }
                if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') {
                    event.preventDefault();
                    this.redo();
                }
                if (event.key === 'Delete' && this.dragTarget) {
                    this.deleteSelectedOverlay();
                }
            });
        }

        bindBrushTools() {
            const syncBrushSize = (value) => {
                const size = Math.max(1, Math.min(100, Number(value) || 2));
                $('#brush-size').value = size;
                $('#brush-size-range').value = size;
            };
            $('#brush-size')?.addEventListener('input', (event) => syncBrushSize(event.target.value));
            $('#brush-size-range')?.addEventListener('input', (event) => syncBrushSize(event.target.value));
            $('#brush-color')?.addEventListener('change', () => {
                const textItem = this.getActiveTextItem();
                const todoItem = this.getActiveTodoItem();
                if (textItem) textItem.color = $('#brush-color').value;
                if (todoItem) todoItem.color = $('#brush-color').value;
                this.redrawAll(true);
            });
            $('#brush-eraser-toggle')?.addEventListener('click', () => {
                this.eraserMode = !this.eraserMode;
                $('#brush-eraser-toggle').classList.toggle('active', this.eraserMode);
                this.canvas.classList.toggle('epd-editor-eraser-cursor', this.eraserMode);
            });
        }

        bindTextTools() {
            const syncFontSize = (value) => {
                const size = Math.max(1, Math.min(140, Number(value) || 28));
                $('#font-size').value = size;
                $('#font-size-range').value = size;
                const item = this.getActiveTextItem();
                if (item) {
                    item.size = size;
                    this.redrawAll(true);
                    this.markRuntimeState();
                }
            };
            $('#font-size')?.addEventListener('input', (event) => syncFontSize(event.target.value));
            $('#font-size-range')?.addEventListener('input', (event) => syncFontSize(event.target.value));
            $('#font-family')?.addEventListener('change', () => {
                const item = this.getActiveTextItem();
                if (item) {
                    item.family = $('#font-family').value;
                    this.redrawAll(true);
                }
            });
            $('#text-bold')?.addEventListener('click', () => {
                $('#text-bold').classList.toggle('active');
                const item = this.getActiveTextItem();
                if (item) {
                    item.bold = $('#text-bold').classList.contains('active');
                    this.redrawAll(true);
                }
            });
            $('#text-italic')?.addEventListener('click', () => {
                $('#text-italic').classList.toggle('active');
                const item = this.getActiveTextItem();
                if (item) {
                    item.italic = $('#text-italic').classList.contains('active');
                    this.redrawAll(true);
                }
            });
            $('#add-text-btn')?.addEventListener('click', () => this.addTextAt(this.canvas.width * 0.12, this.canvas.height * 0.12));
        }

        bindTodoTools() {
            const syncTodoSize = (value) => {
                const size = Math.max(8, Math.min(100, Number(value) || 20));
                $('#todo-font-size').value = size;
                $('#todo-font-size-range').value = size;
                if (this.dragTarget?.kind === 'todo') {
                    this.dragTarget.item.size = size;
                    this.redrawAll(true);
                }
            };
            $('#todo-font-size')?.addEventListener('input', (event) => syncTodoSize(event.target.value));
            $('#todo-font-size-range')?.addEventListener('input', (event) => syncTodoSize(event.target.value));
            $('#todo-color')?.addEventListener('change', () => {
                if (this.dragTarget?.kind === 'todo') {
                    this.dragTarget.item.color = $('#todo-color').value;
                    this.redrawAll(true);
                }
            });
            $('#todo-bold')?.addEventListener('click', () => {
                $('#todo-bold').classList.toggle('active');
                if (this.dragTarget?.kind === 'todo') {
                    this.dragTarget.item.bold = $('#todo-bold').classList.contains('active');
                    this.redrawAll(true);
                }
            });
            $('#todo-italic')?.addEventListener('click', () => {
                $('#todo-italic').classList.toggle('active');
                if (this.dragTarget?.kind === 'todo') {
                    this.dragTarget.item.italic = $('#todo-italic').classList.contains('active');
                    this.redrawAll(true);
                }
            });
            $('#toggle-todo-delete-btn')?.addEventListener('click', () => {
                this.showTodoDeleteButtons = !this.showTodoDeleteButtons;
                $('#toggle-todo-delete-btn').classList.toggle('active', this.showTodoDeleteButtons);
                this.redrawAll(true);
            });
            $('#add-todo-btn')?.addEventListener('click', () => this.addTodoAt(this.canvas.width * 0.1, this.canvas.height * 0.18));
        }

        bindScheduleTools() {
            $('#create-schedule-btn')?.addEventListener('click', () => this.createSchedule());
            $('#schedule-input-confirm-btn')?.addEventListener('click', () => this.confirmScheduleInput());
            $('#schedule-input-cancel-btn')?.addEventListener('click', () => this.cancelScheduleInput());
            $('#toggle-schedule-cell-indicator-btn')?.addEventListener('click', () => {
                this.showScheduleCellIndicator = !this.showScheduleCellIndicator;
                $('#toggle-schedule-cell-indicator-btn').classList.toggle('active', this.showScheduleCellIndicator);
                this.redrawAll(true);
            });
            $('#schedule-color')?.addEventListener('change', () => {
                if (this.schedule) {
                    this.schedule.color = $('#schedule-color').value;
                    this.redrawAll(true);
                }
            });
            $('#schedule-font-size')?.addEventListener('input', () => {
                if (this.schedule) {
                    this.schedule.fontSize = Number($('#schedule-font-size').value) || 12;
                    if (this.selectedScheduleCell && this.schedule.cellFontSizes) {
                        const { row, col } = this.selectedScheduleCell;
                        this.schedule.cellFontSizes[row][col] = this.schedule.fontSize;
                    }
                    this.redrawAll(true);
                }
            });
            $('#schedule-font-decrease-btn')?.addEventListener('click', () => this.adjustScheduleFont(-1));
            $('#schedule-font-increase-btn')?.addEventListener('click', () => this.adjustScheduleFont(1));
            $('#schedule-zoom-in-btn')?.addEventListener('click', () => this.zoomSchedule(1.08));
            $('#schedule-zoom-out-btn')?.addEventListener('click', () => this.zoomSchedule(0.92));
            $('#schedule-move-left-btn')?.addEventListener('click', () => this.moveSchedule(-10, 0));
            $('#schedule-move-right-btn')?.addEventListener('click', () => this.moveSchedule(10, 0));
            $('#schedule-move-up-btn')?.addEventListener('click', () => this.moveSchedule(0, -10));
            $('#schedule-move-down-btn')?.addEventListener('click', () => this.moveSchedule(0, 10));
        }

        bindMatterTools() {
            $('#matter-render-btn')?.addEventListener('click', () => this.renderMatterTemplate());
            $('#matter-add-limit-btn')?.addEventListener('click', () => {
                this.matterLimits.push({ name: '新时限项', value: '30', endDate: this.todayIsoDate() });
                this.saveMatter();
                this.renderMatterTables();
            });
            $('#matter-add-todo-btn')?.addEventListener('click', () => {
                this.matterTodos.push({ name: '新待办', extra: '中' });
                this.saveMatter();
                this.renderMatterTables();
            });
            $('#matter-add-schedule-btn')?.addEventListener('click', () => {
                this.matterSchedules.push({ itemclass: '日程', activity: '新活动' });
                this.saveMatter();
                this.renderMatterTables();
            });
            $('#matter-clear-btn')?.addEventListener('click', () => {
                this.matterLimits = [];
                this.matterTodos = [];
                this.matterSchedules = [];
                this.saveMatter();
                this.renderMatterTables();
            });
        }

        bindCanvas() {
            this.canvas.addEventListener('pointerdown', (event) => this.pointerDown(event));
            this.canvas.addEventListener('pointermove', (event) => this.pointerMove(event));
            window.addEventListener('pointerup', () => this.pointerUp());
        }

        setTool(tool) {
            if (this.tool === tool && this.settingsVisible) return;
            if (this.tool) this.saveCurrentToolState();
            this.switchingTool = true;
            this.tool = tool;
            this.settingsVisible = true;
            this.painting = false;
            this.dragTarget = null;
            this.selectedScheduleCell = null;
            delete document.body.dataset.epdScheduleSelectedCell;
            $$('.epd-tool-button[data-editor-tool]').forEach((button) => {
                const active = button.dataset.editorTool === tool;
                button.classList.toggle('active', active);
                button.setAttribute('aria-pressed', active ? 'true' : 'false');
            });
            $$('.epd-tool-settings').forEach((panel) => {
                panel.classList.toggle('is-open', panel.dataset.settingsFor === tool);
            });
            this.canvas.classList.toggle('epd-editor-draw-cursor', tool === 'brush');
            this.canvas.classList.toggle('epd-editor-text-cursor', tool === 'text');
            this.canvas.classList.toggle('epd-editor-eraser-cursor', tool === 'brush' && this.eraserMode);
            this.loadToolState(tool);
            this.switchingTool = false;
            this.markRuntimeState();
        }

        hideEditorSettings() {
            this.settingsVisible = false;
            $$('.epd-tool-button[data-editor-tool]').forEach((button) => {
                button.classList.remove('active');
                button.setAttribute('aria-pressed', 'false');
            });
            $$('.epd-tool-settings').forEach((panel) => {
                panel.classList.remove('is-open');
            });
            $('#epd-editor-settings-anchor')?.classList.remove('is-visible');
            this.canvas.classList.remove('epd-editor-draw-cursor', 'epd-editor-text-cursor', 'epd-editor-eraser-cursor');
            document.body.dataset.epdPaintSettingsVisible = 'false';
        }

        markRuntimeState() {
            document.body.dataset.epdPaintReady = 'true';
            document.body.dataset.epdPaintTool = this.tool || '';
            document.body.dataset.epdPaintSettingsVisible = this.settingsVisible ? 'true' : 'false';
            document.body.dataset.epdPaintTextCount = String(this.textItems.length);
            document.body.dataset.epdPaintLastTextSize = String(this.textItems[this.textItems.length - 1]?.size || '');
            $('#epd-editor-settings-anchor')?.classList.toggle('is-visible', this.settingsVisible);
        }

        saveCurrentToolState() {
            if (!this.tool || this.switchingTool) return;
            this.toolStates.set(this.tool, this.createSnapshot());
        }

        loadToolState(tool) {
            const snapshot = this.toolStates.get(tool);
            if (snapshot) {
                this.restoreSnapshot(snapshot, false);
                return;
            }
            this.createDefaultToolCanvas(tool);
        }

        createDefaultToolCanvas(tool) {
            this.clearElements();
            this.ctx.save();
            this.ctx.setTransform(1, 0, 0, 1, 0, 0);
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.restore();
            this.setBaseImageData();
            if (tool === 'schedule') {
                this.createSchedule({ commit: false, save: false });
            } else if (tool === 'matter') {
                this.ensureDefaultMatterData();
                this.renderMatterTemplate({ commit: false, save: false });
            }
            this.toolStates.set(tool, this.createSnapshot());
            this.commit();
        }

        point(event) {
            const rect = this.canvas.getBoundingClientRect();
            return {
                x: (event.clientX - rect.left) * (this.canvas.width / rect.width),
                y: (event.clientY - rect.top) * (this.canvas.height / rect.height)
            };
        }

        pointerDown(event) {
            const p = this.point(event);
            if (this.tool === 'text') {
                const target = this.findOverlay(p.x, p.y, 'text');
                if (target) {
                    this.selectedTextItem = target.item;
                    return this.startDrag(target, p);
                }
                return this.addTextAt(p.x, p.y);
            }
            if (this.tool === 'todo') {
                const target = this.findOverlay(p.x, p.y, 'todo');
                if (target?.deleteHit) return this.deleteTodo(target.item);
                if (target) {
                    this.selectedTodoItem = target.item;
                    return this.startDrag(target, p);
                }
                return this.addTodoAt(p.x, p.y);
            }
            if (this.tool === 'schedule') {
                const cell = this.findScheduleCell(p.x, p.y);
                if (cell) this.selectScheduleCell(cell);
                return;
            }
            if (this.tool !== 'brush') return;
            event.preventDefault();
            this.painting = true;
            this.lastX = p.x;
            this.lastY = p.y;
            this.saveBaseForFreehand();
        }

        pointerMove(event) {
            const p = this.point(event);
            if (this.dragTarget) {
                this.dragTarget.item.x = p.x - this.dragOffsetX;
                this.dragTarget.item.y = p.y - this.dragOffsetY;
                this.redrawAll(false);
                return;
            }
            if (!this.painting) return;
            const size = this.eraserMode
                ? Number($('#eraser-size-range')?.value) || 18
                : Number($('#brush-size')?.value) || 2;
            const color = this.eraserMode ? '#ffffff' : ($('#brush-color')?.value || '#000000');
            this.ctx.save();
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            this.ctx.lineWidth = size;
            this.ctx.strokeStyle = color;
            this.ctx.beginPath();
            this.ctx.moveTo(this.lastX, this.lastY);
            this.ctx.lineTo(p.x, p.y);
            this.ctx.stroke();
            this.ctx.restore();
            this.lineItems.push({ x1: this.lastX, y1: this.lastY, x2: p.x, y2: p.y, size, color });
            this.lastX = p.x;
            this.lastY = p.y;
        }

        pointerUp() {
            if (this.dragTarget) {
                this.dragTarget = null;
                this.saveHistory();
                this.commit();
                return;
            }
            if (!this.painting) return;
            this.painting = false;
            this.setBaseImageData();
            this.saveHistory();
            this.commit();
        }

        startDrag(target, point) {
            this.dragTarget = target;
            this.dragOffsetX = point.x - target.item.x;
            this.dragOffsetY = point.y - target.item.y;
        }

        addTextAt(x, y) {
            const text = ($('#text-input')?.value || '').trim();
            if (!text) return;
            const item = {
                kind: 'text',
                text,
                x,
                y,
                color: $('#brush-color')?.value || '#000000',
                family: $('#font-family')?.value || DEFAULT_FONT,
                size: Number($('#font-size')?.value) || 28,
                bold: $('#text-bold')?.classList.contains('active') || false,
                italic: $('#text-italic')?.classList.contains('active') || false
            };
            this.textItems.push(item);
            this.selectedTextItem = item;
            this.redrawAll(true);
            this.markRuntimeState();
            $('#text-input').value = '';
        }

        addTodoAt(x, y) {
            const text = ($('#todo-input')?.value || '').trim();
            if (!text) return;
            const item = {
                kind: 'todo',
                text,
                x,
                y,
                color: $('#todo-color')?.value || '#000000',
                size: Number($('#todo-font-size')?.value) || 20,
                bold: $('#todo-bold')?.classList.contains('active') || false,
                italic: $('#todo-italic')?.classList.contains('active') || false,
                checked: false
            };
            this.todoItems.push(item);
            this.selectedTodoItem = item;
            this.redrawAll(true);
            $('#todo-input').value = '';
        }

        getActiveTextItem() {
            if (this.selectedTextItem && this.textItems.includes(this.selectedTextItem)) return this.selectedTextItem;
            return this.textItems[this.textItems.length - 1] || null;
        }

        getActiveTodoItem() {
            if (this.selectedTodoItem && this.todoItems.includes(this.selectedTodoItem)) return this.selectedTodoItem;
            return this.todoItems[this.todoItems.length - 1] || null;
        }

        drawTextItem(item) {
            this.ctx.save();
            this.ctx.fillStyle = item.color;
            this.ctx.textBaseline = 'top';
            this.ctx.font = `${item.italic ? 'italic ' : ''}${item.bold ? '900' : '700'} ${item.size}px ${item.family || DEFAULT_FONT}`;
            item.text.split(/\n+/).forEach((line, index) => this.ctx.fillText(line, item.x, item.y + index * (item.size + 6)));
            this.ctx.restore();
        }

        drawTodoItem(item) {
            const box = Math.max(12, Math.round(item.size * 0.85));
            this.ctx.save();
            this.ctx.strokeStyle = item.color;
            this.ctx.fillStyle = item.color;
            this.ctx.lineWidth = Math.max(2, Math.round(item.size / 12));
            this.ctx.strokeRect(item.x, item.y + 3, box, box);
            if (item.checked) {
                this.ctx.beginPath();
                this.ctx.moveTo(item.x + 3, item.y + box * 0.55);
                this.ctx.lineTo(item.x + box * 0.4, item.y + box);
                this.ctx.lineTo(item.x + box + 4, item.y + 2);
                this.ctx.stroke();
            }
            this.ctx.font = `${item.italic ? 'italic ' : ''}${item.bold ? '900' : '700'} ${item.size}px ${DEFAULT_FONT}`;
            this.ctx.textBaseline = 'top';
            this.ctx.fillText(item.text, item.x + box + 12, item.y);
            if (this.showTodoDeleteButtons) {
                this.ctx.fillStyle = '#d70015';
                this.ctx.fillRect(item.x + box + 18 + this.ctx.measureText(item.text).width, item.y + 2, 22, 22);
                this.ctx.fillStyle = '#fff';
                this.ctx.fillText('×', item.x + box + 24 + this.ctx.measureText(item.text).width, item.y);
            }
            this.ctx.restore();
        }

        findOverlay(x, y, kind) {
            const items = kind === 'todo' ? this.todoItems : this.textItems;
            for (let i = items.length - 1; i >= 0; i -= 1) {
                const item = items[i];
                this.ctx.save();
                this.ctx.font = `${item.italic ? 'italic ' : ''}${item.bold ? '900' : '700'} ${item.size}px ${item.family || DEFAULT_FONT}`;
                const width = this.ctx.measureText(item.text).width + (kind === 'todo' ? item.size + 42 : 0);
                const height = item.size * Math.max(1, item.text.split(/\n+/).length) + 8;
                this.ctx.restore();
                const hit = x >= item.x && x <= item.x + width && y >= item.y && y <= item.y + height;
                if (!hit) continue;
                if (kind === 'todo' && x >= item.x + width - 26) return { kind, item, deleteHit: true };
                return { kind, item };
            }
            return null;
        }

        deleteTodo(item) {
            this.todoItems = this.todoItems.filter((todo) => todo !== item);
            this.redrawAll(true);
        }

        deleteSelectedOverlay() {
            if (this.dragTarget?.kind === 'text') this.textItems = this.textItems.filter((item) => item !== this.dragTarget.item);
            if (this.dragTarget?.kind === 'todo') this.todoItems = this.todoItems.filter((item) => item !== this.dragTarget.item);
            this.dragTarget = null;
            this.redrawAll(true);
        }

        createSchedule(options = {}) {
            const shouldCommit = options.commit !== false;
            const shouldSave = options.save !== false;
            const days = Math.max(1, Math.min(7, Number($('#schedule-days')?.value) || 5));
            const classes = Math.max(1, Math.min(12, Number($('#schedule-classes')?.value) || 6));
            const padding = Math.max(8, Math.floor(Math.min(this.canvas.width, this.canvas.height) * 0.04));
            this.schedule = {
                days,
                classes,
                x: padding,
                y: padding,
                cellWidth: Math.max(30, Math.floor((this.canvas.width - padding * 2) / (days + 1))),
                cellHeight: Math.max(20, Math.floor((this.canvas.height - padding * 2) / (classes + 1))),
                fontSize: Number($('#schedule-font-size')?.value) || 12,
                color: $('#schedule-color')?.value || '#000000',
                cellFontSizes: [],
                data: []
            };
            for (let row = 0; row <= classes; row += 1) {
                this.schedule.data[row] = [];
                this.schedule.cellFontSizes[row] = [];
                for (let col = 0; col <= days; col += 1) {
                    this.schedule.cellFontSizes[row][col] = this.schedule.fontSize;
                    if (row === 0 && col === 0) this.schedule.data[row][col] = '';
                    else if (row === 0) this.schedule.data[row][col] = WEEKDAYS[col - 1];
                    else if (col === 0) this.schedule.data[row][col] = `第${row}节`;
                    else this.schedule.data[row][col] = '';
                }
            }
            this.selectedScheduleCell = null;
            delete document.body.dataset.epdScheduleSelectedCell;
            if (shouldSave) this.saveSchedule();
            this.redrawAll(shouldCommit);
        }

        drawSchedule() {
            if (!this.schedule) return;
            const s = this.schedule;
            const rows = s.classes + 1;
            const cols = s.days + 1;
            const tableWidth = cols * s.cellWidth;
            const tableHeight = rows * s.cellHeight;
            this.ctx.save();
            this.ctx.strokeStyle = s.color;
            this.ctx.fillStyle = s.color;
            this.ctx.lineWidth = 1.5;
            for (let row = 0; row <= rows; row += 1) {
                this.drawSolidLine(s.x, s.y + row * s.cellHeight, tableWidth + 1, 1, s.color);
            }
            for (let col = 0; col <= cols; col += 1) {
                this.drawSolidLine(s.x + col * s.cellWidth, s.y, 1, tableHeight + 1, s.color);
            }
            if (this.showScheduleCellIndicator && this.selectedScheduleCell) {
                const { row, col } = this.selectedScheduleCell;
                const x = s.x + col * s.cellWidth;
                const y = s.y + row * s.cellHeight;
                this.ctx.save();
                this.ctx.fillStyle = 'rgba(0, 102, 204, 0.18)';
                this.ctx.fillRect(x + 2, y + 2, Math.max(1, s.cellWidth - 3), Math.max(1, s.cellHeight - 3));
                this.ctx.restore();
            }
            for (let row = 0; row < rows; row += 1) {
                for (let col = 0; col < cols; col += 1) {
                    const text = s.data?.[row]?.[col] || '';
                    if (!text) continue;
                    const x = s.x + col * s.cellWidth;
                    const y = s.y + row * s.cellHeight;
                    const baseFontSize = s.cellFontSizes?.[row]?.[col] || s.fontSize;
                    const fitted = this.fitTextToBox(
                        text,
                        baseFontSize,
                        DEFAULT_FONT,
                        s.cellWidth - Math.max(6, Math.floor(s.cellWidth * 0.16)),
                        s.cellHeight - Math.max(4, Math.floor(s.cellHeight * 0.16))
                    );
                    this.ctx.font = `${row === 0 || col === 0 ? '700' : '500'} ${fitted.fontSize}px ${DEFAULT_FONT}`;
                    this.ctx.fillStyle = s.color;
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    const startY = y + s.cellHeight / 2 - ((fitted.lines.length - 1) * fitted.lineHeight) / 2;
                    fitted.lines.forEach((line, index) => {
                        this.ctx.fillText(line, x + s.cellWidth / 2, startY + index * fitted.lineHeight);
                    });
                }
            }
            if (this.showScheduleCellIndicator && this.selectedScheduleCell) {
                const { row, col } = this.selectedScheduleCell;
                const x = s.x + col * s.cellWidth;
                const y = s.y + row * s.cellHeight;
                this.ctx.save();
                this.ctx.strokeStyle = '#0066cc';
                this.ctx.lineWidth = 3;
                this.ctx.strokeRect(x + 1.5, y + 1.5, Math.max(1, s.cellWidth - 3), Math.max(1, s.cellHeight - 3));
                this.ctx.fillStyle = '#0066cc';
                this.ctx.beginPath();
                this.ctx.arc(x + s.cellWidth - 11, y + 12, 9, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = `700 10px ${DEFAULT_FONT}`;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText('选', x + s.cellWidth - 11, y + 12);
                this.ctx.restore();
            }
            this.ctx.restore();
        }

        findScheduleCell(x, y) {
            if (!this.schedule) return null;
            const s = this.schedule;
            const col = Math.floor((x - s.x) / s.cellWidth);
            const row = Math.floor((y - s.y) / s.cellHeight);
            if (col < 0 || col > s.days || row < 0 || row > s.classes) return null;
            return { row, col };
        }

        selectScheduleCell(cell) {
            this.selectedScheduleCell = cell;
            document.body.dataset.epdScheduleSelectedCell = `${cell.row},${cell.col}`;
            $('#schedule-input').value = this.schedule.data[cell.row][cell.col] || '';
            this.redrawAll(false);
            $('#schedule-input')?.focus();
        }

        confirmScheduleInput() {
            if (!this.schedule || !this.selectedScheduleCell) return;
            const { row, col } = this.selectedScheduleCell;
            this.schedule.data[row][col] = $('#schedule-input').value.trim();
            this.saveSchedule();
            this.redrawAll(true);
        }

        cancelScheduleInput() {
            this.selectedScheduleCell = null;
            delete document.body.dataset.epdScheduleSelectedCell;
            $('#schedule-input').value = '';
            this.redrawAll(false);
        }

        adjustScheduleFont(delta) {
            if (!this.schedule) return;
            this.schedule.fontSize = Math.max(6, Math.min(48, this.schedule.fontSize + delta));
            $('#schedule-font-size').value = this.schedule.fontSize;
            if (this.selectedScheduleCell && this.schedule.cellFontSizes) {
                const { row, col } = this.selectedScheduleCell;
                this.schedule.cellFontSizes[row][col] = this.schedule.fontSize;
            }
            this.saveSchedule();
            this.redrawAll(true);
        }

        moveSchedule(dx, dy) {
            if (!this.schedule) return;
            const tableWidth = (this.schedule.days + 1) * this.schedule.cellWidth;
            const tableHeight = (this.schedule.classes + 1) * this.schedule.cellHeight;
            this.schedule.x = Math.max(0, Math.min(this.canvas.width - tableWidth, this.schedule.x + dx));
            this.schedule.y = Math.max(0, Math.min(this.canvas.height - tableHeight, this.schedule.y + dy));
            this.saveSchedule();
            this.redrawAll(true);
        }

        zoomSchedule(factor) {
            if (!this.schedule) return;
            this.schedule.cellWidth = Math.max(32, Math.round(this.schedule.cellWidth * factor));
            this.schedule.cellHeight = Math.max(20, Math.round(this.schedule.cellHeight * factor));
            this.moveSchedule(0, 0);
            this.saveSchedule();
            this.redrawAll(true);
        }

        renderMatterTables() {
            this.renderMatterTable('#matter-limit-table tbody', this.matterLimits, [
                { key: 'name', type: 'text' },
                { key: 'value', type: 'number', min: 0, max: 999 },
                { key: 'endDate', type: 'date' }
            ]);
            this.renderMatterTable('#matter-todo-table tbody', this.matterTodos, [
                { key: 'name', type: 'text' },
                { key: 'extra', type: 'select', options: ['高', '中', '低'] }
            ]);
            this.renderMatterTable('#matter-schedule-table tbody', this.matterSchedules, [
                { key: 'itemclass', type: 'text' },
                { key: 'activity', type: 'text' }
            ]);
        }

        renderMatterTable(selector, rows, fields) {
            const tbody = $(selector);
            if (!tbody) return;
            tbody.innerHTML = '';
            rows.forEach((row, index) => {
                const tr = document.createElement('tr');
                fields.forEach((field) => {
                    const td = document.createElement('td');
                    const input = field.type === 'select' ? document.createElement('select') : document.createElement('input');
                    if (field.type === 'select') {
                        field.options.forEach((optionValue) => {
                            const option = document.createElement('option');
                            option.value = optionValue;
                            option.textContent = optionValue;
                            option.selected = (row[field.key] || '') === optionValue;
                            input.appendChild(option);
                        });
                    } else {
                        input.type = field.type;
                        if (field.min != null) input.min = field.min;
                        if (field.max != null) input.max = field.max;
                        input.value = row[field.key] || '';
                    }
                    input.addEventListener('input', () => {
                        row[field.key] = input.value;
                        this.saveMatter();
                        if (this.tool === 'matter') this.renderMatterTemplate({ commit: true, save: false });
                    });
                    td.appendChild(input);
                    tr.appendChild(td);
                });
                const td = document.createElement('td');
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'matter-delete';
                btn.textContent = '删';
                btn.addEventListener('click', () => {
                    rows.splice(index, 1);
                    this.saveMatter();
                    this.renderMatterTables();
                    if (this.tool === 'matter') this.renderMatterTemplate({ commit: true, save: false });
                });
                td.appendChild(btn);
                tr.appendChild(td);
                tbody.appendChild(tr);
            });
        }

        renderMatterTemplate(options = {}) {
            const shouldCommit = options.commit !== false;
            const shouldSave = options.save !== false;
            this.clearElements();
            this.ctx.save();
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.scale(this.canvas.width / 400, this.canvas.height / 300);
            this.drawMatterTemplateBase();
            this.ctx.restore();
            this.setBaseImageData();
            if (shouldSave) this.saveMatter();
            if (shouldCommit) {
                this.saveHistory();
                this.commit();
            }
        }

        ensureDefaultMatterData() {
            if (!this.matterLimits.length) this.matterLimits = [{ name: '重要事项', value: '30', endDate: this.todayIsoDate() }];
            if (!this.matterTodos.length) this.matterTodos = [{ name: '新待办', extra: '中' }];
            if (!this.matterSchedules.length) this.matterSchedules = [{ itemclass: '日程', activity: '新活动' }];
            this.renderMatterTables();
        }

        todayIsoDate() {
            return new Date().toISOString().split('T')[0];
        }

        matterDaysDiff(targetDateStr) {
            const targetDate = new Date(targetDateStr);
            if (Number.isNaN(targetDate.getTime())) return 0;
            const now = new Date();
            return Math.max(0, Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24)));
        }

        formatMatterDays(days) {
            if (days > 365) return `${Math.floor(days / 365)}年`;
            if (days > 90) return `${Math.floor(days / 30)}月`;
            return `${days}天`;
        }

        drawRoundRect(x, y, width, height, radius, fillStyle, strokeStyle = '#000000', lineWidth = 1) {
            this.ctx.save();
            this.ctx.beginPath();
            if (typeof this.ctx.roundRect === 'function') {
                this.ctx.roundRect(x, y, width, height, radius);
            } else {
                const r = Math.min(radius, width / 2, height / 2);
                this.ctx.moveTo(x + r, y);
                this.ctx.lineTo(x + width - r, y);
                this.ctx.quadraticCurveTo(x + width, y, x + width, y + r);
                this.ctx.lineTo(x + width, y + height - r);
                this.ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
                this.ctx.lineTo(x + r, y + height);
                this.ctx.quadraticCurveTo(x, y + height, x, y + height - r);
                this.ctx.lineTo(x, y + r);
                this.ctx.quadraticCurveTo(x, y, x + r, y);
            }
            this.ctx.closePath();
            if (fillStyle) {
                this.ctx.fillStyle = fillStyle;
                this.ctx.fill();
            }
            if (strokeStyle) {
                this.ctx.strokeStyle = strokeStyle;
                this.ctx.lineWidth = lineWidth;
                this.ctx.stroke();
            }
            this.ctx.restore();
        }

        drawFittedText(text, x, y, maxWidth, font, color = '#000000', align = 'left', baseline = 'top') {
            const value = String(text ?? '');
            this.ctx.save();
            this.ctx.font = font;
            this.ctx.fillStyle = color;
            this.ctx.textAlign = align;
            this.ctx.textBaseline = baseline;
            let output = value;
            while (output.length > 1 && this.ctx.measureText(output).width > maxWidth) {
                output = output.slice(0, -1);
            }
            if (output !== value && output.length > 1) output = `${output.slice(0, -1)}…`;
            this.ctx.fillText(output, x, y);
            this.ctx.restore();
        }

        drawInlineText(parts, centerX, y, fallbackFont, baseline = 'middle') {
            this.ctx.save();
            this.ctx.textAlign = 'left';
            this.ctx.textBaseline = baseline;
            const totalWidth = parts.reduce((sum, part) => {
                this.ctx.font = part.font || fallbackFont;
                return sum + this.ctx.measureText(part.text).width;
            }, 0);
            let x = centerX - totalWidth / 2;
            parts.forEach((part) => {
                this.ctx.font = part.font || fallbackFont;
                this.ctx.fillStyle = part.color || '#000000';
                this.ctx.fillText(part.text, x, y);
                x += this.ctx.measureText(part.text).width;
            });
            this.ctx.restore();
        }

        getMatterPalette() {
            const driverValue = $('#driver-select')?.value || '';
            const driverMode = window.EPD_APP_CONFIG?.DRIVER_CONFIG?.[driverValue]?.colorMode;
            const mode = driverMode || $('#ditherMode')?.value || 'blackWhiteColor';
            const palettes = {
                blackWhiteColor: {
                    title: '#000000', dateNumber: '#000000', weekFill: '#000000', weekText: '#ffffff',
                    todoHeaderFill: '#000000', todoHeaderText: '#ffffff',
                    limitHeaderFill: '#000000', limitHeaderText: '#ffffff',
                    scheduleHeaderFill: '#000000', scheduleHeaderText: '#ffffff',
                    priorityHighText: '#000000', overflowText: '#000000',
                    urgentFill: '#000000', urgentText: '#ffffff',
                    normalChipFill: '#000000', normalChipText: '#ffffff',
                    scheduleClassText: '#000000'
                },
                threeColor: {
                    title: '#cc0000', dateNumber: '#cc0000', weekFill: '#cc0000', weekText: '#ffffff',
                    todoHeaderFill: '#cc0000', todoHeaderText: '#ffffff',
                    limitHeaderFill: '#000000', limitHeaderText: '#ffffff',
                    scheduleHeaderFill: '#cc0000', scheduleHeaderText: '#ffffff',
                    priorityHighText: '#cc0000', overflowText: '#cc0000',
                    urgentFill: '#cc0000', urgentText: '#ffffff',
                    normalChipFill: '#000000', normalChipText: '#ffffff',
                    scheduleClassText: '#cc0000'
                },
                fourColor: {
                    title: '#cc0000', dateNumber: '#cc0000', weekFill: '#ffff00', weekText: '#000000',
                    todoHeaderFill: '#cc0000', todoHeaderText: '#ffffff',
                    limitHeaderFill: '#ffff00', limitHeaderText: '#000000',
                    scheduleHeaderFill: '#000000', scheduleHeaderText: '#ffffff',
                    priorityHighText: '#cc0000', overflowText: '#cc0000',
                    urgentFill: '#cc0000', urgentText: '#ffffff',
                    normalChipFill: '#ffff00', normalChipText: '#000000',
                    scheduleClassText: '#cc0000'
                }
            };
            return palettes[mode] || palettes.blackWhiteColor;
        }

        drawMatterTemplateBase() {
            const palette = this.getMatterPalette();
            const black = '#000000';
            const fontFamily = DEFAULT_FONT;
            const now = new Date();
            const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(0, 0, 400, 300);
            this.drawRoundRect(8, 8, 384, 40, 5, '#ffffff', black);
            this.drawSolidLine(205, 12, 1, 32, black);
            const numberFont = `bold 21px ${fontFamily}`;
            const unitFont = `bold 14px ${fontFamily}`;
            this.drawInlineText([
                { text: String(now.getFullYear()), color: palette.dateNumber, font: numberFont },
                { text: '年', color: black, font: unitFont },
                { text: String(now.getMonth() + 1), color: palette.dateNumber, font: numberFont },
                { text: '月', color: black, font: unitFont },
                { text: String(now.getDate()), color: palette.dateNumber, font: numberFont },
                { text: '日', color: black, font: unitFont }
            ], 74, 28, unitFont);
            this.drawRoundRect(156, 19, 42, 19, 3, palette.weekFill, palette.weekFill);
            this.drawFittedText(weekDays[now.getDay()], 177, 28, 36, `bold 13px ${fontFamily}`, palette.weekText, 'center', 'middle');
            this.drawFittedText('事项看板', 298, 28, 168, `bold 26px ${fontFamily}`, palette.title, 'center', 'middle');

            const sortedLimits = [...this.matterLimits].sort((a, b) => this.matterDaysDiff(a.endDate) - this.matterDaysDiff(b.endDate));
            const contentTop = 54;
            const contentBottom = 292;
            const gap = 8;
            const scheduleRowsWanted = Math.max(1, this.matterSchedules.length);
            const scheduleHeight = Math.max(46, Math.min(112, 28 + scheduleRowsWanted * 22));
            const topHeight = contentBottom - contentTop - gap - scheduleHeight;
            const headerHeight = 24;
            const bodyY = contentTop + headerHeight + 6;
            const bodyHeight = topHeight - headerHeight - 10;

            this.drawRoundRect(8, contentTop, 228, topHeight, 4, '#ffffff', black);
            this.drawRoundRect(8, contentTop, 228, headerHeight, 3, palette.todoHeaderFill, palette.todoHeaderFill);
            this.drawFittedText('待办事项', 122, contentTop + 3, 210, `bold 18px ${fontFamily}`, palette.todoHeaderText, 'center');
            const todoRowHeight = Math.max(14, Math.min(24, Math.floor(bodyHeight / Math.max(1, this.matterTodos.length))));
            const todoFontSize = Math.max(11, Math.min(17, todoRowHeight - 5));
            const visibleTodos = this.matterTodos.slice(0, Math.floor(bodyHeight / todoRowHeight));
            visibleTodos.forEach((item, index) => {
                const y = bodyY + index * todoRowHeight;
                this.drawSolidLine(14, y + todoRowHeight - 3, 216, 1, black);
                this.drawFittedText(item.name, 16, y + 1, 154, `bold ${todoFontSize}px ${fontFamily}`, black);
                this.drawFittedText(item.extra, 226, y + 1, 48, `bold ${todoFontSize}px ${fontFamily}`, item.extra === '高' ? palette.priorityHighText : black, 'right');
            });
            if (this.matterTodos.length > visibleTodos.length) {
                this.drawFittedText(`+${this.matterTodos.length - visibleTodos.length}项`, 226, contentTop + topHeight - 17, 60, `bold 12px ${fontFamily}`, palette.overflowText, 'right');
            }

            this.drawRoundRect(244, contentTop, 148, topHeight, 4, '#ffffff', black);
            this.drawRoundRect(244, contentTop, 148, headerHeight, 3, palette.limitHeaderFill, palette.limitHeaderFill);
            this.drawFittedText('限时事项', 318, contentTop + 3, 130, `bold 17px ${fontFamily}`, palette.limitHeaderText, 'center');
            const limitRowHeight = Math.max(18, Math.min(29, Math.floor(bodyHeight / Math.max(1, sortedLimits.length))));
            const limitFontSize = Math.max(11, Math.min(14, limitRowHeight - 10));
            const visibleLimits = sortedLimits.slice(0, Math.floor(bodyHeight / limitRowHeight));
            visibleLimits.forEach((item, index) => {
                const y = bodyY + index * limitRowHeight;
                const days = this.matterDaysDiff(item.endDate);
                const ahead = parseInt(item.value, 10) || 0;
                const urgent = days <= ahead;
                const chipHeight = Math.max(14, limitRowHeight - 6);
                this.drawRoundRect(249, y, 138, limitRowHeight - 3, 3, '#ffffff', black);
                this.drawRoundRect(252, y + 3, 66, chipHeight, 2, urgent ? palette.urgentFill : palette.normalChipFill, urgent ? palette.urgentFill : palette.normalChipFill);
                this.drawFittedText(item.name, 285, y + 5, 60, `bold ${limitFontSize}px ${fontFamily}`, urgent ? palette.urgentText : palette.normalChipText, 'center');
                this.drawFittedText(this.formatMatterDays(days), 384, y + 5, 62, `bold ${Math.min(14, limitFontSize + 1)}px ${fontFamily}`, urgent ? palette.priorityHighText : black, 'right');
            });
            if (sortedLimits.length > visibleLimits.length) {
                this.drawFittedText(`+${sortedLimits.length - visibleLimits.length}项`, 384, contentTop + topHeight - 17, 62, `bold 12px ${fontFamily}`, palette.overflowText, 'right');
            }

            const scheduleY = contentTop + topHeight + gap;
            const scheduleHeaderHeight = 20;
            const scheduleBodyY = scheduleY + scheduleHeaderHeight + 5;
            const scheduleBodyHeight = scheduleHeight - scheduleHeaderHeight - 8;
            this.drawRoundRect(8, scheduleY, 384, scheduleHeight, 4, '#ffffff', black);
            this.drawRoundRect(8, scheduleY, 384, scheduleHeaderHeight, 3, palette.scheduleHeaderFill, palette.scheduleHeaderFill);
            this.drawFittedText('今日日程', 200, scheduleY + 2, 360, `bold 15px ${fontFamily}`, palette.scheduleHeaderText, 'center');
            const scheduleRowHeight = Math.max(16, Math.min(22, Math.floor(scheduleBodyHeight / Math.max(1, this.matterSchedules.length))));
            const scheduleFontSize = Math.max(11, Math.min(15, scheduleRowHeight - 5));
            const visibleSchedules = this.matterSchedules.slice(0, Math.floor(scheduleBodyHeight / scheduleRowHeight));
            visibleSchedules.forEach((item, index) => {
                const y = scheduleBodyY + index * scheduleRowHeight;
                this.drawSolidLine(14, y + scheduleRowHeight - 3, 372, 1, black);
                this.drawFittedText(item.itemclass, 16, y + 1, 96, `bold ${scheduleFontSize}px ${fontFamily}`, palette.scheduleClassText);
                this.drawFittedText(item.activity, 116, y + 1, 228, `${scheduleFontSize}px ${fontFamily}`, black);
            });
            if (this.matterSchedules.length > visibleSchedules.length) {
                this.drawFittedText(`+${this.matterSchedules.length - visibleSchedules.length}项`, 384, scheduleY + scheduleHeight - 17, 44, `bold 12px ${fontFamily}`, palette.overflowText, 'right');
            }
        }

        drawMatterSection(title, lines, x, y, color) {
            this.ctx.fillStyle = color;
            this.ctx.font = `800 22px ${DEFAULT_FONT}`;
            this.ctx.fillText(title, x, y);
            y += 30;
            this.ctx.fillStyle = '#000000';
            this.ctx.font = `600 18px ${DEFAULT_FONT}`;
            (lines.length ? lines : ['--']).forEach((line) => {
                this.ctx.fillText(`• ${line}`, x + 18, y);
                y += 28;
            });
            return y + 10;
        }

        drawSolidLine(x, y, width, height, color = '#000000') {
            this.ctx.save();
            this.ctx.fillStyle = color;
            this.ctx.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(width)), Math.max(1, Math.round(height)));
            this.ctx.restore();
        }

        fitTextToBox(text, baseFontSize, fontFamily, maxWidth, maxHeight) {
            const value = String(text ?? '');
            const explicitLines = value.split(/\n+/).filter(Boolean);
            const words = explicitLines.length ? explicitLines : [value];
            for (let fontSize = Math.min(48, Math.max(6, baseFontSize)); fontSize >= 6; fontSize -= 1) {
                this.ctx.font = `700 ${fontSize}px ${fontFamily}`;
                const lineHeight = Math.max(fontSize + 2, Math.round(fontSize * 1.18));
                const lines = [];
                words.forEach((rawLine) => {
                    let current = '';
                    Array.from(rawLine).forEach((char) => {
                        const next = current + char;
                        if (current && this.ctx.measureText(next).width > maxWidth) {
                            lines.push(current);
                            current = char;
                        } else {
                            current = next;
                        }
                    });
                    if (current || !lines.length) lines.push(current);
                });
                if (lines.length * lineHeight <= maxHeight && lines.every((line) => this.ctx.measureText(line).width <= maxWidth)) {
                    return { fontSize, lineHeight, lines };
                }
            }
            return { fontSize: 6, lineHeight: 8, lines: [value.slice(0, Math.max(1, Math.floor(maxWidth / 6)))] };
        }

        wrapText(text, x, y, maxWidth, lineHeight, align = 'left') {
            const lines = String(text).split(/\n+/);
            const oldAlign = this.ctx.textAlign;
            this.ctx.textAlign = align;
            const startY = y - ((lines.length - 1) * lineHeight) / 2;
            lines.forEach((line, index) => this.ctx.fillText(line, x, startY + index * lineHeight, maxWidth));
            this.ctx.textAlign = oldAlign;
        }

        redrawAll(commit = false) {
            if (this.baseImageData) this.ctx.putImageData(this.baseImageData, 0, 0);
            this.lineItems.forEach((line) => {
                this.ctx.save();
                this.ctx.lineCap = 'round';
                this.ctx.lineJoin = 'round';
                this.ctx.lineWidth = line.size;
                this.ctx.strokeStyle = line.color;
                this.ctx.beginPath();
                this.ctx.moveTo(line.x1, line.y1);
                this.ctx.lineTo(line.x2, line.y2);
                this.ctx.stroke();
                this.ctx.restore();
            });
            this.drawSchedule();
            this.textItems.forEach((item) => this.drawTextItem(item));
            this.todoItems.forEach((item) => this.drawTodoItem(item));
            if (commit) {
                this.saveHistory();
                this.commit();
            }
        }

        setBaseImageData() {
            this.baseImageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        }

        resetToBlankBase(commit = true) {
            this.toolStates.clear();
            this.clearElements();
            this.ctx.save();
            this.ctx.setTransform(1, 0, 0, 1, 0, 0);
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.restore();
            this.setBaseImageData();
            if (commit) {
                this.saveHistory();
                this.commit();
            }
        }

        captureCurrentCanvasAsBase(clearOverlays = true) {
            this.toolStates.clear();
            if (clearOverlays) this.clearElements();
            this.setBaseImageData();
            this.saveHistory();
        }

        hasEditorContent() {
            return Boolean(this.textItems.length || this.todoItems.length || this.lineItems.length || this.schedule);
        }

        saveBaseForFreehand() {
            if (!this.baseImageData) this.setBaseImageData();
        }

        clearElements() {
            this.textItems = [];
            this.todoItems = [];
            this.lineItems = [];
            this.selectedTextItem = null;
            this.selectedTodoItem = null;
            this.schedule = null;
            this.selectedScheduleCell = null;
        }

        clearCanvas() {
            this.toolStates.clear();
            this.clearElements();
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.setBaseImageData();
            this.saveHistory();
            this.commit();
        }

        saveHistory() {
            const snapshot = this.createSnapshot();
            this.history = this.history.slice(0, this.historyIndex + 1);
            this.history.push(snapshot);
            if (this.history.length > this.maxHistory) this.history.shift();
            this.historyIndex = this.history.length - 1;
            this.updateHistoryButtons();
            this.saveCurrentToolState();
        }

        createSnapshot() {
            return {
                imageData: this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height),
                textItems: structuredCloneSafe(this.textItems),
                todoItems: structuredCloneSafe(this.todoItems),
                lineItems: structuredCloneSafe(this.lineItems),
                schedule: structuredCloneSafe(this.schedule),
                baseImageData: this.baseImageData ? new ImageData(new Uint8ClampedArray(this.baseImageData.data), this.baseImageData.width, this.baseImageData.height) : null
            };
        }

        restoreSnapshot(snapshot, doCommit = true) {
            this.ctx.putImageData(snapshot.imageData, 0, 0);
            this.textItems = structuredCloneSafe(snapshot.textItems);
            this.todoItems = structuredCloneSafe(snapshot.todoItems);
            this.lineItems = structuredCloneSafe(snapshot.lineItems);
            this.schedule = structuredCloneSafe(snapshot.schedule);
            this.selectedTextItem = null;
            this.selectedTodoItem = null;
            this.baseImageData = snapshot.baseImageData ? new ImageData(new Uint8ClampedArray(snapshot.baseImageData.data), snapshot.baseImageData.width, snapshot.baseImageData.height) : null;
            this.toolStates.set(this.tool, this.createSnapshot());
            if (doCommit) this.commit();
        }

        restoreHistory(snapshot) {
            this.restoreSnapshot(snapshot, false);
            this.updateHistoryButtons();
            this.commit();
        }

        undo() {
            if (this.historyIndex <= 0) return;
            this.historyIndex -= 1;
            this.restoreHistory(this.history[this.historyIndex]);
        }

        redo() {
            if (this.historyIndex >= this.history.length - 1) return;
            this.historyIndex += 1;
            this.restoreHistory(this.history[this.historyIndex]);
        }

        updateHistoryButtons() {
            if ($('#undo-btn')) $('#undo-btn').disabled = this.historyIndex <= 0;
            if ($('#redo-btn')) $('#redo-btn').disabled = this.historyIndex >= this.history.length - 1;
        }

        saveSchedule() {
            try { localStorage.setItem('epdScheduleCache', JSON.stringify(this.schedule)); } catch (_) {}
        }

        loadSchedule() {
            try {
                const raw = localStorage.getItem('epdScheduleCache');
                if (raw) this.schedule = JSON.parse(raw);
            } catch (_) {}
        }

        saveMatter() {
            try {
                localStorage.setItem('epdMatterCache', JSON.stringify({
                    limits: this.matterLimits,
                    todos: this.matterTodos,
                    schedules: this.matterSchedules
                }));
            } catch (_) {}
        }

        loadMatter() {
            try {
                const raw = localStorage.getItem('epdMatterCache');
                if (!raw) return;
                const data = JSON.parse(raw);
                this.matterLimits = (data.limits || []).map((item) => ({
                    name: item.name || '重要事项',
                    value: item.value || item.remind || '30',
                    endDate: item.endDate || item.deadline || this.todayIsoDate()
                }));
                this.matterTodos = (data.todos || []).map((item) => ({
                    name: item.name || item.text || '新待办',
                    extra: item.extra || item.level || '中'
                }));
                this.matterSchedules = (data.schedules || []).map((item) => ({
                    itemclass: item.itemclass || item.category || '日程',
                    activity: item.activity || item.text || '新活动'
                }));
            } catch (_) {}
        }

        commit() {
            if (typeof window.EPD_EDITOR_COMMIT === 'function') window.EPD_EDITOR_COMMIT(this.canvas, { preserveVisible: true });
        }
    }

    function structuredCloneSafe(value) {
        return value == null ? value : JSON.parse(JSON.stringify(value));
    }

    function initPaintManager() {
        if (window.EPD_PAINT_MANAGER) return;
        const canvas = $('#image-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        const manager = new PaintManager(canvas, ctx);
        window.EPD_PAINT_MANAGER = manager;
        manager.init();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPaintManager);
    } else {
        initPaintManager();
    }
})();
