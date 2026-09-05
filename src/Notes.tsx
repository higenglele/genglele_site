import { useEffect, useState } from 'react';

const noteSeeds = [
  ['从一段对话开始：如何判断 AI 是否真正完成了用户需求', '把需求识别、完成情况与工具调用拆开，建立一条可以复核的判断链。', '用户说了什么，和用户想完成什么，并不总是一回事。一次回复看起来流畅，也不意味着任务已经完成。判断 AI 的表现，可以从明确需求、核对证据和记录未完成原因开始。'],
  ['AI 预标注之后，人工应该检查什么？', '让人工复核聚焦关键判断，而不是机械地接受模型建议。', 'AI 可以提供一个初始判断，但最终结果仍需要有清晰的依据。复核界面应同时保留原始对话、标注建议与修正入口，让每一次确认都有可追溯的证据。'],
  ['工具调用成功了，为什么用户的任务仍然没有完成', '区分执行状态与业务结果，让一次成功调用真正服务于用户目标。', '工具返回成功，只说明某个执行步骤完成。返回的信息是否正确、是否覆盖用户的要求、是否被完整传达，还需要分别检查。这些差异值得在产品流程中显式呈现。'],
  ['给 AI 留一个“不确定”：人工兜底应该怎样设计', '从判断边界出发，让无法确定的样本进入可处理的复核队列。', '当对话缺少上下文，或工具结果没有提供时，强行输出确定结论可能掩盖问题。允许记录不确定，并说明缺少的证据，能帮助下一位处理者继续完成判断。'],
  ['一条标注记录里，需要保留哪些信息', '把输入、判断和修正结果放到同一条可追溯的记录中。', '一个标签往往不足以解释一次判断。保留原始输入、适用规则和人工修正原因，才能在出现分歧时还原当时的上下文，而不是只看到一个孤立结果。'],
  ['从原型到验证：先跑通最小的标注流程', '用一条完整任务检查产品设计，再逐步扩展复杂场景。', '最小流程应能完成阅读输入、填写判断、补充原因和提交结果。它的价值是让团队尽早讨论真实操作中的问题，发现流程断点，再决定下一步投入。'],
  ['如何把一次错误判断，变成可复用的案例', '记录错误发生的条件，让复盘能够指导下一次改进。', '有用的错误案例需要说明当时看到了什么、为什么判断错误，以及正确结果的依据。按同一结构整理案例，后续才能比较不同版本在相同问题上的表现。'],
  ['研究笔记的价值：把产品判断写清楚', '保留问题、选择与验证过程，让一次实践留下可以回看的思路。', '记录不只是保存结论，也是在保存结论成立的条件。把假设与观察分开，把已经验证的结果与下一步设想分开，才能在场景变化时知道哪些判断需要重新检查。'],
];
export const notes = noteSeeds.map(([title, subtitle, summary], i) => ({ id: String(i + 1).padStart(2, '0'), title, subtitle, summary }));
const PAGE_SIZE = 4;

export function NotesList() {
  const [page, setPage] = useState(() => {
    const saved = Number(sessionStorage.getItem('notes-page'));
    return saved >= 1 && saved <= Math.ceil(notes.length / PAGE_SIZE) ? saved : 1;
  });
  const pages = Math.ceil(notes.length / PAGE_SIZE);
  function changePage(next: number) {
    setPage(next);
    sessionStorage.setItem('notes-page', String(next));
    document.getElementById('notes')?.scrollIntoView({ behavior: 'instant' });
  }
  return <section id="notes" className="research-notes" aria-labelledby="notes-title">
    <header className="notes-heading">
      <h2 id="notes-title">AI 研究笔记</h2>
      <div className="notes-subheading">
        <p>Exploring AI trends, technologies, and product innovations.</p>
        <nav className="notes-pagination" aria-label="研究笔记分页">
          {Array.from({ length: pages }, (_, i) => i + 1).map(n => <button key={n} aria-label={`第 ${n} 页`} aria-current={n === page ? 'page' : undefined} onClick={() => changePage(n)}>{n}</button>)}
          <button onClick={() => changePage(pages)} disabled={page === pages}>末页</button>
        </nav>
      </div>
      <p className="notes-demo-label">排版示例 · 正式研究笔记待更新</p>
    </header>
    <div className="notes-list">
      {notes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(note => <a className="note-row" href={`#notes/${note.id}`} key={note.id}>
        <h3>{note.title}</h3><span className="note-views">示例文章</span><p>{note.summary}</p>
      </a>)}
    </div>
  </section>;
}

export function NoteDetail({ id }: { id: string }) {
  const note = notes.find(n => n.id === id);
  useEffect(() => {
    const previous = document.title;
    document.title = note ? `${note.title} — 耿乐的研究笔记` : '文章未找到 — 耿乐';
    window.scrollTo(0, 0);
    return () => { document.title = previous; };
  }, [note]);
  return <div className="note-detail-page">
    <header className="article-topbar"><a className="article-brand" href="#home">↗ &nbsp; GENG LE <span>AI研究笔记</span></a><nav aria-label="文章页导航"><a href="#about">关于我</a><a href="#works">个人项目</a><a href="#notes">研究笔记</a><a href="#contact">合作联系</a></nav><a className="article-back" href="#notes">返回列表 ↗</a></header>
    {note ? <article className="note-article">
      <h1>{note.title}</h1><p className="article-subtitle">{note.subtitle}</p>
      <p className="article-meta">示例内容 · 用于预览阅读排版</p>
      <blockquote>{note.summary}</blockquote>
      <section><h2>一、从具体问题开始</h2><p>{note.summary}</p><p>先记录一条具体的对话，明确用户提出的任务、AI 给出的回答，以及判断时能够看到的上下文。不要急着给结果，先确认这条记录是否包含完成判断所需的信息。</p><p>以用户要求查询会议为例，回复中出现时间和地点，只能说明回答提供了相关信息。如果没有日历查询结果，就无法确认这些信息来自真实记录。此时需要保留判断边界，而不是默认回复正确。</p><p>这份示例围绕产品判断展开，展示正文段落、重点说明与章节之间的阅读节奏。正式笔记可以沿用这一结构，将问题、证据、方案和验证结果逐步展开。</p></section>
      <figure className="article-diagram"><span>01 / 理解输入</span><div>用户对话 <b>→</b> 需求识别 <b>→</b> 证据核对</div><figcaption>先明确判断对象，再检查支持结论的信息。</figcaption></figure>
      <section><h2>二、把不同判断分开记录</h2><p>是否满足需求、是否需要调用工具、工具是否调用成功，是三个不同的问题。它们可能互相影响，但不应该用同一个标签替代。</p><p>用户只是询问操作方法时，AI 可以直接解释步骤；用户希望系统替自己执行操作时，则需要继续核对执行记录。产品界面应帮助使用者分清这两种情况。</p><p>当工具没有调用时，需要记录未调用；当记录没有提供时，需要记录无法判断。两种状态对应不同的下一步，混在一起会让复核人员无法知道究竟缺少什么。</p><p>结果字段可以保持简洁，判断依据则应完整保留。阅读者既能快速找到结论，也能在出现疑问时回到原始信息。</p></section>
      <figure className="article-diagram"><span>02 / 形成判断</span><div>满足需求 <b>·</b> 未满足 <b>·</b> 不确定</div><figcaption>不确定是一种需要继续处理的状态。</figcaption></figure>
      <section><h2>三、让人工复核有明确的入口</h2><p>对于未满足需求的记录，备注应说明具体缺口，例如遗漏了一个要求、执行结果失败，或者回复与工具返回内容不一致。尽量避免只写“回答不好”这类难以继续处理的评价。</p><p>对于不确定的记录，可以说明缺失哪些信息。人工复核的任务由此变得明确：补充上下文、核对工具记录，或确认当前规则是否适用。</p><p>提交前保留修改入口，并提示必填字段。提交后应能回看原始输入与最终结果，使一条记录从阅读到交付形成完整过程。</p></section>
      <section><h2>四、用案例验证，而不是只看界面</h2><p>准备几种具有不同结果的示例：直接回答即可完成的任务、需要工具且调用成功的任务、调用失败的任务，以及证据不足的任务。逐条走完流程，观察每一步是否有明确的去向。</p><ol><li>检查字段是否能够表达真实情况。</li><li>检查未满足原因是否能帮助后续处理。</li><li>检查不确定样本是否进入人工复核。</li><li>检查提交后能否追溯输入与修正记录。</li></ol><p>以上是用于讨论流程的验证思路，不代表已经完成的实验结果。正式文章应补充实际样本范围、判断标准与观察结论，再决定可以对外表达哪些成果。</p></section>
      <figure className="article-diagram article-diagram-final"><span>03 / 完成闭环</span><div>判断 <b>→</b> 复核 <b>→</b> 提交 <b>→</b> 回看</div></figure>
      <section><h2>五、写在最后</h2><p>{note.subtitle}</p><p>一个清楚的流程，让使用者知道当前在判断什么、为什么这样判断，以及遇到无法确定的情况该如何继续。把这些细节写下来，就是这份研究笔记的起点。</p></section>
      <footer className="article-footer">本文为原创排版示例，非正式发布文章；未引用实际业务评测数据。<a href="#notes">← 返回 AI 研究笔记</a></footer>
    </article> : <main className="note-article"><h1>这篇笔记暂不存在</h1><a href="#notes">返回研究笔记列表</a></main>}
  </div>;
}
