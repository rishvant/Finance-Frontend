import {
  HomeIcon,
  UserCircleIcon,
  TableCellsIcon,
  InformationCircleIcon,
  ServerStackIcon,
  RectangleStackIcon,
  ShoppingBagIcon
} from "@heroicons/react/24/solid";
import { Home, Profile, Tables, Notifications } from "@/pages/dashboard";
import { SignIn, SignUp } from "@/pages/auth";
import { OrderTable } from "./pages/orders/OrderHistory";
import WarehouseMaster from "./pages/dashboard/Master";
import InventoryManagement from "./pages/inventory/InventoryManagement";
import { MdInventory, MdDashboard } from "react-icons/md";

const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  {
    layout: "dashboard",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "home",
        path: "/home",
        element: <WarehouseMaster />,
      },
      {
        icon: <MdDashboard {...icon} />,
        name: "dashboard",
        path: "/dashboard",
        element: <Home />,
      },
      {
        icon: <MdInventory {...icon} />,
        name: "inventory",
        path: "/inventory",
        element: <InventoryManagement />,
      },
      {
        icon: <ShoppingBagIcon {...icon} />,
        name: "orders",
        path: "/orders",
        element: <OrderTable />,
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "profile",
        path: "/profile",
        element: <Profile />,
      },
      {
        icon: <TableCellsIcon {...icon} />,
        name: "tables",
        path: "/tables",
        element: <Tables />,
      },
      {
        icon: <InformationCircleIcon {...icon} />,
        name: "notifications",
        path: "/notifications",
        element: <Notifications />,
      },
    ],
  },
  {
    title: "auth pages",
    layout: "auth",
    pages: [
      {
        icon: <ServerStackIcon {...icon} />,
        name: "sign in",
        path: "/sign-in",
        element: <SignIn />,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "sign up",
        path: "/sign-up",
        element: <SignUp />,
      },
    ],
  },
];

export default routes;
