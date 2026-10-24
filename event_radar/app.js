(function () {
  "use strict";

  const config = window.EVENT_RADAR_CONFIG || {};
  const supabaseUrl = String(config.supabaseUrl || "").replace(/\/$/, "");
  const publishableKey = String(config.publishableKey || "");
  const fields = "id, created_at, status, title, club, event_date, start_time, end_time, place_name, place_detail, cost, free_food, summary";

  const form = document.querySelector("#post-form");
  const announcement = document.querySelector("#announcement");
  const charCount = document.querySelector("#char-count");
  const submitButton = document.querySelector("#submit-button");
  const result = document.querySelector("#post-result");
  const board = document.querySelector("#event-board");
  const refreshButton = document.querySelector("#refresh-button");
  const allFilter = document.querySelector("#all-filter");
  const foodFilter = document.querySelector("#food-filter");

  let client = null;
  let events = [];
  let foodOnly = false;

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

  function eventCard(event) {
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

  async function submitAnnouncement(event) {
    event.preventDefault();
    if (!supabaseUrl || !publishableKey) {
      setResult("error", "The site is missing its Supabase settings.", []);
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
    announcement.addEventListener("input", updateCharCount);
    refreshButton.addEventListener("click", loadEvents);
    allFilter.addEventListener("click", () => setFilter(false));
    foodFilter.addEventListener("click", () => setFilter(true));
    updateCharCount();
    loadEvents();
  }

  init();
})();
