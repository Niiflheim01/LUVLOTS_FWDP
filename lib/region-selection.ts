// expo-router has no built-in "return a value from a pushed screen" pattern
// (params only flow forward), so RegionPicker reports its selection back to
// AddAddress through this tiny in-memory pub/sub instead of a real nav param.

export type RegionSelection = { region: string; city: string };

type Listener = (selection: RegionSelection) => void;

let listeners: Listener[] = [];

export function publishRegionSelection(selection: RegionSelection) {
  listeners.forEach((listener) => listener(selection));
}

export function onRegionSelected(listener: Listener) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}
