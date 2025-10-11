document.addEventListener('DOMContentLoaded', () => {
    
    // --- 元素選取 ---
    const globalLoadingOverlay = document.getElementById('global-loading-overlay');
    const apiKeyButton = document.getElementById('api-key-button');
    const apiKeyModal = document.getElementById('api-key-modal');
    const saveApiKeyButton = document.getElementById('save-api-key');
    const cancelApiKeyButton = document.getElementById('cancel-api-key');
    const apiKeyInput = document.getElementById('api-key-input');
    const srtFileInput = document.getElementById('srt-file-input');
    const subtitlePreviewArea = document.getElementById('subtitle-preview-area');
    const exportSrtButton = document.getElementById('export-srt-button');
    const processSubtitlesButton = document.getElementById('process-subtitles-button');
    const batchReplaceButton = document.getElementById('batch-replace-button');
    const enableCharLimitCheckbox = document.getElementById('enable-char-limit-checkbox');
    const charLimitInput = document.getElementById('char-limit-input');
    const removePunctuationCheckbox = document.getElementById('remove-punctuation-checkbox');
    const fixTimestampsCheckbox = document.getElementById('fix-timestamps-checkbox');
    const gapThresholdInput = document.getElementById('gap-threshold-input');
    const mergeShortLinesCheckbox = document.getElementById('merge-short-lines-checkbox');
    const mergeThresholdInput = document.getElementById('merge-threshold-input');
    const replaceModal = document.getElementById('replace-modal');
    const replaceRulesContainer = document.getElementById('replace-rules-container');
    const addRuleButton = document.getElementById('add-rule-button');
    const cancelReplaceButton = document.getElementById('cancel-replace-button');
    const applyReplaceButton = document.getElementById('apply-replace-button');
    const generateChaptersButton = document.getElementById('generate-chapters-button');
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
    
    // --- API 金鑰管理 ---
    apiKeyButton.addEventListener('click', () => apiKeyModal.classList.remove('hidden'));
    cancelApiKeyButton.addEventListener('click', () => apiKeyModal.classList.add('hidden'));
    saveApiKeyButton.addEventListener('click', () => {
        const apiKey = apiKeyInput.value.trim();
        if (!apiKey) {
            alert('API KEY 欄位不可為空！'); return;
        }
        const expirationTime = new Date().getTime() + EXPIRATION_HOURS * 60 * 60 * 1000;
        sessionStorage.setItem(API_KEY_STORAGE_KEY, JSON.stringify({ key: apiKey, expires: expirationTime }));
        alert('API KEY 儲存成功！');
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
            alert('API KEY 已過期，請重新設定。');
            return null;
        }
        return keyData.key;
    }

    function updateButtonStatus() {
        if (getApiKey()) {
            apiKeyButton.textContent = 'API KEY 已設定';
            apiKeyButton.classList.add('bg-green-600');
        } else {
            apiKeyButton.textContent = '設定 API KEY';
            apiKeyButton.classList.remove('bg-green-600');
        }
    }

    // --- 字幕檔案處理 ---
    srtFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                originalSubtitles = parseSrt(e.target.result);
                processedSubtitles = []; 
                renderSubtitles(originalSubtitles);
                generateChaptersButton.disabled = false;
                generateBlogButton.disabled = false;
            } catch (error) {
                console.error("解析 SRT 檔案時發生錯誤:", error);
                alert('無法解析 SRT 檔案，請確認格式。');
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
        subtitlePreviewArea.innerHTML = '';
        if (subtitles.length === 0) {
            subtitlePreviewArea.innerHTML = '<p class="text-gray-400 text-center mt-4">此處將顯示載入的字幕...</p>';
            return;
        }
        const content = subtitles.map(sub => `${sub.id}\n${sub.startTime} --> ${sub.endTime}\n${sub.text}`).join('\n\n');
        subtitlePreviewArea.textContent = content;
    }
    
    // --- 批次取代 Modal 邏輯 ---
    batchReplaceButton.addEventListener('click', () => {
        if (replaceRulesContainer.children.length === 0) {
            addNewReplaceRule();
        }
        replaceModal.classList.remove('hidden');
    });
    cancelReplaceButton.addEventListener('click', () => replaceModal.classList.add('hidden'));
    addRuleButton.addEventListener('click', () => addNewReplaceRule());

    function addNewReplaceRule(findText = '', replaceText = '') {
        const ruleDiv = document.createElement('div');
        ruleDiv.className = 'flex items-center space-x-2';
        ruleDiv.innerHTML = `<input type="text" placeholder="尋找文字" value="${findText}" class="find-input w-full p-2 border border-gray-300 rounded-md"><span class="text-gray-500">→</span><input type="text" placeholder="取代為" value="${replaceText}" class="replace-input w-full p-2 border border-gray-300 rounded-md"><button class="delete-rule-button bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-3 rounded-lg text-sm">🗑️</button>`;
        replaceRulesContainer.appendChild(ruleDiv);
        ruleDiv.querySelector('.delete-rule-button').addEventListener('click', () => {
            ruleDiv.remove();
        });
    }

    applyReplaceButton.addEventListener('click', () => {
        const subsForReplacing = processedSubtitles.length > 0 ? JSON.parse(JSON.stringify(processedSubtitles)) : JSON.parse(JSON.stringify(originalSubtitles));
        if (subsForReplacing.length === 0) {
            alert('請先載入字幕檔再執行取代。');
            return;
        }
        const rules = [];
        const ruleElements = replaceRulesContainer.querySelectorAll('.flex.items-center');
        ruleElements.forEach(el => {
            const find = el.querySelector('.find-input').value;
            const replace = el.querySelector('.replace-input').value;
            if (find) {
                rules.push({ find, replace });
            }
        });
        if (rules.length === 0) {
            alert('沒有設定任何有效的取代規則。');
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
        replaceModal.classList.add('hidden');
        alert(`批次取代完成！共取代了 ${totalReplacements} 處文字。`);
    });

    // --- 核心處理邏輯 ---
    processSubtitlesButton.addEventListener('click', () => {
        if (originalSubtitles.length === 0) {
            alert('請先載入一個 SRT 檔案。');
            return;
        }
        let subsToProcess = JSON.parse(JSON.stringify(originalSubtitles));
        const report = { linesSplit: 0, punctuationRemoved: 0, gapsFixed: 0, leadingPunctuationFixed: 0, shortLinesMerged: 0 };
        const shouldLimitChars = enableCharLimitCheckbox.checked;
        const charLimit = parseInt(charLimitInput.value, 10) || 0;
        const shouldRemovePunctuation = removePunctuationCheckbox.checked;
        const shouldFixTimestamps = fixTimestampsCheckbox.checked;
        const gapThreshold = parseInt(gapThresholdInput.value, 10) || 100;
        const shouldMergeShortLines = mergeShortLinesCheckbox.checked;
        const mergeThreshold = parseInt(mergeThresholdInput.value, 10) || 0;
        if (shouldLimitChars && charLimit > 0) {
            const originalLength = subsToProcess.length;
            subsToProcess = splitSubtitlesByCharLimit(subsToProcess, charLimit);
            report.linesSplit = subsToProcess.length - originalLength;
        }
        if (shouldRemovePunctuation) {
             subsToProcess.forEach(sub => {
                const originalText = sub.text;
                const newText = originalText.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()\[\]"“”。，、？！：；]/g, "");
                if (originalText !== newText) {
                    report.punctuationRemoved++;
                }
                sub.text = newText;
            });
        }
        if (shouldFixTimestamps) {
            for (let i = 1; i < subsToProcess.length; i++) {
                const prevSub = subsToProcess[i - 1];
                const currentSub = subsToProcess[i];
                const prevEndTimeMs = timeToMs(prevSub.endTime);
                let currentStartTimeMs = timeToMs(currentSub.startTime);
                const gap = currentStartTimeMs - prevEndTimeMs;
                if (gap >= 0 && gap < gapThreshold) {
                    currentStartTimeMs = prevEndTimeMs + gapThreshold;
                    currentSub.startTime = msToTime(currentStartTimeMs);
                    report.gapsFixed++;
                }
            }
        }
        if (shouldMergeShortLines && mergeThreshold > 0) {
            const originalLength = subsToProcess.length;
            subsToProcess = mergeShortSubtitles(subsToProcess, mergeThreshold);
            report.shortLinesMerged = originalLength - subsToProcess.length;
        }
        if (!shouldRemovePunctuation) {
            const leadingPunctuation = /^[.,?!;:“”'\])。，、？！：；]/;
            for (let i = 1; i < subsToProcess.length; i++) {
                if (leadingPunctuation.test(subsToProcess[i].text)) {
                    subsToProcess[i - 1].text += subsToProcess[i].text[0];
                    subsToProcess[i].text = subsToProcess[i].text.substring(1).trim();
                    report.leadingPunctuationFixed++;
                }
            }
        }
        processedSubtitles = subsToProcess.map((sub, index) => ({ ...sub, id: String(index + 1) }));
        renderSubtitles(processedSubtitles);
        let reportMessage = "字幕處理完成！\n\n--- 處理報告 ---\n";
        if (shouldLimitChars && report.linesSplit > 0) reportMessage += `✒️ 因字數限制，新增了 ${report.linesSplit} 行字幕。\n`;
        if (shouldRemovePunctuation && report.punctuationRemoved > 0) reportMessage += `🗑️ 統計：共處理 ${report.punctuationRemoved} 行字幕的標點符號。\n`;
        if (shouldFixTimestamps && report.gapsFixed > 0) reportMessage += `⏱️ 修正了 ${report.gapsFixed} 處時間軸間隔。\n`;
        if (shouldMergeShortLines && report.shortLinesMerged > 0) reportMessage += `🔗 合併了 ${report.shortLinesMerged} 個過短的字幕行。\n`;
        if (!shouldRemovePunctuation && report.leadingPunctuationFixed > 0) reportMessage += `🧐 修正了 ${report.leadingPunctuationFixed} 處行首標點符號。\n`;
        alert(reportMessage);
    });
    
    // --- AI 章節生成邏輯 ---
    generateChaptersButton.addEventListener('click', async () => {
        const apiKey = getApiKey();
        if (!apiKey) {
            alert('請先設定您的 Gemini API KEY。');
            apiKeyModal.classList.remove('hidden');
            return;
        }
        const subsToUse = processedSubtitles.length > 0 ? processedSubtitles : originalSubtitles;
        if (subsToUse.length === 0) {
            alert('請先載入字幕檔。');
            return;
        }
        globalLoadingOverlay.classList.remove('hidden');
        try {
            const transcript = subsToUse.map(sub => `[${sub.startTime}] ${sub.text.replace(/\n/g, ' ')}`).join('\n');
            const prompt = `你是一位專業的 YouTube 影片內容分析師。請根據以下帶有時間戳的逐字稿，找出影片中的關鍵主題轉折點，並產生一份 YouTube 影片章節列表。請嚴格遵守以下格式：每一行都是 HH:MM:SS - 章節標題，且第一個章節必須從 00:00:00 開始。請不要包含任何額外的解釋或開頭結語。逐字稿如下：\n\n${transcript}`;
            const result = await callGeminiAPI(prompt, apiKey);
            chaptersModalOutput.textContent = result.trim();
            chaptersModal.classList.remove('hidden');
        } catch (error) {
            alert(`章節生成失敗：\n${error.message}`);
            console.error('章節生成失敗:', error);
        } finally {
            globalLoadingOverlay.classList.add('hidden');
        }
    });

    closeChaptersModalButton.addEventListener('click', () => {
        chaptersModal.classList.add('hidden');
    });

    copyChaptersModalButton.addEventListener('click', () => {
        const textToCopy = chaptersModalOutput.textContent;
        navigator.clipboard.writeText(textToCopy).then(() => {
            const originalText = copyChaptersModalButton.textContent;
            copyChaptersModalButton.textContent = '已複製!';
            setTimeout(() => {
                // ▼▼▼ 這就是上次的錯誤點，已修正 ▼▼▼
                copyChaptersModalButton.textContent = originalText;
            }, 2000);
        }).catch(err => {
            console.error('複製失敗:', err);
        });
    });
    
    // --- AI 部落格文章生成邏輯 ---
    ctaPresetSelect.addEventListener('change', handleCtaSelection);
    ctaInput.addEventListener('input', () => {
        if (ctaPresetSelect.value === 'custom') {
            localStorage.setItem('youtubeToolboxCta', ctaInput.value);
        }
    });

    function initializeCta() {
        ctaPresetSelect.value = 'pupu';
        handleCtaSelection();
    }

    function handleCtaSelection() {
        const selection = ctaPresetSelect.value;
        if (selection === 'custom') {
            customCtaContainer.style.display = 'block';
            ctaInput.value = localStorage.getItem('youtubeToolboxCta') || '';
        } else {
            customCtaContainer.style.display = 'none';
        }
    }

    generateBlogButton.addEventListener('click', async () => {
        const apiKey = getApiKey();
        if (!apiKey) {
            alert('請先設定您的 Gemini API KEY。');
            apiKeyModal.classList.remove('hidden');
            return;
        }
        const subsToUse = processedSubtitles.length > 0 ? processedSubtitles : originalSubtitles;
        if (subsToUse.length === 0) {
            alert('請先載入字幕檔。');
            return;
        }
        const title = blogTitleInput.value.trim();
        const videoId = youtubeIdInput.value.trim();
        if (!title || !videoId) {
            alert('請務必填寫「文章主題」和「YouTube 影片 ID」。');
            return;
        }
        
        let ctaHtml = '';
        const ctaSelection = ctaPresetSelect.value;
        if (ctaSelection === 'custom') {
            // 這裡我們假設 CTA 輸入的是純文字，用 <br> 換行，但原始程式碼沒有處理 HTML。
            // 為了簡化，我們先保持它為純文本或簡單格式，但 AI 輸出時會加入
            ctaHtml = ctaInput.value.trim().replace(/\n/g, '<br>');
        } else {
            ctaHtml = PRESET_CTAS[ctaSelection];
        }

        globalLoadingOverlay.classList.remove('hidden');
        generateBlogButton.disabled = true;
        downloadHtmlButton.disabled = true;

        try {
            const transcript = subsToUse.map(sub => sub.text).join(' ');
            
            // ▼▼▼ 已更新為您提供的提示詞 ▼▼▼
            const prompt = `你是一位專業的部落格小編，負責將節目逐字稿轉換成格式良好、語氣自然、適合部落格發表的專欄文章。它將作為[部落格小編]，專門負責將節目逐字稿轉換成充滿能量的[第一人稱]專欄報導。

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
- 根據文章內容撰寫 SEO 標題 (SEO_TITLE)
- 根據文章內容撰寫 permalink（PERMALINK - 小寫英文，單字用 - 連接）
- 撰寫一段 Search Description (DESCRIPTION)
- 加入合適標籤（Labels），標籤請用半形的逗號[,]隔開 (LABELS)
- 文章前段需自然融入關鍵字但不可過度堆疊

請確保你的輸出內容嚴格遵守以下格式，且只包含這三個標籤的內容：

<BLOG_CONTENT>
[第一部分：撰寫 Blog 的內容，包含 <h2> 和 <hr> 標籤，結尾是宣傳語句]
</BLOG_CONTENT>

<SEO_TITLE>
[第二部分：SEO 標題]
</SEO_TITLE>

<PERMALINK>
[第二部分：permalink]
</PERMALINK>

<DESCRIPTION>
[第二部分：Search Description]
</DESCRIPTION>

<LABELS>
[第二部分：標籤，以半形逗號分隔]
</LABELS>

宣傳語句為：『${ctaHtml}』
逐字稿如下：
${transcript}`;
            // ▲▲▲ 提示詞更新結束 ▲▲▲

            const aiResponse = await callGeminiAPI(prompt, apiKey);
            
            // 由於提示詞要求 AI 輸出帶有標籤的結構化文字，我們需要調整 parseContent 函式來擷取內容。
            const blogContent = parseContent(aiResponse, 'BLOG_CONTENT');
            const seoTitle = parseContent(aiResponse, 'SEO_TITLE');
            const permalink = parseContent(aiResponse, 'PERMALINK');
            const description = parseContent(aiResponse, 'DESCRIPTION');
            const labels = parseContent(aiResponse, 'LABELS');
            
            // 原始代碼中，ctaHtml 已經在 AI 提示詞的結尾被要求寫入 BLOG_CONTENT 裡。
            // 為了避免重複，我們需要將原始代碼中的 finalHtml 調整為只使用 AI 生成的 blogContent。
            // 或是修改 AI 提示詞，讓 AI 不輸出 CTA，但由於您的 CTA 內容包含 HTML 標籤，
            // 為了確保格式正確，我**建議讓 AI 輸出純文章，然後在前端組裝**。
            // 由於提示詞已要求 AI 輸出 CTA，我們假設 AI 的 <BLOG_CONTENT> 已經包含 CTA HTML。
            
            // 由於 AI 的輸出格式要求嚴格，我們需要確保 parseContent 能夠精確提取內容。
            
            const finalHtml = `<h1>${title}</h1><div class="my-4" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;"><iframe src="https://www.youtube.com/embed/${videoId}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>${blogContent}`;
            
            blogPreviewOutput.innerHTML = finalHtml;
            seoTitleOutput.value = seoTitle;
            permalinkOutput.value = permalink;
            descriptionOutput.value = description;
            labelsOutput.value = labels;

            downloadHtmlButton.disabled = false;
        } catch (error) {
            blogPreviewOutput.innerHTML = `<p class="text-red-500">文章生成失敗：${error.message}</p>`;
        } finally {
            globalLoadingOverlay.classList.add('hidden');
            generateBlogButton.disabled = false;
        }
    });

    downloadHtmlButton.addEventListener('click', () => {
        const title = blogTitleInput.value.trim() || 'blog-post';
        // 確保下載的 HTML 內容是 blogPreviewOutput.innerHTML 的內容
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
    function parseContent(text, key) {
        // 根據新的提示詞格式，使用正規表達式來擷取特定標籤內的內容
        const startTag = `<${key}>`;
        const endTag = `</${key}>`;
        const regex = new RegExp(`${startTag}([\\s\\S]*?)${endTag}`, 'm');
        const match = text.match(regex);
        
        if (match && match[1]) {
            return match[1].trim();
        }
        
        // 如果沒有匹配到標籤，嘗試返回原始文字，並在控制台報錯
        console.warn(`未能在 AI 回應中找到標籤 <${key}>，請檢查 AI 輸出格式是否正確。`);
        return text; // 確保有回傳值，避免程式崩潰
    }

    function markdownToHtml(md) {
        // 保持原始函式，但由於 AI 輸出的是 HTML，此函式可能不再被使用
        return md.trim().split('\n').filter(line => line.trim() !== '').map(line => {
            line = line.trim();
            if (line.startsWith('## ')) {
                return `<h2>${line.substring(3)}</h2>`;
            } else {
                return `<p>${line}</p>`;
            }
        }).join('');
    }

    async function callGeminiAPI(prompt, apiKey) {
        const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent";
        
        // 實作指數退避重試邏輯 (Exponential Backoff)
        const maxRetries = 5;
        let delay = 1000;

        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                const response = await fetch(`${API_URL}?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: {
                            temperature: 0.2,
                            maxOutputTokens: 8192,
                        }
                    })
                });

                if (response.ok) {
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
                    return text; // 成功回傳
                } else if (response.status === 429 || response.status >= 500) {
                    // 處理限速或伺服器錯誤，進行重試
                    if (attempt < maxRetries - 1) {
                        // console.log(`API 請求失敗，狀態碼 ${response.status}。正在重試 (第 ${attempt + 1} 次)...`);
                        await new Promise(resolve => setTimeout(resolve, delay));
                        delay *= 2; // 指數退避
                        continue;
                    } else {
                        const errorData = await response.json();
                        throw new Error(`API 請求失敗 (多次重試後): ${errorData.error?.message || response.statusText}`);
                    }
                } else {
                    // 處理其他非重試錯誤 (如 400, 401, 403, 404)
                    const errorData = await response.json();
                    throw new Error(`API 請求失敗: ${errorData.error?.message || response.statusText}`);
                }
            } catch (error) {
                if (attempt < maxRetries - 1 && error.message.includes('API 請求失敗')) {
                    // console.log(`API 請求失敗，正在重試 (第 ${attempt + 1} 次)...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    delay *= 2; // 指數退避
                    continue;
                }
                throw error;
            }
        }
        throw new Error('API 請求達到最大重試次數，仍然失敗。');
    }

    function mergeShortSubtitles(subtitles, threshold) {
        if (subtitles.length < 2) return subtitles;
        const mergedSubtitles = [];
        let i = 0;
        while (i < subtitles.length) {
            let currentSub = subtitles[i];
            if (currentSub.text.trim().length <= threshold && i < subtitles.length - 1) {
                let nextSub = subtitles[i + 1];
                const newMergedSub = {
                    id: currentSub.id,
                    startTime: currentSub.startTime,
                    endTime: nextSub.endTime,
                    text: (currentSub.text.trim() + " " + nextSub.text.trim()).trim()
                };
                mergedSubtitles.push(newMergedSub);
                i += 2;
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
        while (currentText.length > limit) {
            let splitPos = limit;
            const lastSpace = currentText.substring(0, splitPos).lastIndexOf(' ');
            if (lastSpace !== -1 && lastSpace > 0) {
                splitPos = lastSpace;
                lines.push(currentText.substring(0, splitPos).trim());
                currentText = currentText.substring(splitPos).trim();
            } else {
                lines.push(currentText.substring(0, limit));
                currentText = currentText.substring(limit);
            }
        }
        if (currentText.length > 0) {
            lines.push(currentText);
        }
        return lines;
    }

    function splitSubtitlesByCharLimit(subtitles, limit) {
        let newSubtitles = [];
        subtitles.forEach(sub => {
            const originalText = sub.text.replace(/\n/g, ' ').trim();
            if (originalText.length <= limit) {
                newSubtitles.push(sub);
            } else {
                const chunks = intelligentSplit(originalText, limit);
                const startTimeMs = timeToMs(sub.startTime);
                const endTimeMs = timeToMs(sub.endTime);
                const durationMs = endTimeMs - startTimeMs;
                if (durationMs <= 0) {
                    sub.text = chunks.join('\n');
                    newSubtitles.push(sub);
                    return;
                }
                const charsPerMs = originalText.length / durationMs;
                let currentStartTimeMs = startTimeMs;
                chunks.forEach(chunk => {
                    const chunkDurationMs = Math.round(chunk.length / charsPerMs);
                    let newEndTimeMs = currentStartTimeMs + chunkDurationMs;
                    if (newEndTimeMs > endTimeMs) {
                        newEndTimeMs = endTimeMs;
                    }
                    newSubtitles.push({
                        id: '...',
                        startTime: msToTime(currentStartTimeMs),
                        endTime: msToTime(newEndTimeMs),
                        text: chunk
                    });
                    currentStartTimeMs = newEndTimeMs > currentStartTimeMs ? newEndTimeMs : currentStartTimeMs + 1;
                });
            }
        });
        return newSubtitles.map((sub, index) => ({ ...sub, id: String(index + 1) }));
    }

    function timeToMs(timeStr) {
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

    // --- 匯出 SRT 檔案邏輯 ---
    exportSrtButton.addEventListener('click', () => {
        const subsToExport = processedSubtitles.length > 0 ? processedSubtitles : originalSubtitles;
        
        if (subsToExport.length === 0) {
            alert('沒有可匯出的字幕。');
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
