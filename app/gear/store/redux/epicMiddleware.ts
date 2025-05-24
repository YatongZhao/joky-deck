import { combineEpics, createEpicMiddleware } from 'redux-observable';
import { displayMatrixEpic } from './slices/displayMatrixSlice';
import { viewBoxEpic } from './slices/viewBoxSlice';

const rootEpic = combineEpics<any, any, any, any>(displayMatrixEpic, viewBoxEpic);

export const epicMiddleware = createEpicMiddleware();

epicMiddleware.run(rootEpic);
