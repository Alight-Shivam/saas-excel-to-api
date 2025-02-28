import React, { useState, useEffect } from "react";
import axios from "axios";

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [data, setData] = useState(null);
  const [operation, setOperation] = useState("");
  const [parameters, setParameters] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiEndpoint, setApiEndpoint] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

  // Add window resize listener
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setIsMobile(window.innerWidth < 992);
      
      // Auto-close sidebar on mobile when resizing
      if (window.innerWidth < 992) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    // Initialize sidebar state based on screen size
    if (window.innerWidth >= 992) {
      setSidebarOpen(true);
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first!");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://localhost:5000/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setData(response.data);
    } catch (error) {
      console.error("Error uploading file:", error);
      setError("Failed to upload file. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOperationChange = (e) => {
    setOperation(e.target.value);
    setParameters({});
  };

  const handleParameterChange = (e) => {
    setParameters({
      ...parameters,
      [e.target.name]: e.target.value,
    });
  };

  const handleGenerateAPI = async () => {
    if (!operation) {
      setError("Please select an operation!");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post("http://localhost:5000/generate-api", {
        operation,
        parameters,
      });
      setApiEndpoint(response.data.endpoint);
      setShowModal(true);
    } catch (error) {
      console.error("Error generating API:", error);
      setError("Failed to generate API. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTestAPI = async () => {
    if (!apiEndpoint) {
      setError("No API endpoint to test.");
      return;
    }

    try {
      const response = await axios.get(`http://localhost:5000${apiEndpoint}`);
      setApiResponse(response.data);
    } catch (error) {
      console.error("Error testing API:", error);
      setError("Failed to test API. Please check the endpoint and try again.");
    }
  };

  // Toggle sidebar function
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    // Close sidebar on mobile after tab selection
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Helper function to safely get the first sheet data
  const getFirstSheetData = () => {
    if (!data) return null;
    
    if (typeof data === 'object' && !Array.isArray(data)) {
      const sheetNames = Object.keys(data);
      if (sheetNames.length > 0) {
        return data[sheetNames[0]];
      }
    }
    
    if (Array.isArray(data)) {
      return data;
    }
    
    return null;
  };

  const sheetData = getFirstSheetData();
  
  const getFieldNames = () => {
    if (!sheetData || !sheetData[0]) return [];
    return Object.keys(sheetData[0]);
  };

  // FAQ data
  const faqData = [
    {
      question: "What file formats are supported?",
      answer: "Currently, we support Excel files (.xlsx and .xls formats). Support for CSV and other formats is coming soon."
    },
    {
      question: "How do I create an API endpoint?",
      answer: "Upload your Excel file, select the operation type (Create, Read, Update, Delete), provide the necessary parameters, and click 'Generate API'."
    },
    {
      question: "Can I customize the API endpoints?",
      answer: "Yes, after generating the base endpoint, you can test and modify it based on your specific requirements."
    },
    {
      question: "Is there a limit to file size?",
      answer: "The current limit is 10MB per file. For larger files, please contact our support team."
    },
    {
      question: "How secure is my data?",
      answer: "Your files are processed locally on your server and are not stored permanently unless configured otherwise. All API calls use HTTPS for secure data transfer."
    }
  ];

  // Render the active content based on the selected tab
  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <>
            <div className="mb-3">
              <input
                type="file"
                className="form-control"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
              />
            </div>
            <button className="btn btn-dark" onClick={handleUpload} disabled={loading}>
              {loading ? "Uploading..." : "Upload"}
            </button>

            {error && <div className="alert alert-danger mt-3">{error}</div>}

            {/* Display Parsed Data in a Table */}
            {sheetData && sheetData.length > 0 && (
              <div className="mt-5">
                <h3>Parsed Data</h3>
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        {getFieldNames().map((key) => (
                          <th key={key}>{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sheetData.map((row, index) => (
                        <tr key={index}>
                          {getFieldNames().map((key, i) => (
                            <td key={i}>{row[key]}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* API Generation Form */}
            <div className="mt-5">
              <h3>Generate API</h3>
              <select
                className="form-select mb-3"
                value={operation}
                onChange={handleOperationChange}
              >
                <option value="">Select Operation</option>
                <option value="create">Create</option>
                <option value="read">Read</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
              </select>

              {/* Parameter Inputs for Create/Update */}
              {(operation === "create" || operation === "update") && sheetData && sheetData.length > 0 && (
                <div className="mb-3">
                  <h5>Parameters</h5>
                  {getFieldNames().map((key) => (
                    <div key={key} className="mb-2">
                      <label>{key}</label>
                      <input
                        type="text"
                        name={key}
                        className="form-control"
                        onChange={handleParameterChange}
                      />
                    </div>
                  ))}
                </div>
              )}

              <button className="btn btn-dark" onClick={handleGenerateAPI} disabled={loading}>
                {loading ? "Generating..." : "Generate API"}
              </button>
            </div>

            {/* API Testing Section */}
            <div className="mt-5">
              <h3>Test API Endpoint</h3>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter API endpoint"
                  value={apiEndpoint}
                  readOnly
                />
              </div>
              <button className="btn btn-dark" onClick={handleTestAPI} disabled={!apiEndpoint}>
                Test API
              </button>

              {/* Display API Response */}
              {apiResponse && (
                <div className="mt-3">
                  <h5>API Response</h5>
                  <pre className="bg-light p-3 rounded">{JSON.stringify(apiResponse, null, 2)}</pre>
                </div>
              )}
            </div>
          </>
        );
      case "faq":
        return (
          <div className="mt-3">
            <h2>Frequently Asked Questions</h2>
            <div className="accordion" id="faqAccordion">
              {faqData.map((faq, index) => (
                <div className="accordion-item" key={index}>
                  <h2 className="accordion-header" id={`heading${index}`}>
                    <button 
                      className="accordion-button collapsed" 
                      type="button" 
                      data-bs-toggle="collapse" 
                      data-bs-target={`#collapse${index}`} 
                      aria-expanded="false" 
                      aria-controls={`collapse${index}`}
                    >
                      {faq.question}
                    </button>
                  </h2>
                  <div 
                    id={`collapse${index}`} 
                    className="accordion-collapse collapse" 
                    aria-labelledby={`heading${index}`} 
                    data-bs-parent="#faqAccordion"
                  >
                    <div className="accordion-body">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case "docs":
        return (
          <div className="mt-3">
            <h2>Documentation</h2>
            <div className="card mb-3">
              <div className="card-header">
                <h5>Getting Started</h5>
              </div>
              <div className="card-body">
                <p>Follow these simple steps to create your API:</p>
                <ol>
                  <li>Upload your Excel file using the file selector</li>
                  <li>Review the parsed data to ensure it's correct</li>
                  <li>Select an operation type (Create, Read, Update, Delete)</li>
                  <li>Fill in required parameters if applicable</li>
                  <li>Generate your API endpoint</li>
                  <li>Test the API to verify it works as expected</li>
                </ol>
              </div>
            </div>
            <div className="card">
              <div className="card-header">
                <h5>API Reference</h5>
              </div>
              <div className="card-body">
                <p>All API endpoints follow this pattern:</p>
                <code>/api/[operation]/[parameters]</code>
                <p className="mt-3">Available operations:</p>
                <ul>
                  <li><strong>Create:</strong> Add new entries to your data</li>
                  <li><strong>Read:</strong> Retrieve data with optional filters</li>
                  <li><strong>Update:</strong> Modify existing entries</li>
                  <li><strong>Delete:</strong> Remove entries from your data</li>
                </ul>
              </div>
            </div>
          </div>
        );
      case "about":
        return (
          <div className="mt-3">
            <h2>About Excel API Builder</h2>
            <div className="card">
              <div className="card-body">
                <p>Excel API Builder is a powerful tool designed to transform your Excel data into fully functional APIs with just a few clicks.</p>
                <p>Our mission is to simplify data access and manipulation for businesses of all sizes, eliminating the need for complex database setups or expensive development resources.</p>
                <h5 className="mt-4">Key Features</h5>
                <ul>
                  <li>Instant API creation from Excel files</li>
                  <li>Support for all CRUD operations</li>
                  <li>Secure data handling</li>
                  <li>Real-time testing capabilities</li>
                  <li>Easy integration with existing systems</li>
                </ul>
                <h5 className="mt-4">Version</h5>
                <p>Current Version: 1.0.0</p>
              </div>
            </div>
          </div>
        );
      default:
        return <div>Select a tab from the sidebar</div>;
    }
  };

  return (
    <div className="wrapper">
      {/* Sidebar */}
      <div className={`sidebar bg-dark text-white ${sidebarOpen ? 'show' : ''}`} id="sidebar">
        <div className="sidebar-header py-3 px-3 d-flex justify-content-between align-items-center">
          <h5 className="m-0 text-white">Menu</h5>
          {isMobile && (
            <button className="btn btn-link text-white p-0" onClick={toggleSidebar}>
              <i className="bi bi-x-lg"></i>
            </button>
          )}
        </div>
        <ul className="nav flex-column">
          <li className="nav-item">
            <a 
              className={`nav-link text-white ${activeTab === 'home' ? 'active bg-secondary' : ''}`} 
              href="#" 
              onClick={() => handleTabClick('home')}
            >
              <i className="bi bi-house-door me-2"></i>Home
            </a>
          </li>
          <li className="nav-item">
            <a 
              className={`nav-link text-white ${activeTab === 'docs' ? 'active bg-secondary' : ''}`} 
              href="#" 
              onClick={() => handleTabClick('docs')}
            >
              <i className="bi bi-file-text me-2"></i>Documentation
            </a>
          </li>
          <li className="nav-item">
            <a 
              className={`nav-link text-white ${activeTab === 'faq' ? 'active bg-secondary' : ''}`} 
              href="#" 
              onClick={() => handleTabClick('faq')}
            >
              <i className="bi bi-question-circle me-2"></i>FAQ
            </a>
          </li>
          <li className="nav-item">
            <a 
              className={`nav-link text-white ${activeTab === 'about' ? 'active bg-secondary' : ''}`} 
              href="#" 
              onClick={() => handleTabClick('about')}
            >
              <i className="bi bi-info-circle me-2"></i>About
            </a>
          </li>
        </ul>
        <div className="mt-4 px-3">
          <h6>Quick Links</h6>
          <div className="d-grid gap-2 mt-2">
            <button className="btn btn-sm btn-outline-light">
              <i className="bi bi-github me-2"></i>GitHub Repo
            </button>
            <button className="btn btn-sm btn-outline-light">
              <i className="bi bi-question-circle me-2"></i>Support
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`content ${sidebarOpen ? 'shifted' : ''}`} id="content">
        {/* Navbar */}
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow">
          <div className="container-fluid">
            {/* Hamburger Button */}
            <button 
              className="navbar-toggler border-0" 
              onClick={toggleSidebar}
              type="button"
            >
              <i className="bi bi-list text-white"></i>
            </button>
            
            <a className="navbar-brand" href="#">
              <i className="bi bi-database me-2"></i>
              Excel API Builder
            </a>
            
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
              <span className="navbar-toggler-icon"></span>
            </button>
            
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav me-auto">
                <li className="nav-item">
                  <a className={`nav-link ${activeTab === 'home' ? 'active' : ''}`} href="#" onClick={() => setActiveTab('home')}>Home</a>
                </li>
                <li className="nav-item">
                  <a className={`nav-link ${activeTab === 'docs' ? 'active' : ''}`} href="#" onClick={() => setActiveTab('docs')}>Documentation</a>
                </li>
                <li className="nav-item">
                  <a className={`nav-link ${activeTab === 'faq' ? 'active' : ''}`} href="#" onClick={() => setActiveTab('faq')}>FAQ</a>
                </li>
                <li className="nav-item">
                  <a className={`nav-link ${activeTab === 'about' ? 'active' : ''}`} href="#" onClick={() => setActiveTab('about')}>About</a>
                </li>
              </ul>
              <span className="navbar-text d-none d-lg-block">
                <i className="bi bi-gear-fill me-1"></i> API Configuration Tool
              </span>
            </div>
          </div>
        </nav>

        {/* Content Area */}
        <div className="container py-4">
          {renderContent()}
        </div>

        {/* Bootstrap Modal for API Endpoint */}
        <div className={`modal fade ${showModal ? "show" : ""}`} style={{ display: showModal ? "block" : "none" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">API Endpoint</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Your API endpoint is:</p>
                <code>{apiEndpoint}</code>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && isMobile && (
        <div 
          className="sidebar-overlay"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Add Bootstrap Icons CSS */}
      <link 
        rel="stylesheet" 
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css" 
      />

      {/* Improved CSS for better responsiveness */}
      <style>
        {`
          .wrapper {
            display: flex;
            width: 100%;
            min-height: 100vh;
            position: relative;
            overflow-x: hidden;
          }
          
          .sidebar {
            width: 280px;
            min-height: 100vh;
            position: fixed;
            top: 0;
            left: 0;
            z-index: 1040;
            transition: all 0.3s;
            padding-top: 0;
            box-shadow: 3px 0 10px rgba(0,0,0,0.1);
          }
          
          .content {
            width: 100%;
            min-height: 100vh;
            transition: all 0.3s;
          }
          
          .sidebar-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0,0,0,0.6);
            z-index: 1030;
            display: none;
          }
          
          @media (max-width: 991.98px) {
            .sidebar {
              margin-left: -280px;
            }
            
            .sidebar.show {
              margin-left: 0;
            }
            
            .sidebar-overlay {
              display: block;
            }
          }
          
          @media (min-width: 992px) {
            .content.shifted {
              margin-left: 280px;
              width: calc(100% - 280px);
            }
          }
          
          .nav-link.active {
            font-weight: bold;
          }
          
          .sidebar .nav-link:hover:not(.active) {
            background-color: rgba(255,255,255,0.1);
          }
          
          .table-responsive {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
          
          /* Fix for modal backdrop and z-index */
          .modal {
            background-color: rgba(0,0,0,0.5);
            z-index: 1050;
          }
          
          /* Make sure code blocks don't overflow */
          pre {
            white-space: pre-wrap;
            word-break: break-word;
          }
          
          /* Better accordion styling */
          .accordion-button:not(.collapsed) {
            background-color: rgba(0,0,0,0.05);
          }
        `}
      </style>
    </div>
  );
};

export default FileUpload;