import React, { useState, useEffect, useRef } from "react";
import axios from "axios";



const AddDocs = () => {
  const [lruRecords, setLruRecords] = useState([]);
  const [lru, setLru] = useState([]);
  const [projects, setProjects] = useState([]);

  const [lruNameSel, setLruNameSel] = useState("");
  const [lruSnoSel, setLruSnoSel] = useState("");

  const [commonDocs, setCommonDocs] = useState([]);
  const [specificDocs, setSpecificDocs] = useState([]);

  const miscDocName = useRef(null);
  const [miscDocFile, setMiscDocFile] = useState(null);

  const docNameRef = useRef(null);
  const [commonDocFile, setCommonDocFile] = useState([]);

  const handleLruSelection = async(e) => {
    setLruNameSel(e.target.name);
    setLruSnoSel(e.target.value);
    // fetchSelectedLruDocs();
  };

  //for filteration
  const [seleProject, setSeleProject] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [categ, setCateg] = useState("");
  const [seleLru, setSeleLru] = useState("");

  // selected LRU Docs Data
  const [selectedLRUDocs, setSelectedLRUDocs] = useState([])

  const fetchSelectedLruDocs = async()=>{
    const lruName = lruNameSel;
    const lruSno = lruSnoSel;

    console.log(lruName, lruSno)

    await axios.get(`${import.meta.env.VITE_BACKEND_ADDRESS}/selelrudoc`, {lruName, lruSno}).then((response)=>{
      console.log(response)
    }).catch((err)=>{
      console.error(err)
    })
  }

  const handleDocAdd = async () => {
    const lruName = lruNameSel;
    const lruSno = lruSnoSel;
    const docName = docNameRef.current.value;
    const docFile = commonDocFile;
    if (docName === "" || !docFile) {
      alert("Document name and Document File is mandatory!");
      return;
    }
    const data = new FormData();
    data.append("lruName", lruName);
    data.append("lruSno", lruSno);
    data.append("docName", docName);
    data.append("document", docFile);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_ADDRESS}/newlrudoc`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data", // Important to let the server know it's form data
          },
        }
      );
      if (response.data.success) {
        alert("Document uploaded successfully!");
      } else {
        alert("Failed to upload document");
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      alert("Error uploading document");
    }
    setLruNameSel("");
    setLruSnoSel("");
    docNameRef.current.value = "";
    setCommonDocFile(undefined);
    document.getElementById("commonDocFile").value = null;
  };

  const handleMiscDocAdd = async () => {
    const docName = miscDocName.current.value;
    const docFile = miscDocFile;

    if (docName === "" || !docFile) {
      alert("Document Name and document File is mandatory!");
      return;
    }

    const data = new FormData();
    data.append("docName", docName);
    data.append("document", docFile);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_ADDRESS}/newmiscdoc`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data", // Important to let the server know it's form data
          },
        }
      );
      if (response.data.success) {
        alert("Document uploaded successfully!");
      } else {
        alert("Failed to upload document");
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      alert("Error uploading document");
    }
    miscDocName.current.value = "";
    setMiscDocFile(undefined);
    document.getElementById("miscDocInput").value = null;
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

  // Fetch LRU Data
  const fetchLruData = () => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_ADDRESS}/listedlru/${categ}`)
      .then((response) => {
        setLru(response.data.data);
        // setSeleLru(response.data.data[0].lruName);
      })
      .catch((error) => {
        console.error("There was an error fetching the LRUs!", error);
      });
  };

  const fetchLruRecord = () => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_ADDRESS}/lrutable`)
      .then((response) => {
        setLruRecords(response.data.data);
      })
      .catch((error) => {
        console.error("There was an error fetching the LRUs!", error);
      });
  };

  useEffect(() => {
    fetchProjects();
    fetchLruRecord();
    fetchLruData();
  }, []);

  // Filter LRU records dynamically based on input values
  const filteredRecords = lruRecords.filter((record) => {
    const matchProject = !seleProject || record.projectName === seleProject;
    const matchesSiNum =
      !serialNumber || record.lruSno.includes(serialNumber.trim());
    const matchesCategory = !categ || record.category === categ;
    const matchesLruName = !seleLru || record.lruName === seleLru;
    return matchProject && matchesSiNum && matchesCategory && matchesLruName;
  });

  return (
    <>
      <div className="container p-1 text-center">
        <h2 className="p-1 text-secondary">Add Documents</h2>
      </div>

      <div className="text-center p-2 justify-content-center hstack gap-3">
        <select
          onChange={(e) => {
            setSeleProject(e.target.value);
          }}
          className="form-select-md p-2"
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
            setCateg(e.target.value);
          }}
          className="form-select-md p-2"
        >
          <option value="">All Categories</option>
          <option value="Airborne">Airborne</option>
          <option value="Ground">Ground</option>
          <option value="Other">Other</option>
        </select>

        <select
          onChange={(e) => {
            setSeleLru(e.target.value);
          }}
          className="form-select-md p-2"
        >
          <option value="">All LRU</option>
          {lru.map((lrus) => {
            return (
              <option key={lrus.ID} value={lrus.lruName}>
                {lrus.lruName}
              </option>
            );
          })}
        </select>

        <input
          value={serialNumber} // Use the serialNumber state
          onChange={(e) => setSerialNumber(e.target.value)} // Update state on input
          type="text"
          className="p-2"
          placeholder="Serial Number"
        />
      </div>
      {/* Filtered Table */}
      <div className="container rounded-5 bg-secondary-subtle shadow-lg mt-4 p-3 text-center">
        <div className="table-responsive scrollable-table">
          {filteredRecords.length === 0 ? (
            <h2 className=" text-center text-secondary text-opacity-25 p-1">
              No LRUs Available
            </h2>
          ) : (
            <table className="table table-striped table-secondary my-4">
              <thead className="thead-dark sticky-top">
                <tr>
                  <th>Project Name</th>
                  <th>Category</th>
                  <th>LRU Name</th>
                  <th>LRU Si No</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((lrus) => (
                  <tr key={lrus.ID}>
                    <td>{lrus.projectName}</td>
                    <td>{lrus.category}</td>
                    <td>{lrus.lruName}</td>
                    <td>{lrus.lruSno}</td>
                    <td>
                      <button
                        name={lrus.lruName}
                        value={lrus.lruSno}
                        className="btn btn-outline-success btn-sm"
                        data-bs-toggle="modal"
                        data-bs-target="#exampleModal"
                        onClick={handleLruSelection}
                      >
                        Add Document
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="container text-center mt-4">
        <h2 className="p-1 text-secondary">Add Common Documents</h2>
        <h2 className="p-1 text-secondary text-opacity-25">LRUs Available</h2>
      </div>

      <div className="d-flex flex-wrap shadow-lg rounded-4 bg-secondary-subtle p-4 text-center container my-2">
        {lru.map((lrus) => {
          return (
            <span
              key={lrus.ID}
              className="border shadow my-1 mx-auto border-secondary-subtle p-2 rounded-5"
            >
              <h2 className="p-1 text-secondary">{lrus.lruName}</h2>
              <button
                name={lrus.lruName}
                value="NA"
                onClick={handleLruSelection}
                className="btn btn-sm mx-1 btn-outline-secondary"
                data-bs-toggle="modal"
                data-bs-target="#exampleModal"
              >
                Add Document
              </button>
            </span>
          );
        })}
      </div>

      <div className="container text-center p-2 mt-3">
        <h2 className="p-1 text-secondary">Add Miscllaneous Documents</h2>
        <div className="container shadow-lg bg-secondary-subtle rounded-4 justify-content-center hstack gap-3 p-3">
          <input
            type="text"
            ref={miscDocName}
            className="form-control-md"
            placeholder="Document Name"
          />
          <input
            type="file"
            onChange={(e) => {
              setMiscDocFile(e.target.files[0]);
            }}
            className="form-control-md"
            id="miscDocInput"
          />
          <button
            onClick={handleMiscDocAdd}
            className="btn btn-outline-success"
          >
            Add Document
          </button>
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
                Add Documents
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body text-center">
              <input
                type="text"
                ref={docNameRef}
                className="form-control p-2 my-2"
                placeholder="Document Name"
              />
              <input
                type="file"
                id="commonDocFile"
                onChange={(e) => {
                  setCommonDocFile(e.target.files[0]);
                }}
                className="form-control p-2 my-2"
                placeholder="Document"
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
                type="button"
                className="btn btn-primary"
                data-bs-dismiss="modal"
                onClick={handleDocAdd}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddDocs;
