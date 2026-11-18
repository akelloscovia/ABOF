import { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";
import {
  ArrowDown, ArrowRight, ArrowUpRight, BadgeCheck, BookOpen, BriefcaseBusiness,
  CalendarDays, Check, HeartHandshake, Image, Leaf, Mail, Menu, MessageCircle,
  MoveRight, ShieldCheck, Sparkles, UsersRound, X,
} from "lucide-react";
import { api } from "./services/api";

const navigation = [
  ["About", "/about"],
  ["Programmes", "/programmes"],
  ["Our impact", "/impact"],
  ["Get involved", "/get-involved"],
  ["News", "/news"],
];
const collections = {
  programmes: { label: "Programmes", path: "/programmes", icon: Sparkles },
  projects: { label: "Projects", path: "/projects", icon: BriefcaseBusiness },
  news: { label: "News & updates", path: "/news", icon: BookOpen },
  events: { label: "Events", path: "/events", icon: CalendarDays },
  leadership: { label: "Leadership", path: "/leadership", icon: UsersRound },
  impact: { label: "Impact", path: "/impact", icon: BadgeCheck },
  publications: { label: "Publications", path: "/publications", icon: BookOpen },
  gallery: { label: "Gallery", path: "/gallery", icon: Image },
};
const proposedProgrammes = [
  ["Youth Skills Development", "Practical, vocational, digital and life skills that improve employability and income generation."],
  ["Entrepreneurship and Livelihood Development", "Entrepreneurship, innovation and livelihood opportunities for young people."],
  ["Leadership and Mentorship", "Leadership skills, confidence, responsibility and participation in decision-making."],
  ["Community Development", "Community initiatives responding to locally identified needs."],
  ["Education and Career Guidance", "Educational information, career guidance and personal-development opportunities."],
  ["Partnerships and Volunteerism", "Relationships that contribute expertise, resources and services."],
];

function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => setOpen(false), [location.pathname]);
  return (
    <header className="site-header">
      <div className="header-inner wrap">
        <Link className="brand" to="/" aria-label="ABOF home">
          <span className="brand-mark">A<span>.</span></span>
          <span className="brand-name">ABOF<small>ACAM BETTY OKELLO FOUNDATION</small></span>
        </Link>
        <button className="menu-toggle" onClick={() => setOpen(!open)} aria-label="Toggle navigation">
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
        <nav className={open ? "main-nav open" : "main-nav"}>
          {navigation.map(([label, path]) => <Link key={path} to={path}>{label}</Link>)}
          <Link className="nav-cta" to="/support">Support us <ArrowUpRight size={16} /></Link>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div>
          <Link className="brand footer-brand" to="/">
            <span className="brand-mark">A<span>.</span></span>
            <span className="brand-name">ABOF<small>ACAM BETTY OKELLO FOUNDATION</small></span>
          </Link>
          <p className="footer-copy">A community-focused initiative with a vision for youth empowerment and lasting community progress.</p>
        </div>
        <div><h4>Explore</h4>{navigation.slice(0, 4).map(([label, path]) => <Link key={path} to={path}>{label}</Link>)}<Link to="/gallery">Gallery</Link></div>
        <div><h4>Connect</h4><Link to="/contact">Contact us</Link><Link to="/support">Support the work</Link><Link to="/admin">Team sign in</Link></div>
      </div>
      <div className="wrap footer-bottom">
        <span>© {new Date().getFullYear()} Acam Betty Okello Foundation</span>
        <span>Growing opportunity, together.</span>
      </div>
    </footer>
  );
}

function SiteLayout({ children }) {
  return <><Header /><main>{children}</main><Footer /></>;
}

function Eyebrow({ children, light = false }) {
  return <span className={`eyebrow ${light ? "eyebrow-light" : ""}`}><span />{children}</span>;
}

function PageIntro({ label, title, copy }) {
  return <section className="page-intro wrap"><Eyebrow>{label}</Eyebrow><h1>{title}</h1><p>{copy}</p></section>;
}

function RecordCard({ item, kind, index = 0 }) {
  const palettes = ["sage", "sand", "peach", "blue"];
  return (
    <Link className={`record-card ${palettes[index % palettes.length]}`} to={`${collections[kind]?.path || `/${kind}`}/${item.slug}`}>
      {item.image_url ? <img className="record-image" src={item.image_url} alt={item.image_alt || item.title} /> : <div className="record-art"><span>0{index + 1}</span><ArrowUpRight size={23} /></div>}
      <div className="record-content">
        {item.category && <span className="record-category">{item.category}</span>}
        <h3>{item.title}</h3>
        <p>{item.summary || item.body?.slice(0, 120)}</p>
        <span className="text-link">Explore <ArrowRight size={16} /></span>
      </div>
    </Link>
  );
}

function Home() {
  const [programmes, setProgrammes] = useState([]);
  const [news, setNews] = useState([]);
  const [loadError, setLoadError] = useState("");
  useEffect(() => {
    Promise.all([api.listPublic("programmes"), api.listPublic("news")])
      .then(([publishedProgrammes, publishedNews]) => {
        setProgrammes(publishedProgrammes);
        setNews(publishedNews);
      })
      .catch((error) => setLoadError(error.message));
  }, []);
  return (
    <>
      <section className="hero">
        <div className="hero-shape shape-one" /><div className="hero-shape shape-two" />
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <Eyebrow light>Youth empowerment · Community development</Eyebrow>
            <h1>Possibility grows<br />when <em>we grow together.</em></h1>
            <p>ABOF is a proposed community-based organisation working toward youth empowerment and community development.</p>
            <div className="hero-actions"><Link className="button button-gold" to="/about">Discover ABOF <ArrowRight size={17} /></Link><Link className="hero-link" to="/get-involved">Be part of the change <ArrowUpRight size={16} /></Link></div>
          </div>
          <div className="hero-visual">
            <div className="hero-orbit orbit-a" /><div className="hero-orbit orbit-b" />
            <div className="hero-sun"><span>ABOF</span><small>GROWING TOGETHER</small></div>
            <div className="hero-note note-top"><Leaf size={17} /><span>Rooted in community</span></div>
            <div className="hero-note note-bottom"><UsersRound size={17} /><span>Led by possibility</span></div>
            <div className="hero-vertical">A FOUNDATION FOR WHAT'S POSSIBLE</div>
          </div>
        </div>
        <div className="hero-foot wrap"><span>01 — A vision for shared progress</span><a href="#intro">Scroll to explore <ArrowDown size={14} /></a></div>
      </section>

      <section className="intro-section wrap" id="intro">
        <div className="intro-label"><Eyebrow>Who we are</Eyebrow><span className="intro-number">01<span>/04</span></span></div>
        <div className="intro-main"><h2>Every young person deserves the chance to <em>find their path.</em></h2><p>Acam Betty Okello Foundation is a proposed community-based organisation focused on youth empowerment and community development. We believe skills, mentorship and local partnerships can open new possibilities.</p><Link className="text-link" to="/about">Get to know us <ArrowRight size={16} /></Link></div>
        <div className="intro-aside"><div className="aside-icon"><HeartHandshake size={22} /></div><p>Grounded in local voices.<br /><strong>Open to shared ideas.</strong></p><span>PROPOSED FOCUS · NGORA DISTRICT</span></div>
      </section>

      <section className="programmes-section">
        <div className="wrap">
          <div className="section-heading"><div><Eyebrow>Where we focus</Eyebrow><h2>Paths to <em>possibility.</em></h2></div><Link className="text-link" to="/programmes">Explore focus areas <ArrowRight size={16} /></Link></div>
          {loadError && <div className="notice notice-error home-error">Some live website content could not be loaded: {loadError}</div>}
          {programmes.length ? <div className="record-grid">{programmes.slice(0, 3).map((item, index) => <RecordCard key={item.id} item={item} kind="programmes" index={index} />)}</div> : <div className="focus-grid">
            {[
              ["01", "Skills for tomorrow", "Practical, digital and life skills that help young people navigate opportunity.", "skills"],
              ["02", "Enterprise & livelihoods", "Supporting ideas, initiative and pathways toward sustainable livelihoods.", "enterprise"],
              ["03", "Leadership & mentorship", "Creating room for young people to grow confidence and take part in decisions.", "leadership"],
            ].map(([number, title, copy, icon], i) => <Link to="/programmes" key={number} className={`focus-card focus-${i + 1}`}><span className="focus-number">{number}</span><span className="focus-icon">{icon === "skills" ? <Sparkles /> : icon === "enterprise" ? <Leaf /> : <UsersRound />}</span><h3>{title}</h3><p>{copy}</p><span className="focus-arrow"><ArrowUpRight size={19} /></span></Link>)}
          </div>}
          <p className="proposed-note"><span>NOTE</span> These focus areas are proposed and will be confirmed by the Foundation.</p>
        </div>
      </section>

      <section className="belief-section wrap">
        <div className="belief-visual"><div className="belief-sun" /><span className="belief-caption">A FUTURE SHAPED TOGETHER</span><div className="belief-stamp">LOCAL<br />VOICES<br />MATTER</div></div>
        <div className="belief-copy"><Eyebrow>Our approach</Eyebrow><h2>Progress starts with <em>people.</em></h2><p>We want to listen, learn and work alongside communities — connecting young people with the guidance, skills and relationships that help them move forward.</p><div className="belief-points"><span><Check size={16} />Community participation</span><span><Check size={16} />Learning through action</span><span><Check size={16} />Partnership and care</span></div><Link className="text-link" to="/about">Our story & values <ArrowRight size={16} /></Link></div>
      </section>

      <section className="impact-band"><div className="wrap impact-band-inner"><div><Eyebrow light>Honest by design</Eyebrow><h2>Real impact takes<br /><em>time, trust and proof.</em></h2></div><p>We will share verified activities, outcomes and stories as they become available — with context, care and consent.</p><Link className="button button-outline" to="/impact">Our impact approach <ArrowRight size={16} /></Link></div></section>

      <section className="stories-section wrap"><div className="section-heading"><div><Eyebrow>From the community</Eyebrow><h2>Notes & <em>updates.</em></h2></div><Link className="text-link" to="/news">All updates <ArrowRight size={16} /></Link></div>{news.length ? <div className="record-grid">{news.slice(0, 3).map((item, index) => <RecordCard key={item.id} item={item} kind="news" index={index} />)}</div> : <div className="empty-stories"><span className="empty-icon"><BookOpen size={22} /></span><div><h3>Stories are taking shape.</h3><p>Updates will appear here when the Foundation publishes them.</p></div><Link className="text-link" to="/contact">Stay connected <ArrowRight size={15} /></Link></div>}</section>

      <section className="closing-cta"><div className="wrap closing-inner"><div><Eyebrow light>Start with a conversation</Eyebrow><h2>Good things grow<br />when we <em>show up.</em></h2></div><Link className="button button-gold" to="/get-involved">Get involved <ArrowRight size={17} /></Link><span className="closing-scribble">ABOF</span></div></section>
    </>
  );
}

function About() {
  return <><PageIntro label="Our foundation" title={<>A shared vision.<br /><em>A community-led future.</em></>} copy="Learn about the purpose, proposed values and community-first approach behind Acam Betty Okello Foundation." />
    <section className="about-story wrap"><div><Eyebrow>Our beginnings</Eyebrow><h2>Building a foundation for <em>what's next.</em></h2></div><div><p>Acam Betty Okello Foundation (ABOF) is a proposed community-based organisation working toward youth empowerment and community development in Ngora District, Uganda.</p><p>Our direction is rooted in the belief that young people should have access to practical skills, mentorship, leadership opportunities and meaningful ways to participate in their communities.</p><div className="status-callout"><ShieldCheck size={20} /><span><strong>Transparency matters.</strong> CBO registration is in preparation and has not yet been confirmed.</span></div></div></section>
    <section className="values-section"><div className="wrap"><Eyebrow>What guides us</Eyebrow><h2>Values to <em>grow into.</em></h2><p className="proposed-note"><span>PROPOSED</span> These values are working ideas pending formal adoption by the Foundation.</p><div className="values-grid">{[["Listen first","Community voices shape priorities and action."],["Make room","Every young person deserves a chance to participate."],["Learn together","Curiosity and practical learning create momentum."],["Act with care","Trust, responsibility and transparency matter."]].map(([title,copy],i)=><article className="value-card" key={title}><span>0{i+1}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></div></section>
    <section className="about-cta wrap"><div><Eyebrow>Take the next step</Eyebrow><h2>There is room for <em>you here.</em></h2></div><Link className="button button-dark" to="/get-involved">Get involved <ArrowRight size={17} /></Link></section></>;
}

function CollectionPage({ kind, title, copy }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => { api.listPublic(kind).then(setItems).catch((err) => setError(err.message)); }, [kind]);
  return <><PageIntro label={collections[kind]?.label || title} title={title} copy={copy} /><section className="collection-section wrap">{error ? <div className="notice notice-error">{error} — make sure the API server is running.</div> : items.length ? <div className="record-grid">{items.map((item, index) => <RecordCard key={item.id} item={item} kind={kind} index={index} />)}</div> : kind === "programmes" ? <><p className="proposed-note"><span>PROPOSED</span> These focus areas come from the project brief and need Foundation confirmation.</p><div className="record-grid proposed-programmes">{proposedProgrammes.map(([title, summary], index) => <article className="record-card" key={title}><div className="record-art"><span>0{index + 1}</span><Sparkles size={20}/></div><div className="record-content"><span className="record-category">Proposed area</span><h3>{title}</h3><p>{summary}</p></div></article>)}</div></> : <><div className="empty-state"><span className="empty-icon"><BookOpen size={24} /></span><h2>Nothing published just yet.</h2><p>New updates will appear here when they are ready to share.</p></div>{kind === "leadership" && <p className="proposed-note"><span>CONFIRMATION</span> The project brief identifies Miss Acam Betty Okello as Founder / Proposed CEO; the title is subject to formal confirmation.</p>}</>}</section></>;
}

function RecordDetail({ kind }) {
  const { slug = "" } = useParams();
  const [item, setItem] = useState(null);
  useEffect(() => { api.getPublic(kind, slug).then(setItem).catch(() => setItem(false)); }, [kind, slug]);
  if (item === null) return <div className="loading-state">Loading story…</div>;
  if (!item) return <div className="empty-state wrap"><h2>We couldn't find that page.</h2><Link className="text-link" to={collections[kind].path}>Back to {collections[kind].label}</Link></div>;
  return <article className="detail-page wrap"><Link className="back-link" to={collections[kind].path}>← Back to {collections[kind].label}</Link>{item.image_url && <img className="detail-image" src={item.image_url} alt={item.image_alt || item.title} />}<Eyebrow>{item.category || collections[kind].label}</Eyebrow><h1>{item.title}</h1><p className="detail-summary">{item.summary}</p><div className="detail-body">{item.body.split("\n").map((paragraph, i) => paragraph && <p key={i}>{paragraph}</p>)}</div></article>;
}

function ContactForm({ kind = "contact", title = "Send us a note", intro = "Share a little about what brings you here. We’ll be in touch as soon as we can." }) {
  const [state, setState] = useState({ loading: false, message: "", error: false });
  async function submit(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setState({ loading: true, message: "", error: false });
    try {
      const result = await api.submit({
        kind, name: form.get("name"), email: form.get("email"), phone: form.get("phone"),
        message: form.get("message"), website: form.get("website"),
      });
      setState({ loading: false, message: result.message, error: false });
      formElement.reset();
    } catch (error) {
      setState({ loading: false, message: error.message, error: true });
    }
  }
  return <div className="form-panel"><Eyebrow>Start a conversation</Eyebrow><h2>{title}</h2><p>{intro}</p>{state.message && <div className={`notice ${state.error ? "notice-error" : "notice-success"}`}>{state.message}</div>}<form onSubmit={submit} className="contact-form"><label>Your name<input name="name" required minLength="2" maxLength="160" placeholder="How should we address you?" /></label><label>Email address<input name="email" type="email" required placeholder="you@example.com" /></label><label>Phone <span>(optional)</span><input name="phone" type="tel" maxLength="40" placeholder="+256" /></label><label>Your message<textarea name="message" rows="4" required minLength="10" maxLength="4000" placeholder="Tell us a little more…" /></label><label className="honeypot" aria-hidden="true">Website<input name="website" tabIndex="-1" autoComplete="off" /></label><button className="button button-dark" disabled={state.loading}>{state.loading ? "Sending…" : "Send message"} <ArrowRight size={17} /></button></form></div>;
}

function Contact() {
  return <><PageIntro label="Contact" title={<>Let's start<br /><em>a conversation.</em></>} copy="Reach out to ask a question, explore a partnership or learn more about the Foundation." /><section className="contact-section wrap"><div className="contact-aside"><div className="contact-note"><MessageCircle size={23} /><h3>We'd love to hear from you.</h3><p>Official phone, email and office details will be added when confirmed by the Foundation.</p></div><div className="contact-location"><span>OUR PROPOSED AREA OF OPERATION</span><p>Ngora Town Council<br />Ngora District, Uganda</p><small>Location information is subject to confirmation.</small></div></div><ContactForm /></section></>;
}

function GetInvolved() {
  return <><PageIntro label="Get involved" title={<>Your time. Your ideas.<br /><em>Our shared future.</em></>} copy="There are many ways to contribute to community-led progress. Tell us what matters to you and we can start there." /><section className="involvement-section wrap"><div className="involvement-options">{[[HeartHandshake,"Volunteer","Share your time, knowledge or practical skills."],[UsersRound,"Mentor","Encourage young people as they explore what's possible."],[BriefcaseBusiness,"Partner","Bring an organisation, idea or resource to the table."]].map(([Icon,title,copy])=><article key={title}><Icon size={24}/><h3>{title}</h3><p>{copy}</p></article>)}<p className="proposed-note"><span>PLEASE NOTE</span> Opportunities and participation arrangements are subject to Foundation confirmation.</p></div><ContactForm kind="volunteer" title="Tell us how you'd like to help" intro="Share your interests or experience. This is an expression of interest, not a confirmed placement." /></section></>;
}

function Support() {
  return <><PageIntro label="Support us" title={<>Every contribution<br /><em>can open a door.</em></>} copy="Support can take many forms — time, knowledge, useful resources or a conversation about working together." /><section className="support-section wrap"><div className="support-message"><div className="support-icon"><HeartHandshake size={29}/></div><h2>Start with a <em>conversation.</em></h2><p>Financial support arrangements are not enabled. The Foundation will share approved ways to give once official receiving accounts and processes have been confirmed.</p><div className="status-callout"><ShieldCheck size={20}/><span>Online payments are intentionally disabled until the Foundation approves and verifies official receiving arrangements.</span></div><Link className="button button-dark" to="/contact">Discuss support <ArrowRight size={17}/></Link></div><div className="support-ways"><span>WAYS TO CONNECT</span>{["Share your expertise","Volunteer your time","Explore a partnership","Help us learn what works"].map((item,i)=><div key={item}><span>0{i+1}</span>{item}<MoveRight size={18}/></div>)}</div></section></>;
}

function NotFound() {
  return <div className="empty-state wrap"><Eyebrow>404 — PAGE NOT FOUND</Eyebrow><h2>Looks like this path is still being made.</h2><Link className="button button-dark" to="/">Back to home <ArrowRight size={17}/></Link></div>;
}

function Login() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      await api.login(form.get("email"), form.get("password"));
      window.location.assign("/admin/dashboard");
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }
  return <div className="admin-login"><Link className="brand" to="/"><span className="brand-mark">A<span>.</span></span><span className="brand-name">ABOF<small>ADMINISTRATION</small></span></Link><div className="login-card"><Eyebrow>Staff access</Eyebrow><h1>Welcome back.</h1><p>Sign in with your Foundation administrator account.</p>{error && <div className="notice notice-error">{error}</div>}<form className="contact-form" onSubmit={submit}><label>Email address<input name="email" type="email" autoComplete="username" required /></label><label>Password<input name="password" type="password" autoComplete="current-password" required /></label><button className="button button-dark" disabled={loading}>{loading ? "Signing in…" : "Sign in"} <ArrowRight size={17}/></button></form></div><Link className="login-back" to="/">← Back to public website</Link></div>;
}

function Admin() {
  const [user, setUser] = useState(undefined);
  const location = useLocation();
  useEffect(() => { api.me().then(setUser).catch(() => setUser(null)); }, [location.pathname]);
  if (user === undefined) return <div className="loading-state">Checking your session…</div>;
  if (!user) return <Navigate to="/admin" replace />;
  return <AdminDashboard user={user} />;
}

function AdminDashboard({ user }) {
  const location = useLocation();
  const [overview, setOverview] = useState(null);
  const [kind, setKind] = useState(Object.keys(collections).find((key) => collections[key].path === location.pathname) || "programmes");
  const [items, setItems] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editing, setEditing] = useState(null);
  const [view, setView] = useState(location.pathname.includes("/submissions") ? "submissions" : "content");
  const [notice, setNotice] = useState("");
  const canEdit = ["super_administrator", "administrator", "editor", "content_contributor"].includes(user.role);

  async function loadContent(current = kind) {
    setError("");
    try { setItems(await api.listAdmin(current)); }
    catch (err) { setError(err.message); }
  }
  async function loadSubmissions() {
    try { setSubmissions(await api.submissions()); }
    catch (err) { setError(err.message); }
  }
  async function loadUsers() {
    try { setUsers(await api.users()); }
    catch (err) { setError(err.message); }
  }
  useEffect(() => {
    api.overview().then(setOverview).catch((err) => setError(err.message));
    loadContent(kind);
    if (["super_administrator", "administrator", "applications_reviewer"].includes(user.role)) loadSubmissions();
    if (user.role === "super_administrator") loadUsers();
  }, []);
  useEffect(() => { if (view === "content") loadContent(kind); }, [kind, view]);

  function chooseKind(next) {
    setKind(next);
    setView("content");
    window.history.replaceState({}, "", collections[next].path);
  }
  async function saveContent(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    payload.sort_order = Number(payload.sort_order || 0);
    try {
      if (editing) await api.update(kind, editing.id, payload);
      else await api.create(kind, payload);
      setEditing(null);
      setNotice(editing ? "Changes saved." : "Content added.");
      await loadContent();
      api.overview().then(setOverview);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }
  async function uploadImage(event) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    setError("");
    try {
      const uploaded = await api.uploadMedia(file);
      setEditing((current) => ({
        ...current,
        image_url: uploaded.url,
        image_alt: current.image_alt || file.name.replace(/\.[^.]+$/, ""),
      }));
      setNotice("Image uploaded. Save the entry to publish it with your content.");
    } catch (err) {
      setError(err.message);
    } finally {
      input.value = "";
      setUploadingImage(false);
    }
  }
  async function remove(item) {
    if (!window.confirm(`Permanently remove “${item.title}”?`)) return;
    try { await api.remove(kind, item.id); await loadContent(); setNotice("Content removed."); }
    catch (err) { setError(err.message); }
  }
  async function updateStatus(item, status) {
    try {
      await api.updateSubmission(item.id, status);
      await loadSubmissions();
    } catch (err) { setError(err.message); }
  }
  async function createUser(event) {
    event.preventDefault();
    setError("");
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());
    try {
      await api.createUser(payload);
      form.reset();
      await loadUsers();
      setNotice("Team account created.");
    } catch (err) { setError(err.message); }
  }
  async function updateUser(userId, payload) {
    setError("");
    try {
      await api.updateUser(userId, payload);
      await loadUsers();
      setNotice("Team access updated.");
    } catch (err) { setError(err.message); }
  }
  function signOut() { api.logout(); window.location.assign("/admin"); }

  const statusFields = ["draft", "published", "archived"];
  return <div className="admin-shell"><aside className="admin-sidebar"><Link className="brand" to="/"><span className="brand-mark">A<span>.</span></span><span className="brand-name">ABOF<small>ADMINISTRATION</small></span></Link><div className="admin-label">WORKSPACE</div><button className={`admin-nav-item ${view === "overview" ? "selected" : ""}`} onClick={() => setView("overview")}><BadgeCheck size={17}/>Overview</button><div className="admin-label">CONTENT</div>{Object.entries(collections).map(([key,{label,icon:Icon}])=><button key={key} className={`admin-nav-item ${view === "content" && kind === key ? "selected" : ""}`} onClick={() => chooseKind(key)}><Icon size={17}/>{label}</button>)}{["super_administrator","administrator","applications_reviewer"].includes(user.role)&&<><div className="admin-label">INBOX</div><button className={`admin-nav-item ${view === "submissions" ? "selected" : ""}`} onClick={() => {setView("submissions");setError("");loadSubmissions();}}><Mail size={17}/>Submissions {overview?.new_submissions > 0 && <span className="inbox-count">{overview.new_submissions}</span>}</button></>}{user.role === "super_administrator" && <><div className="admin-label">ACCESS</div><button className={`admin-nav-item ${view === "users" ? "selected" : ""}`} onClick={() => {setView("users");setError("");loadUsers();}}><ShieldCheck size={17}/>Users & roles</button></>}<div className="admin-sidebar-bottom"><span className="admin-avatar">{user.email.slice(0,1).toUpperCase()}</span><div><strong>{user.email}</strong><small>{user.role.replaceAll("_"," ")}</small></div><button onClick={signOut} aria-label="Sign out"><ArrowUpRight size={17}/></button></div></aside>
    <main className="admin-main"><header className="admin-topbar"><span>ABOF <span>/</span> {view === "overview" ? "Overview" : view === "submissions" ? "Submissions" : view === "users" ? "Users & roles" : collections[kind].label}</span><div><Link to="/" target="_blank">View website <ArrowUpRight size={15}/></Link><button onClick={signOut}>Sign out</button></div></header>
      <div className="admin-content">
        {error && <div className="notice notice-error">{error}</div>}{notice && <div className="notice notice-success">{notice}<button onClick={() => setNotice("")}>Dismiss</button></div>}
        {view === "overview" && <><div className="admin-page-heading"><div><Eyebrow>Good things are growing</Eyebrow><h1>Welcome to your workspace.</h1><p>Manage the content your community sees.</p></div></div><div className="stats-grid"><div><span>ALL CONTENT</span><strong>{overview?.content ?? "—"}</strong><small>Across every section</small></div><div><span>PUBLISHED</span><strong>{overview?.published ?? "—"}</strong><small>Visible on the website</small></div><div><span>NEW MESSAGES</span><strong>{overview?.new_submissions ?? "—"}</strong><small>Waiting for review</small></div></div><div className="admin-welcome"><div className="welcome-icon"><Sparkles size={22}/></div><h2>A small reminder</h2><p>Publish only information approved by the Foundation. Verify impact figures and get consent before sharing personal stories or photos.</p></div></>}
        {view === "content" && <><div className="admin-page-heading"><div><Eyebrow>Content studio</Eyebrow><h1>{collections[kind].label}</h1><p>Create, review and publish website content.</p></div>{canEdit && <button className="button button-dark" onClick={() => setEditing({})}>Add new <span>＋</span></button>}</div>
          {editing !== null && <form className="editor-form" onSubmit={saveContent}><div className="editor-heading"><div><Eyebrow>{editing.id ? "Edit entry" : "New entry"}</Eyebrow><h2>{editing.id ? "Update content" : "Create content"}</h2></div><button type="button" className="icon-button" onClick={() => setEditing(null)} aria-label="Close"><X size={18}/></button></div><div className="editor-grid"><label>Title *<input name="title" required maxLength="180" defaultValue={editing.title || ""}/></label><label>URL slug<input name="slug" placeholder="generated-from-title" defaultValue={editing.slug || ""}/></label><label>Category<input name="category" maxLength="100" defaultValue={editing.category || ""}/></label><label>Status<select name="status" defaultValue={editing.status || "draft"}>{(user.role === "content_contributor" ? ["draft"] : statusFields).map((status)=><option key={status}>{status}</option>)}</select></label><label className="editor-full">Short summary<textarea name="summary" rows="2" maxLength="500" defaultValue={editing.summary || ""}/></label><label className="editor-full">Full story / details<textarea name="body" rows="6" maxLength="30000" defaultValue={editing.body || ""}/></label><label>Upload image (max 5 MB)<input name="image_file" type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={uploadImage}/><small>{uploadingImage ? "Uploading image…" : "JPEG, PNG, GIF or WebP"}</small></label><label>Image URL<input name="image_url" type="url" value={editing.image_url || ""} onChange={(event)=>setEditing({...editing,image_url:event.target.value})}/></label><label>Image description<input name="image_alt" maxLength="250" value={editing.image_alt || ""} onChange={(event)=>setEditing({...editing,image_alt:event.target.value})}/></label><label>Event date<input name="event_date" placeholder="YYYY-MM-DD" defaultValue={editing.event_date || ""}/></label><label>Display order<input name="sort_order" type="number" min="0" defaultValue={editing.sort_order || 0}/></label></div><div className="editor-actions"><button type="button" className="button button-quiet" onClick={() => setEditing(null)}>Cancel</button><button className="button button-dark" disabled={saving || uploadingImage}>{saving ? "Saving…" : "Save content"} <ArrowRight size={16}/></button></div></form>}
          <div className="admin-list-header"><h2>All entries <span>{items.length}</span></h2><span>Drafts are private until published</span></div>{items.length ? <div className="admin-table">{items.map((item)=><article key={item.id} className="admin-row"><div className="row-thumb">{item.image_url ? <img src={item.image_url} alt=""/> : <BookOpen size={18}/>}</div><div className="row-info"><strong>{item.title}</strong><span>/{collections[kind].path.split("/").filter(Boolean)[0]}/{item.slug}</span></div><span className={`status-pill status-${item.status}`}>{item.status}</span><span className="row-date">{new Date(item.updated_at).toLocaleDateString()}</span><div className="row-actions"><button disabled={user.role === "content_contributor" && item.status !== "draft"} onClick={() => setEditing(item)}>Edit</button>{user.role !== "content_contributor" && <button onClick={() => remove(item)}>Remove</button>}</div></article>)}</div> : <div className="empty-state admin-empty"><span className="empty-icon"><BookOpen size={22}/></span><h3>No {collections[kind].label.toLowerCase()} yet</h3><p>Create your first entry. It will remain a draft until you publish it.</p>{canEdit && <button className="text-link" onClick={() => setEditing({})}>Add the first entry <ArrowRight size={15}/></button>}</div>}</>}
        {view === "submissions" && <><div className="admin-page-heading"><div><Eyebrow>Private inbox</Eyebrow><h1>Submissions</h1><p>Enquiries and expressions of interest. Handle personal details with care.</p></div></div>{submissions.length ? <div className="submission-list">{submissions.map((entry)=><article key={entry.id} className="submission-card"><div className="submission-top"><div><span className="record-category">{entry.kind}</span><h3>{entry.name}</h3></div><select value={entry.status} onChange={(event)=>updateStatus(entry,event.target.value)}><option value="new">New</option><option value="reviewing">Reviewing</option><option value="contacted">Contacted</option><option value="closed">Closed</option></select></div><div className="submission-contact">{entry.email}{entry.phone && ` · ${entry.phone}`}</div><p>{entry.message}</p><small>{new Date(entry.created_at).toLocaleString()}</small></article>)}</div>:<div className="empty-state admin-empty"><span className="empty-icon"><Mail size={22}/></span><h3>Your inbox is clear</h3><p>New messages from the website will appear here.</p></div>}</>}
        {view === "users" && user.role === "super_administrator" && <><div className="admin-page-heading"><div><Eyebrow>Restricted area</Eyebrow><h1>Users & roles</h1><p>Give each team member only the access needed for their work.</p></div></div><form className="editor-form user-create-form" onSubmit={createUser}><div className="editor-heading"><div><h2>Add a team account</h2><p>Passwords must be at least 12 characters.</p></div></div><div className="editor-grid"><label>Email address<input name="email" type="email" required/></label><label>Temporary password<input name="password" type="password" minLength="12" required/></label><label>Role<select name="role" defaultValue="editor"><option value="administrator">Administrator</option><option value="editor">Editor</option><option value="content_contributor">Content contributor</option><option value="applications_reviewer">Applications reviewer</option><option value="super_administrator">Super administrator</option></select></label><div className="editor-user-submit"><button className="button button-dark">Create account <ArrowRight size={16}/></button></div></div></form><div className="admin-list-header"><h2>Team accounts <span>{users.length}</span></h2><span>Deactivated accounts cannot sign in</span></div><div className="admin-table">{users.map((member)=><article key={member.id} className="admin-row user-row"><div className="row-thumb"><ShieldCheck size={17}/></div><div className="row-info"><strong>{member.email}{member.id === user.id ? " (you)" : ""}</strong><span>Added {new Date(member.created_at).toLocaleDateString()}</span></div><select aria-label={`Role for ${member.email}`} value={member.role} onChange={(event)=>updateUser(member.id,{role:event.target.value})}><option value="super_administrator">Super admin</option><option value="administrator">Administrator</option><option value="editor">Editor</option><option value="content_contributor">Contributor</option><option value="applications_reviewer">Reviewer</option></select><span className={`status-pill ${member.active ? "status-published" : "status-archived"}`}>{member.active ? "active" : "inactive"}</span><div className="row-actions"><button disabled={member.id === user.id} onClick={()=>updateUser(member.id,{active:!member.active})}>{member.active ? "Deactivate" : "Reactivate"}</button></div></article>)}</div></>}
      </div>
    </main></div>;
}

export default function App() {
  return <Routes>
    <Route path="/admin" element={<Login/>}/><Route path="/admin/*" element={<Admin/>}/>
    <Route path="/" element={<SiteLayout><Home/></SiteLayout>}/>
    <Route path="/about" element={<SiteLayout><About/></SiteLayout>}/>
    <Route path="/programmes" element={<SiteLayout><CollectionPage kind="programmes" title={<>Ideas becoming<br /><em>pathways.</em></>} copy="Discover the focus areas ABOF is exploring to support young people and community development." /></SiteLayout>}/>
    <Route path="/programmes/:slug" element={<SiteLayout><RecordDetail kind="programmes"/></SiteLayout>}/>
    <Route path="/projects" element={<SiteLayout><CollectionPage kind="projects" title={<>Work taking<br /><em>root.</em></>} copy="Projects and activities will be shared here when they are confirmed and ready to publish." /></SiteLayout>}/>
    <Route path="/projects/:slug" element={<SiteLayout><RecordDetail kind="projects"/></SiteLayout>}/>
    <Route path="/impact" element={<SiteLayout><CollectionPage kind="impact" title={<>Impact with<br /><em>integrity.</em></>} copy="We believe in sharing results honestly, with clear context and care for the people behind every story. Only verified results will be published." /></SiteLayout>}/>
    <Route path="/impact/:slug" element={<SiteLayout><RecordDetail kind="impact"/></SiteLayout>}/>
    <Route path="/leadership" element={<SiteLayout><CollectionPage kind="leadership" title={<>People behind<br /><em>the purpose.</em></>} copy="Meet Foundation leaders and team members as their roles and profiles are confirmed and approved." /></SiteLayout>}/>
    <Route path="/leadership/:slug" element={<SiteLayout><RecordDetail kind="leadership"/></SiteLayout>}/>
    <Route path="/news" element={<SiteLayout><CollectionPage kind="news" title={<>Stories worth<br /><em>sharing.</em></>} copy="Updates, opportunities and announcements from the Foundation and the communities around us." /></SiteLayout>}/>
    <Route path="/news/:slug" element={<SiteLayout><RecordDetail kind="news"/></SiteLayout>}/>
    <Route path="/events" element={<SiteLayout><CollectionPage kind="events" title={<>Let's meet<br /><em>and make.</em></>} copy="Find upcoming events and community opportunities as they are announced." /></SiteLayout>}/>
    <Route path="/events/:slug" element={<SiteLayout><RecordDetail kind="events"/></SiteLayout>}/>
    <Route path="/publications" element={<SiteLayout><CollectionPage kind="publications" title={<>Reports &<br /><em>resources.</em></>} copy="Approved reports, publications and resources will be shared here." /></SiteLayout>}/>
    <Route path="/publications/:slug" element={<SiteLayout><RecordDetail kind="publications"/></SiteLayout>}/>
    <Route path="/gallery" element={<SiteLayout><CollectionPage kind="gallery" title={<>Moments of<br /><em>possibility.</em></>} copy="Approved photographs and stories from the Foundation and the communities around us." /></SiteLayout>}/>
    <Route path="/gallery/:slug" element={<SiteLayout><RecordDetail kind="gallery"/></SiteLayout>}/>
    <Route path="/get-involved" element={<SiteLayout><GetInvolved/></SiteLayout>}/>
    <Route path="/support" element={<SiteLayout><Support/></SiteLayout>}/>
    <Route path="/contact" element={<SiteLayout><Contact/></SiteLayout>}/>
    <Route path="*" element={<SiteLayout><NotFound/></SiteLayout>}/>
  </Routes>;
}
