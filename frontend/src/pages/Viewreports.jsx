import axios from "axios";
import React, { useEffect, useState } from "react";

const Viewreports = () => {
  const [reports, setReports] = useState([]);

  //for Filtering
  const [userProjName, setUserProjName] = useState("");
  const [userReportName, setUserReportName] = useState("");
  const [userDate, setUserDate] = useState("");
  const [userName, setUserName] = useState("");

  const fetchReports = () => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_ADDRESS}/reporttable`)
      .then((response) => {
        setReports(response.data.data);
      })
      .catch((error) => {
        console.error("There was an error fetching Reports!", error);
      });
  };

  const openReport = (id) => {
    const fileUrl = `${import.meta.env.VITE_BACKEND_ADDRESS}/open-report/${id}`;
    window.open(fileUrl, "_blank"); // Opens the file in a new tab or downloads it
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Filter LRU records dynamically based on input values
  const filteredReports = reports.filter((record) => {
    const matchesProjName =
      !userProjName ||
      record.projectName.toLowerCase().includes(userProjName.toLowerCase());
    const macthesReportName =
      !userReportName ||
      record.reportName.toLowerCase().includes(userReportName.toLowerCase());
    const matchesReportDate =
      !userDate ||
      record.reportDate.toLowerCase().includes(userDate.toLowerCase());
    const macthesPreparedBy =
      !userName ||
      record.preparedBy.toLowerCase().includes(userName.toLowerCase());
    return (
      matchesProjName &&
      macthesReportName &&
      matchesReportDate &&
      macthesPreparedBy
    );
  });

  return (
    <div className="container text-center bg-dark-subtle rounded-4 p-1 shadow-lg">
      <h3 className="p-1 text-success text-opacity-50">REPORTS</h3>

      <div className="container hstack gap-3">
        <input
          onChange={(e) => {
            setUserProjName(e.target.value);
          }}
          value={userProjName}
          className="form-control"
          type="text"
          placeholder="Project"
        />
        <input
          onChange={(e) => {
            setUserReportName(e.target.value);
          }}
          value={userReportName}
          className="form-control"
          type="text"
          placeholder="Report Name"
        />
        <input
          onChange={(e) => {
            setUserDate(e.target.value);
          }}
          value={userDate}
          className="form-control"
          type="date"
          placeholder="Report Date"
        />
        <input
          onChange={(e) => {
            setUserName(e.target.value);
          }}
          value={userName}
          className="form-control"
          type="text"
          placeholder="Prepared By"
        />
      </div>

      <div className="container table-responsive scrollable-table">
        {reports.length != 0 ? (
          <>
            <table className="table table-striped table-secondary my-4">
              <thead className="thead-dark sticky-top">
                <tr>
                  <th>Project Name</th>
                  <th>Report Name</th>
                  <th>Report Date</th>
                  <th>Report Type</th>
                  <th>Prepared By</th>
                  <th>Remarks</th>
                  <th>Report</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => (
                  <tr key={report.ID}>
                    <td>{report.projectName}</td>
                    <td>{report.reportName}</td>
                    <td>{report.reportDate}</td>
                    <td>{report.reportType}</td>
                    <td>{report.preparedBy}</td>
                    <td>{report.remarks}</td>
                    <td>
                      <button
                        value={report.ID}
                        onClick={(e) => {
                          openReport(e.target.value);
                        }}
                        className="btn btn-outline-success btn-sm"
                      >
                        Open Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <>
            <h3 className="p-1 text-secondary text-opacity-50">
              No Reports Available!
            </h3>
          </>
        )}
      </div>
    </div>
  );
};

export default Viewreports;
