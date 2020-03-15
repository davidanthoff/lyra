import {ActionCreators as historyActions} from 'redux-undo';
import * as vega from 'vega';
import { addMark } from './actions/markActions';
import { createScene } from './actions/sceneActions';
import {store as initialStore} from './store';
import { Mark } from './store/factory/Mark';
import { Scene } from './store/factory/marks/Scene';
import * as dsUtils from './util/dataset-utils';
import {Pipeline} from './store/factory/Pipeline';
import {Dataset} from './store/factory/Dataset';
import {addPipeline} from './actions/pipelineActions';

require('../scss/app.scss');

// Additional requires to polyfill + browserify package.
require('array.prototype.find');
require('string.prototype.startswith');
require('./transforms');

// Initialize the Redux store
const store = (global as any).store = initialStore;

// Initialize the Model.
const ctrl = ((global as any).ctrl = require('./ctrl'));

// Set up the listeners that connect the ctrl to the store
const listeners = require('./store/listeners');

// Bind the listener that will flow changes from the redux store into Vega.
store.subscribe(listeners.createStoreListener(store, ctrl));

// Initializes the Lyra ctrl with a new Scene primitive.
store.dispatch(
  createScene(Scene())
);

store.dispatch(addMark(Mark('group', {_parent: 1})));

import './components';

store.dispatch(historyActions.clearHistory());

// if recording state changes (e.g. to load known states for user testing),
// do not record intialization actions (see store/replay.ts)
if (window.location.search.indexOf('record') > -1) {
  localStorage.clear();
  console.log('clear');
}

(global as any).vega = vega;

(global as any).addData = (name: string, data: string) => {
  const parsed = dsUtils.parseRaw(data);

  const values = parsed.values;

  const pipeline = Pipeline({name});

  const ds = Dataset({
        name: name,
        format: parsed.format,
        _schema: dsUtils.schema(values)
      });

  addPipeline(pipeline, ds, values)(store.dispatch);
}

(global as any).getVegaSpec = () => {
  return ctrl.export()
}
