import React, { useState } from "react";
import { useDrop } from "react-dnd";
import { Modal, Button, Form } from "react-bootstrap"; // Added Form
import { FaTimes, FaCalendarAlt, FaEdit } from "react-icons/fa"; // Added icons
import DatePicker from "react-datepicker"; // Added DatePicker
import "react-datepicker/dist/react-datepicker.css"; // Added DatePicker CSS

const ItemTypes = { TRANSACTION: "transaction" };

const Day = ({ date, transactions, addTransaction, removeTransactionFromDate, updateTransaction }) => {
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
  const [showChangeDateModal, setShowChangeDateModal] = useState(false); // Added state for Change Date modal
  const [selectedTransaction, setSelectedTransaction] = useState(null); // Added state for selected transaction
  const [newDate, setNewDate] = useState(new Date()); // Added state for new date
  const [showEditModal, setShowEditModal] = useState(false); // Added state for Edit Transaction modal
  const [editTransactionName, setEditTransactionName] = useState(""); // Added state for editing transaction name
  const [editTransactionAmount, setEditTransactionAmount] = useState(""); // Added state for editing transaction amount

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

  const handleChangeDateClick = (transaction, e) => {
    e.stopPropagation();
    setSelectedTransaction(transaction);
    setShowChangeDateModal(true);
  };

  const handleChangeDateConfirm = () => {
    addTransaction(newDate, selectedTransaction);
    removeTransactionFromDate(selectedTransaction);
    setShowChangeDateModal(false);
    setSelectedTransaction(null);
  };

  const handleChangeDateCancel = () => {
    setShowChangeDateModal(false);
    setSelectedTransaction(null);
  };

  const handleEditClick = (transaction, e) => {
    e.stopPropagation();
    setSelectedTransaction(transaction);
    setEditTransactionName(transaction.name);
    setEditTransactionAmount(transaction.amount);
    setShowEditModal(true);
  };

  const handleEditConfirm = () => {
    updateTransaction(selectedTransaction, { name: editTransactionName, amount: editTransactionAmount });
    setShowEditModal(false);
    setSelectedTransaction(null);
  };

  const handleEditCancel = () => {
    setShowEditModal(false);
    setSelectedTransaction(null);
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
            <div className="position-absolute top-0 start-0 end-0 m-1 p-1 d-flex justify-content-between align-items-center" style={{ background: "rgba(255, 255, 255, 0.8)" }}>
              <FaCalendarAlt
                style={{ cursor: "pointer" }}
                onClick={(e) => handleChangeDateClick(t, e)}
              />
              <FaEdit
                style={{ cursor: "pointer" }}
                onClick={(e) => handleEditClick(t, e)}
              />
              <FaTimes
                style={{ cursor: "pointer" }}
                onClick={(e) => handleRemoveClick(t, e)}
              />
            </div>
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
      <Modal show={showChangeDateModal} onHide={handleChangeDateCancel}>
        <Modal.Header closeButton>
          <Modal.Title>Change Date</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <DatePicker selected={newDate} onChange={(date) => setNewDate(date)} className="form-control" />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleChangeDateCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleChangeDateConfirm}>
            Change Date
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showEditModal} onHide={handleEditCancel}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Transaction</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Transaction Name</Form.Label>
            <Form.Control
              type="text"
              value={editTransactionName}
              onChange={(e) => setEditTransactionName(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Amount</Form.Label>
            <Form.Control
              type="number"
              value={editTransactionAmount}
              onChange={(e) => setEditTransactionAmount(Number(e.target.value))}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleEditCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleEditConfirm}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Day;