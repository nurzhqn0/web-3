const els = {
  baseUrl: document.getElementById("baseUrl"),
  baseUrlLabel: document.getElementById("baseUrlLabel"),
  blogId: document.getElementById("blogId"),
  title: document.getElementById("title"),
  body: document.getElementById("body"),
  author: document.getElementById("author"),
  statusBox: document.getElementById("statusBox"),
  list: document.getElementById("list"),
  count: document.getElementById("count"),
  search: document.getElementById("search"),
  btnCreate: document.getElementById("btnCreate"),
  btnUpdate: document.getElementById("btnUpdate"),
  btnGetById: document.getElementById("btnGetById"),
  btnDeleteById: document.getElementById("btnDeleteById"),
  btnRefresh: document.getElementById("btnRefresh"),
  btnClear: document.getElementById("btnClear"),
};

const DEFAULT_BASE_URL = "http://localhost:3000";
els.baseUrl.value = localStorage.getItem("baseUrl") || DEFAULT_BASE_URL;

function getBaseUrl() {
  const url = (els.baseUrl.value || "").trim() || DEFAULT_BASE_URL;
  localStorage.setItem("baseUrl", url);
  els.baseUrlLabel.textContent = url;
  return url;
}

function setStatus(message, type = "info") {
  els.statusBox.textContent = message;
  els.statusBox.classList.remove("ok", "err");
  if (type === "ok") els.statusBox.classList.add("ok");
  if (type === "err") els.statusBox.classList.add("err");
}

function isValidObjectId(id) {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(d) {
  if (!d) return "-";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "-";
  return dt.toLocaleString();
}

async function api(path, options = {}) {
  const baseUrl = getBaseUrl();
  const url = baseUrl.replace(/\/$/, "") + path;

  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  let data = null;
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const msg =
      data && (data.error || data.message)
        ? data.error || data.message
        : res.statusText;
    const details = data && data.details ? `\nDetails: ${data.details}` : "";
    throw new Error(`HTTP ${res.status} — ${msg}${details}`);
  }
  return data;
}

let allBlogs = [];

function renderList() {
  const q = (els.search.value || "").trim().toLowerCase();

  const filtered = allBlogs.filter((b) => {
    const hay =
      `${b.title || ""} ${b.body || ""} ${b.author || ""}`.toLowerCase();
    return hay.includes(q);
  });

  els.count.textContent = String(filtered.length);
  els.list.innerHTML = filtered
    .map((b) => {
      const id = b._id || b.id || "";
      return `
            <div class="item">
              <h3>${escapeHtml(b.title || "(No title)")}</h3>
              <div class="meta">
                <span><strong>ID:</strong> <code class="inline">${escapeHtml(id)}</code></span>
                <span><strong>Author:</strong> ${escapeHtml(b.author || "Anonymous")}</span>
                <span><strong>Created:</strong> ${escapeHtml(formatDate(b.createdAt))}</span>
                <span><strong>Updated:</strong> ${escapeHtml(formatDate(b.updatedAt))}</span>
              </div>
              <div class="body">${escapeHtml(b.body || "")}</div>
              <div class="actions">
                <button class="btn secondary" data-action="fill" data-id="${escapeHtml(id)}">Fill form</button>
                <button class="btn" data-action="get" data-id="${escapeHtml(id)}">GET</button>
                <button class="btn danger" data-action="delete" data-id="${escapeHtml(id)}">DELETE</button>
              </div>
            </div>
          `;
    })
    .join("");

  // Attach events
  els.list.querySelectorAll("button[data-action]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const action = btn.getAttribute("data-action");
      const id = btn.getAttribute("data-id");

      if (action === "fill") {
        const blog = allBlogs.find((x) => (x._id || x.id) === id);
        if (!blog) return;
        els.blogId.value = id;
        els.title.value = blog.title || "";
        els.body.value = blog.body || "";
        els.author.value = blog.author || "";
        setStatus(
          "Form filled from selected blog. You can edit and press PUT.",
          "ok",
        );
        return;
      }

      if (action === "get") {
        await handleGetById(id);
        return;
      }

      if (action === "delete") {
        await handleDeleteById(id);
        return;
      }
    });
  });
}

async function refresh() {
  try {
    setStatus("Loading blogs...");
    const data = await api("/blogs", { method: "GET" });
    // Your backend returns { success, count, data: [...] }
    allBlogs = data && data.data ? data.data : [];
    setStatus(`Loaded ${allBlogs.length} blog(s).`, "ok");
    renderList();
  } catch (e) {
    setStatus(e.message, "err");
  }
}

async function handleCreate() {
  const title = els.title.value;
  const body = els.body.value;
  const author = els.author.value;

  try {
    setStatus("Creating blog...");
    const payload = {
      title,
      body,
    };
    if (author && author.trim() !== "") payload.author = author;

    const data = await api("/blogs", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    setStatus(`Created! New ID: ${data?.data?.id || "(unknown)"}`, "ok");
    await refresh();
  } catch (e) {
    setStatus(e.message, "err");
  }
}

async function handleGetById(idFromBtn) {
  const id = (idFromBtn || els.blogId.value || "").trim();
  if (!isValidObjectId(id)) {
    setStatus("Invalid blog ID format (must be 24 hex chars).", "err");
    return;
  }

  try {
    setStatus("Fetching blog by ID...");
    const data = await api(`/blogs/${id}`, { method: "GET" });
    const blog = data?.data;
    if (!blog) {
      setStatus("No blog returned.", "err");
      return;
    }
    // Fill form to show result
    els.blogId.value = id;
    els.title.value = blog.title || "";
    els.body.value = blog.body || "";
    els.author.value = blog.author || "";
    setStatus("Fetched blog and filled the form.", "ok");
  } catch (e) {
    setStatus(e.message, "err");
  }
}

async function handleUpdate() {
  const id = (els.blogId.value || "").trim();
  if (!isValidObjectId(id)) {
    setStatus("Invalid blog ID format (must be 24 hex chars).", "err");
    return;
  }

  const payload = {};
  if (els.title.value !== "" && els.title.value !== null)
    payload.title = els.title.value;
  if (els.body.value !== "" && els.body.value !== null)
    payload.body = els.body.value;
  if (els.author.value !== "" && els.author.value !== null)
    payload.author = els.author.value;

  try {
    setStatus("Updating blog...");
    const data = await api(`/blogs/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    setStatus(`Updated! modifiedCount: ${data?.modifiedCount ?? "?"}`, "ok");
    await refresh();
  } catch (e) {
    setStatus(e.message, "err");
  }
}

async function handleDeleteById(idFromBtn) {
  const id = (idFromBtn || els.blogId.value || "").trim();
  if (!isValidObjectId(id)) {
    setStatus("Invalid blog ID format (must be 24 hex chars).", "err");
    return;
  }

  const ok = confirm(`Delete blog ${id}?`);
  if (!ok) return;

  try {
    setStatus("Deleting blog...");
    const data = await api(`/blogs/${id}`, { method: "DELETE" });
    setStatus(`Deleted! deletedCount: ${data?.deletedCount ?? "?"}`, "ok");
    if (els.blogId.value.trim() === id) clearForm(true);
    await refresh();
  } catch (e) {
    setStatus(e.message, "err");
  }
}

function clearForm(keepId = false) {
  if (!keepId) els.blogId.value = "";
  els.title.value = "";
  els.body.value = "";
  els.author.value = "";
}

els.baseUrl.addEventListener("input", () => getBaseUrl());
els.search.addEventListener("input", renderList);

els.btnRefresh.addEventListener("click", refresh);
els.btnCreate.addEventListener("click", handleCreate);
els.btnGetById.addEventListener("click", () => handleGetById());
els.btnUpdate.addEventListener("click", handleUpdate);
els.btnDeleteById.addEventListener("click", () => handleDeleteById());
els.btnClear.addEventListener("click", () => {
  clearForm(false);
  setStatus("Form cleared.", "ok");
});

// Init
getBaseUrl();
refresh();
