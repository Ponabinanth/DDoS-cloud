
// SecureChain Cyber Defense - JavaScript

const STORAGE_KEYS = {
    checklist: 'securechain_checklist',
    incidentLog: 'securechain_incident_log',
    evidenceLog: 'securechain_evidence_log',
    uploads: 'securechain_uploads',
    theme: 'securechain_theme'
};

function safeInit(name, fn) {
    try {
        const out = fn();
        if (out && typeof out.then === 'function') {
            out.catch((error) => {
                console.warn(`[SecureChain] ${name} failed:`, error);
            });
        }
    } catch (error) {
        // Keep the platform usable even if one module fails.
        console.warn(`[SecureChain] ${name} failed:`, error);
    }
}

function bootSecureChain() {
    console.log('SecureChain Cyber Defense Platform initialized');

    safeInit('smoothScrolling', initSmoothScrolling);
    safeInit('cardInteractions', initCardInteractions);
    safeInit('tiltMotion', initTiltMotion);
    safeInit('threatSearch', initThreatSearch);
    safeInit('animations', initAnimations);
    safeInit('enhancedAnimations', initEnhancedAnimations);
    safeInit('liveThreatFeed', initLiveThreatFeed);
    safeInit('uploadZone', initUploadZone);
    safeInit('riskInputs', initRiskInputs);
    safeInit('operationForm', initOperationForm);
    safeInit('defensePlan', initDefensePlan);
    safeInit('estimatorInputs', initEstimatorInputs);
    safeInit('cryptoAnalyzer', initCryptoAnalyzer);
    safeInit('opsChecklist', initOpsChecklist);
    safeInit('incidentLog', renderIncidentLog);
    safeInit('timer', initTimer);
    safeInit('evidenceLog', renderEvidenceLog);
    safeInit('recentUploads', renderRecentUploads);
    safeInit('theme', initTheme);
    safeInit('apiStatus', initApiStatus);
    safeInit('voiceAssistant', initVoiceAssistant);
    safeInit('simulationCenter', initSimulationCenter);
    safeInit('commandPalette', initCommandPalette);
    safeInit('keyboardShortcuts', initKeyboardShortcuts);
    safeInit('onlineStatus', initOnlineStatus);

    // Pull initial data where available.
    safeInit('myFiles', loadMyFiles);
}

// Avoid TDZ issues by booting after the whole file executes.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootSecureChain, { once: true });
} else {
    setTimeout(bootSecureChain, 0);
}

function getJson(key, fallback) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
    } catch (error) {
        return fallback;
    }
}

function setJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

// ==================== THREAT MAP DATABASE ====================
const threatDatabase = {
    countries: [
        { name: 'United States', code: 'US', flag: 'https://flagcdn.com/w80/us.png', threatLevel: 'high', attacks: 1250, blocked: 1180, region: 'North America' },
        { name: 'United Kingdom', code: 'GB', flag: 'https://flagcdn.com/w80/gb.png', threatLevel: 'medium', attacks: 450, blocked: 430, region: 'Europe' },
        { name: 'Germany', code: 'DE', flag: 'https://flagcdn.com/w80/de.png', threatLevel: 'medium', attacks: 380, blocked: 360, region: 'Europe' },
        { name: 'France', code: 'FR', flag: 'https://flagcdn.com/w80/fr.png', threatLevel: 'low', attacks: 220, blocked: 215, region: 'Europe' },
        { name: 'China', code: 'CN', flag: 'https://flagcdn.com/w80/cn.png', threatLevel: 'high', attacks: 980, blocked: 920, region: 'Asia' },
        { name: 'Japan', code: 'JP', flag: 'https://flagcdn.com/w80/jp.png', threatLevel: 'low', attacks: 150, blocked: 148, region: 'Asia' },
        { name: 'India', code: 'IN', flag: 'https://flagcdn.com/w80/in.png', threatLevel: 'medium', attacks: 420, blocked: 395, region: 'Asia' },
        { name: 'Russia', code: 'RU', flag: 'https://flagcdn.com/w80/ru.png', threatLevel: 'high', attacks: 750, blocked: 700, region: 'Europe' },
        { name: 'Brazil', code: 'BR', flag: 'https://flagcdn.com/w80/br.png', threatLevel: 'medium', attacks: 310, blocked: 290, region: 'South America' },
        { name: 'Canada', code: 'CA', flag: 'https://flagcdn.com/w80/ca.png', threatLevel: 'low', attacks: 180, blocked: 175, region: 'North America' },
        { name: 'Australia', code: 'AU', flag: 'https://flagcdn.com/w80/au.png', threatLevel: 'low', attacks: 120, blocked: 118, region: 'Oceania' },
        { name: 'South Korea', code: 'KR', flag: 'https://flagcdn.com/w80/kr.png', threatLevel: 'medium', attacks: 280, blocked: 270, region: 'Asia' },
        { name: 'Italy', code: 'IT', flag: 'https://flagcdn.com/w80/it.png', threatLevel: 'low', attacks: 165, blocked: 160, region: 'Europe' },
        { name: 'Spain', code: 'ES', flag: 'https://flagcdn.com/w80/es.png', threatLevel: 'low', attacks: 140, blocked: 138, region: 'Europe' },
        { name: 'Netherlands', code: 'NL', flag: 'https://flagcdn.com/w80/nl.png', threatLevel: 'medium', attacks: 195, blocked: 185, region: 'Europe' },
        { name: 'Singapore', code: 'SG', flag: 'https://flagcdn.com/w80/sg.png', threatLevel: 'medium', attacks: 230, blocked: 220, region: 'Asia' },
        { name: 'Mexico', code: 'MX', flag: 'https://flagcdn.com/w80/mx.png', threatLevel: 'medium', attacks: 270, blocked: 255, region: 'North America' },
        { name: 'South Africa', code: 'ZA', flag: 'https://flagcdn.com/w80/za.png', threatLevel: 'low', attacks: 95, blocked: 92, region: 'Africa' },
        { name: 'Indonesia', code: 'ID', flag: 'https://flagcdn.com/w80/id.png', threatLevel: 'medium', attacks: 340, blocked: 315, region: 'Asia' },
        { name: 'Turkey', code: 'TR', flag: 'https://flagcdn.com/w80/tr.png', threatLevel: 'medium', attacks: 290, blocked: 275, region: 'Europe' },
        { name: 'United Arab Emirates', code: 'AE', flag: 'https://flagcdn.com/w80/ae.png', threatLevel: 'medium', attacks: 210, blocked: 202, region: 'Middle East' },
        { name: 'Israel', code: 'IL', flag: 'https://flagcdn.com/w80/il.png', threatLevel: 'medium', attacks: 180, blocked: 175, region: 'Middle East' },
        { name: 'Sweden', code: 'SE', flag: 'https://flagcdn.com/w80/se.png', threatLevel: 'low', attacks: 110, blocked: 108, region: 'Europe' },
        { name: 'Norway', code: 'NO', flag: 'https://flagcdn.com/w80/no.png', threatLevel: 'low', attacks: 95, blocked: 94, region: 'Europe' },
        { name: 'Nigeria', code: 'NG', flag: 'https://flagcdn.com/w80/ng.png', threatLevel: 'medium', attacks: 150, blocked: 140, region: 'Africa' }
    ],
    states: [
        { name: 'California', country: 'United States', flag: 'https://flagcdn.com/w80/us.png', threatLevel: 'high', attacks: 420, blocked: 395, region: 'Western US' },
        { name: 'Texas', country: 'United States', flag: 'https://flagcdn.com/w80/us.png', threatLevel: 'medium', attacks: 280, blocked: 265, region: 'Southern US' },
        { name: 'New York', country: 'United States', flag: 'https://flagcdn.com/w80/us.png', threatLevel: 'high', attacks: 350, blocked: 330, region: 'Northeastern US' },
        { name: 'Florida', country: 'United States', flag: 'https://flagcdn.com/w80/us.png', threatLevel: 'medium', attacks: 240, blocked: 225, region: 'Southeastern US' },
        { name: 'Washington', country: 'United States', flag: 'https://flagcdn.com/w80/us.png', threatLevel: 'medium', attacks: 210, blocked: 200, region: 'Northwestern US' },
        { name: 'Illinois', country: 'United States', flag: 'https://flagcdn.com/w80/us.png', threatLevel: 'medium', attacks: 190, blocked: 180, region: 'Midwestern US' },
        { name: 'Virginia', country: 'United States', flag: 'https://flagcdn.com/w80/us.png', threatLevel: 'high', attacks: 260, blocked: 245, region: 'Eastern US' },
        { name: 'Maharashtra', country: 'India', flag: 'https://flagcdn.com/w80/in.png', threatLevel: 'medium', attacks: 180, blocked: 170, region: 'India' },
        { name: 'Tamil Nadu', country: 'India', flag: 'https://flagcdn.com/w80/in.png', threatLevel: 'low', attacks: 95, blocked: 92, region: 'India' },
        { name: 'Karnataka', country: 'India', flag: 'https://flagcdn.com/w80/in.png', threatLevel: 'low', attacks: 85, blocked: 82, region: 'India' },
        { name: 'Delhi', country: 'India', flag: 'https://flagcdn.com/w80/in.png', threatLevel: 'medium', attacks: 160, blocked: 150, region: 'North India' },
        { name: 'Kerala', country: 'India', flag: 'https://flagcdn.com/w80/in.png', threatLevel: 'low', attacks: 75, blocked: 73, region: 'South India' },
        { name: 'Telangana', country: 'India', flag: 'https://flagcdn.com/w80/in.png', threatLevel: 'medium', attacks: 110, blocked: 105, region: 'South India' },
        { name: 'Gujarat', country: 'India', flag: 'https://flagcdn.com/w80/in.png', threatLevel: 'low', attacks: 80, blocked: 78, region: 'West India' },
        { name: 'Uttar Pradesh', country: 'India', flag: 'https://flagcdn.com/w80/in.png', threatLevel: 'medium', attacks: 130, blocked: 120, region: 'North India' },
        { name: 'West Bengal', country: 'India', flag: 'https://flagcdn.com/w80/in.png', threatLevel: 'medium', attacks: 115, blocked: 108, region: 'East India' },
        { name: 'England', country: 'United Kingdom', flag: 'https://flagcdn.com/w80/gb.png', threatLevel: 'medium', attacks: 310, blocked: 295, region: 'UK' },
        { name: 'Scotland', country: 'United Kingdom', flag: 'https://flagcdn.com/w80/gb.png', threatLevel: 'low', attacks: 140, blocked: 135, region: 'UK' },
        { name: 'Bavaria', country: 'Germany', flag: 'https://flagcdn.com/w80/de.png', threatLevel: 'low', attacks: 120, blocked: 118, region: 'Germany' },
        { name: 'Berlin', country: 'Germany', flag: 'https://flagcdn.com/w80/de.png', threatLevel: 'low', attacks: 95, blocked: 93, region: 'Germany' },
        { name: 'North Rhine-Westphalia', country: 'Germany', flag: 'https://flagcdn.com/w80/de.png', threatLevel: 'medium', attacks: 140, blocked: 135, region: 'Germany' },
        { name: 'Hesse', country: 'Germany', flag: 'https://flagcdn.com/w80/de.png', threatLevel: 'low', attacks: 95, blocked: 92, region: 'Germany' },
        { name: 'Tokyo', country: 'Japan', flag: 'https://flagcdn.com/w80/jp.png', threatLevel: 'low', attacks: 110, blocked: 108, region: 'Japan' },
        { name: 'Ontario', country: 'Canada', flag: 'https://flagcdn.com/w80/ca.png', threatLevel: 'low', attacks: 85, blocked: 83, region: 'Canada' },
        { name: 'British Columbia', country: 'Canada', flag: 'https://flagcdn.com/w80/ca.png', threatLevel: 'low', attacks: 70, blocked: 68, region: 'Canada' },
        { name: 'New South Wales', country: 'Australia', flag: 'https://flagcdn.com/w80/au.png', threatLevel: 'low', attacks: 75, blocked: 72, region: 'Australia' },
        { name: 'Victoria', country: 'Australia', flag: 'https://flagcdn.com/w80/au.png', threatLevel: 'low', attacks: 60, blocked: 59, region: 'Australia' }
    ],
    districts: [
        { name: 'Chennai', state: 'Tamil Nadu', country: 'India', flag: 'https://flagcdn.com/w80/in.png', threatLevel: 'low', attacks: 45, blocked: 44, region: 'South India' },
        { name: 'Mumbai', state: 'Maharashtra', country: 'India', flag: 'https://flagcdn.com/w80/in.png', threatLevel: 'medium', attacks: 120, blocked: 115, region: 'West India' },
        { name: 'Delhi', state: 'Delhi', country: 'India', flag: 'https://flagcdn.com/w80/in.png', threatLevel: 'medium', attacks: 95, blocked: 90, region: 'North India' },
        { name: 'Bangalore', state: 'Karnataka', country: 'India', flag: 'https://flagcdn.com/w80/in.png', threatLevel: 'low', attacks: 65, blocked: 63, region: 'South India' },
        { name: 'Kochi', state: 'Kerala', country: 'India', flag: 'https://flagcdn.com/w80/in.png', threatLevel: 'low', attacks: 35, blocked: 34, region: 'South India' },
        { name: 'Thiruvananthapuram', state: 'Kerala', country: 'India', flag: 'https://flagcdn.com/w80/in.png', threatLevel: 'low', attacks: 25, blocked: 24, region: 'South India' },
        { name: 'Hyderabad', state: 'Telangana', country: 'India', flag: 'https://flagcdn.com/w80/in.png', threatLevel: 'medium', attacks: 85, blocked: 80, region: 'South India' },
        { name: 'Ahmedabad', state: 'Gujarat', country: 'India', flag: 'https://flagcdn.com/w80/in.png', threatLevel: 'low', attacks: 40, blocked: 39, region: 'West India' },
        { name: 'Lucknow', state: 'Uttar Pradesh', country: 'India', flag: 'https://flagcdn.com/w80/in.png', threatLevel: 'medium', attacks: 70, blocked: 65, region: 'North India' },
        { name: 'Kolkata', state: 'West Bengal', country: 'India', flag: 'https://flagcdn.com/w80/in.png', threatLevel: 'medium', attacks: 75, blocked: 70, region: 'East India' },
        { name: 'Los Angeles', state: 'California', country: 'United States', flag: 'https://flagcdn.com/w80/us.png', threatLevel: 'high', attacks: 180, blocked: 165, region: 'Western US' },
        { name: 'San Francisco', state: 'California', country: 'United States', flag: 'https://flagcdn.com/w80/us.png', threatLevel: 'high', attacks: 150, blocked: 140, region: 'Western US' },
        { name: 'New York City', state: 'New York', country: 'United States', flag: 'https://flagcdn.com/w80/us.png', threatLevel: 'high', attacks: 200, blocked: 185, region: 'Northeastern US' },
        { name: 'Miami', state: 'Florida', country: 'United States', flag: 'https://flagcdn.com/w80/us.png', threatLevel: 'medium', attacks: 95, blocked: 90, region: 'Southeastern US' },
        { name: 'Seattle', state: 'Washington', country: 'United States', flag: 'https://flagcdn.com/w80/us.png', threatLevel: 'medium', attacks: 90, blocked: 85, region: 'Northwestern US' },
        { name: 'Chicago', state: 'Illinois', country: 'United States', flag: 'https://flagcdn.com/w80/us.png', threatLevel: 'medium', attacks: 110, blocked: 105, region: 'Midwestern US' },
        { name: 'Arlington', state: 'Virginia', country: 'United States', flag: 'https://flagcdn.com/w80/us.png', threatLevel: 'high', attacks: 120, blocked: 112, region: 'Eastern US' },
        { name: 'London', state: 'England', country: 'United Kingdom', flag: 'https://flagcdn.com/w80/gb.png', threatLevel: 'medium', attacks: 180, blocked: 170, region: 'UK' },
        { name: 'Manchester', state: 'England', country: 'United Kingdom', flag: 'https://flagcdn.com/w80/gb.png', threatLevel: 'medium', attacks: 95, blocked: 90, region: 'UK' },
        { name: 'Edinburgh', state: 'Scotland', country: 'United Kingdom', flag: 'https://flagcdn.com/w80/gb.png', threatLevel: 'low', attacks: 50, blocked: 49, region: 'UK' },
        { name: 'Berlin', state: 'Berlin', country: 'Germany', flag: 'https://flagcdn.com/w80/de.png', threatLevel: 'low', attacks: 85, blocked: 83, region: 'Germany' },
        { name: 'Munich', state: 'Bavaria', country: 'Germany', flag: 'https://flagcdn.com/w80/de.png', threatLevel: 'medium', attacks: 75, blocked: 72, region: 'Germany' },
        { name: 'Cologne', state: 'North Rhine-Westphalia', country: 'Germany', flag: 'https://flagcdn.com/w80/de.png', threatLevel: 'medium', attacks: 65, blocked: 63, region: 'Germany' },
        { name: 'Frankfurt', state: 'Hesse', country: 'Germany', flag: 'https://flagcdn.com/w80/de.png', threatLevel: 'low', attacks: 55, blocked: 54, region: 'Germany' },
        { name: 'Toronto', state: 'Ontario', country: 'Canada', flag: 'https://flagcdn.com/w80/ca.png', threatLevel: 'low', attacks: 60, blocked: 59, region: 'Canada' },
        { name: 'Vancouver', state: 'British Columbia', country: 'Canada', flag: 'https://flagcdn.com/w80/ca.png', threatLevel: 'low', attacks: 45, blocked: 44, region: 'Canada' },
        { name: 'Sydney', state: 'New South Wales', country: 'Australia', flag: 'https://flagcdn.com/w80/au.png', threatLevel: 'low', attacks: 40, blocked: 39, region: 'Australia' },
        { name: 'Melbourne', state: 'Victoria', country: 'Australia', flag: 'https://flagcdn.com/w80/au.png', threatLevel: 'low', attacks: 38, blocked: 37, region: 'Australia' },
        { name: 'Tokyo', state: 'Tokyo', country: 'Japan', flag: 'https://flagcdn.com/w80/jp.png', threatLevel: 'low', attacks: 65, blocked: 64, region: 'Japan' }
    ]
};
// ==================== THREAT MAP SEARCH ====================
let selectedItem = null;
let selectedItemType = null;

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
                displayDefaultThreatResults(type);
            }
        });

        searchType.addEventListener('change', function() {
            const query = searchInput.value.trim();
            if (query.length > 0) {
                performSearch(query, this.value);
            } else {
                displayDefaultThreatResults(this.value);
            }
        });

        // Show an initial list so "countries / states / districts" never look empty.
        displayDefaultThreatResults(searchType.value);
    }
}

function performSearch(query, type) {
    const resultsContainer = document.getElementById('searchResults');
    if (!resultsContainer) return;

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

function getDefaultThreatResults(type) {
    // Context-aware defaults: if a country/state is selected, scope down automatically.
    if (type === 'state') {
        if (selectedItemType === 'country' && selectedItem?.name) {
            const scoped = threatDatabase.states.filter(s => s.country === selectedItem.name);
            return scoped.length ? scoped : threatDatabase.states.slice();
        }
        if (selectedItemType === 'district' && selectedItem?.country) {
            const scoped = threatDatabase.states.filter(s => s.country === selectedItem.country);
            return scoped.length ? scoped : threatDatabase.states.slice();
        }
        if (selectedItemType === 'state' && selectedItem?.country) {
            const scoped = threatDatabase.states.filter(s => s.country === selectedItem.country);
            return scoped.length ? scoped : threatDatabase.states.slice();
        }
        return threatDatabase.states.slice();
    }

    if (type === 'district') {
        if (selectedItemType === 'state' && selectedItem?.name) {
            const scoped = threatDatabase.districts.filter(d => d.state === selectedItem.name);
            return scoped.length ? scoped : threatDatabase.districts.slice();
        }
        if (selectedItemType === 'country' && selectedItem?.name) {
            const scoped = threatDatabase.districts.filter(d => d.country === selectedItem.name);
            return scoped.length ? scoped : threatDatabase.districts.slice();
        }
        if (selectedItemType === 'district' && selectedItem?.state) {
            const scoped = threatDatabase.districts.filter(d => d.state === selectedItem.state);
            return scoped.length ? scoped : threatDatabase.districts.slice();
        }
        return threatDatabase.districts.slice();
    }

    // Country default.
    return threatDatabase.countries.slice();
}

function displayDefaultThreatResults(type) {
    const results = getDefaultThreatResults(type);
    displaySearchResults(results.slice(0, 24), type);
}

function displaySearchResults(results, type) {
    const resultsContainer = document.getElementById('searchResults');
    if (!resultsContainer) return;

    resultsContainer.innerHTML = '';

    if (results.length === 0) {
        resultsContainer.innerHTML = '<div class="no-results">No results found</div>';
        return;
    }

    results.forEach(item => {
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';
        resultItem.addEventListener('click', function(event) {
            selectItem(item, type, event);
        });

        const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
        let sub = '';
        if (type === 'country') sub = item.region || '';
        if (type === 'state') sub = item.country || '';
        if (type === 'district') sub = `${item.state || ''}${item.country ? `, ${item.country}` : ''}`.trim();

        resultItem.innerHTML = `
            <img src="${item.flag}" alt="${item.name} flag" class="country-flag" onerror="this.src='https://via.placeholder.com/40x28?text=Flag'">
            <div>
                <div class="result-name">${item.name}</div>
                <div class="result-type">${typeLabel}${sub ? ` | ${sub}` : ''}</div>
            </div>
        `;

        resultsContainer.appendChild(resultItem);
    });
}

function selectItem(item, type, event) {
    selectedItem = item;
    selectedItemType = type;

    const allResults = document.querySelectorAll('.search-result-item');
    allResults.forEach(r => r.classList.remove('selected'));

    if (event && event.currentTarget) {
        event.currentTarget.classList.add('selected');
    }

    showSelectedInfo(item, type);
}

function showSelectedInfo(item, type) {
    const selectedContainer = document.getElementById('selectedCountry');
    if (!selectedContainer) return;

    let locationInfo = '';
    if (type === 'state') {
        locationInfo = `
            <div class="detail-item">
                <div class="detail-label">Country</div>
                <div class="detail-value">${item.country}</div>
            </div>
        `;
    } else if (type === 'district') {
        locationInfo = `
            <div class="detail-item">
                <div class="detail-label">State</div>
                <div class="detail-value">${item.state}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Country</div>
                <div class="detail-value">${item.country}</div>
            </div>
        `;
    } else {
        locationInfo = `
            <div class="detail-item">
                <div class="detail-label">Region</div>
                <div class="detail-value">${item.region}</div>
            </div>
        `;
    }

    const threatClass = `threat-${item.threatLevel}`;

    selectedContainer.innerHTML = `
        <div class="selected-country-header">
            <img src="${item.flag}" alt="${item.name} flag" class="selected-flag" onerror="this.src='https://via.placeholder.com/60x40?text=Flag'">
            <div class="selected-country-name">${item.name}</div>
        </div>
        <div class="selected-country-details">
            <div class="detail-item">
                <div class="detail-label">Type</div>
                <div class="detail-value">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Threat Level</div>
                <div class="detail-value ${threatClass}">${item.threatLevel.toUpperCase()}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Total Attacks</div>
                <div class="detail-value">${item.attacks}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Blocked</div>
                <div class="detail-value">${item.blocked}</div>
            </div>
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
    const searchType = document.getElementById('searchType');
    const selectedContainer = document.getElementById('selectedCountry');

    if (searchInput) {
        searchInput.value = '';
    }

    if (searchType) {
        displayDefaultThreatResults(searchType.value);
    } else {
        clearSearchResults();
    }

    if (selectedContainer) {
        selectedContainer.classList.remove('active');
        selectedContainer.innerHTML = '';
    }

    selectedItem = null;
    selectedItemType = null;
}

function clearSearchResults() {
    const resultsContainer = document.getElementById('searchResults');
    if (resultsContainer) {
        resultsContainer.innerHTML = '';
    }
}

// ==================== SMOOTH SCROLLING ====================
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('.section-menu a');

    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            const targetId = this.getAttribute('href');
            if (!targetId || !targetId.startsWith('#')) return;

            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                event.preventDefault();
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// ==================== CARD INTERACTIONS ====================
function initCardInteractions() {
    const cards = document.querySelectorAll('.card');

    cards.forEach(card => {
        card.addEventListener('click', function(event) {
            if (event.target.closest('button, input, textarea, select, a, label')) {
                return;
            }
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
}

function initTiltMotion() {
    const tiltCards = document.querySelectorAll('.tilt-card');
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (event) => {
            const rect = card.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
            const y = ((event.clientY - rect.top) / rect.height - 0.5) * -2;
            card.style.setProperty('--tilt-x', `${y * 5}deg`);
            card.style.setProperty('--tilt-y', `${x * 5}deg`);
        });
        card.addEventListener('mouseleave', () => {
            card.style.setProperty('--tilt-x', '0deg');
            card.style.setProperty('--tilt-y', '0deg');
        });
    });
}

// ==================== ANIMATIONS ====================
function initAnimations() {
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-count'), 10) || 0;
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

function initEnhancedAnimations() {
    buildParticleNetwork();
    createEntranceObserver();
    initDroneFlight();
}

function buildParticleNetwork() {
    const container = document.getElementById('particles-container');
    if (!container || container.dataset.networkBuilt) return;

    container.dataset.networkBuilt = 'true';
    const total = 60;
    for (let i = 0; i < total; i++) {
        const node = document.createElement('span');
        node.className = 'particle-node';
        node.style.left = `${Math.random() * 100}%`;
        node.style.top = `${Math.random() * 100}%`;
        node.style.animationDelay = `${Math.random() * 8}s`;
        node.style.animationDuration = `${12 + Math.random() * 10}s`;
        container.appendChild(node);
    }

    for (let j = 0; j < 6; j++) {
        const cloud = document.createElement('div');
        cloud.className = 'cloud-float';
        cloud.style.width = `${120 + Math.random() * 120}px`;
        cloud.style.height = `${50 + Math.random() * 50}px`;
        cloud.style.top = `${Math.random() * 60}%`;
        cloud.style.animationDuration = `${18 + Math.random() * 12}s`;
        cloud.style.setProperty('--float-y', `${Math.random() * 40 - 20}px`);
        container.appendChild(cloud);
    }
}

function createEntranceObserver() {
    const targets = document.querySelectorAll('section, .card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
            }
        });
    }, { threshold: 0.15 });

    targets.forEach(el => {
        el.classList.add('entrance-animate');
        observer.observe(el);
    });
}

function initDroneFlight() {
    const drone = document.getElementById('drone');
    if (!drone) return;

    const moveDrone = () => {
        const x = Math.random() * 90;
        const y = Math.random() * 60;
        const rotate = Math.random() * 20 - 10;
        drone.style.transform = `translate(${x}%, ${y}%) rotate(${rotate}deg)`;
    };

    moveDrone();
    setInterval(moveDrone, 5000);
}
// ==================== DASHBOARD FUNCTIONS ====================
function runQuickScan() {
    alert('Quick scan initiated...\n\nScanning for threats...\n\n[OK] System check complete\n[OK] No malware detected\n[OK] All protections active');
}

function updateThreatStatus() {
    const counter = document.querySelector('.counter-number');
    if (counter) {
        counter.textContent = '0';
        setTimeout(() => {
            counter.textContent = Math.floor(Math.random() * 5).toString();
        }, 500);
    }
}

// ==================== TOOL FUNCTIONS ====================
function checkPassword() {
    const input = document.getElementById('passwordInput');
    const result = document.getElementById('passwordResult');
    if (!input || !result) return;

    const password = input.value;

    if (!password) {
        result.textContent = 'Please enter a password';
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
        result.textContent = 'Weak password - add more characters, numbers, and symbols';
        result.className = 'tool-result show weak';
    } else if (strength <= 4) {
        result.textContent = 'Medium strength - consider adding more complexity';
        result.className = 'tool-result show medium';
    } else {
        result.textContent = 'Strong password - looks good';
        result.className = 'tool-result show strong';
    }
}

function initRiskInputs() {
    const sliders = [
        { inputId: 'riskFactor1', valueId: 'riskFactor1Value' },
        { inputId: 'riskFactor2', valueId: 'riskFactor2Value' },
        { inputId: 'riskFactor3', valueId: 'riskFactor3Value' }
    ];

    sliders.forEach(({ inputId, valueId }) => {
        const input = document.getElementById(inputId);
        const label = document.getElementById(valueId);
        if (!input || !label) return;

        const updateLabel = () => {
            label.textContent = input.value;
        };

        input.addEventListener('input', updateLabel);
        updateLabel();
    });
}

function calculateRisk() {
    const f1 = parseInt(document.getElementById('riskFactor1')?.value || '50', 10);
    const f2 = parseInt(document.getElementById('riskFactor2')?.value || '50', 10);
    const detection = parseInt(document.getElementById('riskFactor3')?.value || '50', 10);

    const risk = Math.round((f1 + f2 + (100 - detection)) / 3);
    const result = document.getElementById('riskResult');
    if (!result) return;

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

    result.textContent = `Risk Score: ${risk}% - ${riskLevel}`;
    result.className = `tool-result show ${riskClass}`;
}

function optimizeStorage() {
    alert('Storage optimization complete!\n\n[OK] Fragmented files consolidated\n[OK] Cache cleared\n[OK] 15% more space available');
}

function generateHash() {
    const input = document.getElementById('hashGenInput');
    const result = document.getElementById('hashGenResult');
    if (!input || !result) return;

    const value = input.value;

    if (!value) {
        result.textContent = 'Please enter text to hash';
        result.className = 'tool-result show weak';
        return;
    }

    let hash = 0;
    for (let i = 0; i < value.length; i++) {
        const char = value.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }

    const hashHex = Math.abs(hash).toString(16).padStart(16, '0').repeat(4);
    result.textContent = `SHA-256: ${hashHex.substring(0, 64)}`;
    result.className = 'tool-result show strong';
}
// ==================== FILE UPLOAD ====================
function initUploadZone() {
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');

    if (!uploadZone || !fileInput) return;

    uploadZone.addEventListener('dragover', function(event) {
        event.preventDefault();
        uploadZone.classList.add('dragover');
    });

    uploadZone.addEventListener('dragleave', function() {
        uploadZone.classList.remove('dragover');
    });

    uploadZone.addEventListener('drop', function(event) {
        event.preventDefault();
        uploadZone.classList.remove('dragover');
        const file = event.dataTransfer.files[0];
        if (file) {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fileInput.files = dataTransfer.files;
            updateFileName(file);
        }
    });

    fileInput.addEventListener('change', function() {
        const file = fileInput.files[0];
        updateFileName(file);
    });
}

function updateFileName(file) {
    const fileName = document.getElementById('fileName');
    if (!fileName) return;

    if (!file) {
        fileName.textContent = '';
        return;
    }

    fileName.textContent = `${file.name} (${(file.size / 1024).toFixed(2)} KB)`;
}

async function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    const statusDiv = document.getElementById('uploadStatus');

    if (!fileInput || !statusDiv) return;

    if (!fileInput.files || fileInput.files.length === 0) {
        showStatus(statusDiv, 'Please select a file to upload', 'error');
        return;
    }

    const file = fileInput.files[0];
    const fileSize = (file.size / 1024).toFixed(2);

    // Prefer real backend upload when authenticated; fall back to demo/local mode.
    if (window.api && window.api.token) {
        showStatus(statusDiv, `Uploading ${file.name} (${fileSize} KB) to SecureChain...`, 'info');
        try {
            const result = await window.api.uploadFile(file);
            const hash = result?.file?.hash;
            showStatus(statusDiv, `Upload complete. Hash: ${hash || '(generated)'}`, 'success');
            if (hash) addRecentUpload(result?.file?.filename || file.name, hash);
            await loadMyFiles();
            return;
        } catch (error) {
            console.warn('[SecureChain] Backend upload failed, falling back to demo mode:', error);
        }
    }

    showStatus(statusDiv, `Uploading ${file.name} (${fileSize} KB) to blockchain (demo)...`, 'info');

    const mockHash = generateMockHash(file.name);

    setTimeout(() => {
        showStatus(statusDiv, `Upload complete (demo). Hash: ${mockHash}`, 'success');
        addRecentUpload(file.name, mockHash);
    }, 1500);
}

function addRecentUpload(fileName, hash) {
    const uploads = getJson(STORAGE_KEYS.uploads, []);
    uploads.unshift({ name: fileName, hash, time: new Date().toISOString() });
    setJson(STORAGE_KEYS.uploads, uploads.slice(0, 6));
    renderRecentUploads();
}

function renderRecentUploads() {
    const list = document.getElementById('fileList');
    if (!list) return;

    const uploads = getJson(STORAGE_KEYS.uploads, []);
    if (!uploads.length) {
        list.innerHTML = '<li class="muted">No uploads yet.</li>';
        return;
    }

    list.innerHTML = '';
    uploads.forEach(item => {
        const li = document.createElement('li');
        const time = new Date(item.time).toLocaleTimeString();
        li.innerHTML = `<i class="fas fa-file"></i> ${item.name} <span class="verified"><i class="fas fa-check"></i> ${time}</span>`;
        list.appendChild(li);
    });
}

function showStatus(element, message, type) {
    if (!element) return;
    element.textContent = message;
    element.className = `status ${type}`;
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
async function verifyHash() {
    const hashInput = document.getElementById('hashInput');
    const statusDiv = document.getElementById('verifyStatus');
    if (!hashInput || !statusDiv) return;

    const hash = hashInput.value.trim();

    if (!hash) {
        showStatus(statusDiv, 'Please enter a hash to verify', 'error');
        return;
    }

    showStatus(statusDiv, 'Verifying hash on blockchain...', 'info');

    // Prefer backend verification (real uploads). Fallback keeps demo mode usable.
    if (window.api && window.api.token) {
        try {
            const result = await window.api.verifyHash(hash);
            if (result?.verified) {
                showStatus(statusDiv, result.message || 'Hash verified. Document is authentic.', 'success');
            } else {
                showStatus(statusDiv, result.message || 'Hash not found in blockchain', 'error');
            }
            return;
        } catch (error) {
            console.warn('[SecureChain] Backend verify failed, falling back to demo mode:', error);
        }
    }

    setTimeout(() => {
        if (hash.length === 64) {
            showStatus(statusDiv, 'Hash verified (demo). Document is authentic.', 'success');
        } else {
            showStatus(statusDiv, 'Invalid hash format', 'error');
        }
    }, 900);
}

// ==================== SCANNER ====================
function startScan() {
    const resultsDiv = document.getElementById('scanResults');
    if (!resultsDiv) return;

    resultsDiv.innerHTML = `
        <div class="scan-progress">
            <div class="progress-bar">
                <div class="progress-fill" style="width: 65%"></div>
            </div>
            <p>Scanning network...</p>
        </div>
    `;

    setTimeout(() => {
        resultsDiv.innerHTML = `
            <div class="scan-result">
                <p>[OK] Scan complete - No threats found</p>
                <p>Scanned: 256 ports | 12 services</p>
            </div>
        `;
    }, 3000);
}

// ==================== SECURITY OPERATION REQUEST ====================
function initOperationForm() {
    const duration = document.getElementById('operationDuration');
    const nodes = document.getElementById('nodeCountInput');
    const target = document.getElementById('targetSystem');
    const securityLevel = document.getElementById('securityLevel');
    const threatChecks = document.querySelectorAll('#threatChipGroup input[type="checkbox"]');

    if (!duration || !nodes || !target || !securityLevel) return;

    const onUpdate = () => updateOperationPreview(false);
    duration.addEventListener('input', onUpdate);
    nodes.addEventListener('input', onUpdate);
    target.addEventListener('input', onUpdate);
    securityLevel.addEventListener('change', onUpdate);
    threatChecks.forEach(box => box.addEventListener('change', onUpdate));

    updateOperationPreview(false);
}

function updateOperationPreview(finalize = false) {
    const duration = parseInt(document.getElementById('operationDuration')?.value || '1', 10);
    const nodes = parseInt(document.getElementById('nodeCountInput')?.value || '1', 10);
    const target = document.getElementById('targetSystem')?.value.trim() || 'target system';
    const securityLevel = document.getElementById('securityLevel')?.value || 'Basic';
    const durationLabel = document.getElementById('durationLabel');
    const nodesLabel = document.getElementById('nodesLabel');

    if (durationLabel) durationLabel.textContent = `${duration} days`;
    if (nodesLabel) nodesLabel.textContent = `${nodes} nodes`;

    const selectedThreats = Array.from(document.querySelectorAll('#threatChipGroup input:checked')).map(t => t.value);
    const threatChips = document.getElementById('operationThreatChips');
    if (threatChips) {
        threatChips.innerHTML = '';
        if (selectedThreats.length) {
            selectedThreats.forEach(threat => {
                const span = document.createElement('span');
                span.className = 'chip filled';
                span.textContent = threat;
                threatChips.appendChild(span);
            });
        }
    }

    const summary = document.getElementById('operationSummary');
    if (summary) {
        summary.textContent = `Monitoring ${nodes} nodes on ${target} for ${duration} days with ${securityLevel} controls.`;
    }

    const levelBadge = document.getElementById('operationLevelBadge');
    if (levelBadge) {
        levelBadge.textContent = `Level: ${securityLevel}`;
        levelBadge.className = `badge accent level-${securityLevel.toLowerCase().replace(/\s+/g, '-')}`;
    }

    const timeline = document.getElementById('operationTimeline');
    if (timeline) {
        const midDay = Math.max(2, Math.ceil(duration / 2));
        const lastDay = Math.max(3, duration);
        timeline.innerHTML = `
            <div class="timeline-item"><span>Day 1</span><p>Kickoff, MFA validation, asset discovery on ${target}.</p></div>
            <div class="timeline-item"><span>Day ${midDay}</span><p>Hunt for ${selectedThreats.slice(0,3).join(', ') || 'priority threats'} across ${nodes} nodes.</p></div>
            <div class="timeline-item"><span>Day ${lastDay}</span><p>Hardening + tabletop + final report delivery.</p></div>
        `;
    }

    const progress = document.getElementById('operationProgress');
    const fieldsComplete = [
        target.length > 3,
        duration >= 1 && duration <= 30,
        nodes >= 1 && nodes <= 20,
        selectedThreats.length > 0
    ].filter(Boolean).length;
    const completeness = Math.round((fieldsComplete / 4) * 100);
    if (progress) {
        progress.style.width = `${completeness}%`;
    }

    if (finalize) {
        const status = document.getElementById('operationStatus');
        if (completeness === 100) {
            showStatus(status, `Request locked in for ${target}. SLA: ${duration} days, nodes: ${nodes}, level: ${securityLevel}.`, 'success');
        } else {
            showStatus(status, 'Please complete all required fields.', 'error');
        }
    }
}

function submitOperationRequest() {
    updateOperationPreview(true);
}

// ==================== AI DEFENSE PLAN ====================
const defenseScenarios = {
    government: {
        title: 'Government Data Center',
        summary: 'Isolate classified workloads, strict auditing, zero-trust network microsegments.',
        controls: ['Zero trust', 'Immutable logs', 'HSM-backed keys'],
        plan: [
            { day: 1, focus: 'Baseline & segmentation', detection: 'NetFlow + IDS signatures', response: 'Auto-quarantine unknown subnets' },
            { day: 2, focus: 'Vulnerability sweep', detection: 'CVE correlation + SBOM diff', response: 'Patch + config lockdown' },
            { day: 3, focus: 'Privilege review', detection: 'UEBA anomalies', response: 'Step-up auth + disable risky accounts' },
            { day: 4, focus: 'Data exfil watch', detection: 'DLP regex + TLS fingerprinting', response: 'Block/alert, start chain-of-custody' },
            { day: 5, focus: 'Resilience drills', detection: 'Chaos test on HA pairs', response: 'Failover validation + evidence export' }
        ],
        schedule: [
            { window: '00:00-06:00', action: 'Nightly hunt + log integrity check' },
            { window: '06:00-12:00', action: 'Patch/upgrade maintenance' },
            { window: '12:00-18:00', action: 'Live traffic anomaly detection' },
            { window: '18:00-24:00', action: 'Forensics snapshot + report' }
        ]
    },
    military: {
        title: 'Military Communication Network',
        summary: 'Air-gapped enclaves, anti-jam telemetry, mission-grade availability.',
        controls: ['Cross-domain guards', 'Signal jamming detection', 'Tamper alarms'],
        plan: [
            { day: 1, focus: 'Signal hygiene', detection: 'RF spectrum scan', response: 'Auto hop + shield critical nodes' },
            { day: 2, focus: 'Endpoint integrity', detection: 'Secure boot attestations', response: 'Re-image drifted nodes' },
            { day: 3, focus: 'Comms monitoring', detection: 'Packet timing + entropy checks', response: 'Throttle suspect links' },
            { day: 4, focus: 'Insider watch', detection: 'Privilege escalation watchlist', response: 'Just-in-time access revoke' },
            { day: 5, focus: 'Continuity test', detection: 'Failover to backup relays', response: 'Drill + certify readiness' }
        ],
        schedule: [
            { window: '00:00-06:00', action: 'Telemetry integrity + SIGINT sweep' },
            { window: '06:00-12:00', action: 'Key rotation & COMSEC audit' },
            { window: '12:00-18:00', action: 'Live blue-team scrimmage' },
            { window: '18:00-24:00', action: 'After-action review + AI retrain' }
        ]
    },
    banking: {
        title: 'Banking Infrastructure',
        summary: 'Payment rail protection, fraud analytics, PCI-DSS hardening.',
        controls: ['Tokenization', 'Behavioral fraud ML', 'SOAR runbooks'],
        plan: [
            { day: 1, focus: 'Card/ACH monitoring', detection: 'Velocity + geo anomalies', response: 'SOAR blocks + MFA challenges' },
            { day: 2, focus: 'API shield', detection: 'Schema diff + abuse rules', response: 'WAF rule push' },
            { day: 3, focus: 'Core patch', detection: 'Known CVE scan', response: 'Change window + rollback plan' },
            { day: 4, focus: 'Fraud hunt', detection: 'Behavioral graph outliers', response: 'Case open + SAR draft' },
            { day: 5, focus: 'BCP tabletop', detection: 'DR failover test', response: 'Gap remediation backlog' }
        ],
        schedule: [
            { window: '00:00-06:00', action: 'Reconciliation + ledger integrity' },
            { window: '06:00-12:00', action: 'API gateway monitoring' },
            { window: '12:00-18:00', action: 'Fraud ML tuning + feedback' },
            { window: '18:00-24:00', action: 'SOAR playbook validation' }
        ]
    },
    smartcity: {
        title: 'Smart City IoT Network',
        summary: 'IoT sensor fleets, OT segmentation, safety-first response.',
        controls: ['Secure OTA', 'Network microzones', 'Signed firmware'],
        plan: [
            { day: 1, focus: 'Asset census', detection: 'Passive discovery', response: 'Block rogue MACs' },
            { day: 2, focus: 'Firmware trust', detection: 'Signature verification', response: 'OTA patch wave 1' },
            { day: 3, focus: 'Telemetry sanity', detection: 'Noise/outlier sensors', response: 'Quarantine + recalibrate' },
            { day: 4, focus: 'Edge security', detection: 'Gateway IDS', response: 'Rate-limit floods' },
            { day: 5, focus: 'Resilience drill', detection: 'Failover to redundant mesh', response: 'Citizen alert test' }
        ],
        schedule: [
            { window: '00:00-06:00', action: 'Quiet-hours patch pushes' },
            { window: '06:00-12:00', action: 'Sensor health & calibration' },
            { window: '12:00-18:00', action: 'Anomaly clustering + AI triage' },
            { window: '18:00-24:00', action: 'Edge log shipping + alerts' }
        ]
    },
    cloud: {
        title: 'Cloud Infrastructure',
        summary: 'Multi-account guardrails, identity-first security, cloud-native detection.',
        controls: ['CSPM', 'CIEM', 'Runtime policies'],
        plan: [
            { day: 1, focus: 'Account hygiene', detection: 'Unused keys + wildcards', response: 'Key revoke + SCP tighten' },
            { day: 2, focus: 'Runtime shield', detection: 'Container drift', response: 'Admission controller block' },
            { day: 3, focus: 'Data security', detection: 'Open buckets & misconfigs', response: 'Auto-remediate + tag owners' },
            { day: 4, focus: 'Pipeline integrity', detection: 'Supply-chain checks', response: 'Sigstore attestations' },
            { day: 5, focus: 'Chaos validation', detection: 'Fault injection', response: 'SLO report + backlog' }
        ],
        schedule: [
            { window: '00:00-06:00', action: 'CSPM drift alerts triage' },
            { window: '06:00-12:00', action: 'CIEM rightsizing' },
            { window: '12:00-18:00', action: 'Runtime sensor tuning' },
            { window: '18:00-24:00', action: 'Backup & retention checks' }
        ]
    },
    cni: {
        title: 'Critical National Infrastructure',
        summary: 'OT/IT convergence, safety controls, 24x7 monitoring and rapid containment.',
        controls: ['Segmentation gateways', 'Protocol allowlists', 'Out-of-band backups'],
        plan: [
            { day: 1, focus: 'Safety baselines', detection: 'Process variable drift', response: 'Trip to safe state' },
            { day: 2, focus: 'Perimeter watch', detection: 'OT IDS signatures', response: 'Block & isolate conduits' },
            { day: 3, focus: 'Change control', detection: 'Unauthorized firmware', response: 'Rollback + incident ticket' },
            { day: 4, focus: 'Tabletop w/ ops', detection: 'Runbook validation', response: 'Crew training refresh' },
            { day: 5, focus: 'Recovery drill', detection: 'Backup restore test', response: 'MTTR measurement' }
        ],
        schedule: [
            { window: '00:00-06:00', action: 'OT network quiet-watch' },
            { window: '06:00-12:00', action: 'Safety system checks' },
            { window: '12:00-18:00', action: 'Operational change window' },
            { window: '18:00-24:00', action: 'Compliance & evidence packaging' }
        ]
    }
};

let selectedScenario = 'government';

function initDefensePlan() {
    const chips = document.querySelectorAll('#scenarioChips .chip');
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            const key = chip.dataset.scenario;
            selectScenario(key);
        });
    });

    selectScenario(selectedScenario);
    generateDefensePlan();
}

function selectScenario(key) {
    if (!defenseScenarios[key]) return;
    selectedScenario = key;

    document.querySelectorAll('#scenarioChips .chip').forEach(chip => {
        chip.classList.toggle('active', chip.dataset.scenario === key);
    });
}

function generateDefensePlan() {
    const scenario = defenseScenarios[selectedScenario] || defenseScenarios.government;
    const strategyText = document.getElementById('strategyText');
    if (strategyText) {
        strategyText.textContent = `${scenario.title}: ${scenario.summary}`;
    }

    const tags = document.getElementById('strategyTags');
    if (tags) {
        tags.innerHTML = '';
        scenario.controls.forEach(control => {
            const span = document.createElement('span');
            span.className = 'chip filled';
            span.textContent = control;
            tags.appendChild(span);
        });
    }

    renderPlanTimeline(scenario.plan);
    renderPlanSchedule(scenario.schedule);
}

function renderPlanTimeline(plan) {
    const timeline = document.getElementById('planTimeline');
    if (!timeline) return;
    timeline.innerHTML = '';
    plan.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `<span>Day ${item.day} – ${item.focus}</span><p>Detection: ${item.detection}</p><p>Response: ${item.response}</p>`;
        timeline.appendChild(li);
    });
}

function renderPlanSchedule(schedule) {
    const grid = document.getElementById('planSchedule');
    if (!grid) return;
    grid.innerHTML = '';
    schedule.forEach(slot => {
        const div = document.createElement('div');
        div.className = 'schedule-item';
        div.innerHTML = `<strong>${slot.window}</strong><p>${slot.action}</p>`;
        grid.appendChild(div);
    });
}

// ==================== CYBER RISK ESTIMATOR ====================
function initEstimatorInputs() {
    const map = [
        { id: 'infraScore', label: 'infraLabel', suffix: '' },
        { id: 'probScore', label: 'probLabel', suffix: '%' },
        { id: 'maturityScore', label: 'maturityLabel', suffix: '' }
    ];
    map.forEach(item => {
        const input = document.getElementById(item.id);
        const label = document.getElementById(item.label);
        if (input && label) {
            const update = () => label.textContent = `${input.value}${item.suffix}`;
            input.addEventListener('input', update);
            update();
        }
    });
}

function calculateEstimator() {
    const infra = parseInt(document.getElementById('infraScore')?.value || '0', 10);
    const prob = parseInt(document.getElementById('probScore')?.value || '0', 10);
    const maturity = parseInt(document.getElementById('maturityScore')?.value || '0', 10);
    const nodes = parseInt(document.getElementById('estimatorNodes')?.value || '0', 10);
    const costPerNode = parseFloat(document.getElementById('costPerNode')?.value || '0');

    const riskScore = Math.min(100, Math.round((infra * 0.4) + (prob * 0.4) + ((100 - maturity) * 0.2)));

    let level = 'Low Risk';
    let riskClass = 'strong';
    if (riskScore >= 70) {
        level = 'Critical Risk';
        riskClass = 'weak';
    } else if (riskScore >= 40) {
        level = 'Moderate Risk';
        riskClass = 'medium';
    }

    const baseCost = nodes * costPerNode;
    const defenseCost = Math.round(baseCost * (1 + riskScore / 120));
    const perNode = nodes ? Math.round(defenseCost / nodes) : 0;

    const badge = document.getElementById('riskBadge');
    if (badge) {
        badge.textContent = level;
        badge.className = `risk-badge ${riskClass}`;
    }

    const scoreEl = document.getElementById('riskScoreValue');
    if (scoreEl) {
        scoreEl.textContent = `${riskScore}%`;
    }

    const costBreakdown = document.getElementById('costBreakdown');
    if (costBreakdown) {
        costBreakdown.innerHTML = `
            <p>Infrastructure risk: ${infra}%</p>
            <p>Threat probability: ${prob}%</p>
            <p>Defense maturity gap: ${100 - maturity}%</p>
            <p>Total defense cost: $${defenseCost.toLocaleString()}</p>
            <p>Per-node cost: $${perNode.toLocaleString()}</p>
        `;
    }

    const allocation = document.getElementById('resourceAllocation');
    if (allocation) {
        const detect = Math.min(45, 25 + Math.round(riskScore / 3));
        const response = Math.min(30, 15 + Math.round(riskScore / 4));
        const hardening = Math.max(15, 25 - Math.round(maturity / 5));
        const training = 100 - (detect + response + hardening);
        allocation.innerHTML = `
            <div class="alloc-row"><span>Automated detection</span><span>${detect}%</span></div>
            <div class="alloc-row"><span>Response & forensics</span><span>${response}%</span></div>
            <div class="alloc-row"><span>Hardening</span><span>${hardening}%</span></div>
            <div class="alloc-row"><span>Awareness & drills</span><span>${training}%</span></div>
        `;
    }
}

// ==================== ENCRYPTION STRENGTH ANALYZER ====================
const algorithmMatrix = {
    'AES': { strength: 'Strong', detail: 'Symmetric block cipher (AES-256-GCM recommended). Fast for storage and network encryption.', score: 85 },
    'RSA': { strength: 'Strong', detail: 'Asymmetric; use 3072/4096-bit keys. Great for key exchange, signatures.', score: 72 },
    'SHA-256': { strength: 'Strong', detail: 'Secure hash used in blockchain, integrity checks, signed URLs.', score: 78 },
    'SHA-512': { strength: 'Very Strong', detail: 'Longer hash for long-term integrity; slower but resilient.', score: 92 },
    'ECC': { strength: 'Very Strong', detail: 'Modern asymmetric crypto; smaller keys, fast handshakes (P-256/384).', score: 88 },
    'Blockchain Hashing': { strength: 'Strong', detail: 'Merkle tree hashing with proof-of-work/authority. Immutable audit trail.', score: 80 }
};

function initCryptoAnalyzer() {
    const select = document.getElementById('algorithmSelect');
    if (select) {
        select.addEventListener('change', () => updateAlgorithmDetails(select.value));
        updateAlgorithmDetails(select.value);
    }

    document.querySelectorAll('.crypto-card').forEach(card => {
        card.addEventListener('click', () => {
            const algo = card.dataset.algo;
            if (algo) {
                const selectEl = document.getElementById('algorithmSelect');
                if (selectEl) selectEl.value = algo;
                updateAlgorithmDetails(algo);
            }
        });
    });
}

function analyzeHashStrength() {
    const input = document.getElementById('hashStrengthInput');
    const result = document.getElementById('hashStrengthResult');
    if (!input || !result) return;

    const hash = input.value.trim();
    if (!hash) {
        showStatus(result, 'Enter a hash to analyze.', 'error');
        return;
    }

    let algo = 'Unknown';
    let strength = 'Weak or custom';
    if (hash.length === 64) {
        algo = 'SHA-256';
        strength = 'Strong';
    } else if (hash.length === 128) {
        algo = 'SHA-512';
        strength = 'Very Strong';
    } else if (hash.length === 40) {
        algo = 'SHA-1';
        strength = 'Deprecated';
    } else if (hash.length === 32) {
        algo = 'MD5';
        strength = 'Broken';
    }

    showStatus(result, `${algo} detected. Strength: ${strength}.`, strength === 'Strong' || strength === 'Very Strong' ? 'success' : 'warning');
}

function updateAlgorithmDetails(algo) {
    const details = document.getElementById('algorithmDetails');
    const meta = algorithmMatrix[algo];
    if (!details || !meta) return;

    details.innerHTML = `
        <p>${meta.detail}</p>
        <div class="strength-meter large"><span style="width:${meta.score}%"></span></div>
        <p class="small">Relative score: ${meta.score}/100 • Strength: ${meta.strength}</p>
    `;
}
// ==================== CHAT ====================
function sendMessage() {
    const input = document.getElementById('chatInput');
    const messages = document.getElementById('chatMessages');
    if (!input || !messages) return;

    const message = input.value.trim();

    if (!message) return;

    const userMsg = document.createElement('div');
    userMsg.className = 'message user';
    userMsg.innerHTML = `<div class="message-content"><p>${message}</p></div>`;
    messages.appendChild(userMsg);

    input.value = '';

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
    if (!input) return;
    input.value = question;
    sendMessage();
}

// ==================== VAULT ====================
function accessVault() {
    alert('Evidence Vault\n\nBlockchain-based evidence storage\n\nItems: 1,247\nNodes: 48\nEncryption: 256-bit\n\nAccess granted');
}

// ==================== REPORTS ====================
async function generateReport(type) {
    const titleMap = {
        audit: 'Audit Report',
        threat: 'Threat Analysis',
        performance: 'Performance',
        compliance: 'Compliance',
        files: 'Files Report'
    };

    const title = titleMap[type] || 'Report';

    // Prefer backend-generated reports when authenticated.
    if (window.api && window.api.token && typeof window.api.generateReport === 'function') {
        try {
            const result = await window.api.generateReport(type, '24h', 'json');
            if (result?.success) {
                const data = result.data || {};
                const lines = Object.entries(data).map(([k, v]) => {
                    const val = Array.isArray(v) ? v.join(', ') : String(v);
                    return `${k}: ${val}`;
                });
                const meta = `timeframe: ${result.timeframe || '24h'}\ngeneratedAt: ${result.generatedAt || ''}`.trim();
                alert(`${title}\n\n${meta}\n\n${lines.join('\n') || 'No data available.'}`);
                return;
            }
        } catch (error) {
            console.warn('[SecureChain] Backend report failed, using demo report:', error);
        }
    }

    // Demo fallback.
    let content = 'No data available.';
    if (type === 'audit') {
        content = 'All systems operational\nNo unauthorized access\nFile integrity verified\nStatus: PASSED';
    } else if (type === 'threat') {
        content = 'Active threats: 0\nBlocked: 12\nRisk level: LOW';
    } else if (type === 'performance') {
        content = 'Uptime: 99.99%\nResponse: 45ms\nThroughput: 1,240 TPS';
    } else if (type === 'compliance') {
        content = 'GDPR: Compliant\nISO 27001: Verified\nSOC 2: Active';
    }

    alert(`${title}\n\n${content}`);
}

// ==================== VOICE ASSISTANT ====================
let recognition = null;
let listening = false;

function initVoiceAssistant() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const status = document.getElementById('voiceStatus');

    if (!SpeechRecognition) {
        if (status) status.textContent = 'Voice API not supported in this browser.';
        return;
    }

    recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const transcriptBox = document.getElementById('voiceTranscript');
        if (transcriptBox) {
            transcriptBox.value = transcript;
        }
        handleVoiceCommand(transcript);
    };

    recognition.onend = () => {
        if (listening) {
            recognition.start();
        } else {
            toggleListeningIndicator(false);
        }
    };
}

function startVoice() {
    if (!recognition) {
        initVoiceAssistant();
    }
    if (!recognition) return;
    listening = true;
    recognition.start();
    setVoiceStatus('Listening...');
    toggleListeningIndicator(true);
}

function stopVoice() {
    listening = false;
    recognition?.stop();
    setVoiceStatus('Idle – stopped listening.');
    toggleListeningIndicator(false);
}

function handleVoiceCommand(transcript) {
    const text = (transcript || '').toLowerCase();
    let response = 'Command received.';

    if (text.includes('scan')) {
        runQuickScan();
        response = 'Running quick scan.';
    } else if (text.includes('upload')) {
        response = 'Upload workflow ready. Use the upload card to pick a file.';
    } else if (text.includes('verify')) {
        response = 'Ready to verify hash. Paste it in the verification panel.';
    } else if (text.includes('threat map')) {
        document.querySelector('#map')?.scrollIntoView({ behavior: 'smooth' });
        response = 'Displaying global threat map.';
    } else if (text.includes('audit report')) {
        generateReport('audit');
        response = 'Audit report generated.';
    } else if (text.includes('ddos')) {
        startSimulation('ddos');
        response = 'Starting DDoS simulation.';
    } else if (text.includes('system health')) {
        response = 'System health nominal. Uptime 99.99%.';
    } else if (text.includes('attack analytics')) {
        response = 'Opening attack analytics stream.';
    } else if (text.includes('defense')) {
        generateDefensePlan();
        response = 'Defense plan refreshed.';
    }

    setVoiceStatus(response);
    logVoiceAction(transcript, response);
    speak(response);
}

function setVoiceStatus(message) {
    const status = document.getElementById('voiceStatus');
    if (status) status.textContent = message;
    const responseBox = document.getElementById('voiceResponse');
    if (responseBox) responseBox.textContent = message;
}

function logVoiceAction(command, action) {
    const log = document.getElementById('voiceLog');
    if (!log) return;
    const row = document.createElement('div');
    row.className = 'voice-log-row';
    const time = new Date().toLocaleTimeString();
    row.innerHTML = `<span>${time}</span><p>"${command}" → ${action}</p>`;
    log.prepend(row);
    while (log.children.length > 6) {
        log.removeChild(log.lastChild);
    }
}

function speak(text) {
    if (!('speechSynthesis' in window)) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
}

function toggleListeningIndicator(active) {
    const indicator = document.getElementById('listeningIndicator');
    if (!indicator) return;
    indicator.classList.toggle('listening', active);
}

// ==================== SIMULATION CENTER ====================
let simulationInterval = null;

function initSimulationCenter() {
    const status = document.getElementById('simulationStatus');
    if (status) {
        status.textContent = 'Ready for a simulation run.';
    }
}

function startSimulation(forceType) {
    const select = document.getElementById('simulationType');
    const durationInput = document.getElementById('simulationDuration');
    const progress = document.getElementById('simulationProgress');
    const status = document.getElementById('simulationStatus');
    const visualization = document.getElementById('attackVisualization');

    const type = forceType || select?.value || 'ddos';
    if (select) select.value = type;
    const duration = parseInt(durationInput?.value || '15', 10);

    if (simulationInterval) {
        clearInterval(simulationInterval);
    }
    let elapsed = 0;
    if (status) showStatus(status, `Simulating ${type.toUpperCase()} for ${duration} seconds...`, 'info');
    if (visualization) visualization.classList.add('active');

    simulationInterval = setInterval(() => {
        elapsed += 1;
        const pct = Math.min(100, Math.round((elapsed / duration) * 100));
        if (progress) progress.style.width = `${pct}%`;

        if (pct >= 100) {
            clearInterval(simulationInterval);
            simulationInterval = null;
            if (status) showStatus(status, `${type.toUpperCase()} simulation complete. Incident log ready.`, 'success');
            if (visualization) visualization.classList.remove('active');
        }
    }, 1000);
}

// ==================== AUDIT LOG ====================
function generateAuditLog() {
    const output = document.getElementById('auditLogOutput');
    if (!output) return;
    const now = new Date().toLocaleString();
    const entry = [
        `Timestamp: ${now}`,
        'Action: Automated runbook executed',
        'Detections: No critical hits, 2 low anomalies',
        'Response: Network microsegment tightened, WAF rule deployed',
        'Evidence: Hash chain updated, log archived'
    ].join(' | ');
    output.textContent = entry;
}

// ==================== CONTACT & NEWSLETTER ====================
function submitIncident() {
    const name = document.getElementById('contactName')?.value.trim();
    const email = document.getElementById('contactEmail')?.value.trim();
    const severity = document.getElementById('incidentSeverity')?.value;
    const type = document.getElementById('incidentType')?.value;
    const details = document.getElementById('incidentDetails')?.value.trim();
    const status = document.getElementById('contactStatus');

    if (!name || !email || !details) {
        showStatus(status, 'Please provide name, email, and details.', 'error');
        return;
    }

    showStatus(status, `Incident recorded (${severity} - ${type}). Analyst ${name} will be notified at ${email}.`, 'success');
}

function subscribeNewsletter() {
    const email = document.getElementById('newsletterEmail')?.value.trim();
    const status = document.getElementById('newsletterStatus');
    if (!email) {
        showStatus(status, 'Enter an email to subscribe.', 'error');
        return;
    }
    showStatus(status, `Subscribed ${email} to security alerts newsletter.`, 'success');
}

// ==================== COMMAND PALETTE ====================
let cmdkCommands = [];
let cmdkFiltered = [];
let cmdkActiveIndex = 0;
let cmdkOpen = false;

function initCommandPalette() {
    const root = document.getElementById('cmdk');
    const input = document.getElementById('cmdkInput');
    const results = document.getElementById('cmdkResults');
    if (!root || !input || !results) return;

    cmdkCommands = buildCmdkCommands();
    cmdkFiltered = cmdkCommands.slice();

    root.addEventListener('click', (event) => {
        if (event.target.closest('[data-cmdk-close]')) {
            closeCommandPalette();
            return;
        }
        const item = event.target.closest('.cmdk-item');
        if (item) {
            const index = parseInt(item.getAttribute('data-index') || '0', 10);
            runCmdkIndex(index);
        }
    });

    input.addEventListener('input', () => renderCmdk());
    input.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            event.preventDefault();
            closeCommandPalette();
            return;
        }
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setCmdkActive(cmdkActiveIndex + 1);
            return;
        }
        if (event.key === 'ArrowUp') {
            event.preventDefault();
            setCmdkActive(cmdkActiveIndex - 1);
            return;
        }
        if (event.key === 'Enter') {
            event.preventDefault();
            runCmdkIndex(cmdkActiveIndex);
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && cmdkOpen) {
            closeCommandPalette();
        }
    });

    renderCmdk();
}

function buildCmdkCommands() {
    const commands = [];

    const add = (label, hint, keywords, run) => {
        commands.push({ label, hint, keywords: (keywords || '').toLowerCase(), run });
    };

    // Quick actions
    add('Run Quick Scan', 'Action', 'scan quick', () => runQuickScan());
    add('Toggle Theme', 'UI', 'theme dark light', () => toggleTheme());
    add('Generate Defense Plan', 'AI', 'defense plan strategy', () => {
        document.getElementById('defense')?.scrollIntoView({ behavior: 'smooth' });
        generateDefensePlan();
    });
    add('Start Voice Assistant', 'Voice', 'voice listen start', () => {
        document.getElementById('voice')?.scrollIntoView({ behavior: 'smooth' });
        startVoice();
    });
    add('Start DDoS Simulation', 'Simulation', 'ddos simulate', () => {
        document.getElementById('simulation')?.scrollIntoView({ behavior: 'smooth' });
        startSimulation('ddos');
    });

    // Section jumps (from sidebar labels)
    document.querySelectorAll('#sidebar a[href^="#"]').forEach(link => {
        const href = link.getAttribute('href') || '';
        const id = href.startsWith('#') ? href.slice(1) : '';
        if (!id) return;

        const label = link.textContent.replace(/\s+/g, ' ').trim();
        const hint = 'Navigate';
        add(`Go to ${label}`, hint, `${label} section go`, () => {
            document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    return commands;
}

function openCommandPalette(prefill = '') {
    const root = document.getElementById('cmdk');
    const input = document.getElementById('cmdkInput');
    if (!root || !input) return;

    cmdkOpen = true;
    root.classList.add('open');
    root.setAttribute('aria-hidden', 'false');

    input.value = prefill;
    renderCmdk();
    setCmdkActive(0);
    setTimeout(() => input.focus(), 0);
}

function closeCommandPalette() {
    const root = document.getElementById('cmdk');
    if (!root) return;
    cmdkOpen = false;
    root.classList.remove('open');
    root.setAttribute('aria-hidden', 'true');
}

function renderCmdk() {
    const input = document.getElementById('cmdkInput');
    const results = document.getElementById('cmdkResults');
    if (!input || !results) return;

    const query = input.value.trim().toLowerCase();
    cmdkFiltered = query
        ? cmdkCommands.filter(cmd => cmd.label.toLowerCase().includes(query) || cmd.keywords.includes(query))
        : cmdkCommands.slice();

    cmdkFiltered = cmdkFiltered.slice(0, 14);
    cmdkActiveIndex = Math.min(cmdkActiveIndex, Math.max(0, cmdkFiltered.length - 1));

    results.innerHTML = '';

    if (!cmdkFiltered.length) {
        const empty = document.createElement('div');
        empty.className = 'cmdk-item';
        const left = document.createElement('div');
        left.textContent = 'No results. Try “scan”, “theme”, “ops”, “voice”.';
        empty.appendChild(left);
        results.appendChild(empty);
        return;
    }

    cmdkFiltered.forEach((cmd, index) => {
        const row = document.createElement('div');
        row.className = `cmdk-item${index === cmdkActiveIndex ? ' active' : ''}`;
        row.setAttribute('data-index', String(index));

        const left = document.createElement('div');
        const label = document.createElement('div');
        label.className = 'label';
        label.textContent = cmd.label;
        const hint = document.createElement('div');
        hint.className = 'hint';
        hint.textContent = cmd.hint || '';
        left.appendChild(label);
        left.appendChild(hint);

        const right = document.createElement('div');
        right.className = 'cmdk-kbd';
        right.textContent = 'Enter';

        row.appendChild(left);
        row.appendChild(right);
        results.appendChild(row);
    });
}

function setCmdkActive(index) {
    if (!cmdkFiltered.length) return;
    cmdkActiveIndex = (index + cmdkFiltered.length) % cmdkFiltered.length;

    const results = document.getElementById('cmdkResults');
    const rows = results ? Array.from(results.querySelectorAll('.cmdk-item')) : [];
    rows.forEach((row, i) => row.classList.toggle('active', i === cmdkActiveIndex));

    const activeRow = rows[cmdkActiveIndex];
    activeRow?.scrollIntoView({ block: 'nearest' });
}

function runCmdkIndex(index) {
    const cmd = cmdkFiltered[index];
    if (!cmd) return;
    closeCommandPalette();
    try {
        cmd.run();
    } catch (error) {
        console.error('Command failed:', error);
    }
}

// ==================== SHORTCUTS & STATUS ====================
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (event) => {
        if (event.ctrlKey && (event.key === 'k' || event.key === 'K')) {
            event.preventDefault();
            if (document.getElementById('cmdk')) {
                openCommandPalette();
            } else {
                document.getElementById('threatSearchInput')?.focus();
            }
        }
        if (event.ctrlKey && (event.key === 'h' || event.key === 'H')) {
            event.preventDefault();
            document.getElementById('apiStatus')?.scrollIntoView({ behavior: 'smooth' });
        }
    });
}

function initOnlineStatus() {
    const badge = document.getElementById('onlineStatus');
    if (!badge) return;
    const update = () => {
        badge.textContent = navigator.onLine ? 'Online' : 'Offline';
        badge.className = `badge ${navigator.onLine ? 'status-ok' : 'status-warn'}`;
    };
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
}

// ==================== THEME TOGGLE ====================
function initTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.theme);
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
    }
    updateThemeIcon();
}

function toggleTheme() {
    document.body.classList.toggle('light-theme');
    localStorage.setItem(STORAGE_KEYS.theme, document.body.classList.contains('light-theme') ? 'light' : 'dark');
    updateThemeIcon();
}

function updateThemeIcon() {
    const icon = document.getElementById('themeIcon');
    if (!icon) return;

    if (document.body.classList.contains('light-theme')) {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
}

// ==================== API STATUS ====================
async function initApiStatus() {
    const badge = document.getElementById('apiStatus');
    const modeBadge = document.getElementById('modeBadge');
    const dataBadge = document.getElementById('dataBadge');
    if (!badge || !window.api) return;

    try {
        const result = await window.api.checkHealth();
        if (result && result.status === 'healthy') {
            const db = result.database || 'unknown';
            const authed = !!window.api.token;

            badge.textContent = `API: Online${db ? ` (${db})` : ''}`;
            badge.classList.remove('status-warn');
            badge.classList.add('status-ok');

            if (modeBadge) {
                modeBadge.textContent = authed ? 'Mode: Authenticated' : 'Mode: Simulation';
            }
            if (dataBadge) {
                if (db === 'connected' && authed) {
                    dataBadge.textContent = 'Data: Live';
                } else if (db === 'disconnected') {
                    dataBadge.textContent = 'Data: Demo';
                } else {
                    dataBadge.textContent = authed ? 'Data: Connected' : 'Data: Local';
                }
            }
        } else {
            badge.textContent = 'API: Offline';
            badge.classList.remove('status-ok');
            badge.classList.add('status-warn');
            if (modeBadge) modeBadge.textContent = 'Mode: Offline';
            if (dataBadge) dataBadge.textContent = 'Data: Local';
        }
    } catch (error) {
        badge.textContent = 'API: Offline';
        badge.classList.remove('status-ok');
        badge.classList.add('status-warn');
        if (modeBadge) modeBadge.textContent = 'Mode: Offline';
        if (dataBadge) dataBadge.textContent = 'Data: Local';
    }
}
// ==================== LIVE THREAT FEED ====================
const threatTypes = [
    { type: 'ddos', icon: 'fa-server', message: 'DDoS attack blocked' },
    { type: 'malware', icon: 'fa-bug', message: 'Malware detected and removed' },
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

    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            addThreatItem();
        }, i * 800);
    }

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

    while (threatFeed.children.length > 10) {
        threatFeed.removeChild(threatFeed.lastChild);
    }
}

// ==================== OPS: TIMER AND LOG ====================
let timerInterval = null;
let timerStart = null;
let timerElapsed = 0;

function initTimer() {
    updateTimerDisplay();
}

function startTimer() {
    if (timerInterval) return;
    timerStart = Date.now() - timerElapsed;
    timerInterval = setInterval(updateTimerDisplay, 1000);
    updateTimerDisplay();
}

function pauseTimer() {
    if (!timerInterval) return;
    clearInterval(timerInterval);
    timerInterval = null;
    timerElapsed = Date.now() - timerStart;
}

function resetTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    timerStart = null;
    timerElapsed = 0;
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const timer = document.getElementById('responseTimer');
    if (!timer) return;

    const elapsed = timerInterval ? Date.now() - timerStart : timerElapsed;
    const totalSeconds = Math.floor(elapsed / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');

    timer.textContent = `${hours}:${minutes}:${seconds}`;
}

function addIncidentLog() {
    const input = document.getElementById('incidentNote');
    if (!input) return;

    const note = input.value.trim();
    if (!note) return;

    const log = getJson(STORAGE_KEYS.incidentLog, []);
    log.unshift({ note, time: new Date().toISOString() });
    setJson(STORAGE_KEYS.incidentLog, log.slice(0, 30));

    input.value = '';
    renderIncidentLog();
}

function renderIncidentLog() {
    const list = document.getElementById('incidentLog');
    if (!list) return;

    const log = getJson(STORAGE_KEYS.incidentLog, []);
    list.innerHTML = '';

    if (!log.length) {
        list.innerHTML = '<li>No entries yet.</li>';
        return;
    }

    log.forEach(entry => {
        const li = document.createElement('li');
        const time = new Date(entry.time).toLocaleString();
        li.innerHTML = `${entry.note}<span class="log-time">${time}</span>`;
        list.appendChild(li);
    });
}

function clearIncidentLog() {
    localStorage.removeItem(STORAGE_KEYS.incidentLog);
    renderIncidentLog();
}

// ==================== OPS: CHECKLIST ====================
function initOpsChecklist() {
    const checkboxes = document.querySelectorAll('.ops-checklist input[type="checkbox"]');
    if (!checkboxes.length) return;

    const saved = getJson(STORAGE_KEYS.checklist, {});

    checkboxes.forEach(box => {
        const key = box.getAttribute('data-key');
        if (saved[key]) {
            box.checked = true;
        }

        box.addEventListener('change', function() {
            saved[key] = box.checked;
            setJson(STORAGE_KEYS.checklist, saved);
            updateChecklistProgress();
        });
    });

    updateChecklistProgress();
}

function updateChecklistProgress() {
    const checkboxes = document.querySelectorAll('.ops-checklist input[type="checkbox"]');
    const progress = document.getElementById('checklistProgress');
    const label = document.getElementById('checklistPercent');

    if (!checkboxes.length || !progress || !label) return;

    const total = checkboxes.length;
    const checked = Array.from(checkboxes).filter(box => box.checked).length;
    const percent = total ? Math.round((checked / total) * 100) : 0;

    progress.style.width = `${percent}%`;
    label.textContent = `${percent}% complete`;
}
// ==================== OPS: IOC TRIAGE ====================
function analyzeIocs() {
    const input = document.getElementById('iocInput');
    const results = document.getElementById('iocResults');
    const tags = document.getElementById('iocTags');
    if (!input || !results || !tags) return;

    const text = input.value.trim();
    if (!text) {
        results.textContent = 'Paste indicators to analyze.';
        results.className = 'tool-result show weak';
        tags.innerHTML = '';
        return;
    }

    const lower = text.toLowerCase();
    const urlRegex = /https?:\/\/[^\s/$.?#].[^\s]*/gi;
    const ipv4Regex = /\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/g;
    const md5Regex = /\b[a-f0-9]{32}\b/g;
    const sha1Regex = /\b[a-f0-9]{40}\b/g;
    const sha256Regex = /\b[a-f0-9]{64}\b/g;
    const domainRegex = /\b(?:[a-z0-9-]+\.)+[a-z]{2,}\b/g;

    const urls = new Set((lower.match(urlRegex) || []).map(item => item.replace(/[),.]+$/, '')));
    let scrubbed = lower.replace(urlRegex, ' ');

    const ips = new Set(scrubbed.match(ipv4Regex) || []);
    scrubbed = scrubbed.replace(ipv4Regex, ' ');

    const sha256 = new Set(scrubbed.match(sha256Regex) || []);
    scrubbed = scrubbed.replace(sha256Regex, ' ');

    const sha1 = new Set(scrubbed.match(sha1Regex) || []);
    scrubbed = scrubbed.replace(sha1Regex, ' ');

    const md5 = new Set(scrubbed.match(md5Regex) || []);
    scrubbed = scrubbed.replace(md5Regex, ' ');

    const domains = new Set((scrubbed.match(domainRegex) || []).filter(domain => !domain.includes('..')));

    const score = Math.min(100, (urls.size * 20) + (ips.size * 12) + (sha256.size * 15) + (sha1.size * 12) + (md5.size * 10) + (domains.size * 6));

    let riskLabel = 'Low';
    let riskClass = 'strong';
    if (score > 70) {
        riskLabel = 'High';
        riskClass = 'weak';
    } else if (score > 40) {
        riskLabel = 'Medium';
        riskClass = 'medium';
    }

    results.innerHTML = `
        IOC Summary
        URLs: ${urls.size} | IPs: ${ips.size} | Domains: ${domains.size} | Hashes: ${md5.size + sha1.size + sha256.size}
        Risk Score: ${score}% (${riskLabel})
    `;
    results.className = `tool-result show ${riskClass}`;

    const tagItems = [];
    urls.forEach(value => tagItems.push({ type: 'ioc-url', value }));
    ips.forEach(value => tagItems.push({ type: 'ioc-ip', value }));
    domains.forEach(value => tagItems.push({ type: 'ioc-domain', value }));
    md5.forEach(value => tagItems.push({ type: 'ioc-hash', value }));
    sha1.forEach(value => tagItems.push({ type: 'ioc-hash', value }));
    sha256.forEach(value => tagItems.push({ type: 'ioc-hash', value }));

    tags.innerHTML = '';
    tagItems.slice(0, 12).forEach(item => {
        const span = document.createElement('span');
        span.className = `ioc-tag ${item.type}`;
        span.textContent = item.value;
        tags.appendChild(span);
    });

    if (tagItems.length > 12) {
        const more = document.createElement('span');
        more.className = 'ioc-tag';
        more.textContent = `+${tagItems.length - 12} more`;
        tags.appendChild(more);
    }
}

// ==================== OPS: EVIDENCE ====================
function addEvidence() {
    const idInput = document.getElementById('evidenceId');
    const ownerInput = document.getElementById('evidenceOwner');
    const noteInput = document.getElementById('evidenceNote');
    const status = document.getElementById('evidenceStatus');

    if (!idInput || !ownerInput || !noteInput || !status) return;

    const id = idInput.value.trim();
    const owner = ownerInput.value.trim();
    const note = noteInput.value.trim();

    if (!id || !owner) {
        showStatus(status, 'Evidence ID and custodian are required.', 'error');
        return;
    }

    const log = getJson(STORAGE_KEYS.evidenceLog, []);
    log.unshift({ id, owner, note, time: new Date().toISOString() });
    setJson(STORAGE_KEYS.evidenceLog, log.slice(0, 50));

    idInput.value = '';
    ownerInput.value = '';
    noteInput.value = '';

    showStatus(status, 'Evidence entry added.', 'success');
    renderEvidenceLog();
}

function renderEvidenceLog() {
    const list = document.getElementById('evidenceList');
    if (!list) return;

    const log = getJson(STORAGE_KEYS.evidenceLog, []);
    list.innerHTML = '';

    if (!log.length) {
        list.innerHTML = '<li>No evidence logged yet.</li>';
        return;
    }

    log.forEach(entry => {
        const li = document.createElement('li');
        const time = new Date(entry.time).toLocaleString();
        const note = entry.note ? ` - ${entry.note}` : '';
        li.innerHTML = `#${entry.id} | ${entry.owner}${note}<span class="log-time">${time}</span>`;
        list.appendChild(li);
    });
}

function exportEvidence() {
    const log = getJson(STORAGE_KEYS.evidenceLog, []);
    const status = document.getElementById('evidenceStatus');

    if (!log.length) {
        showStatus(status, 'No evidence entries to export.', 'error');
        return;
    }

    const blob = new Blob([JSON.stringify(log, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `securechain-evidence-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    showStatus(status, 'Evidence log exported.', 'success');
}

function clearEvidence() {
    const status = document.getElementById('evidenceStatus');
    localStorage.removeItem(STORAGE_KEYS.evidenceLog);
    renderEvidenceLog();
    showStatus(status, 'Evidence log cleared.', 'info');
}
// ==================== MY FILES ====================
async function loadMyFiles() {
    const table = document.getElementById('myFilesTable');
    if (!table) return;
    
    if (!window.api || !window.api.token) {
        table.innerHTML = '<p>Please login with backend to load your files.</p>';
        return;
    }

    table.innerHTML = '<p>Loading files...</p>';
    
    try {
        const files = await api.getMyFiles();
        if (!files || files.length === 0) {
            table.innerHTML = '<p>No files uploaded yet. <a href="#upload">Upload now</a></p>';
            return;
        }
        
        let html = '<table class="files-table"><thead><tr><th>File</th><th>Hash</th><th>Blockchain TX</th><th>Size</th><th>Date</th><th>Actions</th></tr></thead><tbody>';
        
        files.forEach(file => {
            const date = new Date(file.uploadedAt).toLocaleString();
            const sizeKB = (file.size / 1024).toFixed(1);
            html += `
                <tr>
                    <td>${file.originalName}</td>
                    <td title="${file.hash}">${file.hash.substring(0,16)}...</td>
                    <td title="${file.blockchainTxHash}">${file.blockchainTxHash?.substring(0,16)}...</td>
                    <td>${sizeKB} KB</td>
                    <td>${date}</td>
                    <td><button onclick="downloadFile('${file._id}')" class="btn-ghost small">Receipt</button></td>
                </tr>`;
        });
        
        html += '</tbody></table>';
        table.innerHTML = html;
    } catch (error) {
        const msg = (error && error.message) ? String(error.message) : '';
        if (msg.toLowerCase().includes('auth') || msg.toLowerCase().includes('token')) {
            table.innerHTML = '<p>Session expired. Please login again.</p>';
        } else {
            table.innerHTML = '<p>Error loading files. Backend may be offline.</p>';
        }
    }
}

async function downloadFile(fileId) {
    try {
        if (!window.api || !window.api.token) {
            alert('Please login with backend to export a receipt.');
            return;
        }

        const file = await window.api.getFile(fileId);
        const receipt = {
            id: file._id || file.id || fileId,
            originalName: file.originalName,
            hash: file.hash,
            blockchainTxHash: file.blockchainTxHash,
            size: file.size,
            mimeType: file.mimeType,
            uploadedAt: file.uploadedAt,
            verified: file.verified,
            exportedAt: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(receipt, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `securechain-receipt-${receipt.id}.json`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    } catch (error) {
        alert('Export failed');
    }
}

// ==================== EXPOSE FUNCTIONS ====================
window.loadMyFiles = loadMyFiles;
window.downloadFile = downloadFile;
window.uploadFile = uploadFile;
window.verifyHash = verifyHash;
// ... rest unchanged
