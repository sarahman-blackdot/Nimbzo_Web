import { createInitialSimState, createInitialPolicyState } from './engine/state.js';
import { defaultConfig } from './engine/config.js';
import { runSimulation } from './engine/simulate.js';

let simState = createInitialSimState();
let policyState = createInitialPolicyState();

export function render() {
    const el = (id) => document.getElementById(id);
    if (!el('year-display')) return; // Check if running in DOM

    el('year-display').textContent = Math.floor(simState.tick / 12);
    el('human-output-score').textContent = simState.derived.humanOutputScore.toFixed(2);

    el('val-treasury').textContent = simState.stocks.treasuryBalance.toFixed(2);
    el('val-tax-rate').textContent = simState.flows.currentTaxCollectionRate.toFixed(2);

    el('val-hc-cap').textContent = simState.stocks.healthcareCapacity.toFixed(2);
    el('val-edu-cap').textContent = simState.stocks.educationCapacity.toFixed(2);
    el('val-infra-qual').textContent = simState.stocks.infrastructureQuality.toFixed(2);
    el('val-hc-out').textContent = simState.derived.healthcareEffectiveOutput.toFixed(2);

    el('val-rule-of-law').textContent = simState.stocks.ruleOfLawIndex.toFixed(2);
    el('val-oversight-indep').textContent = simState.derived.oversightEffectiveIndependence.toFixed(2);
    el('val-election-int').textContent = simState.operativePolicies.electionIntegrityTarget.toFixed(2);

    el('val-econ-vitality').textContent = simState.derived.economicVitality.toFixed(2);
    el('val-infra-serv').textContent = simState.derived.infraAndServicesIndex.toFixed(2);
    el('val-stress-index').textContent = simState.derived.stressIndex.toFixed(2);
    el('val-brain-drain').textContent = simState.stocks.brainDrainAccumulated.toFixed(2);
}

// Bind button if running in browser
if (typeof document !== 'undefined') {
    const btn = document.getElementById('advance-btn');
    if (btn) {
        btn.addEventListener('click', () => {
            const result = runSimulation(simState, policyState, defaultConfig, 120, 'instant');
            simState = result.finalState;
            render();
        });
    }
    // Initial render
    render();
}

// Export for node test script
export { simState, policyState };
export function advance10YearsForTest() {
    const result = runSimulation(simState, policyState, defaultConfig, 120, 'instant');
    simState = result.finalState;
}
