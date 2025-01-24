import axios from "axios";
import React, { useEffect, useRef, useState } from "react";

const AddRCMA = () => {
  const [lrus, setLrus] = useState([]);
  const [seleLru, setSeleLru] = useState("");
  const [rcmaFile, setRcmaFile] = useState(null);
  const partNoRef = useRef(null);

  const handleRcmaData = async () => {
    const lruName = seleLru;
    const partNo = partNoRef.current.value;
    const rcmaDoc = rcmaFile;

    const data = new FormData();
    data.append("lruName", lruName);
    data.append("partNo", partNo);
    data.append("rcmaDoc", rcmaDoc);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_ADDRESS}/newrcma`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data", // Important to let the server know it's form data
          },
        }
      );
      if (response.data.success) {
        alert("RCMA added successfully!");
      } else {
        alert("Failed to Add RCMA");
      }
    } catch (error) {
      console.error("Error uploading RCMA:", error);
      alert("Error uploading RCMA");
    }
    setSeleLru("")
    setRcmaFile(undefined)
    document.getElementById("rcmaDoc").value=null
    partNoRef.current.value=""
  };

  const fetchLruData = () => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_ADDRESS}/listedlru`)
      .then((response) => {
        setLrus(response.data.data);
      })
      .catch((error) => {
        console.error("There was an error fetching the Active LRUs!", error);
      });
  };

  useEffect(() => {
    fetchLruData();
  }, []);

  return (
    <>
      <div className="container p-3 text-center bg-secondary-subtle rounded-4 shadow-lg">
        <h3 className="p-1 text-secondary text-opacity-50">Add RCMA Letters</h3>
        <div className="container hstack mx-auto flex-wrap my-auto">
          {lrus.map((lru) => {
            return (
              <div
                key={lru.ID}
                className="mx-2 my-2 border border-primary-subtle vstack p-1"
              >
                <strong className=" p-3 text-primary text-opacity-50">
                  {lru.lruName}
                </strong>
                <strong className= {lru.rcma==="Available"?("p-1 text-success"):("p-1 text-secondary text-opacity-50")} >
                  RCMA: {lru.rcma}
                </strong>
                <button
                  value={lru.lruName}
                  onClick={(e) => {
                    setSeleLru(e.target.value);
                  }}
                  disabled={lru.rcma==="Available"}
                  className="btn btn-success"
                  data-bs-toggle="modal"
                  data-bs-target="#exampleModal"
                >
                  Add RCMA
                </button>
              </div>
            );
          })}
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
                Add RCMA Letter
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body text-center">
            <h3 className="p-1 text-secondary">
              {seleLru}
            </h3>
              <input
                ref={partNoRef}
                type="text"
                className="form-control my-2"
                placeholder="Unit Part Number"
              />
              <input onChange={(e)=>{setRcmaFile(e.target.files[0])}} type="file" id="rcmaDoc" className="form-control my-2" />
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
                onClick={handleRcmaData}
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

export default AddRCMA;
