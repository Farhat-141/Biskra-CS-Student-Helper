/* ============================================================
   Biskra CS Student Helper — Semester Average Calculator
   ------------------------------------------------------------
   Open-source friendly structure:
   1) SETTINGS (easy to tweak)
   2) SEMESTER + MODULE DATA (edit this when curriculum changes)
   3) DOM/UTILS (helpers)
   4) UI BUILDING (renders inputs)
   5) CALCULATION (compute average + render table)
   6) EXAMPLES (optional demo data)
   7) ROUTER + BOOT (navigation + initialization)
============================================================ */



const modeBtn = document.getElementById('mode');

function applyTheme(theme) {
    document.body.classList.toggle('light', theme === 'light');
    localStorage.setItem('theme', theme);
}

const saved = localStorage.getItem('theme');
if (saved === 'light' || saved === 'dark') applyTheme(saved);

modeBtn.addEventListener('click', () => {
    const next = document.body.classList.contains('light') ? 'dark' : 'light';
    applyTheme(next);
});



/* =========================
   1) SETTINGS (edit here)
========================= */

/**
 * Continuous Assessment (CC) vs Exam weights.
 * Example: CC=40%, Exam=60%
 */
const WEIGHTS = {
    CC: 0.4,
    EXAM: 0.6,
};

/**
 * Mark boundaries.
 * Algeria typically uses 0..20 and PASS >= 10.
 */
const MARK_SCALE = {
    MIN: 0,
    MAX: 20,
    PASS: 10,
};


/* =========================
   2) SEMESTERS + MODULE DATA
   (students edit this part)
========================= */

/**
 * Module field guide:
 * - key: short id (must be unique within the semester)
 * - name: display name
 * - coef: coefficient (weight)
 * - single: only one input "Note" (e.g., English, Project)
 * - hasTP: TD + TP + Exam
 * - tpOnly: TP + Exam
 * - optional: choice module; ignored unless any input is filled
 *
 * IMPORTANT:
 * Exactly one of {single, hasTP, tpOnly} should be true.
 * If none are true -> TD + Exam.
 */
const MODULES = {
    // S1
    s1: [
        { key: "an1", name: "Analysis 1", coef: 4 },
        { key: "alg1", name: "Algebra 1", coef: 3 },
        { key: "asd1", name: "ASD 1", hasTP: true, coef: 4 },
        { key: "ms1", name: "MS 1", coef: 3 },
        { key: "ste", name: "STE", single: true, coef: 1 },
        { key: "eng", name: "English", single: true, coef: 1 },
        { key: "phy1", name: "Physics 1", coef: 2, optional: true },
        { key: "elec", name: "Electronics", coef: 2, optional: true },
    ],

    // S2
    s2: [
        { key: "an2", name: "Analysis 2", coef: 4 },
        { key: "alg2", name: "Algebra 2", coef: 2 },
        { key: "asd2", name: "ASD 2", hasTP: true, coef: 4 },
        { key: "ms2", name: "MS 2", coef: 2 },
        { key: "proba", name: "Proba/Stats", coef: 2 },
        { key: "ict", name: "ICT", single: true, coef: 1 },
        { key: "ptm", name: "PTM", tpOnly: true, coef: 1 },
        { key: "phy2", name: "Physics 2", coef: 2 },
    ],

    // S3 (kept exactly as you provided)
    s3: [
        { key: "algo", name: "Algo", hasTP: true, coef: 3 },
        { key: "archi", name: "Archi", hasTP: true, coef: 3 },
        { key: "tg", name: "TG", coef: 2 }, // TD + Exam
        { key: "si", name: "SI", coef: 3 }, // TD + Exam
        { key: "eng", name: "English", single: true, coef: 1 },
        { key: "mn", name: "MN", coef: 2 }, // TD + Exam
        { key: "lm", name: "LM", coef: 2 }, // TD + Exam
    ],

    // S4 (kept exactly as you provided)
    s4: [
        { key: "os", name: "OS", hasTP: true, coef: 3 },
        { key: "tl", name: "TL", coef: 2 }, // TD + Exam
        { key: "rx", name: "RX", hasTP: true, coef: 3 },
        { key: "bd", name: "BD", hasTP: true, coef: 3 },
        { key: "eng", name: "English", single: true, coef: 1 },
        { key: "poo", name: "POO", tpOnly: true, coef: 2 },
        { key: "web", name: "Web", tpOnly: true, coef: 2 },
    ],

    // S5
    s5: [
        { key: "os2", name: "OS 2", hasTP: true, coef: 2 },
        { key: "compil", name: "Compilation", hasTP: true, coef: 2 },
        { key: "logp", name: "Logic Prog", coef: 2 }, // TD + Exam
        { key: "gl2", name: "SE 2", hasTP: true, coef: 2 },
        { key: "mhi", name: "MHI", hasTP: true, coef: 2 },

        // choices (fill only the ones you take)
        { key: "ps", name: "Prob/Stats", coef: 2, optional: true },
        { key: "pl", name: "Linear Prog", coef: 2, optional: true },
        { key: "pp", name: "Paradigms", coef: 2, optional: true },
        { key: "ai", name: "AI", coef: 2, optional: true },

        { key: "eng", name: "English", coef: 1 }, // TD + Exam (as in your original)
    ],

    // S6
    s6: [
        { key: "mob", name: "Mobile", hasTP: true, coef: 3 },
        { key: "sec", name: "Security", coef: 3 }, // TD + Exam

        // choices
        { key: "adb", name: "Admin BD", coef: 2, optional: true },
        { key: "info", name: "Infographics", coef: 2, optional: true },
        { key: "ws", name: "Web Sem", coef: 2, optional: true },
        { key: "crypto", name: "Crypto", coef: 2, optional: true },

        { key: "sw", name: "Sci Writing", coef: 1 },         // TD + Exam
        { key: "proj", name: "Project", single: true, coef: 4 },
    ],
};

/**
 * Semesters config in a *fixed order* (S1..S6).
 * Using an array makes ordering explicit and stable. [web:36]
 */
const SEMESTERS = [
    { key: "s1", label: "S1 average" },
    { key: "s2", label: "S2 average" },
    { key: "s3", label: "S3 average" },
    { key: "s4", label: "S4 average" },
    { key: "s5", label: "S5 average" },
    { key: "s6", label: "S6 average" },
];


/* =========================
   3) DOM + UTILS
========================= */

const $ = (sel, root = document) => root.querySelector(sel);

function clampMark(v) {
    if (Number.isNaN(v)) return NaN;
    if (v < MARK_SCALE.MIN) return MARK_SCALE.MIN;
    if (v > MARK_SCALE.MAX) return MARK_SCALE.MAX;
    return v;
}

function isEmptyInput(el) {
    return !el || String(el.value).trim() === "";
}

function readVal(id) {
    const el = document.getElementById(id);
    if (!el) return NaN;
    return clampMark(parseFloat(el.value));
}

function setWarn(semKey, msg) {
    const el = document.getElementById(`warn_${semKey}`);
    el.textContent = msg || "";
    el.classList.toggle("show", !!msg);
}


/* =========================
   4) UI BUILDING
========================= */

function pageTemplate(semKey, avgLabel) {
    return `
    <div class="grid">
      <section class="card">
        <div class="hd">
          <div class="h">Marks</div>
          <div class="badge">Coefficients fixed</div>
        </div>
        <div class="bd">
          <div id="warn_${semKey}" class="warn"></div>
          <div class="modules" id="modules_${semKey}"></div>

          <div class="actions">
            <button id="btnCalc_${semKey}">Calculate</button>
            <button id="btnExample_${semKey}" class="secondary">Fill example</button>
            <button id="btnReset_${semKey}" class="secondary">Reset</button>
            <button id="btnHome_${semKey}" class="secondary">Home</button>
          </div>
        </div>
      </section>

      <aside class="card side">
        <div class="hd">
          <div class="h">Result</div>
          <div class="badge">Weighted average</div>
        </div>
        <div class="bd">
          <div class="stat">
            <div class="sub">${avgLabel}</div>
            <div class="big" id="avg_${semKey}">—</div>

            <div class="kpi">
              <span>Status</span>
              <strong id="status_${semKey}" class="sub">—</strong>
            </div>
            <div class="kpi">
              <span>Total coef</span>
              <strong id="sumCoef_${semKey}" class="sub">—</strong>
            </div>
          </div>

          <div class="stat">
            <div class="sub">Module marks</div>
            <table class="table" id="table_${semKey}">
              <thead>
                <tr>
                  <th>Module</th>
                  <th>Mark</th>
                  <th>Coef</th>
                </tr>
              </thead>
              <tbody id="tbody_${semKey}"></tbody>
            </table>
          </div>
        </div>
      </aside>
    </div>
  `;
}

function inputsTemplate(semKey, m) {
    // Single note module (one input)
    if (m.single) {
        return `
      <div class="row two">
        <div>
          <label>Note</label>
          <input type="number" step="0.25" min="${MARK_SCALE.MIN}" max="${MARK_SCALE.MAX}"
                 placeholder="${MARK_SCALE.MIN}..${MARK_SCALE.MAX}" id="${semKey}_${m.key}_note">
        </div>
        <div>
          <label>—</label>
          <input type="number" disabled placeholder="—">
        </div>
      </div>
    `;
    }

    // TD + TP + Exam
    if (m.hasTP) {
        return `
      <div class="row">
        <div><label>TD</label><input type="number" step="0.25" min="${MARK_SCALE.MIN}" max="${MARK_SCALE.MAX}"
             placeholder="${MARK_SCALE.MIN}..${MARK_SCALE.MAX}" id="${semKey}_${m.key}_td"></div>
        <div><label>TP</label><input type="number" step="0.25" min="${MARK_SCALE.MIN}" max="${MARK_SCALE.MAX}"
             placeholder="${MARK_SCALE.MIN}..${MARK_SCALE.MAX}" id="${semKey}_${m.key}_tp"></div>
        <div><label>Exam</label><input type="number" step="0.25" min="${MARK_SCALE.MIN}" max="${MARK_SCALE.MAX}"
             placeholder="${MARK_SCALE.MIN}..${MARK_SCALE.MAX}" id="${semKey}_${m.key}_ex"></div>
      </div>
    `;
    }

    // TP + Exam
    if (m.tpOnly) {
        return `
      <div class="row two">
        <div><label>TP</label><input type="number" step="0.25" min="${MARK_SCALE.MIN}" max="${MARK_SCALE.MAX}"
             placeholder="${MARK_SCALE.MIN}..${MARK_SCALE.MAX}" id="${semKey}_${m.key}_tp"></div>
        <div><label>Exam</label><input type="number" step="0.25" min="${MARK_SCALE.MIN}" max="${MARK_SCALE.MAX}"
             placeholder="${MARK_SCALE.MIN}..${MARK_SCALE.MAX}" id="${semKey}_${m.key}_ex"></div>
      </div>
    `;
    }

    // Default: TD + Exam
    return `
    <div class="row two">
      <div><label>TD</label><input type="number" step="0.25" min="${MARK_SCALE.MIN}" max="${MARK_SCALE.MAX}"
           placeholder="${MARK_SCALE.MIN}..${MARK_SCALE.MAX}" id="${semKey}_${m.key}_td"></div>
      <div><label>Exam</label><input type="number" step="0.25" min="${MARK_SCALE.MIN}" max="${MARK_SCALE.MAX}"
           placeholder="${MARK_SCALE.MIN}..${MARK_SCALE.MAX}" id="${semKey}_${m.key}_ex"></div>
    </div>
  `;
}

function buildModulesUI(semKey) {
    const modules = MODULES[semKey] || [];
    const host = document.getElementById(`modules_${semKey}`);
    host.innerHTML = "";

    for (const m of modules) {
        const div = document.createElement("div");
        div.className = "module";

        div.innerHTML = `
      <div class="top">
        <div class="name">${m.name}${m.optional ? " (choice)" : ""}</div>
        <div class="coef">coef ${m.coef}</div>
      </div>
      ${inputsTemplate(semKey, m)}
    `;

        host.appendChild(div);
    }
}


/* =========================
   5) CALCULATION + RENDER
========================= */

function choiceSelected(semKey, m) {
    if (!m.optional) return true;

    // single optional: selected if note is filled
    if (m.single) return !isEmptyInput(document.getElementById(`${semKey}_${m.key}_note`));

    const ids = m.hasTP
        ? [`${semKey}_${m.key}_td`, `${semKey}_${m.key}_tp`, `${semKey}_${m.key}_ex`]
        : (m.tpOnly
            ? [`${semKey}_${m.key}_tp`, `${semKey}_${m.key}_ex`]
            : [`${semKey}_${m.key}_td`, `${semKey}_${m.key}_ex`]);

    // selected if *any* input is filled
    return ids.some(id => !isEmptyInput(document.getElementById(id)));
}

function moduleMark(semKey, m) {
    if (m.single) return readVal(`${semKey}_${m.key}_note`);

    const ex = readVal(`${semKey}_${m.key}_ex`);

    if (m.hasTP) {
        const td = readVal(`${semKey}_${m.key}_td`);
        const tp = readVal(`${semKey}_${m.key}_tp`);
        if ([td, tp, ex].some(Number.isNaN)) return NaN;
        return WEIGHTS.CC * ((td + tp) / 2) + WEIGHTS.EXAM * ex;
    }

    if (m.tpOnly) {
        const tp = readVal(`${semKey}_${m.key}_tp`);
        if ([tp, ex].some(Number.isNaN)) return NaN;
        return WEIGHTS.CC * tp + WEIGHTS.EXAM * ex;
    }

    // default TD + Exam
    const td = readVal(`${semKey}_${m.key}_td`);
    if ([td, ex].some(Number.isNaN)) return NaN;
    return WEIGHTS.CC * td + WEIGHTS.EXAM * ex;
}

function resetUI(semKey) {
    const modules = MODULES[semKey] || [];

    for (const m of modules) {
        const ids = [];
        if (m.single) ids.push(`${semKey}_${m.key}_note`);
        else if (m.hasTP) ids.push(`${semKey}_${m.key}_td`, `${semKey}_${m.key}_tp`, `${semKey}_${m.key}_ex`);
        else if (m.tpOnly) ids.push(`${semKey}_${m.key}_tp`, `${semKey}_${m.key}_ex`);
        else ids.push(`${semKey}_${m.key}_td`, `${semKey}_${m.key}_ex`);

        ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = "";
        });
    }

    document.getElementById(`avg_${semKey}`).textContent = "—";
    const st = document.getElementById(`status_${semKey}`);
    st.textContent = "—";
    st.className = "sub";
    document.getElementById(`sumCoef_${semKey}`).textContent = "—";
    document.getElementById(`tbody_${semKey}`).innerHTML = "";
    setWarn(semKey, "");
}

function computeAndRender(semKey) {
    setWarn(semKey, "");

    const modules = MODULES[semKey] || [];
    let sumCoef = 0;
    let sum = 0;
    const rows = [];

    for (const m of modules) {
        if (m.optional && !choiceSelected(semKey, m)) continue;

        const mark = moduleMark(semKey, m);
        if (Number.isNaN(mark)) {
            setWarn(semKey, `Fill all required fields using numbers between ${MARK_SCALE.MIN} and ${MARK_SCALE.MAX}.`);
            return;
        }

        sumCoef += m.coef;
        sum += mark * m.coef;
        rows.push({ name: m.name + (m.optional ? " (choice)" : ""), mark, coef: m.coef });
    }

    if (sumCoef === 0) {
        setWarn(semKey, "No modules selected.");
        return;
    }

    const avg = sum / sumCoef;
    document.getElementById(`avg_${semKey}`).textContent = avg.toFixed(2);

    const st = document.getElementById(`status_${semKey}`);
    const pass = avg >= MARK_SCALE.PASS;
    st.textContent = pass ? "PASS" : "FAIL";
    st.className = pass ? "pass" : "fail";

    document.getElementById(`sumCoef_${semKey}`).textContent = String(sumCoef);

    document.getElementById(`tbody_${semKey}`).innerHTML = rows.map(r => `
    <tr>
      <td>${r.name}</td>
      <td>${r.mark.toFixed(2)}</td>
      <td>${r.coef}</td>
    </tr>
  `).join("");
}


/* =========================
   6) EXAMPLES (optional)
========================= */

function fillExample(semKey) {
    const set = (id, v) => {
        const el = document.getElementById(id);
        if (el) el.value = v;
    };

    switch (semKey) {
        case "s1": {
            // Analysis 1 (TD + Exam)
            set("s1_an1_td", 12);
            set("s1_an1_ex", 11);

            // Algebra 1 (TD + Exam)
            set("s1_alg1_td", 13);
            set("s1_alg1_ex", 12);

            // ASD 1 (TD + TP + Exam)
            set("s1_asd1_td", 13);
            set("s1_asd1_tp", 14);
            set("s1_asd1_ex", 12);

            // MS 1 (TD + Exam)
            set("s1_ms1_td", 12);
            set("s1_ms1_ex", 10);

            // STE (single note)
            set("s1_ste_note", 15);

            // English (single note)
            set("s1_eng_note", 16);

            // Choice modules (optional) — filled to show how choices work
            set("s1_phy1_td", 12);
            set("s1_phy1_ex", 10);

            set("s1_elec_td", 11);
            set("s1_elec_ex", 12);

            return;
        }

        case "s2": {
            // Analysis 2 (TD + Exam)
            set("s2_an2_td", 11);
            set("s2_an2_ex", 12);

            // Algebra 2 (TD + Exam)
            set("s2_alg2_td", 12);
            set("s2_alg2_ex", 11);

            // ASD 2 (TD + TP + Exam)
            set("s2_asd2_td", 12);
            set("s2_asd2_tp", 13);
            set("s2_asd2_ex", 11);

            // MS 2 (TD + Exam)
            set("s2_ms2_td", 10);
            set("s2_ms2_ex", 11);

            // Proba/Stats (TD + Exam)
            set("s2_proba_td", 12);
            set("s2_proba_ex", 10);

            // ICT (single note)
            set("s2_ict_note", 16);

            // PTM (TP + Exam)
            set("s2_ptm_tp", 13);
            set("s2_ptm_ex", 12);

            // Physics 2 (TD + Exam)
            set("s2_phy2_td", 11);
            set("s2_phy2_ex", 10);

            return;
        }

        case "s3": {
            // Algo (TD + TP + Exam)
            set("s3_algo_td", 12);
            set("s3_algo_tp", 13);
            set("s3_algo_ex", 11);

            // Archi (TD + TP + Exam)
            set("s3_archi_td", 11);
            set("s3_archi_tp", 12);
            set("s3_archi_ex", 12);

            // TG (TD + Exam)
            set("s3_tg_td", 10);
            set("s3_tg_ex", 10);

            // SI (TD + Exam)
            set("s3_si_td", 14);
            set("s3_si_ex", 10);

            // MN (TD + Exam)
            set("s3_mn_td", 15);
            set("s3_mn_ex", 12);

            // LM (TD + Exam)
            set("s3_lm_td", 13);
            set("s3_lm_ex", 9);

            // English (single note)
            set("s3_eng_note", 16);

            return;
        }

        case "s4": {
            // OS (TD + TP + Exam)
            set("s4_os_td", 12);
            set("s4_os_tp", 12);
            set("s4_os_ex", 11);

            // TL (TD + Exam)
            set("s4_tl_td", 13);
            set("s4_tl_ex", 10);

            // RX (TD + TP + Exam)
            set("s4_rx_td", 11);
            set("s4_rx_tp", 12);
            set("s4_rx_ex", 12);

            // BD (TD + TP + Exam)
            set("s4_bd_td", 14);
            set("s4_bd_tp", 15);
            set("s4_bd_ex", 11);

            // POO (TP + Exam)
            set("s4_poo_tp", 13);
            set("s4_poo_ex", 10);

            // Web (TP + Exam)
            set("s4_web_tp", 14);
            set("s4_web_ex", 12);

            // English (single note)
            set("s4_eng_note", 17);

            return;
        }

        case "s5": {
            // OS 2 (TD + TP + Exam)
            set("s5_os2_td", 12);
            set("s5_os2_tp", 12);
            set("s5_os2_ex", 11);

            // Compilation (TD + TP + Exam)
            set("s5_compil_td", 11);
            set("s5_compil_tp", 12);
            set("s5_compil_ex", 10);

            // Logic Prog (TD + Exam)
            set("s5_logp_td", 13);
            set("s5_logp_ex", 11);

            // SE 2 (TD + TP + Exam)
            set("s5_gl2_td", 12);
            set("s5_gl2_tp", 13);
            set("s5_gl2_ex", 11);

            // MHI (TD + TP + Exam)
            set("s5_mhi_td", 14);
            set("s5_mhi_tp", 14);
            set("s5_mhi_ex", 12);

            // Choice modules (optional) — fill 2 of them as a realistic example
            set("s5_ai_td", 14);
            set("s5_ai_ex", 12);

            set("s5_pl_td", 12);
            set("s5_pl_ex", 11);

            // English (TD + Exam)
            set("s5_eng_td", 16);
            set("s5_eng_ex", 14);

            return;
        }

        case "s6": {
            // Mobile (TD + TP + Exam)
            set("s6_mob_td", 13);
            set("s6_mob_tp", 14);
            set("s6_mob_ex", 12);

            // Security (TD + Exam)
            set("s6_sec_td", 12);
            set("s6_sec_ex", 11);

            // Choice modules (optional) — fill 2 of them
            set("s6_crypto_td", 12);
            set("s6_crypto_ex", 10);

            set("s6_ws_td", 13);
            set("s6_ws_ex", 12);

            // Sci Writing (TD + Exam)
            set("s6_sw_td", 14);
            set("s6_sw_ex", 13);

            // Project (single note)
            set("s6_proj_note", 16);

            return;
        }

        default:
            return;
    }
}



/* =========================
   7) ROUTER + BOOT
========================= */

function setActivePage(key) {
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    (document.getElementById(`page_${key}`) || document.getElementById("page_home")).classList.add("active");
}

function currentRoute() {
    const key = (location.hash || "#home").replace("#", "") || "home";
    return SEMESTERS.some(s => s.key === key) ? key : "home";
}

function initPages() {
    // Render semester pages in S1..S6 order
    for (const sem of SEMESTERS) {
        const semKey = sem.key;
        const page = document.getElementById(`page_${semKey}`);
        if (!page) continue;

        page.innerHTML = pageTemplate(semKey, sem.label);
        buildModulesUI(semKey);

        document.getElementById(`btnCalc_${semKey}`).addEventListener("click", () => computeAndRender(semKey));
        document.getElementById(`btnReset_${semKey}`).addEventListener("click", () => resetUI(semKey));
        document.getElementById(`btnExample_${semKey}`).addEventListener("click", () => { fillExample(semKey); computeAndRender(semKey); });
        document.getElementById(`btnHome_${semKey}`).addEventListener("click", () => { location.hash = "#home"; });
    }
}

function initRouter() {
    const apply = () => setActivePage(currentRoute());
    window.addEventListener("hashchange", apply);
    apply();
}

initPages();
initRouter();
