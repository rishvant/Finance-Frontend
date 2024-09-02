import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard, Auth } from "@/layouts";
import PurchaseHistory from "./pages/purchase/PurchaseHistory";
import { Purchase } from "./pages/purchase/Purchase";

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
      </Route>
    </Routes>
  );
}

export default App;
