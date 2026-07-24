import { Route, Routes } from "react-router-dom";
import { CompatibilityShellRoute } from "./CompatibilityShellRoute";

export function AppRouter() {
  return (
    <Routes>
      <Route path="*" element={<CompatibilityShellRoute />} />
    </Routes>
  );
}
