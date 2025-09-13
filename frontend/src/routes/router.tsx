import { createBrowserRouter } from "react-router-dom";
import Protected from "./Protected";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";

export const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { element: <Protected />, children: [{ path: "/", element: <Dashboard /> }] },
  { path: "*", element: <div>Not Found</div> },
]);
