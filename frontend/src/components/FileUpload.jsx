import React, { useState } from "react";
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
  const [apiResponse, setApiResponse] = useState(null); // To store API test response

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null); // Reset error on new file selection
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
    setParameters({}); // Reset parameters when operation changes
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
      setShowModal(true); // Show the modal
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
      setApiResponse(response.data); // Store API response
    } catch (error) {
      console.error("Error testing API:", error);
      setError("Failed to test API. Please check the endpoint and try again.");
    }
  };

  return (
    <div className="container mt-5">
      <div className="mb-3">
        <input
          type="file"
          className="form-control"
          accept=".xlsx, .xls"
          onChange={handleFileChange}
        />
      </div>
      <button className="btn btn-primary" onClick={handleUpload} disabled={loading}>
        {loading ? "Uploading..." : "Upload"}
      </button>

      {error && <div className="alert alert-danger mt-3">{error}</div>}

      {/* Display Parsed Data in a Table */}
      {data && (
        <div className="mt-5">
          <h3>Parsed Data</h3>
          <table className="table table-bordered">
            <thead>
              <tr>
                {Object.keys(data[0]).map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((value, i) => (
                    <td key={i}>{value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
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
        {(operation === "create" || operation === "update") && (
          <div className="mb-3">
            <h5>Parameters</h5>
            {Object.keys(data[0]).map((key) => (
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

        <button className="btn btn-success" onClick={handleGenerateAPI} disabled={loading}>
          {loading ? "Generating..." : "Generate API"}
        </button>
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
        <button className="btn btn-info" onClick={handleTestAPI} disabled={!apiEndpoint}>
          Test API
        </button>

        {/* Display API Response */}
        {apiResponse && (
          <div className="mt-3">
            <h5>API Response</h5>
            <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;