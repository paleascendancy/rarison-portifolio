const state = {
  view: "overview",
  theme: localStorage.getItem("rk-theme") || "dark",
  chart: null
};

const viewTitles = {
  overview: "Overview",
  projects: "Projects",
  stack: "Stack",
  activity: "Activity"
};

const chartSeries = {
  7: [3, 5, 4, 8, 7, 10, 12],
  14: [2,3,4,3,5,6,4,7,8,6,9,10,11,13],
  30: [2,3,2,4,3,5,4,6,5,7,6,8,7,8,9,7,10,9,11,10,12,11,12,13,12,14,13,15,14,16]
};

function setTheme(theme){
  state.theme = theme;
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("rk-theme", theme);
  updateChartTheme();
}

function setView(view){
  state.view = view;
  document.querySelectorAll(".view").forEach(el => {
    el.classList.toggle("active", el.id === view);
  });
  document.querySelectorAll(".nav-item").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.view === view);
  });
  document.getElementById("pageTitle").textContent = viewTitles[view] || "Overview";
  document.getElementById("sidebar").classList.remove("open");
  clearSearch();
}

function initChart(days = 7){
  const canvas = document.getElementById("activityChart");
  if (!canvas || typeof Chart === "undefined") return;

  const labels = Array.from({length: days}, (_, i) => {
    if(days <= 7) return ["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"][i] || String(i + 1);
    return String(i + 1);
  });

  const textColor = getComputedStyle(document.documentElement).getPropertyValue("--muted").trim();
  const lineColor = getComputedStyle(document.documentElement).getPropertyValue("--line").trim();
  const accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();

  if (state.chart) state.chart.destroy();

  state.chart = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Build activity",
        data: chartSeries[days],
        borderColor: accent,
        backgroundColor: "rgba(125,211,252,.08)",
        tension: .38,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 5,
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: "index" },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(6,14,26,.96)",
          titleColor: "#fff",
          bodyColor: "#cbd5e1",
          displayColors: false,
          padding: 10
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: textColor, font: { size: 9 } },
          border: { display: false }
        },
        y: {
          beginAtZero: true,
          grid: { color: lineColor },
          ticks: { color: textColor, font: { size: 9 }, stepSize: 4 },
          border: { display: false }
        }
      }
    }
  });
}

function updateChartTheme(){
  const select = document.getElementById("chartRange");
  initChart(Number(select?.value || 7));
}

function animateCounters(){
  document.querySelectorAll("[data-counter]").forEach(el => {
    const target = Number(el.dataset.counter || 0);
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 16));
    const timer = setInterval(() => {
      current += step;
      if(current >= target){
        current = target;
        clearInterval(timer);
      }
      el.textContent = current;
    }, 28);
  });
}

function searchableItems(){
  return [...document.querySelectorAll(".searchable")];
}

function clearSearch(){
  const input = document.getElementById("searchInput");
  if(input) input.value = "";
  searchableItems().forEach(el => el.hidden = false);
  document.getElementById("emptySearch").hidden = true;
}

function runSearch(term){
  const q = term.trim().toLowerCase();
  const items = searchableItems();

  if(!q){
    items.forEach(el => el.hidden = false);
    document.getElementById("emptySearch").hidden = true;
    return;
  }

  if(state.view === "overview" || state.view === "activity"){
    setView("projects");
  }

  let visible = 0;
  items.forEach(el => {
    const haystack = (el.dataset.search || el.textContent || "").toLowerCase();
    const match = haystack.includes(q);
    el.hidden = !match;
    if(match && !el.closest(".view")?.classList.contains("active")) el.hidden = true;
    if(match && el.closest(".view")?.classList.contains("active")) visible++;
  });

  document.getElementById("emptySearch").hidden = visible !== 0;
}

document.addEventListener("DOMContentLoaded", () => {
  setTheme(state.theme);
  setView("overview");
  animateCounters();
  initChart(7);

  if(window.lucide) lucide.createIcons();

  document.querySelectorAll(".nav-item").forEach(btn => {
    btn.addEventListener("click", () => setView(btn.dataset.view));
  });

  document.querySelectorAll("[data-view-jump]").forEach(btn => {
    btn.addEventListener("click", () => setView(btn.dataset.viewJump));
  });

  document.getElementById("themeBtn").addEventListener("click", () => {
    setTheme(state.theme === "dark" ? "light" : "dark");
  });

  document.getElementById("menuBtn").addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("open");
  });

  document.getElementById("chartRange").addEventListener("change", e => {
    initChart(Number(e.target.value));
  });

  document.getElementById("searchInput").addEventListener("input", e => {
    runSearch(e.target.value);
  });

  document.addEventListener("keydown", e => {
    if((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k"){
      e.preventDefault();
      document.getElementById("searchInput").focus();
    }
    if(e.key === "Escape"){
      document.getElementById("sidebar").classList.remove("open");
      document.getElementById("searchInput").blur();
    }
  });

  document.addEventListener("click", e => {
    const sidebar = document.getElementById("sidebar");
    if(window.innerWidth <= 820 && sidebar.classList.contains("open")){
      const inside = sidebar.contains(e.target) || document.getElementById("menuBtn").contains(e.target);
      if(!inside) sidebar.classList.remove("open");
    }
  });
});

/*
PUBLICAÇÃO NO GITHUB PAGES
1. Faça commit de index.html, style.css e script.js.
2. No GitHub: Settings > Pages.
3. Em "Build and deployment", escolha "Deploy from a branch".
4. Selecione a branch desejada e a pasta /(root).
5. Salve e aguarde o endereço publicado.
*/