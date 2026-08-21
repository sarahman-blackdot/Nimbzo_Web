import { createInitialSimState, createInitialPolicyState } from './engine/state.js';
import { defaultConfig } from './engine/config.js';
import { runSimulation } from './engine/simulate.js';
import { tick } from './engine/tick.js';

let simState = createInitialSimState();
let policyState = createInitialPolicyState();

export function render() {
    const el = (id) => document.getElementById(id);
    if (!el('year-display')) return; // Check if running in DOM

    // Helper to update text and flash if changed
    const updateVal = (id, newVal) => {
        const element = el(id);
        if (!element) return;
        const strVal = typeof newVal === 'number' ? newVal.toFixed(2) : newVal;
        if (element.textContent !== strVal && element.textContent !== '0.00' && element.textContent !== '0') {
            element.classList.add('updated');
            setTimeout(() => element.classList.remove('updated'), 50); // Remove quickly so transition kicks in
        }
        element.textContent = strVal;
    };

    updateVal('year-display', Math.floor(simState.tick / 12).toString());
    updateVal('human-output-score', simState.derived.humanOutputScore);

    updateVal('val-treasury', simState.stocks.treasuryBalance);
    updateVal('val-tax-rate', simState.flows.currentTaxCollectionRate);

    updateVal('val-hc-cap', simState.stocks.healthcareCapacity);
    updateVal('val-edu-cap', simState.stocks.educationCapacity);
    updateVal('val-infra-qual', simState.stocks.infrastructureQuality);
    updateVal('val-hc-out', simState.derived.healthcareEffectiveOutput);

    updateVal('val-rule-of-law', simState.stocks.ruleOfLawIndex);
    updateVal('val-oversight-indep', simState.derived.oversightEffectiveIndependence);
    updateVal('val-election-int', simState.operativePolicies.electionIntegrityTarget);

    updateVal('val-econ-vitality', simState.derived.economicVitality);
    updateVal('val-infra-serv', simState.derived.infraAndServicesIndex);
    updateVal('val-stress-index', simState.derived.stressIndex);
    updateVal('val-brain-drain', simState.stocks.brainDrainAccumulated);
}

function getFlowNameForKey(key) {
    if (key.includes('tax') || key.includes('customs')) return 'Tax';
    if (key.includes('healthcare') || key.includes('procurement')) return 'Healthcare';
    if (key.includes('education')) return 'Education';
    if (key.includes('infrastructure')) return 'Infrastructure';
    if (key.includes('judicial')) return 'Judicial';
    if (key.includes('oversight') || key.includes('election')) return 'Oversight';
    return null;
}

function renderFlows(sourceKey = null) {
    const visualizerIds = ['flow-visualizer', 'floating-flow-visualizer'];
    
    // Create a temporary "what-if" state where policies are fully implemented instantly
    const whatIfSimState = {
        ...simState,
        operativePolicies: { ...policyState.targets }
    };
    
    // Run a dummy tick to let the engine compute derived leakages and inputs
    const projection = tick(whatIfSimState, policyState, defaultConfig);
    
    const taxGross = policyState.targets.taxRateTarget * projection.derived.economicCapacityMultiplier;
    
    const flows = [
        { id: 'Tax', name: 'Tax', input: taxGross, max: 100, leakage: projection.derived.leakages.tax },
        { id: 'Healthcare', name: 'Healthcare', input: policyState.targets.healthcareFundingPctTarget, max: 20, leakage: projection.derived.leakages.healthcare },
        { id: 'Education', name: 'Education', input: policyState.targets.educationFundingPctTarget, max: 20, leakage: projection.derived.leakages.education },
        { id: 'Infrastructure', name: 'Infrastructure', input: policyState.targets.infrastructureFundingPctTarget, max: 20, leakage: projection.derived.leakages.infrastructure },
        { id: 'Judicial', name: 'Judicial', input: policyState.targets.judicialFundingPctTarget, max: 20, leakage: projection.derived.leakages.judicial },
        { id: 'Oversight', name: 'Oversight', input: policyState.targets.oversightFundingPctTarget, max: 20, leakage: projection.derived.leakages.oversight }
    ];

    const targetFlowId = sourceKey ? getFlowNameForKey(sourceKey) : null;

    visualizerIds.forEach(visId => {
        const visualizer = document.getElementById(visId);
        if (!visualizer) return;

        // Build DOM once if empty
        if (visualizer.children.length === 0) {
            let html = '';
            flows.forEach(f => {
                html += `
                    <div class="flow-row" id="${visId}-row-${f.id}">
                        <div class="flow-label">${f.name}</div>
                        <div class="flow-bar-container">
                            <div class="flow-bar-gross" id="${visId}-gross-${f.id}">
                                <div class="flow-segment-effective" id="${visId}-eff-${f.id}"></div>
                                <div class="flow-segment-leakage" id="${visId}-leak-${f.id}"></div>
                            </div>
                        </div>
                    </div>
                `;
            });
            visualizer.innerHTML = html;
        }

        // Update widths and apply pulse
        flows.forEach(f => {
            const widthPct = (f.input / f.max) * 100;
            const effectivePct = (1 - f.leakage) * 100;
            const leakagePct = f.leakage * 100;
            
            document.getElementById(`${visId}-gross-${f.id}`).style.width = `${widthPct}%`;
            document.getElementById(`${visId}-eff-${f.id}`).style.width = `${effectivePct}%`;
            document.getElementById(`${visId}-leak-${f.id}`).style.width = `${leakagePct}%`;

            const row = document.getElementById(`${visId}-row-${f.id}`);
            if (targetFlowId === f.id && row) {
                row.classList.remove('glow-pulse');
                void row.offsetWidth; // trigger reflow to restart animation
                row.classList.add('glow-pulse');
            }
        });
    });
}

// Bind button, sliders, and chart if running in browser
if (typeof document !== 'undefined') {
    const policyKeys = [
        'taxRateTarget', 'taxCollectionIntegrityTarget', 'customsIntegrityTarget',
        'healthcareFundingPctTarget', 'procurementFairnessTarget',
        'educationFundingPctTarget', 'educationIntegrityTarget',
        'infrastructureFundingPctTarget', 'infrastructureMaintenanceIntegrityTarget',
        'judicialFundingPctTarget', 'judicialIndependenceIntegrityTarget',
        'oversightFundingPctTarget', 'oversightIndependenceIntegrityTarget',
        'electionIntegrityTarget'
    ];

    let flowHideTimeout = null;

    policyKeys.forEach(key => {
        const input = document.getElementById('in-' + key);
        const display = document.getElementById('val-' + key);
        
        const updateSliderFill = () => {
            const min = parseFloat(input.min || 0);
            const max = parseFloat(input.max || 100);
            const val = parseFloat(input.value);
            const pct = ((val - min) / (max - min)) * 100;
            input.style.setProperty('--val', pct + '%');
        };

        if (input && display) {
            input.value = policyState.targets[key];
            display.textContent = policyState.targets[key].toFixed(1);
            updateSliderFill();

            input.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value);
                policyState.targets[key] = val;
                display.textContent = val.toFixed(1);
                updateSliderFill();
                renderFlows(key); // Live update visualizer

                // Floating visualizer logic
                const mainVis = document.getElementById('flow-visualizer');
                const floatVis = document.getElementById('floating-flow');
                if (mainVis && floatVis) {
                    const rect = mainVis.getBoundingClientRect();
                    // If main is not fully visible
                    if (rect.top > window.innerHeight || rect.bottom < 0) {
                        floatVis.classList.remove('hidden');
                        if (flowHideTimeout) clearTimeout(flowHideTimeout);
                        flowHideTimeout = setTimeout(() => {
                            floatVis.classList.add('hidden');
                        }, 3000); // hide after 3 seconds of inactivity
                    }
                }
            });
        }
    });

    let historyChart = null;

    function initChart() {
        const ctx = document.getElementById('history-chart');
        if (!ctx || typeof Chart === 'undefined') return;
        
        historyChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [(simState.tick / 12).toFixed(2)],
                datasets: [
                    {
                        label: 'Treasury Balance',
                        data: [simState.stocks.treasuryBalance],
                        borderColor: '#4ade80',
                        backgroundColor: '#4ade80',
                        tension: 0.1,
                        pointRadius: 0
                    },
                    {
                        label: 'Rule of Law',
                        data: [simState.stocks.ruleOfLawIndex],
                        borderColor: '#38bdf8',
                        backgroundColor: '#38bdf8',
                        tension: 0.1,
                        pointRadius: 0
                    },
                    {
                        label: 'Human Output Score',
                        data: [simState.derived.humanOutputScore],
                        borderColor: '#facc15',
                        backgroundColor: '#facc15',
                        tension: 0.1,
                        pointRadius: 0
                    },
                    {
                        label: 'Brain Drain Accum.',
                        data: [simState.stocks.brainDrainAccumulated],
                        borderColor: '#f87171',
                        backgroundColor: '#f87171',
                        tension: 0.1,
                        pointRadius: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: { display: true, text: 'Year', color: '#cbd5e1' },
                        ticks: { color: '#94a3b8', maxTicksLimit: 20 },
                        grid: { color: '#334155' }
                    },
                    y: {
                        title: { display: true, text: 'Value', color: '#cbd5e1' },
                        ticks: { color: '#94a3b8' },
                        grid: { color: '#334155' }
                    }
                },
                plugins: {
                    legend: { labels: { color: '#f8fafc' } }
                }
            }
        });
    }

    function appendChartData(history) {
        if (!historyChart) return;
        history.forEach(state => {
            historyChart.data.labels.push((state.tick / 12).toFixed(2));
            historyChart.data.datasets[0].data.push(state.stocks.treasuryBalance);
            historyChart.data.datasets[1].data.push(state.stocks.ruleOfLawIndex);
            historyChart.data.datasets[2].data.push(state.derived.humanOutputScore);
            historyChart.data.datasets[3].data.push(state.stocks.brainDrainAccumulated);
        });
        
        // Enforce sliding window of 1200 months (100 years)
        const maxPoints = 1200;
        if (historyChart.data.labels.length > maxPoints) {
            historyChart.data.labels.splice(0, historyChart.data.labels.length - maxPoints);
            historyChart.data.datasets.forEach(dataset => {
                dataset.data.splice(0, dataset.data.length - maxPoints);
            });
        }
        
        historyChart.update();
    }

    const advanceHandler = (months, buttonName) => {
        console.log(`[Action] Clicked '${buttonName}' -> Advancing ${months} months.`);
        const result = runSimulation(simState, policyState, defaultConfig, months, 'timestepped');
        simState = result.finalState;
        render();
        renderFlows();
        appendChartData(result.history);
    };

    const btn = document.getElementById('advance-btn');
    if (btn) btn.addEventListener('click', () => advanceHandler(120, 'Advance 10 Years (Header)'));

    const btn5 = document.getElementById('advance-5-btn');
    if (btn5) btn5.addEventListener('click', () => advanceHandler(60, 'Advance 5 Years (Header)'));

    const floatBtn = document.getElementById('floating-advance-btn');
    if (floatBtn) floatBtn.addEventListener('click', () => advanceHandler(120, 'Advance 10 Years (Fixed)'));

    const floatBtn5 = document.getElementById('floating-advance-5-btn');
    if (floatBtn5) floatBtn5.addEventListener('click', () => advanceHandler(60, 'Advance 5 Years (Fixed)'));


    
    // Welcome Overlay Logic
    const welcomeToast = document.getElementById('welcome-toast');
    const welcomeClose = document.getElementById('welcome-close');
    
    if (welcomeToast && welcomeClose) {
        if (!localStorage.getItem('civicEngineIntroSeen')) {
            // Small delay to let the page render before fading in
            setTimeout(() => {
                welcomeToast.classList.remove('hidden');
            }, 100);
            
            const dismissWelcome = () => {
                welcomeToast.classList.add('hidden');
                localStorage.setItem('civicEngineIntroSeen', 'true');
            };

            welcomeClose.addEventListener('click', dismissWelcome);

            setTimeout(() => {
                if (!welcomeToast.classList.contains('hidden')) {
                    dismissWelcome();
                }
            }, 7500); // 7.5 seconds
        }
    }

    // Initial setup
    initChart();
    render();
    renderFlows();
}

// Export for node test script
export { simState, policyState };
export function advance10YearsForTest() {
    const result = runSimulation(simState, policyState, defaultConfig, 120, 'instant');
    simState = result.finalState;
}
