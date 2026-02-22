'use client';
import { forms } from '../../lib/data';

export default function FormsPage() {
  return (
    <div>
      <h1>Available Court Forms</h1>
      <ul>
        {forms.map(form => (
          <li key={form.id}>
            {form.form_name} - {form.jurisdiction} 
            <a href={form.form_url} target="_blank" rel="noopener noreferrer">Download</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
