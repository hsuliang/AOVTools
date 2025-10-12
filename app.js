document.addEventListener('DOMContentLoaded', () => {
    
    // --- 元素選取 ---
    const globalLoadingOverlay = document.getElementById('global-loading-overlay');
    const apiKeyButton = document.getElementById('api-key-button');
    const apiKeyModal = document.getElementById('api-key-modal');
    const saveApiKeyButton = document.getElementById('save-api-key');
    const cancelApiKeyButton = document.getElementById('cancel-api-key');
    const apiKeyInput = document.getElementById('api-key-input');
    
    // ▼▼▼ 主選項卡元素選取 ▼▼▼
    const tabSubtitleButton = document.getElementById('tab-subtitle-button');
    const tabBlogButton = document.getElementById('tab-blog-button');
    const subtitleTabContent = document.getElementById('subtitle-tab-content');
    const blogTabContent = document.getElementById('blog-tab-content');
    // ▲▲▲ 主選項卡元素選取 ▲▲▲

    const srtFileInput = document.getElementById('srt-file-input');
    const subtitlePreviewArea = document.getElementById('subtitle-preview-area');
    const exportSrtButton = document.getElementById('export-srt-button');
    const processSubtitlesButton = document.getElementById('process-subtitles-button');
    const batchReplaceButton = document.getElementById('batch-replace-button');
    const clearContentButton = document.getElementById('clear-content-button'); // 清除按鈕
    
    // 字幕處理選項 (Input)
    const charLimitInput = document.getElementById('char-limit-input');
    const removePunctuationCheckbox = document.getElementById('remove-punctuation-checkbox');
    const gapThresholdInput = document.getElementById('gap-threshold-input');
    const mergeThresholdInput = document.getElementById('merge-threshold-input');

    const replaceModal = document.getElementById('replace-modal');
    const replaceRulesContainer = document.getElementById('replace-rules-container');
    const addRuleButton = document.getElementById('add-rule-button');
    const cancelReplaceButton = document.getElementById('cancel-replace-button'); 
    const applyReplaceButton = document.getElementById('apply-replace-button');
    const generateChaptersButton = document.getElementById('generate-chapters-button');
    
    // ▼▼▼ 報告 Modal 元素選取 ▼▼▼
    const reportModal = document.getElementById('report-modal');
    const reportModalOutput = document.getElementById('report-modal-output');
    const closeReportModalButton = document.getElementById('close-report-modal-button');
    // ▲▲▲ 報告 Modal 元素選取 ▲▲▲

    const chaptersModal = document.getElementById('chapters-modal');
    const chaptersModalOutput = document.getElementById('chapters-modal-output');
    const copyChaptersModalButton = document.getElementById('copy-chapters-modal-button');
    const closeChaptersModalButton = document.getElementById('close-chapters-modal-button');
    const generateBlogButton = document.getElementById('generate-blog-button');
    const blogTitleInput = document.getElementById('blog-title-input');
    const youtubeIdInput = document.getElementById('youtube-id-input');
    const ctaPresetSelect = document.getElementById('cta-preset-select');
    const customCtaContainer = document.getElementById('custom-cta-container');
    const ctaInput = document.getElementById('cta-input');
    const blogPreviewOutput = document.getElementById('blog-preview-output');
    const downloadHtmlButton = document.getElementById('download-html-button');
    const seoTitleOutput = document.getElementById('seo-title-output');
    const permalinkOutput = document.getElementById('permalink-output');
    const descriptionOutput = document.getElementById('description-output');
    const labelsOutput = document.getElementById('labels-output');
    const copySeoTitleButton = document.getElementById('copy-seo-title-button');
    const copyPermalinkButton = document.getElementById('copy-permalink-button');
    const copyDescriptionButton = document.getElementById('copy-description-button');
    const copyLabelsButton = document.getElementById('copy-labels-button');

    // --- 全域變數 ---
    const API_KEY_STORAGE_KEY = 'gemini_api_key';
    const EXPIRATION_HOURS = 2;
    let originalSubtitles = []; 
    let processedSubtitles = [];
    const PRESET_CTAS = {
        pupu: `<h2>喜歡噗噗聊聊嗎？</h2><p>如果你想要了解更多關於教育及<a href="https://bit.ly/PuChatPodcast" target="_blank" rel="noopener">Podcast</a>的內容，歡迎追蹤我們的節目，一起探索教育的無限可能。</p><ul><li><a href="https://bit.ly/PuChatFB">噗噗聊聊粉絲專頁</a></li><li><a href="https://bit.ly/PuChatYT">噗噗聊聊Youtube頻道</a></li><li><a href="https://bit.ly/PuChatPodcast">噗噗聊聊Podcast</a></li><li><a href="https://bit.ly/aliangblog">ㄚ亮笑長練功坊Blog</a></li></ul>`,
        izakaya: `<h2>🎁 喜歡我們的課程嗎？</h2><p>如果你想要學習更多學科教學知識與科技應用，歡迎訂閱謙懿科技Youtube頻道，記得按讚追蹤我們的節目，一起探索教育的無限可能。</p><ul><li>謙懿科技Youtube：<a href="http://www.youtube.com/@morganfang0905" target="_blank">http://www.youtube.com/@morganfang0905</a></li><li>ㄚ亮笑長練功坊Blog：<a href="https://bit.ly/aliangblog" target="_blank">https://bit.ly/aliangblog</a></li></ul>`
    };

    // --- 初始化 ---
    initializeCta();
    updateButtonStatus();
    showMainTab('subtitle'); // 預設顯示字幕處理 Tab
    
    // ▼▼▼ 報告 Modal 關閉邏輯 ▼▼▼
    if (closeReportModalButton) closeReportModalButton.addEventListener('click', () => {
        if (reportModal) reportModal.classList.add('hidden');
    });
    // ▲▲▲ 報告 Modal 關閉邏輯 ▲▲▲

    // ▼▼▼ 主選項卡切換邏輯 ▼▼▼
    if (tabSubtitleButton) tabSubtitleButton.addEventListener('click', () => showMainTab('subtitle'));
    if (tabBlogButton) tabBlogButton.addEventListener('click', () => showMainTab('blog'));

    function showMainTab(tabName) {
        // 確保元素存在
        if (!subtitleTabContent || !blogTabContent || !tabSubtitleButton || !tabBlogButton) return;

        // 隱藏所有內容
        subtitleTabContent.classList.add('hidden');
        blogTabContent.classList.add('hidden');

        // 重設所有按鈕樣式
        tabSubtitleButton.classList.remove('border-indigo-600', 'text-indigo-600');
        tabSubtitleButton.classList.add('border-transparent', 'text-gray-500');
        tabBlogButton.classList.remove('border-indigo-600', 'text-indigo-600');
        tabBlogButton.classList.add('border-transparent', 'text-gray-500');

        // 顯示選定的內容並設定樣式
        if (tabName === 'subtitle') {
            subtitleTabContent.classList.remove('hidden');
            tabSubtitleButton.classList.add('border-indigo-600', 'text-indigo-600');
            tabSubtitleButton.classList.remove('border-transparent', 'text-gray-500');
        } else if (tabName === 'blog') {
            blogTabContent.classList.remove('hidden');
            tabBlogButton.classList.add('border-indigo-600', 'text-indigo-600');
            tabBlogButton.classList.remove('border-transparent', 'text-gray-500');
        }
    }
    // ▲▲▲ 主選項卡切換邏輯 ▲▲▲

    // --- API 金鑰管理 ---
    if (apiKeyButton) apiKeyButton.addEventListener('click', () => apiKeyModal.classList.remove('hidden'));
    if (cancelApiKeyButton) cancelApiKeyButton.addEventListener('click', () => apiKeyModal.classList.add('hidden'));
    if (saveApiKeyButton) saveApiKeyButton.addEventListener('click', () => {
        const apiKey = apiKeyInput.value.trim();
        if (!apiKey) {
            console.error('API KEY 欄位不可為空！'); return;
        }
        const expirationTime = new Date().getTime() + EXPIRATION_HOURS * 60 * 60 * 1000;
        sessionStorage.setItem(API_KEY_STORAGE_KEY, JSON.stringify({ key: apiKey, expires: expirationTime }));
        console.log('API KEY 儲存成功！');
        apiKeyInput.value = '';
        apiKeyModal.classList.add('hidden');
        updateButtonStatus();
    });

    function getApiKey() {
        const keyDataString = sessionStorage.getItem(API_KEY_STORAGE_KEY);
        if (!keyDataString) return null;
        const keyData = JSON.parse(keyDataString);
        if (new Date().getTime() > keyData.expires) {
            sessionStorage.removeItem(API_KEY_STORAGE_KEY);
            console.error('API KEY 已過期，請重新設定。');
            return null;
        }
        return keyData.key;
    }

    function updateButtonStatus() {
        if (getApiKey()) {
            if (apiKeyButton) {
                apiKeyButton.textContent = 'API KEY 已設定';
                apiKeyButton.classList.add('bg-green-600');
            }
        } else {
            if (apiKeyButton) {
                apiKeyButton.textContent = '設定 API KEY';
                apiKeyButton.classList.remove('bg-green-600');
            }
        }
    }

    // --- 字幕檔案處理 ---
    if (srtFileInput) srtFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                originalSubtitles = parseSrt(e.target.result);
                processedSubtitles = []; 
                renderSubtitles(originalSubtitles);
                if (generateChaptersButton) generateChaptersButton.disabled = false;
                if (generateBlogButton) generateBlogButton.disabled = false;
            } catch (error) {
                console.error("解析 SRT 檔案時發生錯誤:", error);
                // 使用 console.error 替代 alert 避免 iFrame 問題
                console.error('無法解析 SRT 檔案，請確認格式。'); 
            }
        };
        reader.readAsText(file);
    });

    function parseSrt(srtContent) {
        const subtitles = [];
        const blocks = srtContent.trim().split(/\n\s*\n/);
        for (const block of blocks) {
            const lines = block.split('\n');
            if (lines.length >= 2) {
                const id = lines[0];
                const timeMatch = lines[1].match(/(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/);
                if (timeMatch) {
                    subtitles.push({ id, startTime: timeMatch[1], endTime: timeMatch[2], text: lines.slice(2).join('\n') });
                }
            }
        }
        return subtitles;
    }

    function renderSubtitles(subtitles) {
        if (!subtitlePreviewArea) return;
        subtitlePreviewArea.innerHTML = '';
        if (subtitles.length === 0) {
            subtitlePreviewArea.innerHTML = '<p class="text-gray-400 text-center mt-4">此處將顯示載入的字幕...</p>';
            return;
        }
        const content = subtitles.map(sub => `${sub.id}\n${sub.startTime} --> ${sub.endTime}\n${sub.text}`).join('\n\n');
        subtitlePreviewArea.textContent = content;
    }
    
    // --- 批次取代 Modal 邏輯 ---
    if (batchReplaceButton) batchReplaceButton.addEventListener('click', () => {
        if (!replaceRulesContainer) return;
        if (replaceRulesContainer.children.length === 0) {
            addNewReplaceRule();
        }
        if (replaceModal) replaceModal.classList.remove('hidden');
    });
    if (cancelReplaceButton) cancelReplaceButton.addEventListener('click', () => {
        if (replaceModal) replaceModal.classList.add('hidden');
    });
    if (addRuleButton) addRuleButton.addEventListener('click', () => addNewReplaceRule());

    function addNewReplaceRule(findText = '', replaceText = '') {
        const ruleDiv = document.createElement('div');
        ruleDiv.className = 'flex items-center space-x-2';
        ruleDiv.innerHTML = `<input type="text" placeholder="尋找文字" value="${findText}" class="find-input w-full p-2 border border-gray-300 rounded-md"><span class="text-gray-500">→</span><input type="text" placeholder="取代為" value="${replaceText}" class="replace-input w-full p-2 border border-gray-300 rounded-md"><button class="delete-rule-button bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-3 rounded-lg text-sm">🗑️</button>`;
        if (replaceRulesContainer) replaceRulesContainer.appendChild(ruleDiv);
        ruleDiv.querySelector('.delete-rule-button').addEventListener('click', () => {
            ruleDiv.remove();
        });
    }

    if (applyReplaceButton) applyReplaceButton.addEventListener('click', () => {
        const subsForReplacing = processedSubtitles.length > 0 ? JSON.parse(JSON.stringify(processedSubtitles)) : JSON.parse(JSON.stringify(originalSubtitles));
        if (subsForReplacing.length === 0) {
            console.error('請先載入字幕檔再執行取代。');
            return;
        }
        const rules = [];
        if (!replaceRulesContainer) return;
        const ruleElements = replaceRulesContainer.querySelectorAll('.flex.items-center');
        ruleElements.forEach(el => {
            const find = el.querySelector('.find-input').value;
            const replace = el.querySelector('.replace-input').value;
            if (find) {
                rules.push({ find, replace });
            }
        });
        if (rules.length === 0) {
            console.error('沒有設定任何有效的取代規則。');
            return;
        }
        let totalReplacements = 0;
        subsForReplacing.forEach(sub => {
            rules.forEach(rule => {
                const findStr = rule.find;
                if (sub.text.includes(findStr)) {
                   const originalText = sub.text;
                   sub.text = sub.text.replaceAll(findStr, rule.replace);
                   totalReplacements += (originalText.split(findStr).length - 1);
                }
            });
        });
        processedSubtitles = subsForReplacing;
        renderSubtitles(processedSubtitles);
        if (replaceModal) replaceModal.classList.add('hidden');
        console.log(`批次取代完成！共取代了 ${totalReplacements} 處文字。`);
    });

    // --- 核心處理邏輯 ---
    if (processSubtitlesButton) processSubtitlesButton.addEventListener('click', () => {
        if (originalSubtitles.length === 0) {
            console.error('請先載入一個 SRT 檔案。');
            return;
        }
        let subsToProcess = JSON.parse(JSON.stringify(originalSubtitles));
        const report = { linesSplit: 0, punctuationRemoved: 0, gapsFixed: 0, leadingPunctuationFixed: 0, shortLinesMerged: 0 };
        
        // 取得設定值 - 功能由 Input.value > 0 或 Checkbox 狀態控制
        
        // 1. 每行字數限制 (Input > 0 則啟用)
        const charLimit = parseInt(charLimitInput.value, 10) || 0;
        const shouldLimitChars = charLimit > 0;
        
        // 2. 修復間隔(毫秒) (Input > 0 則啟用)
        const gapThreshold = parseInt(gapThresholdInput.value, 10) || 0;
        const shouldFixTimestamps = gapThreshold > 0;
        
        // 3. 合併短行 (字數) (Input > 0 則啟用)
        const mergeThreshold = parseInt(mergeThresholdInput.value, 10) || 0;
        const shouldMergeShortLines = mergeThreshold > 0;

        // 4. 移除標點符號 (Checkbox 控制)
        const shouldRemovePunctuation = removePunctuationCheckbox.checked;

        // 處理順序：字數限制 -> 修復間隔 -> 合併短行 -> 移除標點符號 (及行首標點修復)

        // 1. 字數限制
        if (shouldLimitChars) {
            const originalLength = subsToProcess.length;
            subsToProcess = splitSubtitlesByCharLimit(subsToProcess, charLimit);
            report.linesSplit = subsToProcess.length - originalLength;
        }

        // 2. 修復時間軸間隔 (需在字數限制後執行)
        if (shouldFixTimestamps) {
            for (let i = 1; i < subsToProcess.length; i++) {
                const prevSub = subsToProcess[i - 1];
                const currentSub = subsToProcess[i];
                const prevEndTimeMs = timeToMs(prevSub.endTime);
                let currentStartTimeMs = timeToMs(currentSub.startTime);
                const gap = currentStartTimeMs - prevEndTimeMs;
                
                // 如果間隔小於或等於 0 (重疊)
                if (gap <= 0) {
                    currentStartTimeMs = prevEndTimeMs + 1; // 至少間隔 1ms
                    currentSub.startTime = msToTime(currentStartTimeMs);
                    report.gapsFixed++;
                }
            }
        }
        
        // 3. 合併短行 (在處理完時間軸後執行)
        if (shouldMergeShortLines) {
            const originalLength = subsToProcess.length;
            subsToProcess = mergeShortSubtitles(subsToProcess, mergeThreshold);
            report.shortLinesMerged = originalLength - subsToProcess.length;
        }

        // 4. 移除標點符號
        if (shouldRemovePunctuation) {
             subsToProcess.forEach(sub => {
                const originalText = sub.text;
                // 移除常見的中英文標點符號
                const newText = originalText.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()\[\]"“”。，、？！：；]/g, "");
                if (originalText !== newText) {
                    report.punctuationRemoved++;
                }
                sub.text = newText;
            });
        }

        // 5. 修復行首標點符號 (僅在不移除標點符號時執行)
        if (!shouldRemovePunctuation) {
            const leadingPunctuation = /^[.,?!;:“”'\])。，、？！：；]/;
            for (let i = 1; i < subsToProcess.length; i++) {
                if (leadingPunctuation.test(subsToProcess[i].text)) {
                    // 將行首標點符號移動到前一行結尾
                    subsToProcess[i - 1].text += subsToProcess[i].text[0];
                    subsToProcess[i].text = subsToProcess[i].text.substring(1).trim();
                    report.leadingPunctuationFixed++;
                }
            }
        }
        
        // 重新編號
        processedSubtitles = subsToProcess.map((sub, index) => ({ ...sub, id: String(index + 1) }));
        renderSubtitles(processedSubtitles);

        // ▼▼▼ 報告生成與 Modal 顯示邏輯 (新增) ▼▼▼
        let reportMessage = "字幕處理完成！\n\n--- 處理報告 ---\n";
        if (shouldLimitChars) reportMessage += `✒️ 因字數限制 (每行 ${charLimit} 字)，新增了 ${report.linesSplit} 行字幕。\n`;
        if (shouldFixTimestamps) reportMessage += `⏱️ 修正了 ${report.gapsFixed} 處小於 ${gapThreshold}ms 的時間軸間隔。\n`;
        if (shouldMergeShortLines) reportMessage += `🔗 合併了 ${report.shortLinesMerged} 個短於 ${mergeThreshold} 字的字幕行。\n`;
        if (shouldRemovePunctuation) reportMessage += `🗑️ 統計：共處理 ${report.punctuationRemoved} 行字幕的標點符號。\n`;
        if (!shouldRemovePunctuation && report.leadingPunctuationFixed > 0) reportMessage += `🧐 修正了 ${report.leadingPunctuationFixed} 處行首標點符號。\n`;
        
        if (reportModalOutput && reportModal) {
            reportModalOutput.textContent = reportMessage;
            reportModal.classList.remove('hidden');
        }
        // ▲▲▲ 報告生成與 Modal 顯示邏輯 (新增) ▲▲▲
    });

    // ▼▼▼ 實作清除內容邏輯 ▼▼▼
    if (clearContentButton) clearContentButton.addEventListener('click', () => {
        
        // 1. 清除字幕資料
        originalSubtitles = [];
        processedSubtitles = [];
        if (subtitlePreviewArea) subtitlePreviewArea.innerHTML = '<p class="text-gray-400 text-center mt-4">此處將顯示載入的字幕...</p>';
        if (srtFileInput) srtFileInput.value = '';
       
        // 2. 清除內容產出工具的輸入和輸出
        if (blogTitleInput) blogTitleInput.value = '';
        if (youtubeIdInput) youtubeIdInput.value = '';
        if (blogPreviewOutput) blogPreviewOutput.innerHTML = '<p class="text-gray-400">文章成品將預覽於此...</p>';
        if (seoTitleOutput) seoTitleOutput.value = '';
        if (permalinkOutput) permalinkOutput.value = '';
        if (descriptionOutput) descriptionOutput.value = '';
        if (labelsOutput) labelsOutput.value = '';

        // 3. 重置按鈕狀態
        if (generateChaptersButton) generateChaptersButton.disabled = true;
        if (generateBlogButton) generateBlogButton.disabled = true;
        if (downloadHtmlButton) downloadHtmlButton.disabled = true;
        
        console.log("所有內容已清除完畢。"); 
    });
    // ▲▲▲ 實作清除內容邏輯 ▲▲▲
    
    // --- AI 章節生成邏輯 ---
    if (generateChaptersButton) generateChaptersButton.addEventListener('click', async () => {
        const apiKey = getApiKey();
        if (!apiKey) {
            console.error('請先設定您的 Gemini API KEY。');
            if (apiKeyModal) apiKeyModal.classList.remove('hidden');
            return;
        }
        const subsToUse = processedSubtitles.length > 0 ? processedSubtitles : originalSubtitles;
        if (subsToUse.length === 0) {
            console.error('請先載入字幕檔。');
            return;
        }
        if (globalLoadingOverlay) globalLoadingOverlay.classList.remove('hidden');
        try {
            const transcript = subsToUse.map(sub => `[${sub.startTime}] ${sub.text.replace(/\n/g, ' ')}`).join('\n');
            const prompt = `你是一位專業的 YouTube 影片內容分析師。請根據以下帶有時間戳的逐字稿，找出影片中的關鍵主題轉折點，並產生一份 YouTube 影片章節列表。請嚴格遵守以下格式：每一行都是 HH:MM:SS - 章節標題，且第一個章節必須從 00:00:00 開始。請不要包含任何額外的解釋或開頭結語。逐字稿如下：\n\n${transcript}`;
            const result = await callGeminiAPI(prompt, apiKey);
            if (chaptersModalOutput) chaptersModalOutput.textContent = result.trim();
            if (chaptersModal) chaptersModal.classList.remove('hidden');
        } catch (error) {
            console.error(`章節生成失敗：`, error);
        } finally {
            if (globalLoadingOverlay) globalLoadingOverlay.classList.add('hidden');
        }
    });

    if (closeChaptersModalButton) closeChaptersModalButton.addEventListener('click', () => {
        if (chaptersModal) chaptersModal.classList.add('hidden');
    });

    if (copyChaptersModalButton) copyChaptersModalButton.addEventListener('click', () => {
        const textToCopy = chaptersModalOutput.textContent;
        navigator.clipboard.writeText(textToCopy).then(() => {
            const originalText = copyChaptersModalButton.textContent;
            copyChaptersModalButton.textContent = '已複製!';
            setTimeout(() => {
                copyChaptersModalButton.textContent = originalText;
            }, 2000);
        }).catch(err => {
            console.error('複製失敗:', err);
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = textToCopy;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            console.log('內容已複製到剪貼簿。');
        });
    });
    
    // --- AI 部落格文章生成邏輯 ---
    if (ctaPresetSelect) ctaPresetSelect.addEventListener('change', handleCtaSelection);
    if (ctaInput) ctaInput.addEventListener('input', () => {
        if (ctaPresetSelect.value === 'custom') {
            localStorage.setItem('youtubeToolboxCta', ctaInput.value);
        }
    });

    function initializeCta() {
        if (ctaPresetSelect) ctaPresetSelect.value = 'pupu';
        handleCtaSelection();
    }

    function handleCtaSelection() {
        if (!ctaPresetSelect || !customCtaContainer) return;
        const selection = ctaPresetSelect.value;
        if (selection === 'custom') {
            customCtaContainer.style.display = 'block';
            if (ctaInput) ctaInput.value = localStorage.getItem('youtubeToolboxCta') || '';
        } else {
            customCtaContainer.style.display = 'none';
        }
    }

    if (generateBlogButton) generateBlogButton.addEventListener('click', async () => {
        const apiKey = getApiKey();
        if (!apiKey) {
            console.error('請先設定您的 Gemini API KEY。');
            if (apiKeyModal) apiKeyModal.classList.remove('hidden');
            return;
        }
        const subsToUse = processedSubtitles.length > 0 ? processedSubtitles : originalSubtitles;
        if (subsToUse.length === 0) {
            console.error('請先載入字幕檔。');
            return;
        }
        const title = blogTitleInput.value.trim();
        const videoId = youtubeIdInput.value.trim();
        if (!title || !videoId) {
            console.error('請務必填寫「文章主題」和「YouTube 影片 ID」。');
            return;
        }
        
        let ctaHtml = '';
        const ctaSelection = ctaPresetSelect.value;
        if (ctaSelection === 'custom') {
            ctaHtml = ctaInput.value.trim().replace(/\n/g, '<br>');
        } else {
            ctaHtml = PRESET_CTAS[ctaSelection];
        }

        if (globalLoadingOverlay) globalLoadingOverlay.classList.remove('hidden');
        if (generateBlogButton) generateBlogButton.disabled = true;
        if (downloadHtmlButton) downloadHtmlButton.disabled = true;

        try {
            const transcript = subsToUse.map(sub => sub.text).join(' ');
            
            // 使用結構化提示詞
            const systemPrompt = `你是一位專業的部落格小編，負責將節目逐字稿轉換成格式良好、語氣自然、適合部落格發表的專欄文章。它將作為[部落格小編]，專門負責將節目逐字稿轉換成充滿能量的[第一人稱]專欄報導。
            它的工作分為兩個部分：
            第一部分：撰寫 Blog
            - 仔細閱讀完整逐字稿後撰文
            - 使用第一人稱視角
            - 語氣需充滿能量與感染力
            - 約 1000 字
            - 每個段落要有一個小標題，請用 <h2> 標籤包圍
            - 段落之間以 <hr> 清楚劃分
            - 結尾加入使用者提供的[宣傳語句]
            
            第二部分：處理 SEO
            - 根據文章內容撰寫 SEO 標題與 permalink（小寫英文，單字用 - 連接）
            - 撰寫一段 Search Description
            - 加入合適標籤（Labels），標籤請用半形的逗號[,]隔開
            - 文章前段需自然融入關鍵字但不可過度堆疊
            
            請嚴格以以下格式輸出結果，並用標籤包圍各部分內容，不要包含任何解釋性文字：
            
            <BLOG_CONTENT>
            [這裡放置完整的部落格文章，包含 h2 和 hr 標籤]
            [文章結尾要包含宣傳語句]
            </BLOG_CONTENT>
            
            <SEO_TITLE>[SEO 標題]</SEO_TITLE>
            <PERMALINK>[permalink，小寫英文，單字用-連接]</PERMALINK>
            <DESCRIPTION>[Search Description]</DESCRIPTION>
            <LABELS>[標籤1,標籤2,標籤3]</LABELS>
            `;
            
            const userQuery = `逐字稿：\n\n${transcript}\n\n文章主題 (關鍵字)：${title}\n\n宣傳語句：${ctaHtml}`;

            const aiResponse = await callGeminiAPI(userQuery, apiKey, systemPrompt);
            
            const blogContent = parseContent(aiResponse, 'BLOG_CONTENT');
            const seoTitle = parseContent(aiResponse, 'SEO_TITLE');
            const permalink = parseContent(aiResponse, 'PERMALINK');
            const description = parseContent(aiResponse, 'DESCRIPTION');
            const labels = parseContent(aiResponse, 'LABELS');
            
            // 由於 AI 在 BLOG_CONTENT 內已經處理 CTA 和 HR，我們只需在外面包裝標題和影片
            const finalHtml = `<h1>${title}</h1><div class="my-4" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;"><iframe src="https://www.youtube.com/embed/${videoId}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>${blogContent}`;
            
            if (blogPreviewOutput) blogPreviewOutput.innerHTML = finalHtml;
            if (seoTitleOutput) seoTitleOutput.value = seoTitle;
            if (permalinkOutput) permalinkOutput.value = permalink;
            if (descriptionOutput) descriptionOutput.value = description;
            if (labelsOutput) labelsOutput.value = labels;

            if (downloadHtmlButton) downloadHtmlButton.disabled = false;
        } catch (error) {
            if (blogPreviewOutput) blogPreviewOutput.innerHTML = `<p class="text-red-500">文章生成失敗：${error.message}</p>`;
        } finally {
            if (globalLoadingOverlay) globalLoadingOverlay.classList.add('hidden');
            if (generateBlogButton) generateBlogButton.disabled = false;
        }
    });

    // 複製 SEO 資訊按鈕
    [
        { button: copySeoTitleButton, input: seoTitleOutput },
        { button: copyPermalinkButton, input: permalinkOutput },
        { button: copyDescriptionButton, input: descriptionOutput },
        { button: copyLabelsButton, input: labelsOutput }
    ].forEach(({ button, input }) => {
        if (button) button.addEventListener('click', () => {
            if (!input) return;
            const textToCopy = input.value;
            navigator.clipboard.writeText(textToCopy).then(() => {
                const originalText = button.textContent;
                button.textContent = '已複製!';
                setTimeout(() => {
                    button.textContent = originalText;
                }, 2000);
            }).catch(err => {
                console.error('複製失敗:', err);
                // Fallback
                const textarea = document.createElement('textarea');
                textarea.value = textToCopy;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                console.log('內容已複製到剪貼簿。');
            });
        });
    });

    if (downloadHtmlButton) downloadHtmlButton.addEventListener('click', () => {
        const title = blogTitleInput.value.trim() || 'blog-post';
        // 簡化 HTML 結構以方便下載
        const fullHtmlContent = `<!DOCTYPE html><html lang="zh-Hant"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title}</title><style>body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 20px auto; padding: 0 15px; } h1 { color: #111; } h2 { color: #222; border-bottom: 1px solid #eee; padding-bottom: 5px; } iframe { max-width: 100%; }</style></head><body>${blogPreviewOutput.innerHTML}</body></html>`;
        const blob = new Blob([fullHtmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // --- 輔助函式 ---
    
    // 用於解析 AI 結構化輸出的內容
    function parseContent(text, key) {
        const startTag = `<${key}>`;
        const endTag = `</${key}>`;
        const startIndex = text.indexOf(startTag);
        const endIndex = text.indexOf(endTag);
        
        if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
            return text.substring(startIndex + startTag.length, endIndex).trim();
        }
        
        // 如果找不到標籤，嘗試返回原始文本 (作為 fallback)
        return text; 
    }

    // 處理 API 呼叫和指數退避重試
    async function callGeminiAPI(prompt, apiKey, systemPrompt = "") {
        const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent";
        const MAX_RETRIES = 3;
        
        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 8192,
            },
        };

        if (systemPrompt) {
            payload.systemInstruction = { parts: [{ text: systemPrompt }] };
        }
        
        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            try {
                const response = await fetch(`${API_URL}?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    if (response.status === 429 && attempt < MAX_RETRIES - 1) {
                        // 處理頻率限制 (429)，進行指數退避
                        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
                        await new Promise(resolve => setTimeout(resolve, delay));
                        continue; // 重新嘗試
                    }
                    throw new Error(`API 請求失敗 (${response.status}): ${errorData.error?.message || response.statusText}`);
                }
                
                const data = await response.json();
                
                if (!data.candidates || data.candidates.length === 0) {
                    if (data.promptFeedback && data.promptFeedback.blockReason) {
                        throw new Error(`請求被阻擋，原因：${data.promptFeedback.blockReason}`);
                    }
                    throw new Error('API 回應中未包含有效的候選結果。');
                }
                
                const text = data.candidates[0]?.content?.parts[0]?.text;
                if (!text) {
                     console.error('API 回應異常:', data);
                    throw new Error('從 API 回應中找不到有效的文字內容。');
                }
                return text; // 成功返回
                
            } catch (error) {
                if (attempt === MAX_RETRIES - 1) {
                    throw error; // 最後一次嘗試失敗，拋出錯誤
                }
                // 處理網路錯誤，進行指數退避
                const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    function mergeShortSubtitles(subtitles, threshold) {
        if (subtitles.length < 2) return subtitles;
        const mergedSubtitles = [];
        let i = 0;
        while (i < subtitles.length) {
            let currentSub = subtitles[i];
            // 檢查當前行是否過短且不是最後一行
            if (currentSub.text.trim().length <= threshold && i < subtitles.length - 1) {
                let nextSub = subtitles[i + 1];
                const newMergedSub = {
                    id: currentSub.id, // 保留舊的 ID，稍後會重新編號
                    startTime: currentSub.startTime,
                    endTime: nextSub.endTime,
                    text: (currentSub.text.trim() + " " + nextSub.text.trim()).trim()
                };
                mergedSubtitles.push(newMergedSub);
                i += 2; // 跳過下一行
            } else {
                mergedSubtitles.push(currentSub);
                i += 1;
            }
        }
        return mergedSubtitles;
    }

    function intelligentSplit(text, limit) {
        const lines = [];
        let currentText = text;
        
        // 確保至少有一行文本
        if (currentText.length === 0) return lines;

        while (currentText.length > limit) {
            let splitPos = limit;
            
            // 尋找最後一個空格作為分割點，保持語義完整
            let lastSpace = currentText.substring(0, limit).lastIndexOf(' ');

            // 如果找到空格且不在開頭，則以空格為界
            if (lastSpace !== -1 && lastSpace > 0) {
                splitPos = lastSpace;
            } else {
                // 如果沒有空格，或空格在開頭，則強制在 limit 處分割
                splitPos = limit;
            }
            
            lines.push(currentText.substring(0, splitPos).trim());
            currentText = currentText.substring(splitPos).trim();
        }
        
        if (currentText.length > 0) {
            lines.push(currentText);
        }
        return lines;
    }

    function splitSubtitlesByCharLimit(subtitles, limit) {
        let newSubtitles = [];
        subtitles.forEach(sub => {
            // 將所有換行符號替換為空格，以便正確計算字數
            const originalText = sub.text.replace(/\n/g, ' ').trim();
            
            if (originalText.length <= limit) {
                newSubtitles.push(sub);
            } else {
                const chunks = intelligentSplit(originalText, limit);
                const startTimeMs = timeToMs(sub.startTime);
                const endTimeMs = timeToMs(sub.endTime);
                let durationMs = endTimeMs - startTimeMs;
                
                // 如果總時長無效或為零，將所有段落塞回一個字幕塊（多行）
                if (durationMs <= 0) {
                    sub.text = chunks.join('\n');
                    newSubtitles.push(sub);
                    return;
                }
                
                const charsPerMs = originalText.length / durationMs;
                let currentStartTimeMs = startTimeMs;
                
                chunks.forEach((chunk, index) => {
                    // 根據字數比例計算這一段字幕的時長
                    let chunkDurationMs = Math.round(chunk.length / charsPerMs);
                    let newEndTimeMs = currentStartTimeMs + chunkDurationMs;
                    
                    // 確保最後一段字幕的結束時間與原始結束時間一致
                    if (index === chunks.length - 1) {
                        newEndTimeMs = endTimeMs;
                    } 
                    // 防止單塊時長超過總時長或結束時間跑到下一塊之前
                    else if (newEndTimeMs > endTimeMs) {
                        newEndTimeMs = endTimeMs; 
                    }
                    
                    newSubtitles.push({
                        id: '...', // 重新編號
                        startTime: msToTime(currentStartTimeMs),
                        endTime: msToTime(newEndTimeMs),
                        text: chunk
                    });
                    
                    currentStartTimeMs = newEndTimeMs;
                });
            }
        });
        return newSubtitles.map((sub, index) => ({ ...sub, id: String(index + 1) }));
    }

    function timeToMs(timeStr) {
        // SRT 格式: HH:MM:SS,mmm
        const [hms, ms] = timeStr.split(',');
        const [h, m, s] = hms.split(':').map(Number);
        return (h * 3600 + m * 60 + s) * 1000 + Number(ms);
    }

    function msToTime(ms) {
        let totalSeconds = Math.floor(ms / 1000);
        let hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = totalSeconds % 60;
        let milliseconds = ms % 1000;
        
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')},${String(milliseconds).padStart(3, '0')}`;
    }

    // --- 匯出 SRT 檔案邏輯 --
    if (exportSrtButton) exportSrtButton.addEventListener('click', () => {
        const subsToExport = processedSubtitles.length > 0 ? processedSubtitles : originalSubtitles;
        
        if (subsToExport.length === 0) {
            console.error('沒有可匯出的字幕。');
            return;
        }

        const srtContent = subsToExport.map(sub => {
            return `${sub.id}\n${sub.startTime} --> ${sub.endTime}\n${sub.text}`;
        }).join('\n\n');

        const blob = new Blob([srtContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `processed_subtitles_${new Date().getTime()}.srt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
});
