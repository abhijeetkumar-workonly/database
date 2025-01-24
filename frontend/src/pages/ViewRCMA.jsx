import axios from "axios";
import React, { useEffect, useState } from "react";

export default function ViewRCMA() {
  const [rcmaDocs, setRcmaDocs] = useState([]);

  // for filteration
  const [seleLruName, setSeleLruName] = useState("");
  const [seleLruPartNo, setSeleLruPartNo] = useState("");

  const fetchRcma = () => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_ADDRESS}/fullrcma`)
      .then((response) => {
        setRcmaDocs(response.data.data);
      })
      .catch((error) => {
        console.error("There was an error fetching the Active LRUs!", error);
      });
  };

  const openRcma = (id) => {
    const fileUrl = `${import.meta.env.VITE_BACKEND_ADDRESS}/open-rcma/${id}`;
    window.open(fileUrl, "_blank"); // Opens the file in a new tab or downloads it
  };

  useEffect(() => {
    fetchRcma();
  }, []);

  // Filter LRU records dynamically based on input values
  const filteredRcma = rcmaDocs.filter((record) => {
    const matchesLruName =
      !seleLruName ||
      record.lruName.toLowerCase().includes(seleLruName.toLowerCase());
    const matchLruPartNo =
      !seleLruPartNo ||
      record.partNo.toLowerCase().includes(seleLruPartNo.toLowerCase());
    return matchesLruName && matchLruPartNo;
  });

  return (
    <>
      <div className="container bg-dark-subtle text-center rounded-4 shadow-lg p-1">
        <h3 className="p-1 text-secondary">RCMA Database</h3>

        <div className="container w-50 hstack gap-3 p-1 my-2">
          <input
            type="text"
            onChange={(e) => {
              setSeleLruName(e.target.value);
            }}
            value={seleLruName}
            className="form-control"
            placeholder="LRU Name"
          />
          <input
            type="text"
            onChange={(e) => {
              setSeleLruPartNo(e.target.value);
            }}
            value={seleLruPartNo}
            className="form-control"
            placeholder="LRU Part No"
          />
        </div>

        {rcmaDocs.length != 0 ? (
          <>
            <table className="table table-striped table-secondary my-4">
              <thead className="thead-dark">
                <tr>
                  <th>LRU Name</th>
                  <th>LRU Part Number</th>
                  <th>RCMA Doc</th>
                </tr>
              </thead>
              <tbody>
                {filteredRcma.map((rcma) => (
                  <tr key={rcma.ID}>
                    <td>{rcma.lruName}</td>
                    <td>{rcma.partNo}</td>
                    <td>
                      <button
                        value={rcma.ID}
                        onClick={(e) => {
                          openRcma(e.target.value);
                        }}
                        className="btn btn-outline-success btn-sm"
                      >
                        Open RCMA
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
              No RCMA Available!
            </h3>
          </>
        )}
      </div>
    </>
  );
}
