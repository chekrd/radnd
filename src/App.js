import React from "react";
import { createPortal } from "react-dom";
import { useDrag, useDrop, DragPreview } from "react-aria";

function swapArrayValues(arr, index1, index2) {
  const arrCopy = [...arr];
  const temp = arrCopy[index1];
  arrCopy[index1] = arrCopy[index2];
  arrCopy[index2] = temp;

  return arrCopy;
}

export const App = () => {
  const [items, setItems] = React.useState([
    { id: 1 },
    { id: 2 },
    { id: 3 },
    { id: 4 }
  ]);
  const [draggedId, setDraggedId] = React.useState(null);

  const onDropEnter = (draggedId, overId) => {
    setItems((s) => {
      const draggedIndex = s.findIndex((i) => i.id === draggedId);
      const overIndex = s.findIndex((i) => i.id === overId);
      return draggedIndex > -1 && overIndex > -1
        ? swapArrayValues(s, draggedIndex, overIndex)
        : s;
    });
  };

  return (
    <Container>
      {items.map((item) => (
        <Droppable
          key={item.id}
          draggedId={draggedId}
          droppableId={item.id}
          onDropEnter={onDropEnter}
          renderDroppable={({ droppableRef, dropProps }) => (
            <div ref={droppableRef} {...dropProps}>
              <Draggable
                itemId={item.id}
                setDraggedId={setDraggedId}
                renderDraggable={({ dragProps, isDragging }) => {
                  return draggedId === item.id ? (
                    <PlaceholderCard>{item.id}</PlaceholderCard>
                  ) : (
                    <Card>
                      {item.id}
                      <button {...dragProps}>Drag</button>
                    </Card>
                  );
                }}
                renderPreview={() => (
                  <Card>
                    {item.id}
                    <button>Drag</button>
                  </Card>
                )}
              />
            </div>
          )}
        />
      ))}
    </Container>
  );
};

const Container = ({ children }) => {
  return <div className="container">{children}</div>;
};

const Draggable = ({
  itemId,
  setDraggedId,
  renderPreview,
  renderDraggable
}) => {
  const previewRef = React.useRef(null);
  const draggableRootRef = React.useRef(null);

  const { dragProps, isDragging } = useDrag({
    preview: previewRef,
    onDragStart: () => setDraggedId(itemId),
    onDragEnd: () => {
      console.log("end");
      setDraggedId(null);
    },
    getItems() {
      return [
        {
          type: "text/plain",
          draggedAssetId: itemId
        }
      ];
    }
  });

  const offsetWidth = draggableRootRef.current?.offsetWidth;

  return (
    <div ref={draggableRootRef}>
      {renderDraggable({ dragProps, isDragging })}
      {renderPreview &&
        createPortal(
          <DragPreview ref={previewRef}>
            {() => (
              <div
                className="drag-preview"
                style={{
                  ...(offsetWidth ? { width: `${offsetWidth}px` } : undefined)
                }}
              >
                {renderPreview()}
              </div>
            )}
          </DragPreview>,
          document.body
        )}
    </div>
  );
};

function Droppable({ draggedId, droppableId, onDropEnter, renderDroppable }) {
  const droppableRef = React.useRef(null);
  const { dropProps } = useDrop({
    ref: droppableRef,
    onDropEnter: () => onDropEnter(draggedId, droppableId)
  });

  return renderDroppable({ droppableRef, dropProps });
}

const Card = ({ children }) => {
  return <div className="card">{children}</div>;
};

const PlaceholderCard = ({ children }) => {
  return <div className="card-placeholder">{children}</div>;
};
