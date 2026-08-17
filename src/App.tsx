import { useRef } from "react";
import {
  motion,
  MotionValue,
  useInView,
  useScroll,
  useTransform,
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
  showAsterisk?: boolean;
};

function WordsPullUp({ text, className = "", showAsterisk = false }: WordsPullUpProps) {
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
            {showAsterisk && index === words.length - 1 && (
              <span className="absolute -right-[0.3em] top-[0.65em] text-[0.31em]">*</span>
            )}
          </motion.span>
          {index < words.length - 1 && <span>&nbsp;</span>}
        </span>
      ))}
    </span>
  );
}

type StyledSegment = {
  text: string;
  className: string;
};

function WordsPullUpMultiStyle({ segments }: { segments: StyledSegment[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const words = segments.flatMap((segment) =>
    segment.text.split(" ").map((word) => ({ word, className: segment.className })),
  );

  return (
    <div ref={ref} className="inline-flex flex-wrap justify-center">
      {words.map(({ word, className }, index) => (
        <span key={`${word}-${index}`} className="inline-block overflow-hidden pb-[0.08em]">
          <motion.span
            className={`inline-block ${className}`}
            initial={{ y: 20, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
            transition={{ duration: 0.8, delay: index * 0.08, ease: easeOut }}
          >
            {word}
          </motion.span>
          {index < words.length - 1 && <span>&nbsp;</span>}
        </span>
      ))}
    </div>
  );
}

function AnimatedLetter({
  character,
  progress,
  range,
}: {
  character: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.2, 1]);

  return (
    <motion.span style={{ opacity, whiteSpace: "pre" }}>
      {character}
    </motion.span>
  );
}

function ScrollRevealParagraph({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.8", "end 0.2"],
  });
  const characters = Array.from(text);

  return (
    <p ref={ref} className="mx-auto mt-12 max-w-2xl text-xs leading-relaxed text-primary sm:text-sm md:text-base">
      {characters.map((character, index) => {
        const characterProgress = index / characters.length;
        return (
          <AnimatedLetter
            key={`${character}-${index}`}
            character={character}
            progress={scrollYProgress}
            range={[
              Math.max(0, characterProgress - 0.1),
              Math.min(1, characterProgress + 0.05),
            ]}
          />
        );
      })}
    </p>
  );
}

const projectCards = [
  {
    number: "01",
    icon: WORK_ICONS[0],
    items: ["项目背景待补充", "我的职责待补充", "产品过程待补充", "结果复盘待补充"],
  },
  {
    number: "02",
    icon: WORK_ICONS[1],
    items: ["问题定义待补充", "方案设计待补充", "验证结论待补充"],
  },
  {
    number: "03",
    icon: WORK_ICONS[2],
    items: ["用户场景待补充", "迭代过程待补充", "项目结果待补充"],
  },
];

function ProjectCard({
  card,
  index,
  isInView,
}: {
  card: (typeof projectCards)[number];
  index: number;
  isInView: boolean;
}) {
  return (
    <motion.article
      className="flex min-h-[360px] flex-col justify-between rounded-2xl bg-[#212121] p-5 sm:min-h-[400px] lg:min-h-0"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.75, delay: index * 0.15, ease: cardEase }}
    >
      <div>
        <img
          src={card.icon}
          alt=""
          className="h-10 w-10 rounded-lg object-cover sm:h-12 sm:w-12"
        />

        <div className="mt-8 flex items-baseline justify-between gap-4">
          <h3 className="text-lg font-normal text-[#E1E0CC]">项目待补充。</h3>
          <span className="text-xs text-gray-500">({card.number})</span>
        </div>

        <ul className="mt-6 space-y-3">
          {card.items.map((item) => (
            <li key={item} className="flex items-start gap-2 text-xs leading-relaxed text-gray-400">
              <Check size={14} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <span className="mt-8 inline-flex items-center gap-2 text-xs text-primary/70" aria-disabled="true">
        内容整理中
        <ArrowRight size={14} className="-rotate-45" aria-hidden="true" />
      </span>
    </motion.article>
  );
}

function Hero() {
  const navItems = [
    ["我的故事", "#about"],
    ["产品方法", "#about"],
    ["个人作品", "#works"],
    ["文章记录", "#works"],
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
              className="text-[26vw] font-medium leading-[0.85] tracking-[-0.07em] text-[#E1E0CC] sm:text-[24vw] md:text-[22vw] lg:text-[20vw] xl:text-[19vw] 2xl:text-[20vw]"
              aria-label="耿乐"
            >
              <WordsPullUp text="耿乐" showAsterisk />
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
              查看作品
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
  const paragraph =
    "我相信，AI产品的价值不在于展示技术，而在于解决真实问题。我会从用户需求出发，在模型能力、业务目标与产品体验之间寻找平衡，并通过原型和反馈持续验证判断。";

  return (
    <section id="about" className="bg-black px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-6xl rounded-[2rem] bg-[#101010] px-6 py-20 text-center sm:px-10 sm:py-28 md:px-16">
        <p className="text-[10px] text-primary sm:text-xs">AI产品 · 产品实践</p>

        <div className="mx-auto mt-8 max-w-3xl text-3xl leading-[0.95] text-[#E1E0CC] sm:text-4xl sm:leading-[0.9] md:text-5xl lg:text-6xl xl:text-7xl">
          <WordsPullUpMultiStyle
            segments={[
              { text: "我是耿乐，", className: "font-normal" },
              { text: "一名AI产品经理。", className: "font-serif italic" },
              {
                text: "我专注于需求识别、产品设计与价值验证。",
                className: "font-normal",
              },
            ]}
          />
        </div>

        <ScrollRevealParagraph text={paragraph} />
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
        <header className="mb-12 max-w-4xl text-xl font-normal sm:mb-16 sm:text-2xl md:text-3xl lg:text-4xl">
          <div className="text-[#E1E0CC]">
            <WordsPullUpMultiStyle
              segments={[{ text: "用作品呈现判断、过程与结果。", className: "font-normal" }]}
            />
          </div>
          <div className="mt-1 text-gray-500">
            <WordsPullUpMultiStyle
              segments={[{ text: "内容正在整理，保持真实，稍后见。", className: "font-normal" }]}
            />
          </div>
        </header>

        <div ref={cardsRef} className="grid grid-cols-1 gap-3 sm:gap-2 md:grid-cols-2 md:gap-1 lg:h-[480px] lg:grid-cols-4">
          <motion.article
            className="relative min-h-[420px] overflow-hidden rounded-2xl md:min-h-[440px] lg:min-h-0"
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
              <p className="text-base text-[#E1E0CC]">这里放个人作品影像。</p>
              <p className="mt-1 text-[10px] text-primary/60">当前视频仅作为视觉占位，后续替换</p>
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

        <div id="contact" className="mt-20 flex flex-col gap-4 border-t border-white/10 pt-8 text-primary sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-primary/50">Contact</p>
            <p className="mt-3 max-w-xl text-lg sm:text-xl">如果你也在推动AI产品落地，欢迎和我交流。</p>
          </div>
          <p className="text-xs text-gray-500">微信与邮箱待补充</p>
        </div>
      </div>
    </section>
  );
}

export default function App() {
  return (
    <main className="bg-black">
      <Hero />
      <About />
      <Works />
    </main>
  );
}
