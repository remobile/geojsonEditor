(function() {
    let history = []; // 历史记录
    let historyIndex = 0; // 当前历史记录的指针
    let lastAction = {}; // 上一次操作的对象

    function optimizeHistory() {
        const length = history.length;
        if (length > 0) {
            const dialog = layer.confirm('优化历史记录了之后不能再恢复，是否继续?', {
                btn: ['继续','放弃']
            }, function(){
                let newHistory = [];
                for (let i = 0; i < length - 10; i += 10) {
                    newHistory.push(history[i]);
                }
                history = newHistory.concat(history.slice(history.length-10));
                historyIndex = history.length - 1;
                showHistory();
                layer.close(dialog);
                utils.toast('优化成功');
            });
        }
    }
    function showHistory() {
        document.getElementById('historyContent').innerHTML = history.map((o, k)=>(
            `<div class="history-item"${k>historyIndex?' style="color:gray;" ':' '}onclick="window.setTopHistory(${k})">${k+1}. ${o.name}</div>`
        )).join('');
    }
    function pushHistory(name) {
        const action = editor.getAction();
        if (!(lastAction.target === action.target && lastAction.name === name)) {
            lastAction.target = action.target;
            lastAction.name = name;

            historyIndex++;
            history.length = historyIndex;
            history.push({ name, json: vm.geojsonInput() });
            showHistory();
        }
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
    window.splitPolygon = split;
})();
