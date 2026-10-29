import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export default function RungLaThapCinematic() {
  const canvasRef = useRef(null);
  const tlRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [time, setTime] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const W = 960;
    const H = 540;
    canvas.width = W;
    canvas.height = H;

    // --- BIẾN TRẠNG THÁI DO GSAP ĐIỀU KHIỂN ---
    const state = {
      scene: 1, // 1: Rừng lá, 2: Máy thu thanh, 3: Chiến trường trên cầu, 4: Bình minh
      scene1Alpha: 1,
      scene2Alpha: 0,
      scene3Alpha: 0,
      scene4Alpha: 0,

      // Scene 1: Hành quân & Thành phố
      soldierX: 180,
      cityAlpha: 1,
      forestScroll: 0,

      // Scene 2: Radio & Sóng nhạc
      radioGlow: 0.8,
      soundWaveR: 0,
      musicNotesAlpha: 1,

      // Scene 3: Cầu, Khói súng & Hỏa châu
      flareY: 60,
      flareAlpha: 1,
      smokeDensity: 0,
      bridgeShake: 0,

      // Scene 4: Bình minh
      sunRiseY: 380,
      dawnLight: 0,

      // Phụ đề lời bài hát hiện tại
      currentLyric: "Rừng lá xanh xanh cây phủ đường đi...",
      lyricAlpha: 1,
    };

    // Hệ thống hạt: Lá rơi & Đom đóm / Tàn lửa
    const leaves = Array.from({ length: 30 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: 0.5 + Math.random() * 1.5,
      vy: 1.0 + Math.random() * 2.0,
      rot: Math.random() * Math.PI,
      size: 5 + Math.random() * 6,
      color: Math.random() > 0.4 ? "#15803d" : "#166534",
    }));

    const fireflies = Array.from({ length: 25 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      alpha: Math.random(),
    }));

    // --- CÁC HÀM VẼ TỪNG PHÂN CẢNH ---

    // 1. Phân cảnh Rừng lá & Thành phố xa xăm
    const drawScene1 = () => {
      if (state.scene1Alpha <= 0.01) return;
      ctx.save();
      ctx.globalAlpha = state.scene1Alpha;

      // Nền trời chiều rừng già
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, "#064e3b");
      sky.addColorStop(0.6, "#022c22");
      sky.addColorStop(1, "#021510");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);

      // Thành phố sau lưng chìm dần vào sương mộng
      if (state.cityAlpha > 0.05) {
        ctx.save();
        ctx.globalAlpha = state.scene1Alpha * state.cityAlpha * 0.4;
        ctx.fillStyle = "#fef08a";
        // Dãy ánh đèn skyline thành thị xa xăm
        for (let i = 0; i < 16; i++) {
          const bx = 40 + i * 22;
          const bh = 40 + Math.sin(i * 1.5) * 35;
          ctx.fillRect(bx, 380 - bh, 16, bh);
        }
        ctx.fillStyle = "#ffffff";
        ctx.font = "italic 13px serif";
        ctx.fillText("Thành phố xa xôi...", 50, 290);
        ctx.restore();
      }

      // Rừng cây nhiều tầng (Parallax)
      ctx.fillStyle = "#03281e";
      for (let i = 0; i < 9; i++) {
        const tx = ((i * 130 + state.forestScroll * 0.5) % (W + 200)) - 100;
        ctx.beginPath();
        ctx.moveTo(tx, 450);
        ctx.lineTo(tx + 25, 60);
        ctx.lineTo(tx + 50, 450);
        ctx.fill();
        // Vòm lá
        ctx.beginPath();
        ctx.ellipse(tx + 25, 100, 70, 90, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Tán lá rủ phía trên
      ctx.fillStyle = "#022219";
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.arc(i * 200, 0, 140, 0, Math.PI);
        ctx.fill();
      }

      // Con đường đất rừng uốn lượn
      ctx.fillStyle = "#041d16";
      ctx.beginPath();
      ctx.moveTo(0, 470);
      ctx.quadraticCurveTo(W * 0.5, 410, W, 450);
      ctx.lineTo(W, H);
      ctx.lineTo(0, H);
      ctx.fill();

      // Bóng người lính ba lô, súng khoác vai bước đi
      ctx.save();
      ctx.translate(state.soldierX, 410);
      ctx.fillStyle = "#02120d";
      // Ba lô
      ctx.beginPath();
      ctx.roundRect(-22, -45, 16, 25, 4);
      ctx.fill();
      // Nòng súng nhô cao
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = "#000";
      ctx.beginPath();
      ctx.moveTo(-15, -40);
      ctx.lineTo(-20, -75);
      ctx.stroke();
      // Thân & Chân bước
      ctx.beginPath();
      ctx.ellipse(0, -35, 12, 22, 0.1, 0, Math.PI * 2);
      ctx.fill();
      // Nón tai bèo / nón sắt
      ctx.beginPath();
      ctx.ellipse(2, -62, 16, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(2, -65, 10, Math.PI, 0);
      ctx.fill();
      // Bước chân
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#02120d";
      ctx.beginPath();
      ctx.moveTo(-6, -15);
      ctx.lineTo(-12, 10);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(6, -15);
      ctx.lineTo(16, 10);
      ctx.stroke();
      ctx.restore();

      ctx.restore();
    };

    // 2. Phân cảnh Chiếc máy thu thanh giữa rừng vắng
    const drawScene2 = () => {
      if (state.scene2Alpha <= 0.01) return;
      ctx.save();
      ctx.globalAlpha = state.scene2Alpha;

      // Đêm rừng tĩnh mịch sâu thẳm
      ctx.fillStyle = "#02130e";
      ctx.fillRect(0, 0, W, H);

      // Thân cây cổ thụ làm bệ đặt máy
      ctx.fillStyle = "#010a07";
      ctx.beginPath();
      ctx.moveTo(W / 2 - 140, H);
      ctx.lineTo(W / 2 - 100, 360);
      ctx.lineTo(W / 2 + 100, 360);
      ctx.lineTo(W / 2 + 140, H);
      ctx.fill();

      const rx = W / 2 - 80;
      const ry = 280;

      // Chiếc Radio Dã Chiến (Máy thu thanh quân phục)
      ctx.fillStyle = "#1e3a2f";
      ctx.strokeStyle = "#34d399";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(rx, ry, 160, 95, 8);
      ctx.fill();
      ctx.stroke();

      // Ăng-ten dài chéo
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(rx + 20, ry);
      ctx.lineTo(rx - 30, ry - 90);
      ctx.stroke();

      // Màng loa hình tròn
      ctx.fillStyle = "#062217";
      ctx.beginPath();
      ctx.arc(rx + 45, ry + 48, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Vạch tần số phát sáng màu vàng ấm
      ctx.fillStyle = "#fef08a";
      ctx.shadowColor = "#facc15";
      ctx.shadowBlur = 12 * state.radioGlow;
      ctx.fillRect(rx + 90, ry + 32, 50, 14);
      ctx.shadowBlur = 0;

      // Nút vặn
      ctx.fillStyle = "#475569";
      ctx.beginPath();
      ctx.arc(rx + 100, ry + 68, 8, 0, Math.PI * 2);
      ctx.arc(rx + 125, ry + 68, 8, 0, Math.PI * 2);
      ctx.fill();

      // Sóng âm tròn tỏa ra từ loa radio
      ctx.strokeStyle = `rgba(52, 211, 153, ${Math.max(0, 1 - state.soundWaveR / 280)})`;
      ctx.lineWidth = 2;
      for (let w = 0; w < 3; w++) {
        const r = (state.soundWaveR + w * 60) % 280;
        ctx.beginPath();
        ctx.arc(rx + 45, ry + 48, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Ký hiệu nốt nhạc bay lên nhẹ nhàng
      if (state.musicNotesAlpha > 0) {
        ctx.fillStyle = `rgba(254, 240, 138, ${state.musicNotesAlpha * 0.8})`;
        ctx.font = "24px serif";
        ctx.fillText("♪", rx - 40, ry - 30 - state.soundWaveR * 0.2);
        ctx.fillText("♫", rx + 140, ry - 50 - state.soundWaveR * 0.2);
      }

      // Đom đóm lập lòe trong rừng
      fireflies.forEach((f) => {
        ctx.fillStyle = `rgba(250, 204, 21, ${f.alpha})`;
        ctx.beginPath();
        ctx.arc(f.x, f.y, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
    };

    // 3. Phân cảnh Người giết giặc trên cầu & Khói súng xây thành
    const drawScene3 = () => {
      if (state.scene3Alpha <= 0.01) return;
      ctx.save();
      ctx.globalAlpha = state.scene3Alpha;

      // Rung màn hình khi súng nổ
      let shakeX = 0,
        shakeY = 0;
      if (state.bridgeShake > 0) {
        shakeX = (Math.random() - 0.5) * state.bridgeShake * 8;
        shakeY = (Math.random() - 0.5) * state.bridgeShake * 8;
      }
      ctx.translate(shakeX, shakeY);

      // Bầu trời chiến địa rực lửa khói
      const battleSky = ctx.createLinearGradient(0, 0, 0, H);
      battleSky.addColorStop(0, "#1c0d0d");
      battleSky.addColorStop(0.5, "#3b1313");
      battleSky.addColorStop(1, "#18181b");
      ctx.fillStyle = battleSky;
      ctx.fillRect(0, 0, W, H);

      // Quả Pháo sáng (Hỏa châu) lơ lửng chao nghiêng giữa trời đêm
      if (state.flareAlpha > 0) {
        ctx.save();
        const fx = W * 0.65;
        const fy = state.flareY;

        // Vùng chiếu sáng vàng cam rọi xuống dòng sông
        const flareGlow = ctx.createRadialGradient(fx, fy, 10, fx, fy, 260);
        flareGlow.addColorStop(0, "rgba(254, 215, 170, 0.45)");
        flareGlow.addColorStop(0.5, "rgba(249, 115, 22, 0.15)");
        flareGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = flareGlow;
        ctx.beginPath();
        ctx.arc(fx, fy, 260, 0, Math.PI * 2);
        ctx.fill();

        // Dù pháo sáng
        ctx.strokeStyle = "#e2e8f0";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(fx, fy - 18, 16, Math.PI, 0);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(fx - 16, fy - 18);
        ctx.lineTo(fx, fy);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(fx + 16, fy - 18);
        ctx.lineTo(fx, fy);
        ctx.stroke();

        // Ngọn lửa trắng chói
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(fx, fy, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Cây cầu sắt chiến trường bắc qua sông (Silhouette)
      ctx.fillStyle = "#09090b";
      ctx.fillRect(0, 360, W, 18);
      // Khung giàn thép tam giác của cây cầu
      ctx.strokeStyle = "#09090b";
      ctx.lineWidth = 6;
      for (let i = 0; i < 9; i++) {
        const bx = i * 110;
        ctx.beginPath();
        ctx.moveTo(bx, 360);
        ctx.lineTo(bx + 55, 260);
        ctx.lineTo(bx + 110, 360);
        ctx.stroke();
      }

      // Trụ cầu cắm xuống sông
      ctx.fillRect(200, 375, 45, 165);
      ctx.fillRect(700, 375, 45, 165);

      // Dòng sông lấp loáng bóng lửa pháo sáng
      const water = ctx.createLinearGradient(0, 380, 0, H);
      water.addColorStop(0, "#271714");
      water.addColorStop(1, "#09090b");
      ctx.fillStyle = water;
      ctx.fillRect(0, 378, W, H - 378);

      // Người lính kiên cường đứng canh trên cầu (áo dính bùn, mắt đăm chiêu)
      ctx.save();
      ctx.translate(430, 360);
      ctx.fillStyle = "#050505";
      ctx.beginPath();
      ctx.ellipse(0, -35, 14, 25, 0, 0, Math.PI * 2);
      ctx.fill();
      // Nón sắt
      ctx.beginPath();
      ctx.ellipse(0, -64, 16, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, -66, 12, Math.PI, 0);
      ctx.fill();
      // Súng gác chéo phòng thủ
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#000";
      ctx.beginPath();
      ctx.moveTo(-10, -20);
      ctx.lineTo(25, -60);
      ctx.stroke();
      ctx.restore();

      // Lớp khói súng xây thành cuồn cuộn
      ctx.save();
      ctx.fillStyle = "rgba(115, 115, 115, 0.35)";
      for (let s = 0; s < 7; s++) {
        const sx = ((s * 150 + state.forestScroll * 0.8) % (W + 200)) - 100;
        ctx.beginPath();
        ctx.arc(sx, 330, 50 + s * 10, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      ctx.restore();
    };

    // 4. Phân cảnh Bình minh tàn đêm khói lửa
    const drawScene4 = () => {
      if (state.scene4Alpha <= 0.01) return;
      ctx.save();
      ctx.globalAlpha = state.scene4Alpha;

      // Bình minh ửng hồng xua tan đêm tối
      const dawn = ctx.createLinearGradient(0, 0, 0, H);
      dawn.addColorStop(0, "#fbbf24");
      dawn.addColorStop(0.4, "#f97316");
      dawn.addColorStop(0.8, "#1e3a5f");
      dawn.addColorStop(1, "#064e3b");
      ctx.fillStyle = dawn;
      ctx.fillRect(0, 0, W, H);

      // Ánh mặt trời ló rạng nơi chân trời
      ctx.fillStyle = "#fef08a";
      ctx.beginPath();
      ctx.arc(W / 2, state.sunRiseY, 55, 0, Math.PI * 2);
      ctx.fill();

      // Tia nắng rọi xuyên qua làn sương
      ctx.strokeStyle = "rgba(254, 240, 138, 0.25)";
      ctx.lineWidth = 3;
      for (let a = 0; a < 8; a++) {
        const ang = (a / 8) * Math.PI - 0.2;
        ctx.beginPath();
        ctx.moveTo(W / 2, state.sunRiseY);
        ctx.lineTo(
          W / 2 + Math.cos(ang) * 500,
          state.sunRiseY - Math.sin(ang) * 350,
        );
        ctx.stroke();
      }

      // Đồi xa nhấp nhô bình yên
      ctx.fillStyle = "#064e3b";
      ctx.beginPath();
      ctx.moveTo(0, 430);
      ctx.quadraticCurveTo(W * 0.3, 370, W * 0.6, 420);
      ctx.quadraticCurveTo(W * 0.85, 450, W, 400);
      ctx.lineTo(W, H);
      ctx.lineTo(0, H);
      ctx.fill();

      // Chiếc nón sắt đặt trên bãi cỏ phủ sương đọng
      ctx.save();
      ctx.translate(W / 2, 450);
      ctx.fillStyle = "#14532d";
      ctx.beginPath();
      ctx.ellipse(0, 0, 22, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, -3, 16, Math.PI, 0);
      ctx.fill();
      ctx.restore();

      ctx.restore();
    };

    // 5. Khung phụ đề lời bài hát (Subtitles đậm chất điện ảnh xưa)
    const drawSubtitles = () => {
      ctx.save();
      // Khung viền mờ đáy
      const grad = ctx.createLinearGradient(0, H - 90, 0, H);
      grad.addColorStop(0, "rgba(0,0,0,0)");
      grad.addColorStop(0.7, "rgba(0,0,0,0.85)");
      grad.addColorStop(1, "rgba(0,0,0,0.95)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, H - 90, W, 90);

      // Chữ lời bài hát
      ctx.globalAlpha = state.lyricAlpha;
      ctx.font = "italic 21px 'Georgia', 'Times New Roman', serif";
      ctx.fillStyle = "#fef08a";
      ctx.shadowColor = "rgba(0, 0, 0, 0.9)";
      ctx.shadowBlur = 8;
      ctx.textAlign = "center";
      ctx.fillText(state.currentLyric, W / 2, H - 35);
      ctx.restore();
    };

    // --- FRAME RENDER ---
    const render = () => {
      ctx.clearRect(0, 0, W, H);

      // Cập nhật lá rơi
      leaves.forEach((l) => {
        l.x += l.vx;
        l.y += l.vy;
        l.rot += 0.02;
        if (l.y > H) {
          l.y = -20;
          l.x = Math.random() * W;
        }
      });

      // Cập nhật đom đóm
      fireflies.forEach((f) => {
        f.x += f.vx;
        f.y += f.vy;
        if (f.x < 0 || f.x > W) f.vx *= -1;
        if (f.y < 0 || f.y > H) f.vy *= -1;
      });

      // Vẽ các phân cảnh
      drawScene1();
      drawScene2();
      drawScene3();
      drawScene4();

      // Vẽ lá rụng xuyên suốt không gian
      if (state.scene1Alpha > 0.1 || state.scene2Alpha > 0.1) {
        leaves.forEach((l) => {
          ctx.save();
          ctx.translate(l.x, l.y);
          ctx.rotate(l.rot);
          ctx.fillStyle = l.color;
          ctx.beginPath();
          ctx.ellipse(0, 0, l.size, l.size * 0.4, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      }

      drawSubtitles();
    };

    // --- KỊCH BẢN GSAP TIMELINE ĐỒNG BỘ LỜI CA (34 GIÂY) ---
    const tl = gsap.timeline({
      paused: false,
      onUpdate: () => {
        render();
        setTime(tl.time());
      },
    });
    tlRef.current = tl;

    // === ĐOẠN 1: Rừng lá xanh & thành phố sau lưng (0s - 9s) ===
    tl.set(
      state,
      { currentLyric: "Rừng lá xanh xanh cây phủ đường đi...", lyricAlpha: 1 },
      0,
    );
    tl.to(
      state,
      { soldierX: 380, forestScroll: 150, duration: 8.5, ease: "none" },
      0,
    );

    tl.to(state, { lyricAlpha: 0, duration: 0.4 }, 3.8);
    tl.set(
      state,
      { currentLyric: "Thành phố sau lưng ôm mộng ước gì..." },
      4.2,
    );
    tl.to(state, { lyricAlpha: 1, duration: 0.4 }, 4.3);
    tl.to(state, { cityAlpha: 0, duration: 3.5 }, 4.5);

    tl.to(state, { lyricAlpha: 0, duration: 0.4 }, 6.8);
    tl.set(
      state,
      {
        currentLyric:
          "Tôi là người vui chinh chiến dài lâu\nNên mộng ước đầu tôi nghe đã chìm sâu.",
      },
      7.2,
    );
    tl.to(state, { lyricAlpha: 1, duration: 0.4 }, 7.3);

    // Chuyển Scene 1 -> Scene 2 (9.0s)
    tl.to(state, { scene1Alpha: 0, duration: 1.0 }, 9.0);
    tl.to(state, { scene2Alpha: 1, duration: 1.0 }, 9.0);

    // === ĐOẠN 2: Máy thu thanh & Giọng hát giữa rừng già (9.5s - 18s) ===
    tl.to(state, { lyricAlpha: 0, duration: 0.4 }, 9.2);
    tl.set(
      state,
      {
        currentLyric:
          "Từ máy thu thanh cô nàng vừa ca: Trọn kiếp yêu anh lính khổ xa nhà...",
      },
      9.8,
    );
    tl.to(state, { lyricAlpha: 1, duration: 0.5 }, 10.0);

    // Sóng âm radio dập dờn
    tl.to(state, { soundWaveR: 260, duration: 7.5, ease: "none" }, 10.0);
    tl.to(
      state,
      { radioGlow: 1.2, duration: 0.5, repeat: 7, yoyo: true },
      10.0,
    );

    tl.to(state, { lyricAlpha: 0, duration: 0.4 }, 13.8);
    tl.set(
      state,
      {
        currentLyric:
          "Giữa rừng già nghe tiếng hát thật cao... Nhưng giữa rừng già tôi có thấy gì đâu!",
      },
      14.2,
    );
    tl.to(state, { lyricAlpha: 1, duration: 0.5 }, 14.4);

    // Chuyển Scene 2 -> Scene 3 (18.0s)
    tl.to(state, { scene2Alpha: 0, duration: 0.8 }, 17.8);
    tl.to(state, { scene3Alpha: 1, duration: 0.8 }, 18.0);

    // === ĐOẠN 3: Người giết giặc trên cầu & Khói súng (18s - 27s) ===
    tl.to(state, { lyricAlpha: 0, duration: 0.3 }, 17.8);
    tl.set(
      state,
      {
        currentLyric:
          "Sao không hát cho người giết giặc trên cầu? Khi bùn lầy còn pha sắc áo xanh...",
      },
      18.2,
    );
    tl.to(state, { lyricAlpha: 1, duration: 0.4 }, 18.4);

    // Hỏa châu từ từ rơi, chấn động chiến hào
    tl.to(state, { flareY: 260, duration: 8.5, ease: "power1.inOut" }, 18.5);
    tl.to(
      state,
      { bridgeShake: 1.2, duration: 0.3, repeat: 10, yoyo: true },
      19.5,
    );

    tl.to(state, { lyricAlpha: 0, duration: 0.4 }, 22.2);
    tl.set(
      state,
      { currentLyric: "Trong khói súng xây thành mắt quầng thâm mất ngủ..." },
      22.6,
    );
    tl.to(state, { lyricAlpha: 1, duration: 0.4 }, 22.8);

    // Chuyển Scene 3 -> Scene 4 (27.0s)
    tl.to(state, { scene3Alpha: 0, flareAlpha: 0, duration: 1.2 }, 26.8);
    tl.to(state, { scene4Alpha: 1, duration: 1.5 }, 27.0);

    // === ĐOẠN 4: Tàn đêm khói lửa, hai tiếng bên anh (27s - 34s) ===
    tl.to(state, { lyricAlpha: 0, duration: 0.4 }, 26.8);
    tl.set(
      state,
      { currentLyric: "Tàn đêm khói lửa... giờ chỉ còn hai tiếng BÊN ANH." },
      27.5,
    );
    tl.to(state, { lyricAlpha: 1, duration: 0.8 }, 27.8);

    // Mặt trời bình minh từ từ nhô lên
    tl.to(state, { sunRiseY: 300, duration: 5.5, ease: "power2.out" }, 27.5);

    return () => {
      tl.kill();
    };
  }, []);

  const handlePlayPause = () => {
    if (!tlRef.current) return;
    if (isPlaying) {
      tlRef.current.pause();
    } else {
      tlRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    if (!tlRef.current) return;
    tlRef.current.restart();
    setIsPlaying(true);
  };

  const handleSeek = (e) => {
    if (!tlRef.current) return;
    const val = parseFloat(e.target.value);
    tlRef.current.seek(val);
    setTime(val);
  };

  return (
    <div
      style={{
        maxWidth: "960px",
        margin: "24px auto",
        background: "#030a07",
        padding: "24px",
        borderRadius: "16px",
        color: "#fef08a",
        fontFamily: "'Georgia', serif",
        boxShadow: "0 25px 60px rgba(0,0,0,0.9)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "14px",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: "20px",
              color: "#86efac",
              letterSpacing: "1px",
            }}
          >
            🌿 RỪNG LÁ THẤP — TRẦN THIỆN THANH
          </h2>
          <span
            style={{ fontSize: "13px", color: "#a7f3d0", fontStyle: "italic" }}
          >
            Trích đoạn hoạt cảnh ca từ điện ảnh (Cinematic Canvas Video)
          </span>
        </div>
        <span
          style={{
            fontSize: "15px",
            color: "#fde047",
            fontFamily: "monospace",
          }}
        >
          {time.toFixed(1)}s / 34.0s
        </span>
      </div>

      {/* CANVAS MÀN HÌNH HOẠT CẢNH */}
      <div
        style={{
          width: "100%",
          borderRadius: "12px",
          overflow: "hidden",
          border: "1px solid #14532d",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{ width: "100%", height: "auto", display: "block" }}
        />
      </div>

      {/* THANH TUA TIẾN ĐỘ THỜI GIAN */}
      <div style={{ marginTop: "16px" }}>
        <input
          type="range"
          min="0"
          max="34"
          step="0.05"
          value={time}
          onChange={handleSeek}
          style={{ width: "100%", accentColor: "#22c55e", cursor: "pointer" }}
        />
      </div>

      {/* CỤM ĐIỀU KHIỂN & HƯỚNG DẪN */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginTop: "14px",
          alignItems: "center",
        }}
      >
        <button
          onClick={handlePlayPause}
          style={{
            padding: "9px 24px",
            fontSize: "14px",
            fontWeight: "bold",
            background: isPlaying ? "#1e3a2f" : "#22c55e",
            color: "#fff",
            border: "1px solid #34d399",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          {isPlaying ? "Tạm Dừng" : "Phát Tiếp"}
        </button>

        <button
          onClick={handleRestart}
          style={{
            padding: "9px 24px",
            fontSize: "14px",
            fontWeight: "bold",
            background: "#14532d",
            color: "#fff",
            border: "1px solid #166534",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Xem Lại Từ Đầu
        </button>

        <div
          style={{
            fontSize: "13px",
            color: "#86efac",
            marginLeft: "auto",
            fontStyle: "italic",
          }}
        >
          💡{" "}
          <i>
            Bạn có thể bật bài hát "Rừng Lá Thấp" bên ngoài rồi ấn phát cùng lúc
            để khớp từng câu chữ!
          </i>
        </div>
      </div>
    </div>
  );
}
