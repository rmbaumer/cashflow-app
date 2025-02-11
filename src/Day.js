import React, { useState } from "react";
import { useDrop } from "react-dnd";
import { Modal, Button } from "react-bootstrap";
import { FaTimes } from "react-icons/fa";

const ItemTypes = { TRANSACTION: "transaction" };

const Day = ({ date, transactions, addTransaction, removeTransactionFromDate }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.TRANSACTION,
    drop: (item) => addTransaction(date, item),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [transactionToRemove, setTransactionToRemove] = useState(null);
  const [hoveredTransaction, setHoveredTransaction] = useState(null);

  const handleRemoveClick = (transaction, e) => {
    e.stopPropagation();
    setTransactionToRemove(transaction);
    setShowRemoveModal(true);
  };

  const handleRemoveConfirm = () => {
    removeTransactionFromDate(transactionToRemove);
    setShowRemoveModal(false);
    setTransactionToRemove(null);
  };

  const handleRemoveCancel = () => {
    setShowRemoveModal(false);
    setTransactionToRemove(null);
  };

  return (
    <div
      ref={drop}
      className={`p-3 border rounded h-100 ${isOver ? "bg-success bg-opacity-25" : "bg-light"}`}
    >
      <div className="fw-bold">{date}</div>
      {transactions.map((t, index) => (
        <div
          key={index}
          className={`border p-2 my-2 bg-white position-relative ${t.amount > 0 ? "text-success" : "text-danger"}`}
          onMouseEnter={() => setHoveredTransaction(t)}
          onMouseLeave={() => setHoveredTransaction(null)}
          onTouchStart={(e) => handleRemoveClick(t, e)}
          onContextMenu={(e) => {
            e.preventDefault();
            handleRemoveClick(t, e);
          }}
        >
          {t.name} ({t.amount > 0 ? "+" : ""}${t.amount})
          {hoveredTransaction === t && (
            <FaTimes
              className="position-absolute top-0 end-0 m-1"
              style={{ cursor: "pointer" }}
              onClick={(e) => handleRemoveClick(t, e)}
            />
          )}
        </div>
      ))}
      <Modal show={showRemoveModal} onHide={handleRemoveCancel}>
        <Modal.Header closeButton>
          <Modal.Title>Remove Transaction</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to remove this transaction?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleRemoveCancel}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleRemoveConfirm}>
            Remove
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Day;