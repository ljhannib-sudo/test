(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const worlds = {
    core: {
      code: "NX-00 CORE",
      title: "核心恒星 · 源",
      text: "NEXUS 的能量心脏。所有航线从这里校准，所有信号在此汇流。点击外围星体，解锁远征档案。",
      meta: ["温度 5772 K", "半径 1.00 R☉", "状态 稳定燃烧"],
    },
    aether: {
      code: "NX-12 AETHER",
      title: "以太星",
      text: "一层半透明的电离层会把光折成乐谱。观测员常在晨昏线采集极光样本，用于校准渲染核。",
      meta: ["轨道周期 14 日", "大气 离子氢", "任务 光谱采样"],
    },
    ion: {
      code: "NX-27 ION SEA",
      title: "离子海",
      text: "液态金属海洋在磁场中卷起潮汐。脉冲实验室的默认波形，就来自这里的风暴录音。",
      meta: ["磁场 18 μT", "风暴季 常年", "任务 波形捕获"],
    },
    void: {
      code: "NX-41 VOID RING",
      title: "虚空环",
      text: "一圈碎裂的暗色晶体，像被时间切开的戒指。适合做隐匿信号的中继，也适合迷路。",
      meta: ["密度 低", "引力透镜 弱", "任务 中继部署"],
    },
    prism: {
      code: "NX-63 PRISM",
      title: "棱镜城",
      text: "漂浮都市把星光切成可居住的街道。申请航线后，第一站通常在这里办理呼号。",
      meta: ["人口 120 万", "时区 无夜", "任务 接入认证"],
    },
  };

  bootSequence();
  starfield();
  aurora();
  cursor();
  hud();
  counters();
  orbit();
  tiltCards();
  magnetic();
  lab();
  form();
  scrollButtons();

  function bootSequence() {
    const lines = [
      ">> mount /dev/observatory",
      ">> sync star catalog  …  4096 entries",
      ">> calibrate aurora shader",
      ">> handshake swarm-link  OK",
      ">> open viewport",
    ];
    const log = $("#bootLog");
    const fill = $("#bootFill");
    const boot = $("#boot");
    let i = 0;

    const tick = () => {
      if (i < lines.length) {
        log.innerHTML += `${lines[i]}<br/>`;
        fill.style.width = `${((i + 1) / lines.length) * 100}%`;
        i += 1;
        setTimeout(tick, 280);
      } else {
        setTimeout(() => boot.classList.add("is-done"), 420);
      }
    };
    setTimeout(tick, 240);
  }

  function starfield() {
    const canvas = $("#starfield");
    const ctx = canvas.getContext("2d");
    let stars = [];
    let w = 0;
    let h = 0;
    let mx = 0;
    let my = 0;

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      stars = Array.from({ length: Math.min(220, Math.floor(w * h / 9000)) }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random() * 0.8 + 0.2,
        r: Math.random() * 1.4 + 0.2,
        tw: Math.random() * Math.PI * 2,
      }));
    };

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", (e) => {
      mx = (e.clientX / w - 0.5) * 24;
      my = (e.clientY / h - 0.5) * 24;
    });
    resize();

    const draw = (t) => {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        const a = 0.35 + Math.sin(t / 400 + s.tw) * 0.25;
        ctx.fillStyle = `rgba(230, 244, 255, ${a})`;
        ctx.beginPath();
        ctx.arc(s.x + mx * s.z, s.y + my * s.z, s.r * s.z, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  }

  function aurora() {
    const canvas = $("#aurora");
    const ctx = canvas.getContext("2d");
    let w = 0;
    let h = 0;

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    resize();

    const draw = (t) => {
      ctx.clearRect(0, 0, w, h);
      const bands = [
        ["rgba(60,240,255,0.08)", 0.18],
        ["rgba(124,92,255,0.07)", 0.28],
        ["rgba(255,61,154,0.05)", 0.38],
      ];
      bands.forEach(([color, speed], i) => {
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let x = 0; x <= w; x += 8) {
          const y =
            h * 0.28 +
            i * 40 +
            Math.sin(x * 0.006 + t * speed * 0.001) * 46 +
            Math.sin(x * 0.002 + t * 0.0004 + i) * 30;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
      });
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  }

  function cursor() {
    const ring = $("#cursor");
    const dot = $("#cursorDot");
    if (window.matchMedia("(pointer: coarse)").matches) return;
    document.body.classList.add("has-cursor");

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let rx = x;
    let ry = y;

    window.addEventListener("pointermove", (e) => {
      x = e.clientX;
      y = e.clientY;
      dot.style.left = `${x}px`;
      dot.style.top = `${y}px`;
      const hot = e.target.closest("a, button, input, select, textarea, .planet, .card");
      ring.classList.toggle("is-hot", Boolean(hot));
    });

    const follow = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      ring.style.left = `${rx}px`;
      ring.style.top = `${ry}px`;
      requestAnimationFrame(follow);
    };
    follow();
  }

  function hud() {
    const pad = (n) => String(n).padStart(2, "0");
    const tick = () => {
      const d = new Date();
      $("#hudTime").textContent = `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
      $("#hudLat").textContent = (31.2304 + Math.sin(Date.now() / 8000) * 0.002).toFixed(4);
      $("#hudLon").textContent = (121.4737 + Math.cos(Date.now() / 9000) * 0.002).toFixed(4);
      $("#hudSig").textContent = `${(97.6 + Math.sin(Date.now() / 3000) * 1.6).toFixed(1)}%`;
    };
    tick();
    setInterval(tick, 1000);
  }

  function counters() {
    const run = (el, target, dur) => {
      const start = performance.now();
      const step = (now) => {
        const p = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased).toLocaleString("zh-CN");
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    setTimeout(() => {
      run($("#statStars"), 4096, 1400);
      run($("#statNodes"), 128, 1200);
      run($("#statMs"), 12, 900);
    }, 900);
  }

  function orbit() {
    const stage = $("#orbitStage");
    const render = (id) => {
      const w = worlds[id];
      if (!w) return;
      $("#dossierCode").textContent = w.code;
      $("#dossierTitle").textContent = w.title;
      $("#dossierText").textContent = w.text;
      $("#dossierMeta").innerHTML = w.meta
        .map((item) => {
          const [k, ...rest] = item.split(" ");
          return `<li>${k} <b>${rest.join(" ")}</b></li>`;
        })
        .join("");
    };

    $$(".planet, #sun").forEach((el) => {
      el.addEventListener("click", () => render(el.dataset.id));
    });
    stage.addEventListener("pointerenter", () => stage.classList.add("is-paused"));
    stage.addEventListener("pointerleave", () => stage.classList.remove("is-paused"));
  }

  function tiltCards() {
    $$(".tilt").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `rotateY(${px * 10}deg) rotateX(${-py * 10}deg)`;
      });
      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    });
  }

  function magnetic() {
    $$(".magnetic").forEach((btn) => {
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * 0.18}px, ${y * 0.18}px)`;
      });
      btn.addEventListener("pointerleave", () => {
        btn.style.transform = "";
      });
    });
  }

  function lab() {
    const canvas = $("#labCanvas");
    const ctx = canvas.getContext("2d");
    const modes = ["AURORA", "PULSE", "CONSTELLATION"];
    let mode = 0;
    let pointer = { x: 0.5, y: 0.5 };
    let pulses = [];
    let nodes = seedNodes();

    function seedNodes() {
      return Array.from({ length: 48 }, () => ({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.0006,
        vy: (Math.random() - 0.5) * 0.0006,
      }));
    }

    const fit = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = 420 * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    window.addEventListener("resize", fit);
    fit();

    canvas.addEventListener("pointermove", (e) => {
      const r = canvas.getBoundingClientRect();
      pointer = { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
      $("#labFreq").textContent = String(Math.round(220 + pointer.x * 660));
    });

    canvas.addEventListener("click", () => {
      pulses.push({ x: pointer.x, y: pointer.y, r: 0, life: 1 });
      $("#labPulse").textContent = "FIRE";
      setTimeout(() => { $("#labPulse").textContent = "IDLE"; }, 400);
    });

    window.addEventListener("keydown", (e) => {
      if (e.code === "Space" && document.activeElement === document.body) {
        e.preventDefault();
        mode = (mode + 1) % modes.length;
        $("#labMode").textContent = modes[mode];
      }
      if (e.key.toLowerCase() === "r") {
        nodes = seedNodes();
        pulses = [];
      }
    });

    const draw = (t) => {
      const w = canvas.clientWidth;
      const h = 420;
      ctx.fillStyle = "rgba(4, 6, 22, 0.28)";
      ctx.fillRect(0, 0, w, h);

      if (modes[mode] === "AURORA") {
        ctx.strokeStyle = "rgba(60,240,255,0.7)";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        for (let i = 0; i <= 80; i += 1) {
          const x = (i / 80) * w;
          const y =
            h * 0.5 +
            Math.sin(i * 0.28 + t * 0.004 + pointer.x * 6) * (40 + pointer.y * 80) +
            Math.sin(i * 0.11 + t * 0.002) * 18;
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.strokeStyle = "rgba(255,61,154,0.45)";
        ctx.beginPath();
        for (let i = 0; i <= 80; i += 1) {
          const x = (i / 80) * w;
          const y =
            h * 0.5 +
            Math.cos(i * 0.24 + t * 0.0035 + pointer.y * 5) * (28 + pointer.x * 60);
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      if (modes[mode] === "PULSE") {
        const bars = 48;
        for (let i = 0; i < bars; i += 1) {
          const n = 0.25 + Math.abs(Math.sin(t * 0.006 + i * 0.4 + pointer.x * 8)) * (0.2 + pointer.y);
          const bw = w / bars - 4;
          const bh = n * h;
          ctx.fillStyle = i % 2 ? "rgba(60,240,255,0.55)" : "rgba(124,92,255,0.5)";
          ctx.fillRect(i * (w / bars) + 2, h - bh, bw, bh);
        }
      }

      if (modes[mode] === "CONSTELLATION") {
        for (const n of nodes) {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < 0 || n.x > 1) n.vx *= -1;
          if (n.y < 0 || n.y > 1) n.vy *= -1;
        }
        for (let i = 0; i < nodes.length; i += 1) {
          for (let j = i + 1; j < nodes.length; j += 1) {
            const dx = nodes[i].x - nodes[j].x;
            const dy = nodes[i].y - nodes[j].y;
            const d = Math.hypot(dx, dy);
            if (d < 0.16) {
              ctx.strokeStyle = `rgba(180,220,255,${0.28 - d})`;
              ctx.beginPath();
              ctx.moveTo(nodes[i].x * w, nodes[i].y * h);
              ctx.lineTo(nodes[j].x * w, nodes[j].y * h);
              ctx.stroke();
            }
          }
        }
        for (const n of nodes) {
          ctx.fillStyle = "#9cf6ff";
          ctx.beginPath();
          ctx.arc(n.x * w, n.y * h, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      pulses = pulses.filter((p) => p.life > 0);
      for (const p of pulses) {
        p.r += 4;
        p.life -= 0.02;
        ctx.strokeStyle = `rgba(244,196,90,${p.life})`;
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, p.r, 0, Math.PI * 2);
        ctx.stroke();
      }

      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  }

  function form() {
    $("#signalForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const ok = $("#formOk");
      ok.hidden = false;
      e.currentTarget.reset();
    });
  }

  function scrollButtons() {
    $$("[data-scroll]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = $(btn.dataset.scroll);
        target?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }
})();
