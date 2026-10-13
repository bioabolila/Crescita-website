(() => {
  "use strict";

  const SUPABASE_URL = "https://jgccqzblrlcucvbdayea.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_vy7hjPnaim4y8FQkQ52BsQ_TWWlwOlr";
  const ASSESSMENT_VERSION = 1;
  const SCORING_VERSION = 1;
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  const categories = [
    { key: "strategy", title: "Strategy", questions: [0, 1, 2], next: "Clarify the growth constraint, priorities, and assumptions driving decisions." },
    { key: "acquisition", title: "Acquisition", questions: [3, 4, 5], next: "Understand channel economics, dependency, and demand." },
    { key: "conversion", title: "Conversion", questions: [6, 7, 8], next: "Map customer behaviour and identify which part of the journey is limiting action." },
    { key: "retention", title: "Retention", questions: [9, 10], next: "Understand what makes customers stay, return, or leave." },
    { key: "analytics", title: "Analytics", questions: [11, 12], next: "Validate the measures behind growth decisions and find where confidence breaks down." },
    { key: "experimentation", title: "Experimentation", questions: [13, 14], next: "Build a clearer loop from hypothesis to experiment, measurement, and learning." }
  ];
  const questions = [
    { category: "THE CONSTRAINT", prompt: "How clearly do you know what is currently limiting your growth?", answers: ["We know exactly what is limiting us", "We have a strong hypothesis", "We have several competing theories", "We're mostly making assumptions", "We don't really know"] },
    { category: "DIRECTION", prompt: "How clear is your company's growth strategy for the next 6–12 months?", answers: ["Very clear — priorities, targets, and direction are aligned", "Clear — but we have some competing priorities", "We have goals, but not a clear strategy", "We're mostly reacting to opportunities as they appear", "We're figuring it out as we go"] },
    { category: "PRIORITIES", prompt: "When several growth opportunities compete for attention, how does your team decide what to pursue?", answers: ["We use a consistent framework based on impact and effort", "We evaluate opportunities systematically most of the time", "We discuss them case by case", "Urgency or internal opinion often determines the priority", "We tend to try whatever seems promising"] },
    { category: "PREDICTABILITY", prompt: "How predictable is your ability to generate qualified new customers?", answers: ["Very predictable — we can reliably forecast acquisition", "Generally predictable, with some variation", "It varies significantly month to month", "Growth depends heavily on a few campaigns or channels", "We don't have a reliable acquisition engine yet"] },
    { category: "CHANNEL ECONOMICS", prompt: "How confidently can you explain the economics of your acquisition channels?", answers: ["We understand CAC, conversion, and contribution by channel", "We understand most of the important economics", "We track some channel metrics but have gaps", "We mostly rely on surface-level metrics", "We're not sure which channels are actually profitable"] },
    { category: "DEPENDENCY", prompt: "If your biggest acquisition channel stopped working tomorrow, what would happen?", answers: ["We'd have several viable alternatives", "We'd be affected, but could adapt", "We'd have a significant short-term problem", "It would seriously threaten our growth", "We don't know what would happen"] },
    { category: "FUNNEL VISIBILITY", prompt: "How well do you understand where potential customers drop out of your journey?", answers: ["Extremely well — we can identify the important drop-offs and why they happen", "We have a strong understanding of the major drop-offs", "We know where some drop-offs happen, but not always why", "We have data, but it's difficult to interpret", "We don't really know"] },
    { category: "VALUE PROPOSITION", prompt: "How confident are you that your target customers immediately understand why they should choose you?", answers: ["Extremely confident — this is consistently validated", "Very confident", "Somewhat confident", "We regularly encounter confusion or objections", "We're not sure"] },
    { category: "IMPROVEMENT", prompt: "When conversion is lower than expected, what usually happens?", answers: ["We investigate, form a hypothesis, test it, and measure the result", "We investigate and regularly run structured tests", "We make improvements occasionally, but inconsistently", "Changes are usually based on opinion or intuition", "We rarely investigate conversion"] },
    { category: "WHY CUSTOMERS STAY", prompt: "How well do you understand why customers stay, return, or leave?", answers: ["Extremely well — we actively measure and investigate these behaviours", "We have a strong understanding", "We have some useful indicators", "We mostly react when customers leave", "We don't really know"] },
    { category: "EXISTING CUSTOMERS", prompt: "How deliberately does your business increase the value of existing customers?", answers: ["We have a deliberate system for retention, repeat purchase, or expansion", "We have several initiatives working toward this", "We do some retention work, but it isn't systematic", "Most of our effort goes toward acquiring new customers", "We don't actively focus on increasing customer value"] },
    { category: "TRUST IN THE NUMBERS", prompt: "How confident are you in the data you use to make growth decisions?", answers: ["Extremely confident — our important metrics are reliable and understood", "Mostly confident", "Some metrics are reliable, others aren't", "We frequently question the numbers", "We don't have enough reliable data"] },
    { category: "WHEN SOMETHING CHANGES", prompt: "When an important growth metric suddenly changes, what does your team usually do first?", answers: ["Investigate the underlying cause before deciding what to do", "Investigate the cause, then act quickly", "Look for the most obvious explanation", "React by changing campaigns, tactics, or budgets", "We're often unsure what caused the change"] },
    { category: "TESTING", prompt: "How does your team typically test a new growth idea?", answers: ["Hypothesis → experiment → measurement → learning", "We run structured tests fairly regularly", "We test ideas, but inconsistently", "We usually launch ideas and judge the results afterward", "We rarely experiment"] },
    { category: "LEARNING LOOP", prompt: "How often does what your team learns directly influence its next growth decision?", answers: ["Almost always", "Often", "Sometimes", "Rarely", "Almost never"] }
  ];

  const startButton = document.querySelector("#start-assessment");
  const intro = document.querySelector("#assessment-intro");
  const workspace = document.querySelector("#assessment-workspace");
  const results = document.querySelector("#assessment-results");
  const categoryLabel = document.querySelector("#question-category");
  const questionTitle = document.querySelector("#question-title");
  const optionsNode = document.querySelector("#answer-options");
  const progressLabel = document.querySelector("#assessment-progress-label");
  const progressFill = document.querySelector("#assessment-progress-fill");
  const codeLabel = document.querySelector("#assessment-code-label");
  const previousButton = document.querySelector("#previous-question");
  const nextButton = document.querySelector("#next-question");
  const answerHint = document.querySelector("#answer-hint");
  const errorNode = document.querySelector("#assessment-error");
  const startErrorNode = document.querySelector("#assessment-start-error");
  let client = null;
  let currentAssessment = null;
  let answers = {};
  let questionIndex = 0;
  let selectedAnswer = null;
  let saving = false;
  let transitioning = false;
  let revisionQuestion = false;
  let autoAdvanceTimer = null;

  const localKey = "crescita.assessment.code";
  const startFresh = new URLSearchParams(window.location.search).get("new") === "1";
  const memoryStorage = new Map();
  const sessionStorageAdapter = {
    getItem(key) {
      try { return window.localStorage.getItem(key); } catch { return memoryStorage.get(key) || null; }
    },
    setItem(key, value) {
      try { window.localStorage.setItem(key, value); } catch { memoryStorage.set(key, value); }
    },
    removeItem(key) {
      try { window.localStorage.removeItem(key); } catch { memoryStorage.delete(key); }
    }
  };

  function setError(message) {
    errorNode.textContent = message || "";
  }

  function setStartError(message) {
    startErrorNode.textContent = message || "";
  }

  function makeCode() {
    const bytes = new Uint8Array(6);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, value => alphabet[value % alphabet.length]).join("");
  }

  async function getClient() {
    if (client) return client;
    if (!window.supabase || !window.supabase.createClient) {
      throw new Error("The assessment service did not load. Check your connection and try again.");
    }
    client = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { storage: sessionStorageAdapter, persistSession: true, autoRefreshToken: true, detectSessionInUrl: false }
    });
    return client;
  }

  async function ensureSession() {
    const db = await getClient();
    const sessionResult = await db.auth.getSession();
    if (sessionResult.error) throw sessionResult.error;
    if (sessionResult.data.session) return sessionResult.data.session;
    const signInResult = await db.auth.signInAnonymously();
    if (signInResult.error) throw signInResult.error;
    return signInResult.data.session;
  }

  async function recordEvent(eventType, metadata) {
    if (!currentAssessment || !client) return;
    const result = await client.from("assessment_events").insert({
      assessment_id: currentAssessment.id,
      event_type: eventType,
      metadata: metadata || null
    });
    if (result.error) console.warn("Assessment event could not be saved.", result.error.message);
  }

  async function createAssessment() {
    const session = await ensureSession();
    let lastError = null;
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const code = makeCode();
      const result = await client.from("assessments").insert({
        assessment_id: code,
        status: "in_progress",
        current_question: 1,
        assessment_version: ASSESSMENT_VERSION,
        scoring_version: SCORING_VERSION,
        user_id: session.user.id
      }).select("id,assessment_id,status,current_question,assessment_version,scoring_version").single();
      if (!result.error) {
        currentAssessment = result.data;
        sessionStorageAdapter.setItem(localKey, code);
        answers = {};
        await recordEvent("started", { assessment_version: ASSESSMENT_VERSION });
        return;
      }
      lastError = result.error;
      if (result.error.code !== "23505") break;
    }
    throw lastError || new Error("A new assessment could not be started.");
  }

  async function restoreAssessment() {
    const code = sessionStorageAdapter.getItem(localKey);
    if (!code) return false;
    const db = await getClient();
    const session = await ensureSession();
    const assessmentResult = await db.from("assessments")
      .select("id,assessment_id,status,current_question,assessment_version,scoring_version,user_id")
      .eq("assessment_id", code)
      .maybeSingle();
    if (assessmentResult.error || !assessmentResult.data) return false;
    if (assessmentResult.data.user_id && assessmentResult.data.user_id !== session.user.id) return false;
    currentAssessment = assessmentResult.data;
    const answerResult = await db.from("assessment_answers")
      .select("question_id,answer")
      .eq("assessment_id", currentAssessment.id);
    if (answerResult.error) throw answerResult.error;
    answers = Object.fromEntries((answerResult.data || []).map(row => [row.question_id, row.answer]));
    if (currentAssessment.status === "completed") {
      const resultResult = await db.from("assessment_results").select("*")
        .eq("assessment_id", currentAssessment.id).maybeSingle();
      if (resultResult.error) throw resultResult.error;
      if (resultResult.data) {
        showResults(resultResult.data);
        return true;
      }
      await finishAssessment();
      return true;
    }
    questionIndex = Math.max(0, Math.min(questions.length - 1, (currentAssessment.current_question || 1) - 1));
    showQuestionnaire();
    return true;
  }

  function showQuestionnaire() {
    intro.hidden = true;
    results.hidden = true;
    workspace.hidden = false;
    renderQuestion();
    questionTitle.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderQuestion() {
    const question = questions[questionIndex];
    const questionId = "Q" + (questionIndex + 1);
    selectedAnswer = answers[questionId] || null;
    revisionQuestion = Boolean(answers[questionId]);
    categoryLabel.textContent = question.category;
    questionTitle.textContent = question.prompt;
    progressLabel.textContent = "QUESTION " + String(questionIndex + 1).padStart(2, "0") + " OF 15";
    progressFill.style.width = (((questionIndex + 1) / questions.length) * 100) + "%";
    codeLabel.textContent = currentAssessment ? "ID " + currentAssessment.assessment_id : "";
    updateQuestionControls();
    nextButton.innerHTML = questionIndex === questions.length - 1 ? "See my growth profile <span>→</span>" : "Continue <span>→</span>";
    answerHint.textContent = revisionQuestion
      ? "You’re revisiting this answer. Continue when you’re ready."
      : "Select one answer to continue.";
    optionsNode.replaceChildren();
    question.answers.forEach((answer, answerIndex) => {
      const value = String.fromCharCode(65 + answerIndex);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "assessment-option" + (selectedAnswer === value ? " is-selected" : "");
      button.setAttribute("aria-pressed", String(selectedAnswer === value));
      button.innerHTML = '<span class="assessment-option-letter"></span><span class="assessment-option-copy"></span><span class="assessment-option-arrow" aria-hidden="true">↗</span>';
      button.querySelector(".assessment-option-letter").textContent = value;
      button.querySelector(".assessment-option-copy").textContent = answer;
      button.addEventListener("click", () => {
        if (autoAdvanceTimer) window.clearTimeout(autoAdvanceTimer);
        selectedAnswer = value;
        document.querySelectorAll(".assessment-option").forEach(option => {
          const active = option === button;
          option.classList.toggle("is-selected", active);
          option.setAttribute("aria-pressed", String(active));
        });
        if (revisionQuestion) {
          updateQuestionControls();
          answerHint.textContent = answers[questionId] === value
            ? "Answer selected. Continue when you’re ready."
            : "Answer changed. Continue when you’re ready.";
          return;
        }
        nextButton.disabled = true;
        answerHint.textContent = "Moving to the next question…";
        autoAdvanceTimer = window.setTimeout(() => {
          autoAdvanceTimer = null;
          if (selectedAnswer === value && !saving && !transitioning && !revisionQuestion) continueAssessment();
        }, 420);
      });
      optionsNode.append(button);
    });
  }

  function updateQuestionControls() {
    previousButton.disabled = questionIndex === 0 || saving || transitioning;
    nextButton.disabled = !selectedAnswer || saving || transitioning;
  }

  async function transitionToQuestion(nextIndex) {
    if (transitioning) return;
    const layout = document.querySelector(".assessment-question-layout");
    transitioning = true;
    updateQuestionControls();
    if (layout) {
      layout.classList.add("is-leaving");
      await new Promise(resolve => window.setTimeout(resolve, 180));
    }
    questionIndex = nextIndex;
    renderQuestion();
    if (layout) {
      layout.classList.remove("is-leaving");
      layout.classList.add("is-entering");
      window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
        layout.classList.remove("is-entering");
        transitioning = false;
        updateQuestionControls();
      }));
    } else {
      transitioning = false;
      updateQuestionControls();
    }
    questionTitle.focus({ preventScroll: true });
  }

  async function saveCurrentAnswer() {
    if (!selectedAnswer || !currentAssessment) return;
    const number = questionIndex + 1;
    const result = await client.from("assessment_answers").upsert({
      assessment_id: currentAssessment.id,
      question_id: "Q" + number,
      answer: selectedAnswer,
      answered_at: new Date().toISOString()
    }, { onConflict: "assessment_id,question_id" });
    if (result.error) throw result.error;
    answers["Q" + number] = selectedAnswer;
    const updateResult = await client.from("assessments")
      .update({ current_question: Math.min(15, number + 1) })
      .eq("id", currentAssessment.id);
    if (updateResult.error) throw updateResult.error;
  }

  function scoresFromAnswers() {
    const scoreByQuestion = {};
    Object.entries(answers).forEach(([questionId, letter]) => {
      scoreByQuestion[questionId] = 70 - letter.charCodeAt(0);
    });
    return categories.map(category => {
      const values = category.questions.map(index => scoreByQuestion["Q" + (index + 1)]).filter(Number.isFinite);
      const score = values.reduce((total, value) => total + value, 0) / values.length;
      return { ...category, score: Math.round(score * 1000) / 1000, state: score < 3.5 ? "Reactive" : (score < 4.5 ? "Building" : "Compounding"), confidence: "High" };
    });
  }

  function buildSignals(scores) {
    const minScore = Math.min(...scores.map(item => item.score));
    const spread = Math.max(...scores.map(item => item.score)) - minScore;
    const lowest = scores.filter(item => item.score === minScore);
    if (spread < 0.45 || minScore >= 3.5) return { primary: [], secondary: [], profile: "No Dominant Profile" };
    return { primary: lowest.map(item => item.key), secondary: [], profile: lowest.length === 1 ? lowest[0].title + " Signal" : "Multiple Growth Signals" };
  }

  async function finishAssessment() {
    saving = true;
    nextButton.disabled = true;
    setError("");
    try {
      await saveCurrentAnswer();
      const scores = scoresFromAnswers();
      if (scores.some(item => !Number.isFinite(item.score))) throw new Error("Some answers are missing. Please review the assessment and try again.");
      const signals = buildSignals(scores);
      const completedAt = new Date().toISOString();
      const statusResult = await client.from("assessments")
        .update({ status: "completed", current_question: 15, completed_at: completedAt })
        .eq("id", currentAssessment.id);
      if (statusResult.error) throw statusResult.error;

      const existingResult = await client.from("assessment_results").select("id")
        .eq("assessment_id", currentAssessment.id).maybeSingle();
      if (existingResult.error) throw existingResult.error;
      if (!existingResult.data) {
        const resultRow = {
          assessment_id: currentAssessment.id,
          strategy_score: scores.find(item => item.key === "strategy").score,
          acquisition_score: scores.find(item => item.key === "acquisition").score,
          conversion_score: scores.find(item => item.key === "conversion").score,
          retention_score: scores.find(item => item.key === "retention").score,
          analytics_score: scores.find(item => item.key === "analytics").score,
          experimentation_score: scores.find(item => item.key === "experimentation").score,
          strategy_state: scores.find(item => item.key === "strategy").state,
          acquisition_state: scores.find(item => item.key === "acquisition").state,
          conversion_state: scores.find(item => item.key === "conversion").state,
          retention_state: scores.find(item => item.key === "retention").state,
          analytics_state: scores.find(item => item.key === "analytics").state,
          experimentation_state: scores.find(item => item.key === "experimentation").state,
          strategy_confidence: scores.find(item => item.key === "strategy").confidence,
          acquisition_confidence: scores.find(item => item.key === "acquisition").confidence,
          conversion_confidence: scores.find(item => item.key === "conversion").confidence,
          retention_confidence: scores.find(item => item.key === "retention").confidence,
          analytics_confidence: scores.find(item => item.key === "analytics").confidence,
          experimentation_confidence: scores.find(item => item.key === "experimentation").confidence,
          primary_signals: signals.primary,
          secondary_signals: signals.secondary,
          profile_archetype: signals.profile,
          assessment_version: ASSESSMENT_VERSION,
          scoring_version: SCORING_VERSION
        };
        const insertResult = await client.from("assessment_results").insert(resultRow).select("*").single();
        if (insertResult.error) throw insertResult.error;
        currentAssessment.status = "completed";
        await recordEvent("completed", { assessment_version: ASSESSMENT_VERSION, scoring_version: SCORING_VERSION });
        showResults(insertResult.data);
      } else {
        const savedResult = await client.from("assessment_results").select("*")
          .eq("assessment_id", currentAssessment.id).single();
        if (savedResult.error) throw savedResult.error;
        currentAssessment.status = "completed";
        showResults(savedResult.data);
      }
    } catch (error) {
      setError(error.message || "We couldn’t save your assessment. Check your connection and try again.");
      nextButton.disabled = false;
    } finally {
      saving = false;
    }
  }

  function scoreState(score) {
    return score < 3.5 ? "Reactive" : (score < 4.5 ? "Building" : "Compounding");
  }

  function recommendationsFor(resultsByCategory) {
    const values = categories.map(item => ({ ...item, score: Number(resultsByCategory[item.key + "_score"]) }));
    const minScore = Math.min(...values.map(item => item.score));
    const lowest = values.filter(item => item.score === minScore);
    const maxScore = Math.max(...values.map(item => item.score));
    if (maxScore - minScore < 0.45) {
      return {
        title: "The constraint determines the next move.",
        copy: "Your responses don’t point to a single obvious constraint.",
        items: [values[0], values[1]]
      };
    }
    return {
      title: "Start with what is holding growth back.",
      copy: lowest.length === 1 ? "Your clearest signal is in " + lowest[0].title.toLowerCase() + ". We’d begin by understanding what sits behind that score." : "Several parts of the system are showing a similar signal. We’d look at how they interact before choosing a move.",
      items: lowest.length > 1 ? lowest.slice(0, 2) : [lowest[0], ...values.filter(item => item.key !== lowest[0].key).sort((a, b) => a.score - b.score).slice(0, 1)]
    };
  }

  function showResults(result) {
    workspace.hidden = true;
    intro.hidden = true;
    results.hidden = false;
    document.querySelector("#result-code").textContent = currentAssessment.assessment_id;
    document.querySelector("#result-profile").textContent = result.profile_archetype || "No Dominant Profile";
    const scores = categories.map(item => ({ ...item, score: Number(result[item.key + "_score"]), state: result[item.key + "_state"] || scoreState(Number(result[item.key + "_score"])) }));
    const scoreSpread = Math.max(...scores.map(item => item.score)) - Math.min(...scores.map(item => item.score));
    document.querySelector("#result-summary").textContent = scoreSpread < 0.45
      ? "No single pattern is strong enough to define the system."
      : "Your answers point to a clear place to investigate before choosing the next move.";
    const scoreGrid = document.querySelector("#assessment-scores");
    scoreGrid.replaceChildren();
    scores.forEach(item => {
      const card = document.createElement("article");
      card.className = "assessment-score-card";
      card.innerHTML = '<div class="assessment-score-card-top"><span class="assessment-result-label"></span><span class="assessment-score-state"></span></div><h3 class="serif"></h3><div class="assessment-score-number"></div><div class="assessment-score-rule"><i></i></div>';
      card.querySelector(".assessment-result-label").textContent = item.title.toUpperCase();
      card.querySelector(".assessment-score-state").textContent = item.state;
      card.querySelector("h3").textContent = item.title;
      card.querySelector(".assessment-score-number").textContent = item.score.toFixed(1);
      card.querySelector(".assessment-score-rule i").style.width = (item.score / 5 * 100) + "%";
      scoreGrid.append(card);
    });
    const next = recommendationsFor(Object.fromEntries(scores.map(item => [item.key + "_score", item.score])));
    document.querySelector("#result-first-title").textContent = next.title;
    document.querySelector("#result-first-copy").textContent = next.copy;
    const investigations = document.querySelector("#result-investigations");
    investigations.replaceChildren();
    next.items.forEach((item, index) => {
      const article = document.createElement("article");
      article.className = "assessment-investigation-item";
      article.innerHTML = '<span class="assessment-investigation-num"></span><div><h3 class="serif"></h3><p></p></div>';
      article.querySelector(".assessment-investigation-num").textContent = "0" + (index + 1);
      article.querySelector("h3").textContent = item.title;
      article.querySelector("p").textContent = item.next;
      investigations.append(article);
    });
    document.querySelector("#assessment-booking-link").href = "contact.html?assessment=" + encodeURIComponent(currentAssessment.assessment_id) + "#growth-conversation";
    sessionStorageAdapter.setItem(localKey, currentAssessment.assessment_id);
    recordEvent("result_viewed", { assessment_version: ASSESSMENT_VERSION });
    document.querySelector("#result-profile").focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  startButton.addEventListener("click", async () => {
    startButton.disabled = true;
    setStartError("");
    try {
      const db = await getClient();
      await ensureSession();
      if (!startFresh) {
        const restored = await restoreAssessment();
        if (restored) return;
      }
      await createAssessment();
      questionIndex = 0;
      showQuestionnaire();
    } catch (error) {
      setStartError(error.message || "We couldn’t start the assessment. Please try again.");
      startErrorNode.scrollIntoView({ behavior: "smooth", block: "center" });
    } finally {
      startButton.disabled = false;
    }
  });

  async function continueAssessment() {
    if (!selectedAnswer || saving) return;
    if (autoAdvanceTimer) {
      window.clearTimeout(autoAdvanceTimer);
      autoAdvanceTimer = null;
    }
    saving = true;
    updateQuestionControls();
    setError("");
    try {
      if (questionIndex === questions.length - 1) {
        await finishAssessment();
      } else {
        await saveCurrentAnswer();
        await transitionToQuestion(questionIndex + 1);
      }
    } catch (error) {
      setError(error.message || "We couldn’t save that answer. Check your connection and try again.");
    } finally {
      saving = false;
      if (!workspace.hidden) {
        updateQuestionControls();
      }
    }
  }

  nextButton.addEventListener("click", continueAssessment);

  previousButton.addEventListener("click", async () => {
    if (questionIndex === 0 || saving) return;
    if (autoAdvanceTimer) {
      window.clearTimeout(autoAdvanceTimer);
      autoAdvanceTimer = null;
    }
    setError("");
    await transitionToQuestion(questionIndex - 1);
  });

  const savedCode = sessionStorageAdapter.getItem(localKey);
  if (startFresh) {
    startButton.innerHTML = "Start a new assessment <span>→</span>";
  } else if (savedCode) {
    startButton.innerHTML = "Continue your assessment <span>→</span>";
  }
})();
