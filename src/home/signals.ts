import type {Device} from './state';
export type Signal='on'|'off'|'adjust'|'unchanged'|'failed';
export const signalLabels={on:'已开启',off:'已关闭',adjust:'已调整',unchanged:'无变动',failed:'未执行'};
export function deviceSignal(before:Device|undefined,after:Device|undefined,ok=true):Signal{
 if(!ok||!before||!after)return 'failed';
 if(before.on!==after.on)return after.on?'on':'off';
 if(before.value!==after.value)return 'adjust';
 return 'unchanged';
}
