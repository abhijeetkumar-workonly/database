import axios from "axios";
import React, { useState } from "react";

const Addclearance = () => {
  const [allLrus, setAllLrus] = useState([]);

  // for filteration
  const [seleLruName, setSeleLruName] = useState("");
  const [seleLruSno, setSeleLruSno] = useState("");

  // for adding Clearance
  const [lruNameClicked, setLruNameClicked] = useState("");
  const [lruSnoClicked, setLruSnoClicked] = useState("");
  const [clearanceUploaded, setClearanceUploaded] = useState(undefined);

  const handleAddClearance = async () => {
    const lruName = lruNameClicked;
    const lruSno = lruSnoClicked;
    const clearanceFile = clearanceUploaded;
    const data = new FormData();
    data.append("lruName", lruName);
    data.append("lruSno", lruSno);
    data.append("clearanceFile", clearanceFile);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_ADDRESS}/newclearance`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data", // Important to let the server know it's form data
          },
        }
      );
      if (response.data.success) {
        alert("Clearance uploaded successfully!");
      } else {
        alert("Failed to upload Clearance");
      }
    } catch (error) {
      console.error("Error uploading Clearance report:", error);
      alert("Error uploading Clearance Report");
    }
  };

  const handleAddClick = (e) => {
    setLruNameClicked(e.target.name);
    setLruSnoClicked(e.target.value);
  };

  const fetchLrus = () => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_ADDRESS}/lrutable`)
      .then((response) => {
        setAllLrus(response.data.data);
      })
      .catch((error) => {
        console.error("There was an error fetching the LRUs!", error);
      });
  };

  useState(() => {
    fetchLrus();
  }, []);

  // Filter LRU records dynamically based on input values
  const filteredRecords = allLrus.filter((record) => {
    const matchesSiNum =
      !seleLruSno || record.lruSno.includes(seleLruSno.trim());
    const matchesName =
      !seleLruName ||
      record.lruName.toLowerCase().includes(seleLruName.toLowerCase().trim());
    return matchesSiNum && matchesName;
  });

  return (
    <div className="container bg-secondary-subtle shadow-lg text-center rounded-4">
      <h3 className="p-1 text-secondary">Add Clearance Letters</h3>

      <div className="container hstack gap-3 p-2 w-50">
        <input
          onChange={(e) => {
            setSeleLruName(e.target.value);
          }}
          value={seleLruName}
          type="text"
          placeholder="LRU Name"
          className="form-control"
        />
        <input
          onChange={(e) => {
            setSeleLruSno(e.target.value);
          }}
          value={seleLruSno}
          type="text"
          placeholder="LRU Serial No"
          className="form-control"
        />
      </div>
      <div className="container table-responsive scrollable-table">
        {allLrus.length != 0 ? (
          <>
            <table className="table table-striped table-secondary my-4">
              <thead className="thead-dark sticky-top">
                <tr>
                  <th>LRU Name</th>
                  <th>LRU SI No</th>
                  <th>Add Report</th>
                  <th>Clearance Report</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((lru) => (
                  <tr key={lru.ID}>
                    <td>{lru.lruName}</td>
                    <td>{lru.lruSno}</td>
                    <td>
                      <button
                        onClick={(e) => {
                          handleAddClick(e);
                        }}
                        disabled={lru.clearance === "Available"}
                        value={lru.lruSno}
                        name={lru.lruName}
                        className="btn btn-outline-success btn-sm"
                        data-bs-toggle="modal"
                        data-bs-target="#exampleModal"
                      >
                        Add Clearance Letter
                      </button>
                    </td>
                    <td
                      className={
                        lru.clearance === "Available"
                          ? "text-success"
                          : "text-secondary"
                      }
                    >
                      {lru.clearance}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <>
            <h3 className="p-1">No LRUs Available</h3>
          </>
        )}
      </div>
      {/* <!-- Modal --> */}
      <div
        className="modal fade"
        id="exampleModal"
        tabIndex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="exampleModalLabel">
                Add Clearance for {lruNameClicked} - ({lruSnoClicked})
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body text-center">
              <h3 className="p-1 text-secondary text-opacity-50">
                LRU Name: <strong> {lruNameClicked}</strong>
              </h3>
              <h3 className="p-1  text-secondary text-opacity-50">
                LRU Serial No: <strong>{lruSnoClicked}</strong>
              </h3>
              <input
                onChange={(e) => {
                  setClearanceUploaded(e.target.files[0]);
                }}
                type="file"
                className="form-control"
              />
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button
                onClick={handleAddClearance}
                type="button"
                className="btn btn-primary"
                data-bs-dismiss="modal"
              >
                Add Clearance
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Addclearance;
