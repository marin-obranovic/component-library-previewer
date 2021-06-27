import { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";

export const InputModal = (props) => {
  const { show, onHide, heading = "", currentValue, onValueChange } = props;
  const [updatedValue, setUpdatedValue] = useState("");

  useEffect(() => {
    setUpdatedValue(currentValue);
  }, [currentValue]);

  const onInputValueChange = (event) => {
    setUpdatedValue(event.target.value);
  };

  const onSave = () => {
    onValueChange(updatedValue.replace(/\s+/g, "_"));
    onHide();
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">{heading}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <label>Value to update</label>
        <br />
        <input value={updatedValue} onChange={onInputValueChange} />
      </Modal.Body>
      <Modal.Footer>
        <button onClick={onSave}>Save</button>
      </Modal.Footer>
    </Modal>
  );
};
