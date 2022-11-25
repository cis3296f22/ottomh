import React from "react";

function ShareModal({ modalVisible }) {
  return (
    <>
      <div className={`${"share-modal"} ${modalVisible ? "opened" : "closed"}`}>
        <section className="modal-header">
        </section>
      
      </div>
    </>
  );
}

export default ShareModal;