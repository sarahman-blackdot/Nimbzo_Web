export const defaultConfig = {
    dt: 1 / 12,
    defaultImplementationRate: 0.05,
    // Multipliers for scaling funding into capacity points. 
    // These are modeling assumptions, not empirically sourced figures.
    healthcareInvestmentMultiplier: 2.0,
    educationInvestmentMultiplier: 1.67,
    infrastructureInvestmentMultiplier: 3.33,
    oversightInvestmentMultiplier: 2.22,
    judicialInvestmentMultiplier: 1.78,
    // Brain drain parameters. These are illustrative/directional.
    // The ordering of weights (governance and economic dominating infrastructure) is literature-supported;
    // exact numbers are this model's own assumption.
    brainDrainMaxRate: 5.0, // illustrative ceiling, percent of economically-relevant population lost per year at full crisis level
    brainDrainSteepness: 0.15,
    brainDrainTippingPoint: 65,
    brainDrainStressWeights: { governance: 0.45, economic: 0.40, infraServices: 0.15 },
    brainDrainEconomicImpactScale: 50,
    scalars: {
        // Exponent controlling how sharply weak elections erode oversight independence.
        // Values close to 1 are nearly linear; higher values mean the penalty stays small
        // until elections get quite bad, then accelerates.
        oversightDampeningAlpha: 1.5,
        // Exponent controlling the systemic deterrence factor applied across all sectors.
        // This is deliberately milder than the Oversight exponent (1.5) because it applies
        // broadly across every sector at once; stacking a steep curve system-wide would be unrealistically punishing.
        judicialDeterrenceAlpha: 1.2
    },
    // These weights are WHR-inspired (economic strength, service quality, and governance/corruption 
    // all shown to meaningfully affect national wellbeing) but are illustrative, rescaled weights 
    // for this model's own 0–100 indices — not a literal reuse of the World Happiness Report's 
    // published regression coefficients, which apply to differently-scaled variables.
    humanOutputWeights: { 
        economic: 0.30, 
        infraServices: 0.35, 
        governance: 0.35 
    },
    topology: {
        dependencyMatrix: {
            healthcareCapacity: ["infrastructureQuality"]
        }
    },
    decayRates: {
        treasuryBalance: 0.03, // 3% annual decay (e.g., inflation/spoilage)
        nationalDebt: 0.02,    // 2% annual decay (e.g., natural inflation eroding real debt)
        healthcareCapacity: 0.06, // 6% annual institutional decay
        educationCapacity: 0.05, // 5% annual decay
        infrastructureQuality: 0.10, // 10% annual decay (physical roads/grids degrade faster)
        oversightCapacity: 0.05, // 5% annual institutional decay
        ruleOfLawIndex: 0.04 // 4% annual institutional decay (slow)
    }
};
