import axios from "axios";
import React, { useEffect, useState } from "react";

const Viewclearance = () => {
  const [allClearances, setAllClearances] = useState([]);

  //for filteration
  const [seleLruName, setSeleLruName] = useState("");
  const [seleLruSno, setSeleLruSno] = useState("");

  const fetchClearances = () => {
    // Fetch Active Projects data
    axios
      .get(`${import.meta.env.VITE_BACKEND_ADDRESS}/clearancetable`)
      .then((response) => {
        setAllClearances(response.data.data);
      })
      .catch((error) => {
        console.error("Error fetching projects:", error);
      });
  };

  const openClearance = (id) => {
    const fileUrl = `${
      import.meta.env.VITE_BACKEND_ADDRESS
    }/open-clearance/${id}`;
    window.open(fileUrl, "_blank"); // Opens the file in a new tab or downloads it
  };


  useEffect(() => {
    fetchClearances();
  }, []);

  // Filter LRU records dynamically based on input values
  const filteredRecords = allClearances.filter((record) => {
    const matchesSiNum =
      !seleLruSno || record.lruSno.includes(seleLruSno.trim());
    const matchesName =
      !seleLruName ||
      record.lruName.toLowerCase().includes(seleLruName.toLowerCase().trim());
    return matchesSiNum && matchesName;
  });

  return (
    <div className="container bg-secondary-subtle rounded-4 shadow-lg text-center p-1">
      <h3 className="p-1 text-secondary text-opacity-50">
        Clearance Letter Database
      </h3>
      <div className="container w-50 hstack gap-3">
        <input
          onChange={(e) => {
            setSeleLruName(e.target.value);
          }}
          value={seleLruName}
          type="text"
          className="form-control"
          placeholder="LRU Name"
        />
        <input
          onChange={(e) => {
            setSeleLruSno(e.target.value);
          }}
          value={seleLruSno}
          type="text"
          className="form-control"
          placeholder="LRU SI No"
        />
      </div>

      <div className="container table-responsive scrollable-table">
        {allClearances.length != 0 ? (
          <>
            <table className="table table-striped table-secondary my-4">
              <thead className="thead-dark sticky-top">
                <tr>
                  <th>LRU Name</th>
                  <th>LRU SI No</th>
                  <th>Clearance Report</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((clearances) => (
                  <tr key={clearances.ID}>
                    <td>{clearances.lruName}</td>
                    <td>{clearances.lruSno}</td>
                    <td>
                      <button
                      onClick={(e)=>{openClearance(e.target.value)}}
                        value={clearances.ID}
                        className="btn btn-outline-success btn-sm"
                        data-bs-toggle="modal"
                        data-bs-target="#exampleModal"
                      >
                        Open
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <>
            <h3 className="p-1 my-2 text-dark text-opacity-50">No LRUs Available</h3>
          </>
        )}
      </div>
    </div>
  );
};

export default Viewclearance;
