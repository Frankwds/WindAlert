import React from 'react';

const ContactPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
      <p className="text-lg">
        You can reach us via email at <a href="mailto:contact@example.com" className="text-blue-500 hover:underline">contact@example.com</a>.
      </p>
    </div>
  );
};

export default ContactPage;
