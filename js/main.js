/* ==========================================================================
   HireKeeper — form handling + shareable job-listing links

   BACKEND (Phase 1, no server):
   Both forms POST straight to a Google Form's response endpoint. Google
   Forms stores every submission in a linked Google Sheet automatically,
   and "email me for new responses" can be turned on inside Google Forms.
   That's email + spreadsheet, zero backend, zero cost. See README.md.

   JOB LISTING LINKS (no database needed):
   When someone posts a job on hire.html, the job's details (service type,
   location, notes — no personal contact info) are encoded straight into
   a URL as UTF-8-safe base64. job.html decodes whatever is in the URL
   and renders it — so the link itself IS the listing, shareable with
   anyone, viewable by anyone, with no server involved. The client's
   name/email/phone stay in the Google Sheet only; applicants apply
   through work.html, which is how HireKeeper stays the go-between.
   ========================================================================== */

const CONFIG = {
  work: {
    actionUrl: "https://docs.google.com/forms/d/e/1FAIpQLScDERcrJUHfqbFc2UOaSbs_oKQhoEsBfbVRxBWGkbt-7dmB2A/formResponse",
    entries: {
      workType: "entry.1352594771",
      city: "entry.1740039358",
      region: "entry.123106541",
      country: "entry.1539602267",
      fullName: "entry.44314298",
      email: "entry.1603081208",
      phone: "entry.673630630",
    },
  },
  hire: {
    actionUrl: "https://docs.google.com/forms/d/e/1FAIpQLSdcHbg_VnorLjugDyzbH3hBcvHJV1D283SfTtPGjccXPSCtLQ/formResponse",
    entries: {
      serviceType: "entry.2109575895",
      city: "entry.268460575",
      region: "entry.1151770893",
      country: "entry.1684783214",
      fullName: "entry.678578507",
      email: "entry.1470844268",
      phone: "entry.1805490763",
      details: "entry.50024360",
    },
  },
};

/* -------------------- shared helpers -------------------- */

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value) {
  const digits = value.replace(/[^\d]/g, "");
  return digits.length >= 7;
}

function showError(form, message) {
  const errorEl = form.querySelector(".form-error");
  errorEl.textContent = message;
  errorEl.classList.add("visible");
}

function clearError(form) {
  const errorEl = form.querySelector(".form-error");
  errorEl.classList.remove("visible");
}

function submitToGoogleForm(actionUrl, entryMap, values) {
  const body = new FormData();
  Object.keys(entryMap).forEach((key) => {
    if (values[key]) body.append(entryMap[key], values[key]);
  });
  // mode: "no-cors" is required for Google Forms and means we can't read
  // the response — we assume success if the request doesn't throw, then
  // redirect ourselves.
  return fetch(actionUrl, { method: "POST", mode: "no-cors", body });
}

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

/* -------------------- job data encode / decode -------------------- */

function encodeJobData(obj) {
  const json = JSON.stringify(obj);
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  bytes.forEach((b) => { binary += String.fromCharCode(b); });
  return encodeURIComponent(btoa(binary));
}

function decodeJobData(str) {
  const binary = atob(decodeURIComponent(str));
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  const json = new TextDecoder().decode(bytes);
  return JSON.parse(json);
}

/* -------------------- work.html: job seeker form -------------------- */

function initWorkForm() {
  const form = document.getElementById("work-form");
  if (!form) return;

  // If arriving from a shared job link, show a banner naming the listing.
  // This is display-only — nothing about the link is sent to the form.
  const jobParam = getQueryParam("job");
  if (jobParam) {
    try {
      const job = decodeJobData(jobParam);
      const banner = document.getElementById("job-banner");
      const bannerText = document.getElementById("job-banner-text");
      if (banner && bannerText) {
        bannerText.innerHTML = `Applying for: <strong>${job.serviceType}</strong> in ${job.city}, ${job.region}`;
        banner.classList.add("visible");
      }
    } catch (err) {
      // Bad or tampered link data — fail quietly, form still works generally.
    }
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearError(form);

    const values = Object.fromEntries(new FormData(form).entries());

    if (!values.fullName || !values.city || !values.region) {
      showError(form, "Please fill in your name and location.");
      return;
    }
    if (!isValidEmail(values.email || "")) {
      showError(form, "Please enter a valid email address.");
      return;
    }
    if (!isValidPhone(values.phone || "")) {
      showError(form, "Please enter a valid phone or WhatsApp number.");
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";

    try {
      await submitToGoogleForm(CONFIG.work.actionUrl, CONFIG.work.entries, values);
      window.location.href = "thanks.html";
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.textContent = form.dataset.submitLabel || "Submit";
      showError(form, "Something went wrong. Please try again.");
    }
  });
}

/* -------------------- hire.html: create a job listing -------------------- */

function initHireForm() {
  const form = document.getElementById("hire-form");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearError(form);

    const values = Object.fromEntries(new FormData(form).entries());

    if (!values.fullName || !values.city || !values.region) {
      showError(form, "Please fill in your name and location.");
      return;
    }
    if (!isValidEmail(values.email || "")) {
      showError(form, "Please enter a valid email address.");
      return;
    }
    if (!isValidPhone(values.phone || "")) {
      showError(form, "Please enter a valid phone or WhatsApp number.");
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "Creating listing...";

    try {
      await submitToGoogleForm(CONFIG.hire.actionUrl, CONFIG.hire.entries, values);

      // Only non-personal fields go into the public link.
      const publicJob = {
        serviceType: values.serviceType,
        city: values.city,
        region: values.region,
        country: values.country,
        details: values.details || "",
      };
      const encoded = encodeJobData(publicJob);
      window.location.href = `listing-created.html?d=${encoded}`;
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.textContent = form.dataset.submitLabel || "Submit";
      showError(form, "Something went wrong. Please try again.");
    }
  });
}

/* -------------------- listing-created.html -------------------- */

function initListingCreated() {
  const container = document.getElementById("listing-created");
  if (!container) return;

  const encoded = getQueryParam("d");
  if (!encoded) {
    window.location.href = "hire.html";
    return;
  }

  let job;
  try {
    job = decodeJobData(encoded);
  } catch (err) {
    window.location.href = "hire.html";
    return;
  }

  document.getElementById("listing-summary").textContent =
    `${job.serviceType} in ${job.city}, ${job.region}`;

  const shareUrl = `${window.location.origin}${window.location.pathname.replace(
    "listing-created.html",
    "job.html"
  )}?d=${encoded}`;

  const linkInput = document.getElementById("share-link-input");
  linkInput.value = shareUrl;

  const copyBtn = document.getElementById("copy-link-btn");
  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch (err) {
      linkInput.select();
      document.execCommand("copy");
    }
    copyBtn.textContent = "Copied!";
    setTimeout(() => { copyBtn.textContent = "Copy link"; }, 2000);
  });
}

/* -------------------- job.html -------------------- */

function initJobListing() {
  const container = document.getElementById("job-listing");
  if (!container) return;

  const encoded = getQueryParam("d");
  let job = null;
  if (encoded) {
    try { job = decodeJobData(encoded); } catch (err) { job = null; }
  }

  if (!job) {
    container.innerHTML = `
      <div class="listing-missing">
        <h1>This listing link looks incomplete.</h1>
        <p>Ask whoever shared it to resend the full link, or browse open work another way.</p>
        <a href="index.html" class="btn btn-ghost">Back to home</a>
      </div>`;
    return;
  }

  document.getElementById("job-service").textContent = job.serviceType;
  document.getElementById("job-location").textContent = `${job.city}, ${job.region}, ${job.country}`;

  const detailsEl = document.getElementById("job-details");
  if (job.details) {
    detailsEl.textContent = job.details;
    detailsEl.style.display = "block";
  } else {
    detailsEl.style.display = "none";
  }

  document.getElementById("apply-link").href = `work.html?job=${encoded}`;
}

document.addEventListener("DOMContentLoaded", () => {
  initWorkForm();
  initHireForm();
  initListingCreated();
  initJobListing();
});
