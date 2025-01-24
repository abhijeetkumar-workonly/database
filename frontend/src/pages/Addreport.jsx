import axios from "axios";
import React, { useEffect, useRef, useState } from "react";

const Addreport = () => {
  const [projects, setProjects] = useState([]);

  // for project reports
  const [seleProject, setSeleProject] = useState("");
  const [seleReportType, setSeleReportType] = useState("PFA/PTA");
  const reportDateRef = useRef(null);
  const reportNameRef = useRef(null);
  const preparedByRef = useRef(null);
  const remarksRef = useRef(null);
  const [seleReportFile, setSeleReportFile] = useState(null);

  const handleProjectReport = async () => {
    const projectName = seleProject;
    const reportType = seleReportType;
    const reportDate = reportDateRef.current.value;
    const reportName = reportNameRef.current.value;
    const preparedBy = preparedByRef.current.value;
    var remarks = remarksRef.current.value;
    const reportFile = seleReportFile;
    if (remarks === "") {
      remarks = "NA";
    }
    if (
      reportName === "" ||
      reportDate === "" ||
      preparedBy === "" ||
      !reportFile
    ) {
      alert("Report name, Prepared By and Report File is mandatory!");
      return;
    }
    const data = new FormData();
    data.append("projectName", projectName);
    data.append("reportType", reportType);
    data.append("reportDate", reportDate);
    data.append("reportName", reportName);
    data.append("preparedBy", preparedBy);
    data.append("remarks", remarks);
    data.append("reportFile", reportFile);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_ADDRESS}/newreport`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data", // Important to let the server know it's form data
          },
        }
      );
      if (response.data.success) {
        alert("Report uploaded successfully!");
      } else {
        alert("Failed to upload report");
      }
    } catch (error) {
      console.error("Error uploading report:", error);
      alert("Error uploading Report");
    }
    reportDateRef.current.value = ""
    reportNameRef.current.value = ""
    preparedByRef.current.value = ""
    remarksRef.current.value=""
    setSeleReportFile(undefined)
    document.getElementById("reportFile").value=""
  };

  const fetchProjects = () => {
    // Fetch Active Projects data
    axios
      .get(`${import.meta.env.VITE_BACKEND_ADDRESS}/projectnames`)
      .then((response) => {
        setProjects(response.data.data);
      })
      .catch((error) => {
        console.error("Error fetching projects:", error);
      });
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="container text-center">
      <h3 className="p-1 text-secondary text-opacity-50">Add Reports</h3>

      <div className="conainer bg-secondary-subtle rounded-4 shadow-lg p-1">
        <h3 className="p-1 text-dark text-opacity-50">Project-Wise Report</h3>
        <div className="container hstack gap-3">
          <select
            onChange={(e) => {
              setSeleProject(e.target.value);
            }}
            className="form-select p-2"
          >
            <option value="">All Projects</option>
            {projects.map((proj) => {
              return (
                <option value={proj.projectName} key={proj.ID}>
                  {proj.projectName}
                </option>
              );
            })}
            <option value="Other">Other</option>
          </select>

          <select
            onChange={(e) => {
              setSeleReportType(e.target.value);
            }}
            className="form-select"
          >
            <option value="PFA/PTA">PFA / PTA Report</option>
            <option value="LRUs TEST">LRUs Test</option>
          </select>
          <input ref={reportDateRef} className="form-control" type="date" />
        </div>
        <div className="container hstack gap-3 my-2">
          <input
            type="text"
            ref={reportNameRef}
            placeholder="Report Name"
            className="form-control"
          />
          <input
            ref={preparedByRef}
            type="text"
            className="form-control"
            placeholder="Prepared By"
          />
          <input
            ref={remarksRef}
            type="text"
            placeholder="Remarks (Optional)"
            className="form-control"
          />
          <input
            onChange={(e) => {
              setSeleReportFile(e.target.files[0]);
            }}
            id="reportFile"
            className="form-control"
            type="file"
            placeholder="Report File"
          />
        </div>
        <button
          onClick={handleProjectReport}
          className="btn btn-block btn-outline-success shadow"
        >
          Add Report
        </button>
      </div>

      <div className="container p-1 my-3 shadow-lg bg-secondary-subtle rounded-4">
        <h3 className="p-1 text-dark text-opacity-50">Miscllaneous Reports</h3>
        <div className="container hstack gap-3">
          <input
            type="text"
            placeholder="Report Name"
            className="form-control"
          />
          <input type="date" className="form-control" />
          <input
            type="text"
            placeholder="Prepared By"
            className="form-control"
          />
          <input
            type="text"
            placeholder="Remarks (Optional)"
            className="form-control"
          />
          <input type="file" className="form-control" />
        </div>
        <button className="btn btn-outline-success my-2">Add Report</button>
      </div>
    </div>
  );
};

export default Addreport;
