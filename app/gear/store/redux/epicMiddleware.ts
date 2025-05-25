import { combineEpics, createEpicMiddleware } from 'redux-observable';
import { displayMatrixEpic } from './slices/displayMatrixSlice';
import { viewBoxEpic } from './slices/viewBoxSlice';
import { undoableEpic } from './undoableEpic';

export const rootEpic = combineEpics<any, any, any, any>(undoableEpic, displayMatrixEpic, viewBoxEpic);

export const epicMiddleware = createEpicMiddleware();
