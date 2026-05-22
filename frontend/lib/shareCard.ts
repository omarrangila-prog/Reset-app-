// Generates a shareable PNG card using Canvas API

export interface ShareCardData {
  streakDays: number;
  disciplineScore: number;
  event: string; // e.g., "resisted an urge"
  timestamp?: Date;
}

export async function generateShareCard(data: ShareCardData): Promise<string> {
  const canvas = document.createElement("canvas");
  const dpr = window.devicePixelRatio || 1;
  const W = 800;
  const H = 450;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = `${W}px`;
  canvas.style.height = `${H}px`;

  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);

  // Background
  ctx.fillStyle = "#0A0A0B";
  ctx.fillRect(0, 0, W, H);

  // Subtle grid lines
  ctx.strokeStyle = "rgba(42,42,46,0.5)";
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 0; y < H; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // Left accent bar
  const gradient = ctx.createLinearGradient(0, 0, 0, H);
  gradient.addColorStop(0, "#1DB954");
  gradient.addColorStop(1, "transparent");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 4, H);

  // RESET wordmark
  ctx.fillStyle = "#8A8A8E";
  ctx.font = "bold 11px 'system-ui'";
  ctx.letterSpacing = "0.15em";
  ctx.fillText("RESET", 32, 44);

  // Main timestamp text
  const now = data.timestamp || new Date();
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  ctx.fillStyle = "#F2F2F0";
  ctx.font = "300 18px 'system-ui'";
  ctx.fillText(`${dateStr} · ${timeStr}`, 32, 80);

  // Large action text
  ctx.fillStyle = "#F2F2F0";
  ctx.font = "bold 52px 'system-ui'";
  ctx.fillText("I " + data.event, 32, 180);
  ctx.fillText("at " + timeStr, 32, 240);

  // Divider
  ctx.strokeStyle = "#2A2A2E";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(32, 280);
  ctx.lineTo(W - 32, 280);
  ctx.stroke();

  // Stats row
  const stats = [
    { label: "STREAK", value: `${data.streakDays} DAYS` },
    { label: "DISCIPLINE", value: `${data.disciplineScore}/100` },
  ];

  stats.forEach((stat, i) => {
    const x = 32 + i * 220;
    ctx.fillStyle = "#4A4A4E";
    ctx.font = "bold 10px 'system-ui'";
    ctx.letterSpacing = "0.12em";
    ctx.fillText(stat.label, x, 320);

    ctx.fillStyle = "#1DB954";
    ctx.font = "bold 28px 'system-ui'";
    ctx.letterSpacing = "0";
    ctx.fillText(stat.value, x, 355);
  });

  // Bottom tagline
  ctx.fillStyle = "#4A4A4E";
  ctx.font = "14px 'system-ui'";
  ctx.letterSpacing = "0";
  ctx.fillText("Real-time recovery support.", 32, H - 32);

  // Dots accent
  ctx.fillStyle = "#1DB954";
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.arc(W - 60 + i * 10, H - 32, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.4 - i * 0.06;
  }
  ctx.globalAlpha = 1;

  return canvas.toDataURL("image/png");
}

export async function downloadShareCard(data: ShareCardData): Promise<void> {
  const dataUrl = await generateShareCard(data);
  const link = document.createElement("a");
  link.download = `reset-${data.streakDays}days.png`;
  link.href = dataUrl;
  link.click();
}

export async function shareCard(data: ShareCardData): Promise<void> {
  const dataUrl = await generateShareCard(data);

  if (navigator.share) {
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], "reset-streak.png", { type: "image/png" });
    await navigator.share({
      title: `${data.streakDays} days strong`,
      text: `I ${data.event} — ${data.streakDays} day streak. RESET.`,
      files: [file],
    });
  } else {
    await downloadShareCard(data);
  }
}
