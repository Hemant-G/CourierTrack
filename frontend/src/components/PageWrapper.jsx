// frontend/src/components/PageWrapper.jsx
import React from 'react';

/**
 * A simple wrapper component to provide consistent spacing and layout for page content.
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - The content to be wrapped.
 * @returns {JSX.Element} The wrapped content.
 */
const PageWrapper = ({ children }) => {
  return (
    <section className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
      {children}
    </section>
  );
};

export default PageWrapper;