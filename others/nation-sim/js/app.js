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

function renderFlows() {
    const visualizer = document.getElementById('flow-visualizer');
    if (!visualizer) return;

    // Create a temporary "what-if" state where policies are fully implemented instantly
    const whatIfSimState = {
        ...simState,
        operativePolicies: { ...policyState.targets }
    };
    
    // Run a dummy tick to let the engine compute derived leakages and inputs
    const projection = tick(whatIfSimState, policyState, defaultConfig);
    
    const taxGross = policyState.targets.taxRateTarget * projection.derived.economicCapacityMultiplier;
    
    const flows = [
        { name: 'Tax', input: taxGross, max: 100, leakage: projection.derived.leakages.tax },
        { name: 'Healthcare', input: policyState.targets.healthcareFundingPctTarget, max: 20, leakage: projection.derived.leakages.healthcare },
        { name: 'Education', input: policyState.targets.educationFundingPctTarget, max: 20, leakage: projection.derived.leakages.education },
        { name: 'Infrastructure', input: policyState.targets.infrastructureFundingPctTarget, max: 20, leakage: projection.derived.leakages.infrastructure },
        { name: 'Judicial', input: policyState.targets.judicialFundingPctTarget, max: 20, leakage: projection.derived.leakages.judicial },
        { name: 'Oversight', input: policyState.targets.oversightFundingPctTarget, max: 20, leakage: projection.derived.leakages.oversight }
    ];

    let html = '';
    flows.forEach(f => {
        const widthPct = (f.input / f.max) * 100;
        const effectivePct = (1 - f.leakage) * 100;
        const leakagePct = f.leakage * 100;
        
        html += `
            <div class="flow-row">
                <div class="flow-label">${f.name}</div>
                <div class="flow-bar-container">
                    <div class="flow-bar-gross" style="width: ${widthPct}%">
                        <div class="flow-segment-effective" style="width: ${effectivePct}%"></div>
                        <div class="flow-segment-leakage" style="width: ${leakagePct}%"></div>
                    </div>
                </div>
            </div>
        `;
    });
    visualizer.innerHTML = html;
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

    policyKeys.forEach(key => {
        const input = document.getElementById('in-' + key);
        const display = document.getElementById('val-' + key);
        if (input && display) {
            input.value = policyState.targets[key];
            display.textContent = policyState.targets[key].toFixed(1);

            input.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value);
                policyState.targets[key] = val;
                display.textContent = val.toFixed(1);
                renderFlows(); // Live update visualizer
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

    const btn = document.getElementById('advance-btn');
    if (btn) {
        btn.addEventListener('click', () => {
            const result = runSimulation(simState, policyState, defaultConfig, 120, 'timestepped');
            simState = result.finalState;
            render();
            renderFlows();
            appendChartData(result.history);
        });
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
