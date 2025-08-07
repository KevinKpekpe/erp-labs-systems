import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import PageMeta from "../components/common/PageMeta";

export default function Calendar() {
  const [events] = useState([
    {
      id: "1",
      title: "All Day Event",
      start: "2024-01-01",
    },
    {
      id: "2",
      title: "Long Event",
      start: "2024-01-07",
      end: "2024-01-10",
    },
    {
      id: "3",
      title: "Repeating Event",
      start: "2024-01-09T16:00:00",
    },
    {
      id: "4",
      title: "Repeating Event",
      start: "2024-01-16T16:00:00",
    },
    {
      id: "5",
      title: "Conference",
      start: "2024-01-11",
      end: "2024-01-13",
    },
    {
      id: "6",
      title: "Meeting",
      start: "2024-01-12T10:30:00",
      end: "2024-01-12T12:30:00",
    },
    {
      id: "7",
      title: "Lunch",
      start: "2024-01-12T12:00:00",
    },
    {
      id: "8",
      title: "Meeting",
      start: "2024-01-12T14:30:00",
    },
    {
      id: "9",
      title: "Happy Hour",
      start: "2024-01-12T17:30:00",
    },
    {
      id: "10",
      title: "Dinner",
      start: "2024-01-12T20:00:00",
    },
    {
      id: "11",
      title: "Birthday Party",
      start: "2024-01-13T07:00:00",
    },
    {
      id: "12",
      title: "Click for Google",
      url: "http://google.com/",
      start: "2024-01-28",
    },
  ]);

  return (
    <>
      <PageMeta
        title="Calendrier | ClinLab ERP - Gestion de laboratoire"
        description="Calendrier et planification - ClinLab ERP - Solution de gestion complète pour laboratoires médicaux"
      />
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-bold text-black dark:text-white">
            Calendrier
          </h2>
        </div>

        <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
            }}
            initialView="dayGridMonth"
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            events={events}
            select={function (arg) {
              const title = prompt("Event Title:");
              if (title) {
                // calendar.addEvent({
                //   id: createEventId(),
                //   title,
                //   start: arg.start,
                //   end: arg.end,
                //   allDay: arg.allDay,
                // });
              }
              // calendar.unselect();
            }}
            eventClick={function (arg) {
              if (confirm("Are you sure you want to delete this event?")) {
                // arg.event.remove();
              }
            }}
            eventDrop={function (arg) {
              // alert(arg.event.title + " event droped");
            }}
          />
        </div>
      </div>
    </>
  );
}
