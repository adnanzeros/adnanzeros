"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import countries from "../../lib/countries";

const aliases = {
  GB: "uk england britain",
  US: "usa america",
  AE: "uae emirates",
  KR: "korea",
  KP: "korea",
  CZ: "czech",
  CD: "congo",
  CG: "congo",
};

function searchScore(country, query) {
  const [name, dial, iso] = country;
  if (!query) return 0;
  if (/^\d+$/.test(query)) return dial.startsWith(query) ? 0 : 9;
  const keywords = `${name} ${iso} +${dial} ${aliases[iso] || ""}`.toLowerCase();
  if (iso.toLowerCase() === query || keywords.split(" ").includes(query)) return 0;
  if (name.toLowerCase().startsWith(query)) return 1;
  return keywords.includes(query) ? 2 : 9;
}

export default function ContactForm() {
  const [selected, setSelected] = useState(countries[0]);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [status, setStatus] = useState({ message: "", kind: "" });
  const [sending, setSending] = useState(false);
  const pickerRef = useRef(null);
  const searchRef = useRef(null);
  const phoneRef = useRef(null);

  const visibleCountries = useMemo(() => {
    const normalized = query.trim().toLowerCase().replace(/^\+/, "");
    return countries
      .map((country, index) => ({
        country,
        index,
        score: searchScore(country, normalized),
      }))
      .filter(item => item.score < 9)
      .sort((a, b) => a.score - b.score || a.index - b.index)
      .map(item => item.country);
  }, [query]);

  useEffect(() => {
    if (!open) return undefined;
    searchRef.current?.focus({ preventScroll: true });
    const selectedIndex = visibleCountries.findIndex(
      country => country[2] === selected[2],
    );
    const selectedRow = pickerRef.current?.querySelector(
      '[aria-selected="true"]',
    );
    if (selectedRow)
      pickerRef.current.scrollTop = Math.max(0, selectedRow.offsetTop - 60);
    setActiveIndex(selectedIndex);

    function closeOutside(event) {
      if (!pickerRef.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [open, selected, visibleCountries]);

  function chooseCountry(country) {
    setSelected(country);
    setOpen(false);
    setQuery("");
    phoneRef.current?.focus({ preventScroll: true });
  }

  function handleSearchKeyDown(event) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!visibleCountries.length) return;
      const direction = event.key === "ArrowDown" ? 1 : -1;
      const next =
        (activeIndex + direction + visibleCountries.length) %
        visibleCountries.length;
      setActiveIndex(next);
      requestAnimationFrame(() => {
        pickerRef.current
          ?.querySelector(`#country-${visibleCountries[next][2]}`)
          ?.scrollIntoView({ block: "nearest" });
      });
    } else if (event.key === "Enter") {
      event.preventDefault();
      const country = visibleCountries[activeIndex < 0 ? 0 : activeIndex];
      if (country) chooseCountry(country);
    } else if (event.key === "Escape") {
      setOpen(false);
      setQuery("");
    }
  }

  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    const digits = String(values.phone || "")
      .replace(/\D/g, "")
      .replace(/^0+/, "");
    if (!String(values.name).trim())
      return setStatus({ message: "Please enter your name.", kind: "err" });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
      return setStatus({ message: "Please enter a valid email.", kind: "err" });
    if (digits.length < 6 || selected[1].length + digits.length > 15)
      return setStatus({
        message: "Please enter a valid WhatsApp number.",
        kind: "err",
      });
    if (String(values.message).trim().length < 5)
      return setStatus({
        message: "Please write a short message.",
        kind: "err",
      });

    setSending(true);
    setStatus({ message: "Sending…", kind: "" });
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          dialCode: selected[1],
        }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Could not send. Try again later.");
      setStatus({ message: "Message sent. I will reply soon.", kind: "ok" });
      form.reset();
    } catch (error) {
      setStatus({
        message:
          error instanceof Error
            ? error.message
            : "Could not send. Try again later.",
        kind: "err",
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <section id="contact" className="wrap">
      <h2>Send me a message</h2>
      <form className="form" method="post" action="#contact" noValidate onSubmit={submit}>
        <input
          name="website"
          className="hp"
          tabIndex="-1"
          autoComplete="off"
          aria-hidden="true"
        />
        <label>
          Name
          <input name="name" required maxLength="80" autoComplete="name" />
        </label>
        <label>
          Your email
          <input
            name="email"
            type="email"
            required
            maxLength="120"
            autoComplete="email"
          />
        </label>
        <div className="field">
          <label htmlFor="phone">WhatsApp number</label>
          <div className="phone">
            <div className="cc" id="cc" ref={pickerRef}>
              <button
                type="button"
                className="cc-btn"
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls="ccPop"
                aria-label={`Country code: ${selected[0]} +${selected[1]}`}
                onClick={() => {
                  setQuery("");
                  setOpen(value => !value);
                }}
              >
                <img
                  className="flag"
                  src={`https://flagcdn.com/w40/${selected[2].toLowerCase()}.png`}
                  srcSet={`https://flagcdn.com/w40/${selected[2].toLowerCase()}.png 1x, https://flagcdn.com/w80/${selected[2].toLowerCase()}.png 2x`}
                  width="24"
                  height="18"
                  alt=""
                  loading="lazy"
                  decoding="async"
                  onError={event => {
                    event.currentTarget.style.visibility = "hidden";
                  }}
                />
                <span>{selected[2]}</span>
                <span className="cc-dial">+{selected[1]}</span>
                <i className="caret" aria-hidden="true" />
              </button>
              <div className="cc-pop" id="ccPop" hidden={!open}>
                <input
                  ref={searchRef}
                  type="search"
                  id="ccSearch"
                  placeholder="Search country or code"
                  autoComplete="off"
                  aria-label="Search country"
                  role="combobox"
                  aria-expanded="true"
                  aria-controls="ccList"
                  aria-activedescendant={
                    activeIndex >= 0 && visibleCountries[activeIndex]
                      ? `country-${visibleCountries[activeIndex][2]}`
                      : undefined
                  }
                  value={query}
                  onChange={event => {
                    setQuery(event.target.value);
                    setActiveIndex(-1);
                  }}
                  onKeyDown={handleSearchKeyDown}
                />
                <ul
                  className="cc-list"
                  id="ccList"
                  role="listbox"
                  aria-label="Countries"
                >
                  {visibleCountries.length ? (
                    visibleCountries.map((country, index) => (
                      <li
                        id={`country-${country[2]}`}
                        key={country[2]}
                        role="option"
                        aria-selected={country[2] === selected[2]}
                        className={index === activeIndex ? "act" : ""}
                        onClick={() => chooseCountry(country)}
                      >
                        <img
                          className="flag"
                          src={`https://flagcdn.com/w40/${country[2].toLowerCase()}.png`}
                          width="24"
                          height="18"
                          alt=""
                          loading="lazy"
                          decoding="async"
                          onError={event => {
                            event.currentTarget.style.visibility = "hidden";
                          }}
                        />
                        <span className="n">{country[0]}</span>
                        <span className="d">+{country[1]}</span>
                      </li>
                    ))
                  ) : (
                    <li className="cc-empty" role="presentation">
                      No country found
                    </li>
                  )}
                </ul>
              </div>
              <input type="hidden" name="dialCode" value={selected[1]} />
            </div>
            <input
              ref={phoneRef}
              name="phone"
              id="phone"
              type="tel"
              inputMode="tel"
              required
              maxLength="18"
              autoComplete="tel-national"
              placeholder="1712 345678"
              aria-label="WhatsApp number"
            />
          </div>
        </div>
        <label>
          Message
          <textarea name="message" rows="5" required maxLength="3000" />
        </label>
        <button className="btn solid" type="submit" disabled={sending}>
          {sending ? "Sending…" : "Send message →"}
        </button>
        <p id="status" className={status.kind} role="status" aria-live="polite">
          {status.message}
        </p>
      </form>
    </section>
  );
}
