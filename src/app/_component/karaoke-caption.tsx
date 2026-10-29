import React, { useState, useEffect, useMemo } from "react";
import gsap from "gsap";
import { useFrame } from "./bake/player/hooks";

// 1. MOCK DATA TỪNG TỪ KÈM THỜI GIAN (giây)
const CAPTION_DATA = [
  { word: "Xin", duration: 0.35 },
  { word: "chào", duration: 0.35 },
  { word: "mọi", duration: 0.3 },
  { word: "người", duration: 0.4 },
  { word: "mình", duration: 0.3 },
  { word: "tên", duration: 0.3 },
  { word: "là", duration: 0.25 },
  { word: "ABC", duration: 0.7 },
];

export const KaraokeCaption = () => {
  const [activeIdx, setActiveIdx] = useState(-1);

  useFrame((frame) => {
    console.log(frame);
  });

  // // 2. DÙNG GSAP TIMELINE ĐỂ ĐIỀU PHỐI NHỊP HÁT
  // useEffect(() => {
  //   // Tạo timeline lặp lại vô tận (repeatDelay 1s sau mỗi lần chạy hết câu)
  //   const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });

  //   CAPTION_DATA.forEach((item, index) => {
  //     tl.to(
  //       {},
  //       {
  //         duration: item.duration,
  //         onStart: () => {
  //           setActiveIdx(index);
  //         },
  //       },
  //     );
  //   });

  //   // Reset lại từ đầu khi kết thúc vòng
  //   tl.eventCallback("onRepeat", () => {
  //     setActiveIdx(-1);
  //   });

  //   return () => {
  //     tl.kill();
  //   };
  // }, []);

  // 3. BUILD CHUỖI HTML THEO TRẠNG THÁI (Đang đọc / Đã qua / Chưa tới)
  const captionHtml = useMemo(() => {
    const wordsHtml = CAPTION_DATA.map((item, index) => {
      // TRƯỜNG HỢP 1: Từ đang hát (Rực sáng, phóng to, nền neon)
      if (index === activeIdx) {
        return `
          <span style="
            display: inline-block;
            color: #ffe600;
            background: #ff0055;
            padding: 2px 10px;
            margin: 0 4px;
            border-radius: 8px;
            font-weight: 900;
            transform: scale(1.18) rotate(-2deg);
            box-shadow: 3px 3px 0 #000;
            text-shadow: 0 0 10px rgba(255, 230, 0, 0.8);
          ">${item.word}</span>
        `;
      }

      // TRƯỜNG HỢP 2: Các từ đã đọc qua (Sáng rõ màu cyan)
      if (index < activeIdx) {
        return `
          <span style="
            display: inline-block;
            color: #00f0ff;
            margin: 0 4px;
            font-weight: 800;
            text-shadow: 1px 1px 0 #000;
          ">${item.word}</span>
        `;
      }

      // TRƯỜNG HỢP 3: Các từ chưa tới (Màu tối / mờ 40%)
      return `
        <span style="
          display: inline-block;
          color: rgba(255, 255, 255, 0.4);
          margin: 0 4px;
          font-weight: 700;
        ">${item.word}</span>
      `;
    }).join("");

    return `
      <div style="padding: 16px; box-sizing: border-box;">
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          width: 620px;
          padding: 12px 20px;
          background: rgba(14, 5, 24, 0.88);
          border: 3px solid #ff0055;
          border-radius: 18px 4px 20px 6px;
          box-shadow: 6px 6px 0px #00f0ff;
          font-family: 'Arial Black', Impact, sans-serif;
          font-size: 22px;
          line-height: 1.8;
          text-align: center;
          box-sizing: border-box;
          transform: rotate(-1deg);
        ">
          ${wordsHtml}
        </div>
      </div>
    `;
  }, [activeIdx]);

  return (
    <pixiHtmlText
      anchor={{ x: 0.5, y: 0.5 }}
      text={captionHtml}
      style={{
        wordWrapWidth: 1920,
      }}
      x={1920 / 2}
      y={1080 / 2}
    />
  );
};
