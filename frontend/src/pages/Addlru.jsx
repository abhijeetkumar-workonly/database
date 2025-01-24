import React, { useEffect, useState, useCallback } from "react";
import CustomModal from "./CustomModal";
import trash from "../res/bootstrap-icons-1.11.3/trash.svg";
import axios from "axios";

const Addlru = () => {
  const [listedLru, setListedLru] = useState([]);
  const [modalOn, setModalOn] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false);

  const fetchLruData = useCallback(() => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_ADDRESS}/listedlru`)
      .then((response) => {
        setListedLru(response.data.data);
        setIsUpdated(false); // Reset update flag
      })
      .catch((error) => {
        console.error("There was an error fetching the Active LRUs!", error);
      });
  }, []);

  const handleModalData = useCallback((sts, categ, name, img) => {
    setModalOn(sts);
    if (!name) return;

    const formData = new FormData();
    formData.append("category", categ);
    formData.append("lruName", name);
    formData.append("lruImage", img);

    axios
      .post(`${import.meta.env.VITE_BACKEND_ADDRESS}/newlru`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        alert("LRU added successfully");
        setIsUpdated(true);
      })
      .catch((error) => {
        alert(error.response.data.message);
      });
  }, []);

  useEffect(() => {
    fetchLruData(); // Initial fetch
  }, [fetchLruData]);

  useEffect(() => {
    if (isUpdated) {
      fetchLruData(); // Refetch data when updated
    }
  }, [isUpdated, fetchLruData]);

  const handleDrag = (e, item) => {
    e.dataTransfer.setData("buttonIndex", item);
  };

  const handleDrop = (e) => {
    e.preventDefault();

    const id = e.dataTransfer.getData("buttonIndex");
    axios
      .delete(`${import.meta.env.VITE_BACKEND_ADDRESS}/deletelruname/${id}`)
      .then((response) => {
        if (response.data.success) {
          setListedLru((preLrus) => preLrus.filter((lru) => lru.ID !== id));
          setIsUpdated(true); // Trigger refresh
        } else {
          alert("Failed to delete project");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("There was an error deleting the project");
      });
  };

  return (
    <>
      {" "}
      <div className="container rounded-4 p-3 bg-dark-subtle shadow-lg text-center">
        <div className="row ">
          <div className="col-sm-11">
            <div className="container">
              <h1 className="p-1 text-secondary">
                Add New LRU  {" "}
                <button
                  className="btn btn-outline-primary btn-lg"
                  onClick={() => setModalOn(!modalOn)}
                >
                  +
                </button>
              </h1>
            </div>
            <div className="container">
              {modalOn && <CustomModal handleModalData={handleModalData} />}
            </div>
            <div className="text-center p-2 d-flex flex-wrap my-2">
              {listedLru.length > 0 ? (
                listedLru.map((lru) =>
                  // Check if lru and lruName are defined
                  lru && lru.lruName ? (
                    <div
                      name={lru.lruName}
                      draggable={true}
                      onDragStart={(e) => handleDrag(e, lru.ID)}
                      className="row mx-auto my-2 bg-dark-subtle rounded border border-secondary"
                      key={lru.ID}
                    >
                      <img
                        src={`${import.meta.env.VITE_BACKEND_ADDRESS}/uploads/${
                          lru.lruImage
                        }`}
                        className="object-fit-cover border rounded"
                        alt={lru.lruName}
                      />
                      <p >
                        <strong>{lru.lruName} </strong>{" "}
                      </p>
                    </div>
                  ) : (
                    <div key={lru?.ID || Math.random()}>Invalid LRU Data</div>
                  )
                )
              ) : (
                <div className="container">
                  <p className="text-center">No LRUs available</p>
                </div>
              )}
            </div>
          </div>
          <div
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
            }}
            className=" text-center col-sm-1 border border-danger container-fluid bg-danger p-3 rounded"
          >
            <div>
              <img src={trash} alt="delete Logo" />{" "}
              <span className="text-dark">
                {" "}
                Drag n Drop LRUs here to delete
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Addlru;
