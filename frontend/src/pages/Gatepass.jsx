import React, { useEffect, useState, useRef } from 'react'
import axios from 'axios'

const Gatepass = () => {

    const [lruRecords, setLruRecords] = useState([])
    const [lru, setLru] = useState([])
    const [projects, setProjects] = useState([])

    const itemName = useRef(null)
    const itemSno = useRef(null)

    const fromAddress = useRef(null)
    const toAddress = useRef(null)
    const reasonRef = useRef(null)
    const gatePassDate = useRef(null)
    const [gatePassFile, setGatePassFile] = useState(null)


    const [passItemName, setPassItemName] = useState('')
    const [passItemSno, setPassItemSno] = useState('')
    const [itemAvailable, setItemAvailable] = useState(true)

    //for filteration
    const [seleProject, setSeleProject] = useState('')
    const [serialNumber, setSerialNumber] = useState('')
    const [categ, setCateg] = useState('')
    const [seleLru, setSeleLru] = useState('')


    const returnFunc=()=>{
        return
    }

    const handleLruGatePassClick = (e) => {
        setItemAvailable(true)
        const iName = e.target.name
        const iSno = e.target.value
        setPassItemName(iName)
        setPassItemSno(iSno)
    }

    const handleMiscGatePass = (e) => {
        const iName = itemName.current.value
        if (iName === '') {
            setItemAvailable(false)
        } else {
            setItemAvailable(true)
        }
        const iSno = itemSno.current.value
        setPassItemName(iName)
        setPassItemSno(iSno)
    }

    const handleGatePassModal = async() => {
        const iName = passItemName; // Item name
        const iSno = passItemSno; // Item serial number
        const fromAdd = fromAddress.current.value; // From address
        const toAdd = toAddress.current.value; // To address
        const reason = reasonRef.current.value; // Reason for gate pass
        const date = gatePassDate.current.value; // Date for gate pass
        const gatePass = gatePassFile; // Gate pass file
    
        // Check if any of the required fields are empty
        if(fromAdd === '' || toAdd === '' || reason === '' || date === '' || !gatePass) {
            alert("All Fields are required!");
            return;
        }
    
               // Create a FormData object to hold form values
               const data = new FormData();
               data.append('itemName', iName);
               data.append('itemSno', iSno);
               data.append('fromAddress', fromAdd);
               data.append('toAddress', toAdd);
               data.append('reason', reason);
               data.append('date', date);
               data.append('gatePass', gatePass); // Append the file
       
               try {
                   // Post request to backend
                   const response = await axios.post(`${import.meta.env.VITE_BACKEND_ADDRESS}/newgatepass`, data, {
                       headers: {
                           'Content-Type': 'multipart/form-data' // Important to let the server know it's form data
                       }
                   });
                   if (response.data.success) {
                       alert('Gate pass created successfully!');
                   } else {
                       alert('Failed to create gate pass');
                   }
               } catch (error) {
                   console.error('Error creating gate pass:', error);
                   alert('Error creating gate pass');
               }
    
        // Clear the form fields
        fromAddress.current.value = '';
        toAddress.current.value = '';
        reasonRef.current.value = '';
        gatePassDate.current.value = '';
        setGatePassFile(undefined); // Reset file
    
        // Optionally, you can reset the file input as well (if using input[type=file] in DOM)
        document.getElementById('inputGroupFile01').value = null; // Reset file input field visually
    };
    



    const fetchProjects = () => {
        // Fetch Active Projects data
        axios.get(`${import.meta.env.VITE_BACKEND_ADDRESS}/projectnames`)
            .then(response => {
                setProjects(response.data.data);
            })
            .catch(error => {
                console.error('Error fetching projects:', error);
            })
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
                console.error('There was an error fetching the LRUs!', error);
            });
    };

    const fetchLruRecord = () => {
        axios
            .get(`${import.meta.env.VITE_BACKEND_ADDRESS}/lrutable`)
            .then((response) => {
                setLruRecords(response.data.data);
            })
            .catch((error) => {
                console.error('There was an error fetching the LRUs!', error);
            });
    }

    useEffect(() => {
        fetchProjects();
        fetchLruRecord();
        fetchLruData();
    }, [])


    // Filter LRU records dynamically based on input values
    const filteredRecords = lruRecords.filter((record) => {
        const matchProject = !seleProject || record.projectName === seleProject
        const matchesSiNum = !serialNumber || record.lruSno.includes(serialNumber.trim());
        const matchesCategory = !categ || record.category === categ;
        const matchesLruName = !seleLru || record.lruName === seleLru;
        return matchProject && matchesSiNum && matchesCategory && matchesLruName;
    });


    return (
        <>
            <div className='container text-center'>
                <h1 className="p-1 text-secondary">
                    Add Gate Passes
                </h1>
            </div>
            <div className="text-center container p-1 shadow-lg bg-dark-subtle rounded-5 my-2">
                <h2 className="p-1 text-secondary text-opacity-50">
                    Add Gate Pass in Listed LRUs
                </h2>
                <div className="text-center p-2 justify-content-center hstack gap-3">

                    <select onChange={(e) => { setSeleProject(e.target.value) }} className="form-select-md p-2">
                        <option value="">All Projects</option>
                        {
                            projects.map(proj => {
                                return (
                                    <option value={proj.projectName} key={proj.ID}>
                                        {proj.projectName}
                                    </option>
                                )
                            })
                        }
                        <option value="Other">Other</option>

                    </select>

                    <select onChange={(e) => { setCateg(e.target.value) }} className="form-select-md p-2">
                        <option value="">All Categories</option>
                        <option value="Airborne">Airborne</option>
                        <option value="Ground">Ground</option>
                        <option value="Other">Other</option>
                    </select>

                    <select onChange={(e) => { setSeleLru(e.target.value) }} className="form-select-md p-2">
                        <option value="">All LRU</option>
                        {
                            lru.map(lrus => {
                                return (
                                    <option key={lrus.ID} value={lrus.lruName}>
                                        {lrus.lruName}
                                    </option>
                                )
                            })
                        }
                    </select>

                    <input value={serialNumber}  // Use the serialNumber state
                        onChange={(e) => setSerialNumber(e.target.value)}  // Update state on input
                        type="text" className="p-2" placeholder='Serial Number' />
                </div>
                {/* Filtered Table */}
                <div className="container rounded-5 bg-secondary-subtle mt-4 text-center">
                    <div className="table-responsive scrollable-table">
                        <h1 className="p-1 text-secondary text-opacity-25">LRUs Available</h1>
                        {filteredRecords.length === 0 ? (
                            <h2 className=" text-center text-secondary text-opacity-25 p-1">No LRUs Available</h2>
                        ) : (
                            <table className="table table-striped table-secondary my-4">
                                <thead className="thead-dark">
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
                                                <button onClick={handleLruGatePassClick} name={lrus.lruName} value={lrus.lruSno} className='btn btn-outline-success btn-sm' data-bs-toggle="modal" data-bs-target="#exampleModal">Add Gate Pass</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
            <div className="text-center container p-1 shadow-lg bg-dark-subtle rounded-5 my-2">
                <h2 className="p-1 text-secondary text-opacity-50">
                    Add Miscllaneous Gate Pass
                </h2>
                <div className="text-center p-2 justify-content-center hstack gap-3">
                    <input ref={itemName} type="text" className="form-control-lg p-2" placeholder='Item Name' />
                    <input ref={itemSno} type="text" className="form-control-md p-2" placeholder='Serial Number (Optional)' />
                    <button onClick={handleMiscGatePass} className='btn btn-outline-success p-2' data-bs-toggle="modal" data-bs-target="#exampleModal">Add Gate Pass</button>
                </div>
            </div>
            {/* <!-- Modal --> */}
            <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="exampleModalLabel">Gate Pass Details</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body text-center">
                            {itemAvailable ?
                                (<><input type="text" ref={fromAddress} className='p-1 my-2 form-control' placeholder='From (Address)' />
                                    <input type="text" ref={toAddress} className='p-1 my-2 form-control' placeholder='To (Address)' />
                                    <input type="text" ref={reasonRef} className='p-1 my-2 form-control' placeholder='Reason' />
                                    <label htmlFor="startDate">Gate Pass Date</label>
                                    <input id="startDate" ref={gatePassDate} className="form-control" type="date" />

                                    <div className="input-group my-2 mb-3">
                                        <label className="input-group-text" htmlFor="inputGroupFile01">Upload Gate Pass</label>
                                        <input type="file" onChange={(e)=>{setGatePassFile(e.target.files[0])}} className="form-control" id="inputGroupFile01" />
                                    </div></>)
                                : (
                                    <>
                                        <h1 className="p-1">
                                            Item name is required!
                                        </h1>
                                    </>
                                )}

                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" onClick={itemAvailable?handleGatePassModal:returnFunc} className="btn btn-primary" data-bs-dismiss="modal">{itemAvailable ? (<>Add Gate Pass</>) : (<>OK</>)}</button>
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}

export default Gatepass
