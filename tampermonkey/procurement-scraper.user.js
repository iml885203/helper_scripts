// ==UserScript==
// @name         政府採購公開徵求自動查詢工具 v6
// @namespace    http://tampermonkey.net/
// @version      6.0.0
// @description  批次查詢多個機關代碼並匯出 Excel（直接 fetch，不跳轉頁面）
// @author       Logan
// @match        https://web.pcc.gov.tw/prkms/tpAppeal/common/*
// @icon         https://web.pcc.gov.tw/favicon.ico
// @require      https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js
// @grant        GM_addStyle
// ==/UserScript==

(function () {
    'use strict';

    GM_addStyle(`
        #procurement-panel {
            position: fixed;
            bottom: 110px;
            right: 30px;
            background: white;
            border: 2px solid #3b82f6;
            border-radius: 8px;
            padding: 16px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.2);
            z-index: 99998;
            min-width: 320px;
            max-width: 400px;
            font-family: "Microsoft JhengHei", Arial, sans-serif;
        }
        #procurement-panel h3 {
            margin: 0 0 12px 0;
            color: #1e40af;
            font-size: 16px;
        }
        #procurement-panel label {
            display: block;
            margin: 8px 0 4px 0;
            font-size: 13px;
            font-weight: bold;
        }
        #procurement-panel input, #procurement-panel textarea {
            width: 100%;
            padding: 8px;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            font-size: 13px;
            box-sizing: border-box;
        }
        #procurement-panel textarea {
            resize: vertical;
            min-height: 100px;
            font-family: monospace;
        }
        #procurement-panel button {
            width: 100%;
            margin-top: 8px;
            padding: 10px;
            border: none;
            border-radius: 4px;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
        }
        #procurement-panel .btn-primary {
            background: #3b82f6;
            color: white;
        }
        #procurement-panel .btn-primary:hover {
            background: #2563eb;
        }
        #procurement-panel .btn-primary:disabled {
            background: #9ca3af;
            cursor: not-allowed;
        }
        #procurement-panel .toggle-btn {
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 50%;
            width: 60px;
            height: 60px;
            font-size: 24px;
            cursor: pointer;
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
            z-index: 99999;
            transition: all 0.3s ease;
        }
        #procurement-panel .toggle-btn:hover {
            transform: scale(1.1);
            box-shadow: 0 8px 25px rgba(59, 130, 246, 0.6);
        }
        #procurement-panel .toggle-btn:hover {
            background: #2563eb;
        }
        #progress-info {
            margin-top: 12px;
            padding: 10px;
            background: #f3f4f6;
            border-radius: 4px;
            font-size: 12px;
            display: none;
            max-height: 200px;
            overflow-y: auto;
        }
        #progress-info div {
            margin: 4px 0;
        }
    `);

    let allResults = [];
    let isRunning = false;

    function createUI() {
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'toggle-btn';
        toggleBtn.textContent = '📋';
        toggleBtn.title = '開啟/關閉查詢面板';
        document.body.appendChild(toggleBtn);

        const panel = document.createElement('div');
        panel.id = 'procurement-panel';
        panel.style.display = 'none';
        panel.innerHTML = `
            <h3>🔍 批次查詢工具</h3>
            
            <label>機關代碼（每行一個）</label>
            <textarea id="org-codes" placeholder="一行一個機關代碼，例如：&#10;3.79.73&#10;3.79.74">3.79.73</textarea>
            
            <label>查詢起始日期（民國年）</label>
            <input type="text" id="start-date" placeholder="115/02/01" value="115/02/01" />
            
            <label>查詢結束日期（民國年）</label>
            <input type="text" id="end-date" placeholder="115/02/28" value="115/02/28" />
            
            <button class="btn-primary" id="start-query">開始批次查詢</button>
            
            <div id="progress-info"></div>
        `;
        document.body.appendChild(panel);

        toggleBtn.addEventListener('click', () => {
            const isVisible = panel.style.display !== 'none';
            panel.style.display = isVisible ? 'none' : 'block';
        });

        document.getElementById('start-query').addEventListener('click', startBatchQuery);
        loadSettings();
    }

    function loadSettings() {
        const saved = localStorage.getItem('procurement-settings-v6');
        if (saved) {
            const settings = JSON.parse(saved);
            document.getElementById('org-codes').value = settings.orgCodes || '3.79.73';
            document.getElementById('start-date').value = settings.startDate || '115/02/01';
            document.getElementById('end-date').value = settings.endDate || '115/02/28';
        }
    }

    function saveSettings() {
        const settings = {
            orgCodes: document.getElementById('org-codes').value,
            startDate: document.getElementById('start-date').value,
            endDate: document.getElementById('end-date').value
        };
        localStorage.setItem('procurement-settings-v6', JSON.stringify(settings));
    }

    // 民國年轉西元年
    function rocToAdYear(rocDate) {
        // 115/02/01 → 2026/02/01
        const match = rocDate.match(/^(\d+)\/(\d+)\/(\d+)$/);
        if (!match) return rocDate;
        const year = parseInt(match[1]) + 1911;
        return `${year}/${match[2]}/${match[3]}`;
    }

    async function startBatchQuery() {
        if (isRunning) {
            alert('查詢進行中，請稍候...');
            return;
        }

        saveSettings();

        const orgCodesText = document.getElementById('org-codes').value;
        const startDateRoc = document.getElementById('start-date').value;
        const endDateRoc = document.getElementById('end-date').value;

        if (!orgCodesText.trim()) {
            alert('請輸入機關代碼');
            return;
        }

        const orgCodes = orgCodesText.split('\n')
            .map(c => c.trim())
            .filter(c => c.length > 0);

        if (orgCodes.length === 0) {
            alert('沒有有效的機關代碼');
            return;
        }

        // 轉換成西元年
        const startDate = rocToAdYear(startDateRoc);
        const endDate = rocToAdYear(endDateRoc);

        isRunning = true;
        allResults = [];

        const btn = document.getElementById('start-query');
        btn.disabled = true;
        btn.textContent = '⏳ 查詢中...';

        showProgress(`準備查詢 ${orgCodes.length} 個機關...`);
        showProgress(`日期範圍：${startDateRoc} ~ ${endDateRoc}`);

        for (let i = 0; i < orgCodes.length; i++) {
            const orgCode = orgCodes[i];
            showProgress(`<strong>[${i + 1}/${orgCodes.length}] ${orgCode}</strong>`);

            try {
                const results = await queryOrganization(orgCode, startDate, endDate);
                allResults.push(...results);
                showProgress(`✅ ${orgCode}: 找到 ${results.length} 筆`);
            } catch (error) {
                console.error(`查詢 ${orgCode} 失敗:`, error);
                showProgress(`❌ ${orgCode}: ${error.message || '查詢失敗'}`);
            }

            await sleep(1500);
        }

        showProgress(`<strong>✅ 查詢完成！共 ${allResults.length} 筆資料</strong>`);

        if (allResults.length > 0) {
            await sleep(1000);
            exportExcel();
            showProgress(`<strong>📥 Excel 已下載！</strong>`);
        } else {
            alert('查詢完成，但沒有找到任何資料');
        }

        btn.disabled = false;
        btn.textContent = '開始批次查詢';
        isRunning = false;
    }

    async function queryOrganization(orgCode, startDate, endDate) {
        // 直接構造查詢 URL（用 fetch，不跳轉頁面）
        const url = `https://web.pcc.gov.tw/prkms/tpAppeal/common/readTpAppeal?` +
            `pageSize=&firstSearch=false` +
            `&orgId=${encodeURIComponent(orgCode)}` +
            `&tenderId=&orgName=&tenderName=` +
            `&startDate=${encodeURIComponent(startDate)}` +
            `&endDate=${encodeURIComponent(endDate)}` +
            `&d-4025577-n=1&d-4025577-o=1&d-4025577-s=startDate&d-4025577-p=1`;

        const response = await fetch(url);
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // 從 HTML 抓取列表資料
        const listData = extractListDataFromDoc(doc);

        if (listData.length === 0) {
            return [];
        }

        // 抓取詳細資料
        const detailedResults = [];
        for (let i = 0; i < listData.length; i++) {
            showProgress(`  → 詳細資料 ${i + 1}/${listData.length}...`);
            const detail = await fetchDetailData(listData[i].檢視連結);
            detailedResults.push({ ...listData[i], ...detail });
            await sleep(700);
        }

        return detailedResults;
    }

    function extractListDataFromDoc(doc) {
        const results = [];
        const rows = doc.querySelectorAll('table tbody tr');

        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length === 7) {
                const viewLink = cells[6].querySelector('a');
                const href = viewLink ? viewLink.getAttribute('href') : '';
                const fullUrl = href ? `https://web.pcc.gov.tw${href}` : '';

                results.push({
                    項次: cells[0].textContent.trim(),
                    機關名稱: cells[1].textContent.trim(),
                    標案案號: cells[2].textContent.trim(),
                    標案名稱: cells[3].textContent.trim(),
                    公告次數: cells[4].textContent.trim(),
                    公開徵求期間: cells[5].textContent.trim().replace(/\s+/g, ' '),
                    檢視連結: fullUrl
                });
            }
        });

        return results;
    }

    async function fetchDetailData(url) {
        if (!url) return {};

        try {
            const response = await fetch(url);
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            const data = {};
            const rows = doc.querySelectorAll('table tr');
            rows.forEach(row => {
                const cells = row.querySelectorAll('td');
                if (cells.length === 2) {
                    const key = cells[0].textContent.trim();
                    const value = cells[1].textContent.trim();
                    data[key] = value;
                }
            });

            return {
                機關代碼: data['機關代碼'] || '',
                機關地址: (data['機關地址'] || '').replace(/\s+/g, ' '),
                公告日期: data['公告日期'] || '',
                聯絡人: data['聯絡人'] || '',
                聯絡電話: data['聯絡電話'] || '',
                電子郵件: data['電子郵件信箱'] || '',
                內容摘要: data['內容摘要'] || '',
                附加說明: (data['附加說明'] || '').replace(/\s+/g, ' ')
            };
        } catch (error) {
            console.error('抓取詳細資料失敗:', url, error);
            return {};
        }
    }

    function exportExcel() {
        if (allResults.length === 0) {
            alert('沒有資料可匯出');
            return;
        }

        const excelData = allResults.map(item => ({
            '項次': item.項次,
            '機關代碼': item.機關代碼,
            '機關名稱': item.機關名稱,
            '機關地址': item.機關地址,
            '標案案號': item.標案案號,
            '標案名稱': item.標案名稱,
            '公告日期': item.公告日期,
            '公開徵求期間': item.公開徵求期間,
            '聯絡人': item.聯絡人,
            '聯絡電話': item.聯絡電話,
            '電子郵件': item.電子郵件,
            '內容摘要': item.內容摘要,
            '附加說明': item.附加說明,
            '案件連結': item.檢視連結
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(excelData);

        ws['!cols'] = [
            { wch: 6 }, { wch: 12 }, { wch: 20 }, { wch: 35 },
            { wch: 12 }, { wch: 45 }, { wch: 12 }, { wch: 22 },
            { wch: 20 }, { wch: 18 }, { wch: 28 },
            { wch: 50 }, { wch: 50 }, { wch: 50 }
        ];

        XLSX.utils.book_append_sheet(wb, ws, '公開徵求');

        const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const filename = `政府採購公開徵求_${today}.xlsx`;
        XLSX.writeFile(wb, filename);
    }

    function showProgress(message) {
        const progressDiv = document.getElementById('progress-info');
        const line = document.createElement('div');
        line.innerHTML = message;
        progressDiv.appendChild(line);
        progressDiv.style.display = 'block';
        progressDiv.scrollTop = progressDiv.scrollHeight;
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createUI);
    } else {
        createUI();
    }

    console.log('政府採購查詢工具 v6 已載入（直接 fetch，避免頁面跳轉）');
})();
