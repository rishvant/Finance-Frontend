import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard, Auth } from "@/layouts";
import { Purchase } from "./pages/purchase/Purchase";
import { Sales } from "./pages/sales/Sales";

function App() {
  return (
    <Routes>
      <Route path="/dashboard/*" element={<Dashboard />} />
      <Route path="/auth/*" element={<Auth />} />
      <Route path="*" element={<Navigate to="/dashboard/home" replace />} />
      <Route path="/dashboard/" element={<Dashboard />}>
        <Route
          path="/dashboard/purchase/create"
          element={<Purchase />}
        />
        <Route
          path="/dashboard/sales/create"
          element={<Sales />}
        />
      </Route>
    </Routes>
  );
}

export default App;
