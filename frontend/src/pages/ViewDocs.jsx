import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

export default function ViewDocs() {
  const [lru, setLru] = useState([]);
  const [miscDocs, setMiscDocs] = useState([]);
  const [commonDocs, setCommonDocs] = useState([]);
  const [specificDocs, setSpecificDocs] = useState([]);
  const [deleteID, setDeleteID] = useState("");

  // filtering common Docs
  const [seleLru, setSeleLru] = useState("");
  const [seleDocName, setSeleDocName] = useState("");

  const [delOption, selDelOption] = useState("");

  const openDocs = (id) => {
    const fileUrl = `${
      import.meta.env.VITE_BACKEND_ADDRESS
    }/open-commondoc/${id}`;
    window.open(fileUrl, "_blank"); // Opens the file in a new tab or downloads it
  };

  const openMiscDoc = (id) => {
    const fileUrl = `${
      import.meta.env.VITE_BACKEND_ADDRESS
    }/open-miscdoc/${id}`;
    window.open(fileUrl, "_blank"); // Opens the file in a new tab or downloads it
  };

  const handleDelete = () => {
    if (delOption === "MISC") {
      deleteMiscDoc();
    } else {
      deleteCommonDoc();
    }
  };

  const deleteCommonDoc = () => {
    axios
      .delete(
        `${import.meta.env.VITE_BACKEND_ADDRESS}/deletecommondocs/${deleteID}`
      )
      .then((response) => {
        fetchCommonDocs(); // Fetch updated gate passes
        setDeleteID(""); // Reset deleteID
      })
      .catch((error) => {
        console.log(error);
        alert("There was an error deleting the Record:", error);
      });
  };

  const deleteMiscDoc = () => {
    axios
      .delete(
        `${import.meta.env.VITE_BACKEND_ADDRESS}/deletemiscdocs/${deleteID}`
      )
      .then((response) => {
        fetchMiscDocs(); // Fetch updated gate passes
        setDeleteID(""); // Reset deleteID
      })
      .catch((error) => {
        console.log(error);
        alert("There was an error deleting the Record:", error);
      });
  };

  // Fetch LRU Data
  const fetchLruData = () => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_ADDRESS}/listedlru/`)
      .then((response) => {
        setLru(response.data.data);
        // setSeleLru(response.data.data[0].lruName);
      })
      .catch((error) => {
        console.error("There was an error fetching the LRUs!", error);
      });
  };

  const fetchMiscDocs = () => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_ADDRESS}/miscdocs`)
      .then((response) => {
        setMiscDocs(response.data.data);
      })
      .catch((error) => {
        console.error(
          "There was an error fetching the Miscllaneous Documents!",
          error
        );
      });
  };

  const fetchCommonDocs = () => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_ADDRESS}/commondocs`)
      .then((response) => {
        setCommonDocs(response.data.data);
      })
      .catch((error) => {
        console.error(
          "There was an error fetching the Common Documents!",
          error
        );
      });
  };

  useEffect(() => {
    fetchMiscDocs();
    fetchCommonDocs();
    fetchLruData();
  }, []);

  // Filter LRU records dynamically based on input values
  const filteredCommonDocs = commonDocs.filter((record) => {
    const matchesLruName = !seleLru || record.lruName === seleLru;
    const matchesDocName =
      !seleDocName ||
      record.docName.toLowerCase().includes(seleDocName.toLowerCase().trim());
    return matchesLruName && matchesDocName;
  });

  return (
    <>
      <div className="container text-center p-1 shadow-lg bg-info-subtle rounded-4">
        <h2 className="p-1 text-secondary">Documents Database</h2>
      </div>
      <div className="container gap-2 d-flex">
        <div className="container table-responsive scrollable-table w-50 bg-info-subtle p-2 rounded-4 shadow-lg my-1 justify-content-center text-center ">
          <h3 className="p-1">Miscllaneous Documents</h3>

          <table className="table table-striped table-info my-4">
            <thead className="thead-dark">
              <tr>
                <th>Document Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {miscDocs.map((mDocs) => (
                <tr key={mDocs.ID}>
                  <td>{mDocs.docName}</td>
                  <td>
                    <button
                      value={mDocs.ID}
                      onClick={(e) => {
                        openMiscDoc(e.target.value);
                      }}
                      className="btn btn-outline-success btn-sm"
                    >
                      Open Document
                    </button>
                    <div className="vr mx-2"></div>
                    <button
                      value={mDocs.ID}
                      onClick={(e) => {
                        selDelOption("MISC");
                        setDeleteID(e.target.value);
                      }}
                      className="btn btn-outline-danger btn-sm"
                      data-bs-toggle="modal"
                      data-bs-target="#exampleModal"
                    >
                      Delete Document
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="container table-responsive scrollable-table w-50 bg-info-subtle p-2 rounded-4 shadow-lg my-1 justify-content-center text-center ">
          <div className="container sticky-top bg-info-subtle">
            <h3 className="p-1">Common Documents</h3>
            

          <div className="row">
            <div className="col">
              <select
                onChange={(e) => {
                  setSeleLru(e.target.value);
                }}
                className="form-select"
              >
                <option value="">ALL LRUs</option>
                {lru.map((lrus) => {
                  return (
                    <option value={lrus.lruName} key={lrus.ID}>
                      {lrus.lruName}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="col">
              <input
                onChange={(e) => {
                  setSeleDocName(e.target.value);
                }}
                value={seleDocName}
                type="text"
                className="form-control"
                placeholder="Document name"
                aria-label="Document name"
              />
            </div>
          </div>
          </div>

          <table className="table table-striped table-info my-4">
            <thead className="thead-dark">
              <tr>
                <th>LRU Name</th>
                <th>Document Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCommonDocs.map((fDocs) => (
                <tr key={fDocs.ID}>
                  <td>{fDocs.lruName}</td>
                  <td>{fDocs.docName}</td>
                  <td>
                    <button
                      value={fDocs.ID}
                      onClick={(e) => {
                        openDocs(e.target.value);
                      }}
                      className="btn btn-outline-success btn-sm"
                    >
                      Open Document
                    </button>
                    <div className="vr mx-2"></div>
                    <button
                      value={fDocs.ID}
                      onClick={(e) => {
                        selDelOption("COMMON");
                        setDeleteID(e.target.value);
                      }}
                      className="btn btn-outline-danger btn-sm"
                      data-bs-toggle="modal"
                      data-bs-target="#exampleModal"
                    >
                      Delete Document
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
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
                Confirm
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body text-center">
              <h1 className="p-1">Delete This Document?</h1>
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
                onClick={handleDelete}
                type="button"
                className="btn btn-primary"
                data-bs-dismiss="modal"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
