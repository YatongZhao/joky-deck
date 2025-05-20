import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';

import gearsReducer from './slices/gearsSlice';
import moduleReducer from './slices/moduleSlice';
import displayMatrixReducer from './slices/displayMatrixSlice';
import viewBoxReducer from './slices/viewBoxSlice';
import undoManagerReducer from './slices/undoManagerSlice';
import editorMachineReducer from './slices/editorMachineSlice';
import { gearProjectDataToRootState, persistStore } from './persist';
import { getGearProjectDataFromLocalStorage } from '../localStorage';
import { initialGearProject } from '../../core/types';

const gearProjectData = getGearProjectDataFromLocalStorage();
const preloadedState = gearProjectDataToRootState(gearProjectData ?? initialGearProject) as unknown;

export const store = configureStore({
  reducer: {
    gears: gearsReducer,
    module: moduleReducer,
    displayMatrix: displayMatrixReducer,
    viewBox: viewBoxReducer,
    undoManager: undoManagerReducer,
    editorMachine: editorMachineReducer,
  },
  preloadedState,
});
persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

export type AppThunk = ThunkAction<void, RootState, unknown, Action>;
