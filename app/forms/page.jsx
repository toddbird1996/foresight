// app/forms/page.jsx
"use client";
import React, { useState, useEffect } from "react";

const placeholderForms = [
  { id: 1, form_name: "Form A", jurisdiction: "Federal", form_url: "#" },
  { id: 2, form_name: "Form B", jurisdiction: "State", form_url: "#" },
  { id: 3, form_name: "Form C", jurisdiction: "Local", form_url: "#" },
];

export default function FormsPage() {
  const [forms, setForms] = useState([]);

  useEffect(() => {
    setForms(placeholderForms);
  }, []);

  return (
    <div>
      <h1>Available Court Forms</h1>
      <ul>
        {forms.map((form) => (
          <li key={form.id}>
            {form.form_name} - {form.jurisdiction}{" "}
            <a href={form.form_url} target="_blank" rel="noopener noreferrer">
              Download
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
