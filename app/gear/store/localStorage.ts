import { GearProjectData } from "../core/types";

export const getGearProjectDataFromLocalStorage = () => {
  const gearProjectData = localStorage.getItem('gearProjectData');
  return gearProjectData ? JSON.parse(gearProjectData) as GearProjectData : null;
};

export const setGearProjectDataToLocalStorage = (gearProjectData: GearProjectData) => {
  localStorage.setItem('gearProjectData', JSON.stringify(gearProjectData));
};

export const removeGearProjectDataFromLocalStorage = () => {
  localStorage.removeItem('gearProjectData');
};

removeGearProjectDataFromLocalStorage();
