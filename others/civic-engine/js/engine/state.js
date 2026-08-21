export function createInitialPolicyState() {
    return {
        targets: {
            taxRateTarget: 16.0,
            taxCollectionIntegrityTarget: 35.0,
            customsIntegrityTarget: 35.0,
            healthcareFundingPctTarget: 4.0,
            procurementFairnessTarget: 30.0,
            educationFundingPctTarget: 4.0,
            educationIntegrityTarget: 30.0,
            infrastructureFundingPctTarget: 4.0,
            infrastructureMaintenanceIntegrityTarget: 30.0,
            electionIntegrityTarget: 30.0,
            oversightFundingPctTarget: 3.0,
            oversightIndependenceIntegrityTarget: 30.0,
            judicialFundingPctTarget: 3.0,
            judicialIndependenceIntegrityTarget: 30.0
        }
    };
}

export function createInitialSimState() {
    return {
        tick: 0,
        operativePolicies: {
            taxRateTarget: 14.0, // starting slightly below target
            taxCollectionIntegrityTarget: 30.0, // starting below target
            customsIntegrityTarget: 30.0,
            healthcareFundingPctTarget: 3.5,
            procurementFairnessTarget: 25.0,
            educationFundingPctTarget: 3.5,
            educationIntegrityTarget: 25.0,
            infrastructureFundingPctTarget: 3.5,
            infrastructureMaintenanceIntegrityTarget: 25.0,
            electionIntegrityTarget: 25.0,
            oversightFundingPctTarget: 2.5,
            oversightIndependenceIntegrityTarget: 25.0,
            judicialFundingPctTarget: 2.5,
            judicialIndependenceIntegrityTarget: 25.0
        },
        stocks: {
            treasuryBalance: 20.0, // Percentage of a notional GDP=100
            nationalDebt: 60.0,    // Percentage of a notional GDP=100
            healthcareCapacity: 40.0,
            educationCapacity: 40.0,
            infrastructureQuality: 40.0,
            oversightCapacity: 40.0,
            ruleOfLawIndex: 40.0,
            brainDrainAccumulated: 0.0
        },
        flows: {
            currentTaxCollectionRate: 0.0,
            currentGdpGrowthRate: 0.0,
            currentHealthcareInvestmentRate: 0.0,
            currentEducationInvestmentRate: 0.0,
            currentInfrastructureInvestmentRate: 0.0,
            currentOversightInvestmentRate: 0.0,
            currentJudicialInvestmentRate: 0.0
        },
        derived: {
            healthcareEffectiveOutput: 0.0,
            oversightEffectiveIndependence: 0.0,
            systemicDeterrenceFactor: 0.0,
            economicVitality: 0.0,
            infraAndServicesIndex: 0.0,
            governanceIndex: 0.0,
            humanOutputScore: 0.0,
            stressIndex: 0.0,
            brainDrainRate: 0.0,
            economicCapacityMultiplier: 1.0
        }
    };
}
