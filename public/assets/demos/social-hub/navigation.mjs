export const views = ['accounts','publish','inbox','dashboard','ai'];
export function resolveView(hash=''){const key=hash.replace(/^#/,'');return views.includes(key)?key:'dashboard';}
export function acceptMessage(event,origin){return event.origin===origin && event.data?.type==='social-hub:navigate' && views.includes(event.data.view)?event.data.view:null;}
