import { defaultConfig } from './config.js';
import { createInitialPolicyState, createInitialSimState } from './state.js';
import { tick } from './tick.js';

let simState = createInitialSimState();
const policyState = createInitialPolicyState();

console.log('--- NATION SIMULATOR TEST HARNESS ---');
console.log('Initial State:', JSON.stringify(simState, null, 2));

for (let i = 1; i <= 120; i++) {
    simState = tick(simState, policyState, defaultConfig);
    
    if (i % 12 === 0) {
        console.log(`Month ${i} (Year ${i/12}):`);
        console.log(`  Treasury Balance: ${simState.stocks.treasuryBalance.toFixed(2)}`);
        console.log(`  Tax Collection Rate: ${simState.flows.currentTaxCollectionRate.toFixed(2)}`);
        console.log(`  Healthcare Capacity: ${simState.stocks.healthcareCapacity.toFixed(2)}`);
        console.log(`  Healthcare Investment Rate: ${simState.flows.currentHealthcareInvestmentRate.toFixed(2)}`);
        console.log(`  Education Capacity: ${simState.stocks.educationCapacity.toFixed(2)}`);
        console.log(`  Infrastructure Quality: ${simState.stocks.infrastructureQuality.toFixed(2)}`);
        console.log(`  Healthcare Effective Output: ${simState.derived.healthcareEffectiveOutput.toFixed(2)}`);
        console.log(`  Election Integrity: ${simState.operativePolicies.electionIntegrityTarget.toFixed(2)}`);
        console.log(`  Oversight Capacity: ${simState.stocks.oversightCapacity.toFixed(2)}`);
        console.log(`  Oversight Effective Indep: ${simState.derived.oversightEffectiveIndependence.toFixed(2)}`);
        console.log(`  Rule of Law Index: ${simState.stocks.ruleOfLawIndex.toFixed(2)}`);
        console.log(`  Systemic Deterrence Factor: ${simState.derived.systemicDeterrenceFactor.toFixed(3)}`);
        console.log(`  Economic Vitality: ${simState.derived.economicVitality.toFixed(2)}`);
        console.log(`  Infra & Services Index: ${simState.derived.infraAndServicesIndex.toFixed(2)}`);
        console.log(`  Governance Index: ${simState.derived.governanceIndex.toFixed(2)}`);
        console.log(`  Human Output Score: ${simState.derived.humanOutputScore.toFixed(2)}`);
        console.log(`  Stress Index: ${simState.derived.stressIndex.toFixed(2)}`);
        console.log(`  Brain Drain Rate: ${simState.derived.brainDrainRate.toFixed(2)}`);
        console.log(`  Brain Drain Accum: ${simState.stocks.brainDrainAccumulated.toFixed(2)}`);
        console.log(`  Econ Capacity Mult: ${simState.derived.economicCapacityMultiplier.toFixed(3)}`);
    }
}
console.log('--- END OF RUN ---');
