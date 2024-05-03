/**
 * @fileoverview App.js
 * Main entry point of the application.
 * @author Mariakatia Santangelo
 * @date   15-04-2024
 */

/******** Import Section  *******************************************************/
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from './pages/LoginPage.jsx';
import NotFound from './pages/NotFound.jsx';
import Unauthorized from './pages/Unauthorized.jsx'
import LoginSuccess from './pages/LoginSuccess.jsx';
import SignupForm from "./components/SignupForm/SignupForm.jsx";
import UserInfo from "./components/UserInfo/UserInfo.jsx";
import ProtectedRoutes from "./middleware/ProtectedRoutes.js";
import { TEACHER_CATEGORY_ID, STUDENT_CATEGORY_ID, ADMIN_CATEGORY_ID } from "./utils/info.js";
import Homepage from "./pages/Homepage.jsx";
import SelectedClass from "./pages/SelectedClass.jsx";

/**
 * App
 * This file represents the main entry point of the application.
 * It acts as a gateway, as it defines the main routes of the application
 * and allows navigating to them.
 * @returns The following routes:
 * - route to the log in page of the application (/login)
 * - route to the successful log in page of the application (/success)
 * - route to the home page of the application (/home)
 * - route to the default page shown when a bad URL is entered (404 - not found)
 */
function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route exact path = '/login' element = {<LoginPage /> } />
          <Route path = '*' element = {<NotFound />} /> 
          <Route path = '/unauthorized' element = {<Unauthorized /> } />
          <Route element = { <ProtectedRoutes allowedRoles={[TEACHER_CATEGORY_ID, STUDENT_CATEGORY_ID]}/>} >
            <Route path = '/success' element = {<LoginSuccess /> } />
            <Route path = '/userDetail' element = {<UserInfo /> } />
            <Route path = '/homepage' element = {<Homepage />} />
            <Route path = '/classDetails/:id' element = {<SelectedClass />} />
          </Route>
          <Route element = { <ProtectedRoutes allowedRoles={[ADMIN_CATEGORY_ID]}/>} >
            <Route path = '/signup' element = {<SignupForm /> } />
          </Route>          
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
