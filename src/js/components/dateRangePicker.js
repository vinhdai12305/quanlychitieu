export class DateRangePicker {
    constructor(elementId, options = {}) {
        this.elementId = elementId;
        this.options = options; // { onApply: (start, end) => {} }
        this.picker = null;
        this.startDate = new Date();
        this.endDate = new Date();
        this.today = new Date();

        // Preset ranges
        this.presets = {
            last7Days: { label: '7 ngày qua', start: () => this.addDays(new Date(), -6), end: () => new Date() },
            last30Days: { label: '30 ngày qua', start: () => this.addDays(new Date(), -29), end: () => new Date() },
            thisMonth: {
                label: 'Tháng này',
                start: () => new Date(this.today.getFullYear(), this.today.getMonth(), 1),
                end: () => new Date(this.today.getFullYear(), this.today.getMonth() + 1, 0)
            },
            lastMonth: {
                label: 'Tháng trước',
                start: () => new Date(this.today.getFullYear(), this.today.getMonth() - 1, 1),
                end: () => new Date(this.today.getFullYear(), this.today.getMonth(), 0)
            },
            custom: { label: 'Tùy chỉnh', start: null, end: null }
        };

        this.currentPreset = 'thisMonth';
        this.init();
    }

    addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    formatDate(date) {
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    init() {
        this.renderUI();
        this.initLitepicker();
        this.bindEvents();

        // Initial set
        const preset = this.presets[this.currentPreset];
        this.setDateRange(preset.start(), preset.end(), this.currentPreset);
    }

    renderUI() {
        const container = document.getElementById(this.elementId);
        if (!container) return;

        container.innerHTML = `
            <div class="relative inline-block text-left">
                <button id="daterange-btn" type="button" class="group bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:border-emerald-500 hover:text-emerald-600 transition-all flex items-center gap-3 min-w-[220px] justify-between cursor-pointer">
                    <div class="flex items-center gap-2 pointer-events-none">
                        <span class="material-symbols-outlined text-[20px] text-gray-400 group-hover:text-emerald-500">calendar_today</span>
                        <span id="selected-range-text">...</span>
                    </div>
                    <span id="range-arrow" class="material-symbols-outlined text-[20px] text-gray-400 transition-transform duration-300">expand_more</span>
                </button>

                <!-- Dropdown Panel -->
                <div id="daterange-dropdown" class="hidden absolute right-0 mt-3 bg-white border border-gray-100 rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] z-50 flex flex-col md:flex-row w-[340px] md:w-[750px] origin-top-right transition-all duration-200 opacity-0 scale-95 ring-1 ring-black/5">
                    
                    <!-- Sidebar Presets -->
                    <div class="w-full md:w-56 bg-gray-50/80 border-b md:border-b-0 md:border-r border-gray-100 p-3 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible no-scrollbar shrink-0">
                        ${Object.entries(this.presets).map(([key, item]) => `
                            <button data-preset="${key}" class="preset-btn w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-gray-600 hover:bg-white hover:shadow-sm hover:text-emerald-600 transition-all whitespace-nowrap ${key === this.currentPreset ? 'bg-white shadow-sm text-emerald-600 ring-1 ring-emerald-100' : ''}">
                                ${item.label}
                            </button>
                        `).join('')}
                    </div>

                    <!-- Main Calendar Area -->
                    <div class="flex-1 p-4 md:p-6 overflow-hidden">
                        <div id="litepicker-container" class="mb-4 text-sm"></div>
                        
                        <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-50">
                            <button id="daterange-cancel" class="px-5 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-lg transition-colors">Hủy</button>
                            <button id="daterange-apply" class="px-5 py-2.5 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-200 rounded-lg transition-all flex items-center gap-2">
                                <span class="material-symbols-rounded text-[18px]">check</span> Áp dụng
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Styled overlays for Litepicker custom css overrides -->
            <style>
                /* Force Litepicker to fit and style correctly */
                .litepicker { 
                    font-family: 'Inter', sans-serif !important; 
                    border: none !important; 
                    box-shadow: none !important; 
                    width: 100% !important; 
                    display: block !important;
                }
                .litepicker .container__months { 
                    box-shadow: none !important; 
                    background: transparent; 
                    width: 100% !important;
                    display: flex !important;
                    justify-content: space-between;
                }
                .litepicker .container__months .month-item { 
                    width: 48% !important; /* Ensure 2 months fit side-by-side with gap */
                }
                /* Hide default litepicker footer */
                .litepicker .container__footer { display: none !important; }
                
                /* Day styling */
                .litepicker .container__days .day-item { 
                    border-radius: 99px !important; 
                    transition: all 0.2s; 
                    font-weight: 500; 
                    font-size: 13px; 
                    width: 36px !important; 
                    height: 36px !important;
                    line-height: 36px !important;
                    cursor: pointer !important; /* Ensure pointer cursor */
                }
                .litepicker .container__days .day-item.is-today { color: #10b981 !important; font-weight: 900; }
                .litepicker .container__days .day-item.is-in-range { background-color: #ecfdf5 !important; color: #047857 !important; }
                .litepicker .container__days .day-item.is-start-date, .litepicker .container__days .day-item.is-end-date { background-color: #10b981 !important; color: white !important; font-weight: bold; }
                .litepicker .month-item-name, .litepicker .month-item-year { font-weight: 700 !important; color: #111827; }
                .litepicker .container__days .day-item:hover { color: #10b981 !important; background-color: #ecfdf5 !important; box-shadow: none !important; }

                /* Prevent text selection which can feel buggy */
                .litepicker { user-select: none; }
                
                /* Mobile tweaks */
                @media (max-width: 768px) {
                    .litepicker .container__months { flex-direction: column; }
                    .litepicker .container__months .month-item { width: 100% !important; }
                }
            </style>
        `;
    }

    initLitepicker() {
        this.picker = new Litepicker({
            element: document.getElementById('litepicker-container'),
            singleMode: false,
            inlineMode: true,
            numberOfMonths: 2,
            numberOfColumns: 2,
            autoApply: false,
            lang: 'vi-VN',
            format: 'DD/MM/YYYY',
            startDate: this.startDate,
            endDate: this.endDate,
            setup: (picker) => {
                picker.on('selected', (date1, date2) => {
                    // When user manually selects dates, switch to 'custom' preset visually
                    if (this.currentPreset !== 'custom') {
                        this.highlightPreset('custom');
                    }
                });
            }
        });
    }

    bindEvents() {
        const btn = document.getElementById('daterange-btn');
        const dropdown = document.getElementById('daterange-dropdown');
        const arrow = document.getElementById('range-arrow');
        const cancelBtn = document.getElementById('daterange-cancel');
        const applyBtn = document.getElementById('daterange-apply');

        const toggleDropdown = () => {
            const isHidden = dropdown.classList.contains('hidden');
            if (isHidden) {
                dropdown.classList.remove('hidden');
                // Small delay for animation
                setTimeout(() => {
                    dropdown.classList.remove('opacity-0', 'scale-95');
                    dropdown.classList.add('opacity-100', 'scale-100');
                }, 10);
                arrow.style.transform = 'rotate(180deg)';

                // Refresh picker layout just in case
                if (window.innerWidth < 768) {
                    this.picker.setOptions({ numberOfMonths: 1, numberOfColumns: 1 });
                } else {
                    this.picker.setOptions({ numberOfMonths: 2, numberOfColumns: 2 });
                }
            } else {
                dropdown.classList.add('opacity-0', 'scale-95');
                dropdown.classList.remove('opacity-100', 'scale-100');
                setTimeout(() => dropdown.classList.add('hidden'), 200);
                arrow.style.transform = 'rotate(0deg)';
            }
        };

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleDropdown();
        });

        // Prevent closing when clicking inside the dropdown
        dropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target) && !btn.contains(e.target)) {
                if (!dropdown.classList.contains('hidden')) {
                    toggleDropdown();
                }
            }
        });

        // Preset buttons
        dropdown.querySelectorAll('.preset-btn').forEach(presetBtn => {
            presetBtn.addEventListener('click', (e) => {
                const key = e.target.dataset.preset;
                this.highlightPreset(key);

                if (key !== 'custom') {
                    const preset = this.presets[key];
                    const start = preset.start();
                    const end = preset.end();
                    this.picker.setDateRange(start, end);
                }
            });
        });

        // Cancel
        cancelBtn.addEventListener('click', toggleDropdown);

        // Apply
        applyBtn.addEventListener('click', () => {
            const start = this.picker.getStartDate();
            const end = this.picker.getEndDate();

            if (start && end) {
                // Litepicker returns generic wrapper, convert to JS Date
                this.setDateRange(start.dateInstance, end.dateInstance, this.currentPreset);
                if (this.options.onApply) {
                    this.options.onApply(start.dateInstance, end.dateInstance);
                }
                toggleDropdown();
            }
        });
    }

    highlightPreset(key) {
        this.currentPreset = key;
        const btns = document.querySelectorAll('.preset-btn');
        btns.forEach(b => {
            if (b.dataset.preset === key) {
                b.className = 'preset-btn w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold bg-white shadow-sm text-emerald-600 ring-1 ring-emerald-100 whitespace-nowrap transition-all';
            } else {
                b.className = 'preset-btn w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-white hover:shadow-sm hover:text-emerald-600 whitespace-nowrap transition-all';
            }
        });
    }

    setDateRange(start, end, presetKey = 'custom') {
        this.startDate = start;
        this.endDate = end;
        this.currentPreset = presetKey;

        // Update picker internal state
        if (this.picker) {
            this.picker.setDateRange(start, end);
        }

        // Update text
        const textEl = document.getElementById('selected-range-text');

        // Custom formatting logic to match Google style (e.g. "01 thg 12 - 31 thg 12, 2025")
        const startDay = start.getDate();
        const startMonth = start.getMonth() + 1;
        const startYear = start.getFullYear();

        const endDay = end.getDate();
        const endMonth = end.getMonth() + 1;
        const endYear = end.getFullYear();

        let display = '';
        if (startYear === endYear) {
            display = `${startDay} thg ${startMonth} - ${endDay} thg ${endMonth}, ${startYear}`;
        } else {
            display = `${startDay} thg ${startMonth}, ${startYear} - ${endDay} thg ${endMonth}, ${endYear}`;
        }

        // If it matches a preset label exactly, maybe we show that? 
        // Google shows stats: "Last 30 days" then the date below. 
        // For here, let's stick to the date range string for precision.
        textEl.textContent = display;

        this.highlightPreset(presetKey);
    }
}
