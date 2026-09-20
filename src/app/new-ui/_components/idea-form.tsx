"use client";

import { useState, type FormEvent } from "react";

export function IdeaForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const subject = encodeURIComponent(`Project idea from ${name || "your site"}`);
    const body = encodeURIComponent(
      `${description}\n\n— ${name}${email ? ` (${email})` : ""}`
    );

    window.location.href = `mailto:aaryangupta2005@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <form className="new-ui-idea-form" onSubmit={handleSubmit}>
      <div className="new-ui-idea-row">
        <label>
          <span className="sr-only">Name</span>
          <input
            type="text"
            placeholder="Write Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </label>
        <label>
          <span className="sr-only">Email address</span>
          <input
            type="email"
            placeholder="Write Email Address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
      </div>

      <label className="new-ui-idea-full">
        <span className="sr-only">Project description</span>
        <input
          type="text"
          placeholder="Write Project Description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          required
        />
      </label>

      <button className="new-ui-idea-submit" type="submit">
        Submit Now
      </button>
    </form>
  );
}
