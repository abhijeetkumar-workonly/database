import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const ProjectWiseDB = (props) => {
  const [lruRecords, setLruRecords] = useState([]);
  const [isUpdated, setIsUpdated] = useState(false);
  const [unitType, setUnitType] = useState("AT UNIT");
  const currProject = props.projName;
  const [categ, setCateg] = useState("Airborne");
  const [lru, setLru] = useState([]);
  const [seleLru, setSeleLru] = useState("");
  const [serialNumber, setSerialNumber] = useState(""); // Use state for serial number
  const [modalDelID, setModalDelID] = useState("");

  const navigate = useNavigate()

  const handleRcrdClick = (e) => {
    setModalDelID(e.target.value);
  };

  const handleLruClick=(e)=>{
    const data = { name: e.target.name, sNo:e.target.value };
    navigate('/lruwisedb', {state: data})
  }

  const handleModalRequests = () => {
    axios
      .delete(
        `${import.meta.env.VITE_BACKEND_ADDRESS}/deletelrurecord/${modalDelID}`
      )
      .then((response) => {
        // console.log(response)
      })
      .catch((error) => {
        console.log(error);
        alert("There was an error deleting the Record:", error);
      });
    setIsUpdated(true);
  };

  // Add new LRU records
  const handleLruDetails = async (e) => {
    e.preventDefault();

    // Get the input serial numbers, splitting by comma
    const siNumsArray = serialNumber.split(",").map((s) => s.trim());

    // Prepare common data for the POST request
    const category = categ;
    const projectName = currProject;
    const lruName = seleLru;

    // Validate: Ensure all inputs are provided
    if (!category || !projectName || !lruName || siNumsArray.length === 0) {
      alert("Please provide all required inputs.");
      return;
    }

    try {
      // Loop over the siNumsArray and send POST requests for each serial number
      for (let i = 0; i < siNumsArray.length; i++) {
        const lruSno = siNumsArray[i]; // Current serial number
        await axios.post(
          `${import.meta.env.VITE_BACKEND_ADDRESS}/newlrurecord`,
          {
            category,
            projectName,
            lruName,
            lruSno,
            unitType,
          }
        );
      }
      alert("LRU records added successfully!");
    } catch (error) {
      console.error("Error Adding LRU:", error);
      alert(
        `Failed to Add LRU records: ${
          error.response?.data?.message || "Unknown error"
        }`
      );
    }

    // Clear input after adding
    setSerialNumber(""); // Clear serial number state
    setIsUpdated(true); // Trigger table update
  };

  // Fetch LRU records
  const fetchLruRecord = () => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_ADDRESS}/lrutable/${currProject}`)
      .then((response) => {
        setLruRecords(response.data.data);
      })
      .catch((error) => {
        console.error("There was an error fetching the LRUs!", error);
      });
    setIsUpdated(false);
  };

  // Fetch LRU Data
  const fetchLruData = () => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_ADDRESS}/listedlru/${categ}`)
      .then((response) => {
        setLru(response.data.data);
        setSeleLru(response.data.data[0].lruName);
      })
      .catch((error) => {
        console.error("There was an error fetching the LRUs!", error);
      });
  };

  useEffect(() => {
    fetchLruData();
    fetchLruRecord();
  }, []);

  useEffect(() => {
    if (isUpdated) {
      fetchLruRecord();
    }
  }, [isUpdated]);

  useEffect(() => {
    fetchLruData();
  }, [categ]);

  // Filter LRU records dynamically based on input values
  const filteredRecords = lruRecords.filter((record) => {
    const matchesSiNum =
      !serialNumber || record.lruSno.includes(serialNumber.trim());
    const matchesCategory = !categ || record.category === categ;
    const matchesLruName = !seleLru || record.lruName === seleLru;
    return matchesSiNum && matchesCategory && matchesLruName;
  });

  return (
    <>
      <div className="text-center container">
        <h2 className="p-1 text-secondary text-opacity-50">
          Welcome to {props.projName} Database
        </h2>
      </div>
      <div className="container text-center shadow-lg p-2 my-2 rounded-4 bg-dark-subtle">
        <h2 className="p-1 text-secondary">
          Air-Frames
        </h2>

      </div>
      <div className="container shadow-lg bg-dark-subtle rounded-5 text-center">
        <h1 className="p-1 text-dark text-opacity-50">Add LRUs</h1>
        <div className="container w-50">
          <form onSubmit={handleLruDetails}>
            <div className="mb-3 p-2 container">
              <input
                type="text"
                className="form-control"
                disabled={true}
                value={currProject}
              />

              <select
                id="categSel"
                onChange={(e) => setCateg(e.target.value)}
                className="form-select my-2"
              >
                <option value="Airborne">Airborne</option>
                <option value="Ground">Ground</option>
                <option value="Other">Other</option>
              </select>

              <select
                className="form-select my-2"
                value={seleLru}
                onChange={(e) => setSeleLru(e.target.value)}
              >
                {lru.map((lrus) => (
                  <option value={lrus.lruName} key={lrus.lruName}>
                    {lrus.lruName}
                  </option>
                ))}
              </select>

              <p className="p-1">
                LRU Not Listed?{" "}
                <Link className="btn btn-sm btn-outline-secondary" to="/addlru">
                  Add LRU Here
                </Link>
              </p>

              <div className="d-flex flex-wrap mx-auto justify-content-center gap-5 p-2">
                <div className="form-check">
                  <input
                    onClick={() => {
                      setUnitType("QT UNIT");
                    }}
                    className="form-check-input"
                    type="radio"
                    name="flexRadioDefault"
                    id="flexRadioDefault1"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="flexRadioDefault1"
                  >
                    QT Unit
                  </label>
                </div>
                <div className="form-check">
                  <input
                    onClick={() => {
                      setUnitType("AT UNIT");
                    }}
                    className="form-check-input"
                    type="radio"
                    name="flexRadioDefault"
                    id="flexRadioDefault2"
                    defaultChecked
                  />
                  <label
                    className="form-check-label"
                    htmlFor="flexRadioDefault2"
                  >
                    AT Unit
                  </label>
                </div>
              </div>

              <input
                type="text"
                placeholder="Serial Number"
                className="form-control"
                value={serialNumber} // Use the serialNumber state
                onChange={(e) => setSerialNumber(e.target.value)} // Update state on input
              />
              <p className="p-1 text-danger">
                Enter comma "," separated serial numbers to add multiple units
                of the same LRU
              </p>

              <button
                type="submit"
                className=" my-2 btn btn-lg btn-outline-success"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Filtered Table */}
      <div className="container-fluid rounded-5 bg-secondary-subtle mt-4 text-center">
        <div className="table-responsive scrollable-table">
          <h1 className="p-1 text-secondary text-opacity-25">
            {seleLru}s Listed Under {currProject}
          </h1>
          {filteredRecords.length === 0 ? (
            <h2 className=" text-center text-secondary text-opacity-25 p-1">
              No LRUs Available
            </h2>
          ) : (
            <table className="table table-striped table-secondary my-4">
              <thead className="thead-dark">
                <tr>
                  <th>Project Name</th>
                  <th>Category</th>
                  <th>LRU Name</th>
                  <th>LRU Si No</th>
                  <th>LRU Unit Type</th>
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
                    <td>{lrus.unitType}</td>
                    <td>
                      <button
                        value={lrus.ID}
                        className="btn btn-danger mx-1"
                        onClick={handleRcrdClick}
                        data-bs-toggle="modal"
                        data-bs-target="#exampleModal"
                      >
                        Delete
                      </button>
                      <div className="vr mx-2"></div>
                      <button onClick={(e) => { handleLruClick(e) }} name={lrus.lruName} value={lrus.lruSno} className="btn btn-warning mx-1">
                        Open Database
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
              <h1 className="p-1">Delete This Record?</h1>
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
                onClick={() => {
                  handleModalRequests();
                }}
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
};

export default ProjectWiseDB;
