import { combineEpics, createEpicMiddleware } from 'redux-observable';
import { displayMatrixEpic } from './slices/displayMatrixSlice';
import { viewBoxEpic } from './slices/viewBoxSlice';
import { undoableEpic } from './undoableEpic';
import { persistEpic } from './persist';

export const rootEpic = combineEpics<any, any, any, any>(undoableEpic, displayMatrixEpic, viewBoxEpic, persistEpic);

export const epicMiddleware = createEpicMiddleware();
