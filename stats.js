document.addEventListener('DOMContentLoaded', (event) => {
    loadStats();
});

function loadStats(playerName) {
    const stats = JSON.parse(localStorage.getItem(`multiplicationStats_${playerName}`)) || [];
    const statsBody = document.getElementById("stats-body");
    const heatMapBody = document.getElementById("heat-map-body");
    const totalCount = document.getElementById("total-count");
    const statsPlayerName = document.getElementById("stats-player-name");
    const groupedStats = {};

    // Set the player's name in the stats view
    statsPlayerName.textContent = playerName;

    totalCount.innerHTML = stats.length;

    // Group stats by equation
    stats.forEach((stat) => {
        const equation = `${stat.equation.a} * ${stat.equation.b}`;
        if (!groupedStats[equation]) {
            groupedStats[equation] = {
                count: 0,
                totalTime: 0,
                result: stat.equation.result,
                a: stat.equation.a,
                b: stat.equation.b,
            };
        }
        groupedStats[equation].count++;
        groupedStats[equation].totalTime += stat.time;
    });

    // Convert groupedStats to an array and calculate average time
    const sortedStats = Object.values(groupedStats).map((data) => ({
        equation: `${data.a} × ${data.b}`,
        result: data.result,
        count: data.count,
        avgTime: data.totalTime / data.count,
        a: data.a,
        b: data.b,
    }));

    sortedStats.sort((a, b) => b.avgTime - a.avgTime);

    // Clear existing table rows
    statsBody.innerHTML = "";
    heatMapBody.innerHTML = "";

    // Create heat map for individual numbers
    const numberHeatMapRow = document.createElement("tr");
    numberHeatMapRow.id = "number-heat-map-row";
    numberHeatMapRow.innerHTML = "<th>Gruppiert</th>";
    heatMapBody.appendChild(numberHeatMapRow);

    const numberData = Array(10)
        .fill()
        .map(() => ({ totalTime: 0, count: 0 }));

    sortedStats.forEach((stat) => {
        numberData[stat.a - 1].totalTime += stat.avgTime;
        numberData[stat.a - 1].count++;
        numberData[stat.b - 1].totalTime += stat.avgTime;
        numberData[stat.b - 1].count++;
    });

    const numberAvgTimes = numberData.map((data) =>
        data.count > 0 ? data.totalTime / data.count : null
    );

    let minNumberTime = Math.min(
        ...numberAvgTimes.filter((time) => time !== null)
    );
    let maxNumberTime = Math.max(
        ...numberAvgTimes.filter((time) => time !== null)
    );

    numberAvgTimes.forEach((time, index) => {
        const cell = numberHeatMapRow.insertCell();
        if (time !== null) {
            const normalizedTime =
                (time - minNumberTime) / (maxNumberTime - minNumberTime);
            const red = Math.round(255 * normalizedTime);
            const green = Math.round(255 * (1 - normalizedTime));
            cell.style.backgroundColor = `rgb(${red}, ${green}, 0)`;
            cell.innerHTML = `<span>${formatGermanDecimal(time)}s</span>`;
        } else {
            cell.style.backgroundColor = "#f2f2f2";
            cell.innerHTML = "<span>K.A.</span>";
        }
    });

    // Create heat map for individual equations
    const heatMapData = Array(10)
        .fill()
        .map(() => Array(10).fill(null));
    let minTime = Infinity;
    let maxTime = 0;

    sortedStats.forEach((stat) => {
        heatMapData[stat.a - 1][stat.b - 1] = stat.avgTime;
        minTime = Math.min(minTime, stat.avgTime);
        maxTime = Math.max(maxTime, stat.avgTime);
    });

    for (let i = 0; i < 10; i++) {
        const row = heatMapBody.insertRow();
        const headerCell = row.insertCell();
        headerCell.innerHTML = `<th>${i + 1}</th>`;
        for (let j = 0; j < 10; j++) {
            const cell = row.insertCell();
            const time = heatMapData[i][j];
            if (time !== null) {
                const normalizedTime = (time - minTime) / (maxTime - minTime);
                const red = Math.round(255 * normalizedTime);
                const green = Math.round(255 * (1 - normalizedTime));
                cell.style.backgroundColor = `rgb(${red}, ${green}, 0)`;
                cell.innerHTML = `<span>${formatGermanDecimal(time)}s</span>`;
            } else {
                cell.style.backgroundColor = "#f2f2f2";
                cell.innerHTML = "<span>K.A.</span>";
            }
        }
    }

    // Display sorted stats
    sortedStats.forEach(({ equation, result, count, avgTime }, index) => {
        const row = statsBody.insertRow();
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${equation} = ${result}</td>
            <td>${count}</td>
            <td>${formatGermanDecimal(avgTime)}s</td>
        `;
        row.classList.add('align-middle'); // Bootstrap class for vertical alignment
    });
}

// Helper function to format numbers with German decimal notation
function formatGermanDecimal(number, decimals = 2) {
    return number.toFixed(decimals).replace('.', ',');
}

function getPlayerNameFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('player') || 'Unknown Player';
}

document.addEventListener('DOMContentLoaded', (event) => {
    const playerName = getPlayerNameFromURL();
    document.getElementById("stats-player-name").textContent = playerName;
    loadStats(playerName);
});