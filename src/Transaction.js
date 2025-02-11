import { useState, useEffect } from "react";
import { useDrag } from "react-dnd";
import { Modal, Button } from "react-bootstrap";
import { FaEdit, FaPalette, FaTimes, FaCalendarAlt } from "react-icons/fa";
import { SketchPicker } from "react-color";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { isWithinInterval } from "date-fns";

const ItemTypes = { TRANSACTION: "transaction" };

const Transaction = ({ transaction, onUpdate, onRemove, onAddToDate, startDate, endDate }) => {
  const [name, setName] = useState(transaction.name);
  const [amount, setAmount] = useState(transaction.amount);
  const [color, setColor] = useState(transaction.color || "#007bff");
  const [dragItem, setDragItem] = useState({ ...transaction, name, amount, color });
  const [showModal, setShowModal] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    setDragItem({ ...transaction, name, amount, color });
  }, [name, amount, color, transaction]);

  const handleChangeName = (e) => {
    const newName = e.target.value;
    setName(newName);
    onUpdate({ ...transaction, name: newName, amount, color });
  };

  const handleChangeAmount = (e) => {
    const newAmount = Number(e.target.value);
    setAmount(newAmount);
    onUpdate({ ...transaction, name, amount: newAmount, color });
  };

  const handleChangeColor = (color) => {
    setColor(color.hex);
    onUpdate({ ...transaction, name, amount, color: color.hex });
  };

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const handleSave = () => {
    onUpdate({ ...transaction, name, amount, color });
    handleCloseModal();
  };

  const handleRemove = () => {
    onRemove(transaction);
    handleCloseModal();
  };

  const handleShowDateModal = () => setShowDateModal(true);
  const handleCloseDateModal = () => setShowDateModal(false);
  const handleAddToDate = () => {
    onAddToDate(selectedDate, transaction);
    handleCloseDateModal();
  };

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.TRANSACTION,
    item: dragItem,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [dragItem]);

  return (
    <div
      ref={drag}
      className={`d-flex p-2 mb-2 text-white rounded cursor-pointer ${isDragging ? "opacity-50" : ""}`}
      style={{ backgroundColor: color, minWidth: "150px", minHeight: "100px", flexDirection: "column", justifyContent: "space-between" }}
    >
      <span>{transaction.name} ({amount > 0 ? "+" : ""}${amount})</span>
      <div className="d-flex justify-content-between mt-2">
        <FaCalendarAlt onClick={handleShowDateModal} style={{ cursor: "pointer" }} />
        <FaEdit onClick={handleShowModal} style={{ cursor: "pointer" }} />
      </div>
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Transaction</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input
            type="text"
            value={name}
            onChange={handleChangeName}
            className="form-control mb-3"
          />
          <input
            type="number"
            value={amount}
            onChange={handleChangeAmount}
            className="form-control mb-3"
          />
          <div className="d-flex align-items-center">
            <Button variant="outline-secondary" onClick={() => setShowColorPicker(!showColorPicker)}>
              {showColorPicker ? <FaTimes /> : <FaPalette />}
            </Button>
            {showColorPicker && (
              <div className="ms-3">
                <SketchPicker
                  color={color}
                  onChangeComplete={handleChangeColor}
                />
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={handleRemove}>
            Remove
          </Button>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showDateModal} onHide={handleCloseDateModal}>
        <Modal.Header closeButton>
          <Modal.Title>Select Date</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            className="form-control"
            filterDate={(date) => isWithinInterval(date, { start: startDate, end: endDate })}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDateModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleAddToDate}>
            Add to Date
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Transaction;