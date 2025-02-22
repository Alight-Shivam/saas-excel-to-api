import React from 'react'

const Landing = () => {
    return (
      <div className="text-center bg-light min-vh-100 d-flex flex-column justify-content-center">
        <h1 className="text-primary mb-4">Excel to API SaaS</h1>
        <p className="text-secondary mb-4">
          Upload your Excel file and generate CRUD APIs in seconds!
        </p>
        <button className="btn btn-primary">Get Started</button>
      </div>
    );
  };
  
  export default Landing;