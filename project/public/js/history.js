(function() {
    let vm;
    let history = []; // 历史记录
    let historyIndex = -1; // 当前历史记录的指针

    function post(api, data, callback) {
        $.ajax({
            type: 'POST',
            url: `/geo/api/${api}`,
            dataType: 'json',
            data,
            success: function (result) {
                if (result.success) {
                    callback && callback(result.context);
                }
            }
        });
    }
    function initHistory(_vm) {
        vm = _vm;
        post('getHistoryList', {}, (data)=>{
            vm.geojsonInput(data.jsonText);
            history = data.list;
            historyIndex = history.length;
            showHistory();
        });
    }
    function showHistory() {
        document.getElementById('historyContent').innerHTML = history.map((o, k)=>(
            `<div class="historyItem"${k>historyIndex?' style="color:gray;" ':' '}onclick="window.setTopHistory(${k})">${k+1}.${o.name.substr(0, 9)}</div>`
        )).join('');
    }
    function resetHistory(name) {
        historyIndex = -1;
        history = [];
        post('resetHistory', {}, (data)=>{
            pushHistory('打开区域');
        });
    }
    function pushHistory(name) {
        let version;
        if (historyIndex < history.length-1) {
            version = history[historyIndex].version;
        }
        post('setHistory', { version, name, data: vm.geojsonInput() }, (data)=>{
            historyIndex++;
            history.length = historyIndex;
            history.push(data);
            showHistory();
        });
    }
    function setTopHistory(index) {
        if (historyIndex !== index) {
            historyIndex = index;
            post('getHistoryData', { version: history[historyIndex].version }, (data)=>{
                vm.geojsonInput(data);
                showHistory();
            });
        }
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
    window.resetHistory = resetHistory;
    window.pushHistory = pushHistory;
    window.popHistory = popHistory;
    window.recoverHistory = recoverHistory;
    window.setTopHistory = setTopHistory;
})();
