import { addMinutes, format, isBefore, isWithinInterval, parseISO } from 'date-fns';
import type { Appointment } from './schema';

interface TimeSlot {
  startTime: Date;
  endTime: Date;
  available: boolean;
}

/**
 * Generates available 15-minute time slots for a given day, excluding existing appointments and blocks.
 * @param date The date to generate slots for (YYYY-MM-DD).
 * @param appointments The existing appointments for the barber on that day.
 * @param workStartHour The start of the workday (e.g., 9 for 09:00).
 * @param workEndHour The end of the workday (e.g., 18 for 18:00).
 * @param slotDurationMinutes Duration of each slot (default 15).
 */
export function generateAvailableSlots(
  date: string,
  appointments: Appointment[],
  workStartHour: number = 9,
  workEndHour: number = 19,
  slotDurationMinutes: number = 15
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  
  // Create start and end of workday
  const workStartTime = new Date(`${date}T${workStartHour.toString().padStart(2, '0')}:00:00`);
  const workEndTime = new Date(`${date}T${workEndHour.toString().padStart(2, '0')}:00:00`);
  
  let currentSlotStart = workStartTime;

  while (isBefore(currentSlotStart, workEndTime)) {
    const currentSlotEnd = addMinutes(currentSlotStart, slotDurationMinutes);

    // Check if this slot overlaps with any existing appointment (including 'blocked')
    const isOverlapping = appointments.some((appt) => {
      // Ignore cancelled appointments
      if (appt.status === 'cancelled') return false;

      const apptStart = new Date(appt.start_time);
      const apptEnd = new Date(appt.end_time);

      // A slot overlaps if it starts before the appointment ends AND ends after the appointment starts
      return isBefore(currentSlotStart, apptEnd) && isBefore(apptStart, currentSlotEnd);
    });

    slots.push({
      startTime: currentSlotStart,
      endTime: currentSlotEnd,
      available: !isOverlapping,
    });

    currentSlotStart = currentSlotEnd;
  }

  return slots;
}
