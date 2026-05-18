/* THE VELVET OATH — main app */
/* Loads after particles.jsx and flipbook.jsx */

const { useState: useS, useEffect: useE, useRef: useR } = React;

/* ─────────── SVG sigils & icons ─────────── */
const Sigil = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
    <path d="M12 2 L14.5 9 L22 12 L14.5 15 L12 22 L9.5 15 L2 12 L9.5 9 Z" />
    <circle cx="12" cy="12" r="2.5" />
  </svg>
);

const CornerOrnament = ({ className }) => (
  <svg className={className} viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="1">
    <path d="M2 30 C 2 14, 14 2, 30 2" />
    <path d="M8 30 C 8 18, 18 8, 30 8" />
    <circle cx="14" cy="14" r="2" />
    <path d="M2 30 L 6 30 M30 2 L 30 6" />
    <path d="M14 14 L 22 22 M 22 22 L 28 22 M 22 22 L 22 28" />
  </svg>
);

const SectionDivider = () => (
  <div className="section-divider" aria-hidden="true">
    <span className="line"></span>
    <svg className="sigil" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
      <path d="M12 2 L14 9 L22 12 L14 15 L12 22 L10 15 L2 12 L10 9 Z" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
    </svg>
    <span className="line"></span>
  </div>
);

/* Edition icons */
const IconHardcover = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h13a2 2 0 0 1 2 2v14H6a2 2 0 0 1-2-2V4z"/>
    <path d="M19 20H6a2 2 0 0 0 0-4h13"/>
    <path d="M9 8h6 M9 11h6"/>
  </svg>
);
const IconPaperback = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 5l9-2 9 2v14l-9 2-9-2V5z"/>
    <path d="M12 3v18"/>
  </svg>
);
const IconEbook = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2"/>
    <path d="M9 6h6 M9 10h6 M9 14h4"/>
  </svg>
);
const IconAudio = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 0 1 18 0v6a2 2 0 0 1-2 2h-2v-7h4"/>
    <path d="M3 18v-6h4v7H5a2 2 0 0 1-2-2z"/>
  </svg>
);

/* Bottom nav icons */
const IconHome = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 11l9-8 9 8v9a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2v-9z"/></svg>);
const IconBook = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h11a3 3 0 0 1 3 3v14H7a3 3 0 0 1-3-3V4z"/><path d="M4 18a3 3 0 0 1 3-3h11"/></svg>);
const IconUsers = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-3 3-5 6-5s6 2 6 5"/><path d="M14 20c0-2 2-4 5-4"/></svg>);
const IconScroll = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 4h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2-2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><path d="M8 8h8 M8 12h8 M8 16h5"/></svg>);
const IconCart = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 4h2l2.5 12h11l2-8H6"/><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/></svg>);

/* ─────────── Reveal-on-scroll ─────────── */
function useReveal() {
  useE(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }}),
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* ─────────── Top nav scroll state ─────────── */
function useNavScroll() {
  const [scrolled, setScrolled] = useS(false);
  useE(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return scrolled;
}

/* ─────────── Active section tracker (for mobile nav) ─────────── */
function useActiveSection(ids) {
  const [active, setActive] = useS(ids[0]);
  useE(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.2, 0.5, 1] }
    );
    ids.forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [ids.join(",")]);
  return active;
}

/* ─────────── Nav ─────────── */
function TopNav() {
  const scrolled = useNavScroll();
  return (
    <nav className={"nav" + (scrolled ? " scrolled" : "")} aria-label="Hlavní navigace">
      <a className="brand" href="#hero">
        <Sigil className="sigil" />
        <span>Sametová přísaha</span>
      </a>
      <ul className="links">
        <li><a href="#about">O knize</a></li>
        <li><a href="#characters">Postavy</a></li>
        <li><a href="#world">Svět</a></li>
        <li><a href="#excerpt">Ukázka</a></li>
        <li><a href="#reviews">Ohlasy</a></li>
        <li><a href="#author">Autorka</a></li>
      </ul>
      <a className="btn btn-primary cta" href="#buy">
        Koupit knihu
        <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
      </a>
    </nav>
  );
}

function BottomNav() {
  const active = useActiveSection(["hero","about","characters","excerpt","buy"]);
  const items = [
    { id: "hero", label: "Úvod", Icon: IconHome },
    { id: "about", label: "Kniha", Icon: IconBook },
    { id: "characters", label: "Postavy", Icon: IconUsers },
    { id: "excerpt", label: "Ukázka", Icon: IconScroll },
    { id: "buy", label: "Koupit", Icon: IconCart },
  ];
  return (
    <nav className="bottom-nav" aria-label="Mobilní navigace">
      {items.map(({id, label, Icon}) => (
        <button
          key={id}
          className={active === id ? "active" : ""}
          onClick={() => document.getElementById(id)?.scrollIntoView({behavior: "smooth", block: "start"})}
          aria-label={label}
          aria-current={active === id ? "page" : undefined}
        >
          <span className="icon"><Icon /></span>
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}

/* ─────────── HERO ─────────── */
function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="hero-bg" />
      <window.Particles density={90} />
      <div className="container hero-grid">
        <div className="hero-copy reveal">
          <div className="eyebrow left">Mistrovský fantasy debut</div>
          <h1>
            Sametová <span className="accent">přísaha</span>
          </h1>
          <div className="author-line">A. Vale &nbsp;·&nbsp; Aravellská sága &nbsp;·&nbsp; Kniha první</div>
          <p className="pitch">
            Slova mají váhu krve. V říši, kde se přísahy vrývají rovnou do kůže,
            si jedna mladá runová písařka musí vybrat — zradit svůj cech,
            nebo nechat zhasnout město, které miluje.
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" href="#buy">
              Koupit knihu
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </a>
            <a className="btn btn-ghost" href="#excerpt">
              Přečíst ukázku
            </a>
          </div>
          <dl className="hero-meta">
            <div><span className="label">Vychází</span><span className="value">15. září 2026</span></div>
            <div><span className="label">Rozsah</span><span className="value">512 stran</span></div>
            <div><span className="label">Hodnocení</span><span className="value">★ 4,8 / 5</span></div>
          </dl>
        </div>
        <div className="hero-book reveal delay-2">
          <div className="hero-book-glow" />
          <div className="hero-book-inner">
            <img src="assets/cover.jpg" alt="Obálka knihy Sametová přísaha od A. Vale" />
          </div>
          <div className="hero-book-corners">
            <CornerOrnament className="tl" />
            <CornerOrnament className="tr" />
            <CornerOrnament className="bl" />
            <CornerOrnament className="br" />
          </div>
        </div>
      </div>
      <div className="scroll-cue" aria-hidden="true">Listujte níž</div>
    </section>
  );
}

/* ─────────── ABOUT ─────────── */
function About() {
  return (
    <section className="section" id="about">
      <div className="container">
        <div className="about-grid">
          <div className="about-art reveal">
            <img src="assets/elara-bg.jpg" alt="Elara nad střechami Aravellu, runová čepel v ruce" loading="lazy" />
            <div className="quote-on-art">„Někteří přísahají, aby slíbili. Jiní, aby svázali.“</div>
          </div>
          <div className="about-copy reveal delay-1">
            <div className="eyebrow left">O knize</div>
            <h2 className="section-title">Gotická fantasy o ceně daného slova.</h2>
            <p>
              <span className="drop">V</span> Aravellu, městě věží a sametu, neexistuje
              přísaha bez ceny. Runoví písaři ji vepisují přímo do těla — a každý
              porušený slib drásá nositele zevnitř. Mladá Elara z Druhého kruhu
              je jednou z nejtalentovanějších v generaci. Dokud jednu z přísah neporuší.
            </p>
            <p>
              Když se z paláce začnou ztrácet runové dýky a noční můry obyvatel
              ožijí v ulicích, Elara odhalí, že kdosi dávno mrtvý uzavřel s městem
              <em> sametovou přísahu</em> — a teď si přichází pro splátku. Aby
              zachránila to, co miluje, musí porušit poslední pravidlo svého
              cechu a vyrýt si do kůže slib, ze kterého není návratu.
            </p>
            <p>
              <em>Sametová přísaha</em> je první díl Aravellské ságy — pomalu
              hořící temná fantasy o cti, magii vepsané do kůže, a o tom,
              co všechno se dá obětovat pro jedno dané slovo.
            </p>
            <dl className="book-meta">
              <div><dt>Žánr</dt><dd>Dark fantasy</dd></div>
              <div><dt>Stránky</dt><dd>512</dd></div>
              <div><dt>Série</dt><dd>Aravellská sága · I</dd></div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────── CHARACTERS ─────────── */
function Characters() {
  const cards = [
    {
      name: "Elara z Druhého kruhu",
      glyph: "ᛖ",
      role: "Runová písařka · Hrdinka",
      bio: "Mladá adeptka, jejíž čepel zná víc jmen, než dokáže udržet v paměti. Touží po klidu, který si nemůže dovolit chtít.",
      img: "assets/elara.png",
      stats: [["Cech", "Druhý kruh"], ["Zbraň", "Runová dýka Vyera"]],
      pos: "center bottom",
    },
    {
      name: "Kael Vraní břeh",
      glyph: "ᚲ",
      role: "Strážce kodexu · Spojenec",
      bio: "Nosí knihu, která se nedá otevřít bez krve. Bývalý učenec na útěku — a jediný, komu Elara ještě věří.",
      img: "assets/kael.png",
      stats: [["Cech", "Spáleného listu"], ["Předmět", "Kodex přísah"]],
      pos: "center bottom",
    },
    {
      name: "Velmistryně Mira",
      glyph: "ᛗ",
      role: "Mistryně runy · Mentorka",
      bio: "Třikrát žila, dvakrát zemřela. Učí, že každá přísaha má rub — a že ten rub si vždycky přijde pro svého autora.",
      img: "assets/kael-mira.png",
      stats: [["Věk", "Neznámý"], ["Hůl", "Ametystová Veyra"]],
      pos: "75% bottom",
      objectStyle: { transform: "translateX(15%)" },
    },
  ];
  return (
    <section className="section" id="characters">
      <div className="container">
        <div style={{textAlign:"center", maxWidth:"680px", margin:"0 auto"}} className="reveal">
          <div className="eyebrow">Hlavní postavy</div>
          <h2 className="section-title">Tři přísahy. Tři osudy.</h2>
          <p className="section-lede" style={{margin:"0 auto 56px"}}>
            Žádný runový písař neslouží sám sobě. Každý z nich nese něčí závazek — a každý se z něj nějak snaží osvobodit.
          </p>
        </div>
        <div className="characters">
          {cards.map((c, i) => (
            <article className={"char-card reveal delay-" + (i+1)} key={c.name}>
              <div className="runes" aria-hidden="true" />
              <div className="char-portrait">
                <img
                  src={c.img}
                  alt={c.name + ", " + c.role}
                  loading="lazy"
                  style={{objectPosition: c.pos, ...(c.objectStyle || {})}}
                />
              </div>
              <div className="char-meta">
                <h3 className="char-name"><span className="name-glyph">{c.glyph}</span>{c.name}</h3>
                <div className="char-role">{c.role}</div>
                <p className="char-bio">{c.bio}</p>
                <div className="char-stats">
                  {c.stats.map(([k,v]) => (<span key={k}><b>{v}</b>{k}</span>))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────── WORLD ─────────── */
function World() {
  const locales = [
    { num: "I",   name: "Aravell, Sametové město", sub: "Hlavní město", text: "Věže z čediče a soumračné katedrály, kde se v ulicích válí závoje studené mlhy. Centrum runové magie i runové korupce." },
    { num: "II",  name: "Druhý kruh",              sub: "Cech písařů",  text: "Klášter zavěšený nad propastí, kde se učedníci učí psát přísahy do kůže — a unést, co znamená je porušit." },
    { num: "III", name: "Vraní břeh",              sub: "Pohraničí",    text: "Bažiny a sloupy zapomenutých chrámů, kam se uchylují ti, jejichž rún se říše rozhodla zbavit. Země druhých šancí. A posledních." },
  ];
  return (
    <section className="section world" id="world">
      <div className="container">
        <div style={{textAlign:"center", maxWidth:"680px", margin:"0 auto"}} className="reveal">
          <div className="eyebrow">Svět</div>
          <h2 className="section-title">Aravell — království sametu a run.</h2>
          <p className="section-lede" style={{margin:"0 auto"}}>
            Říše, kde se zákony nepíšou na pergamen, ale do kůže těch, kdo je vyřkli. Mlha, gotika, ametystové světlo.
          </p>
        </div>
        <div className="world-stage reveal">
          <div className="world-img" role="img" aria-label="Soumračná silueta Aravellu nad střechami." />
          <div className="world-overlay">
            <div>
              <h3>„V tomto městě nic nezmizí beze stopy. Jen se to přepíše.“</h3>
              <p>Z prologu — Velmistryně Mira o povaze runové paměti.</p>
            </div>
            <div style={{fontFamily:"var(--f-display)", color:"var(--gold)", letterSpacing:".3em", textAlign:"right", fontSize:"22px"}}>ᚦ&nbsp;ᚱ&nbsp;ᛖ&nbsp;ᛗ&nbsp;ᛟ&nbsp;ᛒ</div>
          </div>
        </div>
        <div className="world-locations">
          {locales.map((l, i) => (
            <article className={"world-locale reveal delay-" + (i+1)} key={l.name}>
              <div className="locale-num">{l.num}</div>
              <h4>{l.name}</h4>
              <div className="locale-sub">{l.sub}</div>
              <p>{l.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────── EXCERPT (Flipbook) ─────────── */
const BOOK_PAGES = [
  // Leaf 0: cover spread
  {
    front: { type: "cover", title: "Sametová přísaha", subtitle: "Aravellská sága, kniha první · A. Vale" },
    back:  {
      chapter: "Před prvním slovem",
      title: "Předmluva",
      body: [
        "Každá přísaha je dveřmi. Některé se otevírají dovnitř, jiné ven — a jen málokterá se dá zavřít zpět.",
        "Když jsem v sedmnácti poprvé položila pero na vlastní kůži, věděla jsem, že už nebudu sama nikdy. Slova, která si do sebe píšeš, ti zůstávají i ve spánku. Bdí, když ty spíš.",
        "Toto je vzpomínka. Nebo přiznání. Pravděpodobně obojí."
      ],
      pageNum: "i",
      ornament: true,
    }
  },
  // Leaf 1
  {
    front: {
      chapter: "Kapitola první",
      title: "Noc, kdy se balkon roztřásl",
      body: [
        "<em>S</em>nědla jsem celou věc o pulnoci, aby se mi nesplnila do rána. Příchuť pergamenu mi ještě hodinu po půlnoci ulpívala na patře — nahořklá, ale ne nepříjemná. Připomínala mi, že přísahy mají chuť. Že je můžeš spolknout.",
        "Mlha tu noc byla hustá tak, že se v ní balkonový kámen třásl. Nebo se třásl on, a já si jen namlouvala, že to dělá mlha. V Aravellu je rozdíl mezi <em>být sama</em> a <em>být sama bez svědka</em> zásadní.",
        "„Elaro.“ Hlas přišel zezadu, ale já jsem ho slyšela zevnitř."
      ],
      pageNum: "1",
    },
    back: {
      body: [
        "Otočila jsem se pomaleji, než bylo bezpečné. Mistryně Mira stála ve dveřích, sametový plášť stažený do uzlu na pravém rameni a hůl Veyra opřená o práh tak, jako by sama věděla, že nebude potřeba.",
        "„Měla jsi přijít před hodinou,“ řekla. Bylo to konstatování, ne výčitka. „Kruh tě čeká.“",
        "Spolkla jsem zbytek slov, která už nešla zachránit. Pergamen mi v žaludku tížil jako kámen. Někde pod žebry — tam, kde má každý písař svou první runu — to začalo pálit.",
        "Mira to viděla. Mira vidí všechno. „Co jsi udělala?“"
      ],
      pageNum: "2",
    }
  },
  // Leaf 2
  {
    front: {
      chapter: "Kapitola první · pokr.",
      body: [
        "„Slíbila jsem,“ vydechla jsem, „že už si na sebe nikdy nic nenapíšu.“",
        "Bylo to první přiznání toho večera. Druhé už jsem nemusela vyslovit nahlas — Mira sklouzla pohledem k vnitřní straně mé levé předloktí, kde se přes kůži ještě stahovala čerstvá linka. Tenká, fialová, sotva zaschlá. Vlastní rukopis se nikdy úplně nepřestane chvět.",
        "„A co jsi napsala?“",
        "Tam jsem se zarazila. Některé runy se nedají vyslovit, dokud na nich nestihne uschnout krev. Mira to věděla. Mira to věděla líp než kdokoli."
      ],
      pageNum: "3",
    },
    back: {
      body: [
        "<em>Z</em>amyšleně postavila hůl ke zdi. Ametyst v jejím vrcholu zaprskal — krátké, podrážděné fialové zajiskření, jaké světlo vydává, když cítí lež, kterou ještě nikdo nevyslovil.",
        "„Elaro,“ řekla velmistryně tiše, a najednou nebyla mistryní, ale ženou, která mě před dvanácti lety přinesla do Druhého kruhu zabalenou v cizí dece. „Pověz mi, kterou přísahu jsi porušila, abys mohla napsat tuhle.“",
        "Zavřela jsem oči. Pod víčky se mi rozsvítila slabá fialová linka — má vlastní runa, čerstvá a ještě hladová. Cítila jsem, jak se ke mně otáčí. Jako by mě čekala.",
        "„Tu o tobě, mistryně,“ odpověděla jsem. „Tu, kterou jsi mi napsala ty.“"
      ],
      pageNum: "4",
      ornament: true,
    }
  },
  // Leaf 3
  {
    front: {
      chapter: "Kapitola druhá",
      title: "Co se z paláce ztratilo",
      body: [
        "Ráno přišel Kael. Přišel způsobem, jakým chodí jen lidé, kteří se naučili nebýt slyšet — což v jeho případě znamenalo, že někde mezi schodištěm a mou komnatou zvládl rozhodit dvě stráže a jednoho kance ze sklepa.",
        "„Z paláce zmizela čepel,“ řekl místo pozdravu.",
        "„Která?“",
        "„Třetí.“",
        "Sedla jsem si. Třetí runová dýka Aravellu se v paláci uchovává od časů, na které si nikdo nepamatuje. Říká se o ní, že má jméno, ale že to jméno už dvě stě let nikdo neslyšel nahlas — protože ten, kdo by ho vyslovil, by se z místa, kde stojí, neměl jak hnout."
      ],
      pageNum: "5",
    },
    back: {
      body: [
        "„Kdo ji vzal?“ zeptala jsem se.",
        "Kael si stáhl rukáv. Na předloktí se mu vinul tmavě fialový nápis, který jsem nečetla. Žádný písař z mých kruhů by ten rukopis nepoznal. Bylo to staré písmo. <em>Příliš</em> staré.",
        "„To ti řeknu,“ řekl, „ale jen pokud jsi ochotná porušit ještě jednu přísahu.“",
        "Venku za oknem se nad střechami Aravellu rozprostíralo ráno tak šedé, že se mu nedalo věřit. V dálce vyzváněla zvonice druhého kruhu. Tři údery. Pak ticho. Pak čtvrtý — který tam neměl být."
      ],
      pageNum: "6",
      ornament: true,
    }
  },
  // Closing leaf
  {
    front: {
      chapter: "Konec ukázky",
      body: [
        "Příběh pokračuje. Sametová přísaha čeká, až ji otevřete.",
        "<em>„Mlčení je nejtěžší přísaha. Drží tě, i když jsi sám.“</em>"
      ],
      pageNum: "7",
      ornament: true,
    },
    back: {
      type: "cover",
      body: [
        "Děkujeme za přečtení ukázky."
      ]
    }
  }
];

function Excerpt() {
  return (
    <section className="section excerpt" id="excerpt">
      <div className="container">
        <div style={{textAlign:"center", maxWidth:"680px", margin:"0 auto"}} className="reveal">
          <div className="eyebrow">Ukázka z knihy</div>
          <h2 className="section-title">Otevřete kodex.</h2>
          <p className="section-lede" style={{margin:"0 auto"}}>
            Šest stránek z prvních dvou kapitol. Listujte tak, jak byste listovali knihou v rukou.
          </p>
        </div>
        <div className="reveal">
          <window.Flipbook pages={BOOK_PAGES} />
        </div>
      </div>
    </section>
  );
}

/* ─────────── REVIEWS ─────────── */
function Reviews() {
  const reviews = [
    {
      stars: 5,
      text: "Pomalá, krásná a zlověstná. Vale píše tak, jako by ji přísaha v knize bolela ji samotnou. Aravell je město, do kterého se chce vrátit ještě dlouho po dočtení.",
      name: "Tereza Holanová",
      src: "Literární noviny",
    },
    {
      stars: 5,
      text: "Pokud máte rádi tichý dech temné fantasy à la R. F. Kuang nebo Susanna Clarke, tahle kniha vám sedne pod kůži — doslova.",
      name: "iLiteratura.cz",
      src: "Recenze měsíce",
    },
    {
      stars: 5,
      text: "Magie vepsaná do kůže je tak hmatatelná, že po dočtení každé kapitoly automaticky kontrolujete vlastní zápěstí. Mistrovský debut.",
      name: "Adam Novák",
      src: "Knihovod podcast",
    },
    {
      stars: 5,
      text: "Elara z Druhého kruhu je jedna z nejlépe napsaných hrdinek roku. Nikdy nepřísahá lehce. A nikdy nezapomíná.",
      name: "Knižní moľ",
      src: "Blog roku 2026",
    },
    {
      stars: 4,
      text: "Pomalu hořící, ale to je její síla. Vale staví atmosféru jako katedrálu — pomalu, pečlivě a s každou další kapitolou vznešeněji.",
      name: "Reader & Co.",
      src: "Měsíčník",
    },
    {
      stars: 5,
      text: "Konečně česká fantasy, která si nedává úkol bavit. Dává si úkol zůstat. A zůstává.",
      name: "Magdaléna Bartoš",
      src: "Host magazín",
    },
  ];
  return (
    <section className="section" id="reviews">
      <div className="container">
        <div style={{textAlign:"center", maxWidth:"680px", margin:"0 auto"}} className="reveal">
          <div className="eyebrow">Ohlasy</div>
          <h2 className="section-title">Co o knize říkají.</h2>
          <p className="section-lede" style={{margin:"0 auto"}}>
            Od kritiků, knihkupců i čtenářů, kteří přísahali, že přečtou jen jednu kapitolu.
          </p>
        </div>
        <div className="reviews-grid">
          {reviews.map((r, i) => (
            <figure className={"review-card reveal delay-" + ((i%3)+1)} key={i}>
              <span className="quote-mark" aria-hidden="true">“</span>
              <div className="stars" aria-label={r.stars + " z 5 hvězd"}>
                {"★ ".repeat(r.stars).trim() + (r.stars < 5 ? " ☆" : "")}
              </div>
              <blockquote>„{r.text}“</blockquote>
              <cite>
                <span className="cite-name">{r.name}</span>
                <span className="cite-src">{r.src}</span>
              </cite>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────── AUTHOR ─────────── */
function Author() {
  return (
    <section className="section" id="author">
      <div className="container">
        <div className="author-grid">
          <div className="author-portrait reveal">
            <div className="sigil-bg">V</div>
            <div className="author-mark">
              A. Vale
              <span>Autorka · Aravellská sága</span>
            </div>
            <div className="author-stamp">Podpis · MMXXVI</div>
          </div>
          <div className="author-copy reveal delay-1">
            <div className="eyebrow left">O autorce</div>
            <h2 className="section-title">A. Vale píše knihy, které se nedají zavřít.</h2>
            <p className="author-tagline">Pražská autorka temné fantasy · Debut 2026</p>
            <p>
              A. Vale je pseudonym pražské autorky a redaktorky, která většinu
              svého života strávila prací s rukopisy cizích lidí. Když jí jeden
              z nich svěřil zápisník bez podpisu, rozhodla se ho dopsat sama.
              <em> Sametová přísaha</em> je výsledek osmi let toho dopisování.
            </p>
            <p>
              Inspirací jí byly gotické katedrály střední Evropy, severské runy
              a tichá hudba Olafura Arnaldse. Žije se třemi kočkami a knihovnou,
              o které nevěří, že má dno. Aravellská sága je naplánována na pět dílů.
            </p>
            <ul className="author-facts">
              <li>Debut roku 2026 dle ankety Lidových novin</li>
              <li>Více než 40 000 prodaných výtisků za první měsíc</li>
              <li>Práva prodána do osmi jazyků</li>
              <li>Ságu plánuje uzavřít v roce 2031</li>
            </ul>
            <div style={{marginTop:"32px", display:"flex", gap:"14px", flexWrap:"wrap"}}>
              <a className="btn btn-ghost" href="#">Rozhovor v Hostu</a>
              <a className="btn btn-ghost" href="#">Newsletter autorky</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────── BUY ─────────── */
function Buy() {
  const eds = [
    {
      icon: <IconPaperback />,
      name: "Brožovaná",
      desc: "Klasická paperback verze ve standardním formátu. Pro každodenní čtení.",
      price: "399 Kč",
      feats: ["512 stran", "Klopa s ilustrací", "Matný povrch"],
      cta: "Přidat do košíku",
    },
    {
      icon: <IconHardcover />,
      name: "Vázaná",
      desc: "Tvrdá vazba s textilním hřbetem a stříbřenou ražbou run na deskách.",
      price: "599 Kč",
      feats: ["Šitá vazba", "Stříbřená ražba", "Stuha k záložce"],
      cta: "Přidat do košíku",
    },
    {
      icon: <IconEbook />,
      name: "E-kniha",
      desc: "DRM-free EPUB a MOBI, čtěte na čemkoli. Bonus: interaktivní mapa Aravellu.",
      price: "249 Kč",
      feats: ["EPUB · MOBI · PDF", "Interaktivní mapa", "Bez DRM"],
      cta: "Stáhnout ihned",
    },
    {
      icon: <IconAudio />,
      name: "Sběratelská",
      desc: "Číslovaná edice 666 výtisků. Sametový obal, ručně vyšívaná runa, podpis autorky.",
      price: "1 990 Kč",
      feats: ["Sametová vazba", "Vyšívaná runa", "Podepsáno A. Vale", "Mapa Aravellu"],
      cta: "Rezervovat",
      featured: true,
    },
  ];
  return (
    <section className="section buy" id="buy">
      <div className="container">
        <div style={{textAlign:"center", maxWidth:"680px", margin:"0 auto"}} className="reveal">
          <div className="eyebrow">Koupit</div>
          <h2 className="section-title">Vyberte si své vydání.</h2>
          <p className="section-lede" style={{margin:"0 auto"}}>
            Tři běžná vydání pro každodenní čtení — a jedno, které si možná předáte dál.
          </p>
        </div>
        <div className="editions">
          {eds.map((e, i) => (
            <article className={"edition reveal delay-" + ((i%3)+1) + (e.featured ? " featured" : "")} key={e.name}>
              <div className="ed-icon">{e.icon}</div>
              <h3 className="ed-name">{e.name}</h3>
              <p className="ed-desc">{e.desc}</p>
              <ul className="ed-feats">{e.feats.map((f) => <li key={f}>{f}</li>)}</ul>
              <div className="ed-price">{e.price}</div>
              <button className="ed-buy">{e.cta} →</button>
            </article>
          ))}
        </div>
        <div className="retailers">
          <span className="label">Také k dostání u</span>
          <a href="#">Kosmas</a>
          <a href="#">Knihy Dobrovský</a>
          <a href="#">Megaknihy</a>
          <a href="#">Martinus</a>
          <a href="#">Luxor</a>
        </div>
      </div>
    </section>
  );
}

/* ─────────── FOOTER ─────────── */
function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="col-brand">
          <div className="brand"><Sigil className="sigil" /> Sametová přísaha</div>
          <p className="foot-tag">
            Oficiální stránka knihy <em>Sametová přísaha</em> od A. Vale.
            První díl Aravellské ságy. Vydává nakladatelství Veyra Press, 2026.
          </p>
          <form className="newsletter" onSubmit={(e) => { e.preventDefault(); alert("Děkujeme — přidali jsme vás na seznam."); }}>
            <input type="email" placeholder="Vaše e-mailová adresa" aria-label="Emailová adresa pro odběr novinek" required />
            <button type="submit">Odebírat</button>
          </form>
        </div>
        <div>
          <h5>Kniha</h5>
          <ul>
            <li><a href="#about">O knize</a></li>
            <li><a href="#characters">Postavy</a></li>
            <li><a href="#world">Svět Aravellu</a></li>
            <li><a href="#excerpt">Ukázka</a></li>
          </ul>
        </div>
        <div>
          <h5>Vydání</h5>
          <ul>
            <li><a href="#buy">Brožovaná</a></li>
            <li><a href="#buy">Vázaná</a></li>
            <li><a href="#buy">E-kniha</a></li>
            <li><a href="#buy">Sběratelská</a></li>
          </ul>
        </div>
        <div>
          <h5>Autorka</h5>
          <ul>
            <li><a href="#author">O autorce</a></li>
            <li><a href="#">Rozhovory</a></li>
            <li><a href="#">Newsletter</a></li>
            <li><a href="#">Kontakt pro média</a></li>
          </ul>
        </div>
      </div>
      <div className="container foot-bottom">
        <span>© 2026 Veyra Press · Všechna práva vyhrazena</span>
        <span style={{display:"flex", gap:"24px"}}>
          <a href="#">Obchodní podmínky</a>
          <a href="#">Ochrana soukromí</a>
        </span>
      </div>
    </footer>
  );
}

/* ─────────── APP ─────────── */
function App() {
  useReveal();
  return (
    <>
      <TopNav />
      <main>
        <Hero />
        <About />
        <Characters />
        <World />
        <Excerpt />
        <Reviews />
        <Author />
        <Buy />
      </main>
      <Footer />
      <BottomNav />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
