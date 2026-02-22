'use client';

// app/forms/page.jsx
import React, { useState, useEffect } from "react";
import { getForms } from "../lib/forms";

export default function FormsPage() {
  const [forms, setForms] = useState([]);

  useEffect(() => {
    async function fetchForms() {
      const data = await getForms();
      setForms(data || []);
    }
    fetchForms();
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
