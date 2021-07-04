// RxJS v6+
// import { fromEvent, merge, timer } from "rxjs";
// import { fromEvent, merge, timer } from 'https://dev.jspm.io/rxjs@7/_esm2015'
import { fromEvent, merge, timer } from 'https://ga.jspm.io/npm:rxjs@7.1.0/dist/esm5/index.js'

import {
  map,
  mapTo,
  filter,
  pluck,
  switchMap,
  takeWhile,
  withLatestFrom
} from "https://ga.jspm.io/npm:rxjs@7.1.0/dist/esm5/operators/index.js";


const durationInput = document.querySelector("#timer-input");
const startButton = document.querySelector("#start-button");
const resetButton = document.querySelector("#reset-button");
const timeTextElement = document.querySelector("#time-text");

// Capture input events
const durationEvent$ = fromEvent(durationInput, "input").pipe(
  map((e) => Number(e.target.value))
);
const enterEvent$ = fromEvent(durationInput, "keyup").pipe(
  filter((e) => e.key === "Enter")
);
const startEvent$ = fromEvent(startButton, "click");
const resetEvent$ = fromEvent(resetButton, "click").pipe(mapTo(-1));

// Combine confirmation inputs
const timerEvent$ = merge(enterEvent$, startEvent$);

// Start timer from confirmation event
const timerStateWithInput$ = timerEvent$.pipe(
  withLatestFrom(durationEvent$),
  pluck(1), // We're not interested in the timerEvent$ value, only the durationEvent$ one, pick second array value
  filter((duration) => duration !== 0) // Ignore when 0 to keep innter Observable running
);

// Calculate remaining time
const timer$ = merge(timerStateWithInput$, resetEvent$).pipe(
  switchMap((duration) =>
    merge(
      timer(0, 1000).pipe(
        map((r) => duration - r),
        takeWhile((r) => r > 0, true) // Stop inner Observable when time is over
      )
    )
  )
);

timer$.subscribe({
  next: renderToDom
});

function renderToDom(time) {
  if (time === -1) {
    console.log("Reset");
    durationInput.value = "";
    timeTextElement.innerHTML = "Reset, please start again!";
    return;
  }

  const text = time ? `Remaining time ${time} second(s).` : "Time is up!";
  console.log(text);
  timeTextElement.innerHTML = text;
}
