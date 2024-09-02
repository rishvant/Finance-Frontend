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
import { OrderTable } from "./pages/orders/OrderHistory";
import WarehouseMaster from "./pages/dashboard/Master";
import InventoryManagement from "./pages/inventory/InventoryManagement";
import { MdInventory, MdDashboard } from "react-icons/md";
import SignIn from "./pages/auth/sign-in";
import { SignUp } from "./pages/auth";
import { Booking } from "./pages/booking/Booking";
import { BiSolidBook, BiSolidPurchaseTag } from "react-icons/bi";
import { MdAnalytics } from "react-icons/md";
import { TbReceiptRupee } from "react-icons/tb";
import { Purchase } from "./pages/purchase/Purchase";
import PurchaseHistory from "./pages/purchase/PurchaseHistory";

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
        icon: <MdAnalytics {...icon} />,
        name: "analytics",
        path: "/analytics",
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
        icon: <BiSolidBook {...icon} />,
        name: "bookings",
        path: "/bookings",
        element: <Booking />,
      },
      {
        icon: <BiSolidPurchaseTag {...icon} />,
        name: "purchase",
        path: "/purchase",
        element: <PurchaseHistory />,
      },
      {
        icon: <TbReceiptRupee {...icon} />,
        name: "sell",
        path: "/sell",
        element: <Booking />,
      },
      // {
      //   icon: <UserCircleIcon {...icon} />,
      //   name: "profile",
      //   path: "/profile",
      //   element: <Profile />,
      // },
      // {
      //   icon: <TableCellsIcon {...icon} />,
      //   name: "tables",
      //   path: "/tables",
      //   element: <Tables />,
      // },
      // {
      //   icon: <InformationCircleIcon {...icon} />,
      //   name: "notifications",
      //   path: "/notifications",
      //   element: <Notifications />,
      // },
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
      // {
      //   icon: <RectangleStackIcon {...icon} />,
      //   name: "sign up",
      //   path: "/sign-up",
      //   element: <SignUp />,
      // },
    ],
  },
];

export default routes;
