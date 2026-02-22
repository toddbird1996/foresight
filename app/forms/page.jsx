"use client";
import React, { useState, useEffect } from "react";
import { placeholderForms } from "../../lib/placeholders"; // make sure the path is correct

export default function FormsPage() {
  const [forms, setForms] = useState([]);

  useEffect(() => {
    // load placeholder data
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
