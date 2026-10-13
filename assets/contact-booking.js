(() => {
  const widget = document.querySelector(".calendly-inline-widget");
  if (!widget) return;
  const assessmentCode = new URLSearchParams(window.location.search).get("assessment");
  const eventUrl = new URL("https://calendly.com/mohamedabolila00/growth-conversation");
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
  const script = document.createElement("script");
  script.src = "https://assets.calendly.com/assets/external/widget.js";
  script.async = true;
  document.body.append(script);
})();

