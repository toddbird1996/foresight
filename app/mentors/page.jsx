"use client";

import React, { useState, useEffect } from "react";
import { placeholderMentors } from "../../lib/placeholders";

export default function MentorsPage() {
  const [mentors, setMentors] = useState([]);

  useEffect(() => {
    setMentors(placeholderMentors);
  }, []);

  return (
    <div>
      <h1>Mentors</h1>
      <ul>
        {mentors.map((mentor) => (
          <li key={mentor.id}>
            {mentor.name} - {mentor.specialty}{" "}
            <a href={mentor.profile_url} target="_blank" rel="noopener noreferrer">
              Profile
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
