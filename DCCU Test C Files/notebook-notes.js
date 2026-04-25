(function () {
  const POSITION_KEY = "dccu-study-notes-widget-pos";
  const DRAG_THRESHOLD_PX = 6;

  function loadPosition() {
    try {
      const raw = sessionStorage.getItem(POSITION_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (
        typeof parsed?.left === "number" &&
        typeof parsed?.top === "number" &&
        Number.isFinite(parsed.left) &&
        Number.isFinite(parsed.top)
      ) {
        return parsed;
      }
    } catch {
      /* ignore */
    }
    return null;
  }

  function savePosition(left, top) {
    try {
      sessionStorage.setItem(POSITION_KEY, JSON.stringify({ left, top }));
    } catch {
      /* ignore */
    }
  }

  function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
  }

  function init() {
    if (document.getElementById("study-notes-float")) return;

    const saved = loadPosition();
    const float = document.createElement("div");
    float.id = "study-notes-float";
    float.className = "study-notes-float";
    float.setAttribute("role", "img");
    float.setAttribute("aria-label", "Draggable exam notes reference sheet");

    const img = document.createElement("img");
    img.className = "study-notes-float-img";
    img.src = "assets/incomplete_notebook.png";
    img.alt = "Handwritten energy drink exam notes on notebook paper";
    img.draggable = false;

    float.appendChild(img);
    document.body.appendChild(float);

    const defaultLeft = Math.max(16, window.innerWidth - 220);
    const defaultTop = 120;
    let left = saved?.left ?? defaultLeft;
    let top = saved?.top ?? defaultTop;
    float.style.left = `${left}px`;
    float.style.top = `${top}px`;

    const lightbox = document.createElement("div");
    lightbox.id = "study-notes-lightbox";
    lightbox.className = "study-notes-lightbox";
    lightbox.setAttribute("aria-hidden", "true");
    lightbox.innerHTML = `
      <button type="button" class="study-notes-lightbox-close" aria-label="Close enlarged notes">&times;</button>
      <div class="study-notes-lightbox-inner">
        <img class="study-notes-lightbox-img" src="assets/incomplete_notebook.png" alt="" />
      </div>
    `;
    document.body.appendChild(lightbox);

    const closeBtn = lightbox.querySelector(".study-notes-lightbox-close");
    function openLightbox() {
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.classList.add("study-notes-lightbox-open");
      closeBtn.focus();
    }

    function closeLightbox() {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.classList.remove("study-notes-lightbox-open");
    }

    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeLightbox();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && lightbox.classList.contains("is-open")) {
        closeLightbox();
      }
    });

    let dragState = null;

    function onPointerMove(e) {
      if (!dragState) return;
      const dx = e.clientX - dragState.startX;
      const dy = e.clientY - dragState.startY;
      if (!dragState.isDragging) {
        if (Math.hypot(dx, dy) >= DRAG_THRESHOLD_PX) {
          dragState.isDragging = true;
          float.classList.add("is-dragging");
        }
      }
      if (!dragState.isDragging) return;
      const w = float.offsetWidth;
      const h = float.offsetHeight;
      left = clamp(
        dragState.originLeft + dx,
        8,
        Math.max(8, window.innerWidth - w - 8)
      );
      top = clamp(
        dragState.originTop + dy,
        8,
        Math.max(8, window.innerHeight - h - 8)
      );
      float.style.left = `${left}px`;
      float.style.top = `${top}px`;
    }

    function endPointer(e) {
      if (!dragState) return;
      const pointerId = e.pointerId;
      const wasDragging = dragState.isDragging;
      const dx = e.clientX - dragState.startX;
      const dy = e.clientY - dragState.startY;
      const moved = Math.hypot(dx, dy);
      dragState = null;
      float.classList.remove("is-dragging");
      float.releasePointerCapture?.(pointerId);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", endPointer);
      window.removeEventListener("pointercancel", endPointer);

      if (wasDragging) {
        savePosition(left, top);
        return;
      }
      if (moved < DRAG_THRESHOLD_PX) {
        openLightbox();
      } else {
        savePosition(left, top);
      }
    }

    float.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      float.setPointerCapture(e.pointerId);
      dragState = {
        startX: e.clientX,
        startY: e.clientY,
        originLeft: left,
        originTop: top,
        isDragging: false,
      };
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", endPointer);
      window.addEventListener("pointercancel", endPointer);
    });

    window.addEventListener(
      "resize",
      () => {
        const w = float.offsetWidth;
        const h = float.offsetHeight;
        left = clamp(left, 8, Math.max(8, window.innerWidth - w - 8));
        top = clamp(top, 8, Math.max(8, window.innerHeight - h - 8));
        float.style.left = `${left}px`;
        float.style.top = `${top}px`;
      },
      { passive: true }
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
