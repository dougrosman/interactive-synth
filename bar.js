function Bar(id) {
  // bar constructor

  this.display = function () {
    // function for displaying the bars
    noStroke();
    fill(clr[id]);
    rect(xBar[id], 0, width / numBars, height);
  };

  this.played = function () {
    if (
      rightWrist.x > xBar[id] &&
      rightWrist.x < xBar[id] + width / numBars
    ) {
      polySynth.play(notes[id], 0.5, 0, 0.2);
    }
  };
}
