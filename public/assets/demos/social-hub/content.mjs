export const STYLES=['轻松治愈','专业实用','活泼有趣'];
export function emptyContent(){return {settings:{topic:'',platform:'小红书',style:'轻松治愈'},draft:{title:'',body:''},publish:{title:'',body:''},generation:0};}
const formats={
  小红书:topic=>`${topic}\n\n把体验记下来，分享一个值得收藏的小细节。\n\n#${topic.replace(/\s/g,'')} #生活灵感`,
  抖音:topic=>`【开场 0–3 秒】关于${topic}，你最想知道什么？\n【主体 3–20 秒】用三个镜头记录准备、过程和最有感触的一刻。\n【结尾】在评论区聊聊你的体验。`,
  微信公众号:topic=>`导语：为什么聊${topic}？\n\n一、从一个具体场景说起\n记录观察与感受，让读者理解这次分享的背景。\n\n二、整理可借鉴的做法\n把体验拆成准备、实践与复盘。\n\n结语：把想法带回自己的日常。`,
  视频号:topic=>`口播主题：${topic}\n\n开场：今天想和大家分享一个小发现。\n画面：展示场景与细节，配上清晰字幕。\n收尾：如果你也有类似经历，欢迎一起交流。`,
  哔哩哔哩:topic=>`视频策划｜${topic}\n\n00:00 本期看点\n00:30 准备与背景\n02:00 实践过程与体验\n04:00 总结与建议\n\n弹幕互动：你还想看哪一个角度？`
};
export function generateDraft(settings,iteration=0){const topic=String(settings.topic??'').trim();if(!topic||topic.length>200)throw Error('请输入 1–200 字的创作主题');if(!formats[settings.platform])throw Error('请选择支持的平台');if(!STYLES.includes(settings.style))throw Error('请选择内容风格');
const intros={'轻松治愈':'放慢一点节奏，把注意力交给眼前的小事。','专业实用':'先明确目标，再整理步骤，最后记录值得改进的细节。','活泼有趣':'灵感上线！一起把这个想法变成今天的小惊喜。'};
const angles=['从一个小发现开始','换个角度，记录过程','把体验整理成一份清单'];
const title=`${topic}｜${angles[iteration%angles.length]}`;
return {title,body:`${intros[settings.style]}\n\n${formats[settings.platform](topic)}\n\n${['今天就从最容易完成的一步开始。','这一次，试着记录过程中的三个新发现。','留下一份自己的小结，下次再来看看变化。'][iteration%3]}`};}
export function transferDraft(content){if(!content.draft.title.trim()||!content.draft.body.trim())throw Error('请先填写标题和正文，再带入批量发布');return {...content,publish:{...content.draft}};}
export function normalizeContent(value){const fallback=emptyContent();if(!value||typeof value!=='object')return fallback;const textPair=p=>p&&typeof p.title==='string'&&p.title.length<=500&&typeof p.body==='string'&&p.body.length<=20000;return {settings:value.settings&&typeof value.settings.topic==='string'&&value.settings.topic.length<=200&&Object.hasOwn(formats,value.settings.platform)&&STYLES.includes(value.settings.style)?{...value.settings}:fallback.settings,draft:textPair(value.draft)?{...value.draft}:fallback.draft,publish:textPair(value.publish)?{...value.publish}:fallback.publish,generation:Number.isSafeInteger(value.generation)&&value.generation>=0?value.generation:0};}
