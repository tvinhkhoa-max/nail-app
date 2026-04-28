import { useState } from "react";
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  DragOverlay
} from "@dnd-kit/core"
import Layout from '#resource/layouts/Layout.js';

const hours = Array.from({ length: 10 }, (_, i) => i + 9);
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function DraggableBooking({ booking, onClick }: any) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: booking.id,
  });

  const style = {
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-lg px-2 py-1 text-xs font-medium shadow-sm bg-green-500 text-white flex items-center justify-between gap-2"
    >
      {/* Click area */}
      <span
        onClick={(e) => {
          e.stopPropagation();
          onClick(booking);
        }}
        className="cursor-pointer flex-1"
      >
        {booking.name}
      </span>

      {/* Drag handle */}
      <span
        {...listeners}
        {...attributes}
        className="cursor-move text-white/80 hover:text-white"
      >
        ⠿
      </span>
    </div>
  );
};

function DroppableSlot({ day, hour, children }: any) {
  const { setNodeRef, isOver } = useDroppable({
    id: `${day}-${hour}`,
  });

  return (
    <div
      ref={setNodeRef}
      className={`h-20 rounded-xl border border-gray-200 flex items-center justify-center relative transition-all duration-200 ${
        isOver ? "bg-blue-100" : "hover:bg-gray-50"
      }`}
    >
      {children}
    </div>
  );
}

function BookingModal({ booking, onClose, onSave, onDelete }: any) {
  if (!booking) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Edit Booking</h2>

        <div className="space-y-3">
          <input
            type="text"
            value={booking.name}
            onChange={(e) => onSave({ ...booking, name: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            placeholder="Customer name"
          />

          <select
            value={booking.status}
            onChange={(e) => onSave({ ...booking, status: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          >
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={() => onDelete(booking.id)}
            className="text-red-500 text-sm"
          >
            Delete
          </button>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1 text-sm rounded-lg border"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1 text-sm rounded-lg bg-blue-600 text-white"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface BookingProp {
  id: string,
  day: number,
  hour: number,
  name: string,
  status: string
}

export default function BookingCalendarTailGrids() {
  const [bookings, setBookings] = useState<BookingProp[]>([
    { id: "1", day: 1, hour: 10, name: "Anna", status: "confirmed" },
    { id: "2", day: 3, hour: 14, name: "Linh", status: "pending" },
  ]);

  // 👇 ĐẶT Ở ĐÂY
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // PC drag mượt hơn
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 0,  // mobile giữ lâu hơn chút
        tolerance: 6,
      },
    })
  )
  const [selected, setSelected] = useState(null);
  const [activeBooking, setActiveBooking] = useState<BookingProp | null>(null)

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over) return;

    const [day, hour] = over.id.split("-").map(Number);

    setBookings((prev) =>
      prev.map((b) =>
        b.id === active.id ? { ...b, day, hour } : b
      )
    );
  };
  const handleDragStart = (event: any) => {
    const found: any = bookings.find(b => b.id === event.active.id)
    setActiveBooking(found)
  }

  const getBooking = (day: any, hour: any) =>
    bookings.find((b) => b.day === day && b.hour === hour);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  const updateBooking = (updated: any) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === updated.id ? updated : b))
    );
    setSelected(updated);
  };

  const deleteBooking = (id: any) => {
    setBookings((prev) => prev.filter((b) => b.id !== id));
    setSelected(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">
          Booking Calendar
        </h1>

        <div className="flex gap-2 text-xs">
          <span className="px-2 py-1 rounded bg-green-500 text-white">Confirmed</span>
          <span className="px-2 py-1 rounded bg-yellow-500 text-white">Pending</span>
          <span className="px-2 py-1 rounded bg-red-500 text-white">Cancelled</span>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-md">
        <div className="p-5 overflow-x-auto">
          <DndContext
            sensors={sensors} // 👈 TRUYỀN VÀO ĐÂY
            onDragEnd={handleDragEnd}
            onDragStart={handleDragStart}>
            <div className="grid grid-cols-8 gap-2 min-w-[800px]">
              <div />

              {days.map((d, i) => (
                <div key={i} className="text-center font-medium text-gray-600">
                  {d}
                </div>
              ))}

              {hours.map((hour) => (
                <>
                  <div className="text-sm text-gray-400 flex items-center">
                    {hour}:00
                  </div>

                  {days.map((_, dayIndex) => {
                    const booking = getBooking(dayIndex, hour);

                    return (
                      <DroppableSlot key={`${dayIndex}-${hour}`} day={dayIndex} hour={hour}>
                        {booking && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className={`px-2 py-1 rounded-lg text-white text-xs shadow ${getStatusColor(booking.status)}`}>
                              <DraggableBooking booking={booking} onClick={setSelected} />
                            </div>
                          </div>
                        )}
                      </DroppableSlot>
                    );
                  })}
                </>
              ))}
            </div>

            <DragOverlay>
              {activeBooking ? (
                <div className="bg-green-500 text-white px-2 py-1 rounded-lg shadow">
                  {activeBooking?.name}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>

      <BookingModal
        booking={selected}
        onClose={() => setSelected(null)}
        onSave={updateBooking}
        onDelete={deleteBooking}
      />
    </div>
  );
}

BookingCalendarTailGrids.layout = (page: React.ReactNode) => <Layout children={page} />