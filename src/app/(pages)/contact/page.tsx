import React from 'react';
import { contactMetadata } from './metadata';

export const metadata = contactMetadata;

const ContactPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">Kontakt meg</h1>
      <p className="text-lg">
        Du kan kontakte meg via e-post på <a href="mailto:frank.william.daniels@gmail.com" className="text-blue-500 hover:underline">frank.william.daniels@gmail.com</a> om du har noen forslag til forbedringer, vil melde om feil eller for øvrig henvendelser.
      </p>
    </div>
  );
};

export default ContactPage;
