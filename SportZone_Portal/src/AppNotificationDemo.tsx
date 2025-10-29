import React from "react";
import Swal from "sweetalert2";
import { useNotificationHub } from "./hooks/useNotificationHub";

export default function AppNotificationDemo() {
  useNotificationHub((msg) => {
    Swal.fire({
      icon: "info",
      title: "Thông báo mới",
      text: msg,
      toast: true,
      position: "top-end",
      timer: 4000,
      showConfirmButton: false,
    });
  });
  return null;
}
