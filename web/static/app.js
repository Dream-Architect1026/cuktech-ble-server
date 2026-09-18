        // Theme definitions
        const THEMES = {
            'ha-dark': {
                '--bg': '#1c1c1c', '--card-bg': '#252525', '--card-border': '#3b3b3b',
                '--text': '#e1e1e1', '--text-dim': '#959595',
                '--accent': '#03a9f4', '--accent-rgb': '3, 169, 244',
                '--success': '#389e3d', '--success-rgb': '56, 158, 61',
                '--warning': '#ffa42b', '--warning-rgb': '255, 164, 43',
                '--danger': '#db4437', '--danger-rgb': '219, 68, 55'
            },
            'deep-blue': {
                '--bg': '#0f0f1a', '--card-bg': '#1a1a2e', '--card-border': '#2a2a4a',
                '--text': '#e8e8f0', '--text-dim': '#8888aa',
                '--accent': '#00d4ff', '--accent-rgb': '0, 212, 255',
                '--success': '#00e676', '--success-rgb': '0, 230, 118',
                '--warning': '#ffc107', '--warning-rgb': '255, 193, 7',
                '--danger': '#ff5252', '--danger-rgb': '255, 82, 82'
            },
            'ocean': {
                '--bg': '#0a1628', '--card-bg': '#0f2035', '--card-border': '#1a3a5c',
                '--text': '#e0f0ff', '--text-dim': '#7aa3cc',
                '--accent': '#00b4d8', '--accent-rgb': '0, 180, 216',
                '--success': '#48bb78', '--success-rgb': '72, 187, 120',
                '--warning': '#f6ad55', '--warning-rgb': '246, 173, 85',
                '--danger': '#fc8181', '--danger-rgb': '252, 129, 129'
            },
            'gray': {
                '--bg': '#2d2d2d', '--card-bg': '#3a3a3a', '--card-border': '#4a4a4a',
                '--text': '#f0f0f0', '--text-dim': '#aaaaaa',
                '--accent': '#4fc3f7', '--accent-rgb': '79, 195, 247',
                '--success': '#81c784', '--success-rgb': '129, 199, 132',
                '--warning': '#ffb74d', '--warning-rgb': '255, 183, 77',
                '--danger': '#e57373', '--danger-rgb': '229, 115, 115'
            },
            'light': {
                '--bg': '#f5f5f5', '--card-bg': '#ffffff', '--card-border': '#e0e0e0',
                '--text': '#212121', '--text-dim': '#757575',
                '--accent': '#1976d2', '--accent-rgb': '25, 118, 210',
                '--success': '#388e3c', '--success-rgb': '56, 142, 60',
                '--warning': '#f57c00', '--warning-rgb': '245, 124, 0',
                '--danger': '#d32f2f', '--danger-rgb': '211, 47, 47'
            }
        };

        function setTheme(themeName) {
            if (themeName === 'system') {
                localStorage.setItem('cuktech-theme', 'system');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                applyTheme(prefersDark ? 'ha-dark' : 'light');
            } else {
                localStorage.setItem('cuktech-theme', themeName);
                localStorage.removeItem('cuktech-theme-original');
                applyTheme(themeName);
            }
            applySavedAccent();
            document.querySelectorAll('.theme-option').forEach(opt => {
                opt.classList.toggle('active', opt.dataset.theme === themeName);
            });
            document.getElementById('themeMenu').classList.remove('show');
        }

        function applyTheme(themeName) {
            const theme = THEMES[themeName];
            if (!theme) return;
            const root = document.documentElement;
            document.body.dataset.theme = themeName;
            Object.entries(theme).forEach(([key, value]) => {
                root.style.setProperty(key, value);
            });
        }

        function toggleThemeMenu() {
            document.getElementById('themeMenu').classList.toggle('show');
        }

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.theme-switcher')) {
                document.getElementById('themeMenu').classList.remove('show');
            }
        });

        // Load saved theme
        const savedTheme = localStorage.getItem('cuktech-theme') || 'ha-dark';
        setTimeout(() => { setTheme(savedTheme); applySavedAccent(); }, 0);

        // Log level management
        async function setLogLevel(level) {
            try {
                await fetch(`${API_BASE}/api/log-level`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ level })
                });
                localStorage.setItem('cuktech-log-level', level);
                document.querySelectorAll('#logLevelMenu .theme-option').forEach(opt => {
                    opt.classList.toggle('active', opt.dataset.level === level);
                });
                document.getElementById('logLevelMenu').classList.remove('show');
            } catch (e) {
                console.error('Failed to set log level:', e);
            }
        }

        async function initLogLevel() {
            try {
                const res = await fetch(`${API_BASE}/api/log-level`);
                const data = await res.json();
                if (data.level) {
                    localStorage.setItem('cuktech-log-level', data.level);
                    document.querySelectorAll('#logLevelMenu .theme-option').forEach(opt => {
                        opt.classList.toggle('active', opt.dataset.level === data.level);
                    });
                }
            } catch (e) {
                // Fallback to localStorage
                const saved = localStorage.getItem('cuktech-log-level') || 'info';
                document.querySelectorAll('#logLevelMenu .theme-option').forEach(opt => {
                    opt.classList.toggle('active', opt.dataset.level === saved);
                });
            }
        }

        function toggleLogLevelMenu() {
            document.getElementById('logLevelMenu').classList.toggle('show');
        }

        document.addEventListener('click', (e) => {
            if (!e.target.closest('#logLevelSwitcher')) {
                document.getElementById('logLevelMenu').classList.remove('show');
            }
        });

        // Initialize log level from server
        setTimeout(() => initLogLevel(), 0);

        const API_BASE = window.location.origin;
        const PORT_MAP = { 1: 'C1', 2: 'C2', 3: 'C3', 4: 'USB-A' };
        const PORT_KEY_MAP = { 1: 'c1', 2: 'c2', 3: 'c3', 4: 'a' };

        const SETTINGS_CONFIG = [
            { piid: 5, nameKey: 'settings.sceneMode', options: [{ value: 1, labelKey: 'scene.ai' }, { value: 2, labelKey: 'scene.eco' }, { value: 3, labelKey: 'scene.single' }, { value: 4, labelKey: 'scene.balanced' }] },
            { piid: 6, nameKey: 'settings.screenTimeout', options: [{ value: 1, labelKey: 'settings.min5' }, { value: 2, labelKey: 'settings.min10' }, { value: 3, labelKey: 'settings.min30' }, { value: 4, labelKey: 'settings.alwaysOn' }, { value: 5, labelKey: 'settings.min1' }] },
            { piid: 13, nameKey: 'settings.deviceLanguage', options: [{ value: 0, labelKey: 'settings.langEn' }, { value: 1, labelKey: 'settings.langZh' }] },
            { piid: 15, nameKey: 'settings.usbATrickle', options: [{ value: 0, labelKey: 'settings.off' }, { value: 1, labelKey: 'settings.on' }] },
            { piid: 19, nameKey: 'settings.idleScreenOff', options: [{ value: 0, labelKey: 'settings.off' }, { value: 1, labelKey: 'settings.on' }] },
            { piid: 20, nameKey: 'settings.screenLock', options: [{ value: 0, labelKey: 'settings.off' }, { value: 1, labelKey: 'settings.on' }] }
        ];

        let lastSettings = {};
        let powerChart = null, modalChart = null, currentModalPort = null, latestPorts = {};
        let protocolSwitches = {}, protocolExtend = 0;
        let bleConnected = false;
        // PRD 需求2/4：后端充电守护快照 {c1:{state,start_ts,elapsed,limit_sec,remaining,reason,...}}
        let chargeData = {};
        let serverClockOffset = 0;   // 服务器时间 - 本地时间（秒），把 start_ts 换算到本地时钟
        // PRD 需求3：本地秒级倒计时 {c1:{end:结束epoch(本地秒), total:总秒}|null}
        const cdState = {};
        let cdHardwareMin = {};      // 硬件 PIID 上报的剩余整分钟，用于刷新/重连对齐
        const _pad2 = (n) => String(Math.max(0, Math.floor(n))).padStart(2, '0');
        const fmtHMS = (sec) => {
            sec = Math.max(0, Math.floor(sec || 0));
            return `${_pad2(sec / 3600)}:${_pad2((sec / 60) % 60)}:${_pad2(sec % 60)}`;
        };
        const fmtMS = (sec) => {
            sec = Math.max(0, Math.floor(sec || 0));
            return `${_pad2(sec / 60)}:${_pad2(sec % 60)}`;
        };
        const serverNow = () => Date.now() / 1000 + serverClockOffset;
        const portHistory = {
            1: { voltage: [], current: [], power: [], protocol: [] },
            2: { voltage: [], current: [], power: [], protocol: [] },
            3: { voltage: [], current: [], power: [], protocol: [] },
            4: { voltage: [], current: [], power: [], protocol: [] }
        };

        // ── Real-time modal chart ──
        const REAL_TIME_WINDOW_MS = 10 * 60 * 1000;  // 保留最近10分钟
        let realTimeBuf = { 1: [], 2: [], 3: [], 4: [] };
        let modalRealTimePort = null;
        let modalRealTimeDebounce = null;
        let modalRealTimeTimer = null;  // 数据稳定时的后台刷新定时器

        function setTimeRange(minutes) {
            setCurrentHours(minutes / 60);
            localStorage.setItem('cuktech-chart-hours', minutes);
            document.querySelectorAll('#rangeTabs .time-btn').forEach(btn => {
                btn.classList.toggle('active', parseInt(btn.dataset.minutes, 10) === minutes);
            });
            liveEngine.follow = true; liveEngine.win = null; liveEngine.baseEpochs = [];
            hideChartInspector();
            updateResetBtn();
            fetchChartData();
        }

        const COUNTDOWN_PIIDS = { 1: 9, 2: 10, 3: 11, 4: 12 };
        const PORT_KEY_TO_ID = { 'c1': 1, 'c2': 2, 'c3': 3, 'a': 4 };
        let lastLocalChange = 0;
        function markLocal() { lastLocalChange = Date.now(); }
        function isRecent() { return Date.now() - lastLocalChange < 3000; }
        const QUICK_MINUTES = [15, 30, 60, 90, 120, 240];

        // ══════════ 实时功率曲线引擎 (v13) ══════════
        // 历史基底（/api/chart 聚合）+ BLE 1s 实时尾拼接；硬件约 1s/帧
        const liveEngine = {
            buf: [], lastSec: 0,
            baseEpochs: [], baseP: null, baseV: null, baseI: null,
            follow: true, win: null, last: null, liveTimer: null, syncTimer: null
        };

        function initChart() {
            const colors = getChartColors();
            const ctx = document.getElementById('powerChart').getContext('2d');
            const line = (label, color, fill) => ({
                label, data: [], borderColor: color, borderWidth: 2.2, tension: 0.35,
                pointRadius: 0, pointHoverRadius: 5, pointHitRadius: 14,
                fill: !!fill, backgroundColor: fill ? areaGradient(color) : undefined,
                spanGaps: true
            });
            powerChart = new Chart(ctx, {
                type: 'line',
                data: { labels: [], datasets: [
                    line('C1', colors.c1, true),
                    line('C2', colors.c2, true),
                    line('C3', colors.c3, true),
                    line('A', colors.a, true),
                    { label: I18N.t('power.totalLegend'), data: [], borderColor: colors.text, borderWidth: 2.4,
                      tension: 0.35, pointRadius: 0, pointHoverRadius: 5, pointHitRadius: 14, fill: false,
                      borderDash: [6, 4], spanGaps: true },
                    { label: '_tick', data: [], showLine: false, pointRadius: 4.5, pointHoverRadius: 0,
                      pointBackgroundColor: '#F2FEFF', pointBorderColor: colors.accent, pointBorderWidth: 2,
                      pointStyle: 'circle', order: 0 }
                ]},
                options: {
                    responsive: true, maintainAspectRatio: false,
                    elements: { point: { radius: 0, hoverRadius: 5, hitRadius: 14, borderWidth: 0 } },
                    animation: { duration: 220, easing: 'easeOutCubic' },
                    interaction: { mode: 'index', intersect: false },
                    plugins: {
                        legend: { display: true, position: 'top',
                            labels: { color: colors.text, font: { size: 11 }, boxWidth: 12, padding: 12,
                                filter: (it) => it.text !== '_tick' } },
                        tooltip: {
                            backgroundColor: 'rgba(18,22,34,0.94)', titleColor: '#ffffff',
                            bodyColor: colors.text, borderColor: 'rgba(var(--accent-rgb),0.45)', borderWidth: 1,
                            padding: 11, cornerRadius: 10, displayColors: true, boxPadding: 4,
                            titleFont: { size: 12, weight: '600' }, bodyFont: { size: 11 },
                            callbacks: {
                                label: (item) => {
                                    const ds = item.datasetIndex, idx = item.dataIndex, L = liveEngine.last;
                                    if (ds === 5) return null;
                                    if (ds < 4 && L) {
                                        const p = L.P[ds][idx] || 0, v = L.V[ds][idx] || 0, cu = L.I[ds][idx] || 0;
                                        return ` ${item.dataset.label}: ${p.toFixed(1)}W · ${v.toFixed(1)}V · ${cu.toFixed(2)}A`;
                                    }
                                    if (ds === 4) return ` ${I18N.t('power.totalLegend')}: ${(item.parsed.y||0).toFixed(1)} W`;
                                    return null;
                                }
                            }
                        }
                    },
                    scales: {
                        x: { grid: { color: 'rgba(255,255,255,0.045)' }, ticks: { color: colors.textDim, maxTicksLimit: 8, font: { size: 10 } }, border: { color: 'rgba(255,255,255,0.12)' } },
                        y: { grid: { color: 'rgba(255,255,255,0.045)' }, ticks: { color: colors.textDim, font: { size: 10 } }, beginAtZero: true, border: { display: false }, title: { display: true, text: 'W', color: colors.textDim, font: { size: 10 } } }
                    }
                }
            });
            bindChartGestures();
        }

        // 1s 节拍：用最新端口状态合成实时点（对齐 BLE 硬件帧率）
        function liveTick() {
            const nowSec = Math.floor(Date.now() / 1000);
            if (nowSec === liveEngine.lastSec) return;
            liveEngine.lastSec = nowSec;
            const p = [0,0,0,0], v = [0,0,0,0], cu = [0,0,0,0], tot = [0];
            let total = 0;
            for (let id = 1; id <= 4; id++) {
                const d = latestPorts[id] || latestPorts[String(id)];
                if (d) { p[id-1] = +d.power || 0; v[id-1] = +d.voltage || 0; cu[id-1] = +d.current || 0; total += p[id-1]; }
            }
            liveEngine.buf.push({ t: nowSec, p, v, i: cu, tot: total });
            const cutoff = nowSec - LIVE_BUFFER_SECONDS;
            while (liveEngine.buf.length && liveEngine.buf[0].t < cutoff) liveEngine.buf.shift();
            renderLiveChart(false);
        }

        // 历史基底 + 实时尾 → 当前区间完整序列
        function buildSeries() {
            const nowSec = Math.floor(Date.now() / 1000);
            const span = currentMinutes() * 60, winStart = nowSec - span;
            let epochs = [], P = [[],[],[],[],[]], V = [[],[],[],[]], I = [[],[],[],[]];
            if (liveEngine.baseEpochs.length && liveEngine.baseP) {
                const be = liveEngine.baseEpochs.slice(0, -1); // 丢掉进行中的最后一桶，交给实时点
                for (let k = 0; k < 5; k++) P[k] = liveEngine.baseP[k].slice(0, be.length);
                for (let k = 0; k < 4; k++) {
                    V[k] = liveEngine.baseV ? liveEngine.baseV[k].slice(0, be.length) : new Array(be.length).fill(0);
                    I[k] = liveEngine.baseI ? liveEngine.baseI[k].slice(0, be.length) : new Array(be.length).fill(0);
                }
                epochs = be.slice();
            }
            const after = epochs.length ? epochs[epochs.length-1] : winStart;
            for (const pt of liveEngine.buf) {
                if (pt.t <= after || pt.t < winStart) continue;
                epochs.push(pt.t);
                for (let k = 0; k < 4; k++) { P[k].push(pt.p[k]); V[k].push(pt.v[k]); I[k].push(pt.i[k]); }
                P[4].push(pt.tot);
            }
            let s = 0; while (s < epochs.length && epochs[s] < winStart) s++;
            if (s > 0) {
                epochs = epochs.slice(s);
                for (let k = 0; k < 5; k++) P[k] = P[k].slice(s);
                for (let k = 0; k < 4; k++) { V[k] = V[k].slice(s); I[k] = I[k].slice(s); }
            }
            liveEngine.last = { epochs, P, V, I };
            return liveEngine.last;
        }

        function renderLiveChart(animate) {
            if (!powerChart) return;
            const { epochs, P, V, I } = buildSeries();
            const withSec = currentMinutes() <= 1;
            const labels = epochs.map(e => formatChartLabel(e, withSec));
            powerChart.data.labels = labels;
            for (let k = 0; k < 5; k++) powerChart.data.datasets[k].data = P[k];
            const step = getTickStepSec();
            const tickDs = powerChart.data.datasets[5];
            // 整点电流脉冲：整刻度发光点随时间呼吸，仅在有功率/电流时显示
            const pulseR = 3.0 + 1.5 * (0.5 + 0.5 * Math.sin(Date.now() / 340));
            tickDs.pointRadius = pulseR;
            tickDs.pointHoverRadius = pulseR + 1.5;
            tickDs.data = epochs.map((e, idx) => ((e % step === 0) && (P[4][idx] > 0.05)) ? (P[4][idx] || 0) : null);
            for (let port = 1; port <= 4; port++) {
                portHistory[port].power = P[port-1].slice();
                portHistory[port].voltage = V[port-1].slice();
                portHistory[port].current = I[port-1].slice();
                portHistory[port].protocol = P[port-1].map(() => 'idle');
            }
            // 空闲（无功率）时给 Y 轴有意义的刻度，避免 0~1W 空轴；有负载时自适应放大
            const ys = powerChart.options.scales.y;
            let _pmax = 0;
            for (let k = 0; k < 5; k++) P[k].forEach(v => { if (v > _pmax) _pmax = v; });
            ys.suggestedMax = _pmax < 0.1 ? 20 : undefined;
            const xs = powerChart.options.scales.x;
            if (liveEngine.follow || !liveEngine.win) { xs.min = undefined; xs.max = undefined; }
            else {
                const [a, b] = liveEngine.win, n = labels.length;
                xs.min = labels[Math.max(0, a)]; xs.max = labels[Math.min(n-1, b)];
            }
            // 实时高频刷新用 none（避免 'active' 模式让新点停在 hoverRadius、且拖影）；切区间才用 default 柔和过渡
            powerChart.update(animate === 'default' ? 'default' : 'none');
        }

        let _chartDataLoaded = false;
        async function fetchChartData() {
            try {
                const interval = getInterval();
                const res = await fetch(`${API_BASE}/api/chart?hours=${getCurrentHours()}&interval=${interval}`);
                if (!res.ok) return;
                const result = await res.json();
                if (!result.ok) return;
                const nowSec = Math.floor(Date.now() / 1000), span = currentMinutes() * 60;
                const alignedStart = Math.floor((nowSec - span) / interval) * interval;
                const N = result.labels ? result.labels.length : result.datasets.power[0].data.length;
                const epochs = [];
                for (let k = 0; k < N; k++) epochs.push(alignedStart + k * interval);
                liveEngine.baseEpochs = epochs;
                // /api/chart datasets 为 [{label,data:[...]}] 对象数组
                const num = (o) => (o.data || []).map(x => +x || 0);
                liveEngine.baseP = result.datasets.power.map(num);
                liveEngine.baseV = result.datasets.voltage.map(num);
                liveEngine.baseI = result.datasets.current.map(num);
                _chartDataLoaded = true;
                renderLiveChart('default');
            } catch (e) { console.error('Failed to fetch chart data:', e); }
        }

        // ── 缩放 / 平移 / 点击详情 ──
        function bindChartGestures() {
            const cv = document.getElementById('powerChart');
            window._chartInspector = document.getElementById('chartInspector');
            let dragging = false, moved = false, startX = 0, startWin = null;
            const idxAt = (px) => powerChart ? powerChart.scales.x.getValueForPixel(px) : 0;
            const freeze = () => {
                const n = powerChart.data.labels.length;
                if (liveEngine.follow) { liveEngine.win = [0, n-1]; liveEngine.follow = false; updateResetBtn(); }
            };
            cv.addEventListener('mousedown', (e) => {
                if (!powerChart) return;
                dragging = true; moved = false; startX = e.offsetX; freeze();
                startWin = (liveEngine.win || [0, powerChart.data.labels.length-1]).slice();
                cv.style.cursor = 'grabbing';
            });
            window.addEventListener('mousemove', (e) => {
                if (!dragging || !powerChart) return;
                const rect = cv.getBoundingClientRect(), x = e.clientX - rect.left;
                if (Math.abs(x - startX) > 4) moved = true;
                const span = Math.max(1, startWin[1] - startWin[0]);
                const pxPer = rect.width / span;
                const shift = Math.round((startX - x) / pxPer);
                const n = powerChart.data.labels.length;
                let a = startWin[0] + shift, b = startWin[1] + shift;
                if (a < 0) { a = 0; b = span; }
                if (b > n-1) { b = n-1; a = b - span; }
                liveEngine.win = [a, b]; renderLiveChart(false);
            });
            window.addEventListener('mouseup', (e) => {
                if (!dragging) return;
                dragging = false; cv.style.cursor = '';
                if (!moved) {
                    const rect = cv.getBoundingClientRect();
                    const idx = idxAt(e.clientX - rect.left);
                    if (idx !== undefined && idx !== null) showChartInspector(idx, e.clientX, e.clientY);
                }
            });
            cv.addEventListener('dblclick', resetLiveView);
            cv.addEventListener('wheel', (e) => {
                e.preventDefault();
                if (!powerChart) return;
                const n = powerChart.data.labels.length; if (n < 2) return;
                freeze();
                const rect = cv.getBoundingClientRect(), center = idxAt(e.clientX - rect.left);
                let [a, b] = liveEngine.win;
                let span = Math.max(8, Math.min(n, (b - a) * (e.deltaY < 0 ? 0.82 : 1.22)));
                const ratio = (center - a) / Math.max(1, (b - a));
                let na = Math.round(center - span * ratio), nb = Math.round(na + span);
                if (na < 0) { na = 0; nb = Math.round(span); }
                if (nb > n-1) { nb = n-1; na = nb - Math.round(span); }
                liveEngine.win = [Math.max(0, na), Math.min(n-1, nb)];
                updateResetBtn(); renderLiveChart(false);
            }, { passive: false });
            const zin = document.getElementById('zoomInBtn'), zout = document.getElementById('zoomOutBtn'), zrst = document.getElementById('zoomResetBtn');
            if (zin) zin.onclick = () => zoomBy(0.8);
            if (zout) zout.onclick = () => zoomBy(1.25);
            if (zrst) zrst.onclick = resetLiveView;
        }
        function zoomBy(f) {
            if (!powerChart) return;
            const n = powerChart.data.labels.length; if (n < 2) return;
            if (liveEngine.follow) { liveEngine.win = [0, n-1]; liveEngine.follow = false; }
            let [a, b] = liveEngine.win;
            const span = Math.max(8, Math.min(n, (b - a) * f)), mid = (a + b) / 2;
            a = Math.round(mid - span/2); b = Math.round(mid + span/2);
            if (a < 0) { a = 0; b = Math.round(span); }
            if (b > n-1) { b = n-1; a = b - Math.round(span); }
            liveEngine.win = [a, b]; updateResetBtn(); renderLiveChart(false);
        }
        function resetLiveView() { liveEngine.follow = true; liveEngine.win = null; hideChartInspector(); updateResetBtn(); renderLiveChart(false); }
        function updateResetBtn() { const b = document.getElementById('zoomResetBtn'); if (b) b.classList.toggle('active', !liveEngine.follow); }

        function showChartInspector(idx, cx, cy) {
            const L = liveEngine.last, el = window._chartInspector;
            if (!L || !el || idx < 0 || idx >= L.epochs.length) { if (el) el.hidden = true; return; }
            const names = ['C1','C2','C3','USB-A'];
            const colors = ['var(--port-c1)','var(--port-c2)','var(--port-c3)','var(--port-a)'];
            let rows = '';
            for (let k = 0; k < 4; k++) {
                const p = L.P[k][idx] || 0, v = L.V[k][idx] || 0, cu = L.I[k][idx] || 0;
                if (p <= 0 && cu <= 0) continue;
                rows += `<div class="insp-row"><span class="insp-port" style="color:${colors[k]}">${names[k]}</span><span>${v.toFixed(1)}V</span><span>${cu.toFixed(2)}A</span><span>${p.toFixed(1)}W</span></div>`;
            }
            if (!rows) rows = `<div class="insp-empty">${I18N.t('chart.idle')}</div>`;
            el.innerHTML = `<div class="insp-time">${formatChartLabel(L.epochs[idx], currentMinutes()<=1)}</div>${rows}<div class="insp-total">${I18N.t('power.totalLegend')} ${(L.P[4][idx]||0).toFixed(1)} W</div>`;
            el.hidden = false;
            // 详情卡显示时关闭悬停 tooltip，避免两者重叠
            if (powerChart) {
                powerChart.options.plugins.tooltip.enabled = false;
                if (powerChart.tooltip) powerChart.tooltip.setActiveElements([], { x: 0, y: 0 });
            }
            const stage = el.parentElement.getBoundingClientRect();
            let x = cx - stage.left + 14, y = cy - stage.top + 10;
            if (x + (el.offsetWidth || 190) > stage.width) x = cx - stage.left - (el.offsetWidth || 190) - 14;
            el.style.left = Math.max(8, x) + 'px'; el.style.top = Math.max(8, y) + 'px';
            clearTimeout(el._t); el._t = setTimeout(hideChartInspector, 6000);
        }

        // 关闭图表详情卡并恢复悬停 tooltip
        function hideChartInspector() {
            const el = window._chartInspector;
            if (el) { clearTimeout(el._t); el.hidden = true; }
            if (powerChart) powerChart.options.plugins.tooltip.enabled = true;
        }

        // ── Real-time modal chart ──
        function toggleModalRealTime() {
            const btn = document.getElementById('modalRealTimeBtn');
            if (modalRealTimePort !== null) {
                modalRealTimePort = null;
                btn.classList.remove('active');
                btn.textContent = I18N.t('modal.realtime');
                if (modalRealTimeDebounce) { clearTimeout(modalRealTimeDebounce); modalRealTimeDebounce = null; }
                if (modalRealTimeTimer) { clearInterval(modalRealTimeTimer); modalRealTimeTimer = null; }
                if (currentModalPort) updateModalChart();
            } else {
                modalRealTimePort = currentModalPort;
                btn.classList.add('active');
                btn.textContent = I18N.t('modal.realtimeStop');
                // 后台 2 秒刷新：数据到达时会通过 500ms 去抖更快更新，无数据时图表保持最新
                if (modalRealTimeTimer) clearInterval(modalRealTimeTimer);
                modalRealTimeTimer = setInterval(_updateRealTimeModalChart, 2000);
                _updateRealTimeModalChart();
            }
        }

        function _buildRealTimeLabels(buf, offset, count) {
            return buf.slice(offset, offset + count).map(e => {
                const d = new Date(e.ts);
                return String(d.getHours()).padStart(2,'0') + ':' +
                       String(d.getMinutes()).padStart(2,'0') + ':' +
                       String(d.getSeconds()).padStart(2,'0');
            });
        }

        function _accumulateRealTimeData(portId, data) {
            const ts = Date.now();
            const buf = realTimeBuf[portId];
            buf.push({ ts, voltage: data.voltage, current: data.current, power: data.power, protocol: data.protocol });
            const cutoff = ts - REAL_TIME_WINDOW_MS;
            while (buf.length > 0 && buf[0].ts < cutoff) buf.shift();
            // 弹窗实时模式下，对应当前端口的数据到达时去抖更新图表
            if (modalRealTimePort !== null && portId === modalRealTimePort) {
                if (modalRealTimeDebounce) clearTimeout(modalRealTimeDebounce);
                modalRealTimeDebounce = setTimeout(() => {
                    modalRealTimeDebounce = null;
                    _updateRealTimeModalChart();
                }, 500);
            }
        }

        function _updateRealTimeModalChart() {
            if (!currentModalPort || !modalChart || modalRealTimePort === null) return;
            const buf = realTimeBuf[currentModalPort];
            if (!buf || buf.length < 1) return;
            // ── 更新弹窗顶部的瞬时值 ──
            const rt = latestPorts[currentModalPort];
            if (rt) {
                document.getElementById('modalVoltage').textContent = rt.voltage.toFixed(1);
                document.getElementById('modalCurrent').textContent = rt.current.toFixed(2);
                document.getElementById('modalPower').textContent = rt.power.toFixed(1);
                updateModalState();
            }
            // ── 更新图表曲线 ──
            const MAX_VISIBLE = 120;
            const showBuf = buf.slice(-MAX_VISIBLE);
            const padding = MAX_VISIBLE - showBuf.length;
            const padLabels = new Array(padding).fill('--:--:--');
            const padZeros = new Array(padding).fill(0);
            const realLabels = _buildRealTimeLabels(showBuf, 0, showBuf.length);
            modalChart.data.labels = [...padLabels, ...realLabels];
            modalChart.data.datasets[0].data = [...padZeros, ...showBuf.map(e => e.voltage)];
            modalChart.data.datasets[1].data = [...padZeros, ...showBuf.map(e => e.current)];
            modalChart.data.datasets[2].data = [...padZeros, ...showBuf.map(e => e.power)];
            modalChart.update('none');
        }

        function initModalChart() {
            if (modalChart) modalChart.destroy();
            const colors = getChartColors();
            const ctx = document.getElementById('modalChart').getContext('2d');
            modalChart = new Chart(ctx, {
                type: 'line',
                data: { labels: [], datasets: [
                    { label: I18N.t('modal.voltage'), data: [], borderColor: colors.c1, borderWidth: 2, tension: 0.4, pointRadius: 0, fill: false, yAxisID: 'y' },
                    { label: I18N.t('modal.current'), data: [], borderColor: colors.c3, borderWidth: 2, tension: 0.4, pointRadius: 0, fill: false, yAxisID: 'y' },
                    { label: I18N.t('modal.power'), data: [], borderColor: colors.a, borderWidth: 2, tension: 0.4, pointRadius: 0, fill: false, yAxisID: 'y1' },
                ]},
                options: { responsive: true, maintainAspectRatio: false, animation: { duration: 0 }, interaction: { intersect: false, mode: 'index' },
                    plugins: { legend: { display: true, position: 'top', labels: { color: colors.textDim, font: { size: 11 }, boxWidth: 12, padding: 12 } } },
                    scales: { x: { display: true, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#666', maxTicksLimit: 8, font: { size: 10 } } },
                        y: { type: 'linear', display: true, position: 'left', grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: colors.c1, font: { size: 10 } }, beginAtZero: true, title: { display: true, text: 'V / A', color: colors.textDim } },
                        y1: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false }, ticks: { color: colors.a, font: { size: 10 } }, beginAtZero: true, title: { display: true, text: 'W', color: colors.textDim } }
                    }
                }
            });
        }

        function openModal(portId) {
            currentModalPort = portId;
            const titleEl = document.getElementById('modalTitle');
            // Keep the data-i18n-params in sync so a later applyTranslations
            // (e.g. server language applied at page load) re-translates the title
            // with the actually open port instead of the static default.
            titleEl.setAttribute('data-i18n-params', JSON.stringify({ port: PORT_MAP[portId] }));
            titleEl.textContent = I18N.t('modal.portDetail', { port: PORT_MAP[portId] });
            titleEl.style.color = `var(--port-${PORT_KEY_MAP[portId]})`;
            initModalChart();
            updateModalChart();
            renderModalProtocols();
            document.getElementById('portModal').classList.add('show');
        }

        function renderModalProtocols() {
            const container = document.getElementById('modalProtocols');
            if (!container) return;
            const portKey = PORT_KEY_MAP[currentModalPort];
            const sw = protocolSwitches[portKey];
            if (!sw) {
                container.innerHTML = `<div class="proto-title">${I18N.t('modal.noData')}</div>`;
                return;
            }
            const protoKeys = Object.keys(sw);
            const labels = { pd: 'PD', pps: 'PPS', ufcs: 'UFCS', scp: 'SCP' };
            let html = `<div class="proto-title">${I18N.t('modal.protocolSwitch')}</div><div class="proto-btns">`;
            for (const pk of protoKeys) {
                // PD 关闭时隐藏 PPS 按钮
                if ((portKey === 'c1' || portKey === 'c2') && pk === 'pps' && !sw.pd) continue;
                const on = sw[pk];
                const cls = on ? 'proto-btn on' : 'proto-btn';
                html += `<button class="${cls}" data-port="${portKey}" data-proto="${pk}" onclick="toggleProtocol(this)">${labels[pk] || pk}</button>`;
            }
            html += '</div>';
            if (portKey === 'c1' || portKey === 'c2') {
                html += `<div style="font-size:10px;color:var(--text-dim);margin-top:6px;">${I18N.t('modal.ppsNote')}</div>`;
            } else {
                html += `<div style="font-size:10px;color:var(--text-dim);margin-top:6px;">${I18N.t('modal.replugNote')}</div>`;
            }
            container.innerHTML = html;
        }

        async function toggleProtocol(btn) {
            if (btn.disabled) return;
            btn.disabled = true;
            const port = btn.dataset.port;
            const proto = btn.dataset.proto;
            try {
                const res = await fetch(`${API_BASE}/api/protocol`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ port, protocol: proto })
                });
                const data = await res.json();
                if (data.ok) {
                    // Toggle local state optimistically
                    const key = PORT_KEY_TO_ID[port];
                    if (protocolSwitches[port]) protocolSwitches[port][proto] = !protocolSwitches[port][proto];
                    renderModalProtocols();
                }
            } catch (e) { console.error('Protocol toggle error:', e); }
            finally { btn.disabled = false; }
        }

        function closeModal() {
            document.getElementById('portModal').classList.remove('show');
            currentModalPort = null;
            // 关闭弹窗时自动退出实时曲线模式
            if (modalRealTimePort !== null) {
                const btn = document.getElementById('modalRealTimeBtn');
                if (btn) { btn.classList.remove('active'); btn.textContent = I18N.t('modal.realtime'); }
                modalRealTimePort = null;
                if (modalRealTimeDebounce) { clearTimeout(modalRealTimeDebounce); modalRealTimeDebounce = null; }
                if (modalRealTimeTimer) { clearInterval(modalRealTimeTimer); modalRealTimeTimer = null; }
            }
        }

        // 弹窗：统一更新工作/空闲状态徽章与充电协议（两项独立信息）
        function updateModalState() {
            if (currentModalPort === null || currentModalPort === undefined) return;
            const rt = latestPorts[currentModalPort];
            const working = !!(rt && rt.enabled !== false && rt.power > 0);
            const proto = (rt && rt.protocol && rt.protocol !== 'idle') ? rt.protocol : '--';
            const protoEl = document.getElementById('modalProtocol');
            if (protoEl) {
                protoEl.textContent = proto;
                protoEl.style.color = proto !== '--' ? 'var(--accent)' : 'var(--text-dim)';
            }
            const badge = document.getElementById('modalState');
            if (badge) {
                badge.classList.toggle('working', working);
                badge.classList.toggle('idle', !working);
                const t = document.getElementById('modalStateText');
                if (t) t.textContent = working ? I18N.t('port.working') : I18N.t('port.idle');
            }
        }

        function updateModalChart() {
            if (!currentModalPort || !modalChart) return;
            if (modalRealTimePort !== null) { _updateRealTimeModalChart(); return; }
            const h = portHistory[currentModalPort];
            modalChart.data.labels = [...powerChart.data.labels.slice(-h.voltage.length)];
            modalChart.data.datasets[0].data = [...h.voltage];
            modalChart.data.datasets[1].data = [...h.current];
            modalChart.data.datasets[2].data = [...h.power];
            modalChart.update('none');
            // Use real-time data if chart history is empty
            const rt = latestPorts[currentModalPort];
            document.getElementById('modalVoltage').textContent = (rt ? rt.voltage : (h.voltage[h.voltage.length - 1] || 0)).toFixed(1);
            document.getElementById('modalCurrent').textContent = (rt ? rt.current : (h.current[h.current.length - 1] || 0)).toFixed(2);
            document.getElementById('modalPower').textContent = (rt ? rt.power : (h.power[h.power.length - 1] || 0)).toFixed(1);
            updateModalState();
        }

        document.getElementById('portModal').addEventListener('click', function(e) { if (e.target === this) closeModal(); });
        document.addEventListener('keydown', function(e) { if (e.key === 'Escape') { closeModal(); hideChartInspector(); } });

        async function fetchStatus() {
            try {
                const res = await fetch(`${API_BASE}/api/status`);
                const data = await res.json();
                updateUI(data);
            } catch (e) { console.error('Fetch error:', e); }
        }

        function updateUI(data) {
            bleConnected = data.connected && data.authenticated;
            latestPorts = data.ports || {};
            if (data.charge) applyChargeData(data.charge, data.server_now);
            if (data.protocol_switches) protocolSwitches = data.protocol_switches;
            if (data.protocol_extend !== undefined) protocolExtend = data.protocol_extend;
            updateStatusBadge(data.connected, data.authenticated, data.mqtt_connected);
            updateBleButton();
            renderPorts(data.ports);
            updateDeviceContainer(data.ports);
            updateSettingsUI(data.settings || {});
            renderCountdown(data.settings || {});
            updateSummary(data.ports);
            if (data.firmware_version) {
                const fwEl = document.getElementById('firmwareVersion');
                if (fwEl) {
                    fwEl.dataset.firmware = data.firmware_version;
                    fwEl.textContent = I18N.t('common.firmware', { version: data.firmware_version });
                }
            }
            if (currentModalPort) updateModalChart();
        }

        function updateSummary(ports) {
            let totalPower = 0, activeCount = 0, maxV = 0, totalCurrent = 0;
            for (const [id, port] of Object.entries(ports || {})) {
                if ((port.current > 0 || port.power > 0) && port.enabled !== false) {
                    totalPower += port.power;
                    activeCount++;
                    totalCurrent += port.current;
                    maxV = Math.max(maxV, port.voltage);
                }
            }
            setNum(document.getElementById('totalPower'), totalPower, 1);
            setNum(document.getElementById('activePorts'), activeCount, 0);
            setNum(document.getElementById('maxVoltage'), maxV, 1);
            setNum(document.getElementById('heroCurrent'), totalCurrent, 2);
            setNum(document.getElementById('powerLoad'), Math.max(0, Math.min(100, totalPower / 120 * 100)), 0);
            const bar = document.getElementById('powerBarFill');
            if (bar) {
                const pct = Math.max(0, Math.min(100, totalPower / 120 * 100));
                bar.style.width = pct.toFixed(1) + '%';
            }
            const hero = document.querySelector('.hero-card');
            if (hero) hero.classList.toggle('idle', totalPower <= 0);
        }

        // ── Incremental port DOM update (no innerHTML rebuild) ──
        function updatePortDOM(portId, portData) {
            const key = String(portId);
            // Merge with existing data to preserve fields not in SSE event
            latestPorts[key] = { ...(latestPorts[key] || {}), ...portData };
            const card = document.getElementById(`port-${portId}`);
            if (!card) return renderPorts(latestPorts);
            const merged = latestPorts[key];
            // Update stats text directly
            const vals = card.querySelectorAll('.port-stat-value');
            if (vals) setNum(vals[0], merged.voltage, 2);
            if (vals) setNum(vals[1], merged.current, 2);
            if (vals) setNum(vals[2], merged.power, 2);
            // Update working state + charging protocol (two separate indicators)
            const isWorking = merged.enabled !== false && merged.power > 0;
            const stateEl = card.querySelector('.port-state');
            if (stateEl) {
                stateEl.classList.toggle('working', isWorking);
                stateEl.classList.toggle('idle', !isWorking);
                const stateTxt = stateEl.querySelector('.port-state-text');
                if (stateTxt) stateTxt.textContent = isWorking ? I18N.t('port.working') : I18N.t('port.idle');
            }
            const protoWrap = card.querySelector('.port-proto');
            const protoVal = card.querySelector('.port-proto b');
            const liveProto = (merged.protocol && merged.protocol !== 'idle') ? merged.protocol : '--';
            if (protoVal) protoVal.textContent = liveProto;
            if (protoWrap) protoWrap.classList.toggle('idle', liveProto === '--');
            // Update active class (enabled comes from PIID 16, not BLE data)
            card.classList.toggle('active', merged.enabled !== false);
            // Update toggle checkbox
            const toggle = document.getElementById(`toggle-${PORT_KEY_MAP[portId]}`);
            if (toggle) toggle.checked = merged.enabled !== false;
            // Update summary totals
            updateSummary(latestPorts);
            // 守护状态（充电时长/预警/上限/保护）拥有状态标签最终决定权
            updateChargeUI();
            // Update modal if open for this port
            if (String(currentModalPort) === key) updateModalChart();
        }

        let _mqttConnected = false;
        function updateStatusBadge(connected, authenticated, mqttConnected) {
            const badge = document.getElementById('statusBadge');
            badge.className = (connected && authenticated) ? 'status-badge connected' : 'status-badge disconnected';

            if (mqttConnected !== undefined) _mqttConnected = mqttConnected;
            const mqttBadge = document.getElementById('mqttBadge');
            mqttBadge.className = _mqttConnected ? 'status-badge connected' : 'status-badge disconnected';
        }

        function updateBleButton() {
            const btn = document.getElementById('bleToggle');
            if (!btn) return;
            if (bleConnected) {
                btn.textContent = I18N.t('common.disconnect');
                btn.dataset.state = 'disconnect';
                btn.className = 'btn btn-danger';
            } else {
                btn.textContent = I18N.t('common.connect');
                btn.dataset.state = 'connect';
                btn.className = 'btn btn-primary';
            }
        }

        function renderPorts(ports) {
            const grid = document.getElementById('portGrid');
            // Save current toggle states during recent-change window
            const savedChecks = {};
            if (isRecent()) {
                for (const [id] of Object.entries(PORT_MAP)) {
                    const key = PORT_KEY_MAP[id];
                    const t = document.getElementById(`toggle-${key}`);
                    if (t) savedChecks[key] = t.checked;
                }
            }
            let html = '';
            for (const [id, name] of Object.entries(PORT_MAP)) {
                const port = ports[id] || { voltage: 0, current: 0, power: 0, enabled: false, protocol: 'idle' };
                const key = PORT_KEY_MAP[id];
                const working = port.enabled !== false && port.power > 0;
                const protoName = (port.protocol && port.protocol !== 'idle') ? port.protocol : '--';
                const checked = (isRecent() && savedChecks.hasOwnProperty(key)) ? savedChecks[key] : port.enabled;
                html += `
                    <div class="port-card ${checked ? 'active' : ''}" id="port-${id}" onclick="handlePortClick(event, ${id})">
                        <div class="port-head">
                            <span class="port-name ${key}">${name}</span>
                            <span class="port-state ${working ? 'working' : 'idle'}" id="port-state-${key}"><span class="port-state-dot"></span><span class="port-state-text" id="port-state-text-${key}">${working ? I18N.t('port.working') : I18N.t('port.idle')}</span></span>
                            <label class="port-toggle" onclick="event.stopPropagation()">
                                <input type="checkbox" id="toggle-${key}" ${checked ? 'checked' : ''} onchange="togglePort('${key}', this.checked)">
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                        <div class="port-stats">
                            <div class="port-stat"><div class="port-stat-value">${port.voltage.toFixed(1)}</div><div class="port-stat-label">${I18N.t('power.voltage')}</div></div>
                            <div class="port-stat"><div class="port-stat-value">${port.current.toFixed(1)}</div><div class="port-stat-label">${I18N.t('power.current')}</div></div>
                            <div class="port-stat"><div class="port-stat-value">${port.power.toFixed(1)}</div><div class="port-stat-label">${I18N.t('power.power')}</div></div>
                        </div>
                        <div class="port-extra">
                            <div class="port-charge-row">
                                <span class="pcr-label">${I18N.t('port.sessionTime')}</span>
                                <span class="pcr-value" id="charge-elapsed-${key}">–:–:–</span>
                            </div>
                            <div class="port-cd-row" id="port-cd-row-${key}" hidden>
                                <span class="pcr-label">${I18N.t('port.countdownLeft')}</span>
                                <span class="pcr-value cd" id="port-cd-${key}">00:00</span>
                            </div>
                        </div>
                        <div class="port-foot">
                            <span class="port-proto ${protoName === '--' ? 'idle' : ''}">${I18N.t('port.protocol')} <b>${protoName}</b></span>
                        </div>
                    </div>`;
            }
            grid.innerHTML = html;
            updateChargeUI();
        }

        function handlePortClick(event, portId) {
            if (event.target.closest('.port-toggle')) return;
            openModal(portId);
        }

        // ══════════ PRD 需求2/4：本次充电时长 + 预警/上限/保护状态 ══════════
        function applyChargeData(data, serverNowSec) {
            if (!data) return;
            chargeData = data || {};
            if (typeof serverNowSec === 'number') {
                serverClockOffset = serverNowSec - Date.now() / 1000;
            }
            updateChargeUI();
        }

        function chargeElapsedNow(c) {
            if (!c) return 0;
            if (c.state === 'limit' || c.state === 'protect') return c.elapsed || 0;
            if (c.active && c.start_ts) return Math.max(0, Math.floor(serverNow() - c.start_ts));
            return c.elapsed || 0;
        }

        function updateChargeUI() {
            for (const [id] of Object.entries(PORT_MAP)) {
                const key = PORT_KEY_MAP[id];
                const card = document.getElementById(`port-${id}`);
                if (!card) continue;
                const c = chargeData[key];
                const merged = latestPorts[id] || {};
                // 实时功率>0 或守护引擎判定处于充电会话，都算工作中（避免采样瞬时为 0 时标签闪空闲）
                const guardActive = !!(c && c.active && c.state !== 'limit' && c.state !== 'protect');
                const isWorking = (merged.enabled !== false && merged.power > 0) || guardActive;
                const level = c ? c.state : null;
                // 状态标签：上限/保护为红色终态，预警为橙色，其余沿用工作/空闲
                const stateEl = document.getElementById(`port-state-${key}`);
                const stateTxt = document.getElementById(`port-state-text-${key}`);
                if (stateEl && stateTxt) {
                    stateEl.classList.remove('working', 'idle', 'warn', 'limit', 'protect');
                    let cls, txt;
                    if (level === 'limit') { cls = 'limit'; txt = I18N.t('port.reachedLimit'); }
                    else if (level === 'protect') { cls = 'protect'; txt = I18N.t('port.protectedOff'); }
                    else if (level === 'warn') { cls = 'warn'; txt = I18N.t('port.working'); }
                    else { cls = isWorking ? 'working' : 'idle'; txt = isWorking ? I18N.t('port.working') : I18N.t('port.idle'); }
                    stateEl.classList.add(cls);
                    stateTxt.textContent = txt;
                    card.classList.toggle('cutoff', level === 'limit' || level === 'protect');
                }
                // 本次充电时长：充电中实时 HH:MM:SS，空闲 –:–:–
                const elapsedEl = document.getElementById(`charge-elapsed-${key}`);
                if (elapsedEl) {
                    elapsedEl.classList.remove('warn', 'limit', 'protect');
                    if (c && (c.active || level === 'limit' || level === 'protect')) {
                        elapsedEl.textContent = fmtHMS(chargeElapsedNow(c));
                        if (level === 'warn') elapsedEl.classList.add('warn');
                        if (level === 'limit') elapsedEl.classList.add('limit');
                        if (level === 'protect') elapsedEl.classList.add('protect');
                    } else {
                        elapsedEl.textContent = '–:–:–';
                    }
                }
                updatePortCdRow(key);
            }
        }

        // ══════════ PRD 需求3：本地秒级倒计时（硬件 PIID 为分钟基准，本地补秒） ══════════
        function cdRemaining(key) {
            const st = cdState[key];
            if (!st || !st.end) return null;
            return Math.max(0, Math.ceil(st.end - Date.now() / 1000));
        }

        function updatePortCdRow(key) {
            const row = document.getElementById(`port-cd-row-${key}`);
            if (!row) return;
            const rem = cdRemaining(key);
            if (rem === null || rem <= 0) { row.hidden = true; return; }
            row.hidden = false;
            const v = document.getElementById(`port-cd-${key}`);
            if (v) {
                v.textContent = fmtMS(rem);
                v.classList.toggle('ending', rem <= 60);
            }
        }

        // 用硬件上报的剩余整分钟对齐本地倒计时；isRecent() 窗口内以本地手动设置为准
        function syncCdFromHardware(settings) {
            if (!settings) return;
            const nowSec = Date.now() / 1000;
            for (const [id] of Object.entries(PORT_MAP)) {
                const key = PORT_KEY_MAP[id];
                const piid = COUNTDOWN_PIIDS[id];
                const hw = parseInt(settings[String(piid)], 10) || 0;
                const local = cdState[key];
                const localRemMin = local ? Math.ceil((local.end - nowSec) / 60) : 0;
                if (hw > 0) {
                    if (!local || (!isRecent() && localRemMin !== hw)) {
                        cdState[key] = { end: nowSec + hw * 60, total: hw * 60 };
                    }
                } else if (local && !isRecent()) {
                    delete cdState[key];
                }
            }
        }

        function buildSettingsHtml(settings) {
            let html = '';
            SETTINGS_CONFIG.forEach(s => {
                const val = settings[String(s.piid)] ?? s.options[0].value;
                const name = I18N.t(s.nameKey);
                const opts = s.options.map(o => `<option value="${o.value}" ${o.value === val ? 'selected' : ''}>${I18N.t(o.labelKey || o.label)}</option>`).join('');
                html += `<div class="setting-item"><span class="setting-label">${name}</span><select class="setting-select" onchange="setSetting(${s.piid}, parseInt(this.value))">${opts}</select></div>`;
            });
            return html;
        }

        function updateSettingsUI(settings) {
            const grid = document.getElementById('settingsGrid');
            if (Object.keys(lastSettings).length === 0) {
                grid.innerHTML = buildSettingsHtml(settings);
            } else {
                SETTINGS_CONFIG.forEach(s => {
                    const select = grid.querySelector(`select[onchange*="${s.piid}"]`);
                    if (select && !isRecent()) { const newVal = settings[String(s.piid)] ?? s.options[0].value; if (select.value != newVal) select.value = newVal; }
                });
            }
            lastSettings = settings;
        }

        async function togglePort(port, on) {
            markLocal();
            const toggle = document.getElementById(`toggle-${port}`);
            if (toggle) toggle.disabled = true;
            try {
                const res = await fetch(`${API_BASE}/api/port`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ port, action: on ? 'on' : 'off' }) });
                const result = await res.json();
                if (!result.ok) {
                    if (toggle) toggle.checked = !on;
                }
            } catch (e) {
                console.error('Port toggle error:', e);
                if (toggle) toggle.checked = !on;
            } finally {
                if (toggle) toggle.disabled = false;
                // SSE port_update will update UI automatically
            }
        }

        async function setSetting(piid, value) {
            markLocal();
            try { await fetch(`${API_BASE}/api/set`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ piid, value }) }); } catch (e) { console.error('Set setting error:', e); }
        }

        let countdownRendered = false;

        function renderCountdown(settings) {
            const grid = document.getElementById('countdownGrid');
            if (!countdownRendered) {
                let html = '';
                for (const [id, name] of Object.entries(PORT_MAP)) {
                    const key = PORT_KEY_MAP[id];
                    html += `
                        <div class="countdown-item">
                            <div class="countdown-header">
                                <span class="countdown-port ${key}">${name}</span>
                                <span class="countdown-current" id="countdown-status-${key}">${I18N.t('common.notSet')}</span>
                            </div>
                            <div class="countdown-input-group">
                                <input type="number" class="countdown-input" id="countdown-${key}" min="0" max="1440" placeholder="${I18N.t('countdown.placeholder')}">
                                <span class="countdown-unit">${I18N.t('countdown.placeholder')}</span>
                            </div>
                            <div class="countdown-quick">
                                ${QUICK_MINUTES.map(m => `<button class="countdown-quick-btn" onclick="setCountdown('${key}', ${m})">${I18N.t('countdown.quick', { count: m })}</button>`).join('')}
                            </div>
                            <div class="countdown-actions">
                                <button class="countdown-toggle-btn set" id="countdown-btn-${key}" onclick="handleCountdownAction('${key}')">${I18N.t('common.set')}</button>
                            </div>
                        </div>`;
                }
                grid.innerHTML = html;
                countdownRendered = true;
            }
            // 以硬件剩余分钟为基准对齐本地秒级倒计时，再统一刷新展示
            if (settings) syncCdFromHardware(settings);
            refreshAllCountdownItems();
        }

        // 刷新单个端口倒计时：未设置=灰色占位；设置后=MM:SS 实时递减并出现「取消」
        function refreshCountdownItem(key, remOverride) {
            const statusEl = document.getElementById(`countdown-status-${key}`);
            const btn = document.getElementById(`countdown-btn-${key}`);
            if (!statusEl) return;
            const rem = (typeof remOverride === 'number') ? remOverride : cdRemaining(key);
            const hasTask = rem !== null && rem > 0;
            if (hasTask) {
                statusEl.textContent = fmtMS(rem);
                statusEl.classList.add('running');
                statusEl.classList.remove('notset');
                statusEl.classList.toggle('ending', rem <= 60);
            } else {
                statusEl.textContent = I18N.t('common.notSet');
                statusEl.classList.remove('running', 'ending');
                statusEl.classList.add('notset');
            }
            if (btn && !btn.disabled) {
                btn.textContent = hasTask ? I18N.t('common.cancel') : I18N.t('common.set');
                btn.className = `countdown-toggle-btn ${hasTask ? 'clear' : 'set'}`;
            }
        }

        function refreshAllCountdownItems() {
            for (const [id] of Object.entries(PORT_MAP)) {
                refreshCountdownItem(PORT_KEY_MAP[id]);
            }
        }

        const countdownPending = {};

        async function setCountdown(port, minutes) {
            if (countdownPending[port]) return;
            countdownPending[port] = true;
            markLocal();
            const id = PORT_KEY_TO_ID[port];
            const btn = document.getElementById(`countdown-btn-${port}`);
            const statusEl = document.getElementById(`countdown-status-${port}`);
            const isClear = minutes === 0;
            if (btn) { btn.disabled = true; btn.textContent = isClear ? I18N.t('common.clearing') : I18N.t('common.setting'); }
            const piid = COUNTDOWN_PIIDS[id];
            if (!piid) { countdownPending[port] = false; if (btn) { btn.disabled = false; } return; }
            try {
                await fetch(`${API_BASE}/api/set`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ piid, value: minutes }) });
                // 本地立即建立/清除秒级倒计时（硬件同步执行，到点自动断电）
                countdownPending[port] = false;
                if (minutes > 0) cdState[port] = { end: Date.now() / 1000 + minutes * 60, total: minutes * 60 };
                else delete cdState[port];
                if (btn) btn.disabled = false;
                refreshCountdownItem(port);
                updatePortCdRow(port);
            } catch (e) { console.error('Set countdown error:', e); countdownPending[port] = false; if (btn) { btn.disabled = false; } }
        }

        function setCountdownFromInput(port) {
            const input = document.getElementById(`countdown-${port}`);
            const minutes = parseInt(input.value) || 0;
            setCountdown(port, minutes);
        }

        function handleCountdownAction(port) {
            const btn = document.getElementById(`countdown-btn-${port}`);
            if (btn && btn.classList.contains('clear')) {
                setCountdown(port, 0);
            } else {
                const input = document.getElementById(`countdown-${port}`);
                if (!input.value || parseInt(input.value) <= 0) return;
                setCountdownFromInput(port);
            }
        }

        async function bleToggle() {
            const btn = document.getElementById('bleToggle');
            if (btn.disabled) return;
            btn.disabled = true;
            try {
                const enable = btn.dataset.state === 'connect';
                await fetch(`${API_BASE}/api/enable`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ enabled: enable }) });
                // SSE status event will update UI when connection state changes
            } catch (e) { console.error('BLE toggle error:', e); }
            finally { btn.disabled = false; }
        }

        async function bleRestart() {
            const btn = document.getElementById('bleToggle');
            if (btn.disabled) return;
            btn.disabled = true;
            try {
                await fetch(`${API_BASE}/api/enable`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ enabled: false }) });
                await new Promise(r => setTimeout(r, 2000));
                await fetch(`${API_BASE}/api/enable`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ enabled: true }) });
                // SSE status event will update UI when connection state changes
            } catch (e) { console.error('BLE restart error:', e); }
            finally { btn.disabled = false; }
        }

        async function fetchBemfaStatus() {
            try {
                const resp = await fetch(`${API_BASE}/api/bemfa`);
                const data = await resp.json();
                const badge = document.getElementById('bemfaBadge');
                if (!badge) return;
                if (data.enabled && data.connected) {
                    badge.className = 'status-badge connected';
                } else if (data.enabled) {
                    badge.className = 'status-badge connecting';
                } else {
                    badge.className = 'status-badge disconnected';
                }
            } catch (e) { console.error('Bemfa status error:', e); }
        }

        // Set initial active button
        document.querySelectorAll('#rangeTabs .time-btn').forEach(btn => {
            const btnMinutes = parseInt(btn.dataset.minutes, 10);
            if (!isNaN(btnMinutes)) btn.classList.toggle('active', btnMinutes === parseInt(localStorage.getItem('cuktech-chart-hours') || '1'));
        });

        // 实时引擎：250ms 节拍对齐 BLE 1s 帧率；15s 历史基底校正
        function startLiveEngine() {
            if (liveEngine.liveTimer) clearInterval(liveEngine.liveTimer);
            if (liveEngine.syncTimer) clearInterval(liveEngine.syncTimer);
            liveEngine.liveTimer = setInterval(liveTick, 250);
            liveEngine.syncTimer = setInterval(fetchChartData, 15000);
        }
        function stopLiveEngine() {
            if (liveEngine.liveTimer) { clearInterval(liveEngine.liveTimer); liveEngine.liveTimer = null; }
            if (liveEngine.syncTimer) { clearInterval(liveEngine.syncTimer); liveEngine.syncTimer = null; }
        }

        // 本地 1s 心跳：充电时长平滑递增、倒计时 MM:SS 递减、归零兜底关闭端口
        function localTick() {
            updateChargeUI();
            for (const [id] of Object.entries(PORT_MAP)) {
                const key = PORT_KEY_MAP[id];
                const st = cdState[key];
                if (!st) { refreshCountdownItem(key, 0); continue; }
                const rem = Math.max(0, Math.ceil(st.end - Date.now() / 1000));
                if (rem <= 0) {
                    delete cdState[key];
                    // 充电器硬件到点会自动断电，这里 Web 侧再兜底下发一次 off
                    fetch(`${API_BASE}/api/port`, {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ port: key, action: 'off' })
                    }).catch(() => {});
                    refreshCountdownItem(key, 0);
                } else {
                    refreshCountdownItem(key, rem);
                }
            }
        }

        function initApp() {
            try {
                initChart();
                fetchChartData();
                startLiveEngine();
                initSSE();
                fetchBemfaStatus();
                setInterval(localTick, 1000);
                // 安全兜底：每 30s 轮询 /api/status 校正因 SSE 队列丢事件导致的连接状态偏差
                setInterval(async () => {
                    try {
                        const res = await fetch(`${API_BASE}/api/status`);
                        const data = await res.json();
                        const realConn = data.connected && data.authenticated;
                        if (realConn !== bleConnected) {
                            updateUI(data);
                        }
                    } catch (e) {}
                }, 30000);
            } catch (e) {
                console.error('Init error:', e);
                // Fallback to polling if SSE fails
                pollStatus();
            }
        }

        // ── SSE (Server-Sent Events) — replaces 2s polling ──
        let evtSource = null;
        let sseChartTimer = null;

        // Fallback polling — used when SSE init fails
        async function pollStatus() {
            await fetchStatus();
            setTimeout(pollStatus, 2000);
        }

        function initSSE() {
            if (evtSource) { evtSource.close(); evtSource = null; }
            evtSource = new EventSource(`${API_BASE}/api/events`);
            evtSource.onopen = () => {
                console.log('SSE connected');
                document.getElementById('statusBadge').className = 'status-badge connected';
                // SSE init event handles state sync; no fetchStatus needed
            };
            evtSource.onmessage = (e) => {
                try {
                    const msg = JSON.parse(e.data);
                    switch (msg.type) {
                        case 'init':
                            updateUI(msg);
                            break;
                        case 'port_update':
                            _accumulateRealTimeData(msg.port_id, msg.data);
                            updatePortDOM(msg.port_id, msg.data);
                            updateDeviceContainer(latestPorts);
                            break;
                        case 'status':
                            bleConnected = msg.connected && msg.authenticated;
                            latestPorts = latestPorts || {};
                            updateStatusBadge(msg.connected, msg.authenticated, msg.mqtt_connected);
                            updateBleButton();
                            if (msg.firmware_version) {
                                const fwEl = document.getElementById('firmwareVersion');
                                if (fwEl) {
                                    fwEl.dataset.firmware = msg.firmware_version;
                                    fwEl.textContent = I18N.t('common.firmware', { version: msg.firmware_version });
                                }
                            }
                            if (!bleConnected) {
                                // Disconnect: clear port data
                                chargeData = {};
                                for (const id of Object.keys(PORT_MAP)) {
                                    latestPorts[id] = { voltage: 0, current: 0, power: 0, active: false, protocol: 'idle', enabled: true };
                                }
                                renderPorts(latestPorts);
                                updateDeviceContainer(latestPorts);
                                updateSummary(latestPorts);
                            } else if (msg.ports) {
                                // Reconnect: apply full state
                                latestPorts = msg.ports;
                                renderPorts(msg.ports);
                                updateDeviceContainer(msg.ports);
                                updateSummary(msg.ports);
                            }
                            if (msg.settings) {
                                updateSettingsUI(msg.settings);
                                renderCountdown(msg.settings);
                            }
                            if (msg.protocol_switches) protocolSwitches = msg.protocol_switches;
                            if (msg.protocol_extend !== undefined) protocolExtend = msg.protocol_extend;
                            break;
                        case 'settings':
                            if (msg.settings) {
                                updateSettingsUI(msg.settings);
                                renderCountdown(msg.settings);
                            }
                            break;
                        case 'charge':
                            if (msg.ports) applyChargeData(msg.ports, msg.server_now);
                            break;
                        case 'protocol':
                            if (msg.switches) protocolSwitches = msg.switches;
                            if (msg.protocol_extend !== undefined) protocolExtend = msg.protocol_extend;
                            if (currentModalPort) renderModalProtocols();
                            break;
                        case 'session_end':
                            window.dispatchEvent(new CustomEvent('sse-session-end', { detail: msg }));
                            break;
                        case 'quality':
                            renderQuality(msg);
                            break;
                        case 'notify':
                            showNotify(msg);
                            break;
                    }
                } catch (err) { console.error('SSE parse error:', err); }
            };
            evtSource.onerror = () => {
                console.warn('SSE disconnected, will auto-reconnect');
                document.getElementById('statusBadge').className = 'status-badge disconnected';
            };
            // bfcache: keep SSE alive (so backend stays up); pause live tick on leave, resume on return
            window.addEventListener('pagehide', stopLiveEngine);
            window.addEventListener('pageshow', startLiveEngine);
            // visibilitychange: 页面切后台时暂停 250ms 高频渲染定时器，节省 CPU；切回前台时恢复
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    if (liveEngine.liveTimer) { clearInterval(liveEngine.liveTimer); liveEngine.liveTimer = null; }
                } else {
                    if (!liveEngine.liveTimer) liveEngine.liveTimer = setInterval(liveTick, 250);
                }
            });
        }

        let _lastQuality = null;
        function renderQuality(q) {
            _lastQuality = q;
            renderBleQuality(q.ble || {});
            renderMqttQuality(q.mqtt || {});
            renderBemfaQuality(q.bemfa || {});
        }
        function formatDuration(sec) {
            if (!sec) return '0s';
            const h = Math.floor(sec / 3600);
            const m = Math.floor((sec % 3600) / 60);
            const s = sec % 60;
            return h > 0 ? `${h}h${m}m` : m > 0 ? `${m}m${s}s` : `${s}s`;
        }
        function scoreColor(score) {
            return score >= 80 ? 'var(--success)' : score >= 50 ? 'var(--warning)' : 'var(--danger)';
        }
        function qualityBar(score) {
            const c = scoreColor(score);
            return `<div class="quality-bar"><div class="quality-bar-fill" style="width:${score}%;background:${c}"></div></div>`;
        }
        function renderBleQuality(ble) {
            const el = document.getElementById('qualityTooltip');
            if (!el) return;
            const uptimeText = ble.uptime > 0 ? formatDuration(ble.uptime) : I18N.t('quality.notConnected');
            const lastPushText = ble.last_push_age != null ? I18N.t('quality.secondsAgo', { count: ble.last_push_age }) : I18N.t('quality.none');
            const pushColor = ble.last_push_age != null && ble.last_push_age > 10 ? 'color:var(--warning)' : '';
            const delayText = ble.next_reconnect_delay != null ? I18N.t('quality.secondsLater', { count: Math.round(ble.next_reconnect_delay) }) : null;
            el.innerHTML = `<div style="font-weight:600;margin-bottom:2px;">BLE <span style="color:${scoreColor(ble.score)}">${ble.score}</span>/100</div>
                ${qualityBar(ble.score)}
                <div class="quality-row"><span class="quality-label">${I18N.t('quality.connectionDuration')}</span><span>${uptimeText}</span></div>
                <div class="quality-row"><span class="quality-label">${I18N.t('quality.lastPush')}</span><span style="${pushColor}">${lastPushText}</span></div>
                ${delayText ? `<div class="quality-row"><span class="quality-label">${I18N.t('quality.nextReconnect')}</span><span style="color:var(--warning)">${delayText}</span></div>` : ''}
                <div class="quality-row"><span class="quality-label">${I18N.t('quality.decryptSuccess')}</span><span>${ble.decrypt}%</span></div>
                <div class="quality-row"><span class="quality-label">${I18N.t('quality.notifyResponse')}</span><span>${ble.notify}%</span></div>
                <div class="quality-row"><span class="quality-label">${I18N.t('quality.connectionStable')}</span><span>${ble.reconnect_score}%</span></div>
                <div class="quality-row"><span class="quality-label">${I18N.t('quality.reconnect5m')}</span><span>${I18N.t('quality.times', { count: ble.reconnect_count_5m })}</span></div>`;
        }
        function renderMqttQuality(mqtt) {
            const el = document.getElementById('mqttTooltip');
            if (!el) return;
            el.innerHTML = `<div style="font-weight:600;margin-bottom:2px;">MQTT <span style="color:${scoreColor(mqtt.score)}">${mqtt.score}</span>/100</div>
                ${qualityBar(mqtt.score)}
                <div class="quality-row"><span class="quality-label">${I18N.t('quality.runtime')}</span><span>${formatDuration(mqtt.uptime)}</span></div>
                <div class="quality-row"><span class="quality-label">${I18N.t('quality.disconnects')}</span><span>${mqtt.disconnects}</span></div>
                <div class="quality-row"><span class="quality-label">${I18N.t('quality.publishFailures')}</span><span>${mqtt.publish_failures}</span></div>`;
        }
        function renderBemfaQuality(bemfa) {
            const el = document.getElementById('bemfaTooltip');
            if (!el) return;
            el.innerHTML = `<div style="font-weight:600;margin-bottom:2px;">Bemfa <span style="color:${scoreColor(bemfa.score)}">${bemfa.score}</span>/100</div>
                ${qualityBar(bemfa.score)}
                <div class="quality-row"><span class="quality-label">${I18N.t('quality.runtime')}</span><span>${formatDuration(bemfa.uptime)}</span></div>
                <div class="quality-row"><span class="quality-label">${I18N.t('quality.pingLost')}</span><span>${bemfa.ping_lost}/3</span></div>
                <div class="quality-row"><span class="quality-label">${I18N.t('quality.reconnectCount')}</span><span>${bemfa.reconnect_count}</span></div>`;
        }
        // Hover tooltip for each badge
        function setupBadgeTooltip(badgeId, tooltipId) {
            const badge = document.getElementById(badgeId);
            const tooltip = document.getElementById(tooltipId);
            if (!badge || !tooltip) return;
            badge.addEventListener('mouseenter', (e) => {
                if (_lastQuality) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    tooltip.style.left = rect.left + 'px';
                    tooltip.style.top = (rect.bottom + 8) + 'px';
                    tooltip.style.display = 'block';
                }
            });
            badge.addEventListener('mouseleave', () => {
                tooltip.style.display = 'none';
            });
        }
        setupBadgeTooltip('statusBadge', 'qualityTooltip');
        setupBadgeTooltip('mqttBadge', 'mqttTooltip');
        setupBadgeTooltip('bemfaBadge', 'bemfaTooltip');
        // Hide all tooltips on scroll or click outside
        function hideAllTooltips() {
            ['qualityTooltip', 'mqttTooltip', 'bemfaTooltip'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.style.display = 'none';
            });
        }
        document.addEventListener('scroll', hideAllTooltips, true);
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.status-badge')) hideAllTooltips();
        });

        function updateDeviceContainer(ports) {
            const unconnected = document.getElementById('unconnectedImg');
            const charger = document.getElementById('deviceChargerAnim');
            const glow = document.getElementById('darkGlowAni');
            const badge = document.getElementById('sceneBadgeAni');
            if (!unconnected || !charger) return;

            let totalW = 0;
            for (const [id, port] of Object.entries(ports || {})) {
                if (port.enabled !== false && port.power > 0) totalW += port.power;
            }

            const wrapInner = document.querySelector('.device-wrap-inner');

            if (totalW > 0) {
                unconnected.classList.remove('show');
                if (wrapInner) wrapInner.classList.remove('idle');
                charger.classList.add('charging');
                glow.classList.add('active');
                if (badge) badge.classList.remove('show');

                const portKeys = ['c1','c2','c3','a'];
                for (const key of portKeys) {
                    const p = ports[String(PORT_KEY_TO_ID[key])] || { voltage:0, current:0, power:0, enabled:false, protocol:'idle' };
                    const mod = document.getElementById('usbMod' + key.toUpperCase());
                    const pval = document.getElementById('usbPval' + key.toUpperCase());
                    const active = p.enabled && p.power > 0;
                    if (mod) mod.classList.toggle('active', active);
                    if (pval) pval.textContent = active ? p.power.toFixed(1) + 'W' : '0W';
                }
            } else {
                unconnected.classList.add('show');
                if (wrapInner) wrapInner.classList.add('idle');
                charger.classList.remove('charging');
                glow.classList.remove('active');
                ['c1','c2','c3','a'].forEach(k => {
                    const m = document.getElementById('usbMod' + k.toUpperCase());
                    if (m) m.classList.remove('active');
                });
                if (badge) badge.classList.remove('show');
            }
        }

        // Initialize if Chart.js is ready, otherwise wait for CDN fallback
        if (typeof Chart !== 'undefined') {
            initApp();
        } else {
            window.onChartReady = initApp;
        }

        // Charge History auto-refresh
        if (typeof startChargeHistoryAutoRefresh === 'function') {
            startChargeHistoryAutoRefresh('chargeSessionList', 'chargeStats', 'today', 2000);
        }

        // ── Locale change: re-render JS-built (dynamic) content ──
        // Static DOM text is re-translated by I18N.applyTranslations() automatically.
        function rerenderDynamic() {
            updateBleButton();
            if (powerChart && powerChart.data.datasets[4]) powerChart.data.datasets[4].label = I18N.t('power.totalLegend');
            renderPorts(latestPorts);
            if (Object.keys(lastSettings).length > 0) {
                const sg = document.getElementById('settingsGrid');
                if (sg) sg.innerHTML = buildSettingsHtml(lastSettings);
            }
            countdownRendered = false;
            renderCountdown(lastSettings);
            const fwEl = document.getElementById('firmwareVersion');
            if (fwEl && fwEl.dataset.firmware) fwEl.textContent = I18N.t('common.firmware', { version: fwEl.dataset.firmware });
            if (currentModalPort) {
                const rtBtn = document.getElementById('modalRealTimeBtn');
                if (rtBtn) rtBtn.textContent = modalRealTimePort !== null ? I18N.t('modal.realtimeStop') : I18N.t('modal.realtime');
                initModalChart();
                updateModalChart();
                renderModalProtocols();
            }
            if (_lastQuality) renderQuality(_lastQuality);
            if (typeof renderAutomation === 'function') renderAutomation();
        }
        if (typeof I18N !== 'undefined' && typeof I18N.onChange === 'function') {
            I18N.onChange(rerenderDynamic);
        }


// ══════════ 通知（Toast + 浏览器通知） ══════════
function showToast(title, message, level) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const el = document.createElement('div');
    el.className = 'toast ' + (level || '');
    el.innerHTML = '<div style="flex:1;min-width:0;"><div class="toast-title"></div><div class="toast-msg"></div></div><button class="toast-close">&times;</button>';
    el.querySelector('.toast-title').textContent = title;
    el.querySelector('.toast-msg').textContent = message || '';
    el.querySelector('.toast-close').onclick = () => dismiss(el);
    container.appendChild(el);
    setTimeout(() => dismiss(el), 6000);
    function dismiss(n) {
        if (!n.classList.contains('hide')) {
            n.classList.add('hide');
            setTimeout(() => n.remove(), 350);
        }
    }
}

function browserNotify(title, message) {
    try {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, { body: message || '', icon: '/static/favicon.ico' });
        }
    } catch (e) {}
}

function showNotify(msg) {
    const title = msg.title || I18N.t('notify.defaultTitle');
    const message = msg.message || '';
    showToast(title, message, msg.level);
    browserNotify(title, message);
}

function requestNotifyPermission() {
    if (!('Notification' in window)) {
        showToast(I18N.t('notify.unsupported'), '', 'warning');
        return;
    }
    if (Notification.permission === 'granted') {
        showToast(I18N.t('notify.permissionGranted'), '', 'success');
        return;
    }
    Notification.requestPermission().then(p => {
        if (p === 'granted') showToast(I18N.t('notify.permissionGranted'), '', 'success');
        else showToast(I18N.t('notify.permissionDenied'), '', 'danger');
    });
}

// ══════════ 自动化面板 ══════════
let automationData = null;
async function loadAutomation() {
    try {
        const res = await fetch(`${API_BASE}/api/automation`);
        const j = await res.json();
        if (j.ok) { automationData = j.data; renderAutomation(); }
    } catch (e) { console.error('loadAutomation', e); }
}

function renderAutomation() {
    const panel = document.getElementById('automationPanel');
    if (!panel) return;
    const d = automationData || { schedules: [] };
    const scheds = d.schedules || [];
    const isFull = scheds.length >= 50;
    let html = '';

    // 既有定时任务：固定高度滚动列表，逐行错落入场（刷新动画），不撑破卡片
    html += '<div class="schedule-list">';
    if (scheds.length) {
        scheds.forEach((s, idx) => {
            const pname = PORT_MAP[s.port] || s.port;
            html += '<div class="schedule-row" style="' + (s.enabled ? '' : 'opacity:.5') + 'animation-delay:' + (idx * 45) + 'ms">';
            html += '<span class="schedule-info"><span class="schedule-time">' + s.time + '</span><span>' + pname + '</span></span>';
            html += '<span class="schedule-action ' + s.action + '">' + (s.action === 'on' ? I18N.t('auto.scheduleOn') : I18N.t('auto.scheduleOff')) + '</span>';
            html += '<button class="theme-btn" onclick="toggleSchedule(' + s.id + ', ' + (!s.enabled) + ')">' + (s.enabled ? I18N.t('auto.schedulePause') : I18N.t('auto.scheduleResume')) + '</button>';
            html += '<button class="schedule-del" onclick="deleteSchedule(' + s.id + ')">' + I18N.t('auto.scheduleDelete') + '</button></div>';
        });
    } else {
        html += '<div class="schedule-empty">' + I18N.t('auto.scheduleEmpty') + '</div>';
    }
    html += '</div>';

    // 新增定时任务：固定在卡片底部，不参与滚动；满 5 个上限时隐藏表单并提示
    if (isFull) {
        html += '<div class="schedule-add schedule-add-limit"><span class="schedule-limit-tip">' + I18N.t('auto.scheduleLimitReached') + '</span></div>';
    } else {
        html += '<div class="schedule-add"><span class="schedule-limit-hint">' + I18N.t('auto.scheduleLimit') + '</span>';
        html += '<select id="schedPort" class="cuk-select">' + Object.entries(PORT_MAP).map(([id, name]) => `<option value="${id}">${name}</option>`).join('') + '</select>';
        html += '<input type="time" id="schedTime" class="cuk-select" value="23:00">';
        html += '<select id="schedAction" class="cuk-select"><option value="off">' + I18N.t('auto.scheduleOff') + '</option><option value="on">' + I18N.t('auto.scheduleOn') + '</option></select>';
        html += '<button class="schedule-add-btn" onclick="addSchedule()">' + I18N.t('auto.scheduleAdd') + '</button></div>';
    }
    panel.innerHTML = html;
}

async function setNotify(key, val) {
    try {
        const res = await fetch(`${API_BASE}/api/automation/notify`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ [key]: val }) });
        const j = await res.json();
        if (j.ok) automationData = j.data;
    } catch (e) { console.error(e); }
}

async function saveThreshold(key) {
    const min = parseFloat(document.getElementById('thrMin_' + key).value || 0);
    const max = parseFloat(document.getElementById('thrMax_' + key).value || 0);
    const port = PORT_KEY_TO_ID[key];
    const btn = document.getElementById('thrSave_' + key);
    try {
        const res = await fetch(`${API_BASE}/api/automation/threshold`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ port: port, min_w: min, max_w: max }) });
        const j = await res.json();
        if (j.ok) {
            automationData = j.data;
            btn.classList.add('saved');
            btn.textContent = I18N.t('auto.thresholdSaved');
            setTimeout(() => { btn.classList.remove('saved'); btn.textContent = I18N.t('auto.thresholdSave'); }, 1500);
        }
    } catch (e) { console.error(e); }
}

async function addSchedule() {
    const port = document.getElementById('schedPort').value;
    const time = document.getElementById('schedTime').value;
    const action = document.getElementById('schedAction').value;
    if (!time) return;
    const d = automationData || { schedules: [] };
    if ((d.schedules || []).length >= 50) {
        showToast(I18N.t('auto.scheduleLimitReached'), '', 'warning');
        return;
    }
    try {
        const res = await fetch(`${API_BASE}/api/automation/schedule`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ port: port, time: time, action: action }) });
        const j = await res.json();
        if (j.ok) { automationData = j.data; renderAutomation(); }
        else showToast(j.error || I18N.t('auto.scheduleLimitReached'), '', 'warning');
    } catch (e) { console.error(e); }
}

async function deleteSchedule(id) {
    try {
        const res = await fetch(`${API_BASE}/api/automation/schedule/delete`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: id }) });
        const j = await res.json();
        if (j.ok) { automationData = j.data; renderAutomation(); }
    } catch (e) { console.error(e); }
}

async function toggleSchedule(id, enabled) {
    try {
        const res = await fetch(`${API_BASE}/api/automation/schedule/toggle`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: id, enabled: enabled }) });
        const j = await res.json();
        if (j.ok) { automationData = j.data; renderAutomation(); }
    } catch (e) { console.error(e); }
}

function testNotify() {
    showToast(I18N.t('auto.testTitle'), I18N.t('auto.testMsg'), 'info');
    browserNotify(I18N.t('auto.testTitle'), I18N.t('auto.testMsg'));
}

// ══════════ 二维码 ══════════
function openQrModal() {
    const modal = document.getElementById('qrModal');
    if (!modal) return;
    const img = document.getElementById('qrImg');
    const urlEl = document.getElementById('qrUrl');
    if (img) img.src = `${API_BASE}/api/qrcode?ts=${Date.now()}`;
    fetch(`${API_BASE}/api/network`).then(r => r.json()).then(j => {
        if (j.ok && urlEl) urlEl.textContent = `http://${j.ip}:${j.port}/`;
    }).catch(() => {});
    modal.classList.add('show');
}
function closeQrModal() {
    const modal = document.getElementById('qrModal');
    if (modal) modal.classList.remove('show');
}

// ══════════ 导出 ══════════
function getPeriod() {
    const sel = document.getElementById('chargePeriod');
    return sel ? sel.value : 'all';
}
function exportCSV(kind) {
    const period = getPeriod();
    const url = kind === 'sessions'
        ? `${API_BASE}/api/export/sessions?period=${period}`
        : `${API_BASE}/api/export/energy?period=${period}`;
    window.open(url, '_blank');
}

// ══════════ 初始化 ══════════
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { loadAutomation(); });
} else {
    loadAutomation();
}
// 点击弹窗遮罩关闭
document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'qrModal') closeQrModal();
});


// ══════════ 自定义强调色 ══════════
function hexToRgb(hex) {
    const v = (hex || '#10b981').replace('#', '');
    const full = v.length === 3 ? v.split('').map(c => c + c).join('') : v;
    const n = parseInt(full, 16);
    if (isNaN(n)) return '16, 185, 129';
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255].join(', ');
}
function setAccent(color) {
    if (!color) return;
    localStorage.setItem('cuktech-accent', color);
    document.documentElement.style.setProperty('--accent', color);
    document.documentElement.style.setProperty('--accent-rgb', hexToRgb(color));
}
function applySavedAccent() {
    const c = localStorage.getItem('cuktech-accent');
    if (c) setAccent(c);
}


// ══════════ 数据可视化增强：数字动效 / 精度 / 图表渐变 ══════════
function hexToRgba(hex, a) {
    const v = (hex || '#03a9f4').replace('#', '');
    const full = v.length === 3 ? v.split('').map(c => c + c).join('') : v;
    const n = parseInt(full, 16);
    if (isNaN(n)) return 'rgba(3,169,244,' + a + ')';
    return 'rgba(' + ((n >> 16) & 255) + ', ' + ((n >> 8) & 255) + ', ' + (n & 255) + ', ' + a + ')';
}
const _tweenMap = new WeakMap();
function setNum(el, val, dec) {
    if (!el) return;
    const target = Number(val) || 0;
    const cur = parseFloat(el.textContent);
    const from = isNaN(cur) ? target : cur;
    if (from === target) { el.textContent = target.toFixed(dec); return; }
    const prev = _tweenMap.get(el);
    if (prev && prev.raf) cancelAnimationFrame(prev.raf);
    const t0 = performance.now(), dur = 320;
    const step = (now) => {
        const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        el.textContent = (from + (target - from) * e).toFixed(dec);
        if (k < 1) _tweenMap.set(el, { raf: requestAnimationFrame(step) });
    };
    _tweenMap.set(el, { raf: requestAnimationFrame(step) });
}
function areaGradient(color) {
    return (ctx) => {
        const ca = ctx.chart.chartArea;
        if (!ca) return 'rgba(0,0,0,0)';
        const g = ctx.chart.ctx.createLinearGradient(0, ca.top, 0, ca.bottom);
        g.addColorStop(0, hexToRgba(color, 0.32));
        g.addColorStop(1, hexToRgba(color, 0));
        return g;
    };
}
