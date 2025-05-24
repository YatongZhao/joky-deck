import { getGearProjectDataFromLocalStorage } from "../localStorage";
import { initialGearProject } from "../../core/types";

export const preloadedGearProjectData = getGearProjectDataFromLocalStorage() || initialGearProject;
