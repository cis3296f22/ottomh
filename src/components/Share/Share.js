import React, { useState } from "react";
import ShareModal from "./ShareModal";

function Share({ label, text, title }) {
  const [showModal, setShowModal] = useState(false);

  const canonical = document.querySelector("link[rel=canonical]");
  let url = canonical ? canonical.href : document.location.href;
  const shareDetails = { url, title, text };

  const handleSharing = async () => {
    if (navigator.share) {
      try {
        await navigator
          .share(shareDetails)
          
      } catch (error) {
        alert(` error could not share, ${error}`);
      }
    } else {
      // fallback code
      setShowModal(true);
      alert(" Can not provide sharing" );
    }
  };
  return (
    <>
      <button className="sharer-button" onClick={handleSharing}>
        <span className="sharer-button-text">{label}</span>
      </button>

      <ShareModal
        shareData={shareDetails}
        modalVisible={showModal}
      />
    </>
  );
}

export default Share;