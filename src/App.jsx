// App.jsx
import React from "react";
import UploadPage from "./UploadPage";
import DownloadPage from "./DownloadPage";

function getParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

export default function App() {
  const id = getParam("id");
  if (id) {
    return <DownloadPage fileId={id} />;
  }
  return <UploadPage />;
}
