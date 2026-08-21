import { tick } from './tick.js';

export function runSimulation(initialSimState, policyState, config, months, mode) {
    // mode is either "instant" or "timestepped"
    let current = initialSimState;
    let history = [];
    for (let i = 0; i < months; i++) {
        current = tick(current, policyState, config);
        if (mode === "timestepped") history.push(current);
    }
    return { finalState: current, history: mode === "timestepped" ? history : [current] };
}
