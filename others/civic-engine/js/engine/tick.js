// Converts an annual decay rate to a monthly decay rate.
// This is computed using geometric compounding (1 - (1 - annualRate)^(1/12)) 
// instead of simple linear division (annualRate / 12) because decay applies 
// continuously and compounding accurately models exponential decay over time.
function convertAnnualToMonthlyRate(annualRate) {
    return 1 - Math.pow(1 - annualRate, 1 / 12);
}

// Applies the systemic deterrence curve to a raw integrity value.
function applySystemicDeterrence(rawIntegrity, ruleOfLawIndex, alpha) {
    return rawIntegrity * Math.pow(ruleOfLawIndex / 100, alpha);
}

export function tick(simState, policyState, config) {
    const { tick: currentTick, operativePolicies, stocks, flows, derived: oldDerived } = simState;
    const { targets } = policyState;
    
    // Default config values (simulating a 1-month step per tick)
    const defaultImplementationRate = config.policyImplementationRate || 0.05;
    const decayRates = config.decayRates || {};
    const dt = 1; // 1 month

    // Unpack old policies to prepare for chasing the target
    const {
        taxRateTarget: oldTaxRate,
        taxCollectionIntegrityTarget: oldTaxIntegrity,
        customsIntegrityTarget: oldCustomsIntegrity,
        healthcareFundingPctTarget: oldHealthcareFunding,
        procurementFairnessTarget: oldProcurementFairness,
        educationFundingPctTarget: oldEducationFunding,
        educationIntegrityTarget: oldEducationIntegrity,
        infrastructureFundingPctTarget: oldInfrastructureFunding,
        infrastructureMaintenanceIntegrityTarget: oldInfrastructureIntegrity,
        judicialFundingPctTarget: oldJudicialFunding,
        judicialIndependenceIntegrityTarget: oldJudicialIntegrity,
        oversightFundingPctTarget: oldOversightFunding,
        oversightIndependenceIntegrityTarget: oldOversightIndependence,
        electionIntegrityTarget: oldElectionIntegrity
    } = operativePolicies;

    const {
        ruleOfLawIndex: oldRuleOfLawIndex,
        brainDrainAccumulated: oldBrainDrainAccumulated
    } = stocks;

    // --- 1. Evolve Operative Policies ---
    const newOperativePolicies = {
        taxRateTarget: oldTaxRate + (targets.taxRateTarget - oldTaxRate) * defaultImplementationRate,
        taxCollectionIntegrityTarget: oldTaxIntegrity + (targets.taxCollectionIntegrityTarget - oldTaxIntegrity) * defaultImplementationRate,
        customsIntegrityTarget: oldCustomsIntegrity + (targets.customsIntegrityTarget - oldCustomsIntegrity) * defaultImplementationRate,
        healthcareFundingPctTarget: oldHealthcareFunding + (targets.healthcareFundingPctTarget - oldHealthcareFunding) * defaultImplementationRate,
        procurementFairnessTarget: oldProcurementFairness + (targets.procurementFairnessTarget - oldProcurementFairness) * defaultImplementationRate,
        educationFundingPctTarget: oldEducationFunding + (targets.educationFundingPctTarget - oldEducationFunding) * defaultImplementationRate,
        educationIntegrityTarget: oldEducationIntegrity + (targets.educationIntegrityTarget - oldEducationIntegrity) * defaultImplementationRate,
        infrastructureFundingPctTarget: oldInfrastructureFunding + (targets.infrastructureFundingPctTarget - oldInfrastructureFunding) * defaultImplementationRate,
        infrastructureMaintenanceIntegrityTarget: oldInfrastructureIntegrity + (targets.infrastructureMaintenanceIntegrityTarget - oldInfrastructureIntegrity) * defaultImplementationRate,
        electionIntegrityTarget: oldElectionIntegrity + (targets.electionIntegrityTarget - oldElectionIntegrity) * defaultImplementationRate,
        oversightFundingPctTarget: oldOversightFunding + (targets.oversightFundingPctTarget - oldOversightFunding) * defaultImplementationRate,
        oversightIndependenceIntegrityTarget: oldOversightIndependence + (targets.oversightIndependenceIntegrityTarget - oldOversightIndependence) * defaultImplementationRate,
        judicialFundingPctTarget: oldJudicialFunding + (targets.judicialFundingPctTarget - oldJudicialFunding) * defaultImplementationRate,
        judicialIndependenceIntegrityTarget: oldJudicialIntegrity + (targets.judicialIndependenceIntegrityTarget - oldJudicialIntegrity) * defaultImplementationRate,
    };

    // Calculate judicial investment (its leakage comes only from its own integrity, no deterrence)
    const judicialLeakage = (100 - oldJudicialIntegrity) / 100;
    const currentJudicialInvestmentRate = oldJudicialFunding * (1 - judicialLeakage);

    // Compute stress index and brain drain from FROZEN incoming state
    const stressIndex = config.brainDrainStressWeights.governance * (100 - (oldDerived.governanceIndex || 0))
                      + config.brainDrainStressWeights.economic * (100 - (oldDerived.economicVitality || 0))
                      + config.brainDrainStressWeights.infraServices * (100 - (oldDerived.infraAndServicesIndex || 0));

    const brainDrainRate = config.brainDrainMaxRate / (1 + Math.exp(-config.brainDrainSteepness * (stressIndex - config.brainDrainTippingPoint)));
    const economicCapacityMultiplier = Math.max(0.5, 1 - oldBrainDrainAccumulated / config.brainDrainEconomicImpactScale);

    // Calculate effective tax collection
    const effectiveTaxIntegrity = applySystemicDeterrence(oldTaxIntegrity, oldRuleOfLawIndex, config.scalars.judicialDeterrenceAlpha);
    const taxLeakage = (100 - effectiveTaxIntegrity) / 100;
    const effectiveTaxCollectionRate = oldTaxRate * (1 - taxLeakage) * economicCapacityMultiplier;
    
    // Treasury accumulates based on the effective tax collection multiplied by time step (dt)
    const treasuryDelta = effectiveTaxCollectionRate * dt;

    // Calculate healthcare investment
    const effectiveProcurementFairness = applySystemicDeterrence(oldProcurementFairness, oldRuleOfLawIndex, config.scalars.judicialDeterrenceAlpha);
    const procurementLeakage = (100 - effectiveProcurementFairness) / 100;
    const currentHealthcareInvestmentRate = oldHealthcareFunding * (1 - procurementLeakage);

    // Calculate education investment
    const effectiveEducationIntegrity = applySystemicDeterrence(oldEducationIntegrity, oldRuleOfLawIndex, config.scalars.judicialDeterrenceAlpha);
    const educationLeakage = (100 - effectiveEducationIntegrity) / 100;
    const currentEducationInvestmentRate = oldEducationFunding * (1 - educationLeakage);

    // Calculate infrastructure investment
    const effectiveInfrastructureIntegrity = applySystemicDeterrence(oldInfrastructureIntegrity, oldRuleOfLawIndex, config.scalars.judicialDeterrenceAlpha);
    const infrastructureLeakage = (100 - effectiveInfrastructureIntegrity) / 100;
    const currentInfrastructureInvestmentRate = oldInfrastructureFunding * (1 - infrastructureLeakage);

    // Calculate oversight investment
    const effectiveOversightIndependence = applySystemicDeterrence(oldOversightIndependence, oldRuleOfLawIndex, config.scalars.judicialDeterrenceAlpha);
    const oversightLeakage = (100 - effectiveOversightIndependence) / 100;
    const currentOversightInvestmentRate = oldOversightFunding * (1 - oversightLeakage);

    // Apply universal decay to all stocks
    const newStocks = {};
    for (const stockName in stocks) {
        const oldVal = stocks[stockName];
        const annualDecay = decayRates[stockName] || 0;
        const monthlyDecay = convertAnnualToMonthlyRate(annualDecay);
        newStocks[stockName] = oldVal - (oldVal * monthlyDecay);
    }
    
    // Add non-decay flows to the newly decayed stocks and bound them
    newStocks.treasuryBalance = Math.max(0, newStocks.treasuryBalance + treasuryDelta);
    newStocks.healthcareCapacity = Math.max(0, Math.min(100, newStocks.healthcareCapacity + currentHealthcareInvestmentRate * dt * config.healthcareInvestmentMultiplier));
    newStocks.educationCapacity = Math.max(0, Math.min(100, newStocks.educationCapacity + currentEducationInvestmentRate * dt * config.educationInvestmentMultiplier));
    newStocks.infrastructureQuality = Math.max(0, Math.min(100, newStocks.infrastructureQuality + currentInfrastructureInvestmentRate * dt * config.infrastructureInvestmentMultiplier));
    newStocks.oversightCapacity = Math.max(0, Math.min(100, newStocks.oversightCapacity + currentOversightInvestmentRate * dt * config.oversightInvestmentMultiplier));
    newStocks.ruleOfLawIndex = Math.max(0, Math.min(100, newStocks.ruleOfLawIndex + currentJudicialInvestmentRate * dt * config.judicialInvestmentMultiplier));
    newStocks.brainDrainAccumulated = Math.max(0, Math.min(100, oldBrainDrainAccumulated + brainDrainRate * dt));

    const newFlows = {
        currentTaxCollectionRate: effectiveTaxCollectionRate,
        currentGdpGrowthRate: flows.currentGdpGrowthRate, // Unchanged for now
        currentHealthcareInvestmentRate: currentHealthcareInvestmentRate,
        currentEducationInvestmentRate: currentEducationInvestmentRate,
        currentInfrastructureInvestmentRate: currentInfrastructureInvestmentRate,
        currentOversightInvestmentRate: currentOversightInvestmentRate,
        currentJudicialInvestmentRate: currentJudicialInvestmentRate
    };

    // Calculate derived effective outputs
    // The dependency cap applies only to the usable output of the stock, not its accumulation.
    const healthcareEffectiveOutput = newStocks.healthcareCapacity * Math.min(1.0, newStocks.infrastructureQuality / 60);
    
    // This dampening is a continuous curve (not a hard proportional ceiling like Healthcare). 
    // It avoids discontinuous jumps even as election integrity approaches 0.
    const oversightEffectiveIndependence = newStocks.oversightCapacity * Math.pow(newOperativePolicies.electionIntegrityTarget / 100, config.scalars.oversightDampeningAlpha);
    const systemicDeterrenceFactor = Math.pow(newStocks.ruleOfLawIndex / 100, config.scalars.judicialDeterrenceAlpha);

    // New Composite Indices
    let economicVitality = 0;
    if (oldTaxRate > 0) {
        economicVitality = Math.max(0, Math.min(100, 100 * (effectiveTaxCollectionRate / oldTaxRate)));
    }
    const infraAndServicesIndex = (healthcareEffectiveOutput + newStocks.educationCapacity + newStocks.infrastructureQuality) / 3;
    const governanceIndex = newStocks.ruleOfLawIndex; // Direct passthrough for now

    const humanOutputScore = config.humanOutputWeights.economic * economicVitality 
                           + config.humanOutputWeights.infraServices * infraAndServicesIndex 
                           + config.humanOutputWeights.governance * governanceIndex;

    const newDerived = {
        healthcareEffectiveOutput,
        oversightEffectiveIndependence,
        systemicDeterrenceFactor,
        economicVitality,
        infraAndServicesIndex,
        governanceIndex,
        humanOutputScore,
        stressIndex,
        brainDrainRate,
        economicCapacityMultiplier,
        leakages: {
            tax: taxLeakage,
            healthcare: procurementLeakage,
            education: educationLeakage,
            infrastructure: infrastructureLeakage,
            oversight: oversightLeakage,
            judicial: judicialLeakage
        }
    };

    // --- 3. Assemble and return brand-new state ---
    return {
        tick: currentTick + 1,
        operativePolicies: newOperativePolicies,
        stocks: newStocks,
        flows: newFlows,
        derived: newDerived
    };
}
