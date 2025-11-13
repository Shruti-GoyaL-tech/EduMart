import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-4">
      <div className="max-w-7xl mx-auto px-4 text-center text-gray-400">
        <p>&copy; {new Date().getFullYear()} EduMart. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
