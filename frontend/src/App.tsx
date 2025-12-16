import { RouterProvider } from "react-router-dom";
import { router } from "./routes/router";
import EnvironmentBadge from "./components/EnvironmentBadge";

export default function App() {
  return (
    <>
      <EnvironmentBadge />
      <RouterProvider router={router} />
    </>
  );
}
