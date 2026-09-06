import assert from 'node:assert/strict';
import {eventAllowed} from '../src/home/events';
assert.equal(eventAllowed({},'arrival',1000000,false),true);
assert.equal(eventAllowed({},'arrival',1000000,true),false,'处理中不能插入事件');
assert.equal(eventAllowed({arrival:900000},'arrival',1000000,false),false,'同一事件五分钟内不重复');
assert.equal(eventAllowed({arrival:700000},'arrival',1000000,false),true,'冷却到期可再次触发');
assert.equal(eventAllowed({arrival:900000},'bedtime',1000000,false),true,'不同事件独立');
console.log('通过：事件冷却、忙碌拦截、到期恢复、不同事件独立。');
