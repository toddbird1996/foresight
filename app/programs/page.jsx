"use client";

import React, { useState, useEffect } from "react";
import { placeholderPrograms } from "../../lib/placeholders";

export default function ProgramsPage() {
  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    setPrograms(placeholderPrograms);
  }, []);

  return (
    <div>
      <h1>Programs</h1>
      <ul>
        {programs.map((program) => (
          <li key={program.id}>
            <strong>{program.program_name}</strong>: {program.description}{" "}
            <a href={program.link} target="_blank" rel="noopener noreferrer">
              Learn More
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
