// SecureChain Cyber Defense - JavaScript

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('SecureChain Cyber Defense Platform initialized');
    
    // Initialize all functions
    initSmoothScrolling();
    initCardInteractions();
    initThreatSearch();
    initAnimations();
    initLiveThreatFeed();
});

// ==================== THREAT MAP DATABASE ====================
const threatDatabase = {
    countries: [
        { name: "United States", code: "US", flag: "https://flagcdn.com/w80/us.png", threatLevel: "high", attacks: 1250, blocked: 1180, region: "North America" },
        { name: "United Kingdom", code: "GB", flag: "https://flagcdn.com/w80/gb.png", threatLevel: "medium", attacks: 450, blocked: 430, region: "Europe" },
        { name: "Germany", code: "DE", flag: "https://flagcdn.com/w80/de.png", threatLevel: "medium", attacks: 380, blocked: 360, region: "Europe" },
        { name: "France", code: "FR", flag: "https://flagcdn.com/w80/fr.png", threatLevel: "low", attacks: 220, blocked: 215, region: "Europe" },
        { name: "China", code: "CN", flag: "https://flagcdn.com/w80/cn.png", threatLevel: "high", attacks: 980, blocked: 920, region: "Asia" },
        { name: "Japan", code: "JP", flag: "https://flagcdn.com/w80/jp.png", threatLevel: "low", attacks: 150, blocked: 148, region: "Asia" },
        { name: "India", code: "IN", flag: "https://flagcdn.com/w80/in.png", threatLevel: "medium", attacks: 420, blocked: 395, region: "Asia" },
        { name: "Russia", code: "RU", flag: "https://flagcdn.com/w80/ru.png", threatLevel: "high", attacks: 750, blocked: 700, region: "Europe" },
        { name: "Brazil", code: "BR", flag: "https://flagcdn.com/w80/br.png", threatLevel: "medium", attacks: 310, blocked: 290, region: "South America" },
        { name: "Canada", code: "CA", flag: "https://flagcdn.com/w80/ca.png", threatLevel: "low", attacks: 180, blocked: 175, region: "North America" },
        { name: "Australia", code: "AU", flag: "https://flagcdn.com/w80/au.png", threatLevel: "low", attacks: 120, blocked: 118, region: "Oceania" },
        { name: "South Korea", code: "KR", flag: "https://flagcdn.com/w80/kr.png", threatLevel: "medium", attacks: 280, blocked: 270, region: "Asia" },
        { name: "Italy", code: "IT", flag: "https://flagcdn.com/w80/it.png", threatLevel: "low", attacks: 165, blocked: 160, region: "Europe" },
        { name: "Spain", code: "ES", flag: "https://flagcdn.com/w80/es.png", threatLevel: "low", attacks: 140, blocked: 138, region: "Europe" },
        { name: "Netherlands", code: "NL", flag: "https://flagcdn.com/w80/nl.png", threatLevel: "medium", attacks: 195, blocked: 185, region: "Europe" },
        { name: "Singapore", code: "SG", flag: "https://flagcdn.com/w80/sg.png", threatLevel: "medium", attacks: 230, blocked: 220, region: "Asia" },
        { name: "Mexico", code: "MX", flag: "https://flagcdn.com/w80/mx.png", threatLevel: "medium", attacks: 270, blocked: 255, region: "North America" },
        { name: "South Africa", code: "ZA", flag: "https://flagcdn.com/w80/za.png", threatLevel: "low", attacks: 95, blocked: 92, region: "Africa" },
        { name: "Indonesia", code: "ID", flag: "https://flagcdn.com/w80/id.png", threatLevel: "medium", attacks: 340, blocked: 315, region: "Asia" },
        { name: "Turkey", code: "TR", flag: "https://flagcdn.com/w80/tr.png", threatLevel: "medium", attacks: 290, blocked: 275, region: "Europe" }
    ],
    states: [
        { name: "California", country: "United States", flag: "https://flagcdn.com/w80/us.png", threatLevel: "high", attacks: 420, blocked: 395, region: "Western US" },
        { name: "Texas", country: "United States", flag: "https://flagcdn.com/w80/us.png", threatLevel: "medium", attacks: 280, blocked: 265, region: "Southern US" },
        { name: "New York", country: "United States", flag: "https://flagcdn.com/w80/us.png", threatLevel: "high", attacks: 350, blocked: 330, region: "Northeastern US" },
        { name: "Maharashtra", country: "India", flag: "https://flagcdn.com/w80/in.png", threatLevel: "medium", attacks: 180, blocked: 170, region: "India" },
        { name: "Tamil Nadu", country: "India", flag: "https://flagcdn.com/w80/in.png", threatLevel: "low", attacks: 95, blocked: 92, region: "India" },
        { name: "Karnataka", country: "India", flag: "https://flagcdn.com/w80/in.png", threatLevel: "low", attacks: 85, blocked: 82, region: "India" },
        { name: "England", country: "United Kingdom", flag: "https://flagcdn.com/w80/gb.png", threatLevel: "medium", attacks: 310, blocked: 295, region: "UK" },
        { name: "Bavaria", country: "Germany", flag: "https://flagcdn.com/w80/de.png", threatLevel: "low", attacks: 120, blocked: 118, region: "Germany" },
        { name: "Tokyo", country: "Japan", flag: "https://flagcdn.com/w80/jp.png", threatLevel: "low", attacks: 110, blocked: 108, region: "Japan" },
        { name: "Ontario", country: "Canada", flag: "https://flagcdn.com/w80/ca.png", threatLevel: "low", attacks: 85, blocked: 83, region: "Canada" }
    ],
    districts: [
        { name: "Chennai", state: "Tamil Nadu", country: "India", flag: "https://flagcdn.com/w80/in.png", threatLevel: "low", attacks: 45, blocked: 44, region: "South India" },
        { name: "Mumbai", state: "Maharashtra", country: "India", flag: "https://flagcdn.com/w80/in.png", threatLevel: "medium", attacks: 120, blocked: 115, region: "West India" },
        { name: "Delhi", state: "Delhi", country: "India", flag: "https://flagcdn.com/w80/in.png", threatLevel: "medium", attacks: 95, blocked: 90, region: "North India" },
        { name: "Bangalore", state: "Karnataka", country: "India", flag: "https://flagcdn.com/w80/in.png", threatLevel: "low", attacks: 65, blocked: 63, region: "South India" },
        { name: "Los Angeles", state: "California", country: "United States", flag: "https://flagcdn.com/w80/us.png", threatLevel: "high", attacks: 180, blocked: 165, region: "Western US" },
        { name: "San Francisco", state: "California", country: "United States", flag: "https://flagcdn.com/w80/us.png", threatLevel: "high", attacks: 150, blocked: 140, region: "Western US" },
        { name: "New York City", state: "New York", country: "United States", flag: "https://flagcdn.com/w80/us.png", threatLevel: "high", attacks: 200, blocked: 185, region: "Northeastern US" },
        { name: "London", state: "England", country: "United Kingdom", flag: "https://flagcdn.com/w80/gb.png", threatLevel: "medium", attacks: 180, blocked: 170, region: "UK" },
        { name: "Berlin", state: "Berlin", country: "Germany", flag: "https://flagcdn.com/w80/de.png", threatLevel: "low", attacks: 85, blocked: 83, region: "Germany" },
        { name: "Tokyo", state: "Tokyo", country: "Japan", flag: "https://flagcdn.com/w80/jp.png", threatLevel: "low", attacks: 65, blocked: 64, region: "Japan" }
    ]
};

// ==================== THREAT MAP SEARCH ====================
let selectedItem = null;

function initThreatSearch() {
    const searchInput = document.getElementById('threatSearchInput');
    const searchType = document.getElementById('searchType');
    
    if (searchInput && searchType) {
        searchInput.addEventListener('input', function() {
            const query = this.value.trim();
            const type = searchType.value;
            
            if (query.length > 0) {
                performSearch(query, type);
            } else {
                clearSearchResults();
            }
        });
        
        searchType.addEventListener('change', function() {
            const query = searchInput.value.trim();
            if (query.length > 0) {
                performSearch(query, this.value);
            }
        });
    }
}

function performSearch(query, type) {
    const resultsContainer = document.getElementById('searchResults');
    let results = [];
    
    query = query.toLowerCase();
    
    if (type === 'country') {
        results = threatDatabase.countries.filter(c => 
            c.name.toLowerCase().includes(query) || 
            c.code.toLowerCase().includes(query)
        );
    } else if (type === 'state') {
        results = threatDatabase.states.filter(s => 
            s.name.toLowerCase().includes(query) || 
            s.country.toLowerCase().includes(query)
        );
    } else if (type === 'district') {
        results = threatDatabase.districts.filter(d => 
            d.name.toLowerCase().includes(query) || 
            d.state.toLowerCase().includes(query) ||
            d.country.toLowerCase().includes(query)
        );
    }
    
    displaySearchResults(results, type);
}

function displaySearchResults(results, type) {
    const resultsContainer = document.getElementById('searchResults');
    resultsContainer.innerHTML = '';
    
    if (results.length === 0) {
        resultsContainer.innerHTML = '<div class="no-results">No results found</div>';
        return;
    }
    
    results.forEach(item => {
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';
        resultItem.onclick = () => selectItem(item, type);
        
        resultItem.innerHTML = `
            <img src="${item.flag}" alt="${item.name} flag" class="country-flag" onerror="this.src='https://via.placeholder.com/40x28?text=Flag'">
            <div>
                <div class="result-name">${item.name}</div>
                <div class="result-type">${type}</div>
        `;
        
        resultsContainer.appendChild(resultItem);
    });
}

function selectItem(item, type) {
    selectedItem = item;
    
    const allResults = document.querySelectorAll('.search-result-item');
    allResults.forEach(r => r.classList.remove('selected'));
    event.target.closest('.search-result-item').classList.add('selected');
    
    showSelectedInfo(item, type);
}

function showSelectedInfo(item, type) {
    const selectedContainer = document.getElementById('selectedCountry');
    
    let locationInfo = '';
    if (type === 'state') {
        locationInfo = `<div class="detail-item"><div class="detail-label">Country</div><div class="detail-value">${item.country}</div>`;
    } else if (type === 'district') {
        locationInfo = `
            <div class="detail-item"><div class="detail-label">State</div><div class="detail-value">${item.state}</div>
            <div class="detail-item"><div class="detail-label">Country</div><div class="detail-value">${item.country}</div>
        `;
    } else {
        locationInfo = `<div class="detail-item"><div class="detail-label">Region</div><div class="detail-value">${item.region}</div>`;
    }
    
    const threatClass = `threat-${item.threatLevel}`;
    
    selectedContainer.innerHTML = `
        <div class="selected-country-header">
            <img src="${item.flag}" alt="${item.name} flag" class="selected-flag" onerror="this.src='https://via.placeholder.com/60x40?text=Flag'">
            <div class="selected-country-name">${item.name}</div>
        <div class="selected-country-details">
            <div class="detail-item">
                <div class="detail-label">Type</div>
                <div class="detail-value">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
            <div class="detail-item">
                <div class="detail-label">Threat Level</div>
                <div class="detail-value ${threatClass}">${item.threatLevel.toUpperCase()}</div>
            <div class="detail-item">
                <div class="detail-label">Total Attacks</div>
                <div class="detail-value">${item.attacks}</div>
            <div class="detail-item">
                <div class="detail-label">Blocked</div>
                <div class="detail-value">${item.blocked}</div>
            ${locationInfo}
        </div>
    `;
    
    selectedContainer.classList.add('active');
}

function searchThreats() {
    const searchInput = document.getElementById('threatSearchInput');
    const searchType = document.getElementById('searchType');
    
    if (searchInput && searchType) {
        performSearch(searchInput.value.trim(), searchType.value);
    }
}

function clearSearch() {
    const searchInput = document.getElementById('threatSearchInput');
    const selectedContainer = document.getElementById('selectedCountry');
    
    if (searchInput) {
        searchInput.value = '';
    }
    
    clearSearchResults();
    
    if (selectedContainer) {
        selectedContainer.classList.remove('active');
        selectedContainer.innerHTML = '';
    }
    
    selectedItem = null;
}

function clearSearchResults() {
    const resultsContainer = document.getElementById('searchResults');
    if (resultsContainer) {
        resultsContainer.innerHTML = '';
    }
}

// ==================== SMOOTH SCROLLING ====================
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const targetPosition = targetSection.offsetTop;
                
                window.scrollTo({
                    top: targetPosition - 20,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ==================== CARD INTERACTIONS ====================
function initCardInteractions() {
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
        card.addEventListener('click', function() {
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
}

// ==================== ANIMATIONS ====================
function initAnimations() {
    // Animate hero stats
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-count'));
        let current = 0;
        const increment = target / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                stat.textContent = target.toLocaleString();
                clearInterval(timer);
            } else {
                stat.textContent = Math.floor(current).toLocaleString();
            }
        }, 30);
    });
}

// ==================== DASHBOARD FUNCTIONS ====================
function runQuickScan() {
    alert('Quick scan initiated...\n\nScanning for threats...\n\n✓ System check complete\n✓ No malware detected\n✓ All protections active');
}

function updateThreatStatus() {
    const counter = document.querySelector('.counter-number');
    if (counter) {
        counter.textContent = '0';
        setTimeout(() => {
            counter.textContent = Math.floor(Math.random() * 5);
        }, 500);
    }
}

// ==================== TOOL FUNCTIONS ====================
function checkPassword() {
    const input = document.getElementById('passwordInput');
    const result = document.getElementById('passwordResult');
    const password = input.value;
    
    if (!password) {
        result.innerHTML = 'Please enter a password';
        result.className = 'tool-result show weak';
        return;
    }
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    if (strength <= 2) {
        result.innerHTML = 'Weak password - add more characters, numbers, and symbols';
        result.className = 'tool-result show weak';
    } else if (strength <= 4) {
        result.innerHTML = 'Medium strength - consider adding more complexity';
        result.className = 'tool-result show medium';
    } else {
        result.innerHTML = 'Strong password! ✓';
        result.className = 'tool-result show strong';
    }
}

function calculateRisk() {
    const f1 = parseInt(document.getElementById('riskFactor1').value);
    const f2 = parseInt(document.getElementById('riskFactor2').value);
    const f3 = parseInt(document.getElementById('riskFactor3').value);
    
    const risk = Math.round((100 - ((f1 + f2 + f3) / 3)));
    const result = document.getElementById('riskResult');
    
    let riskLevel, riskClass;
    if (risk > 70) {
        riskLevel = 'High Risk';
        riskClass = 'weak';
    } else if (risk > 40) {
        riskLevel = 'Medium Risk';
        riskClass = 'medium';
    } else {
        riskLevel = 'Low Risk';
        riskClass = 'strong';
    }
    
    result.innerHTML = `Risk Score: ${risk}% - ${riskLevel}`;
    result.className = `tool-result show ${riskClass}`;
}

function optimizeStorage() {
    alert('Storage optimization complete!\n\n✓ Fragmented files consolidated\n✓ Cache cleared\n✓ 15% more space available');
}

function generateHash() {
    const input = document.getElementById('hashGenInput').value;
    const result = document.getElementById('hashGenResult');
    
    if (!input) {
        result.innerHTML = 'Please enter text to hash';
        result.className = 'tool-result show weak';
        return;
    }
    
    // Simple hash simulation
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    
    const hashHex = Math.abs(hash).toString(16).padStart(16, '0').repeat(4);
    result.innerHTML = `SHA-256: ${hashHex.substring(0, 64)}`;
    result.className = 'tool-result show strong';
}

// ==================== FILE UPLOAD ====================
function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    const statusDiv = document.getElementById('uploadStatus');
    
    if (!fileInput.files || fileInput.files.length === 0) {
        showStatus(statusDiv, 'Please select a file to upload', 'error');
        return;
    }
    
    const file = fileInput.files[0];
    const fileSize = (file.size / 1024).toFixed(2);
    
    showStatus(statusDiv, `Uploading ${file.name} (${fileSize} KB) to blockchain...`, 'info');
    
    const mockHash = generateMockHash(file.name);
    
    setTimeout(() => {
        showStatus(statusDiv, `✓ File uploaded successfully! Hash: ${mockHash}`, 'success');
    }, 1500);
}

function showStatus(element, message, type) {
    element.innerHTML = message;
    element.className = type;
    element.style.display = 'block';
    
    if (type === 'success') {
        setTimeout(() => {
            element.style.display = 'none';
        }, 5000);
    }
}

function generateMockHash(filename) {
    const timestamp = Date.now();
    const hashInput = filename + timestamp;
    let hash = '';
    const chars = '0123456789abcdef';
    
    for (let i = 0; i < 64; i++) {
        const charIndex = (hashInput.charCodeAt(i % hashInput.length) + i) % 16;
        hash += chars[charIndex];
    }
    
    return hash;
}

// ==================== VERIFY ====================
function verifyHash() {
    const hashInput = document.getElementById('hashInput');
    const statusDiv = document.getElementById('verifyStatus');
    const hash = hashInput.value.trim();
    
    if (!hash) {
        showStatus(statusDiv, 'Please enter a hash to verify', 'error');
        return;
    }
    
    showStatus(statusDiv, 'Verifying hash on blockchain...', 'info');
    
    setTimeout(() => {
        if (hash.length === 64) {
            showStatus(statusDiv, '✓ Hash verified! Document is authentic.', 'success');
        } else {
            showStatus(statusDiv, '✗ Invalid hash format', 'error');
        }
    }, 1000);
}

// ==================== SCANNER ====================
function startScan() {
    const resultsDiv = document.getElementById('scanResults');
    
    resultsDiv.innerHTML = `
        <div class="scan-progress">
            <div class="progress-bar">
                <div class="progress-fill"></div>
            <p>Scanning network...</p>
        </div>
    `;
    
    setTimeout(() => {
        resultsDiv.innerHTML = `
            <div class="scan-result">
                <p>✓ Scan complete - No threats found</p>
                <p>Scanned: 256 ports | 12 services</p>
            </div>
        `;
    }, 3000);
}

// ==================== CHAT ====================
function sendMessage() {
    const input = document.getElementById('chatInput');
    const messages = document.getElementById('chatMessages');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    const userMsg = document.createElement('div');
    userMsg.className = 'message user';
    userMsg.innerHTML = `<div class="message-content"><p>${message}</p></div>`;
    messages.appendChild(userMsg);
    
    // Clear input
    input.value = '';
    
    // Simulate bot response
    setTimeout(() => {
        const botMsg = document.createElement('div');
        botMsg.className = 'message bot';
        botMsg.innerHTML = `
            <div class="message-content">
                <i class="fas fa-robot"></i>
                <p>Thank you for your message. Our AI is analyzing your query: "${message}"</p>
            </div>
        `;
        messages.appendChild(botMsg);
        messages.scrollTop = messages.scrollHeight;
    }, 1000);
    
    messages.scrollTop = messages.scrollHeight;
}

function askQuick(question) {
    const input = document.getElementById('chatInput');
    input.value = question;
    sendMessage();
}

// ==================== VAULT ====================
function accessVault() {
    alert('🔐 Evidence Vault\n\nBlockchain-based evidence storage\n\nItems: 1,247\nNodes: 48\nEncryption: 256-bit\n\nAccess granted ✓');
}

// ==================== REPORTS ====================
function generateReport(type) {
    let title, content;
    
    switch(type) {
        case 'audit':
            title = 'Audit Report';
            content = 'All systems operational\nNo unauthorized access\nFile integrity verified\nStatus: PASSED';
            break;
        case 'threat':
            title = 'Threat Analysis';
            content = 'Active threats: 0\nBlocked: 12\nRisk level: LOW';
            break;
        case 'performance':
            title = 'Performance';
            content = 'Uptime: 99.99%\nResponse: 45ms\nThroughput: 1,240 TPS';
            break;
        case 'compliance':
            title = 'Compliance';
            content = 'GDPR: Compliant\nISO 27001: Verified\nSOC 2: Active';
            break;
    }
    
    alert(`${title}\n\n${content}`);
}

// ==================== THEME TOGGLE ====================
function toggleTheme() {
    document.body.classList.toggle('light-theme');
    const icon = document.getElementById('themeIcon');
    
    if (document.body.classList.contains('light-theme')) {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
}

// ==================== LIVE THREAT FEED ====================
const threatTypes = [
    { type: 'ddos', icon: 'fa-server', message: 'DDoS Attack blocked' },
    { type: 'malware', icon: 'fa-bug', message: 'Malware detected & removed' },
    { type: 'phishing', icon: 'fa-fish', message: 'Phishing attempt blocked' },
    { type: 'bruteforce', icon: 'fa-user-lock', message: 'Brute force attack prevented' },
    { type: 'ddos', icon: 'fa-server', message: 'Traffic anomaly detected' },
    { type: 'malware', icon: 'fa-virus', message: 'Trojan signature identified' },
    { type: 'phishing', icon: 'fa-envelope', message: 'Fake email blocked' },
    { type: 'bruteforce', icon: 'fa-shield-alt', message: 'Login attempt blocked' }
];

const targetCountries = ['USA', 'China', 'Russia', 'India', 'Germany', 'Brazil', 'UK', 'Japan'];

function initLiveThreatFeed() {
    const threatFeed = document.getElementById('threatFeed');
    if (!threatFeed) return;
    
    // Add initial threats
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            addThreatItem();
        }, i * 800);
    }
    
    // Add new threats periodically
    setInterval(() => {
        addThreatItem();
    }, 3000);
}

function addThreatItem() {
    const threatFeed = document.getElementById('threatFeed');
    if (!threatFeed) return;
    
    const threatType = threatTypes[Math.floor(Math.random() * threatTypes.length)];
    const country = targetCountries[Math.floor(Math.random() * targetCountries.length)];
    const time = new Date().toLocaleTimeString();
    
    const threatItem = document.createElement('div');
    threatItem.className = `threat-item ${threatType.type}`;
    threatItem.innerHTML = `
        <i class="fas ${threatType.icon}"></i>
        <span>${country}: ${threatType.message}</span>
        <span class="threat-time">${time}</span>
    `;
    
    threatFeed.insertBefore(threatItem, threatFeed.firstChild);
    
    // Keep only last 10 items
    while (threatFeed.children.length > 10) {
        threatFeed.removeChild(threatFeed.lastChild);
    }
}

// ==================== EXPOSE FUNCTIONS ====================
window.uploadFile = uploadFile;
window.verifyHash = verifyHash;
window.startScan = startScan;
window.sendMessage = sendMessage;
window.askQuick = askQuick;
window.accessVault = accessVault;
window.generateReport = generateReport;
window.searchThreats = searchThreats;
window.clearSearch = clearSearch;
window.checkPassword = checkPassword;
window.calculateRisk = calculateRisk;
window.optimizeStorage = optimizeStorage;
window.generateHash = generateHash;
window.runQuickScan = runQuickScan;
window.updateThreatStatus = updateThreatStatus;
window.toggleTheme = toggleTheme;
