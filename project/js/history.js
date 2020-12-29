(function() {
    let vm;
    let history = []; // 历史记录
    let historyIndex = 0; // 当前历史记录的指针
    let lastAction = {}; // 上一次操作的对象

    function initHistory(_vm) {
        vm = _vm;
    }
    function showHistory() {
        document.getElementById('historyContent').innerHTML = history.map((o, k)=>(
            `<div class="history-item"${k>historyIndex?' style="color:gray;" ':' '}onclick="window.setTopHistory(${k})">${k+1}. ${o.name}</div>`
        )).join('');
    }
    function pushHistory(name) {
        historyIndex++;
        history.length = historyIndex;
        history.push({ name, json: vm.geojsonInput() });
        showHistory();
    }
    function setTopHistory(index) {
        historyIndex = index;
        vm.setRootHtml(history[historyIndex].json);
        showHistory();
    }
    function popHistory() {
        if (historyIndex > 0) {
            setTopHistory(historyIndex - 1);
        }
    }
    function recoverHistory() {
        if (history.length > historyIndex + 1) {
            setTopHistory(historyIndex + 1);
        }
    }
    window.initHistory = initHistory;
    window.pushHistory = pushHistory;
    window.popHistory = popHistory;
    window.recoverHistory = recoverHistory;
    window.setTopHistory = setTopHistory;
})();
