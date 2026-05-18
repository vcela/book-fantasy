/* Flipbook with realistic 3D page flip - mouse, touch swipe, keyboard, click to flip */
/* Exposes <Flipbook /> on window. Page content is in window.BOOK_PAGES */

const { useState, useRef, useCallback, useEffect: useEffectFlip } = React;

const Ornament = () => (
  <div className="pg-ornament" aria-hidden="true">
    <svg viewBox="0 0 200 24" width="180" height="22">
      <g fill="currentColor">
        <path d="M100 12 l-8 -6 l-6 0 l8 6 l-8 6 l6 0 z" />
        <path d="M100 12 l8 -6 l6 0 l-8 6 l8 6 l-6 0 z" />
        <circle cx="60" cy="12" r="1.5"/>
        <circle cx="50" cy="12" r="1"/>
        <circle cx="42" cy="12" r="0.7"/>
        <circle cx="140" cy="12" r="1.5"/>
        <circle cx="150" cy="12" r="1"/>
        <circle cx="158" cy="12" r="0.7"/>
        <path d="M70 12 L88 12 M112 12 L130 12" stroke="currentColor" strokeWidth="0.6" fill="none"/>
      </g>
    </svg>
  </div>
);

function Page({ index, pageData, flipped, totalSpreads, onClick }) {
  // Each "page" is a flippable leaf with front (right) and back (left after flip)
  const front = pageData.front;
  const back = pageData.back;
  return (
    <div
      className={"page" + (flipped ? " flipped" : "")}
      style={{ zIndex: flipped ? index + 1 : totalSpreads - index }}
      onClick={onClick}
      aria-hidden={flipped ? "false" : "true"}
    >
      {/* FRONT = right-hand page (visible before flip) */}
      <div className="page-face front">
        {front?.type === "cover" ? (
          <div className="page-cover" style={{position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center", padding:"40px"}}>
            <svg className="quill" viewBox="0 0 24 24" fill="currentColor"><path d="M20.7 3.3c-.4-.4-1-.4-1.4 0L10 12.6c-.5.5-.8 1.2-.8 1.9l-.1 2.3 2.3-.1c.7 0 1.4-.3 1.9-.8l9.3-9.3c.4-.4.4-1 0-1.4l-1.9-1.9zM4 18c0-1.1.9-2 2-2h2l-2 2-2 2v-2zm4 4h2l2-2-2-2H8v4z"/></svg>
            <h2>{front.title}</h2>
            <p>{front.subtitle}</p>
            <div style={{display:"flex", gap:"10px", color:"var(--gold)", fontSize:"22px", letterSpacing:".3em"}}>ᚠ ᚱ ᚦ</div>
          </div>
        ) : (
          <>
            {front?.chapter && <h4>{front.chapter}</h4>}
            {front?.title && <h3>{front.title}</h3>}
            {front?.body?.map((p, i) => <p key={i} dangerouslySetInnerHTML={{__html: p}} />)}
            {front?.ornament && <Ornament />}
            <div className="pg-num">— {front?.pageNum ?? ""} —</div>
          </>
        )}
      </div>
      {/* BACK = left-hand page (visible after flip) */}
      <div className="page-face back">
        {back?.chapter && <h4>{back.chapter}</h4>}
        {back?.title && <h3>{back.title}</h3>}
        {back?.body?.map((p, i) => <p key={i} dangerouslySetInnerHTML={{__html: p}} />)}
        {back?.ornament && <Ornament />}
        <div className="pg-num">— {back?.pageNum ?? ""} —</div>
      </div>
    </div>
  );
}

function Flipbook({ pages }) {
  // pages is an array of leaves; each leaf has { front, back }
  const total = pages.length;
  const [current, setCurrent] = useState(0); // index of next page to flip (0..total)
  const wrapRef = useRef(null);
  const touchStart = useRef(null);

  const next = useCallback(() => setCurrent((c) => Math.min(total, c + 1)), [total]);
  const prev = useCallback(() => setCurrent((c) => Math.max(0, c - 1)), []);

  // Static back-of-book layer (fixed, behind everything): subtle decoration
  // Show what we're on: "Spread 2 / 5"
  const spreadDisplay = `${Math.min(current + 1, total)} / ${total}`;

  useEffectFlip(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") { e.preventDefault(); next(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
    };
    const el = wrapRef.current;
    if (!el) return;
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [next, prev]);

  // Swipe handling
  const onTouchStart = (e) => { touchStart.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchStart.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(dx) > 40) { dx < 0 ? next() : prev(); }
    touchStart.current = null;
  };

  return (
    <>
      <div
        className="flipbook-wrap"
        ref={wrapRef}
        tabIndex={0}
        role="region"
        aria-label="Ukázka z knihy – listujte šipkami nebo klepnutím na stránku"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="flipbook">
          {pages.map((p, i) => (
            <Page
              key={i}
              index={i}
              pageData={p}
              flipped={i < current}
              totalSpreads={total}
              onClick={() => {
                // Click on right (un-flipped top) → flip forward; on left flipped top → flip back
                if (i === current) next();
                else if (i === current - 1) prev();
              }}
            />
          ))}
        </div>
      </div>
      <div className="flipbook-controls" role="group" aria-label="Ovládání knihy">
        <button className="flip-btn" onClick={prev} disabled={current === 0} aria-label="Předchozí stránka">
          <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <div className="flipbook-counter">
          <span className="sr-only">Strana </span>
          <b>{spreadDisplay}</b>
        </div>
        <button className="flip-btn" onClick={next} disabled={current === total} aria-label="Další stránka">
          <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>
      <div className="flipbook-hint">
        Listujte klepnutím na stránku · šipkami <span className="kbd">←</span> <span className="kbd">→</span> · nebo přejetím prstu
      </div>
    </>
  );
}

window.Flipbook = Flipbook;
