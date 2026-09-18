// Shared chart configuration and utilities (v13 — real-time ranges)
// 可选区间（分钟）：1 / 5 / 10 / 30 / 60
const RANGE_MINUTES = [1, 5, 10, 30, 60];
// 历史聚合桶粒度（秒）。服务端 /api/chart 最小支持 5s；1 分区间以实时 1s 点为主
const HISTORY_INTERVALS = { 1: 5, 5: 5, 10: 10, 30: 15, 60: 30 };
// 单次历史拉取最多点数
const MAX_POINTS_MAP = { 1: 60, 5: 60, 10: 60, 30: 120, 60: 120 };
// 整点特效 / 主网格步长（秒）：随区间变化
const TICK_STEP = { 1: 15, 5: 30, 10: 60, 30: 120, 60: 300 };
// 实时环形缓冲保留时长（秒）——覆盖最长区间 60 分
const LIVE_BUFFER_SECONDS = 3600;

let _currentHours = parseInt(localStorage.getItem('cuktech-chart-hours') || '1', 10) / 60;

function currentMinutes() { return Math.round(_currentHours * 60); }
function getMaxPoints() { return MAX_POINTS_MAP[currentMinutes()] || 120; }
function getInterval() { return HISTORY_INTERVALS[currentMinutes()] || 10; }
function getTickStepSec() { return TICK_STEP[currentMinutes()] || 60; }
function setCurrentHours(hours) { _currentHours = hours; }
function getCurrentHours() { return _currentHours; }

// 时间标签格式：1 分区间精确到秒，其余到分
function formatChartLabel(epochSec, withSeconds) {
    const d = new Date(epochSec * 1000);
    const p = (n) => String(n).padStart(2, '0');
    return p(d.getHours()) + ':' + p(d.getMinutes()) + (withSeconds ? ':' + p(d.getSeconds()) : '');
}

function getChartColors() {
    const cs = getComputedStyle(document.documentElement);
    return {
        c1: cs.getPropertyValue('--port-c1').trim() || '#03a9f4',
        c2: cs.getPropertyValue('--port-c2').trim() || '#7c4dff',
        c3: cs.getPropertyValue('--port-c3').trim() || '#389e3d',
        a: cs.getPropertyValue('--port-a').trim() || '#ffa42b',
        text: cs.getPropertyValue('--text').trim() || '#e1e1e1',
        textDim: cs.getPropertyValue('--text-dim').trim() || '#959595',
        accent: cs.getPropertyValue('--accent').trim() || '#03a9f4',
    };
}
