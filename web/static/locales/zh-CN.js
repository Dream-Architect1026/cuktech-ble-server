/*!
 * zh-CN locale pack for the CUKTECH BLE web UI.
 * Values reproduce the original Chinese UI exactly.
 */
(function (global) {
    'use strict';
    global.I18N_RESOURCES = global.I18N_RESOURCES || {};
    global.I18N_RESOURCES['zh-CN'] = {
        // ── Common ──
        common: {
            connect: '连接设备',
            disconnect: '断开设备',
            restart: '重启',
            close: '关闭',
            cancel: '取消',
            set: '设置',
            clear: '清除',
            clearing: '清除中...',
            setting: '设置中...',
            saving: '保存中...',
            notSet: '未设置',
            loading: '加载中...',
            connected: '已连接',
            connecting: '认证中...',
            connectingDots: '连接中...',
            disconnecting: '断开中...',
            disconnected: '未连接',
            unknownError: '未知错误',
            networkError: '网络错误: {{msg}}',
            saveFailed: '保存失败: {{msg}}',
            setFailed: '设置失败: {{msg}}',
            firmware: '固件版本：{{version}}',
            theme: '主题',
            logs: '日志',
            minutes: '{{count}}分钟',
            durationH: '{{h}}小时{{m}}分',
            durationM: '{{m}}分钟'
        },

        // ── Power units ──
        power: {
            total: '总功率 (W)',
            totalLegend: '总功率',
            maxVoltage: '最高电压 (V)',
            realtimeCurrent: '实时电流 (A)',
            voltage: '电压 V',
            current: '电流 A',
            power: '功率 W',
            activePorts: '活跃端口 (路)',
            loadRate: '负载率 (%)'
        },

        // ── 端口卡片：工作状态 / 充电协议 ──
        port: {
            idle: '空闲',
            working: '工作中',
            protocol: '协议',
            sessionTime: '本次充电',
            countdownLeft: '倒计时',
            reachedLimit: '已达上限',
            protectedOff: '已保护断开'
        },

        // ── Index page ──
        index: {
            connectionStatus: '连接状态',
            bleControl: 'BLE 控制',
            powerChart: '功率曲线',
            portMonitor: '端口监控',
            clickForDetail: '(点击查看详情)',
            chargeHistory: '充电记录',
            deviceSettings: '设备设置',
            config: '配置',
            themeDark: '暗色',
            themeDeepBlue: '深蓝',
            themeOcean: '海洋',
            themeGray: '灰色',
            themeLight: '浅色',
            themeSystem: '跟随系统',
            range1m: '1分',
            range5m: '5分',
            range10m: '10分',
            range30m: '30分',
            range1h: '1小时',
            themeCustom: '自定义',
            qrAccess: '手机访问',
            qrTip: '使用手机相机扫码，打开手机版控制页'
        },

        chart: {
            backLive: '回到实时',
            hint: '滚轮缩放 · 拖拽平移 · 双击回到实时 · 单击查看该时刻详情',
            idle: '该时刻空闲'
        },

        // ── Scene modes (device) ──
        scene: {
            ai: 'AI模式',
            eco: '数码生态',
            single: '单口模式',
            balanced: '均衡模式',
            descAi: '自动识别设备智能匹配最优充电功率',
            descEco: '多口同时充电均衡分配功率',
            descSingle: '单口最大功率输出优先C1口',
            descBalanced: '多个端口均衡分配充电功率'
        },

        // ── Device settings (PIID config) ──
        settings: {
            sceneMode: '场景模式',
            screenTimeout: '息屏时间',
            deviceLanguage: '语言',
            usbATrickle: 'USB-A小电流',
            idleScreenOff: '空闲息屏',
            screenLock: '屏幕方向锁',
            off: '关闭',
            on: '开启',
            min5: '5分钟',
            min10: '10分钟',
            min30: '30分钟',
            alwaysOn: '常亮',
            min1: '1分钟',
            langEn: '英文',
            langZh: '中文'
        },

        // ── Port detail modal ──
        modal: {
            portDetail: '{{port}} 端口详情',
            voltage: '电压 (V)',
            current: '电流 (A)',
            power: '功率 (W)',
            protocol: '实时充电协议',
            realtime: '⚡ 实时',
            realtimeStop: '⏹ 实时',
            protocolSwitch: '协议开关',
            noData: '协议开关 — 暂无数据',
            ppsNote: '关闭PD后PPS也将关闭',
            replugNote: '需重新插拔端口设备生效',
            idle: '空闲'
        },

        // ── Connection quality tooltips ──
        quality: {
            connectionDuration: '连接时长',
            lastPush: '最后推送',
            nextReconnect: '下次重连',
            decryptSuccess: '解密成功',
            notifyResponse: '通知响应',
            connectionStable: '连接稳定',
            reconnect5m: '5min重连',
            runtime: '运行时长',
            disconnects: '断连次数',
            publishFailures: '发送失败',
            pingLost: 'Ping丢包',
            reconnectCount: '重连次数',
            notConnected: '未连接',
            none: '无',
            secondsAgo: '{{count}}s前',
            secondsLater: '{{count}}s后',
            times: '{{count}}次'
        },

        // ── Countdown ──
        countdown: {
            title: '倒计时设置',
            placeholder: '分钟',
            quick: '{{count}}分'
        },

        // ── Charge history ──
        charge: {
            localStored: '本地存储',
            today: '今日',
            yesterday: '昨日',
            week: '本周',
            month: '本月',
            all: '全部',
            totalWh: '总充电 Wh',
            sessionCount: '充电次数',
            avgPower: '平均功率 W',
            peakPower: '峰值功率 W',
            noRecords: '暂无充电记录',
            energy: '电量：{{wh}}Wh',
            powerTooltip: '功率: {{power}}W',
            protocolTooltip: '协议: {{protocol}}',
            prevPage: '上一页',
            nextPage: '下一页',
            accuracy: '精度',
            allPoints: '全部',
            points100: '100点',
            points200: '200点',
            points300: '300点',
            points600: '600点',
            energyUnit: '电量 Wh',
            avgPowerUnit: '均功率 W',
            peakPowerUnit: '峰功率 W',
            avgVoltageUnit: '均电压 V',
            avgCurrentUnit: '均电流 A',
            yesterdayTime: '昨天 {{time}}'
        },

        // ── Phone page ──
        phone: {
            sceneMode: '场景模式',
            portControl: '端口控制',
            screenTimeout: '息屏时间',
            usbATrickle: 'USB-A小电流',
            totalPowerTitle: '当前总功率',
            currentPower: '当前功率',
            powerChart: '功率曲线',
            powerDist: '功率占比',
            chargeHistory: '充电记录',
            delayOff: '延时关闭',
            noActivePorts: '暂无活跃端口',
            connectToast: '正在连接设备，请稍候...',
            replugNote: '需重新插拔端口'
        },

        // ── Config page ──
        config: {
            title: '系统配置',
            bleDevice: 'BLE 设备',
            xiaomiAuto: '小米云自动获取',
            mac: 'MAC 地址',
            macHint: '充电器蓝牙 MAC 地址',
            tokenHint: '设备认证 Token (十六进制)',
            bleKeyHint: '加密密钥 (十六进制)',
            mqttSection: 'MQTT (Home Assistant)',
            enableMqtt: '启用 MQTT',
            server: '服务器',
            serverHint: 'MQTT Broker 地址',
            port: '端口',
            username: '用户名',
            password: '密码',
            optional: '可选',
            topicPrefix: 'Topic 前缀',
            topicHint: 'MQTT 主题前缀',
            bemfaSection: '巴法云',
            bemfaRegister: '注册获取私钥',
            enableBemfa: '启用巴法云',
            privateKey: '私钥',
            privateKeyHint: '巴法云用户 私钥',
            placeholderUid: '巴法云 私钥',
            portName: '{{port}} 端口名称',
            portNameHint: '巴法云设备显示名',
            bleStatusName: '蓝牙状态名称',
            serverSection: '服务器',
            webPort: 'Web 端口',
            retention: '数据保留天数',
            webLanguage: '界面语言',
            webLanguageHint: '即时生效，无需重启；所有页面自动同步',
            langAuto: '跟随系统',
            langApplied: '语言已切换',
            langAutoApplied: '已切换到跟随系统',
            sessionRecording: '充电会话记录',
            sessionRecordingHint: '即时生效，无需重启；关闭后不再记录充电历史',
            notifySection: '通知设置',
            currentStatus: '当前状态',
            // PRD 需求1/2/4
            serviceSection: '服务管理',
            autoStart: '开机自启动',
            autoStartHint: '登录 Windows 后后台静默常驻（即时生效，无需保存重启）',
            autoStartOn: '已开启开机自启动',
            autoStartOff: '已关闭开机自启动',
            runtimeState: '充电服务运行状态',
            runtimeHint: '停止后暂停充电控制与自动保护，网页仍可访问，可随时恢复（即时生效）',
            running: '运行中',
            stopped: '已停止',
            runtimeOn: '充电服务已恢复运行',
            runtimeOff: '充电服务已停止',
            dailyRestart: '每日定时重启',
            dailyRestartHint: '到点自动重启服务进程以释放累积资源（随保存生效）',
            limitSection: '端口最大充电时长',
            limitHint: '单位分钟，0 表示不限制；达到上限自动断电。首页实时显示本次充电时长，剩余≤10 分钟或已用 80% 变橙，达上限变红。',
            minutesUnit: '分钟',
            protectSection: '智能充电保护',
            protectHint: '仅 C1、C2 生效，C3 / USB-A 不受影响。单次连续充电中实时功率低于阈值并持续设定时长，将硬性断开并记录原因与时间。',
            protectSwitch: '保护总开关',
            lowPowerW: '低功率触发阈值',
            lowPowerMin: '低功率持续时长',
            loaded: '配置已加载',
            loadFailed: '加载失败: {{msg}}',
            saveRestart: '保存配置并重启',
            savedRestart: '配置已保存，服务正在重启...',
            sessionRecordingOn: '已开启充电会话记录',
            sessionRecordingOff: '已关闭充电会话记录',
            xiaomiLogin: '小米云登录',
            serverRegion: '服务器区域',
            regionCn: '中国大陆 (cn)',
            regionDe: '欧洲 (de)',
            regionUs: '美国 (us)',
            regionRu: '俄罗斯 (ru)',
            regionTw: '台湾 (tw)',
            regionSg: '新加坡 (sg)',
            regionIn: '印度 (in)',
            getQR: '获取二维码',
            fetching: '获取中...',
            connectingXiaomi: '正在连接小米云...',
            qrFailed: '获取二维码失败',
            qrLoadFailed: '二维码加载失败',
            waitingScan: '等待扫码...',
            scanInstruction: '请用米家 App 扫描二维码登录',
            scanWithApp: '使用<strong style="color:#333;">米家 App</strong> 扫描下方二维码',
            orOpenLink: '或复制链接到浏览器打开：',
            scanned: '已完成扫码',
            scanTimeout: '等待超时，请重新获取二维码',
            noDevices: '未找到设备',
            selectCharger: '选择充电器设备：',
            fetchingBleKey: '正在获取 BLE Key...',
            bleKeyFailed: '获取 BLE Key 失败: {{msg}}',
            deviceInfoGot: '已获取设备信息，请检查后保存',
            placeholderC1: 'C口1开关',
            placeholderC2: 'C口2开关',
            placeholderC3: 'C口3开关',
            placeholderA: 'USB-A开关',
            placeholderBle: '蓝牙开关'
        },

        // ── Device info (HA iframe) ──
        deviceInfo: {
            activePorts: '活跃端口'
        },

        // ── 自动化与通知 ──
        auto: {
            title: '自动化与通知',
            notifyTitle: '通知设置',
            notifyStart: '充电开始提醒',
            notifyStartSub: '端口检测到充电时提醒',
            notifyEnd: '充电结束提醒',
            notifyEndSub: '端口停止充电时提醒',
            notifyThreshold: '功率告警提醒',
            notifyThresholdSub: '功率越过限值时提醒',
            enableBrowserNotify: '开启浏览器通知',
            testNotify: '测试通知',
            testTitle: '测试通知',
            testMsg: '酷态科10号 通知链路正常，功率告警 / 充电提醒将实时推送',
            thresholdTitle: '功率告警阈值',
            thresholdMin: '下限',
            thresholdMax: '上限',
            thresholdHint: '阈值设为 0 表示不限制；低于下限或超过上限触发提醒（60秒最多一次）',
            thresholdSave: '保存',
            thresholdSaved: '已保存',
            scheduleTitle: '定时控制',
            scheduleEmpty: '暂无定时任务，可在下方添加',
            scheduleOn: '开启',
            scheduleOff: '关闭',
            schedulePause: '暂停',
            scheduleResume: '启用',
            scheduleDelete: '删除',
            scheduleAdd: '添加',
            scheduleLimit: '最多可添加 50 个定时任务',
            scheduleLimitReached: '已达上限（50 个），请先删除再添加',
            exportSessions: '会话CSV',
            exportDaily: '日报CSV'
        },

        // ── 通知 ──
        notify: {
            defaultTitle: '酷态科10号',
            permissionGranted: '已开启浏览器通知',
            permissionDenied: '通知权限被拒绝，请在浏览器地址栏允许',
            unsupported: '当前浏览器不支持通知'
        },
        // ── Page titles ──
        pageTitle: {
            index: '酷态科10号充电器',
            phone: '酷态科10号充电器',
            config: '酷态科配置'
        }
    };
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
