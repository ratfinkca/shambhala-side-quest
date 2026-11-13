import test from 'node:test';
import assert from 'node:assert/strict';
import {renderControlSettings} from '../src/control-settings-view.js';

test('settings expose the saved steering hand',()=>{
 const html=renderControlSettings({mode:'stick',hand:'right'});
 assert.match(html,/data-control-setting="hand"/);assert.match(html,/<option value="right" selected>Right hand/);
});
test('old settings still start with tap and left-hand layout rather than opting into joystick',()=>{
 const html=renderControlSettings();
 assert.match(html,/<option value="tap" selected>Tap \/ click/);assert.match(html,/<option value="left" selected>Left hand/);
 assert.match(html,/movement-sensitivity[^>]+disabled/);
});
