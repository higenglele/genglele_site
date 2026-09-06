import { HomeApp } from "./home/HomeApp";
import { ProductPage } from "./home/ProductPage";
import { useEffect, useRef, useState } from "react";
import { NotesList, NoteDetail } from "./Notes";
import {
  motion,
  useInView,
} from "framer-motion";
import { ArrowRight, Check } from "lucide-react";

const HERO_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4";

const WORK_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_133058_0504132a-0cf3-4450-a370-8ea3b05c95d4.mp4";

const WORK_ICONS = [
  "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260405_171918_4a5edc79-d78f-4637-ac8b-53c43c220606.png&w=1280&q=85",
  "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260405_171741_ed9845ab-f5b2-4018-8ce7-07cc01823522.png&w=1280&q=85",
  "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260405_171809_f56666dc-c099-4778-ad82-9ad4f209567b.png&w=1280&q=85",
];

const easeOut = [0.16, 1, 0.3, 1] as const;
const cardEase = [0.22, 1, 0.36, 1] as const;

type WordsPullUpProps = {
  text: string;
  className?: string;
};

function WordsPullUp({ text, className = "" }: WordsPullUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const words = text.split(" ");

  return (
    <span ref={ref} className={`inline-flex flex-wrap justify-center ${className}`}>
      {words.map((word, index) => (
        <span key={`${word}-${index}`} className="inline-block overflow-visible">
          <motion.span
            className="relative inline-block"
            initial={{ y: 20, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
            transition={{ duration: 0.8, delay: index * 0.08, ease: easeOut }}
          >
            {word}
          </motion.span>
          {index < words.length - 1 && <span>&nbsp;</span>}
        </span>
      ))}
    </span>
  );
}

const OMII_COVER = "/omii-cover.png";

type ProjectCardData = {
  number: string;
  icon?: string;
  title?: string;
  subtitle?: string;
  cover?: string;
  href?: string;
  linkLabel?: string;
  items: string[];
};

const projectCards: ProjectCardData[] = [
  {
    number: "01",
    icon: WORK_ICONS[0],
    items: ["项目背景待补充", "我的职责待补充", "产品过程待补充", "结果复盘待补充"],
  },
  {
    number: "02",
    title: '栖居 · AI 家庭管家',
    subtitle: '从自然语言到家庭场景协同',
    cover: '/home-agent-cover.svg',
    href: '#home-product',
    linkLabel: '了解产品',
    items: ['Agent 理解需求并提出设备计划', '确认后执行 · 明确偏好记忆', '手机 App 交互 Demo'],
  },
  {
    number: "03",
    title: "智能插件",
    subtitle: "AI 滑词工具 Omii",
    cover: OMII_COVER,
    href: "https://higenglele.github.io/omii/",
    linkLabel: "查看项目",
    items: [
      "选中文字按 ⌘E，浮窗出现在光标旁",
      "解释 · 总结 · 翻译 · 润色 · 续写",
      "接任意 OpenAI 兼容接口，本地模型也行",
    ],
  },
];

function ProjectCard({
  card,
  index,
  isInView,
}: {
  card: ProjectCardData;
  index: number;
  isInView: boolean;
}) {
  const isPublished = Boolean(card.href);

  return (
    <motion.article
      className="project-hover-card group flex min-h-[360px] flex-col justify-between rounded-2xl bg-[#212121] p-5 sm:min-h-[400px] lg:min-h-0"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.75, delay: index * 0.15, ease: cardEase }}
    >
      <div>
        {isPublished ? (
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-base leading-snug text-[#E1E0CC]">
              {card.title}
              <span className="block text-gray-400">{card.subtitle}</span>
            </h3>
            <span className="shrink-0 rounded-lg bg-primary/15 px-2.5 py-1 text-[11px] font-medium text-primary">
              {card.number}
            </span>
          </div>
        ) : (
          <>
            <img
              src={card.icon}
              alt=""
              className="h-10 w-10 rounded-lg object-cover sm:h-12 sm:w-12"
            />

            <div className="mt-8 flex items-baseline justify-between gap-4">
              <h3 className="text-lg font-normal text-[#E1E0CC]">项目待补充。</h3>
              <span className="text-xs text-gray-500">({card.number})</span>
            </div>
          </>
        )}

        {card.cover ? (
          <div className="mt-5 overflow-hidden rounded-xl border border-white/[0.07] bg-black">
            <img
              src={card.cover}
              alt=""
              loading="lazy"
              className="aspect-[16/10] w-full object-cover object-top opacity-90 transition-opacity duration-500 group-hover:opacity-100"
            />
          </div>
        ) : null}

        <ul className={card.cover ? "mt-5 space-y-2.5" : "mt-6 space-y-3"}>
          {card.items.map((item) => (
            <li key={item} className="flex items-start gap-2 text-xs leading-relaxed text-gray-400">
              <Check size={14} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {isPublished ? (
        <a
          href={card.href}
          target={card.href?.startsWith('#') ? undefined : '_blank'}
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center gap-2 text-xs text-primary transition-opacity hover:opacity-70"
        >
          {card.linkLabel ?? "查看项目"}
          <ArrowRight size={14} className="-rotate-45" aria-hidden="true" />
        </a>
      ) : (
        <span className="mt-8 inline-flex items-center gap-2 text-xs text-primary/70" aria-disabled="true">
          内容整理中
          <ArrowRight size={14} className="-rotate-45" aria-hidden="true" />
        </span>
      )}
    </motion.article>
  );
}

function Hero() {
  const navItems = [
    ["我的故事", "#about"],
    ["工作经历", "#about"],
    ["个人项目", "#works"],
    ["文章记录", "#notes"],
    ["合作联系", "#contact"],
  ];

  return (
    <section id="home" className="h-screen bg-black p-4 md:p-6">
      <div className="relative h-full overflow-hidden rounded-2xl md:rounded-[2rem]">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={HERO_VIDEO}
          autoPlay
          loop
          muted
          playsInline
          aria-hidden="true"
        />
        <div className="noise-overlay pointer-events-none absolute inset-0 opacity-[0.7] mix-blend-overlay" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />

        <nav className="absolute left-1/2 top-0 z-20 -translate-x-1/2" aria-label="主导航">
          <div className="flex items-center gap-3 whitespace-nowrap rounded-b-2xl bg-black px-4 py-2 sm:gap-6 md:gap-12 md:rounded-b-3xl md:px-8 lg:gap-14">
            {navItems.map(([label, href]) => (
              <a
                key={label}
                href={href}
                className="text-[10px] transition-colors sm:text-xs md:text-sm"
                style={{ color: "rgba(225, 224, 204, 0.8)" }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.color = "#E1E0CC";
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.color = "rgba(225, 224, 204, 0.8)";
                }}
              >
                {label}
              </a>
            ))}
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 z-10 grid grid-cols-12 items-end gap-y-5 px-3 pb-4 sm:px-5 sm:pb-5 md:px-8 md:pb-7">
          <div className="col-span-12 lg:col-span-8">
            <h1
              className="text-[22vw] font-medium leading-[0.82] tracking-[-0.07em] text-[#E1E0CC] sm:text-[20vw] md:text-[18vw] lg:text-[min(16vw,28vh)]"
              aria-label="耿乐"
            >
              <WordsPullUp text="耿乐" />
            </h1>
          </div>

          <div className="col-span-12 flex flex-col items-start gap-4 pb-1 lg:col-span-4 lg:pl-4">
            <motion.p
              className="max-w-md text-left text-xs leading-[1.2] text-primary/70 sm:text-sm md:text-base"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: easeOut }}
            >
              我是一名AI产品经理，关注需求识别、产品设计与价值验证，希望把复杂的AI能力转化为清楚、可用的产品体验。
            </motion.p>

            <motion.a
              href="#works"
              className="group inline-flex items-center gap-2 rounded-full bg-primary py-1.5 pl-5 pr-1.5 text-sm font-medium text-black transition-all hover:gap-3 sm:text-base"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7, ease: easeOut }}
            >
              查看项目
              <span className="grid h-9 w-9 place-items-center rounded-full bg-black text-primary transition-transform group-hover:scale-110 sm:h-10 sm:w-10">
                <ArrowRight size={18} aria-hidden="true" />
              </span>
            </motion.a>
          </div>
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="about-section" aria-labelledby="about-title">
      <div className="about-layout">
        <header className="about-profile">
          <p className="about-eyebrow">GENG LE · AI PRODUCT MANAGER</p>
          <h2 id="about-title">About Me</h2>
          <div className="about-identity">
            <span className="about-caption">关于我</span>
            <p className="about-name">耿乐<span>AI 产品经理</span></p>
            <p className="about-intro">3 年 AI 产品经验，专注 Agent、智能工作流与数据质量。</p>
            <p className="about-philosophy">从真实业务问题出发，通过原型验证与效果评测，将 AI 能力转化为可用的产品。</p>
          </div>
        </header>

        <ol className="about-experiences" aria-label="工作经历">
          <li className="about-experience">
            <span className="experience-number" aria-hidden="true">01</span>
            <article>
              <header className="experience-header">
                <h3>腾讯云雀信息技术有限公司<span>AI 产品经理</span></h3>
                <p className="experience-date"><time dateTime="2025-07">2025.07</time> — <time dateTime="2026-07">2026.07</time></p>
              </header>
              <p className="experience-focus">智能标注平台 · 数据质量</p>
              <p className="experience-description">负责智能标注平台的功能开发与优化，通过用户调研和小样本实验，推动 AI 预标注、人工校验与自动质量评估落地，提升大规模数据生产的效率与质量。</p>
              <div className="experience-results">
                <p><strong>约 8 倍</strong><span>同批数据下，标注效率较纯人工提升</span></p>
                <p><strong>60% → 95%</strong><span>质量评估覆盖率</span></p>
              </div>
            </article>
          </li>
          <li className="about-experience">
            <span className="experience-number" aria-hidden="true">02</span>
            <article>
              <header className="experience-header">
                <h3>湖北升思科技股份有限公司<span>AI 产品经理</span></h3>
                <p className="experience-date"><time dateTime="2023-07">2023.07</time> — <time dateTime="2025-07">2025.07</time></p>
              </header>
              <p className="experience-focus">新人孵化平台 · AI 选题策划 Agent</p>
              <p className="experience-description">围绕新媒体运营的培训与策划瓶颈，负责新人账号孵化陪跑管理平台和 AI 选题策划 Agent。通过能力画像、知识库检索与选题工作流，将运营经验沉淀为可复用的产品能力，并持续通过 A/B 对比验证效果。</p>
              <div className="experience-results">
                <p><strong>缩短约 50%</strong><span>新人独立上岗周期</span></p>
                <p><strong>提升约 3 倍</strong><span>Agent 辅助选题下，人均可支撑账号数</span></p>
              </div>
            </article>
          </li>
        </ol>
      </div>
    </section>
  );
}

function Works() {
  const cardsRef = useRef<HTMLDivElement>(null);
  const cardsInView = useInView(cardsRef, { once: true, margin: "-100px" });

  return (
    <section id="works" className="relative min-h-screen overflow-hidden bg-black px-4 py-20 sm:px-6 sm:py-28">
      <div className="bg-noise pointer-events-none absolute inset-0 opacity-[0.15]" />

      <div className="relative mx-auto max-w-7xl">
        <header className="mb-10 text-left sm:mb-12">
          <h2 className="text-3xl font-normal leading-tight tracking-tight text-[#E1E0CC] sm:text-4xl lg:text-5xl">
            AI Native 产品探索
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#a3a3a3] sm:mt-6 sm:text-lg">
            From AI Models to Intelligent Life: Transforming Foundation Models into Real-World AI Products
          </p>
        </header>

        <div ref={cardsRef} className="project-hover-grid grid grid-cols-1 gap-3 sm:gap-2 md:grid-cols-2 md:gap-1 lg:min-h-[480px] lg:grid-cols-4">
          <motion.article
            className="project-hover-card relative min-h-[420px] overflow-hidden rounded-2xl md:min-h-[440px] lg:min-h-0"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={cardsInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.75, ease: cardEase }}
          >
            <video
              className="absolute inset-0 h-full w-full object-cover"
              src={WORK_VIDEO}
              autoPlay
              loop
              muted
              playsInline
              aria-hidden="true"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />
            <div className="absolute inset-x-0 bottom-0 p-5">
            </div>
          </motion.article>

          {projectCards.map((card, index) => (
            <ProjectCard
              key={card.number}
              card={card}
              index={index + 1}
              isInView={cardsInView}
            />
          ))}
        </div>

        <NotesList />

        <section id="contact" className="contact-section" aria-labelledby="contact-title">
          <div className="contact-details">
            <p className="contact-eyebrow">CONTACT · 合作联系</p>
            <h2 id="contact-title">合作联系</h2>
            <p className="contact-intro">如果你也在推动 AI 产品落地，欢迎和我交流。</p>
            <dl className="contact-list">
              <div><dt>姓名</dt><dd>耿乐</dd></div>
              <div><dt>电话</dt><dd><a href="tel:19503429328">195 0342 9328</a></dd></div>
              <div><dt>邮箱</dt><dd><a href="mailto:hi@genglele.com">hi@genglele.com</a></dd></div>
            </dl>
          </div>
          <figure className="contact-wechat">
            <a href="/wechat-qr.jpg" target="_blank" rel="noopener noreferrer" aria-label="打开耿乐的微信二维码原图（新窗口）">
              <img src="/wechat-qr.jpg" alt="耿乐的微信二维码，扫码添加好友" width="888" height="1131" loading="lazy" />
            </a>
            <figcaption>微信联系<span>扫码添加好友 · 点击查看原图</span></figcaption>
          </figure>
        </section>
      </div>
    </section>
  );
}

export default function App() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const update = () => setHash(window.location.hash);
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);
  useEffect(() => {
    if (!hash.startsWith('#notes/')) {
      requestAnimationFrame(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'instant' }));
    }
  }, [hash]);
  if (hash === '#home-agent') return <HomeApp />;
  if (hash === '#home-product') return <ProductPage />;
  if (hash.startsWith('#notes/')) return <NoteDetail id={hash.slice(7)} />;
  return (
    <main className="bg-black">
      <Hero />
      <About />
      <Works />
    </main>
  );
}
