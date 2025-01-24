import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

export default function LRUWiseDB() {
  const location = useLocation();
  const { name, sNo } = location.state || {};
  const currLocationRef = useRef(null);
  const updateDateRef = useRef(null);

  //for filteration
  const serialNumber = sNo;
  const seleLru = name;

  const [clearanceLetters, setClearanceLetters] = useState([]);
  const [locations, setLocations] = useState([]);

  const updateLocations = () => {
    const lruName = seleLru;
    const lruSno = serialNumber;
    const currLocation = currLocationRef.current.value;
    const date = updateDateRef.current.value;

    if (currLocation === "" || date === "") {
      alert("Location and Date can not be blank!");
      return;
    }
    // sending for approval to database
    axios
      .post(`${import.meta.env.VITE_BACKEND_ADDRESS}/newlocation`, {
        lruName,
        lruSno,
        currLocation,
        date,
      })
      .then(() => {
        alert("Location updated successfully!");
        fetchLocations();
      })
      .catch((error) => {
        console.error("Login error:", error);
      });
      currLocationRef.current.value=null
      updateDateRef.current.value = null
  };

  const fetchClearances = () => {
    // Fetch Active Projects data
    axios
      .get(`${import.meta.env.VITE_BACKEND_ADDRESS}/clearancetable`)
      .then((response) => {
        setClearanceLetters(response.data.data);
      })
      .catch((error) => {
        console.error("Error fetching projects:", error);
      });
  };

  const fetchLocations = () => {
    // Fetch Active Projects data
    axios
      .get(`${import.meta.env.VITE_BACKEND_ADDRESS}/locationtable`)
      .then((response) => {
        setLocations(response.data.data);
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
    fetchLocations();
  }, []);

  // Filter LRU Document records dynamically based on input values
  const filteredRecords = clearanceLetters.filter((record) => {
    const matchesSiNum =
      !serialNumber || record.lruSno.includes(serialNumber.trim());
    const matchesLruName = !seleLru || record.lruName === seleLru;
    return matchesSiNum && matchesLruName;
  });

  // Filter LRU Location records dynamically based on input values
  const filteredLocations = locations.filter((record) => {
    const matchesSiNum =
      !serialNumber || record.lruSno.includes(serialNumber.trim());
    const matchesLruName = !seleLru || record.lruName === seleLru;
    return matchesSiNum && matchesLruName;
  });

  return (
    <>
      <div className="container bg-secondary-subtle rounded-4 shadow-lg p-1">
        <h2 className="text-center text-secondary">
          {name} S.NO: {sNo} Database
        </h2>
        <div className="container hstack gap-3">
          <div className="container text-center">
            <h3 className="p-1 text-secondary">Documents and Reports</h3>
            <div className="table-responsive scrollable-table">
              {filteredRecords.length === 0 ? (
                <h2 className=" text-center text-secondary text-opacity-25 p-1">
                  No Documents Available
                </h2>
              ) : (
                <table className="table table-striped table-secondary my-4">
                  <thead className="thead-dark">
                    <tr>
                      <th>Document Type</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((letters) => (
                      <tr key={letters.ID}>
                        <td>Clearance Letter</td>
                        <td>
                          <button
                            onClick={(e) => {
                              openClearance(e.target.value);
                            }}
                            value={letters.ID}
                            className="btn btn-outline-primary mx-1"
                          >
                            Open Letter
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="container text-center vstack">
            <h3 className="p-1 text-secondary">Location History</h3>
            <div className="table-responsive scrollable-table">
              {filteredLocations.length === 0 ? (
                <h2 className=" text-center text-secondary text-opacity-25 p-1">
                  No Location History
                </h2>
              ) : (
                <table className="table table-striped table-secondary my-4">
                  <thead className="thead-dark">
                    <tr>
                      <th>Location</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLocations.map((locations) => (
                      <tr key={locations.ID}>
                        <td>{locations.currLocation}</td>
                        <td>{locations.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="row container">
              <div className="col">
                <input
                  type="text"
                  ref={currLocationRef}
                  className="form-control"
                  placeholder="current location"
                  aria-label="First name"
                />
              </div>
              <div className="col">
                <input
                  type="date"
                  ref={updateDateRef}
                  className="form-control"
                  aria-label="date"
                />
              </div>
              <div className="col">
                <button onClick={updateLocations} className="btn btn-primary">
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
