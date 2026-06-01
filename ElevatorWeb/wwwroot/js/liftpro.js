// ═══════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════
const S = {
  lang: 'ar',
  theme: 'light',
  sidebarCollapsed: false,
  dashInited: false,
};
const CHARTS = {};

// ═══════════════════════════════════════════════════
// VIEW ROUTER
// ═══════════════════════════════════════════════════
function goView(id) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) {
    el.classList.add('active');
    if (id === 'v-dash') initDash();
  }
  window.scrollTo(0, 0);
}

// ═══════════════════════════════════════════════════
// LANGUAGE
// ═══════════════════════════════════════════════════
function setLang(lang) {
  S.lang = lang;
  const html = document.documentElement;
  html.setAttribute('lang', lang);
  html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  html.setAttribute('data-lang', lang);

  const bsLink = document.getElementById('bsLink');
  bsLink.href = lang === 'ar'
    ? 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.rtl.min.css'
    : 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css';

  // Update bilingual elements
  document.querySelectorAll('[data-ar]').forEach(el => {
    const txt = el.getAttribute('data-' + lang);
    if (txt && el.tagName !== 'INPUT') el.textContent = txt;
  });

  // Placeholders
  document.querySelectorAll('[data-ar-ph]').forEach(el => {
    const ph = el.getAttribute('data-' + lang + '-ph');
    if (ph) el.placeholder = ph;
  });

  // Lang buttons
  document.querySelectorAll('.lang-pill').forEach(b => {
    b.classList.remove('active');
    const txt = b.textContent.trim();
    if ((lang === 'ar' && txt === 'عربي') || (lang === 'en' && txt === 'English')) {
      b.classList.add('active');
    }
  });

  // Topbar lang button
  const tbLang = document.getElementById('lang-btn');
  if (tbLang) tbLang.textContent = lang === 'ar' ? 'EN' : 'عر';

  updateDashDate();
}

function toggleLang() { setLang(S.lang === 'ar' ? 'en' : 'ar'); }

// ═══════════════════════════════════════════════════
// THEME
// ═══════════════════════════════════════════════════
function toggleTheme() {
  S.theme = S.theme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', S.theme);
  const btn = document.getElementById('theme-btn');
  if (btn) btn.innerHTML = S.theme === 'dark' ? '<i class="bi bi-sun"></i>' : '<i class="bi bi-moon-stars"></i>';
  refreshChartTheme();
}

// ═══════════════════════════════════════════════════
// SIDEBAR
// ═══════════════════════════════════════════════════
function toggleSidebar() {
  const sb = document.getElementById('sidebar');
  const ov = document.getElementById('mob-overlay');
  if (!sb) return;
  if (window.innerWidth <= 991) {
    sb.classList.toggle('mob-show');
    ov && ov.classList.toggle('show');
  } else {
    S.sidebarCollapsed = !S.sidebarCollapsed;
    sb.classList.toggle('collapsed', S.sidebarCollapsed);
    resizeTopbarForCollapse();
  }
}

function closeSidebar() {
  const sb = document.getElementById('sidebar');
  const ov = document.getElementById('mob-overlay');
  if (sb) sb.classList.remove('mob-show');
  if (ov) ov.classList.remove('show');
}

function resizeTopbarForCollapse() {
  const topbar = document.getElementById('topbar');
  const mainWrap = document.querySelector('.main-wrap');
  const w = S.sidebarCollapsed ? 'var(--sb-min)' : 'var(--sb-width)';
  if (topbar) {
    if (S.lang === 'ar') { topbar.style.marginRight = w; topbar.style.marginLeft = ''; }
    else { topbar.style.marginLeft = w; topbar.style.marginRight = ''; }
  }
  if (mainWrap) {
    if (S.lang === 'ar') { mainWrap.style.marginRight = w; mainWrap.style.marginLeft = ''; }
    else { mainWrap.style.marginLeft = w; mainWrap.style.marginRight = ''; }
  }
}

// Nav link clicks
document.querySelectorAll('.sb-link').forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    document.querySelectorAll('.sb-link').forEach(l => l.classList.remove('active'));
    this.classList.add('active');
    if (window.innerWidth <= 991) closeSidebar();
  });
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 991) closeSidebar();
});

// ═══════════════════════════════════════════════════
// AUTH HANDLERS
// ═══════════════════════════════════════════════════
function togglePwd(id, btn) {
  const inp = document.getElementById(id);
  if (!inp) return;
  const isPass = inp.type === 'password';
  inp.type = isPass ? 'text' : 'password';
  btn.innerHTML = isPass ? '<i class="bi bi-eye"></i>' : '<i class="bi bi-eye-slash"></i>';
}

function checkStrength(val) {
  let score = 0;
  if (val.length >= 8) score++;
  if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++;
  if (/\d/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;

  const bars = [document.getElementById('sb1'), document.getElementById('sb2'), document.getElementById('sb3'), document.getElementById('sb4')];
  const lbl = document.getElementById('strength-lbl');
  const colors = ['', 's1', 's2', 's3', 's4'];
  const labels = S.lang === 'ar'
    ? ['', 'ضعيفة جداً', 'ضعيفة', 'جيدة', 'قوية جداً']
    : ['', 'Very Weak', 'Weak', 'Good', 'Very Strong'];

  bars.forEach((b, i) => {
    if (!b) return;
    b.className = 'strength-bar';
    if (i < score) b.classList.add(colors[score]);
  });
  if (lbl) { lbl.textContent = labels[score] || ''; lbl.style.color = ['','#dc2626','#d97706','#d4960a','#059669'][score] || ''; }
}

function showAuthAlert(containerId, type, msg) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const icon = type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill';
  el.innerHTML = `<div class="auth-alert ${type}"><i class="bi ${icon}"></i><span>${msg}</span></div>`;
  el.style.display = 'block';
}

function setLoadingBtn(btnId, loading) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  if (loading) btn.classList.add('loading');
  else btn.classList.remove('loading');
}

function handleLogin(e) {
  e.preventDefault();
  const user = document.getElementById('l-user')?.value.trim();
  const pass = document.getElementById('l-pass')?.value.trim();
  const al = 'login-alert';

  if (!user || !pass) {
    showAuthAlert(al, 'error', S.lang === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
    return;
  }

  setLoadingBtn('login-btn', true);

  setTimeout(() => {
    setLoadingBtn('login-btn', false);
    const validUser = user === 'admin@liftpro.com' || user === 'admin';
    const validPass = pass === 'Admin@123';

    if (validUser && validPass) {
      showAuthAlert(al, 'success', S.lang === 'ar' ? '✓ تم تسجيل الدخول بنجاح! جاري التحويل...' : '✓ Login successful! Redirecting...');
      setTimeout(() => goView('v-dash'), 1100);
    } else {
      showAuthAlert(al, 'error', S.lang === 'ar' ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة. تحقق من البيانات وحاول مجدداً.' : 'Incorrect email or password. Please check your credentials.');
    }
  }, 1800);
}

function handleForgot(e) {
  e.preventDefault();
  const email = document.getElementById('f-email')?.value.trim();
  const al = 'forgot-alert';

  if (!email || !email.includes('@')) {
    showAuthAlert(al, 'error', S.lang === 'ar' ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Please enter a valid email address');
    return;
  }

  setLoadingBtn('forgot-btn', true);
  setTimeout(() => {
    setLoadingBtn('forgot-btn', false);
    showAuthAlert(al, 'success', S.lang === 'ar' ? `✓ تم إرسال رابط الاستعادة إلى ${email} — تحقق من بريدك` : `✓ Reset link sent to ${email} — check your inbox`);
    setTimeout(() => goView('v-reset'), 2500);
  }, 2000);
}

function handleReset(e) {
  e.preventDefault();
  const p1 = document.getElementById('r-pass1')?.value;
  const p2 = document.getElementById('r-pass2')?.value;
  const al = 'reset-alert';

  if (!p1 || !p2) {
    showAuthAlert(al, 'error', S.lang === 'ar' ? 'يرجى ملء جميع الحقول' : 'Please fill all fields');
    return;
  }
  if (p1.length < 8) {
    showAuthAlert(al, 'error', S.lang === 'ar' ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' : 'Password must be at least 8 characters');
    return;
  }
  if (p1 !== p2) {
    showAuthAlert(al, 'error', S.lang === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
    return;
  }

  setLoadingBtn('reset-btn', true);
  setTimeout(() => {
    setLoadingBtn('reset-btn', false);
    showAuthAlert(al, 'success', S.lang === 'ar' ? '✓ تم تغيير كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول' : '✓ Password changed successfully! You can now sign in');
    setTimeout(() => goView('v-login'), 2000);
  }, 1800);
}

function doLogout() {
  showToast('info', S.lang === 'ar' ? 'تسجيل الخروج' : 'Sign Out', S.lang === 'ar' ? 'جاري تسجيل الخروج...' : 'Signing out...');
  setTimeout(() => goView('v-login'), 1200);
}

// ═══════════════════════════════════════════════════
// DASHBOARD INIT
// ═══════════════════════════════════════════════════
function initDash() {
  updateDashDate();
  if (!S.dashInited) {
    S.dashInited = true;
    setTimeout(() => {
      animateCounters();
      animateBars();
      initAllCharts();
    }, 200);
    setTimeout(() => showToast('success', S.lang === 'ar' ? 'مرحباً بك! 👋' : 'Welcome! 👋', S.lang === 'ar' ? 'تم تسجيل الدخول بنجاح إلى ليفت برو ERP' : 'Successfully signed into LiftPro ERP'), 700);
  }
}

function updateDashDate() {
  const el = document.getElementById('dash-date');
  if (!el) return;
  const opts = { weekday:'long', year:'numeric', month:'long', day:'numeric' };
  el.textContent = new Date().toLocaleDateString(S.lang === 'ar' ? 'ar-EG' : 'en-US', opts);
}

// ═══════════════════════════════════════════════════
// COUNTERS & BARS
// ═══════════════════════════════════════════════════
function animateCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = +el.getAttribute('data-count');
    let curr = 0;
    const step = Math.max(1, Math.ceil(target / 55));
    const id = setInterval(() => {
      curr = Math.min(curr + step, target);
      el.textContent = curr.toLocaleString(S.lang === 'ar' ? 'ar-EG' : 'en-US');
      if (curr >= target) clearInterval(id);
    }, 22);
  });
}

function animateBars() {
  document.querySelectorAll('.sc-prog-fill[data-w]').forEach(bar => {
    setTimeout(() => { bar.style.width = bar.getAttribute('data-w') + '%'; }, 400);
  });
}

// ═══════════════════════════════════════════════════
// CHARTS
// ═══════════════════════════════════════════════════
function chartTheme() {
  return {
    grid: S.theme === 'dark' ? 'rgba(255,255,255,.05)' : 'rgba(15,23,42,.06)',
    text: S.theme === 'dark' ? '#64748b' : '#64748b',
    font: "'Cairo','Barlow',sans-serif",
  };
}

const REV = {
  week: { labels:['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'], paid:[42,68,35,88,56,74,61], unpaid:[14,22,10,28,16,20,18] },
  month: { labels:['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'], paid:[380,430,510,460,590,480,620,540,680,580,720,620], unpaid:[90,110,80,140,70,95,60,120,85,100,75,90] },
  year:  { labels:['2020','2021','2022','2023','2024','2025'], paid:[1800,2500,3100,3800,4200,4850], unpaid:[600,700,550,480,420,320] },
};
let revPeriod = 'week';

function initAllCharts() {
  buildRevChart();
  buildDonut();
  buildWarehouseChart();
  buildEmployeesChart();
  buildComplaintsChart();
}

function switchChart(btn, period) {
  btn.closest('.cc-head-actions').querySelectorAll('.cc-filter-btn').forEach(b => b.classList.remove('act'));
  btn.classList.add('act');
  revPeriod = period;
  if (CHARTS.rev) {
    CHARTS.rev.data.labels = REV[period].labels;
    CHARTS.rev.data.datasets[0].data = REV[period].paid;
    CHARTS.rev.data.datasets[1].data = REV[period].unpaid;
    CHARTS.rev.update();
  }
}

function buildRevChart() {
  const ctx = document.getElementById('rev-chart');
  if (!ctx || CHARTS.rev) return;
  const ct = chartTheme();
  const d = REV[revPeriod];

  CHARTS.rev = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: d.labels,
      datasets: [
        { label: S.lang==='ar'?'مدفوع (ألف ₪)':'Paid (K₪)', data: d.paid, backgroundColor:'rgba(30,84,168,.8)', borderRadius:6, borderSkipped:false },
        { label: S.lang==='ar'?'غير مدفوع':'Unpaid',         data: d.unpaid, backgroundColor:'rgba(220,38,38,.7)', borderRadius:6, borderSkipped:false },
      ]
    },
    options: {
      responsive:true, maintainAspectRatio:true,
      plugins: { legend:{ labels:{ color:ct.text, font:{family:ct.font,size:12}, boxWidth:12, padding:16 } }, tooltip:{rtl:S.lang==='ar'} },
      scales: {
        x:{ grid:{color:ct.grid}, ticks:{color:ct.text,font:{family:ct.font,size:11}} },
        y:{ grid:{color:ct.grid}, ticks:{color:ct.text,font:{family:ct.font,size:11}} }
      }
    }
  });
}

function buildDonut() {
  const ctx = document.getElementById('proj-donut');
  if (!ctx || CHARTS.donut) return;
  const ct = chartTheme();
  const labels = S.lang==='ar' ? ['نشطة','مكتملة','متأخرة','مخططة'] : ['Active','Completed','Delayed','Planned'];
  const vals = [42,95,11,0];
  const colors = ['#1e54a8','#059669','#dc2626','#7c3aed'];

  CHARTS.donut = new Chart(ctx, {
    type:'doughnut',
    data:{ labels, datasets:[{ data:vals, backgroundColor:colors, borderWidth:3, borderColor: S.theme==='dark'?'#0c1828':'#fff', hoverBorderWidth:5 }] },
    options:{ responsive:true, cutout:'72%', plugins:{ legend:{display:false}, tooltip:{rtl:S.lang==='ar'} } }
  });

  const leg = document.getElementById('donut-legend');
  if (leg) {
    leg.innerHTML = '';
    labels.forEach((l,i) => {
      leg.innerHTML += `<div style="display:flex;align-items:center;gap:5px;font-size:11.5px;color:var(--text-muted)"><span style="width:8px;height:8px;border-radius:50%;background:${colors[i]};display:inline-block;flex-shrink:0"></span>${l}<b style="color:var(--text-primary);margin-right:2px">${vals[i]}</b></div>`;
    });
  }
}

function buildWarehouseChart() {
  const ctx = document.getElementById('wh-chart');
  if (!ctx || CHARTS.wh) return;
  const ct = chartTheme();
  const labels = S.lang==='ar' ? ['كابلات','محركات','أبواب','لوحات','مفاتيح','زيوت'] : ['Cables','Motors','Doors','Panels','Switches','Oils'];
  CHARTS.wh = new Chart(ctx, {
    type:'bar',
    data:{ labels, datasets:[
      { label:S.lang==='ar'?'متوفر':'Available', data:[45,23,18,60,35,50], backgroundColor:'rgba(5,150,105,.8)', borderRadius:5 },
      { label:S.lang==='ar'?'مستخدم':'Used',     data:[30,15,10,40,20,25], backgroundColor:'rgba(30,84,168,.7)', borderRadius:5 },
    ]},
    options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{labels:{color:ct.text,font:{family:ct.font,size:11},boxWidth:10,padding:12}}}, scales:{ x:{grid:{color:ct.grid},ticks:{color:ct.text,font:{size:10,family:ct.font}}}, y:{grid:{color:ct.grid},ticks:{color:ct.text,font:{size:10}}} } }
  });
}

function buildEmployeesChart() {
  const ctx = document.getElementById('emp-chart');
  if (!ctx || CHARTS.emp) return;
  const ct = chartTheme();
  const labels = S.lang==='ar' ? ['يناير','فبراير','مارس','أبريل','مايو','يونيو'] : ['Jan','Feb','Mar','Apr','May','Jun'];
  CHARTS.emp = new Chart(ctx, {
    type:'line',
    data:{ labels, datasets:[
      { label:S.lang==='ar'?'مهام منجزة':'Completed', data:[45,60,55,78,65,82], borderColor:'#059669', backgroundColor:'rgba(5,150,105,.1)', fill:true, tension:0.4, pointRadius:4, borderWidth:2.5 },
      { label:S.lang==='ar'?'مهام متأخرة':'Delayed',  data:[12,8,15,6,10,5],  borderColor:'#dc2626', backgroundColor:'rgba(220,38,38,.07)', fill:true, tension:0.4, pointRadius:4, borderWidth:2.5 },
    ]},
    options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{labels:{color:ct.text,font:{family:ct.font,size:11},boxWidth:10,padding:12}}}, scales:{ x:{grid:{color:ct.grid},ticks:{color:ct.text,font:{size:10,family:ct.font}}}, y:{grid:{color:ct.grid},ticks:{color:ct.text,font:{size:10}}} } }
  });
}

function buildComplaintsChart() {
  const ctx = document.getElementById('comp-chart');
  if (!ctx || CHARTS.comp) return;
  const ct = chartTheme();
  const labels = S.lang==='ar' ? ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو'] : ['Jan','Feb','Mar','Apr','May','Jun','Jul'];
  CHARTS.comp = new Chart(ctx, {
    type:'bar',
    data:{ labels, datasets:[
      { label:S.lang==='ar'?'مفتوحة':'Open',    data:[8,12,6,15,9,7,12], backgroundColor:'rgba(220,38,38,.78)', borderRadius:5 },
      { label:S.lang==='ar'?'محلولة':'Resolved', data:[5,10,6,11,8,7,10], backgroundColor:'rgba(5,150,105,.78)', borderRadius:5 },
    ]},
    options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{labels:{color:ct.text,font:{family:ct.font,size:11},boxWidth:10,padding:12}}}, scales:{ x:{grid:{color:ct.grid},ticks:{color:ct.text,font:{size:10,family:ct.font}}}, y:{grid:{color:ct.grid},ticks:{color:ct.text,font:{size:10}}} } }
  });
}

function refreshChartTheme() {
  const ct = chartTheme();
  Object.values(CHARTS).forEach(ch => {
    if (!ch) return;
    if (ch.options?.scales) Object.values(ch.options.scales).forEach(ax => { if (ax.grid) ax.grid.color=ct.grid; if (ax.ticks) ax.ticks.color=ct.text; });
    if (ch.options?.plugins?.legend?.labels) ch.options.plugins.legend.labels.color=ct.text;
    if (ch.config?.type==='doughnut' && ch.data?.datasets?.[0]) ch.data.datasets[0].borderColor=S.theme==='dark'?'#0c1828':'#fff';
    ch.update();
  });
}

// ═══════════════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════════════
const TOAST_CFG = {
  success: { icon:'bi-check-circle-fill', color:'var(--success)' },
  danger:  { icon:'bi-x-circle-fill',     color:'var(--danger)' },
  warning: { icon:'bi-exclamation-triangle-fill', color:'var(--warning)' },
  info:    { icon:'bi-info-circle-fill',   color:'var(--info)' },
};

function showToast(type='success', title='', msg='') {
  const dock = document.getElementById('toast-dock');
  if (!dock) return;
  const cfg = TOAST_CFG[type] || TOAST_CFG.success;
  const t = document.createElement('div');
  t.className = `toast-item t-${type}`;
  t.style.borderColor = cfg.color;
  t.innerHTML = `
    <i class="bi ${cfg.icon} toast-ic" style="color:${cfg.color}"></i>
    <div class="toast-content"><div class="t-title">${title}</div><div class="t-msg">${msg}</div></div>
    <button class="toast-close" onclick="this.parentElement.remove()"><i class="bi bi-x"></i></button>
  `;
  dock.appendChild(t);
  setTimeout(() => {
    t.style.opacity='0'; t.style.transform='translateY(8px)'; t.style.transition='all .3s';
    setTimeout(() => t.remove(), 320);
  }, 5000);
}

// ═══════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  setLang('ar');
  // Set initial placeholder
  const gs = document.getElementById('global-search');
  if (gs) gs.placeholder = 'بحث في النظام...';
});


// ═══════════════════════════════════════════════════
// STAT QUICK-ACCESS PANEL — CONFIG & LOGIC
// ═══════════════════════════════════════════════════

const STAT_CONFIG = {
  'proj-total': {
    clr:'#1e54a8', icon:'bi-folder2', num:'148', lbl:'إجمالي المشاريع',
    qActions:[
      {icon:'bi-plus-lg',            label:'مشروع جديد',       sub:'New Project',     fn:"showToast('success','جديد','فتح نموذج مشروع')"},
      {icon:'bi-search',             label:'بحث المشاريع',      sub:'Search',          fn:"showToast('info','بحث','')"},
      {icon:'bi-file-earmark-excel', label:'تصدير Excel',       sub:'Export',          fn:"showToast('success','Excel','تصدير قائمة المشاريع')"},
      {icon:'bi-printer',            label:'طباعة',             sub:'Print List',      fn:"showToast('info','طباعة','')"},
    ],
    rows:[
      {icon:'bi-play-circle',   iconBg:'#d1fae5', iconClr:'#059669', name:'نشطة',    sub:'Active',    val:'42',  chip:{txt:'نشط',   cls:'sp-chip-ok'},   prog:28},
      {icon:'bi-check-circle',  iconBg:'#e0f2fe', iconClr:'#0284c7', name:'مكتملة',  sub:'Completed', val:'95',  chip:{txt:'مكتمل', cls:'sp-chip-info'},  prog:64},
      {icon:'bi-clock-history', iconBg:'#fee2e2', iconClr:'#dc2626', name:'متأخرة',  sub:'Delayed',   val:'11',  chip:{txt:'متأخر', cls:'sp-chip-err'},   prog:7},
      {icon:'bi-hourglass',     iconBg:'#ede9fe', iconClr:'#7c3aed', name:'تخطيط',   sub:'Planning',  val:'0',   chip:{txt:'تخطيط', cls:'sp-chip-purp'},  prog:0},
    ],
    footLabel:'كل المشاريع',
  },
  'proj-active': {
    clr:'#059669', icon:'bi-play-circle', num:'42', lbl:'مشاريع نشطة',
    qActions:[
      {icon:'bi-eye',           label:'عرض النشطة',    sub:'View Active',      fn:"showToast('info','عرض','')"},
      {icon:'bi-bell',          label:'تنبيهات',        sub:'Alerts',           fn:"showToast('warn','تنبيه','11 مشروع متأخر')"},
      {icon:'bi-calendar-event',label:'الجدول',         sub:'Schedule',         fn:"showToast('info','جدول','')"},
      {icon:'bi-people',        label:'توزيع الفريق',   sub:'Team Assign',      fn:"showToast('info','فريق','')"},
    ],
    rows:[
      {icon:'bi-building', iconBg:'#dbeafe', iconClr:'#1e54a8', name:'برج الأندلس',        sub:'QT-2026-001', val:'65%', chip:{txt:'نشط',   cls:'sp-chip-ok'},   prog:65},
      {icon:'bi-building', iconBg:'#d1fae5', iconClr:'#059669', name:'أبراج الساحل',        sub:'QT-2026-002', val:'48%', chip:{txt:'نشط',   cls:'sp-chip-ok'},   prog:48},
      {icon:'bi-building', iconBg:'#fee2e2', iconClr:'#dc2626', name:'فندق كراون',          sub:'QT-2026-003', val:'30%', chip:{txt:'متأخر', cls:'sp-chip-err'},  prog:30},
      {icon:'bi-building', iconBg:'#ede9fe', iconClr:'#7c3aed', name:'برج الأعمال الذكي',  sub:'QT-2026-004', val:'12%', chip:{txt:'تخطيط', cls:'sp-chip-purp'}, prog:12},
    ],
    footLabel:'كل المشاريع النشطة',
  },
  'proj-done': {
    clr:'#0284c7', icon:'bi-check-circle', num:'95', lbl:'مشاريع مكتملة',
    qActions:[
      {icon:'bi-file-earmark-check', label:'تقارير الإنجاز', sub:'Completion Reports', fn:"showToast('info','تقرير','')"},
      {icon:'bi-star',               label:'تقييم العملاء',  sub:'Client Ratings',     fn:"showToast('info','تقييم','')"},
      {icon:'bi-file-earmark-excel', label:'تصدير',          sub:'Export',             fn:"showToast('success','Excel','')"},
      {icon:'bi-graph-up',           label:'إحصاءات',        sub:'Statistics',         fn:"showToast('info','إحصاء','')"},
    ],
    rows:[
      {icon:'bi-calendar-check', iconBg:'#d1fae5', iconClr:'#059669', name:'هذا الشهر',    sub:'This month',     val:'6',   chip:{txt:'✓', cls:'sp-chip-ok'},   prog:100},
      {icon:'bi-calendar-check', iconBg:'#d1fae5', iconClr:'#059669', name:'هذا العام',    sub:'This year',      val:'38',  chip:{txt:'✓', cls:'sp-chip-ok'},   prog:100},
      {icon:'bi-clock-history',  iconBg:'#e0f2fe', iconClr:'#0284c7', name:'في الموعد',    sub:'On time',        val:'87%', chip:{txt:'↑', cls:'sp-chip-info'}, prog:87},
      {icon:'bi-exclamation',    iconBg:'#fef3c7', iconClr:'#d97706', name:'بعد التأخير',  sub:'Late delivery',  val:'8',   chip:{txt:'⚠', cls:'sp-chip-warn'}, prog:8},
    ],
    footLabel:'أرشيف المشاريع',
  },
  'proj-delayed': {
    clr:'#dc2626', icon:'bi-clock-history', num:'11', lbl:'مشاريع متأخرة',
    qActions:[
      {icon:'bi-bell-fill',          label:'إرسال تنبيهات',   sub:'Send Alerts',      fn:"showToast('warn','تنبيه','تم إرسال تنبيهات لكل المشاريع المتأخرة')"},
      {icon:'bi-telephone',          label:'تواصل مع الفريق', sub:'Contact Team',     fn:"showToast('info','تواصل','')"},
      {icon:'bi-calendar-plus',      label:'مراجعة الجدول',   sub:'Review Schedule',  fn:"showToast('info','جدول','')"},
      {icon:'bi-file-earmark-text',  label:'تقرير التأخر',    sub:'Delay Report',     fn:"showToast('info','تقرير','')"},
    ],
    rows:[
      {icon:'bi-building', iconBg:'#fee2e2', iconClr:'#dc2626', name:'فندق كراون — 6 مصاعد',  sub:'متأخر 21 يوم', val:'30%', chip:{txt:'-21d', cls:'sp-chip-err'},  prog:30},
      {icon:'bi-building', iconBg:'#fef3c7', iconClr:'#d97706', name:'برج الزاوية — 2 مصاعد', sub:'متأخر 7 أيام', val:'45%', chip:{txt:'-7d',  cls:'sp-chip-warn'}, prog:45},
    ],
    footLabel:'متابعة المتأخرة',
  },
  'clients': {
    clr:'#7c3aed', icon:'bi-buildings', num:'312', lbl:'إجمالي العملاء',
    qActions:[
      {icon:'bi-person-plus',        label:'عميل جديد',        sub:'New Client',       fn:"showToast('success','جديد','فتح نموذج عميل')"},
      {icon:'bi-search',             label:'بحث العملاء',       sub:'Search Clients',   fn:"showToast('info','بحث','')"},
      {icon:'bi-file-earmark-excel', label:'تصدير',             sub:'Export',           fn:"showToast('success','Excel','')"},
      {icon:'bi-envelope',           label:'مراسلة جماعية',     sub:'Mass Email',       fn:"showToast('info','بريد','')"},
    ],
    rows:[
      {icon:'bi-check-circle', iconBg:'#d1fae5', iconClr:'#059669', name:'نشطون',       sub:'Active',       val:'280', chip:{txt:'90%', cls:'sp-chip-ok'},   prog:90},
      {icon:'bi-hourglass',    iconBg:'#fef3c7', iconClr:'#d97706', name:'قيد التفاوض', sub:'Negotiating',  val:'24',  chip:{txt:'8%',  cls:'sp-chip-warn'}, prog:8},
      {icon:'bi-x-circle',     iconBg:'#fee2e2', iconClr:'#dc2626', name:'منتهون',       sub:'Closed',       val:'8',   chip:{txt:'3%',  cls:'sp-chip-err'},  prog:3},
      {icon:'bi-graph-up',     iconBg:'#ede9fe', iconClr:'#7c3aed', name:'جدد هذا الشهر',sub:'New this month',val:'+12',chip:{txt:'↑',  cls:'sp-chip-purp'}, prog:0},
    ],
    footLabel:'كل العملاء',
  },
  'employees': {
    clr:'#d97706', icon:'bi-people', num:'67', lbl:'إجمالي الموظفين',
    qActions:[
      {icon:'bi-person-plus',       label:'موظف جديد',         sub:'New Employee',     fn:"showToast('success','جديد','فتح نموذج موظف')"},
      {icon:'bi-calendar-check',    label:'الحضور',             sub:'Attendance',       fn:"showToast('info','حضور','')"},
      {icon:'bi-diagram-3',         label:'الهيكل التنظيمي',    sub:'Org Chart',        fn:"showToast('info','هيكل','')"},
      {icon:'bi-file-earmark-text', label:'التقارير',           sub:'Reports',          fn:"showToast('info','تقرير','')"},
    ],
    rows:[
      {icon:'bi-person-check',   iconBg:'#d1fae5', iconClr:'#059669', name:'نشطون',            sub:'Active',        val:'62',  chip:{txt:'93%', cls:'sp-chip-ok'},   prog:93},
      {icon:'bi-person-x',       iconBg:'#fee2e2', iconClr:'#dc2626', name:'غير نشطين',         sub:'Inactive',      val:'5',   chip:{txt:'7%',  cls:'sp-chip-err'},  prog:7},
      {icon:'bi-folder2',        iconBg:'#dbeafe', iconClr:'#1e54a8', name:'مُعيَّنون لمشاريع',  sub:'On Projects',   val:'48',  chip:{txt:'72%', cls:'sp-chip-info'}, prog:72},
      {icon:'bi-shield-check',   iconBg:'#fef3c7', iconClr:'#d97706', name:'مديرون',             sub:'Managers',      val:'5',   chip:{txt:'8%',  cls:'sp-chip-warn'}, prog:8},
    ],
    footLabel:'إدارة الموظفين',
  },
  'revenue': {
    clr:'#d4960a', icon:'bi-graph-up-arrow', num:'₪4.85M', lbl:'إجمالي الإيرادات',
    qActions:[
      {icon:'bi-cash-stack',         label:'الحسابات',          sub:'Accounts',         fn:"showToast('info','حسابات','')"},
      {icon:'bi-receipt',            label:'الفواتير',           sub:'Invoices',         fn:"showToast('info','فواتير','')"},
      {icon:'bi-bar-chart',          label:'التقارير',           sub:'Reports',          fn:"showToast('info','تقرير','')"},
      {icon:'bi-file-earmark-excel', label:'تصدير',              sub:'Export',           fn:"showToast('success','Excel','')"},
    ],
    finance:[
      {label:'إيرادات هذا الشهر',          val:'₪620K',  clr:'#059669', pct:78},
      {label:'إجمالي هذا العام',            val:'₪4.85M', clr:'#d4960a', pct:82},
      {label:'نمو مقارنة بالعام الماضي',   val:'+22%',   clr:'#059669', pct:22},
      {label:'المحصل الفعلي',               val:'₪3.8M',  clr:'#0284c7', pct:78},
      {label:'المتبقي للتحصيل',             val:'₪1.05M', clr:'#dc2626', pct:22},
    ],
    footLabel:'تقرير الإيرادات',
  },
  'outstanding': {
    clr:'#e11d48', icon:'bi-hourglass-split', num:'₪1.2M', lbl:'مدفوعات معلقة',
    qActions:[
      {icon:'bi-bell-fill',          label:'إرسال تذكيرات',    sub:'Send Reminders',   fn:"showToast('warn','تذكير','تم إرسال تذكيرات لجميع المتأخرين')"},
      {icon:'bi-telephone',          label:'متابعة هاتفي',      sub:'Follow-up Call',   fn:"showToast('info','متابعة','')"},
      {icon:'bi-file-earmark-text',  label:'تقرير التحصيل',    sub:'Collection Report',fn:"showToast('info','تقرير','')"},
      {icon:'bi-cash',               label:'تسجيل دفعة',        sub:'Record Payment',   fn:"showToast('success','دفعة','فتح نموذج تسجيل دفعة')"},
    ],
    rows:[
      {icon:'bi-building', iconBg:'#fee2e2', iconClr:'#dc2626', name:'أبراج الساحل',  sub:'تأخر 30+ يوم',  val:'₪420K', chip:{txt:'عاجل',  cls:'sp-chip-err'},  prog:35},
      {icon:'bi-building', iconBg:'#fef3c7', iconClr:'#d97706', name:'فندق كراون',    sub:'تأخر 15 يوم',   val:'₪285K', chip:{txt:'متأخر', cls:'sp-chip-warn'}, prog:24},
      {icon:'bi-building', iconBg:'#fef3c7', iconClr:'#d97706', name:'برج الزاوية',   sub:'يستحق قريباً',  val:'₪185K', chip:{txt:'قريباً',cls:'sp-chip-warn'}, prog:15},
      {icon:'bi-building', iconBg:'#e0f2fe', iconClr:'#0284c7', name:'مشاريع أخرى',  sub:'متعددة',         val:'₪310K', chip:{txt:'معلق',  cls:'sp-chip-info'}, prog:26},
    ],
    footLabel:'كل المستحقات',
  },
  'invoices-paid': {
    clr:'#059669', icon:'bi-receipt-cutoff', num:'284', lbl:'فواتير مدفوعة',
    qActions:[
      {icon:'bi-receipt',            label:'كل الفواتير',       sub:'All Invoices',     fn:"showToast('info','فواتير','')"},
      {icon:'bi-download',           label:'تحميل PDF',         sub:'Download PDF',     fn:"showToast('success','PDF','تحميل كل الفواتير')"},
      {icon:'bi-file-earmark-excel', label:'تصدير Excel',       sub:'Export Excel',     fn:"showToast('success','Excel','')"},
      {icon:'bi-graph-up',           label:'إحصاءات',           sub:'Statistics',       fn:"showToast('info','إحصاء','')"},
    ],
    rows:[
      {icon:'bi-calendar-check',     iconBg:'#d1fae5', iconClr:'#059669', name:'هذا الشهر',    sub:'This month',     val:'24',  chip:{txt:'✓',  cls:'sp-chip-ok'},   prog:100},
      {icon:'bi-calendar-check',     iconBg:'#d1fae5', iconClr:'#059669', name:'الشهر الماضي', sub:'Last month',     val:'31',  chip:{txt:'✓',  cls:'sp-chip-ok'},   prog:100},
      {icon:'bi-graph-up-arrow',     iconBg:'#dbeafe', iconClr:'#0284c7', name:'نسبة التحصيل', sub:'Collection rate',val:'90%', chip:{txt:'↑',  cls:'sp-chip-info'}, prog:90},
      {icon:'bi-currency-exchange',  iconBg:'#fef3c7', iconClr:'#d97706', name:'متوسط الفاتورة',sub:'Avg invoice',   val:'₪17K',chip:{txt:'₪',  cls:'sp-chip-warn'}, prog:0},
    ],
    footLabel:'سجل الفواتير',
  },
  'invoices-delayed': {
    clr:'#dc2626', icon:'bi-exclamation-triangle', num:'23', lbl:'فواتير متأخرة',
    qActions:[
      {icon:'bi-bell-fill',          label:'إرسال تذكيرات',    sub:'Send Reminders',   fn:"showToast('warn','تذكير','تم إرسال 23 تذكير')"},
      {icon:'bi-telephone-fill',     label:'متابعة هاتفي',      sub:'Call Follow-up',   fn:"showToast('info','اتصال','')"},
      {icon:'bi-file-earmark-text',  label:'تقرير',             sub:'Report',           fn:"showToast('info','تقرير','')"},
      {icon:'bi-flag-fill',          label:'تصعيد',             sub:'Escalate',         fn:"showToast('warn','تصعيد','تصعيد الحالات المتأخرة')"},
    ],
    rows:[
      {icon:'bi-alarm',             iconBg:'#fee2e2', iconClr:'#dc2626', name:'تأخر 30+ يوم',   sub:'+30 days',   val:'8',  chip:{txt:'حرج',   cls:'sp-chip-err'},  prog:35},
      {icon:'bi-clock',             iconBg:'#fef3c7', iconClr:'#d97706', name:'تأخر 15-30 يوم', sub:'15-30 days', val:'9',  chip:{txt:'متأخر', cls:'sp-chip-warn'}, prog:39},
      {icon:'bi-hourglass-split',   iconBg:'#fffbeb', iconClr:'#d97706', name:'تأخر 7-15 يوم',  sub:'7-15 days',  val:'6',  chip:{txt:'قريباً',cls:'sp-chip-warn'}, prog:26},
    ],
    footLabel:'تحصيل المتأخرات',
  },
  'complaints': {
    clr:'#7c3aed', icon:'bi-chat-left-text', num:'34', lbl:'إجمالي الشكاوى',
    qActions:[
      {icon:'bi-plus-circle',       label:'شكوى جديدة',        sub:'New Complaint',    fn:"showToast('info','جديد','فتح نموذج شكوى')"},
      {icon:'bi-bell',              label:'تنبيهات',            sub:'Alerts',           fn:"showToast('warn','تنبيه','12 شكوى مفتوحة')"},
      {icon:'bi-check2-all',        label:'إغلاق المحلولة',    sub:'Close Resolved',   fn:"showToast('success','إغلاق','تم إغلاق الشكاوى المحلولة')"},
      {icon:'bi-file-earmark-text', label:'تقرير',             sub:'Report',           fn:"showToast('info','تقرير','')"},
    ],
    rows:[
      {icon:'bi-exclamation-circle',iconBg:'#fee2e2', iconClr:'#dc2626', name:'مفتوحة',        sub:'Open',         val:'12', chip:{txt:'⚠', cls:'sp-chip-err'},  prog:35},
      {icon:'bi-arrow-repeat',      iconBg:'#fef3c7', iconClr:'#d97706', name:'قيد المعالجة',   sub:'In Progress',  val:'8',  chip:{txt:'↻', cls:'sp-chip-warn'}, prog:24},
      {icon:'bi-check-circle',      iconBg:'#d1fae5', iconClr:'#059669', name:'مغلقة',           sub:'Closed',       val:'14', chip:{txt:'✓', cls:'sp-chip-ok'},   prog:41},
      {icon:'bi-stopwatch',         iconBg:'#e0f2fe', iconClr:'#0284c7', name:'متوسط وقت الحل', sub:'Avg resolution',val:'2.4d',chip:{txt:'⏱',cls:'sp-chip-info'}, prog:0},
    ],
    footLabel:'إدارة الشكاوى',
  },
  'warehouse': {
    clr:'#d97706', icon:'bi-box-seam', num:'8', lbl:'تنبيهات المستودع',
    qActions:[
      {icon:'bi-cart-plus',          label:'طلب شراء',          sub:'Purchase Order',   fn:"showToast('info','طلب','فتح طلب شراء جديد')"},
      {icon:'bi-box-arrow-in-down',  label:'إدخال مواد',        sub:'Stock In',         fn:"showToast('success','إدخال','فتح نموذج إدخال مواد')"},
      {icon:'bi-bell',               label:'مراجعة التنبيهات',  sub:'Review Alerts',    fn:"showToast('warn','تنبيه','8 أصناف تحتاج تجديد')"},
      {icon:'bi-file-earmark-text',  label:'تقرير المخزون',     sub:'Stock Report',     fn:"showToast('info','تقرير','')"},
    ],
    rows:[
      {icon:'bi-x-octagon-fill',       iconBg:'#fee2e2', iconClr:'#dc2626', name:'كابل فولاذي 12مم',       sub:'نفد المخزون',  val:'0 م',    chip:{txt:'نفد',    cls:'sp-chip-err'},  prog:0},
      {icon:'bi-exclamation-triangle', iconBg:'#fef3c7', iconClr:'#d97706', name:'لوحة تحكم إلكترونية',    sub:'منخفض جداً',   val:'2 قطعة', chip:{txt:'منخفض', cls:'sp-chip-warn'}, prog:40},
      {icon:'bi-exclamation-triangle', iconBg:'#fef3c7', iconClr:'#d97706', name:'زيت هيدروليكي ISO 46',    sub:'منخفض',        val:'8 لتر',  chip:{txt:'منخفض', cls:'sp-chip-warn'}, prog:40},
      {icon:'bi-check-circle',         iconBg:'#d1fae5', iconClr:'#059669', name:'باقي الأصناف (2835)',     sub:'مخزون كافٍ',   val:'✓',      chip:{txt:'كافٍ',   cls:'sp-chip-ok'},   prog:95},
    ],
    footLabel:'إدارة المستودع',
  },
};

let _activeSC = null;

function openStatPanel(stat, card) {
  const cfg = STAT_CONFIG[stat];
  if (!cfg) return;

  // Highlight active card
  if (_activeSC) _activeSC.classList.remove('stat-active');
  card.classList.add('stat-active');
  _activeSC = card;

  const panel   = document.getElementById('statPanel');
  const overlay = document.getElementById('statOverlay');
  if (!panel || !overlay) return;

  // Set panel colour
  panel.style.setProperty('--sp-clr', cfg.clr);
  document.getElementById('spColorBar').style.background = cfg.clr;
  document.getElementById('spIcon').innerHTML = `<i class="bi ${cfg.icon}" style="color:${cfg.clr}"></i>`;
  document.getElementById('spNum').textContent = cfg.num;
  document.getElementById('spNum').style.color = cfg.clr;
  document.getElementById('spLbl').textContent = cfg.lbl;

  // Footer
  document.getElementById('spFootLabel').textContent = cfg.footLabel;
  document.getElementById('spFootIcon').className    = 'bi bi-arrow-left';
  document.getElementById('spFootAction').onclick    = () => {
    closeStatPanel();
    showToast('info', cfg.footLabel, '');
  };

  // Build body HTML
  let html = '';

  // Quick actions grid
  if (cfg.qActions && cfg.qActions.length) {
    html += `<p class="sp-section-title"><i class="bi bi-lightning-charge"></i>وصول سريع</p>
    <div class="sp-actions">`;
    cfg.qActions.forEach(a => {
      html += `<div class="sp-action" onclick="${a.fn}">
        <i class="bi ${a.icon}" style="color:${cfg.clr};font-size:22px"></i>
        <span>${a.label}</span>
        <small>${a.sub}</small>
      </div>`;
    });
    html += `</div>`;
  }

  // Finance bars
  if (cfg.finance && cfg.finance.length) {
    html += `<p class="sp-section-title" style="margin-top:4px"><i class="bi bi-bar-chart"></i>التفاصيل المالية</p>`;
    cfg.finance.forEach(f => {
      html += `<div class="sp-fin-bar-wrap">
        <div class="sp-fin-bar-head">
          <span>${f.label}</span>
          <strong style="color:${f.clr}">${f.val}</strong>
        </div>
        <div class="sp-fin-track">
          <div class="sp-fin-fill" style="width:0%;background:${f.clr}"
               data-target="${f.pct}"></div>
        </div>
      </div>`;
    });
  }

  // Data rows
  if (cfg.rows && cfg.rows.length) {
    html += `<p class="sp-section-title" style="margin-top:${cfg.finance ? '18px' : '4px'}"><i class="bi bi-list-ul"></i>التفاصيل</p><div>`;
    cfg.rows.forEach(r => {
      html += `<div class="sp-row">
        <div class="sp-row-left">
          <div class="sp-row-icon" style="background:${r.iconBg};color:${r.iconClr}">
            <i class="bi ${r.icon}"></i>
          </div>
          <div>
            <div class="sp-row-name">${r.name}</div>
            <div class="sp-row-sub">${r.sub}</div>
            ${r.prog > 0
              ? `<div class="sp-prog" style="margin-top:4px;min-width:90px">
                   <div class="sp-prog-fill" style="width:0%;background:${r.iconClr}"
                        data-target="${r.prog}"></div>
                 </div>`
              : ''}
          </div>
        </div>
        <div style="text-align:start;flex-shrink:0">
          <div class="sp-row-val">${r.val}</div>
          ${r.chip ? `<span class="sp-chip ${r.chip.cls}">${r.chip.txt}</span>` : ''}
        </div>
      </div>`;
    });
    html += `</div>`;
  }

  document.getElementById('spBody').innerHTML = html;

  // Animate bars after render
  setTimeout(() => {
    document.querySelectorAll('#spBody .sp-fin-fill[data-target], #spBody .sp-prog-fill[data-target]').forEach(el => {
      el.style.width = el.getAttribute('data-target') + '%';
    });
  }, 80);

  // Open panel
  overlay.classList.add('open');
  requestAnimationFrame(() => panel.classList.add('open'));
  panel.focus();
}

function closeStatPanel() {
  const panel   = document.getElementById('statPanel');
  const overlay = document.getElementById('statOverlay');
  if (panel)   panel.classList.remove('open');
  if (overlay) overlay.classList.remove('open');
  if (_activeSC) { _activeSC.classList.remove('stat-active'); _activeSC = null; }
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeStatPanel();
});
