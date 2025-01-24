import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Home from './components/Home';
import Navbar from './components/Navbar';
import Error from './components/Error';
import Login from './components/Login';
import Register from './components/Register';
import Admin from './components/Admin';
import ProjectWiseDB from './pages/ProjectWiseDB';
import Addlru from './pages/Addlru';
import Gatepass from './pages/Gatepass';
import ViewGatePass from './pages/ViewGatePass';
import AddDocs from './pages/AddDocs';
import ViewDocs from './pages/ViewDocs';
import AI from './pages/AI';
import UpdateHistoryCard from './pages/UpdateHistoryCard';
import ViewHistoryCard from './pages/ViewHistoryCard';
import ViewRCMA from './pages/ViewRCMA';
import Viewlrus from './pages/Viewlrus';
import AddRCMA from './pages/AddRCMA';
import LrufullDB from './pages/LrufullDB';
import Addreport from './pages/Addreport';
import Viewreports from './pages/Viewreports';
import Addclearance from './pages/Addclearance';
import Viewclearance from './pages/Viewclearance';
import LRUWiseDB from './pages/LRUWiseDB';
import FullDB from './pages/FullDB';


function App() {
  const [isAuth, setIsAuth] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selProj, setSelProj] = useState("");

  useEffect(() => {
    // Retrieve user data from sessionStorage
    const savedUser = sessionStorage.getItem('user');
    const savedProj = sessionStorage.getItem("projName");
    if (savedProj) {
      try {
        if (typeof savedProj === 'string' && savedProj !== 'undefined') {
          setSelProj(savedProj)
        }
      } catch (error) {
        console.error("Failed to fetch saved project:", error)
      }
    }
    if (savedUser) {
      try {
        // Check if savedUser is a string and not 'undefined'
        if (typeof savedUser === 'string' && savedUser !== 'undefined') {
          const user = JSON.parse(savedUser);
          setIsAuth(true);
          if (user.accessLevel === "ADMIN") {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        }
      } catch (error) {
        console.error('Failed to parse user data:', error);
      }
    }
  }, []);

  const handleLogin = (userData) => {
    sessionStorage.setItem('user', JSON.stringify(userData));
    setIsAuth(true);
    if (userData.accessLevel === "ADMIN") {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  };

  const handleSelectedProj = (SeleProject) => {
    setSelProj(SeleProject)
  }

  useEffect(() => {
    sessionStorage.setItem("projName", selProj)
  }, [selProj])

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    setIsAuth(false);
    setIsAdmin(false);
  };

  return (
    <>
      <BrowserRouter>
        <Navbar isAuth={isAuth} isAdmin={isAdmin} onLogout={handleLogout} />
        <Routes>
          <Route exact path='/' element={<Home isAuth={isAuth} handleSelectedProj={handleSelectedProj} />} />
          <Route exact path='/login' element={<Login onLogin={handleLogin} onAdmin={setIsAdmin} isAuth={isAuth} />} />
          <Route exact path='/register' element={<Register />} />
          <Route exact path='*' element={<Error />} />
          {
            isAuth && (<><Route exact path='/admin' element={<Admin isAdmin={isAdmin} />} />
              <Route exact path='/completedb' element={<FullDB />} />
              <Route exact path='/projectwisedb' element={<ProjectWiseDB projName={selProj} />} />
              <Route exact path='/addlru' element={<Addlru />} />
              <Route exact path='/addgatepass' element={<Gatepass />} />
              <Route exact path='/viewgatepass' element={<ViewGatePass />} />
              <Route exact path='/adddocs' element={<AddDocs />} />
              <Route exact path='/addrcma' element={<AddRCMA />} />
              <Route exact path='/addreport' element={<Addreport />} />
              <Route exact path='/addclearance' element={<Addclearance />} />
              <Route exact path='/viewreports' element={<Viewreports />} />
              <Route exact path='/viewrcma' element={<ViewRCMA />} />
              <Route exact path='/viewlrus' element={<Viewlrus />} />
              <Route exact path='/viewdocs' element={<ViewDocs />} />
              <Route exact path='/viewclearance' element={<Viewclearance />} />
              <Route exact path='/updatehistory' element={<UpdateHistoryCard />} />
              <Route exact path='/viewhistory' element={<ViewHistoryCard />} />
              <Route exact path='/lrufulldb' element={<LrufullDB />} />
              <Route exact path='/lruwisedb' element={<LRUWiseDB />} />
              <Route exact path='/chatbot' element={<AI />} />
            </>)
          }

        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
