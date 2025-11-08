using System;

namespace SportZone_API.Pages.Facilities
{
    public static class FacilityScheduleHelper
    {
        public static FacilityScheduleStatus Evaluate(TimeOnly? openTime, TimeOnly? closeTime, DateTime? evaluationTimestamp = null)
        {
            var evaluatedAt = evaluationTimestamp ?? DateTime.Now;
            if (!openTime.HasValue || !closeTime.HasValue)
            {
                return new FacilityScheduleStatus(
                    hasSchedule: false,
                    isOpen: false,
                    openTime: openTime,
                    closeTime: closeTime,
                    nextChangeTime: null,
                    nextChangeIsOpening: false,
                    nextChangeIsTomorrow: false,
                    is24Hours: false,
                    spansMidnight: false,
                    evaluationTimestamp: evaluatedAt);
            }

            var open = openTime.Value;
            var close = closeTime.Value;
            var current = TimeOnly.FromDateTime(evaluatedAt);

            if (open == close)
            {
                return new FacilityScheduleStatus(
                    hasSchedule: true,
                    isOpen: true,
                    openTime: open,
                    closeTime: close,
                    nextChangeTime: null,
                    nextChangeIsOpening: false,
                    nextChangeIsTomorrow: false,
                    is24Hours: true,
                    spansMidnight: false,
                    evaluationTimestamp: evaluatedAt);
            }

            var spansMidnight = close < open;
            bool isOpen;
            TimeOnly? nextChangeTime;
            bool nextChangeIsOpening;
            bool nextChangeIsTomorrow;

            if (!spansMidnight)
            {
                if (current >= open && current < close)
                {
                    isOpen = true;
                    nextChangeTime = close;
                    nextChangeIsOpening = false;
                    nextChangeIsTomorrow = false;
                }
                else
                {
                    isOpen = false;
                    nextChangeTime = open;
                    nextChangeIsOpening = true;
                    nextChangeIsTomorrow = current >= close;
                }
            }
            else
            {
                if (current >= open || current < close)
                {
                    isOpen = true;
                    nextChangeTime = close;
                    nextChangeIsOpening = false;
                    nextChangeIsTomorrow = current >= open;
                }
                else
                {
                    isOpen = false;
                    nextChangeTime = open;
                    nextChangeIsOpening = true;
                    nextChangeIsTomorrow = false;
                }
            }

            return new FacilityScheduleStatus(
                hasSchedule: true,
                isOpen: isOpen,
                openTime: open,
                closeTime: close,
                nextChangeTime: nextChangeTime,
                nextChangeIsOpening: nextChangeIsOpening,
                nextChangeIsTomorrow: nextChangeIsTomorrow,
                is24Hours: false,
                spansMidnight: spansMidnight,
                evaluationTimestamp: evaluatedAt);
        }
    }

    public readonly record struct FacilityScheduleStatus(
        bool HasSchedule,
        bool IsOpen,
        TimeOnly? OpenTime,
        TimeOnly? CloseTime,
        TimeOnly? NextChangeTime,
        bool NextChangeIsOpening,
        bool NextChangeIsTomorrow,
        bool Is24Hours,
        bool SpansMidnight,
        DateTime EvaluationTimestamp);
}
