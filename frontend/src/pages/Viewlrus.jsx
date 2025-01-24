import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Viewlrus = () => {
  const [listedLru, setListedLru] = useState([]);
  const navigate = useNavigate()


  const handleLruClick = (e) => {
    const data = { name: e.target.value };
    navigate('/lrufulldb', {state: data})
  }

  const fetchLruData = () => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_ADDRESS}/listedlru`)
      .then((response) => {
        setListedLru(response.data.data);
      })
      .catch((error) => {
        console.error("There was an error fetching the Active LRUs!", error);
      });
  };

  useEffect(() => {
    fetchLruData();
  }, [])

  return (
    <>
      <div className="container text-center bg-secondary-subtle rounded-4 shadow-lg">
        <h3 className="p-1 text-secondary text-opacity-50">LRUs Listed</h3>
        <div className="text-center p-2 d-flex flex-wrap my-2">
          {listedLru.length > 0 ? (
            listedLru.map((lru) =>
              // Check if lru and lruName are defined
              lru && lru.lruName ? (
                <div
                  name={lru.lruName}
                  className="row mx-auto my-2 bg-dark-subtle shadow-lg rounded border border-secondary"
                  key={lru.ID}
                >
                  <img
                    src={`${import.meta.env.VITE_BACKEND_ADDRESS}/uploads/${lru.lruImage
                      }`}
                    className="object-fit-cover border rounded"
                    alt={lru.lruName}
                  />
                  <button value={lru.lruName} onClick={(e) => { handleLruClick(e) }} className="btn"> {lru.lruName}
                  </button>
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
    </>
  );
};

export default Viewlrus;
