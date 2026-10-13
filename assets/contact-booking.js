(() => {
  const widget = document.querySelector(".calendly-inline-widget");
  if (!widget) return;
  const baseUrl = "https://calendly.com/mohamedabolila00/growth-conversation";
  const eventUrl = new URL(baseUrl);
  const assessmentCode = new URLSearchParams(window.location.search).get("assessment");
  if (assessmentCode && /^[A-Z0-9]{6}$/.test(assessmentCode)) {
    eventUrl.searchParams.set("utm_content", assessmentCode);
    const note = document.querySelector("#assessment-booking-context");
    if (note) {
      note.hidden = false;
      note.querySelector("strong").textContent = assessmentCode;
    }
  }
  widget.dataset.url = eventUrl.toString();
  const fallback = document.querySelector(".calendly-fallback a");
  if (fallback) fallback.href = eventUrl.toString();
  const shell = widget.closest(".calendly-shell");
  const loading = shell?.querySelector(".calendly-loading");
  let settled = false;
  const finishLoading = () => {
    if (settled || !widget.querySelector("iframe")) return;
    settled = true;
    shell.classList.add("is-loaded");
    loading?.setAttribute("hidden", "");
  };
  const observer = new MutationObserver(finishLoading);
  observer.observe(widget, { childList: true, subtree: true });
  const startWidget = () => {
    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    script.onload = () => window.setTimeout(finishLoading, 700);
    script.onerror = () => {
      settled = true;
      shell.classList.add("is-failed");
      loading?.setAttribute("hidden", "");
    };
    document.body.append(script);
    window.setTimeout(() => {
      if (settled) return;
      shell.classList.add("is-failed");
      loading?.setAttribute("hidden", "");
    }, 12000);
  };
  if ("IntersectionObserver" in window) {
    const nearViewport = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        nearViewport.disconnect();
        startWidget();
      }
    }, { rootMargin: "280px 0px" });
    nearViewport.observe(widget);
  } else {
    startWidget();
  }
})();
