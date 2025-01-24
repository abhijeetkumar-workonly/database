import React, { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Resizer from 'react-image-file-resizer';

const LrufullDB = () => {
  const location = useLocation();
  const { name } = location.state || {};

  const [allLrus, setAllLrus] = useState([]);
  const [allRcma, setAllRcma] = useState([]);
  const [allDocs, setAllDocs] = useState([]);
  const [img, setImg] = useState(null);

  //filter state
  const [serialNo, setSerialNo] = useState("");
  const [projName, setProjName] = useState("");

  const openDocs = (id) => {
    const fileUrl = `${
      import.meta.env.VITE_BACKEND_ADDRESS
    }/open-commondoc/${id}`;
    window.open(fileUrl, "_blank"); // Opens the file in a new tab or downloads it
  };

  const openRcma = (id) => {
    const fileUrl = `${import.meta.env.VITE_BACKEND_ADDRESS}/open-rcma/${id}`;
    window.open(fileUrl, "_blank"); // Opens the file in a new tab or downloads it
  };

  const openClearance = (id) => {
    const fileUrl = `${
      import.meta.env.VITE_BACKEND_ADDRESS
    }/open-clearanceview/${id}`;
    window.open(fileUrl, "_blank"); // Opens the file in a new tab or downloads it
  };

  // Function to resize image
  const resizeFile = (file) =>
    new Promise((resolve) => {
      Resizer.imageFileResizer(
        file, // File object
        150, // Desired width
        150, // Desired height
        "JPEG", // Format
        100, // Quality (0-100)
        0, // Rotation
        (uri) => {
          // Callback after resize
          resolve(uri);
        },
        "blob" // Output type: 'base64' or 'blob'
      );
    });

  const handleImgUpdate = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const resizedFile = await resizeFile(file);
      setImg(resizedFile);
    }
  };

  const handleImgData = () => {
    console.log(name, img)
    if (!img) return;
    const formData = new FormData();
    formData.append("lruName", name);
    formData.append("lruImage", img);
    axios
      .post(
        `${import.meta.env.VITE_BACKEND_ADDRESS}/updatelruimage`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )
      .then((response) => {
        alert("LRU Image updated successfully");
      })
      .catch((error) => {
        alert(error.response.data.message);
      });
  };

  const fetchAllLrus = () => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_ADDRESS}/lrus/${name}`)
      .then((response) => {
        setAllLrus(response.data.data);
      })
      .catch((error) => {
        console.error("There was an error fetching the LRUs!", error);
      });
  };

  const fetchLruDocs = () => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_ADDRESS}/commondocs/${name}`)
      .then((response) => {
        setAllDocs(response.data.data);
      })
      .catch((error) => {
        console.error("There was an error fetching the LRUs!", error);
      });
  };

  const fetchRcma = () => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_ADDRESS}/fullrcma/${name}`)
      .then((response) => {
        setAllRcma(response.data.data);
      })
      .catch((error) => {
        console.error("There was an error fetching the LRUs!", error);
      });
  };

  useEffect(() => {
    fetchAllLrus();
    fetchRcma();
    fetchLruDocs();
  }, []);

  // Filter LRU records dynamically based on input values
  const filteredRecords = allLrus.filter((record) => {
    const matchesSiNum = !serialNo || record.lruSno.includes(serialNo.trim());
    const matchProject =
      !projName ||
      record.projectName.toLowerCase().includes(projName.toLowerCase().trim());
    return matchesSiNum && matchProject;
  });

  return (
    <>
      <div className="container bg-secondary-subtle rounded-4 text-center">
        <h2 className="p-1 text-secondary text-opacity-50">
          {name} Database{" "}
          <button
            className="btn btn-outline-success btn-sm"
            data-bs-toggle="modal"
            data-bs-target="#exampleModal"
          >
            Edit
          </button>{" "}
        </h2>
        <div className="container hstack gap-3 shadow-lg rounded-5">
          <div className="container table-responsive scrollable-table  p-1 my-1">
            <h3 className="p-1 text-dark text-opacity-50">
              Documents available for {name}
            </h3>
            {allDocs.length != 0 ? (
              <>
                <table className="table table-striped table-secondary my-4">
                  <thead className="thead-dark sticky-top">
                    <tr>
                      <th>Document</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allDocs.map((docs) => (
                      <tr key={docs.ID}>
                        <td>{docs.docName}</td>
                        <td>
                          <button
                            value={docs.ID}
                            className="btn btn-info mx-1"
                            onClick={(e) => {
                              openDocs(e.target.value);
                            }}
                          >
                            Open {docs.docName}
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
                  No Documents Available
                </h3>
              </>
            )}
          </div>
          <div className="container">
            <h3 className="p-1 text-dark text-opacity-50">
              RCMA Available for {name}
            </h3>
            {allRcma.length != 0 ? (
              <>
                <table className="table table-striped table-secondary my-4">
                  <thead className="thead-dark">
                    <tr>
                      <th>{name} Part Number</th>
                      <th>RCMA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allRcma.map((rcma) => (
                      <tr key={rcma.ID}>
                        <td>{rcma.partNo}</td>
                        <td>
                          <button
                            value={rcma.ID}
                            onClick={(e) => {
                              openRcma(e.target.value);
                            }}
                            className="btn btn-info mx-1"
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
                  No RCMA Available
                </h3>
              </>
            )}
          </div>
        </div>

        <div className="container shadow-lg rounded-5 my-2">
          <h3 className="p-1 text-dark text-opacity-50">
            All Listed {name} (Totla Qty: {allLrus.length})
          </h3>
          {allLrus.length != 0 ? (
            <>
              <div className="container hstack gap-3 w-25">
                <input
                  onChange={(e) => {
                    setProjName(e.target.value);
                  }}
                  type="text"
                  value={projName}
                  className="form-control"
                  placeholder="Project Name"
                />
                <input
                  onChange={(e) => {
                    setSerialNo(e.target.value);
                  }}
                  value={serialNo}
                  type="text"
                  className="form-control"
                  placeholder="Serial Number"
                />
              </div>
              <div className="container table-responsive scrollable-table">
                <table className="table table-striped table-secondary my-4">
                  <thead className="thead-dark sticky-top">
                    <tr>
                      <th>Project Name</th>
                      <th>LRU Name</th>
                      <th>LRU SI No</th>
                      <th>LRU Type</th>
                      <th>LRU Location</th>
                      <th>LRU Clearance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((record) => (
                      <tr key={record.ID}>
                        <td>{record.projectName}</td>
                        <td>{record.lruName}</td>
                        <td>{record.lruSno}</td>
                        <td>{record.unitType}</td>
                        <td> {record.location} </td>
                        {record.clearanceFile ? (
                          <td>
                            {" "}
                            <button
                              onClick={(e) => {
                                openClearance(e.target.value);
                              }}
                              value={record.ID}
                              className="btn btn-sm btn-outline-success"
                            >
                              Open Clearance Letter
                            </button>{" "}
                          </td>
                        ) : (
                          <td> Not Available </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <>
              <h3 className="p-1 my-2 text-secondary text-opacity-50">
                No LRUs Available
              </h3>
            </>
          )}
        </div>
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
                Edit
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body text-center">
              <h3 className="p-1 text-secondary text-opacity-50"> {name} </h3>
              <div className="container d-flex">
                <input
                  onChange={handleImgUpdate}
                  type="file"
                  className="form-control"
                  id="imageInput"
                />
                <label htmlFor="imageInput" className="input-group-text">
                  LRU Image
                </label>
              </div>
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
                onClick={handleImgData}
                type="button"
                className="btn btn-primary"
                data-bs-dismiss="modal"
              >
                Update Image
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LrufullDB;
