"use client";

import { useRef, useState, type FormEvent } from "react";

type Field = "name" | "email" | "description";
type Errors = Partial<Record<Field, string>>;
type Status = "idle" | "sending" | "sent" | "error";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values: Record<Field, string>): Errors {
  const errors: Errors = {};
  if (!values.name.trim()) errors.name = "Please tell me your name.";
  if (!values.email.trim()) errors.email = "Please add your email address.";
  else if (!EMAIL_PATTERN.test(values.email.trim()))
    errors.email = "That email doesn't look right.";
  if (!values.description.trim())
    errors.description = "Please describe your project idea.";
  return errors;
}

/**
 * "Got an Idea?" form. Submitting (button or Enter) posts the details to
 * /api/contact, which emails them to Aaryan server-side — the visitor's mail
 * app is never opened. A sending / sent / error message shows under the
 * button.
 *
 * Validation is done here rather than by the browser, so missing fields get
 * a message in the site's own style under the field (instead of the
 * browser's grey "Please fill out this field." popup).
 */
export function IdeaForm() {
  const [values, setValues] = useState<Record<Field, string>>({
    name: "",
    email: "",
    description: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  // Honeypot for bots; hidden from people and screen readers.
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const inputs = useRef<Partial<Record<Field, HTMLInputElement | null>>>({});

  const update = (field: Field, value: string) => {
    const next = { ...values, [field]: value };
    setValues(next);
    // After a first submit attempt, messages clear as each field is fixed.
    if (submitted) setErrors(validate(next));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "sending") return;
    setSubmitted(true);

    const found = validate(values);
    setErrors(found);
    const firstInvalid = (["name", "email", "description"] as Field[]).find(
      (field) => found[field]
    );
    if (firstInvalid) {
      inputs.current[firstInvalid]?.focus();
      return;
    }

    setStatus("sending");
    setMessage("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, website }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!response.ok) throw new Error(data.error || "Something went wrong.");

      setStatus("sent");
      setMessage("Thanks! Your idea is on its way — I'll get back to you soon.");
      setValues({ name: "", email: "", description: "" });
      setSubmitted(false);
      setErrors({});
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error && error.message !== "Failed to fetch"
          ? error.message
          : "Couldn't send right now. Please check your connection and try again."
      );
    }
  };

  const field = (
    name: Field,
    label: string,
    placeholder: string,
    type: "text" | "email" = "text",
    className?: string
  ) => (
    <label className={`new-ui-idea-field${className ? ` ${className}` : ""}`}>
      <span className="sr-only">{label}</span>
      <input
        ref={(element) => {
          inputs.current[name] = element;
        }}
        type={type}
        placeholder={placeholder}
        value={values[name]}
        onChange={(event) => update(name, event.target.value)}
        aria-invalid={errors[name] ? true : undefined}
        aria-describedby={errors[name] ? `idea-${name}-error` : undefined}
      />
      <span
        className={`new-ui-idea-error${errors[name] ? " is-visible" : ""}`}
        id={`idea-${name}-error`}
        role={errors[name] ? "alert" : undefined}
      >
        {errors[name]}
      </span>
    </label>
  );

  return (
    <form className="new-ui-idea-form" onSubmit={handleSubmit} noValidate>
      <div className="new-ui-idea-row">
        {field("name", "Name", "Write Name")}
        {field("email", "Email address", "Write Email Address", "email")}
      </div>

      {field(
        "description",
        "Project description",
        "Write Project Description",
        "text",
        "new-ui-idea-full"
      )}

      <input
        className="new-ui-idea-honeypot"
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={website}
        onChange={(event) => setWebsite(event.target.value)}
      />

      <div className="new-ui-idea-actions">
        <button
          className="new-ui-idea-submit"
          type="submit"
          disabled={status === "sending"}
        >
          {status === "sending" ? "Sending…" : "Submit Now"}
        </button>
        <p
          className={`new-ui-idea-status is-${status}`}
          role="status"
          aria-live="polite"
        >
          {message}
        </p>
      </div>
    </form>
  );
}
