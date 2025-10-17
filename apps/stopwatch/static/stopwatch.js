let startTime = 0, elapsedTime = 0, timerInterval = null, running = false;
let lapTimes = [];
let lapStartTime = 0;
function start() {
    if (!running) {
        startTime = Date.now() - elapsedTime;
        lapStartTime = Date.now() - elapsedTime;
        timerInterval = setInterval(updateDisplay, 10);
        running = true;
        document.getElementById('startBtn').disabled = true;
        document.getElementById('stopBtn').disabled = false;
        document.getElementById('lapBtn').disabled = false;
    }
}
function stop() {
    if (running) {
        clearInterval(timerInterval);
        running = false;
        document.getElementById('startBtn').disabled = false;
        document.getElementById('stopBtn').disabled = true;
        document.getElementById('lapBtn').disabled = true;
    }
}
function reset() {
    clearInterval(timerInterval);
    elapsedTime = 0;
    running = false;
    lapStartTime = 0;
    document.getElementById('startBtn').disabled = false;
    document.getElementById('stopBtn').disabled = true;
    document.getElementById('lapBtn').disabled = true;
    updateDisplay();
}

function recordLap() {
    if (running) {
        const currentTime = Date.now();
        const totalElapsed = currentTime - startTime;
        const lapElapsed = currentTime - lapStartTime;
        const lap = {
            number: lapTimes.length + 1,
            totalTime: totalElapsed,
            lapTime: lapElapsed,
            timestamp: new Date().toLocaleString('ja-JP')
        };
        lapTimes.push(lap);
        lapStartTime = currentTime;
        updateLapDisplay();
        updateStatistics();
    }
}
function clearLaps() {
    lapTimes = [];
    updateLapDisplay();
    updateStatistics();
}
function updateDisplay() {
    if (running) elapsedTime = Date.now() - startTime;
    const totalMilliseconds = elapsedTime;
    const hours = Math.floor(totalMilliseconds / 3600000);
    const minutes = Math.floor((totalMilliseconds % 3600000) / 60000);
    const seconds = Math.floor((totalMilliseconds % 60000) / 1000);
    const milliseconds = Math.floor((totalMilliseconds % 1000));
    document.getElementById('display').textContent = 
        String(hours).padStart(2, '0') + ':' +
        String(minutes).padStart(2, '0') + ':' +
        String(seconds).padStart(2, '0') + '.' +
        String(milliseconds).padStart(3, '0');

    // 時計が00:00.000のときはリセットボタンをグレーアウト
    const resetBtn = document.getElementById('resetBtn');
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    if (resetBtn) {
        if (totalMilliseconds === 0) {
            resetBtn.disabled = true;
        } else {
            resetBtn.disabled = false;
        }
    }
    // スタート・ストップボタンの状態を厳密化
    if (startBtn && stopBtn) {
        if (running) {
            startBtn.disabled = true;
            stopBtn.disabled = false;
        } else {
            startBtn.disabled = false;
            stopBtn.disabled = true;
        }
    }
}
function formatTime(milliseconds) {
    const hours = Math.floor(milliseconds / 3600000);
    const minutes = Math.floor((milliseconds % 3600000) / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    const ms = Math.floor((milliseconds % 1000));
    return String(hours).padStart(2, '0') + ':' +
           String(minutes).padStart(2, '0') + ':' +
           String(seconds).padStart(2, '0') + '.' +
           String(ms).padStart(3, '0');
}
function updateLapDisplay() {
    const lapList = document.getElementById('lapList');
    const csvBtn = document.querySelector('.download');
    const clearBtn = document.querySelector('.reset[onclick="clearLaps()"]');
    if (lapTimes.length === 0) {
        lapList.innerHTML = '<div style="text-align: center; color: #6c757d; padding: 20px;">ラップタイムはここに表示されます</div>';
        if (csvBtn) csvBtn.disabled = true;
        if (clearBtn) clearBtn.disabled = true;
        return;
    } else {
        if (csvBtn) csvBtn.disabled = false;
        if (clearBtn) clearBtn.disabled = false;
    }
    // 最速・最遅ラップを特定
    const lapTimesOnly = lapTimes.map(lap => lap.lapTime);
    const bestTime = Math.min(...lapTimesOnly);
    const worstTime = Math.max(...lapTimesOnly);
    let html = '';
    // 配列を逆順にして新しいラップが上に表示されるようにする
    [...lapTimes].reverse().forEach((lap, index) => {
        let badge = '';
        let extraClass = '';
        if (lap.lapTime === bestTime && lapTimes.length > 1) {
            badge = '<span class="lap-badge best">最速</span>';
            extraClass = ' best-lap';
        } else if (lap.lapTime === worstTime && lapTimes.length > 1) {
            badge = '<span class="lap-badge worst">最遅</span>';
            extraClass = ' worst-lap';
        }
        html += `
            <div class="lap-item${extraClass}">
                <span class="lap-number">ラップ ${lap.number}</span>
                <span class="lap-time-with-badge">
                    ${badge}${formatTime(lap.lapTime)}
                </span>
            </div>
        `;
    });
    lapList.innerHTML = html;
}
function updateStatistics() {
    const totalLapsEl = document.getElementById('totalLaps');
    const bestLapEl = document.getElementById('bestLap');
    const worstLapEl = document.getElementById('worstLap');
    const avgLapEl = document.getElementById('avgLap');
    totalLapsEl.textContent = lapTimes.length;
    if (lapTimes.length === 0) {
        bestLapEl.textContent = '--:--:--.---';
        worstLapEl.textContent = '--:--:--.---';
        avgLapEl.textContent = '--:--:--.---';
        return;
    }
    const lapTimesOnly = lapTimes.map(lap => lap.lapTime);
    const bestLap = Math.min(...lapTimesOnly);
    const worstLap = Math.max(...lapTimesOnly);
    const avgLap = lapTimesOnly.reduce((sum, time) => sum + time, 0) / lapTimesOnly.length;
    bestLapEl.textContent = formatTime(bestLap);
    worstLapEl.textContent = formatTime(worstLap);
    avgLapEl.textContent = formatTime(avgLap);
}
function exportCSV() {
    if (lapTimes.length === 0) {
        alert('記録されたラップタイムがありません。');
        return;
    }
    // 最速・最遅を事前に特定
    const lapTimesOnly = lapTimes.map(lap => lap.lapTime);
    const bestTime = Math.min(...lapTimesOnly);
    const worstTime = Math.max(...lapTimesOnly);
    let csvContent = 'ラップ番号,ラップタイム,累積時間,記録時刻,最速最遅\n';
    lapTimes.forEach(lap => {
        let speedLabel = '';
        if (lapTimes.length > 1) {
            if (lap.lapTime === bestTime) {
                speedLabel = '最速';
            } else if (lap.lapTime === worstTime) {
                speedLabel = '最遅';
            }
        }
        csvContent += `${lap.number},${formatTime(lap.lapTime)},${formatTime(lap.totalTime)},"${lap.timestamp}",${speedLabel}\n`;
    });
    // 統計情報を追加
    csvContent += '\n';
    csvContent += '統計情報\n';
    csvContent += '項目,値\n';
    csvContent += `総ラップ数,${lapTimes.length}\n`;
    if (lapTimes.length > 0) {
        const avgLap = lapTimesOnly.reduce((sum, time) => sum + time, 0) / lapTimesOnly.length;
        // 最速・最遅ラップの番号を特定
        const bestLapNumber = lapTimes.find(lap => lap.lapTime === bestTime).number;
        const worstLapNumber = lapTimes.find(lap => lap.lapTime === worstTime).number;
        csvContent += `最速ラップ,${formatTime(bestTime)} (ラップ${bestLapNumber})\n`;
        csvContent += `最遅ラップ,${formatTime(worstTime)} (ラップ${worstLapNumber})\n`;
        csvContent += `平均ラップ,${formatTime(avgLap)}\n`;
        // 最速と最遅の差
        const lapRange = worstTime - bestTime;
        csvContent += `タイム差,${formatTime(lapRange)}\n`;
    }
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const ymd = now.toISOString().slice(0,10);
    const hms = pad(now.getHours()) + pad(now.getMinutes()) + pad(now.getSeconds());
    link.setAttribute('download', `stopwatch_laps_${ymd}_${hms}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
// 初期化
updateDisplay();
updateStatistics();
