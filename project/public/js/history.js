(function() {
    let vm;
    let history = []; // 历史记录
    let historyIndex = 0; // 当前历史记录的指针
    let lastAction = {}; // 上一次操作的对象

    function post(api, data, callback) {
        $.ajax({
            type: 'POST',
            url: `/geo/api/{api}`,
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
    }
    function showHistory() {
        document.getElementById('historyContent').innerHTML = history.map((o, k)=>(
            `<div class="history-item"${k>historyIndex?' style="color:gray;" ':' '}onclick="window.setTopHistory(${k})">${k+1}. ${o.name}</div>`
        )).join('');
    }
    function resetHistory(name) {
        historyIndex = 0;
        history = [];
        post('resetHistory');
        showHistory();
    }
    function pushHistory(name) {
        post('setHistory', { name, json: vm.geojsonInput() }, (data)=>{
            history.push(data);
            historyIndex++;
            showHistory();
        });
    }
    function setTopHistory(index) {
        historyIndex = index;
        post('getHistoryData', { version: history[historyIndex].version }, (data)=>{
            vm.geojsonInput(data);
            showHistory();
        });
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
