// SecureChain Charts Utils - Chart.js Dashboard Visualizations

// Threat pie chart data structure
const THREAT_CHART_DATA = {
    labels: ['DDoS', 'Malware', 'Brute Force', 'Phishing', 'Other'],
    datasets: [{
        data: [45, 25, 15, 10, 5],
        backgroundColor: ['#ff3366', '#ffaa00', '#00ff88', '#3366ff', '#ff66cc'],
        borderColor: '#0a0a0a',
        borderWidth: 2
    }]
};

// Stats line chart mock data (time series)
const STATS_CHART_DATA = {
    labels: ['12AM', '2AM', '4AM', '6AM', '8AM', '10AM', '12PM'],
    datasets: [{
        label: 'Threats Blocked',
        data: [12, 19, 3, 5, 2, 3, 15],
        borderColor: '#00ff88',
        backgroundColor: 'rgba(0, 255, 136, 0.1)',
        tension: 0.4,
        fill: true
    }]
};

// Initialize dashboard charts
function initDashboardCharts() {
    // Threat Distribution Pie Chart
    const threatCtx = document.getElementById('threatPieChart')?.getContext('2d');
    if (threatCtx) {
        new Chart(threatCtx, {
            type: 'pie',
            data: THREAT_CHART_DATA,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: getComputedStyle(document.body).getPropertyValue('--text-color') }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(10, 10, 10, 0.95)',
                        titleColor: '#00ff88',
                        bodyColor: '#e0e0e0'
                    }
                }
            }
        });
    }

    // Stats Line Chart
    const statsCtx = document.getElementById('statsLineChart')?.getContext('2d');
    if (statsCtx) {
        new Chart(statsCtx, {
            type: 'line',
            data: STATS_CHART_DATA,
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255,255,255,0.1)' },
                        ticks: { color: getComputedStyle(document.body).getPropertyValue('--text-color') }
                    },
                    x: {
                        grid: { color: 'rgba(255,255,255,0.1)' },
                        ticks: { color: getComputedStyle(document.body).getPropertyValue('--text-color') }
                    }
                },
                plugins: {
                    legend: {
                        labels: { color: getComputedStyle(document.body).getPropertyValue('--text-color') }
                    }
                }
            }
        });
    }
}

// Update charts with real backend data
async function updateChartsWithBackendData() {
    try {
        const stats = await api.getThreatStats();
        const threats = await api.getThreats(null, null, 100);

        // Update pie chart
        const threatTypes = {};
        threats.forEach(t => {
            threatTypes[t.attackType] = (threatTypes[t.attackType] || 0) + 1;
        });

        if (window.threatPieChart) {
            window.threatPieChart.data.datasets[0].data = Object.values(threatTypes);
            window.threatPieChart.data.labels = Object.keys(threatTypes);
            window.threatPieChart.update();
        }

    } catch (error) {
        console.log('Backend charts update failed, using mock data');
    }
}

// Export functions for main script
window.initDashboardCharts = initDashboardCharts;
window.updateChartsWithBackendData = updateChartsWithBackendData;

