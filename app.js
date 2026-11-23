const $ = (id) => document.getElementById(id);
const COLORS = { ASK: "#C8FF45", FSK: "#A78BFA", BPSK: "#42E8E0" };
const descriptions = {
  ASK: {
    name: "Amplitude Shift Keying",
    equation: "s(t) = A · b(t) · sin(2πf<sub>c</sub>t)",
    explanation:
      "Watch the gaps in the output. Each 1 lets the carrier through for one bit interval. Each 0 switches it off.",
    notation:
      "A = 1 on the normalized scale. The bit b(t) sets the amplitude. The carrier frequency f꜀ is in Hz and t is in seconds.",
    zero: "Carrier off · amplitude 0",
    one: "Carrier on · amplitude 1",
    use: "Simple radio key fobs send commands by switching a carrier on and off.",
  },
  FSK: {
    name: "Frequency Shift Keying",
    equation: "s(t) = A · sin(φₖ + 2πf<sub>b</sub>τ)",
    explanation:
      "Count the cycles inside a bit. The wave squeezes together for a 1 and spreads out for a 0. Its phase continues from where the previous bit ended.",
    notation:
      "A = 1. τ is time in seconds since the bit began. φₖ is its starting phase in radians; the bit selects frequency fᵦ.",
    use: "Caller ID modems encode the digits of a phone number using two audio tones.",
  },
  BPSK: {
    name: "Binary Phase Shift Keying",
    equation: "s(t) = A · sin(2πf<sub>c</sub>t + φ)",
    explanation:
      "A change of bit flips the carrier upside down. Both bits use the same frequency and amplitude, but their phases differ by half a cycle.",
    notation:
      "A = 1. The bit selects phase φ in radians. The carrier frequency f꜀ is in Hz and t is in seconds.",
    zero: "Inverted carrier · φ = π (180°)",
    one: "Reference carrier · φ = 0 (0°)",
    use: "GPS satellites use binary phase changes to transmit ranging codes that receivers use to estimate distance.",
  },
};
let mode = "ASK",
  bits = "10110010";

function frequencyRatio(bit) {
  return bit === 1 ? 1.5 : 0.5;
}

// phaseAtStart is accumulated in cycles. u is the fraction of the current bit.
function sample(technique, bit, index, u, cycles, phaseAtStart) {
  const tau = 2 * Math.PI;
  if (technique === "FSK")
    return Math.sin(tau * (phaseAtStart + cycles * frequencyRatio(bit) * u));
  const angle = tau * cycles * (index + u);
  if (technique === "ASK") return bit * Math.sin(angle);
  return Math.sin(angle + (bit === 1 ? 0 : Math.PI));
}

function previewPath(technique) {
  const previewBits = [1, 0, 1, 1],
    cycles = 1,
    points = [];
  let phase = 0;
  previewBits.forEach((bit, i) => {
    for (let j = 0; j <= 48; j++) {
      const u = j / 48;
      const y = 14 - 10 * sample(technique, bit, i, u, cycles, phase);
      points.push(
        (points.length ? "L" : "M") +
          ((i + u) * 25).toFixed(2) +
          " " +
          y.toFixed(2),
      );
    }
    phase += cycles * frequencyRatio(bit);
  });
  return points.join(" ");
}
document.querySelector(".tabs").innerHTML = Object.entries(descriptions)
  .map(
    ([key, data], i) =>
      '<button data-mode="' +
      key +
      '" aria-label="' +
      key +
      ", " +
      data.name +
      '"><span><span class="mode-name"><span class="num">0' +
      (i + 1) +
      " / </span>" +
      key +
      "</span><small>" +
      data.name +
      '</small></span><svg viewBox="0 0 100 28" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.7" d="' +
      previewPath(key) +
      '"/></svg></button>',
  )
  .join("");

// An original wire sculpture formed by tilted rings along a curved spine.
function drawSculpture() {
  const rings = [];
  for (let i = 0; i < 114; i++) {
    const t = i / 113,
      a = 2 * Math.PI * t,
      pts = [];
    const cx = 36 + 516 * t,
      cy = 117 - 32 * Math.sin(a * 1.24 - 0.9);
    const envelope = Math.sin(Math.PI * t) ** 0.65;
    const radius = 6 + envelope * (53 + 15 * Math.cos(a * 1.4));
    const tilt = 0.45 + 1.45 * t + 0.5 * Math.sin(a);
    for (let j = 0; j <= 72; j++) {
      const q = (2 * Math.PI * j) / 72,
        px = radius * 0.56 * Math.cos(q),
        py = radius * 1.42 * Math.sin(q);
      pts.push(
        (j ? "L" : "M") +
          (cx + px * Math.cos(tilt) - py * Math.sin(tilt)).toFixed(2) +
          " " +
          (cy + px * Math.sin(tilt) + py * Math.cos(tilt)).toFixed(2),
      );
    }
    rings.push('<path d="' + pts.join(" ") + 'Z"/>');
  }
  $("sculpture").innerHTML =
    '<defs><pattern id="dots" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".8" fill="#343b42"/></pattern></defs><rect x="6" y="6" width="578" height="218" fill="url(#dots)"/><path d="M5 19V5h14m552 0h14v14M5 207v14h14m552 0h14v-14" fill="none" stroke="#636b72"/><g fill="none" stroke="currentColor" stroke-width=".95">' +
    rings.join("") +
    "</g>";
}
drawSculpture();

const plots = [...document.querySelectorAll(".plot")];
for (const plot of plots) {
  const track = document.createElement("div");
  track.className = "track";
  plot.append(track);
  track.append(plot.querySelector("canvas"));
}
function update() {
  const fc = Number($("fc").value),
    rate = Number($("rate").value);
  document.body.dataset.mode = mode;
  $("freqVal").textContent = fc.toFixed(1);
  $("rateVal").textContent = rate;
  $("durVal").textContent = (1000 / rate).toFixed(2);
  $("fcOut").textContent = fc.toFixed(1) + " kHz";
  $("rateOut").textContent = rate + " bps";
  document
    .querySelectorAll(".tabs button")
    .forEach((button) =>
      button.setAttribute("aria-pressed", String(mode === button.dataset.mode)),
    );
  const data = descriptions[mode];
  $("tag").textContent = mode;
  $("theory").textContent = data.name;
  $("desc").textContent = data.explanation;
  $("eq").innerHTML = data.equation;
  $("legend").textContent = data.notation;
  $("use").textContent = data.use;
  $("zero").textContent =
    mode === "FSK"
      ? "Lower tone · f₀ = 0.5 × carrier = " + (fc * 0.5).toFixed(2) + " kHz"
      : data.zero;
  $("one").textContent =
    mode === "FSK"
      ? "Higher tone · f₁ = 1.5 × carrier = " + (fc * 1.5).toFixed(2) + " kHz"
      : data.one;
  draw();
}
function revealTrace() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const canvas = $("carrier");
  canvas.getAnimations().forEach((animation) => animation.cancel());
  canvas.animate(
    [{ clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0 0 0)" }],
    { duration: 230, easing: "ease-out" },
  );
}
function draw() {
  const fc = Number($("fc").value) * 1000,
    rate = Number($("rate").value),
    cycles = fc / rate,
    n = bits.length;
  const width = plots[0].clientWidth;
  if (!width) return;
  const left = 32,
    right = 18,
    top = 28,
    bottom = 88,
    h = 130;
  const bitWidth = Math.max(
    (width - left - right) / n,
    36,
    cycles * (mode === "FSK" ? 1.5 : 1) * 10,
  );
  const total = left + bitWidth * n + right;
  const phases = [0];
  for (const b of bits)
    phases.push(phases.at(-1) + cycles * frequencyRatio(Number(b)));
  plots.forEach((plot, pi) => {
    const canvas = plot.querySelector("canvas");
    canvas.parentElement.style.width = Math.ceil(total) + "px";
    canvas.style.width = width + "px";
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(h * ratio);
    const ctx = canvas.getContext("2d");
    ctx.scale(ratio, ratio);
    const offset = plot.scrollLeft,
      x = (i) => left + i * bitWidth - offset;
    const line = (x1, y1, x2, y2) => {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    };
    ctx.font = "12px Consolas, monospace";
    ctx.textAlign = "right";
    ctx.fillStyle = "#b1b6bf";
    for (const [label, y] of pi
      ? [
          ["+1", top],
          ["0", (top + bottom) / 2],
          ["−1", bottom],
        ]
      : [
          ["1", top],
          ["0", bottom],
        ]) {
      ctx.fillText(label, left - 8, y + 4);
      ctx.strokeStyle = "#343b41";
      line(left, y, width - right, y);
    }
    ctx.strokeStyle = "#1e252c";
    for (let y = top + 10; y < bottom; y += 10) line(left, y, width - right, y);
    const grid = Math.min(bitWidth / 4, 32);
    for (let gx = left - (offset % grid); gx <= width - right; gx += grid)
      if (gx >= left) line(gx, top, gx, bottom);
    ctx.save();
    ctx.beginPath();
    ctx.rect(left, 0, width - left - right, h);
    ctx.clip();
    for (let i = 0; i <= n; i++) {
      const xx = x(i);
      if (xx < left - bitWidth || xx > width) continue;
      ctx.strokeStyle = "#454d54";
      ctx.setLineDash([3, 4]);
      line(xx, 17, xx, bottom + 3);
      ctx.setLineDash([]);
      if (!pi && i < n) {
        ctx.fillStyle = "#bdc2c9";
        ctx.textAlign = "center";
        ctx.fillText(bits[i], xx + bitWidth / 2, 15);
      }
    }
    ctx.lineWidth = 1.8;
    ctx.lineJoin = "round";
    ctx.strokeStyle = pi ? COLORS[mode] : "#d8dce0";
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      if (x(i + 1) < left || x(i) > width - right) continue;
      const bit = Number(bits[i]);
      if (!pi) {
        const y = bit ? top : bottom;
        ctx.lineTo(x(i), y);
        ctx.lineTo(x(i + 1), y);
        continue;
      }
      const tone = frequencyRatio(bit);
      const steps = Math.ceil(
        Math.max(8, cycles * (mode === "FSK" ? tone : 1) * 48),
      );
      for (let j = 0; j <= steps; j++) {
        const u = j / steps;
        const osc = sample(mode, bit, i, u, cycles, phases[i]);
        ctx.lineTo(x(i + u), (top + bottom) / 2 - (osc * (bottom - top)) / 2);
      }
    }
    ctx.stroke();
    ctx.restore();
    ctx.textAlign = "center";
    ctx.fillStyle = "#b1b6bf";
    const stride = Math.max(1, Math.ceil(50 / bitWidth));
    for (let i = 0; i <= n; i++) {
      if ((i % stride && i !== n) || (n - i < stride && i !== n)) continue;
      const xx = x(i);
      if (xx < left - 0.1 || xx > width - right + 0.1) continue;
      const t = +((i * 1000) / rate).toFixed(2);
      ctx.fillText(
        t,
        Math.min(width - ctx.measureText(String(t)).width / 2 - 2, xx),
        105,
      );
    }
    ctx.fillText("Time (ms)", width / 2, 123);
  });
}
plots.forEach((p, i) =>
  p.addEventListener("scroll", () => {
    plots[1 - i].scrollLeft = p.scrollLeft;
    draw();
  }),
);
document.querySelectorAll(".tabs button").forEach(
  (b) =>
    (b.onclick = () => {
      if (mode === b.dataset.mode) return;
      mode = b.dataset.mode;
      update();
      revealTrace();
    }),
);
function validate() {
  const raw = $("bits").value,
    valid = /^[01]{1,64}$/.test(raw);
  $("bits").setAttribute("aria-invalid", String(!valid));
  $("hint").classList.toggle("error", !valid);
  $("hint").textContent = valid
    ? "Enter up to 64 bits using 0 and 1."
    : raw
      ? "Use only 0 and 1. Showing the last valid sequence."
      : "Enter a binary sequence to update the graphs.";
  if (valid) {
    bits = raw;
    update();
  }
}
$("bits").oninput = validate;
$("fc").oninput = update;
$("rate").oninput = update;
$("reset").onclick = () => {
  mode = "ASK";
  $("fc").value = 2;
  $("rate").value = 500;
  $("bits").value = "10110010";
  plots.forEach((p) => (p.scrollLeft = 0));
  validate();
};
new ResizeObserver(draw).observe(plots[0]);
update();
