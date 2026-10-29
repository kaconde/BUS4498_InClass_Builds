(function () {
  "use strict";

  const config = window.EVENT_RADAR_CONFIG || {};
  const supabaseUrl = String(config.supabaseUrl || "").replace(/\/$/, "");
  const publishableKey = String(config.publishableKey || "");
  const fields = "id, created_at, status, title, club, event_date, start_time, end_time, place_name, place_detail, cost, free_food, summary, flyer_url";

  const form = document.querySelector("#post-form");
  const announcement = document.querySelector("#announcement");
  const flyer = document.querySelector("#flyer");
  const charCount = document.querySelector("#char-count");
  const submitButton = document.querySelector("#submit-button");
  const result = document.querySelector("#post-result");
  const board = document.querySelector("#event-board");
  const refreshButton = document.querySelector("#refresh-button");
  const allFilter = document.querySelector("#all-filter");
  const foodFilter = document.querySelector("#food-filter");
  const moderatorSignin = document.querySelector("#moderator-signin");
  const moderatorEmail = document.querySelector("#moderator-email");
  const moderatorPassword = document.querySelector("#moderator-password");
  const moderatorMessage = document.querySelector("#moderator-message");
  const moderatorTools = document.querySelector("#moderator-tools");
  const moderatorSignout = document.querySelector("#moderator-signout");
  const waitingBoard = document.querySelector("#waiting-board");

  let client = null;
  let events = [];
  let foodOnly = false;
  const maxFlyerBytes = 5 * 1024 * 1024;

  function setText(element, value) {
    element.textContent = value == null ? "" : String(value);
  }

  function formatDate(dateText) {
    if (!dateText) return "";
    const parts = dateText.split("-").map(Number);
    if (parts.length !== 3 || parts.some(Number.isNaN)) return "";
    const date = new Date(parts[0], parts[1] - 1, parts[2]);
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(date);
  }

  function formatMonth(dateText) {
    if (!dateText) return "";
    const parts = dateText.split("-").map(Number);
    if (parts.length !== 3 || parts.some(Number.isNaN)) return "";
    return new Intl.DateTimeFormat("en-US", { month: "short" }).format(new Date(parts[0], parts[1] - 1, parts[2]));
  }

  function formatDay(dateText) {
    if (!dateText) return "";
    const parts = dateText.split("-").map(Number);
    if (parts.length !== 3 || parts.some(Number.isNaN)) return "";
    return String(parts[2]);
  }

  function formatTime(timeText) {
    if (!timeText) return "";
    const match = String(timeText).match(/^(\d{1,2}):(\d{2})/);
    if (!match) return "";
    const hour = Number(match[1]);
    const minute = Number(match[2]);
    if (hour > 23 || minute > 59) return "";
    const suffix = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${String(minute).padStart(2, "0")} ${suffix}`;
  }

  function formatWhen(event) {
    const date = formatDate(event.event_date);
    const start = formatTime(event.start_time);
    const end = formatTime(event.end_time);
    if (!date && !start) return "Date and time to be announced";
    if (!date) return start ? `Date to be announced · ${start}${end ? ` to ${end}` : ""}` : "Date and time to be announced";
    if (!start) return `${date} · Time to be announced`;
    return `${date} · ${start}${end ? ` to ${end}` : ""}`;
  }

  function isAllowedFlyerUrl(value) {
    const baseUrl = `${supabaseUrl}/storage/v1/object/public/flyers/`;
    return typeof value === "string" && value.startsWith(baseUrl);
  }

  function setResult(status, message, reasons) {
    result.hidden = false;
    result.className = `result ${status}`;
    result.replaceChildren();

    const label = document.createElement("p");
    label.className = "result-label";
    const labels = {
      published: "Posted",
      waiting: "Waiting for review",
      rejected: "Not posted",
      duplicate: "Already posted",
      error: "Something went wrong",
    };
    setText(label, labels[status] || labels.error);
    result.append(label);

    const messageText = document.createElement("p");
    setText(messageText, message || "The agent did not return a message.");
    result.append(messageText);

    const cleanReasons = Array.isArray(reasons) ? reasons.filter(Boolean) : [];
    if (cleanReasons.length) {
      const list = document.createElement("ul");
      list.className = "reasons";
      cleanReasons.forEach((reason) => {
        const item = document.createElement("li");
        setText(item, reason);
        list.append(item);
      });
      result.append(list);
    }
  }

  function appendReview(item, event) {
    const review = document.createElement("div");
    review.className = "review";

    const why = document.createElement("p");
    why.className = "why";
    setText(why, event.status_reason || "This post needs moderator review.");
    review.append(why);

    const original = document.createElement("p");
    original.className = "original";
    setText(original, event.announcement || "Original announcement unavailable.");
    review.append(original);

    const actions = document.createElement("p");
    actions.className = "actions";
    const approve = document.createElement("button");
    approve.type = "button";
    setText(approve, "Approve");
    approve.addEventListener("click", () => reviewEvent(event, "published"));
    const reject = document.createElement("button");
    reject.type = "button";
    reject.className = "ghost";
    setText(reject, "Reject");
    reject.addEventListener("click", () => reviewEvent(event, "rejected"));
    actions.append(approve, reject);
    review.append(actions);
    item.append(review);
  }

  function eventCard(event, reviewMode = false) {
    const item = document.createElement("li");
    item.className = "event";

    const date = document.createElement("div");
    date.className = event.event_date ? "date" : "date tba";
    if (event.event_date) {
      const month = document.createElement("span");
      month.className = "mon";
      setText(month, formatMonth(event.event_date));
      date.append(month);
    }
    const day = document.createElement("span");
    day.className = "day";
    setText(day, event.event_date ? formatDay(event.event_date) : "TBA");
    date.append(day);
    item.append(date);

    const body = document.createElement("div");
    body.className = "event-body";

    const when = document.createElement("p");
    when.className = "when";
    setText(when, formatWhen(event));
    body.append(when);

    const title = document.createElement("h3");
    setText(title, event.title || "Untitled event");
    body.append(title);

    const meta = document.createElement("p");
    meta.className = "meta";
    const metaParts = [event.club, event.place_name, event.place_detail].filter(Boolean);
    setText(meta, metaParts.join(" · ") || "Campus event");
    body.append(meta);

    const summary = document.createElement("p");
    summary.className = "summary";
    setText(summary, event.summary || "See the announcement for details.");
    body.append(summary);

    const tags = document.createElement("p");
    tags.className = "tags";
    if (event.cost) {
      const cost = document.createElement("span");
      cost.className = "tag";
      setText(cost, event.cost);
      tags.append(cost);
    }
    if (event.free_food) {
      const food = document.createElement("span");
      food.className = "tag food";
      setText(food, "🍕 Free food");
      tags.append(food);
    }
    if (tags.childElementCount) body.append(tags);
    item.append(body);

    if (isAllowedFlyerUrl(event.flyer_url)) {
      const image = document.createElement("img");
      image.className = "flyer";
      image.src = event.flyer_url;
      image.alt = `${event.title || "Event"} flyer`;
      image.loading = "lazy";
      item.append(image);
    }

    if (reviewMode) appendReview(item, event);

    return item;
  }

  function renderEvents() {
    board.replaceChildren();
    const visible = foodOnly ? events.filter((event) => event.free_food) : events;
    if (!visible.length) {
      const empty = document.createElement("li");
      empty.className = "empty";
      setText(empty, foodOnly ? "No free-food events yet." : "No events yet. Post the first one!");
      board.append(empty);
      return;
    }
    visible.forEach((event) => board.append(eventCard(event)));
  }

  async function loadEvents() {
    if (!client) {
      const empty = document.createElement("li");
      empty.className = "empty";
      setText(empty, "Add the Supabase settings in config.js to load events.");
      board.replaceChildren(empty);
      return;
    }

    refreshButton.disabled = true;
    try {
      const response = await client
        .from("events")
        .select(fields)
        .eq("status", "published")
        .order("event_date", { ascending: true })
        .order("start_time", { ascending: true });
      if (response.error) throw response.error;
      events = Array.isArray(response.data) ? response.data : [];
      renderEvents();
    } catch (error) {
      console.error("Could not load events", error);
      const empty = document.createElement("li");
      empty.className = "empty";
      setText(empty, "Events could not load. Please try Refresh.");
      board.replaceChildren(empty);
    } finally {
      refreshButton.disabled = false;
    }
  }

  async function loadWaitingEvents() {
    if (!client) return;
    waitingBoard.replaceChildren();
    try {
      const response = await client
        .from("events")
        .select("id, created_at, status, status_reason, announcement, title, club, event_date, start_time, end_time, place_name, place_detail, cost, free_food, summary, flyer_url")
        .eq("status", "waiting")
        .order("created_at", { ascending: false });
      if (response.error) throw response.error;
      const waiting = Array.isArray(response.data) ? response.data : [];
      if (!waiting.length) {
        const empty = document.createElement("li");
        empty.className = "empty";
        setText(empty, "No posts are waiting.");
        waitingBoard.append(empty);
        return;
      }
      waiting.forEach((event) => waitingBoard.append(eventCard(event, true)));
    } catch (error) {
      console.error("Could not load waiting events", error);
      const empty = document.createElement("li");
      empty.className = "empty";
      setText(empty, "Waiting posts could not load. Please try signing in again.");
      waitingBoard.append(empty);
    }
  }

  async function reviewEvent(event, nextStatus) {
    if (!client) return;
    const sessionResponse = await client.auth.getSession();
    const session = sessionResponse.data && sessionResponse.data.session;
    if (!session) {
      setText(moderatorMessage, "Please sign in again to review posts.");
      return;
    }

    const update = {
      status: nextStatus,
      status_reason: nextStatus === "rejected" ? "Rejected by moderator." : "",
      reviewed_at: new Date().toISOString(),
      reviewed_by: session.user.id,
    };
    const response = await client.from("events").update(update).eq("id", event.id);
    if (response.error) {
      console.error("Could not review event", response.error);
      setText(moderatorMessage, "That review could not be saved. Please try again.");
      return;
    }
    setText(moderatorMessage, nextStatus === "published" ? "The event is now published." : "The event was rejected.");
    await Promise.all([loadEvents(), loadWaitingEvents()]);
  }

  async function updateModerator(session) {
    if (!session) {
      moderatorSignin.hidden = false;
      moderatorTools.hidden = true;
      setText(moderatorMessage, "Sign in to review posts that are waiting.");
      return;
    }
    moderatorSignin.hidden = true;
    moderatorTools.hidden = false;
    setText(moderatorMessage, `Signed in as ${session.user.email || "moderator"}.`);
    await loadWaitingEvents();
  }

  async function signInModerator(event) {
    event.preventDefault();
    if (!client) {
      setText(moderatorMessage, "The site is missing its Supabase settings.");
      return;
    }
    const response = await client.auth.signInWithPassword({
      email: moderatorEmail.value.trim(),
      password: moderatorPassword.value,
    });
    if (response.error) {
      console.error("Could not sign in moderator", response.error);
      setText(moderatorMessage, "Sign-in failed. Check the email and password.");
      return;
    }
    moderatorPassword.value = "";
  }

  async function submitAnnouncement(event) {
    event.preventDefault();
    if (!supabaseUrl || !publishableKey) {
      setResult("error", "The site is missing its Supabase settings.", []);
      return;
    }

    const selectedFlyer = flyer.files && flyer.files[0];
    if (selectedFlyer && (selectedFlyer.size > maxFlyerBytes || !["image/jpeg", "image/png"].includes(selectedFlyer.type))) {
      setResult("error", "The flyer must be a JPG or PNG no larger than 5 MB.", []);
      return;
    }

    submitButton.disabled = true;
    setResult("waiting", "The event agent is reading your announcement…", []);
    try {
      const formData = new FormData(form);
      const response = await fetch(`${supabaseUrl}/functions/v1/submit-event`, {
        method: "POST",
        headers: { apikey: publishableKey },
        body: formData,
      });
      let body;
      try {
        body = await response.json();
      } catch (parseError) {
        throw new Error(`The agent returned an unreadable response (${response.status}).`);
      }
      if (!response.ok || body.ok === false) {
        setResult("error", body.message || "The event could not be posted.", body.reasons || []);
        return;
      }
      setResult(body.status || "error", body.message, body.reasons || []);
      if (body.status === "published") {
        form.reset();
        updateCharCount();
        await loadEvents();
      }
    } catch (error) {
      console.error("Could not submit announcement", error);
      setResult("error", "The event agent could not be reached. Please try again.", []);
    } finally {
      submitButton.disabled = false;
    }
  }

  function updateCharCount() {
    setText(charCount, `${Array.from(announcement.value).length} / 2000`);
  }

  function setFilter(nextFoodOnly) {
    foodOnly = nextFoodOnly;
    allFilter.setAttribute("aria-pressed", String(!foodOnly));
    foodFilter.setAttribute("aria-pressed", String(foodOnly));
    renderEvents();
  }

  function init() {
    if (window.supabase && typeof window.supabase.createClient === "function" && supabaseUrl && publishableKey) {
      client = window.supabase.createClient(supabaseUrl, publishableKey);
    }
    form.addEventListener("submit", submitAnnouncement);
    moderatorSignin.addEventListener("submit", signInModerator);
    moderatorSignout.addEventListener("click", () => client && client.auth.signOut());
    announcement.addEventListener("input", updateCharCount);
    refreshButton.addEventListener("click", loadEvents);
    allFilter.addEventListener("click", () => setFilter(false));
    foodFilter.addEventListener("click", () => setFilter(true));
    if (client) {
      client.auth.onAuthStateChange((_event, session) => {
        window.setTimeout(() => updateModerator(session), 0);
      });
      client.auth.getSession().then((response) => updateModerator(response.data && response.data.session));
    } else {
      setText(moderatorMessage, "Add the Supabase settings in config.js to use moderator sign-in.");
      moderatorSignin.querySelectorAll("input, button").forEach((element) => { element.disabled = true; });
    }
    updateCharCount();
    loadEvents();
  }

  init();
})();
