import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

const ViewGatePass = () => {
  const [gatePasses, setGatePasses] = useState([]);
  const [iName, setIName] = useState("");
  const [iSno, setISno] = useState("");
  const [fromAdd, setFromAdd] = useState("");
  const [toAdd, setToAdd] = useState("");
  const [reason, setReason] = useState("");
  const [gPassDate, setGPassDate] = useState("");
  const [gPassSts, setGPassSts] = useState("CLOSED");
  const [gPassID, setGPassID] = useState("");

  const handleStsChange = async () => {
    const sts = gPassSts;
    const id = gPassID;
    try {
      // Post request to backend
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_ADDRESS}/updategatepasssts`,
        { sts, id }
      );
      if (response.data.success) {
        alert("Gate pass Updated successfully!");
      } else {
        alert("Failed to Update gate pass");
      }
    } catch (error) {
      console.error("Error Updating gate pass:", error);
      alert("Error Updating gate pass");
    }
    fetchGatePasses();
  };

  const fetchGatePasses = () => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_ADDRESS}/gatepass`)
      .then((response) => {
        setGatePasses(response.data.data);
      })
      .catch((error) => {
        console.error("There was an error fetching the Active users!", error);
      });
  };

  const openGatePass = (id) => {
    const fileUrl = `${
      import.meta.env.VITE_BACKEND_ADDRESS
    }/open-gatepass/${id}`;
    window.open(fileUrl, "_blank"); // Opens the file in a new tab or downloads it
  };

  useEffect(() => {
    fetchGatePasses();
  }, []);

  const filteredRecords = gatePasses.filter((record) => {
    const matchItemName =
      !iName || record.itemName.toLowerCase().includes(iName.toLowerCase());
    const matchItemSNo = !iSno || record.itemSno.includes(iSno.trim());
    const matchFromAdd =
      !fromAdd ||
      record.fromAddress.toLowerCase().includes(fromAdd.toLowerCase());
    const matchToAdd =
      !toAdd || record.toAddress.toLowerCase().includes(toAdd.toLowerCase());
    const matchReason =
      !reason || record.Reason.toLowerCase().includes(reason.toLowerCase());
    const matchDate = !gPassDate || record.date === gPassDate;

    return (
      matchItemName &&
      matchItemSNo &&
      matchFromAdd &&
      matchToAdd &&
      matchReason &&
      matchDate
    );
  });

  return (
    <>
      <div className="container text-center">
        <h1 className="p-1 text-secondary text-opacity-50">
          Gate Pass Database
        </h1>
        <div className="justify-content-center container hstack gap-3 bg-dark-subtle shadow p-2 text-center rounded-pill">
          <input
            value={iName}
            onChange={(e) => setIName(e.target.value)}
            type="text"
            placeholder="Item Name"
          />
          <input
            value={iSno}
            onChange={(e) => setISno(e.target.value)}
            type="text"
            placeholder="Item Serial No."
          />
          <input
            value={fromAdd}
            onChange={(e) => setFromAdd(e.target.value)}
            type="text"
            placeholder="From"
          />
          <input
            value={toAdd}
            onChange={(e) => setToAdd(e.target.value)}
            type="text"
            placeholder="To"
          />
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            type="text"
            placeholder="Reason"
          />
          <input
            value={gPassDate}
            onChange={(e) => setGPassDate(e.target.value)}
            type="date"
            placeholder="Date"
          />
        </div>
      </div>
      <div className="container bg-secondary-subtle my-2 rounded-4 table-responsive scrollable-table-lg text-center">
        {filteredRecords.length === 0 ? (
          <h2 className="text-center text-secondary text-opacity-25 p-1">
            No GatePass available
          </h2>
        ) : (
          <table className="table table-striped table-secondary my-4">
            <thead className="thead-dark">
              <tr>
                <th>Item Name</th>
                <th>Item SI. No</th>
                <th>From</th>
                <th>To</th>
                <th>Purpose</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((gPass) => (
                <tr key={gPass.ID}>
                  <td>{gPass.itemName}</td>
                  <td>{gPass.itemSno}</td>
                  <td>{gPass.fromAddress}</td>
                  <td>{gPass.toAddress}</td>
                  <td>{gPass.Reason}</td>
                  <td>{gPass.date}</td>
                  <td
                    className={
                      gPass.status === "CLOSED"
                        ? "text-success"
                        : "text-warning"
                    }
                  >
                    {" "}
                    <strong> {gPass.status}</strong>
                  </td>
                  <td>
                    <button
                      onClick={() => openGatePass(gPass.ID)}
                      className="btn btn-outline-success btn-sm"
                    >
                      Open Gate Pass
                    </button>
                    <div className="vr mx-2"></div>
                    <button
                      onClick={() => setGPassID(gPass.ID)}
                      className="btn btn-sm btn-outline-secondary"
                      data-bs-toggle="modal"
                      data-bs-target="#exampleModal"
                    >
                      Change Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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
                Change Gate Pass Status
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body text-center">
              <div className="form-check">
                <input
                  onClick={() => {
                    setGPassSts("OPEN");
                  }}
                  className="form-check-input"
                  type="radio"
                  name="flexRadioDefault"
                  id="flexRadioDefault1"
                  value="OPEN"
                />
                <label
                  className="btn form-check-label"
                  htmlFor="flexRadioDefault1"
                >
                  OPEN
                </label>
              </div>
              <div className="form-check">
                <input
                  onClick={() => {
                    setGPassSts("CLOSED");
                  }}
                  className="form-check-input"
                  type="radio"
                  name="flexRadioDefault"
                  id="flexRadioDefault2"
                  value="CLOSED"
                  defaultChecked
                />
                <label
                  className="btn form-check-label"
                  htmlFor="flexRadioDefault2"
                >
                  CLOSED
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
                onClick={handleStsChange}
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

export default ViewGatePass;
