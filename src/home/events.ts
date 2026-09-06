export type HomeEvent='arrival'|'bedtime';
export const eventLabels={arrival:'模拟回家',bedtime:'模拟到睡眠时间'};
export function eventAllowed(last:Partial<Record<HomeEvent,number>>,event:HomeEvent,now:number,busy:boolean):boolean{
 const previous=last[event];return !busy&&(typeof previous!=='number'||!Number.isFinite(previous)||now-previous>=300000);
}
